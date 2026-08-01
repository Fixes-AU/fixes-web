const ROUTE_TITLES: Readonly<Record<string, string>> = {
  '/': 'Fixes | Hire Trusted Tradies Instantly',
  '/about': 'About Fixes | Our Story and Mission',
  '/admin': 'Admin Dashboard | Fixes',
  '/admin-select': 'Choose Admin Workspace | Fixes',
  '/admin/agencies': 'Agency Management | Fixes Admin',
  '/admin/agency-applications': 'Agency Applications | Fixes Admin',
  '/admin/ai-analytics': 'AI Analytics | Fixes Admin',
  '/admin/ai-analytics/logs': 'AI Analytics Logs | Fixes Admin',
  '/admin/bug-reports': 'Bug Reports | Fixes Admin',
  '/admin/commission': 'Commission Settings | Fixes Admin',
  '/admin/delete-requests': 'Account Deletion Requests | Fixes Admin',
  '/admin/disputes': 'Dispute Centre | Fixes Admin',
  '/admin/jobs': 'Job Management | Fixes Admin',
  '/admin/notifications': 'Admin Notifications | Fixes',
  '/admin/profile': 'Admin Profile | Fixes',
  '/admin/support-cases': 'Support Cases | Fixes Admin',
  '/admin/team': 'Admin Team | Fixes',
  '/admin/tradies': 'Tradie Verification | Fixes Admin',
  '/admin/transactions': 'Transactions | Fixes Admin',
  '/admin/users': 'User Management | Fixes Admin',
  '/admin/variations': 'Job Variations | Fixes Admin',
  '/admin/waitlist-leads': 'Waitlist Leads | Fixes Admin',
  '/agency': 'Agency Dashboard | Fixes',
  '/agency/jobs': 'Agency Jobs | Fixes',
  '/agency/register': 'Register Your Trade Agency | Join Fixes Australia',
  '/agency/settings/documents': 'Agency Documents | Fixes',
  '/agency/settings/payouts': 'Agency Payout Settings | Fixes',
  '/agency/workers': 'Agency Workers | Fixes',
  '/app/fixer': 'Download the Fixes Tradie App',
  '/app/fixes': 'Download the Fixes Client App',
  '/cleaning-admin': 'Cleaning Admin Dashboard | Fixes',
  '/cleaning-admin/cleaners': 'Cleaner Management | Fixes Admin',
  '/cleaning-admin/invites': 'Cleaner Invitations | Fixes Admin',
  '/cleaning-admin/jobs': 'Cleaning Jobs | Fixes Admin',
  '/cleaning-admin/rates': 'Cleaning Rates | Fixes Admin',
  '/cleaning-admin/revenue': 'Cleaning Revenue | Fixes Admin',
  '/cleaning-admin/settings': 'Cleaning Settings | Fixes Admin',
  '/dashboard': 'Client Dashboard | Fixes',
  '/dashboard/find-talent': 'Find Trusted Tradies | Fixes',
  '/dashboard/jobs': 'My Posted Jobs | Fixes',
  '/dashboard/payments': 'Payments and Receipts | Fixes',
  '/dashboard/profile': 'Client Profile | Fixes',
  '/dashboard/support': 'Client Support | Fixes',
  '/delete-account/fixer': 'Delete Your Fixer Account | Fixes',
  '/enterprise': 'Fixes for Enterprise | Commercial Trade Services',
  '/forgot-password': 'Reset Your Fixes Password',
  '/login': 'Log In to Fixes',
  '/post-job': 'Post a Job & Hire Trusted Tradies | Fixes',
  '/pricing': 'Fixes Pricing | Plans for Clients and Tradies',
  '/register': 'Create Your Fixes Account',
  '/register/cleaner': 'Register as a Cleaner | Fixes',
  '/register/tradie': 'Register as a Tradie | Find Local Jobs with Fixes',
  '/stripe-connect/refresh': 'Reconnect Stripe | Fixes',
  '/stripe-connect/return': 'Stripe Setup Complete | Fixes',
  '/waitlist/client': 'Join the Fixes Client App Waitlist',
  '/waitlist/tradie': 'Join the Fixes Tradie App Waitlist',
}

function readableIdentifier(value: string) {
  let decoded = value

  try {
    decoded = decodeURIComponent(value)
  } catch {
    // Keep the original route segment when it is not valid URI encoding.
  }

  const normalized = decoded.replace(/[^a-zA-Z0-9._-]+/g, ' ').trim()
  if (!normalized) return 'Details'
  return normalized.length > 24 ? normalized.slice(-8) : normalized
}

type DynamicTitleRule = {
  pattern: RegExp
  title: (match: RegExpMatchArray) => string
}

const DYNAMIC_TITLE_RULES: readonly DynamicTitleRule[] = [
  {
    pattern: /^\/admin\/agencies\/([^/]+)$/,
    title: (match) => `Agency ${readableIdentifier(match[1])} | Fixes Admin`,
  },
  {
    pattern: /^\/admin\/ai-analytics\/([^/]+)$/,
    title: (match) => `AI Analysis ${readableIdentifier(match[1])} | Fixes Admin`,
  },
  {
    pattern: /^\/admin\/jobs\/([^/]+)$/,
    title: (match) => `Admin Job ${readableIdentifier(match[1])} | Fixes`,
  },
  {
    pattern: /^\/admin\/tradies\/([^/]+)$/,
    title: (match) => `Tradie Review ${readableIdentifier(match[1])} | Fixes Admin`,
  },
  {
    pattern: /^\/admin\/users\/([^/]+)$/,
    title: (match) => `User ${readableIdentifier(match[1])} | Fixes Admin`,
  },
  {
    pattern: /^\/agency\/invite\/[^/]+$/,
    title: () => 'Accept Your Agency Invitation | Fixes',
  },
  {
    pattern: /^\/cleaning-admin\/jobs\/([^/]+)$/,
    title: (match) => `Cleaning Job ${readableIdentifier(match[1])} | Fixes`,
  },
  {
    pattern: /^\/dashboard\/find-talent\/([^/]+)$/,
    title: (match) => `Tradie Profile ${readableIdentifier(match[1])} | Fixes`,
  },
  {
    pattern: /^\/dashboard\/jobs\/([^/]+)\/dispute$/,
    title: (match) => `Job Dispute ${readableIdentifier(match[1])} | Fixes`,
  },
  {
    pattern: /^\/dashboard\/jobs\/([^/]+)$/,
    title: (match) => `Job ${readableIdentifier(match[1])} | Fixes`,
  },
  {
    pattern: /^\/reset-password\/[^/]+$/,
    title: () => 'Choose a New Fixes Password',
  },
  {
    pattern: /^\/track\/([^/]+)$/,
    title: (match) => `Track Job ${readableIdentifier(match[1])} | Fixes`,
  },
  {
    pattern: /^\/tradie\/([^/]+)$/,
    title: (match) => `Tradie ${readableIdentifier(match[1])} | Fixes`,
  },
  {
    pattern: /^\/verify-email\/[^/]+$/,
    title: () => 'Verify Your Fixes Email',
  },
]

export function getRouteTitle(pathname: string) {
  const normalizedPathname = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
  const staticTitle = ROUTE_TITLES[normalizedPathname]
  if (staticTitle) return staticTitle

  for (const rule of DYNAMIC_TITLE_RULES) {
    const match = normalizedPathname.match(rule.pattern)
    if (match) return rule.title(match)
  }

  return null
}
