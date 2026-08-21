const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const source = fs.readFileSync(path.join(__dirname, '..', 'lib', 'fragmentState.ts'), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText
const fragmentModule = { exports: {} }
new Function('module', 'exports', compiled)(fragmentModule, fragmentModule.exports)

const { createFragmentHref, createFragmentRedirectHref, parseFragmentState } = fragmentModule.exports

test('fragment href creation and parsing remain symmetrical', () => {
  const href = createFragmentHref('/register', { plan: 'business', empty: null })
  assert.equal(href, '/register#plan=business')
  assert.equal(parseFragmentState('#plan=business').get('plan'), 'business')
})

test('register marketing parameters are not redirected when no fragment key exists', () => {
  const result = createFragmentRedirectHref(
    '/register',
    '?campaign=coffee-shop&code=COFFEE20&via=qr&utm_source=poster',
    ['plan'],
  )
  assert.equal(result, null)
})

test('legacy plan moves to the fragment without deleting marketing parameters', () => {
  const result = createFragmentRedirectHref(
    '/register',
    '?plan=business&campaign=coffee-shop&code=COFFEE20&via=qr&utm_source=poster',
    ['plan'],
  )
  assert.equal(
    result,
    '/register?campaign=coffee-shop&code=COFFEE20&via=qr&utm_source=poster#plan=business',
  )
})

test('post-job fragment migration preserves unrelated query parameters', () => {
  const result = createFragmentRedirectHref(
    '/post-job',
    '?category=plumbing&q=blocked+drain&utm_campaign=winter',
    ['category', 'q', 'jobId'],
  )
  assert.equal(
    result,
    '/post-job?utm_campaign=winter#category=plumbing&q=blocked+drain',
  )
})
