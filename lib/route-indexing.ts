const NOINDEX_ROUTES = new Set([
  '/admin-select',
  '/delete-account/fixer',
  '/forgot-password',
  '/login',
  '/register',
  '/register/cleaner',
])

const NOINDEX_PREFIXES = [
  '/admin',
  '/cleaning-admin',
  '/dashboard',
  '/reset-password/',
  '/stripe-connect',
  '/track/',
  '/verify-email/',
]

export function shouldNoIndex(pathname: string) {
  const normalizedPathname = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')

  if (normalizedPathname === '/agency/register') return false
  if (normalizedPathname === '/agency' || normalizedPathname.startsWith('/agency/')) return true
  if (NOINDEX_ROUTES.has(normalizedPathname)) return true

  return NOINDEX_PREFIXES.some((prefix) => (
    prefix.endsWith('/')
      ? normalizedPathname.startsWith(prefix)
      : normalizedPathname === prefix || normalizedPathname.startsWith(`${prefix}/`)
  ))
}
