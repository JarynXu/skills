const { createHash } = require('node:crypto');
const GUARD = '\u2063\u2063';
const ZERO = '\u200b', ONE = '\u2060';
const MAGIC = Buffer.from([0x41, 0x49, 0x4d, 1]);
const fingerprint = text => createHash('sha256').update(text, 'utf8').digest().subarray(0, 4);

// 这是样本排除标记；校验用于识别损坏，不构成签名或作者身份认证。
function inspectOrigin(text) {
  if (typeof text !== 'string') throw new TypeError('Expected message text.');
  const match = /\u2063\u2063([\u200b\u2060]+)\u2063\u2063$/u.exec(text);
  if (!match) return { kind: 'unknown', marker: text.includes(GUARD) ? 'damaged' : 'absent', sampleEligible: false, body: text };
  const symbols = match[1], body = text.slice(0, match.index);
  if (symbols.length !== 64 || !body.trim()) return { kind: 'unknown', marker: 'damaged', sampleEligible: false, body: text };
  const bytes = Buffer.alloc(8);
  for (let i = 0; i < 64; i++) bytes[i >> 3] |= (symbols[i] === ONE ? 1 : 0) << (7 - (i & 7));
  if (!bytes.subarray(0, 3).equals(MAGIC.subarray(0, 3))) return { kind: 'unknown', marker: 'damaged', sampleEligible: false, body: text };
  if (bytes[3] !== MAGIC[3]) return { kind: 'unknown', marker: 'unsupported', sampleEligible: false, body: text };
  if (!bytes.subarray(4).equals(fingerprint(body))) return { kind: 'unknown', marker: 'damaged', sampleEligible: false, body: text };
  return { kind: 'automation-marked', marker: 'aim-v1', sampleEligible: false, body };
}

function markAutomation(text) {
  if (typeof text !== 'string' || !text.trim()) throw new TypeError('Expected nonempty message text.');
  const existing = inspectOrigin(text);
  if (existing.kind === 'automation-marked') return text;
  if (existing.marker !== 'absent') throw Object.assign(new Error('Resolve the existing damaged or unsupported marker before adding another.'), { code: 'ORIGIN_MARKER_CONFLICT' });
  const bytes = Buffer.concat([MAGIC, fingerprint(text)]);
  const symbols = [...bytes].map(byte => byte.toString(2).padStart(8, '0').replaceAll('0', ZERO).replaceAll('1', ONE)).join('');
  return text + GUARD + symbols + GUARD;
}

// 证据正文保留原样；展示或取样使用者读取独立的来源字段。
function withMessageOrigin(message) {
  if (typeof message?.text !== 'string') return message;
  const { body: _body, ...origin } = inspectOrigin(message.text);
  return { ...message, origin };
}

module.exports = { inspectOrigin, markAutomation, withMessageOrigin };
