const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { ClientError } = require('./cdp.cjs');

function prepareConnection(action, values = {}) {
  if (process.platform !== 'win32') throw new ClientError('UNSUPPORTED_PLATFORM', 'Connection preparation requires Windows PowerShell; use an explicit CDP port on other hosts.');
  const args = ['-NoProfile', '-NonInteractive', '-File', path.join(__dirname, 'connection.ps1'), '-Action', action];
  if (values.executable) args.push('-ExecutablePath', values.executable);
  if (values['instance-pid']) args.push('-InstancePid', String(values['instance-pid']));
  if (values.restart) args.push('-Restart');
  let raw;
  try { raw = execFileSync('powershell.exe', args, { encoding: 'utf8', timeout: action === 'probe' ? 15000 : 50000, windowsHide: true }); }
  catch (error) {
    if (!error.stdout) throw new ClientError('CONNECTION_SETUP', 'Connection preparation did not finish.', { cause: error.message });
    raw = error.stdout;
  }
  const result = JSON.parse(raw.replace(/^\uFEFF/, ''));
  if (result.error) throw new ClientError(result.error.code, result.error.message, result.error.details);
  return result;
}

module.exports = { prepareConnection };
