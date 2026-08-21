'use client'

import { useCallback, useEffect, useReducer, useRef } from 'react'
import { BarChart3, Download, FileClock, Loader2, RefreshCw, Users } from 'lucide-react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ApiError } from '@/lib/api'
import { MarketingAnalytics, MarketingAuditEntry, marketingApi } from '@/lib/marketing'

interface State {
  analytics: MarketingAnalytics | null
  audit: MarketingAuditEntry[]
  period: '30' | '90' | '365'
  loading: boolean
  refreshing: boolean
  exporting: string | null
  stale: boolean
  error: ApiError | null
}

type Action =
  | { type: 'LOAD'; background: boolean }
  | { type: 'SUCCESS'; analytics: MarketingAnalytics; audit: MarketingAuditEntry[] }
  | { type: 'ERROR'; error: ApiError }
  | { type: 'PERIOD'; period: State['period'] }
  | { type: 'EXPORT'; exporting: string | null }

const initial: State = { analytics: null, audit: [], period: '30', loading: true, refreshing: false, exporting: null, stale: false, error: null }
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD': return { ...state, loading: !action.background && !state.analytics, refreshing: action.background, error: null }
    case 'SUCCESS': return { ...state, analytics: action.analytics, audit: action.audit, loading: false, refreshing: false, stale: false, error: null }
    case 'ERROR': return { ...state, loading: false, refreshing: false, stale: Boolean(state.analytics), error: action.error }
    case 'PERIOD': return { ...state, period: action.period }
    case 'EXPORT': return { ...state, exporting: action.exporting }
  }
}

const friendlyEvent = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase())

export default function MarketingInsights({ campaignId, campaignName, canExport, refreshToken = 0, onRefreshComplete }: { campaignId?: string; campaignName?: string; canExport: boolean; refreshToken?: number; onRefreshComplete?: (token: number) => void }) {
  const [state, dispatch] = useReducer(reducer, initial)
  const requestRef = useRef(0)
  const handledRefresh = useRef(0)

  const params = useCallback(() => {
    const to = new Date()
    const from = new Date(to.getTime() - Number(state.period) * 24 * 60 * 60 * 1000)
    const result = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() })
    if (campaignId) result.set('campaignId', campaignId)
    return result
  }, [campaignId, state.period])

  const load = useCallback(async (background = false) => {
    const request = ++requestRef.current
    dispatch({ type: 'LOAD', background })
    try {
      const query = params()
      const [analytics, audit] = await Promise.all([marketingApi.analytics(query), marketingApi.audit(new URLSearchParams({ ...(campaignId ? { campaignId } : {}), limit: '25' }))])
      if (request !== requestRef.current) return
      dispatch({ type: 'SUCCESS', analytics: analytics.data, audit: audit.data.items })
    } catch (cause) {
      if (request !== requestRef.current) return
      dispatch({ type: 'ERROR', error: cause instanceof ApiError ? cause : new ApiError('Marketing reporting could not be loaded.', 500) })
    }
  }, [campaignId, params])

  useEffect(() => { void load() }, [load])
  useEffect(() => {
    if (!refreshToken || handledRefresh.current === refreshToken) return
    handledRefresh.current = refreshToken
    void load(true).finally(() => onRefreshComplete?.(refreshToken))
  }, [load, onRefreshComplete, refreshToken])

  const download = async (type: 'campaigns' | 'codes' | 'funnel') => {
    dispatch({ type: 'EXPORT', exporting: type })
    try {
      const blob = await marketingApi.export(type, params())
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `fixes-marketing-${type}-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch (cause) {
      dispatch({ type: 'ERROR', error: cause instanceof ApiError ? cause : new ApiError('Export could not be generated.', 500) })
    } finally {
      dispatch({ type: 'EXPORT', exporting: null })
    }
  }

  if (state.loading) return <div className="rounded-2xl border border-gray-200 bg-white py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-violet-600" /></div>
  const analytics = state.analytics
  const registrations = analytics?.funnel.find(item => item.eventType === 'registration_completed')?.count || 0
  const authorized = analytics?.funnel.find(item => item.eventType === 'payment_authorized')?.count || 0
  const scans = analytics?.funnel.find(item => item.eventType === 'campaign_scan')?.count || 0

  return <section className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
    <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-start justify-between gap-4"><div><h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-violet-600" /> Funnel analytics and audit</h2><p className="text-sm text-gray-500 mt-1">{campaignName ? `Filtered to ${campaignName}` : 'All accessible campaigns'} · Australia/Sydney reporting timezone</p></div><div className="flex flex-wrap gap-2">{(['30', '90', '365'] as const).map(period => <button key={period} onClick={() => dispatch({ type: 'PERIOD', period })} className={`rounded-lg px-3 py-2 text-xs font-semibold ${state.period === period ? 'bg-violet-600 text-white' : 'border border-gray-200 text-gray-500'}`}>{period === '365' ? '1 year' : `${period} days`}</button>)}<button disabled={state.refreshing} onClick={() => void load(true)} className="marketing-button-secondary"><RefreshCw className={`w-4 h-4 ${state.refreshing ? 'animate-spin' : ''}`} /><span className="sr-only">Refresh analytics</span></button></div></div>
    {state.error && <div className="mx-5 mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{state.stale ? 'Showing last loaded reporting data. ' : ''}{state.error.message}{state.error.requestId && <span className="block text-[10px] mt-1">Request ID: {state.error.requestId}</span>}</div>}
    <div className="p-5 space-y-5">
      <div className="grid grid-cols-3 gap-3"><Kpi icon={BarChart3} label="Approx. scans" value={scans} note="Bots/previews may inflate" /><Kpi icon={Users} label="Registrations" value={registrations} /><Kpi icon={Download} label="Authorized payments" value={authorized} /></div>
      <div className="grid xl:grid-cols-[1.5fr_1fr] gap-5">
        <div className="rounded-xl border border-gray-200 p-4"><h3 className="text-sm font-semibold text-gray-800 mb-4">Funnel activity over time</h3>{analytics?.daily.length ? <ResponsiveContainer width="100%" height={240}><LineChart data={analytics.daily}><CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis allowDecimals={false} tick={{ fontSize: 10 }} /><Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} /><Legend wrapperStyle={{ fontSize: 11 }} /><Line type="monotone" dataKey="landing_view" name="Landing views" stroke="#8B5CF6" dot={false} strokeWidth={2} /><Line type="monotone" dataKey="registration_completed" name="Registrations" stroke="#3B82F6" dot={false} strokeWidth={2} /><Line type="monotone" dataKey="payment_authorized" name="Authorized" stroke="#10B981" dot={false} strokeWidth={2} /></LineChart></ResponsiveContainer> : <div className="h-60 flex items-center justify-center text-sm text-gray-400">No funnel events in this period.</div>}</div>
        <div className="rounded-xl border border-gray-200 overflow-hidden"><div className="px-4 py-3 bg-gray-50 border-b border-gray-100"><h3 className="text-sm font-semibold text-gray-800">Full funnel</h3></div><div className="max-h-72 overflow-y-auto divide-y divide-gray-100">{analytics?.funnel.map(item => <div key={item.eventType} className="px-4 py-2.5 flex items-center justify-between"><div><p className="text-xs font-medium text-gray-700">{friendlyEvent(item.eventType)}{item.approximate && <span className="ml-1 text-[9px] text-amber-600">approx.</span>}</p><p className="text-[10px] text-gray-400">{item.conversionFromPrevious == null ? 'No conversion base in this period' : `${item.conversionFromPrevious}% from ${friendlyEvent(item.conversionBaseEvent || '')}`}</p></div><span className="font-bold text-gray-900">{item.count}</span></div>)}</div></div>
      </div>
      <div className="grid xl:grid-cols-[1fr_auto] gap-5 items-start">
        <div className="rounded-xl border border-gray-200 overflow-hidden"><div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2"><FileClock className="w-4 h-4 text-gray-500" /><h3 className="text-sm font-semibold text-gray-800">Immutable audit history</h3></div>{state.audit.length ? <div className="divide-y divide-gray-100">{state.audit.map(item => <div key={item._id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1"><div><p className="text-xs font-semibold text-gray-700">{friendlyEvent(item.action.replaceAll('.', '_'))}</p><p className="text-[10px] text-gray-400">{item.resourceType} · {item.resourceId}</p>{item.reason && <p className="text-[11px] text-gray-500 mt-1">{item.reason}</p>}</div><div className="text-right"><p className="text-[10px] text-gray-400">{new Date(item.createdAt).toLocaleString('en-AU')}</p>{item.requestId && <p className="text-[9px] text-gray-300">{item.requestId}</p>}</div></div>)}</div> : <div className="py-12 text-center text-sm text-gray-400">No audited actions for this filter.</div>}</div>
        {canExport && <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4 w-full xl:w-64"><h3 className="text-sm font-semibold text-gray-800">CSV exports</h3><p className="text-[11px] text-gray-500 mt-1 mb-3">Exports are permission checked, capped, formula-safe, and written to the audit history.</p><div className="space-y-2"><ExportButton label="Campaigns" busy={state.exporting === 'campaigns'} onClick={() => download('campaigns')} /><ExportButton label="Funnel" busy={state.exporting === 'funnel'} onClick={() => download('funnel')} />{campaignId && <ExportButton label="Codes" busy={state.exporting === 'codes'} onClick={() => download('codes')} />}</div></div>}
      </div>
    </div>
  </section>
}

function Kpi({ icon: Icon, label, value, note }: { icon: React.ElementType; label: string; value: number; note?: string }) { return <div className="rounded-xl bg-gray-50 p-3 flex gap-2"><Icon className="w-4 h-4 text-violet-600 mt-0.5" /><div><p className="text-[10px] uppercase font-semibold text-gray-400">{label}</p><p className="text-xl font-bold text-gray-900">{value.toLocaleString()}</p>{note && <p className="text-[9px] text-gray-400">{note}</p>}</div></div> }
function ExportButton({ label, busy, onClick }: { label: string; busy: boolean; onClick: () => void }) { return <button disabled={busy} onClick={onClick} className="marketing-button-secondary w-full justify-between"><span>{label}</span>{busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}</button> }
