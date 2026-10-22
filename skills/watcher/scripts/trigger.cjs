#!/usr/bin/env node
const { main } = require('./cli.cjs');
const { errorInfo } = require('./errors.cjs');
if (require.main === module) main(process.argv.slice(2)).catch(error => { process.stdout.write(JSON.stringify({ ok: false, error: errorInfo(error) }) + '\n'); process.exitCode = 1; });
module.exports = { main };
