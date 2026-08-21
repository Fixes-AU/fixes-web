const assert = require('node:assert/strict')
const test = require('node:test')
const ts = require('typescript')
const fs = require('node:fs')
const path = require('node:path')

const sourcePath = path.join(__dirname, '..', 'lib', 'marketing-attribution.ts')
const source = fs.readFileSync(sourcePath, 'utf8')
  .replace("import { api } from '@/lib/api'", 'const api = {}')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
const moduleUnderTest = { exports: {} }
new Function('module', 'exports', 'require', compiled)(
  moduleUnderTest,
  moduleUnderTest.exports,
  require,
)

const { marketingEntryFromSearch } = moduleUnderTest.exports

test('QR entry preserves the explicit code and QR attribution method', () => {
  assert.deepEqual(marketingEntryFromSearch(
    '?campaign=coffee-shop&code=qa20-20260820&via=qr',
  ), {
    campaignIdentifier: 'coffee-shop',
    manualCode: 'QA20-20260820',
    method: 'qr',
  })
})

test('URL entry normalizes its code without calling it manual entry', () => {
  assert.deepEqual(marketingEntryFromSearch('?code= welcome_20! '), {
    campaignIdentifier: undefined,
    manualCode: 'WELCOME_20',
    method: 'url',
  })
})

test('campaign-only link does not invent or select a code', () => {
  assert.deepEqual(marketingEntryFromSearch('?campaign=coffee-shop'), {
    campaignIdentifier: 'coffee-shop',
    manualCode: undefined,
    method: 'url',
  })
})

test('unrelated registration query returns no marketing entry', () => {
  assert.equal(marketingEntryFromSearch('?plan=business'), null)
})
