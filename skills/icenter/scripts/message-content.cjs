const imageType = require('./sdk-contracts.json').enums['14ce.R'].values.Image;

// 消息列表只描述附件，实际读取及识图各有独立完成状态。
function withMessageContent(message) {
  return message.clientType === imageType ? { ...message, attachments: [{ kind: 'image', state: 'not-read' }] } : message;
}

module.exports = { withMessageContent };
