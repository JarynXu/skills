const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { fail, jsonCopy, canonical, withState } = require('./state.cjs');

const UUID = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const RESERVED = new Set(['dispatching', 'active', 'unknown']);
const normalizePath = value => process.platform === 'win32' ? value.toLowerCase() : value;
const contains = (parent, child) => parent === child || child.startsWith(parent.endsWith(path.sep) ? parent : parent + path.sep);
const overlap = (left, right) => contains(left, right) || contains(right, left);
const now = () => new Date().toISOString();
const positive = (value, maximum = 100000) => Number.isSafeInteger(value) && value > 0 && value <= maximum;
const output = (value, save = false) => ({ value, save });

async function createDispatcher(input, { delivery } = {}) {
  const config = await normalizeConfig(input);
  const transaction = operation => withState(config.stateDir, async state => {
    const binding = { workers: config.workers, workspaceRoots: config.workspaceRoots, maxPending: config.maxPending, maxEntries: config.maxEntries, maxEventBytes: config.maxEventBytes, maxStateBytes: config.maxStateBytes };
    if (state.configuration && canonical(state.configuration) !== canonical(binding) && state.entries.some(entry => entry.state !== 'completed')) {
      const sameSchedule = canonical(state.configuration.workers) === canonical(binding.workers) && canonical(state.configuration.workspaceRoots) === canonical(binding.workspaceRoots);
      const raisedBounds = ['maxPending', 'maxEntries', 'maxEventBytes', 'maxStateBytes'].every(key => binding[key] >= state.configuration[key]);
      if (!sameSchedule || !raisedBounds) fail('CONFIG_CONFLICT', 'Retain the same worker/workspace configuration while work remains; retained-state bounds may only increase.');
    }
    state.configuration = binding;
    for (const entry of state.entries) {
      if (RESERVED.has(entry.state) && !config.workers.some(worker => worker.threadId === entry.threadId)) fail('RESERVED_TARGET_REMOVED', 'Retain every reserved target until completion or confirmed absence.');
    }
    const result = await operation(state);
    if (result.save && Buffer.byteLength(JSON.stringify(state, null, 2) + '\n') > config.maxStateBytes) fail('STATE_CAPACITY_EXCEEDED', 'The retained-state byte limit is full; preserve the ledger and keep new ownership upstream.');
    return result;
  });
  const get = (state, id) => {
    if (!/^[a-f0-9]{64}$/.test(id || '')) fail('INVALID_EVENT_ID', 'Use a lowercase SHA-256 event ID.');
    const entry = state.entries.find(value => value.event.eventId === id);
    if (!entry) fail('EVENT_NOT_FOUND', 'Import this event before routing it.');
    return entry;
  };
  const assigned = (state, id, identity) => {
    const entry = get(state, id);
    if (entry.threadId !== identity.threadId?.toLowerCase() || entry.attemptId !== identity.attemptId || !RESERVED.has(entry.state)) fail('NOT_ASSIGNED', 'Use the current reserved target and attempt ID.');
    return entry;
  };

  async function importEvent(value) {
    const event = jsonCopy(value);
    if (event?.version !== 2 || !/^[a-f0-9]{64}$/.test(event.eventId || '') || typeof event.sourceId !== 'string' || !event.sourceId.trim()) fail('INVALID_EVENT', 'The event needs version 2, a lowercase SHA-256 eventId and a nonempty sourceId.');
    if (Buffer.byteLength(JSON.stringify(event)) > config.maxEventBytes) fail('EVENT_TOO_LARGE', 'The event exceeds maxEventBytes; keep ownership upstream.');
    return transaction(state => {
      const prior = state.entries.find(entry => entry.event.eventId === event.eventId);
      if (prior) {
        if (canonical(prior.event) !== canonical(event)) fail('EVENT_CONFLICT', 'The event ID already identifies different content.');
        return output({ imported: true, duplicate: true, eventId: event.eventId, state: prior.state });
      }
      if (state.entries.filter(entry => entry.state !== 'completed').length >= config.maxPending) fail('CAPACITY_EXCEEDED', 'The durable admission limit is full; keep ownership upstream.');
      if (state.entries.length >= config.maxEntries) fail('STATE_CAPACITY_EXCEEDED', 'The retained event limit is full; preserve history rather than evicting deduplication evidence.');
      state.entries.push({ event, ordinal: ++state.sequence, state: 'imported', claims: [], importedAt: now() });
      return output({ imported: true, duplicate: false, eventId: event.eventId, state: 'imported' }, true);
    });
  }

  async function route(eventId, requested) {
    const decision = await normalizeDecision(config, jsonCopy(requested));
    return transaction(state => {
      const entry = get(state, eventId);
      if (entry.decision) {
        if (canonical(entry.decision) !== canonical(decision)) fail('DECISION_CONFLICT', 'This event already has a different immutable routing decision.');
        return output(entry);
      }
      if (entry.state !== 'imported') fail('INVALID_TRANSITION', 'Only an imported event can receive its first route.');
      entry.decision = decision; entry.state = 'waiting'; entry.decidedAt = now();
      return output(entry, true);
    });
  }

  // 预留容量和完整目录范围的事务先于外部投递；外部调用不占用状态锁。
  async function reserve(excluded) {
    return transaction(async state => {
      for (const entry of state.entries) {
        if (entry.state !== 'waiting' || excluded.has(entry.event.eventId)) continue;
        await recheckRoots(config, entry.decision.workspaces);
        const candidates = config.workers.filter(worker => entry.decision.threadId ? worker.threadId === entry.decision.threadId : worker.projectId === entry.decision.projectId);
        const worker = candidates.find(candidate => state.entries.filter(item => RESERVED.has(item.state) && item.threadId === candidate.threadId).length < candidate.capacity);
        if (!worker) continue;
        if (state.entries.some(item => item !== entry && item.claims.some(held => entry.decision.workspaces.some(root => overlap(held, root))))) continue;
        entry.state = 'dispatching'; entry.threadId = worker.threadId; entry.attemptId = randomUUID();
        entry.claims = [...entry.decision.workspaces]; entry.startedAt = now();
        return output(entry, true);
      }
      return output(null);
    });
  }

  async function drain({ limit = 20 } = {}) {
    if (!positive(limit, 100)) fail('INVALID_LIMIT', 'A drain limit must be 1..100.');
    if (!delivery || typeof delivery.send !== 'function') fail('DELIVERY_REQUIRED', 'Compose a delivery port before draining.');
    const results = [], attempted = new Set();
    while (results.length < limit) {
      const entry = await reserve(attempted);
      if (!entry) break;
      attempted.add(entry.event.eventId);
      let result;
      try {
        result = jsonCopy(await delivery.send({ event: jsonCopy(entry.event), eventId: entry.event.eventId, threadId: entry.threadId, attemptId: entry.attemptId, prompt: entry.decision.prompt, stateDir: config.stateDir }));
        if (!['accepted', 'not_sent', 'unknown'].includes(result?.outcome) || (result.outcome !== 'unknown' && !validEvidence(result.evidence))) fail('INVALID_DELIVERY_RESULT', 'Delivery needs accepted/not_sent evidence or an unknown outcome.');
      } catch (error) { result = { outcome: 'unknown', error: { code: error.code || 'DELIVERY_UNKNOWN', message: String(error.message || error) } }; }
      results.push(await transaction(state => {
        const current = get(state, entry.event.eventId);
        if (current.attemptId !== entry.attemptId) fail('ATTEMPT_CONFLICT', 'The current delivery attempt has changed.');
        if (current.state === 'completed' || current.reconciliation) return output(current);
        current.delivery = result; current.state = result.outcome === 'accepted' ? 'active' : result.outcome === 'not_sent' ? 'not_sent' : 'unknown';
        if (current.state === 'not_sent') current.claims = [];
        current.updatedAt = now();
        return output(current, true);
      }));
    }
    return { attempted: results.length, results };
  }

  async function reconcile(eventId, { attemptId, outcome, evidence }) {
    if (!['accepted', 'not_sent'].includes(outcome) || !validEvidence(evidence)) fail('INVALID_RECONCILIATION', 'Use accepted/not_sent with independently checked evidence.');
    if (outcome === 'not_sent' && (evidence.operationTerminated !== true || !validEvidence(evidence.absenceProof))) fail('ABSENCE_EVIDENCE_REQUIRED', 'Confirmed absence requires operationTerminated:true and a nonempty absenceProof object from authoritative inspection.');
    const record = jsonCopy({ attemptId, outcome, evidence });
    return transaction(state => {
      const entry = get(state, eventId);
      if (entry.attemptId !== attemptId || !['unknown', 'dispatching'].includes(entry.state)) fail('INVALID_TRANSITION', 'Reconcile only the matching uncertain attempt.');
      entry.reconciliation = record; entry.state = outcome === 'accepted' ? 'active' : 'not_sent';
      if (outcome === 'not_sent') entry.claims = [];
      entry.updatedAt = now();
      return output(entry, true);
    });
  }

  async function retry(eventId) {
    return transaction(state => {
      const entry = get(state, eventId);
      if (entry.state !== 'not_sent') fail('RETRY_UNSAFE', 'Only confirmed not_sent work can be returned to waiting.');
      entry.history ??= [];
      entry.history.push({ attemptId: entry.attemptId, threadId: entry.threadId, delivery: entry.delivery || null, reconciliation: entry.reconciliation || null });
      for (const field of ['attemptId', 'threadId', 'delivery', 'reconciliation']) delete entry[field];
      entry.state = 'waiting'; return output(entry, true);
    });
  }

  async function complete(eventId, identity, { drainLimit = 20 } = {}) {
    if (!positive(drainLimit, 100) && drainLimit !== 0) fail('INVALID_LIMIT', 'A completion drain limit must be 0..100.');
    if (!validEvidence(identity.evidence)) fail('COMPLETION_EVIDENCE_REQUIRED', 'Completion needs a nonempty evidence object.');
    const completion = jsonCopy({ threadId: identity.threadId?.toLowerCase(), attemptId: identity.attemptId, evidence: identity.evidence });
    const result = await transaction(state => {
      const prior = get(state, eventId);
      if (prior.state === 'completed') {
        if (canonical(prior.completion) !== canonical(completion)) fail('COMPLETION_CONFLICT', 'The recorded completion has different identity or evidence.');
        return output(prior);
      }
      const entry = assigned(state, eventId, completion);
      entry.completion = completion; entry.state = 'completed'; entry.claims = []; entry.completedAt = now();
      return output(entry, true);
    });
    if (!drainLimit) return { completion: result, drain: null };
    try { return { completion: result, drain: await drain({ limit: drainLimit }) }; }
    catch (error) { return { completion: result, drain: { error: { code: error.code || 'DRAIN_FAILED', message: error.message } } }; }
  }

  async function claimWorkspaces(eventId, identity, requestedRoots) {
    const roots = await checkedRoots(config, requestedRoots);
    if (!roots.length) fail('INVALID_WORKSPACE', 'A workspace claim needs at least one root.');
    return transaction(async state => {
      const entry = assigned(state, eventId, identity);
      const all = [...new Set([...entry.claims, ...roots])].sort();
      await recheckRoots(config, all);
      if (state.entries.some(item => item !== entry && item.claims.some(held => all.some(root => overlap(held, root))))) fail('WORKSPACE_BUSY', 'No additional roots were acquired. Declare the full scope before dispatch or use an isolated authorized workspace.');
      entry.claims = all; return output({ eventId, state: 'claimed', roots: all }, true);
    });
  }

  async function releaseWorkspaces(eventId, identity) {
    return transaction(state => {
      const entry = assigned(state, eventId, identity);
      entry.claims = []; return output({ eventId, state: 'released' }, true);
    });
  }

  async function status(eventId) {
    return transaction(state => eventId ? output(get(state, eventId)) : output({
      entries: state.entries,
      workers: config.workers.map(worker => ({ ...worker, reserved: state.entries.filter(entry => RESERVED.has(entry.state) && entry.threadId === worker.threadId).map(entry => entry.event.eventId) }))
    }));
  }
  return { importEvent, route, drain, complete, reconcile, retry, claimWorkspaces, releaseWorkspaces, status };
}

async function normalizeConfig(input) {
  const config = jsonCopy(input);
  if (!config || !path.isAbsolute(config.stateDir || '') || !Array.isArray(config.workers) || !config.workers.length) fail('INVALID_CONFIG', 'Use an absolute stateDir and a nonempty trusted workers list.');
  config.stateDir = await stateDirectory(config.stateDir);
  if (config.policyFile !== undefined && !path.isAbsolute(config.policyFile)) fail('INVALID_CONFIG', 'policyFile must be absolute.');
  if (config.policyFile) await fs.access(config.policyFile);
  config.maxPending ??= 1000;
  if (!positive(config.maxPending)) fail('INVALID_CONFIG', 'maxPending must be 1..100000.');
  config.maxEntries ??= 10000; config.maxEventBytes ??= 1024 * 1024; config.maxStateBytes ??= 32 * 1024 * 1024;
  if (!positive(config.maxEntries) || !positive(config.maxEventBytes, 32 * 1024 * 1024) || !positive(config.maxStateBytes, 1024 * 1024 * 1024)) fail('INVALID_CONFIG', 'Retained event/byte limits must be positive integers within documented bounds.');
  const ids = new Set();
  for (const worker of config.workers) {
    if (!UUID.test(worker?.threadId || '') || !(worker.projectId === null || UUID.test(worker.projectId || '')) || !positive(worker.capacity ?? 1, 100)) fail('INVALID_CONFIG', 'Workers need observed threadId/projectId UUIDs (or null projectId) and capacity 1..100.');
    worker.threadId = worker.threadId.toLowerCase();
    if (worker.projectId !== null) worker.projectId = worker.projectId.toLowerCase();
    worker.capacity ??= 1;
    if (ids.has(worker.threadId)) fail('INVALID_CONFIG', 'Worker thread IDs must be unique.');
    ids.add(worker.threadId);
  }
  config.workspaceRoots ??= [];
  if (!Array.isArray(config.workspaceRoots)) fail('INVALID_CONFIG', 'workspaceRoots must be an array.');
  config.workspaceRoots = await Promise.all(config.workspaceRoots.map(canonicalWorkspace));
  return config;
}
async function normalizeDecision(config, request) {
  if (!request || typeof request.prompt !== 'string' || !request.prompt.trim() || request.prompt.length > 100000) fail('INVALID_ROUTE', 'A route needs 1..100000 prompt characters.');
  if (Number(Object.hasOwn(request, 'threadId')) + Number(Object.hasOwn(request, 'projectId')) !== 1) fail('INVALID_ROUTE', 'Choose exactly one threadId or projectId (null means projectless).');
  let selection;
  if (Object.hasOwn(request, 'threadId')) {
    const threadId = typeof request.threadId === 'string' ? request.threadId.toLowerCase() : undefined;
    if (!config.workers.some(worker => worker.threadId === threadId)) fail('UNTRUSTED_TARGET', 'The target is absent from trusted worker configuration.');
    selection = { threadId };
  } else {
    const projectId = request.projectId === null ? null : typeof request.projectId === 'string' ? request.projectId.toLowerCase() : undefined;
    if (!config.workers.some(worker => worker.projectId === projectId)) fail('UNKNOWN_POOL', 'The project pool is not configured.');
    selection = { projectId };
  }
  return { ...selection, prompt: request.prompt, workspaces: await checkedRoots(config, request.workspaces ?? []) };
}
async function canonicalWorkspace(root) {
  if (typeof root !== 'string' || !path.isAbsolute(root)) fail('INVALID_WORKSPACE', 'Workspace roots must be absolute existing directories.');
  const actual = await fs.realpath(root);
  if (!(await fs.stat(actual)).isDirectory() || path.parse(actual).root === actual) fail('INVALID_WORKSPACE', 'Use an existing non-root directory.');
  return normalizePath(actual);
}
async function checkedRoots(config, requested) {
  if (!Array.isArray(requested)) fail('INVALID_WORKSPACE', 'Workspaces must be an array.');
  const roots = [...new Set(await Promise.all(requested.map(canonicalWorkspace)))].sort();
  if (roots.some(root => !config.workspaceRoots.some(parent => contains(parent, root)))) fail('WORKSPACE_OUT_OF_SCOPE', 'A requested workspace is outside configured roots.');
  return roots;
}
async function recheckRoots(config, roots) {
  const actual = await checkedRoots(config, roots);
  if (canonical(actual) !== canonical(roots)) fail('WORKSPACE_PATH_CHANGED', 'A planned workspace changed its real path.');
}
function validEvidence(value) { return value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0; }
async function stateDirectory(requested) {
  let existing = path.resolve(requested), suffix = [];
  if (path.parse(existing).root === existing) fail('INVALID_CONFIG', 'A filesystem root cannot hold dispatcher state.');
  while (true) {
    try { await fs.lstat(existing); break; }
    catch (error) { if (error.code !== 'ENOENT') throw error; suffix.unshift(path.basename(existing)); existing = path.dirname(existing); }
  }
  const resolved = path.join(await fs.realpath(existing), ...suffix);
  for (let current = resolved; ; current = path.dirname(current)) {
    for (const marker of ['SKILL.md', '.git']) {
      try { await fs.access(path.join(current, marker)); fail('INVALID_CONFIG', 'Keep durable state outside skill packages and Git working trees.'); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    if (path.dirname(current) === current) break;
  }
  await fs.mkdir(resolved, { recursive: true });
  return fs.realpath(resolved);
}
module.exports = { createDispatcher };
