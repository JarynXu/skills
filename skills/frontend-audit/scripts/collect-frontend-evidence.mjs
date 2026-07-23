#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const SOURCE_EXTENSIONS = new Set(['.html', '.js', '.jsx', '.mjs', '.ts', '.tsx', '.vue', '.svelte'])
const IGNORED_DIRECTORIES = new Set([
  '.git',
  '.next',
  '.nuxt',
  '.output',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'out',
  'target',
  'vendor',
])

const SIGNALS = [
  { key: 'nativeInteractiveElement', pattern: /<(button|input|select|textarea|dialog|table)\b/g },
  {
    key: 'nativeBrowserDialog',
    pattern: /\b(?:window|globalThis)\s*\.\s*(?:alert|confirm|prompt)\s*\(/g,
  },
  { key: 'inlineStyle', pattern: /\bstyle\s*=\s*(?:\{\{|"|')|\b:style\s*=/g },
  { key: 'handBuiltOverlay', pattern: /\bfixed\b[^\n"']*\binset-0\b|\binset-0\b[^\n"']*\bfixed\b/g },
  { key: 'workMarker', pattern: /\b(?:TODO|FIXME|HACK)\b/g },
]

function fail(message) {
  console.error(message)
  process.exit(2)
}

function isDirectory(value) {
  try {
    return fs.statSync(value).isDirectory()
  } catch {
    return false
  }
}

function walk(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name)) continue
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) walk(fullPath, files)
    else if (SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) files.push(fullPath)
  }
  return files
}

function readJson(file) {
  if (!fs.existsSync(file)) return null
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (error) {
    fail(`Cannot parse ${file}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

function lineNumberAt(text, offset) {
  let line = 1
  for (let index = 0; index < offset; index += 1) {
    if (text.charCodeAt(index) === 10) line += 1
  }
  return line
}

function isPrimitiveModule(relativePath) {
  const normalized = `/${relativePath.replaceAll('\\', '/').toLowerCase()}/`
  return [
    '/components/ui/',
    '/design-system/',
    '/primitives/',
    '/ui/primitives/',
  ].some((segment) => normalized.includes(segment))
}

function findSignals(root, file) {
  const relativePath = path.relative(root, file).replaceAll('\\', '/')
  const text = fs.readFileSync(file, 'utf8')
  const primitiveModule = isPrimitiveModule(relativePath)
  const findings = []

  for (const signal of SIGNALS) {
    if (primitiveModule && ['nativeInteractiveElement', 'handBuiltOverlay'].includes(signal.key)) continue
    signal.pattern.lastIndex = 0
    for (const match of text.matchAll(signal.pattern)) {
      findings.push({
        signal: signal.key,
        file: relativePath,
        line: lineNumberAt(text, match.index ?? 0),
        sample: match[0].replaceAll(/\s+/g, ' ').slice(0, 120),
      })
    }
  }
  return findings
}

const requestedRoot = process.argv[2] ?? '.'
const root = path.resolve(requestedRoot)
if (!isDirectory(root)) fail(`Project root is not a directory: ${root}`)

const packageJson = readJson(path.join(root, 'package.json'))
const files = walk(root)
const signals = files.flatMap((file) => findSignals(root, file))
const counts = Object.fromEntries(
  [...new Set(SIGNALS.map((signal) => signal.key))].map((key) => [
    key,
    signals.filter((item) => item.signal === key).length,
  ]),
)

const routeCandidates = files
  .map((file) => path.relative(root, file).replaceAll('\\', '/'))
  .filter((file) => /(^|\/)(app|pages|routes?|router)(\/|\.|$)/i.test(file))

const report = {
  root,
  package: packageJson
    ? {
        name: packageJson.name ?? null,
        scripts: Object.keys(packageJson.scripts ?? {}).sort(),
        dependencies: Object.keys(packageJson.dependencies ?? {}).sort(),
        devDependencies: Object.keys(packageJson.devDependencies ?? {}).sort(),
      }
    : null,
  sourceFileCount: files.length,
  routeCandidates,
  signalCounts: counts,
  signals,
  note: 'Signals are inspection leads, not findings. Confirm project conventions and user impact before assigning severity.',
}

console.log(JSON.stringify(report, null, 2))
