'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle, Archive, BarChart3, CalendarDays, ChevronLeft, ChevronRight, CirclePause,
  CirclePlay, Edit3, Loader2, Megaphone, Plus, RefreshCw, Search, Ticket, XCircle,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useMarketingWorkspace } from '@/hooks/use-marketing-workspace'
import { ApiError } from '@/lib/api'
import {
  CAMPAIGN_STATUS_LABELS, CAMPAIGN_STATUS_STYLES, CampaignDraft, CampaignStatus,
  DiscountCode, DiscountCodeDraft, DiscountCodeStatus, MarketingCampaign, formatAud, marketingApi,
} from '@/lib/marketing'
import CampaignFormDialog from './CampaignFormDialog'
import DiscountCodeDialog from './DiscountCodeDialog'
import TransitionDialog from './TransitionDialog'
import MarketingInsights from './MarketingInsights'
import BulkCodeDialog from './BulkCodeDialog'
import MarketingBulkJobs from './MarketingBulkJobs'
import MarketingOperations from './MarketingOperations'
import MarketingDistributionPanel from './MarketingDistributionPanel'
import DefaultSignupOfferControl from './DefaultSignupOfferControl'

type TransitionTarget =
  | { kind: 'campaign'; campaign: MarketingCampaign; nextStatus: CampaignStatus }
  | { kind: 'code'; campaign: MarketingCampaign; code: DiscountCode; nextStatus: DiscountCodeStatus }

const campaignTransitions: Partial<Record<CampaignStatus, CampaignStatus[]>> = {
  draft: ['scheduled', 'active', 'archived'], scheduled: ['active', 'paused', 'ended', 'archived'],
  active: ['paused', 'ended'], paused: ['active', 'ended', 'archived'], ended: ['archived'],
}
const codeTransitions: Partial<Record<DiscountCodeStatus, DiscountCodeStatus[]>> = {
  draft: ['active', 'revoked'], active: ['paused', 'revoked'], paused: ['active', 'revoked'],
}

export default function MarketingWorkspace() {
  const { user, refreshUser } = useAuth()
  const { state, actions } = useMarketingWorkspace()
  const [campaignForm, setCampaignForm] = useState<{ open: boolean; campaign: MarketingCampaign | null }>({ open: false, campaign: null })
  const [codeForm, setCodeForm] = useState<{ open: boolean; code: DiscountCode | null }>({ open: false, code: null })
  const [transition, setTransition] = useState<TransitionTarget | null>(null)
  const [bulkSource, setBulkSource] = useState<DiscountCode | null>(null)
  const [bulkRefreshKey, setBulkRefreshKey] = useState(0)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (state.error?.code === 'MARKETING_ACCESS_DENIED') void refreshUser()
  }, [refreshUser, state.error])

  const visibleCampaigns = useMemo(() => state.campaigns, [state.campaigns])

  const saveCampaign = async (draft: CampaignDraft) => {
    if (campaignForm.campaign) {
      await actions.runMutation(() => marketingApi.updateCampaign(campaignForm.campaign!._id, campaignForm.campaign!.version, draft))
      setNotice('Campaign changes saved.')
    } else {
      const result = await actions.runMutation(() => marketingApi.createCampaign(draft))
      await actions.selectCampaign(result.data.campaign._id)
      setNotice('Campaign draft created.')
    }
  }

  const saveCode = async (draft: DiscountCodeDraft, token: string) => {
    const campaign = state.selectedCampaign
    if (!campaign) return
    if (codeForm.code) {
      await actions.runMutation(() => marketingApi.updateCode(campaign._id, codeForm.code!._id, codeForm.code!.version, draft, token))
      setNotice('Discount code changes saved.')
    } else {
      await actions.runMutation(() => marketingApi.createCode(campaign._id, draft, token))
      setNotice('Discount code created.')
    }
  }

  const executeTransition = async (reason: string, token: string) => {
    if (!transition) return
    if (transition.kind === 'campaign') {
      await actions.runMutation(() => marketingApi.transitionCampaign(
        transition.campaign._id, transition.campaign.version, transition.nextStatus, reason, token
      ))
      setNotice(`Campaign moved to ${CAMPAIGN_STATUS_LABELS[transition.nextStatus]}.`)
    } else {
      await actions.runMutation(() => marketingApi.transitionCode(
        transition.campaign._id, transition.code._id, transition.code.version, transition.nextStatus, reason, token
      ))
      setNotice(`Code moved to ${transition.nextStatus}.`)
    }
    setTransition(null)
  }

  const createBulk = async (count: number, prefix: string, template: DiscountCodeDraft, batchId: string, token: string) => {
    const campaign = state.selectedCampaign
    if (!campaign) return
    await actions.runMutation(() => marketingApi.createBulkJob(campaign._id, campaign.version, count, prefix, template, batchId, token))
    setBulkRefreshKey(value => value + 1)
    setBulkSource(null)
    setNotice(`Bulk generation of ${count} individual codes was queued.`)
  }

  const saveDefaultSignupOffer = async (codeId: string | null, token: string) => {
    const campaign = state.selectedCampaign
    if (!campaign) return
    await actions.runMutation(() => marketingApi.setDefaultSignupOffer(campaign._id, campaign.version, codeId, token))
    setNotice(codeId ? 'Default signup offer saved.' : 'Campaign-only links are now tracking only.')
  }

  if (state.loading) return <LoadingState />
  if (!state.access && state.error) return <FatalError error={state.error} onRetry={() => actions.loadCampaigns()} />

  return <div className="max-w-7xl mx-auto space-y-6">
    <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
      <div><div className="flex items-center gap-2 text-violet-600 mb-1"><Megaphone className="w-5 h-5" /><span className="text-xs font-semibold uppercase tracking-wider">Marketing workspace</span></div><h1 className="text-2xl font-bold text-gray-900">Campaigns and discounts</h1><p className="text-sm text-gray-500 mt-1">Create tracked campaigns, control offer terms, and inspect usage without changing live payment behavior.</p></div>
      <div className="flex gap-2">
        <button onClick={() => actions.loadCampaigns(true)} className="marketing-button-secondary"><RefreshCw className={`w-4 h-4 ${state.stale ? 'text-amber-500' : ''}`} /> Refresh</button>
        {state.access?.canManage && <button onClick={() => setCampaignForm({ open: true, campaign: null })} className="marketing-button-primary"><Plus className="w-4 h-4" /> New campaign</button>}
      </div>
    </header>

    {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex justify-between"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss"><XCircle className="w-4 h-4" /></button></div>}
    {state.error && <ErrorBanner error={state.error} stale={state.stale} onRetry={() => { actions.clearError(); state.selectedCampaign ? actions.refreshSelected() : actions.loadCampaigns(true) }} />}

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Metric icon={Megaphone} label="Campaigns" value={state.total} />
      <Metric icon={CirclePlay} label="Active shown" value={state.campaigns.filter(item => item.status === 'active').length} accent="emerald" />
      <Metric icon={Ticket} label="Selected codes" value={state.codes.length} accent="violet" />
      <Metric icon={BarChart3} label="Committed budget" value={formatAud(state.campaigns.reduce((sum, item) => sum + item.reservedBudgetCents + item.authorizedBudgetCents + item.redeemedBudgetCents, 0))} accent="amber" />
    </div>

    <section className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input value={state.search} onChange={event => actions.setSearch(event.target.value)} placeholder="Search campaign name or public identifier" className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-violet-500" /></div>
        <select value={state.statusFilter} onChange={event => actions.setStatusFilter(event.target.value)} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-violet-500"><option value="all">All statuses</option>{Object.entries(CAMPAIGN_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      </div>
      {visibleCampaigns.length === 0 ? <EmptyCampaigns canManage={Boolean(state.access?.canManage)} onCreate={() => setCampaignForm({ open: true, campaign: null })} /> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 border-b border-gray-100"><tr><Th>Campaign</Th><Th>Status</Th><Th>Period</Th><Th>Budget</Th><Th>Audience</Th><Th align="right">Action</Th></tr></thead><tbody className="divide-y divide-gray-100">{visibleCampaigns.map(campaign => <tr key={campaign._id} className={`hover:bg-gray-50 ${state.selectedCampaign?._id === campaign._id ? 'bg-violet-50/50' : ''}`}><td className="px-5 py-4"><p className="font-semibold text-gray-900">{campaign.internalName}</p><p className="text-xs text-gray-400">/{campaign.publicIdentifier}</p></td><td className="px-5 py-4"><StatusBadge status={campaign.status} /></td><td className="px-5 py-4 text-xs text-gray-500">{formatDate(campaign.startsAt)} – {formatDate(campaign.endsAt)}</td><td className="px-5 py-4"><p className="font-medium text-gray-700">{formatAud(campaign.budgetCents)}</p><p className="text-[10px] text-gray-400">{formatAud(campaign.reservedBudgetCents + campaign.authorizedBudgetCents + campaign.redeemedBudgetCents)} committed</p></td><td className="px-5 py-4 text-xs capitalize text-gray-500">{campaign.audiences.join(', ')}</td><td className="px-5 py-4 text-right"><button onClick={() => actions.selectCampaign(campaign._id)} className="text-violet-600 font-semibold text-xs hover:underline">Open</button></td></tr>)}</tbody></table></div>}
      <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between text-xs text-gray-500"><span>{state.total} campaign{state.total === 1 ? '' : 's'}</span><div className="flex items-center gap-2"><button disabled={state.page <= 1} onClick={() => actions.setPage(state.page - 1)} className="marketing-pagination-button"><ChevronLeft className="w-4 h-4" /></button><span>Page {state.page} of {state.totalPages}</span><button disabled={state.page >= state.totalPages} onClick={() => actions.setPage(state.page + 1)} className="marketing-pagination-button"><ChevronRight className="w-4 h-4" /></button></div></div>
    </section>

    {state.detailLoading ? <div className="rounded-2xl border border-gray-200 bg-white py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-violet-600" /></div> : state.selectedCampaign && <CampaignDetail campaign={state.selectedCampaign} codes={state.codes} canManage={Boolean(state.access?.canManage)} canExport={Boolean(state.access?.canExport)} busy={state.mutating} bulkRefreshKey={bulkRefreshKey} onEdit={() => setCampaignForm({ open: true, campaign: state.selectedCampaign })} onCreateCode={() => setCodeForm({ open: true, code: null })} onEditCode={code => setCodeForm({ open: true, code })} onBulkCode={setBulkSource} onDefaultSignupOffer={saveDefaultSignupOffer} onCampaignTransition={nextStatus => setTransition({ kind: 'campaign', campaign: state.selectedCampaign!, nextStatus })} onCodeTransition={(code, nextStatus) => setTransition({ kind: 'code', campaign: state.selectedCampaign!, code, nextStatus })} />}
    <MarketingInsights campaignId={state.selectedCampaign?._id} campaignName={state.selectedCampaign?.publicName} canExport={Boolean(state.access?.canExport)} />
    <MarketingOperations />

    <CampaignFormDialog open={campaignForm.open} campaign={campaignForm.campaign} ownerId={user?._id || ''} busy={state.mutating} onOpenChange={open => setCampaignForm(current => ({ ...current, open }))} onSave={saveCampaign} />
    {state.selectedCampaign && <DiscountCodeDialog open={codeForm.open} campaign={state.selectedCampaign} code={codeForm.code} busy={state.mutating} onOpenChange={open => setCodeForm(current => ({ ...current, open }))} onSave={saveCode} />}
    <BulkCodeDialog open={Boolean(bulkSource)} source={bulkSource} onOpenChange={open => { if (!open) setBulkSource(null) }} onConfirm={createBulk} />
    {transition && <TransitionDialog open title={`${transition.nextStatus.replaceAll('_', ' ')} ${transition.kind === 'campaign' ? 'campaign' : 'code'}`} description={`This changes availability immediately for new activity. Existing short-lived reservations continue under the approved policy.`} action={transition.kind === 'campaign' ? 'campaign:transition' : 'campaign:code_transition'} confirmLabel="Confirm transition" destructive={['ended', 'archived', 'revoked'].includes(transition.nextStatus)} reasonRequired={['paused', 'ended', 'archived', 'revoked'].includes(transition.nextStatus)} onOpenChange={open => { if (!open) setTransition(null) }} onConfirm={executeTransition} />}
  </div>
}

function CampaignDetail({ campaign, codes, canManage, canExport, busy, bulkRefreshKey, onEdit, onCreateCode, onEditCode, onBulkCode, onDefaultSignupOffer, onCampaignTransition, onCodeTransition }: { campaign: MarketingCampaign; codes: DiscountCode[]; canManage: boolean; canExport: boolean; busy: boolean; bulkRefreshKey: number; onEdit: () => void; onCreateCode: () => void; onEditCode: (code: DiscountCode) => void; onBulkCode: (code: DiscountCode) => void; onDefaultSignupOffer: (codeId: string | null, token: string) => Promise<void>; onCampaignTransition: (status: CampaignStatus) => void; onCodeTransition: (code: DiscountCode, status: DiscountCodeStatus) => void }) {
  return <section className="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-start justify-between gap-4"><div><div className="flex items-center gap-2"><h2 className="text-lg font-bold text-gray-900">{campaign.publicName}</h2><StatusBadge status={campaign.status} /></div><p className="text-sm text-gray-500 mt-1">{campaign.termsSummary}</p><p className="text-[10px] text-gray-400 mt-2">Version {campaign.version} · Updated {new Date(campaign.updatedAt).toLocaleString('en-AU')}</p></div>{canManage && <div className="flex flex-wrap gap-2"><button onClick={onEdit} className="marketing-button-secondary"><Edit3 className="w-4 h-4" /> Edit</button>{(campaignTransitions[campaign.status] || []).map(status => <button key={status} onClick={() => onCampaignTransition(status)} className={['ended', 'archived'].includes(status) ? 'marketing-button-danger' : 'marketing-button-secondary'}>{status === 'active' ? <CirclePlay className="w-4 h-4" /> : status === 'paused' ? <CirclePause className="w-4 h-4" /> : <Archive className="w-4 h-4" />} {CAMPAIGN_STATUS_LABELS[status]}</button>)}</div>}</div>
    <div className="grid lg:grid-cols-[1fr_300px] gap-5 p-5"><div className="space-y-5"><div className="grid sm:grid-cols-3 gap-3"><Info label="Campaign period" value={`${formatDate(campaign.startsAt)} – ${formatDate(campaign.endsAt)}`} /><Info label="Budget" value={formatAud(campaign.budgetCents)} sub={`${formatAud(campaign.reservedBudgetCents + campaign.authorizedBudgetCents + campaign.redeemedBudgetCents)} committed`} /><Info label="Attribution" value={[campaign.tracking?.source, campaign.tracking?.medium].filter(Boolean).join(' / ') || 'Direct'} /></div><DefaultSignupOfferControl campaign={campaign} codes={codes} canManage={canManage} busy={busy} onSave={onDefaultSignupOffer} /><div className="flex items-center justify-between"><div><h3 className="font-semibold text-gray-900">Codes and tracked offers</h3><p className="text-xs text-gray-400">Financial changes require password confirmation.</p></div>{canManage && <button onClick={onCreateCode} className="marketing-button-primary"><Plus className="w-4 h-4" /> Add code</button>}</div>{codes.length === 0 ? <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">No codes created for this campaign.</div> : <div className="space-y-3">{codes.map(code => <CodeCard key={code._id} code={code} canManage={canManage} onEdit={() => onEditCode(code)} onBulk={() => onBulkCode(code)} onTransition={status => onCodeTransition(code, status)} />)}</div>}<MarketingBulkJobs campaignId={campaign._id} canExport={canExport} refreshKey={bulkRefreshKey} /></div><MarketingDistributionPanel campaign={campaign} codes={codes} /></div>
  </section>
}

function CodeCard({ code, canManage, onEdit, onBulk, onTransition }: { code: DiscountCode; canManage: boolean; onEdit: () => void; onBulk: () => void; onTransition: (status: DiscountCodeStatus) => void }) { const value = code.purpose === 'attribution_only' ? 'Tracking only' : code.discountType === 'percentage' ? `${(code.percentageBasisPoints || 0) / 100}% off` : formatAud(code.fixedAmountCents); return <div className="rounded-xl border border-gray-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="rounded-lg bg-violet-50 p-2"><Ticket className="w-4 h-4 text-violet-600" /></div><div><div className="flex items-center gap-2"><code className="font-bold text-gray-900">{code.displayCode}</code><span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${code.status === 'active' ? 'bg-emerald-100 text-emerald-700' : code.status === 'paused' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{code.status}</span></div><p className="text-xs text-gray-500">{value} · {code.firstJobOnly ? 'First job only' : 'Eligible jobs'} · {code.redeemedCount} redeemed</p></div></div>{canManage && <div className="flex flex-wrap gap-2"><button onClick={onEdit} disabled={Boolean(code.termsLockedAt)} className="marketing-button-secondary disabled:opacity-40"><Edit3 className="w-3.5 h-3.5" /> Edit</button><button onClick={onBulk} className="marketing-button-secondary">Bulk</button>{(codeTransitions[code.status] || []).map(status => <button key={status} onClick={() => onTransition(status)} className={status === 'revoked' ? 'marketing-button-danger' : 'marketing-button-secondary'}>{status}</button>)}</div>}</div> }

function StatusBadge({ status }: { status: CampaignStatus }) { return <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${CAMPAIGN_STATUS_STYLES[status]}`}>{CAMPAIGN_STATUS_LABELS[status]}</span> }
function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) { return <th className={`px-5 py-3 ${align === 'right' ? 'text-right' : 'text-left'} text-[10px] font-bold uppercase text-gray-500`}>{children}</th> }
function Info({ label, value, sub }: { label: string; value: string; sub?: string }) { return <div className="rounded-xl bg-gray-50 p-3"><p className="text-[10px] font-semibold uppercase text-gray-400">{label}</p><p className="text-sm font-semibold text-gray-800 mt-1">{value}</p>{sub && <p className="text-[10px] text-gray-400">{sub}</p>}</div> }
function Metric({ icon: Icon, label, value, accent = 'blue' }: { icon: React.ElementType; label: string; value: string | number; accent?: string }) { const colors: Record<string, string> = { blue: 'bg-blue-50 text-blue-600', emerald: 'bg-emerald-50 text-emerald-600', violet: 'bg-violet-50 text-violet-600', amber: 'bg-amber-50 text-amber-600' }; return <div className="rounded-xl border border-gray-200 bg-white p-4 flex gap-3"><div className={`rounded-lg p-2 h-fit ${colors[accent]}`}><Icon className="w-4 h-4" /></div><div><p className="text-xs text-gray-400">{label}</p><p className="text-xl font-bold text-gray-900">{value}</p></div></div> }
function LoadingState() { return <div className="flex items-center justify-center py-28"><Loader2 className="w-7 h-7 text-violet-600 animate-spin" /><span className="sr-only">Loading marketing workspace</span></div> }
function FatalError({ error, onRetry }: { error: ApiError; onRetry: () => void }) { return <div className="max-w-xl mx-auto mt-16 rounded-2xl border border-red-200 bg-red-50 p-6 text-center"><AlertTriangle className="w-8 h-8 text-red-500 mx-auto" /><h1 className="font-semibold text-red-800 mt-3">Marketing workspace unavailable</h1><p className="text-sm text-red-700 mt-1">{error.message}</p>{error.requestId && <p className="text-[10px] text-red-500 mt-2">Request ID: {error.requestId}</p>}<button onClick={onRetry} className="marketing-button-secondary mt-4 mx-auto"><RefreshCw className="w-4 h-4" /> Retry</button></div> }
function ErrorBanner({ error, stale, onRetry }: { error: ApiError; stale: boolean; onRetry: () => void }) { return <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><p className="text-sm font-semibold text-red-800">{stale ? 'Showing the last successfully loaded data.' : error.message}</p>{stale && <p className="text-xs text-red-700">{error.message}</p>}<p className="text-[10px] text-red-500 mt-1">{error.code}{error.requestId ? ` · Request ID ${error.requestId}` : ''}</p></div><button onClick={onRetry} className="marketing-button-secondary"><RefreshCw className="w-4 h-4" /> Reload</button></div> }
function EmptyCampaigns({ canManage, onCreate }: { canManage: boolean; onCreate: () => void }) { return <div className="py-20 text-center"><Megaphone className="w-9 h-9 text-gray-300 mx-auto" /><p className="text-sm font-semibold text-gray-600 mt-3">No campaigns match these filters</p><p className="text-xs text-gray-400 mt-1">Clear the filters or create a draft campaign.</p>{canManage && <button onClick={onCreate} className="marketing-button-primary mt-4 mx-auto"><Plus className="w-4 h-4" /> New campaign</button>}</div> }
const formatDate = (value: string) => new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
