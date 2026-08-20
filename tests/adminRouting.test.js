const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const source = fs.readFileSync(path.join(__dirname, '..', 'lib', 'admin-routing.ts'), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText
const routingModule = { exports: {} }
new Function('module', 'exports', compiled)(routingModule, routingModule.exports)

const {
  canAccessMainAdminPanel,
  canAccessMarketingPanel,
  getAdminPanels,
  resolveAuthenticatedLanding,
} = routingModule.exports

const admin = (overrides = {}) => ({
  role: 'admin',
  isFullAdmin: false,
  isSuperAdmin: false,
  isCleaningAdmin: false,
  isMarketingAdmin: false,
  adminPermissions: [],
  ...overrides,
})

test('admin landing resolver handles every approved panel combination', () => {
  assert.equal(resolveAuthenticatedLanding(admin({ isFullAdmin: true })), '/admin')
  assert.equal(resolveAuthenticatedLanding(admin({ isCleaningAdmin: true })), '/cleaning-admin')
  assert.equal(resolveAuthenticatedLanding(admin({
    isMarketingAdmin: true,
    adminPermissions: ['view:marketing'],
  })), '/admin/marketing')
  assert.equal(resolveAuthenticatedLanding(admin({
    isFullAdmin: true,
    isCleaningAdmin: true,
  })), '/admin-select')
  assert.equal(resolveAuthenticatedLanding(admin({
    isCleaningAdmin: true,
    isMarketingAdmin: true,
    adminPermissions: ['view:marketing'],
  })), '/admin-select')
  assert.equal(resolveAuthenticatedLanding(admin()), '/no-admin-access')
  assert.equal(resolveAuthenticatedLanding({ role: 'client' }), '/dashboard')
})

test('support admins retain the main panel without gaining named panels', () => {
  const user = admin({ adminPermissions: ['view:dashboard', 'view:support_cases'] })
  assert.deepEqual(getAdminPanels(user), ['main'])
  assert.equal(canAccessMainAdminPanel(user), true)
  assert.equal(canAccessMarketingPanel(user), false)
})

test('marketing route access requires authority while full admins retain oversight', () => {
  assert.equal(canAccessMarketingPanel(admin({ isFullAdmin: true })), true)
  assert.equal(canAccessMarketingPanel(admin({
    isMarketingAdmin: true,
    adminPermissions: ['view:marketing'],
  })), true)
  assert.equal(canAccessMarketingPanel(admin({ isMarketingAdmin: true })), false)
  assert.equal(canAccessMarketingPanel(admin({ adminPermissions: ['view:marketing'] })), false)
})
