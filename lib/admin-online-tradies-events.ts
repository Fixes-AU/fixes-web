export const ADMIN_ONLINE_TRADIES_COUNT_EVENT = 'admin:online-tradies-count-changed'

export function publishAdminOnlineTradiesCount(online: number) {
  if (typeof window === 'undefined' || !Number.isFinite(online)) return

  window.dispatchEvent(
    new CustomEvent(ADMIN_ONLINE_TRADIES_COUNT_EVENT, {
      detail: { online },
    })
  )
}
