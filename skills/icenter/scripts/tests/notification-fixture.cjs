const assert = require('node:assert/strict');
const vm = require('node:vm');
const { NotificationSession } = require('../notifications.cjs');
const { listenerPageOperation } = require('../listener-page.cjs');
const { clientVersion } = require('../client-version.json');
const accountId = 'sip:owner@example.test';
const chatId = 'sip:sender@example.test';
const scope = { ownerId: 'source-test-owner', generationId: 'source-generation', accountId,
  sources: [{ chatId, senderIds: [chatId] }] };
function raw(id, overrides = {}) {
  return { msgId: id, chatRoomUri: chatId, data_owner: accountId, sendUri: chatId,
    chatRoomType: 0, atInfo: '#', atExInfo: '#', msgType: 1, content: 'fixture message', ...overrides };
}
function renderer({ version = clientVersion, lastId = 'baseline', now } = {}) {
  const listeners = new Map();
  const state = { userInfo: { userId: accountId, unionId: 'UN-OWNER' }, chatInfo: { chatSelectUri: 'sip:unrelated@example.test', chatList: [{ chatRoomUri: chatId, chatRoomType: 0, lastMessageBriefInfo: lastId ? { msgId: lastId } : null }] } };
  const notifications = {
    addMessageBaseMattersNotifyListener(name, policy, callback) { assert.equal(policy, 1); listeners.set(name, callback); },
    removeMessageBaseMattersNotifyListener(name) { listeners.delete(name); },
  };
  const loader = { c: { ce65: { exports: { b: notifications } }, bcec: { exports: { u: { PERMANENT: 1 } } }, '14ce': { exports: { I: { SendMessageResult: 0, MessageArrivedNotify: 2, MultiMessageArrivedNotify: 8, ApplicationMessageArrivedNotify: 16 } } } }, m: {}, s: 0 };
  const chunks = [];
  chunks.push = entry => {
    Array.prototype.push.call(chunks, entry);
    for (const [id, factory] of Object.entries(entry[1])) { loader.m[id] = factory; loader.c[id] = {}; factory({}, {}, loader); }
  };
  const ClientDate = now ? class extends Date {
    constructor(...args) { super(...(args.length ? args : [now()])); }
    static now() { return now(); }
  } : Date;
  const context = vm.createContext({ window: { webpackJsonp: chunks }, document: { querySelector(selector) {
    assert.equal(selector, '#app'); return { __vue_app__: { config: { globalProperties: { $store: { state } } } } };
  } }, process: { argv: ['IS_MAIN_WINDOW'], resourcesPath: '/fixture' }, require: file => {
    assert.ok(file.endsWith('/app.asar/package.json')); return { version };
  }, TextEncoder, Date: ClientDate });
  vm.runInContext('globalThis.listenerPageOperation = ' + listenerPageOperation.toString(), context);
  const call = (operation, input = scope) => {
    context.operation = operation; context.input = input;
    return JSON.parse(JSON.stringify(vm.runInContext('listenerPageOperation(operation, input)', context)));
  };
  return { call, state, window: context.window, listeners, chunks, loader, emit: notice => { for (const callback of [...listeners.values()]) callback(notice); } };
}

function sessionFor(app, options) {
  return new NotificationSession({ evaluate: async (_fn, operation, input) => app.call(operation, input), close: () => { app.closed = (app.closed || 0) + 1; } }, options);
}
module.exports = { renderer, sessionFor, accountId, chatId, scope, raw };
