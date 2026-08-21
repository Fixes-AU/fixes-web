'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, HelpCircle, Loader2, RefreshCw, Search, Users } from 'lucide-react'
import { ApiError } from '@/lib/api'
import { MarketingRegistration, marketingApi } from '@/lib/marketing'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const REGISTRATION_TYPES = [
  ['all', 'All account types'],
  ['client', 'Fixes clients'],
  ['independent_fixer', 'Independent Fixers'],
  ['cleaning_invite', 'Cleaning invites'],
  ['agency_member', 'Agency members'],
  ['agency_application', 'Agency applications'],
  ['fixer_waitlist', 'Fixer waitlist'],
  ['client_waitlist', 'Client waitlist'],
] as const

const friendly = (value?: string | null) => value
  ? value.replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase())
  : '—'

export default function MarketingRegistrations({
  campaignId, campaignName, canExport, refreshToken = 0, onRefreshComplete,
}: {
  campaignId?: string
  campaignName?: string
  canExport: boolean
  refreshToken?: number
  onRefreshComplete?: (token: number) => void
}) {
  const [items, setItems] = useState<MarketingRegistration[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [registrationType, setRegistrationType] = useState('all')
  const [audience, setAudience] = useState('all')
  const [surface, setSurface] = useState('all')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const handledRefresh = useRef(0)

  const params = useCallback((requestedPage = page) => {
    const to = new Date()
    const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000)
    const value = new URLSearchParams({
      page: String(requestedPage), limit: '25', from: from.toISOString(), to: to.toISOString(),
    })
    if (campaignId) value.set('campaignId', campaignId)
    if (search) value.set('search', search)
    if (registrationType !== 'all') value.set('registrationType', registrationType)
    if (audience !== 'all') value.set('audience', audience)
    if (surface !== 'all') value.set('surface', surface)
    return value
  }, [audience, campaignId, page, registrationType, search, surface])

  const load = useCallback(async (background = false) => {
    background ? setRefreshing(true) : setLoading(true)
    setError(null)
    try {
      const response = await marketingApi.registrations(params())
      setItems(response.data.items)
      setTotal(response.data.pagination.total)
      setTotalPages(Math.max(1, response.data.pagination.totalPages))
    } catch (cause) {
      setError(cause instanceof ApiError ? cause : new ApiError('Registration details could not be loaded.', 500))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [params])

  useEffect(() => { void load(false) }, [load])
  useEffect(() => { setPage(1) }, [campaignId])
  useEffect(() => {
    if (!refreshToken || handledRefresh.current === refreshToken) return
    handledRefresh.current = refreshToken
    void load(true).finally(() => onRefreshComplete?.(refreshToken))
  }, [load, onRefreshComplete, refreshToken])

  const download = async () => {
    setExporting(true)
    try {
      const blob = await marketingApi.export('registrations', params(1))
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `fixes-marketing-registrations-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause : new ApiError('Registration export could not be generated.', 500))
    } finally {
      setExporting(false)
    }
  }

  const showing = useMemo(() => items.length ? `${(page - 1) * 25 + 1}–${(page - 1) * 25 + items.length}` : '0', [items.length, page])

  return <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
    <header className="flex flex-col gap-3 border-b border-gray-100 p-5 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900"><Users className="h-5 w-5 text-violet-600" /> Registration details <Help text="Shows the individual Fixes, Fixer, cleaning, agency and waitlist registrations attributed to this campaign. Contact details remain masked unless the person gave direct-marketing consent." /></h2>
        <p className="mt-1 text-sm text-gray-500">{campaignName ? `Filtered to ${campaignName}` : 'All accessible campaigns'} · latest 30 days</p>
      </div>
      <div className="flex gap-2">
        {canExport && <button type="button" disabled={exporting} onClick={() => void download()} className="marketing-button-secondary">{exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Export CSV</button>}
        <button type="button" disabled={refreshing} onClick={() => void load(true)} className="marketing-button-secondary"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh</button>
      </div>
    </header>

    <div className="border-b border-gray-100 p-4">
      <form onSubmit={event => { event.preventDefault(); setPage(1); setSearch(searchInput.trim()) }} className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_repeat(3,minmax(150px,auto))]">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={searchInput} onChange={event => setSearchInput(event.target.value)} placeholder="Search name, email, phone or Fix ID" className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-20 text-sm outline-none focus:border-violet-500" /><button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200">Search</button></div>
        <select value={registrationType} onChange={event => { setPage(1); setRegistrationType(event.target.value) }} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm">{REGISTRATION_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <select value={audience} onChange={event => { setPage(1); setAudience(event.target.value) }} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"><option value="all">All audiences</option><option value="client">Client</option><option value="fixer">Fixer</option></select>
        <select value={surface} onChange={event => { setPage(1); setSurface(event.target.value) }} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"><option value="all">All platforms</option><option value="web">Web</option><option value="fixes_mobile">Fixes app</option><option value="fixer_mobile">Fixer app</option><option value="agency_invite">Agency invite</option><option value="cleaning_invite">Cleaning invite</option><option value="waitlist">Waitlist</option></select>
      </form>
    </div>

    {error && <div className="m-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error.message}</div>}
    {loading ? <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-violet-600" /></div> : items.length === 0 ? <div className="py-20 text-center"><Users className="mx-auto h-8 w-8 text-gray-300" /><p className="mt-3 text-sm font-semibold text-gray-600">No registrations match these filters</p><p className="mt-1 text-xs text-gray-400">Try a different account type, platform, or search.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left text-sm"><thead className="border-b border-gray-100 bg-gray-50 text-[10px] font-bold uppercase text-gray-500"><tr><Th>Person / account</Th><Th>Type</Th><Th>Campaign source</Th><Th>Offer</Th><Th>Platform</Th><Th>Verification</Th><Th>Registered</Th></tr></thead><tbody className="divide-y divide-gray-100">{items.map(item => <tr key={item._id} className="hover:bg-gray-50"><td className="px-4 py-3"><p className="font-semibold text-gray-800">{item.identity?.displayName || 'Legacy registration'}</p><p className="text-[11px] text-gray-500">{item.identity?.fixId || item.identity?.subjectId || 'Identity unavailable'}</p><p className="text-[10px] text-gray-400">{[item.identity?.email, item.identity?.phone].filter(Boolean).join(' · ') || 'No contact details available'}</p></td><td className="px-4 py-3"><p className="text-xs font-medium text-gray-700">{friendly(item.registrationType)}</p><p className="text-[10px] capitalize text-gray-400">{item.audience || '—'} · {friendly(item.identity?.status)}</p></td><td className="px-4 py-3"><p className="text-xs font-medium text-gray-700">{item.campaign?.publicName || 'Unattributed'}</p><p className="text-[10px] text-gray-400">{[item.utm?.source, item.utm?.medium].filter(Boolean).join(' / ') || friendly(item.attributionMethod)}</p></td><td className="px-4 py-3"><p className="font-mono text-xs text-gray-700">{item.code?.displayCode || 'Tracking only'}</p><p className="text-[10px] text-gray-400">{friendly(item.code?.purpose)}</p></td><td className="px-4 py-3 text-xs text-gray-600">{friendly(item.surface)}</td><td className="px-4 py-3 text-[11px] text-gray-600"><p>Email: {item.identity?.emailVerified == null ? 'n/a' : item.identity.emailVerified ? 'verified' : 'pending'}</p><p>Phone: {item.identity?.phoneVerified == null ? 'n/a' : item.identity.phoneVerified ? 'verified' : 'pending'}</p></td><td className="px-4 py-3 text-xs text-gray-600">{new Date(item.occurredAt).toLocaleString('en-AU')}</td></tr>)}</tbody></table></div>}

    <footer className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-xs text-gray-500"><span>Showing {showing} of {total}</span><div className="flex items-center gap-2"><button disabled={page <= 1} onClick={() => setPage(value => value - 1)} className="marketing-pagination-button"><ChevronLeft className="h-4 w-4" /></button><span>Page {page} of {totalPages}</span><button disabled={page >= totalPages} onClick={() => setPage(value => value + 1)} className="marketing-pagination-button"><ChevronRight className="h-4 w-4" /></button></div></footer>
  </section>
}

function Help({ text }: { text: string }) { return <Tooltip><TooltipTrigger asChild><button type="button" aria-label="More information" className="text-gray-400 hover:text-violet-600"><HelpCircle className="h-4 w-4" /></button></TooltipTrigger><TooltipContent className="max-w-xs">{text}</TooltipContent></Tooltip> }
function Th({ children }: { children: React.ReactNode }) { return <th className="px-4 py-3">{children}</th> }
