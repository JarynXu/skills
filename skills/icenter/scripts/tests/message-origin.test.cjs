const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { inspectOrigin, markAutomation } = require('../message-origin.cjs');
test('标记可识别并还原原文，重复标记保持同一文本', () => {
  const original = '你好\nHere is the answer 😊', marked = markAutomation(original), result = inspectOrigin(marked);
  assert.equal(result.kind, 'automation-marked'); assert.equal(result.body, original); assert.equal(result.sampleEligible, false);
  assert.equal(markAutomation(marked), marked); assert.equal(marked.length - original.length, 68);
});
test('无标记不证明本人原创', () => {
  const result = inspectOrigin('An unmarked message'); assert.equal(result.kind, 'unknown'); assert.equal(result.sampleEligible, false);
});
test('正文变动、截断和未知版本保留未知，不抹掉原始文本', () => {
  const marked = markAutomation('Original text');
  for (const value of [marked.replace('Original', 'Edited'), marked.slice(0, -2), marked.slice(0, -8) + marked.slice(-2)]) {
    const result = inspectOrigin(value); assert.equal(result.kind, 'unknown'); assert.equal(result.body, value); assert.equal(result.sampleEligible, false);
  }
  const at = 'Original text'.length + 2 + 31;
  const future = marked.slice(0, at) + '\u200b' + marked.slice(at + 1);
  assert.equal(inspectOrigin(future).marker, 'unsupported');
});
test('冲突和空正文不发送新标记', () => {
  assert.throws(() => markAutomation(' '), TypeError);
  assert.throws(() => markAutomation('text\u2063\u2063broken'), { code: 'ORIGIN_MARKER_CONFLICT' });
});
test('JSON 序列化保留标记，代码复制影响有实证', () => {
  const marked = markAutomation('const value = 1;'); assert.equal(inspectOrigin(JSON.parse(JSON.stringify(marked))).kind, 'automation-marked');
  assert.throws(() => new vm.Script(marked), SyntaxError);
});
