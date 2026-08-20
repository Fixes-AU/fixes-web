import type { User } from './types'

export type AdminPanel = 'main' | 'cleaning' | 'marketing'

const hasPermission = (user: User, permission: string) => (
  user.isSuperAdmin === true ||
  user.isFullAdmin !== false ||
  (user.adminPermissions || []).includes(permission)
)

export const getAdminPanels = (user: User | null | undefined): AdminPanel[] => {
  if (!user || user.role !== 'admin') return []

  const panels: AdminPanel[] = []
  const hasNamedLimitedPanel = user.isCleaningAdmin === true || user.isMarketingAdmin === true
  const hasLimitedMainPermissions = (user.adminPermissions || []).some(
    (permission) => !['view:marketing', 'action:manage_marketing', 'action:export_marketing'].includes(permission)
  )

  if (
    user.isSuperAdmin === true ||
    user.isFullAdmin !== false ||
    (!hasNamedLimitedPanel && hasLimitedMainPermissions)
  ) {
    panels.push('main')
  }
  if (user.isCleaningAdmin === true) panels.push('cleaning')
  if (user.isMarketingAdmin === true && hasPermission(user, 'view:marketing')) panels.push('marketing')

  return panels
}

export const canAccessMarketingPanel = (user: User | null | undefined) => Boolean(
  user && user.role === 'admin' && hasPermission(user, 'view:marketing') && (
    user.isSuperAdmin === true || user.isFullAdmin !== false || user.isMarketingAdmin === true
  )
)

export const resolveAuthenticatedLanding = (user: User): string => {
  if (user.role !== 'admin') return '/dashboard'
  const panels = getAdminPanels(user)
  if (panels.length > 1) return '/admin-select'
  if (panels[0] === 'cleaning') return '/cleaning-admin'
  if (panels[0] === 'marketing') return '/admin/marketing'
  if (panels[0] === 'main') return '/admin'
  return '/no-admin-access'
}

export const canAccessMainAdminPanel = (user: User | null | undefined) => (
  user ? getAdminPanels(user).includes('main') : false
)

export const canAccessCleaningAdminPanel = (user: User | null | undefined) => Boolean(
  user?.role === 'admin' && (
    user.isSuperAdmin === true || user.isFullAdmin !== false || user.isCleaningAdmin === true
  )
)
