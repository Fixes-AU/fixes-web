'use client'

import { useCallback, useEffect, useState } from 'react'
import { BadgePercent, BriefcaseBusiness, CheckCircle2, Loader2, RefreshCw, Users } from 'lucide-react'
import { api, ApiError } from '@/lib/api'

interface CampaignRow {
  campaignId: string; campaignName: string; publicIdentifier: string | null
  registrations: number; jobs: number; completedJobs: number
  originalTotalCents: number; promotionCents: number; clientChargeCents: number
  platformSubsidyCents: number; providerServiceBasisCents: number
}
interface ScopedReport {
  range: { from: string; to: string; timezone: string }
  totals: Omit<CampaignRow, 'campaignId' | 'campaignName' | 'publicIdentifier'>
  campaigns: CampaignRow[]
}
const money = (cents: number) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(Number(cents || 0) / 100)

export default function ScopedCampaignReport({ endpoint, title, description, providerLabel = 'Provider basis' }: { endpoint: string | null; title: string; description: string; providerLabel?: string }) {
  const [days, setDays] = useState(30)
  const [report, setReport] = useState<ScopedReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  const load = useCallback(async () => {
    if (!endpoint) { setLoading(false); return }
    setLoading(true); setError(null)
    const to = new Date(); const from = new Date(to.getTime() - days * 86_400_000)
    try {
      const response = await api.get<ScopedReport>(`${endpoint}?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`)
      setReport(response.data)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause : new ApiError('Report could not be loaded.', 500))
    } finally { setLoading(false) }
  }, [days, endpoint])
  useEffect(() => { void load() }, [load])
  return <section className="space-y-5">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-xl font-bold text-gray-900">{title}</h2><p className="mt-1 max-w-2xl text-sm text-gray-500">{description}</p></div><div className="flex gap-2"><select value={days} onChange={event => setDays(Number(event.target.value))} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700"><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option><option value={365}>Last 365 days</option></select><button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700"><RefreshCw className="h-3.5 w-3.5" />Refresh</button></div></header>
    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error.message}{error.requestId && <span className="ml-2 text-xs">Request {error.requestId}</span>}</div>}
    {loading ? <div className="flex justify-center rounded-2xl border border-gray-200 bg-white py-16"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div> : report && <><div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Metric icon={Users} label="Attributed registrations" value={report.totals.registrations} /><Metric icon={BriefcaseBusiness} label="Discounted jobs" value={report.totals.jobs} /><Metric icon={CheckCircle2} label="Completed jobs" value={report.totals.completedJobs} /><Metric icon={BadgePercent} label="Fixes-funded promotions" value={money(report.totals.platformSubsidyCents)} /></div><div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">{report.campaigns.length === 0 ? <div className="py-14 text-center"><BadgePercent className="mx-auto h-9 w-9 text-gray-300" /><p className="mt-3 text-sm font-semibold text-gray-600">No attributed activity in this period</p><p className="mt-1 text-xs text-gray-400">Only activity inside your permitted service scope appears here.</p></div> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b border-gray-100 bg-gray-50"><tr>{['Campaign', 'Registrations', 'Jobs', 'Promotion', 'Client charged', providerLabel].map(label => <th key={label} className="px-4 py-3 text-left text-[10px] font-bold uppercase text-gray-500">{label}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{report.campaigns.map(row => <tr key={row.campaignId}><td className="px-4 py-3"><p className="font-semibold text-gray-800">{row.campaignName}</p>{row.publicIdentifier && <p className="text-[10px] text-gray-400">/{row.publicIdentifier}</p>}</td><td className="px-4 py-3 text-gray-600">{row.registrations}</td><td className="px-4 py-3 text-gray-600">{row.jobs} <span className="text-[10px] text-gray-400">({row.completedJobs} complete)</span></td><td className="px-4 py-3 font-semibold text-emerald-700">{money(row.promotionCents)}</td><td className="px-4 py-3 text-gray-700">{money(row.clientChargeCents)}</td><td className="px-4 py-3 text-gray-700">{money(row.providerServiceBasisCents)}</td></tr>)}</tbody></table></div>}</div><p className="text-[11px] text-gray-400">Read-only · Australia/Sydney · provider earnings remain based on the original approved service value for platform-funded offers.</p></>}
  </section>
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) { return <div className="rounded-xl border border-gray-200 bg-white p-4"><Icon className="mb-2 h-4 w-4 text-indigo-600" /><p className="text-xs text-gray-400">{label}</p><p className="mt-1 text-xl font-bold text-gray-900">{value}</p></div> }
