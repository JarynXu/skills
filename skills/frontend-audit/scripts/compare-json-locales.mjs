#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

function fail(message, code = 2) {
  console.error(message)
  process.exit(code)
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (error) {
    fail(`Cannot parse ${file}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function flatten(value, prefix = '', output = new Map()) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    output.set(prefix, Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value)
    return output
  }

  for (const [key, child] of Object.entries(value)) {
    flatten(child, prefix ? `${prefix}.${key}` : key, output)
  }
  return output
}

const files = process.argv.slice(2).map((file) => path.resolve(file))
if (files.length < 2) {
  fail('Usage: compare-json-locales.mjs <baseline.json> <candidate.json> [...]')
}

for (const file of files) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) fail(`Locale file not found: ${file}`)
}

const baseline = flatten(readJson(files[0]))
const comparisons = files.slice(1).map((file) => {
  const candidate = flatten(readJson(file))
  const missing = [...baseline.keys()].filter((key) => !candidate.has(key)).sort()
  const extra = [...candidate.keys()].filter((key) => !baseline.has(key)).sort()
  const typeMismatches = [...baseline.entries()]
    .filter(([key, type]) => candidate.has(key) && candidate.get(key) !== type)
    .map(([key, baselineType]) => ({ key, baselineType, candidateType: candidate.get(key) }))
  return {
    file,
    leafCount: candidate.size,
    missing,
    extra,
    typeMismatches,
    matches: missing.length === 0 && extra.length === 0 && typeMismatches.length === 0,
  }
})

const report = {
  baseline: { file: files[0], leafCount: baseline.size },
  comparisons,
}

console.log(JSON.stringify(report, null, 2))
if (comparisons.some((comparison) => !comparison.matches)) process.exit(1)
