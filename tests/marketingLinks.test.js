const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const source = fs.readFileSync(path.join(__dirname, '..', 'lib', 'marketing-links.ts'), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText
const linksModule = { exports: {} }
new Function('module', 'exports', compiled)(linksModule, linksModule.exports)
const { buildMarketingRegistrationUrl } = linksModule.exports

test('client offer links preserve campaign, exact code, QR method and UTMs', () => {
  const result = buildMarketingRegistrationUrl({
    origin: 'https://www.fixesau.com', target: 'client_web', campaignIdentifier: 'coffee-shop',
    code: ' qa20 ', via: 'qr', utm: { source: 'coffee.shop', medium: 'poster', campaign: 'coffee-shop' },
  })
  assert.equal(result, 'https://www.fixesau.com/register?campaign=coffee-shop&code=QA20&via=qr&utm_source=coffee.shop&utm_medium=poster&utm_campaign=coffee-shop')
})

test('campaign-only links do not imply a discount code', () => {
  const result = new URL(buildMarketingRegistrationUrl({
    origin: 'https://www.fixesau.com', target: 'fixer_web', campaignIdentifier: 'fixer-poster',
  }))
  assert.equal(result.pathname, '/register/tradie')
  assert.equal(result.searchParams.get('campaign'), 'fixer-poster')
  assert.equal(result.searchParams.has('code'), false)
})

test('mobile destinations use the existing application schemes', () => {
  assert.equal(buildMarketingRegistrationUrl({
    origin: 'https://www.fixesau.com', target: 'fixes_mobile', campaignIdentifier: 'mobile', code: 'MOBILE20',
  }), 'fixes://register?campaign=mobile&code=MOBILE20')
  assert.equal(buildMarketingRegistrationUrl({
    origin: 'https://www.fixesau.com', target: 'fixer_mobile', campaignIdentifier: 'mobile',
  }), 'fixer://register?campaign=mobile')
})
