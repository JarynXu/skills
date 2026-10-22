#!/usr/bin/env node
// 旧组合命令保留可诊断失败；本技能不装载外部工作流，也不猜测实例位置。
process.stdout.write(JSON.stringify({ ok: false, error: {
  code: 'COMPOSITION_MOVED',
  message: 'The automation entry is outside the iCenter skill. Use the composition entry recorded in your trusted instance policy. Native notifications are available through scripts/notifications.cjs.'
} }) + '\n');
process.exitCode = 1;
