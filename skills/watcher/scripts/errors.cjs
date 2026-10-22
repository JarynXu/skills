class RuntimeError extends Error {
  constructor(code, message, details) { super(message); this.name = 'RuntimeError'; this.code = code; if (details !== undefined) this.details = details; }
}
const errorInfo = error => ({ code: error?.code || 'EVENT_RUNTIME_FAILED', message: error?.message || String(error), ...(error?.details !== undefined ? { details: error.details } : {}) });
module.exports = { RuntimeError, errorInfo };
