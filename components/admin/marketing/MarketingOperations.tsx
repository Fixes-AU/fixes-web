'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, CircleOff, Loader2, RefreshCw, ShieldAlert, Wrench } from 'lucide-react'
import { ApiError } from '@/lib/api'
import { MarketingOperations as Operations, marketingApi } from '@/lib/marketing'

const label = (value: string) => value.replaceAll('_', ' ').replace(/\b\w/g, character => character.toUpperCase())

export default function MarketingOperations({ refreshToken = 0, onRefreshComplete }: { refreshToken?: number; onRefreshComplete?: (token: number) => void }) {
  const [operations, setOperations] = useState<Operations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  const handledRefresh = useRef(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await marketingApi.operations()
      setOperations(response.data)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause : new ApiError('Operational status could not be loaded.', 500))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])
  useEffect(() => {
    if (!refreshToken || handledRefresh.current === refreshToken) return
    handledRefresh.current = refreshToken
    void load().finally(() => onRefreshComplete?.(refreshToken))
  }, [load, onRefreshComplete, refreshToken])

  return <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
    <header className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-start sm:justify-between">
      <div><h2 className="flex items-center gap-2 text-lg font-bold text-gray-900"><ShieldAlert className="h-5 w-5 text-violet-600" /> Payment operations and rollout safety</h2><p className="mt-1 text-sm text-gray-500">Read-only reconciliation facts and activation blockers. Pause affected campaigns when needed; Engineering owns technical recovery.</p></div>
      <button type="button" disabled={loading} onClick={() => void load()} className="marketing-button-secondary"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> {loading ? 'Refreshing' : 'Refresh'}</button>
    </header>
    {error && <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error.message}{error.requestId && <span className="ml-2 text-[10px]">Request {error.requestId}</span>}</div>}
    {loading && !operations ? <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-violet-600" /></div> : operations && <div className="space-y-5 p-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatusCard title="Financial activation" ready={operations.activation.ready} value={operations.activation.ready ? 'Ready' : 'Blocked'} />
        <StatusCard title="Mongo transactions" ready={operations.activation.transaction.ready} value={label(operations.activation.transaction.topology)} />
        <StatusCard title="Checkout reconciliation" ready={operations.incidentCounts.checkoutReconciliation === 0} value={operations.incidentCounts.checkoutReconciliation} />
        <StatusCard title="Failed async delivery" ready={operations.incidentCounts.webhookDeadLetters + operations.incidentCounts.financialDocumentDeadLetters === 0} value={operations.incidentCounts.webhookDeadLetters + operations.incidentCounts.financialDocumentDeadLetters} />
      </div>
      {!operations.activation.ready && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><div className="flex gap-3"><CircleOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" /><div><p className="text-sm font-semibold text-amber-900">Discount checkout remains fail-closed</p><ul className="mt-2 space-y-1">{operations.activation.blockers.map(blocker => <li key={blocker} className="text-xs text-amber-800">{blocker}</li>)}</ul></div></div></div>}
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="overflow-hidden rounded-xl border border-gray-200"><div className="border-b border-gray-100 bg-gray-50 px-4 py-3"><h3 className="text-sm font-semibold text-gray-800">Open operational incidents</h3></div>{operations.incidents.length === 0 ? <div className="py-12 text-center"><CheckCircle2 className="mx-auto h-7 w-7 text-emerald-500" /><p className="mt-2 text-sm font-semibold text-gray-700">No open incidents found</p></div> : <div className="divide-y divide-gray-100">{operations.incidents.map(incident => <article key={incident.id} className="p-4"><div className="flex items-start gap-3">{incident.severity === 'critical' ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" /> : <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />}<div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-gray-800">{incident.summary}</p><time className="text-[10px] text-gray-400">{new Date(incident.occurredAt).toLocaleString('en-AU')}</time></div><p className="mt-0.5 text-[11px] text-gray-500">{incident.errorCode} · {incident.attempts} attempt{incident.attempts === 1 ? '' : 's'}</p><div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">{Object.entries(incident.references).filter(([, value]) => Boolean(value)).map(([key, value]) => <span key={key} className="font-mono text-[10px] text-gray-400">{label(key)}: {String(value)}</span>)}</div></div></div></article>)}</div>}</div>
        <aside className="space-y-3"><div className="rounded-xl border border-blue-100 bg-blue-50 p-4"><h3 className="text-sm font-semibold text-blue-900">Routing</h3><p className="mt-2 text-xs text-blue-800">{operations.ownership.technical}</p><p className="mt-2 text-xs text-blue-800">{operations.ownership.operational}</p></div><div className="rounded-xl border border-gray-200 p-4"><h3 className="text-sm font-semibold text-gray-800">Safety switches</h3><div className="mt-3 space-y-2">{Object.entries(operations.featureFlags).filter(([, value]) => typeof value === 'boolean').map(([key, enabled]) => <div key={key} className="flex items-center justify-between gap-3"><span className="text-[11px] text-gray-500">{label(key)}</span><span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{enabled ? 'on' : 'off'}</span></div>)}<div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-2"><span className="text-[11px] text-gray-500">Rollout mode</span><span className="text-[10px] font-bold uppercase text-violet-700">{label(operations.featureFlags.rolloutMode)}</span></div><div className="flex items-center justify-between gap-3"><span className="text-[11px] text-gray-500">Pilot campaigns</span><span className="text-xs font-bold text-gray-700">{operations.featureFlags.rolloutCampaignCount}</span></div></div></div></aside>
      </div>
      <p className="text-[10px] text-gray-400">No raw Stripe webhook payloads, customer identity fields, credentials, card data, or client secrets are exposed here.</p>
    </div>}
  </section>
}

function StatusCard({ title, ready, value }: { title: string; ready: boolean; value: string | number }) {
  return <div className="rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-2">{ready ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}<p className="text-[10px] font-semibold uppercase text-gray-400">{title}</p></div><p className={`mt-2 text-xl font-bold ${ready ? 'text-gray-900' : 'text-amber-800'}`}>{value}</p></div>
}
