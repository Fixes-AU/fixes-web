// fixes-web/app/admin/transactions/page.tsx

'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Search, Loader2, CreditCard, DollarSign, TrendingUp,
  AlertTriangle, Download, Filter, ChevronRight, ArrowUpDown,
  ExternalLink, RefreshCw, Building2, ShoppingBag,
} from 'lucide-react'
import { api } from '@/lib/api'


interface PopulatedUser {
  _id: string
  name: string
  email: string
  fixId: string
}

interface PopulatedJob {
  _id: string
  jobCode: string
  title: string
  category: string
  status: string
}

interface Transaction {
  _id: string
  paymentRef: string
  jobId: PopulatedJob | null
  clientId: PopulatedUser | null
  tradieId: PopulatedUser | null
  amount: number
  platformFee: number
  tradieEarnings: number
  platformCommissionRate: number
  status: 'pending' | 'captured' | 'released' | 'refunded' | 'disputed' | 'requires_manual_review'
  stripePaymentIntentId: string
  stripeTransferId: string | null
  liveMode: boolean
  method: string
  capturedAt: string | null
  releasedAt: string | null
  escrowReleaseAt: string | null
  paymentChannel: 'marketplace' | 'cleaning_agency'
  createdAt: string
}

interface Stats {
  totalRevenue: number
  totalPlatformFees: number
  totalTradiePayouts: number
  avgAmount: number
  transactionCount: number
  stuckPayments: number
  byStatus: Record<string, number>
}

interface PayoutAttempt {
  _id: string
  attemptRef: string
  tradieId: PopulatedUser | null
  source: 'manual_cashout' | 'auto_cashout' | 'admin' | 'webhook_reconciliation'
  stripeAccountId: string
  stripePayoutId: string | null
  stripeBalanceTransactionId: string | null
  destination: string | null
  currency: string
  grossAmount: number
  feeAmount: number
  netAmount: number
  requestedMethod: 'instant' | 'standard'
  resolvedMethod: 'instant' | 'standard' | null
  fallbackUsed: boolean
  status: 'created' | 'processing' | 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled' | 'blocked' | 'unknown'
  walletDebitStatus: 'not_started' | 'debited' | 'failed'
  reasonCode: string | null
  failureCode: string | null
  failureMessage: string | null
  instantFailureCode: string | null
  instantFailureMessage: string | null
  eligibilitySnapshot: {
    reasonCode?: string
    reason?: string
    cashoutReady?: boolean
    instantAvailableBalance?: number
    instantNetAvailableBalance?: number
    destination?: string | null
  } | null
  balanceSnapshot: {
    walletBalance?: number
    stripeAvailable?: number
    stripeInstantAvailable?: number | null
    stripeInstantNetAvailable?: number | null
  } | null
  requestedAt: string
  completedAt: string | null
  createdAt: string
}

interface PayoutStats {
  totalAttempts: number
  grossAmount: number
  feeAmount: number
  netAmount: number
  byStatus: Record<string, number>
  byResolvedMethod: Record<string, number>
  byRequestedMethod: Record<string, number>
  fallbackCount: number
  walletDebitFailedCount: number
  unresolvedFailureCount: number
}


const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Captured', value: 'captured' },
  { label: 'Released', value: 'released' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Disputed', value: 'disputed' },
  { label: 'Needs Review', value: 'requires_manual_review' },
]

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  captured: 'bg-blue-100 text-blue-700',
  released: 'bg-green-100 text-green-700',
  refunded: 'bg-gray-100 text-gray-500',
  disputed: 'bg-red-100 text-red-600',
  requires_manual_review: 'bg-orange-100 text-orange-700',
}

const CHANNEL_STYLES: Record<string, string> = {
  marketplace: 'bg-violet-100 text-violet-700',
  cleaning_agency: 'bg-teal-100 text-teal-700',
}

const PAYOUT_STATUS_STYLES: Record<string, string> = {
  created: 'bg-gray-100 text-gray-600',
  processing: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  in_transit: 'bg-indigo-100 text-indigo-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  canceled: 'bg-gray-100 text-gray-500',
  blocked: 'bg-orange-100 text-orange-700',
  unknown: 'bg-slate-100 text-slate-600',
}

const PAYOUT_METHOD_STYLES: Record<string, string> = {
  instant: 'bg-emerald-100 text-emerald-700',
  standard: 'bg-blue-100 text-blue-700',
  unresolved: 'bg-gray-100 text-gray-500',
}

const LIMIT = 25


function fmt(n: number) {
  return `$${n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function isStuck(tx: Transaction) {
  return tx.liveMode && tx.status === 'captured' && !tx.stripeTransferId && !!tx.capturedAt
}


function StatCard({
  label, value, sub, icon: Icon, color, alert,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  color: string
  alert?: boolean
}) {
  return (
    <div className={`bg-white rounded-xl border p-4 flex items-start gap-3 ${alert ? 'border-red-200 bg-red-50/40' : 'border-gray-200'}`}>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">{label}</p>
        <p className={`text-xl font-bold mt-0.5 ${alert ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}


export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [payoutAttempts, setPayoutAttempts] = useState<PayoutAttempt[]>([])
  const [payoutStats, setPayoutStats] = useState<PayoutStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  const [isPayoutLoading, setIsPayoutLoading] = useState(true)
  const [isPayoutStatsLoading, setIsPayoutStatsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [channelFilter, setChannelFilter] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [sort, setSort] = useState('-createdAt')

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true)
    try {
      const qs = new URLSearchParams()
      if (fromDate) qs.set('from', fromDate)
      if (toDate) qs.set('to', toDate)
      const res = await api.get<Stats>(`/api/admin/transactions/stats?${qs}`)
      setStats(res.data)
    } catch { /* silent */ } finally { setIsStatsLoading(false) }
  }, [fromDate, toDate])

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true)
    try {
      const qs = new URLSearchParams()
      qs.set('page', String(page))
      qs.set('limit', String(LIMIT))
      qs.set('sort', sort)
      if (statusFilter !== 'all') qs.set('status', statusFilter)
      if (channelFilter !== 'all') qs.set('channel', channelFilter)
      if (search) qs.set('search', search)
      if (fromDate) qs.set('from', fromDate)
      if (toDate) qs.set('to', toDate)

      const res = await api.getPaginated<Transaction>(`/api/admin/transactions?${qs}`)
      setTransactions(res.data)
      setTotal(res.pagination.total)
    } catch { /* silent */ } finally { setIsLoading(false) }
  }, [page, sort, statusFilter, channelFilter, search, fromDate, toDate])

  const fetchPayoutStats = useCallback(async () => {
    setIsPayoutStatsLoading(true)
    try {
      const qs = new URLSearchParams()
      if (fromDate) qs.set('from', fromDate)
      if (toDate) qs.set('to', toDate)
      const res = await api.get<PayoutStats>(`/api/admin/payout-attempts/stats?${qs}`)
      setPayoutStats(res.data)
    } catch { /* silent */ } finally { setIsPayoutStatsLoading(false) }
  }, [fromDate, toDate])

  const fetchPayoutAttempts = useCallback(async () => {
    setIsPayoutLoading(true)
    try {
      const qs = new URLSearchParams()
      qs.set('page', '1')
      qs.set('limit', '8')
      qs.set('sort', '-createdAt')
      if (search) qs.set('search', search)
      if (fromDate) qs.set('from', fromDate)
      if (toDate) qs.set('to', toDate)

      const res = await api.getPaginated<PayoutAttempt>(`/api/admin/payout-attempts?${qs}`)
      setPayoutAttempts(res.data)
    } catch { /* silent */ } finally { setIsPayoutLoading(false) }
  }, [search, fromDate, toDate])

  useEffect(() => { fetchStats() }, [fetchStats])
  useEffect(() => { fetchTransactions() }, [fetchTransactions])
  useEffect(() => { fetchPayoutStats() }, [fetchPayoutStats])
  useEffect(() => { fetchPayoutAttempts() }, [fetchPayoutAttempts])

  const applySearch = () => { setSearch(searchInput); setPage(1) }

  const toggleSort = (field: string) => {
    setSort(prev => prev === `-${field}` ? field : `-${field}`)
    setPage(1)
  }

  const SortBtn = ({ field }: { field: string }) => (
    <button onClick={() => toggleSort(field)} className="ml-1 opacity-40 hover:opacity-100 transition-opacity">
      <ArrowUpDown className="w-3 h-3 inline" />
    </button>
  )

  const handleMarkLive = async (txId: string) => {
    try {
      await api.patch(`/api/admin/transactions/${txId}/mark-live`, {})
      await Promise.all([fetchTransactions(), fetchStats()])
    } catch (e) {
      alert('Failed to mark as live. Check console.')
      console.error(e)
    }
  }

  const handleExport = () => {
    const rows = [
      ['Ref', 'Job Code', 'Client', 'Tradie', 'Amount', 'Platform Fee', 'Tradie Earnings', 'Status', 'Channel', 'Method', 'Captured At', 'Released At', 'Stripe PI', 'Stripe Transfer', 'Date'],
      ...transactions.map(tx => [
        tx.paymentRef,
        tx.jobId?.jobCode ?? '',
        tx.clientId?.name ?? '',
        tx.tradieId?.name ?? '',
        tx.amount.toFixed(2),
        tx.platformFee.toFixed(2),
        tx.tradieEarnings.toFixed(2),
        tx.status,
        tx.paymentChannel,
        tx.method,
        tx.capturedAt ?? '',
        tx.releasedAt ?? '',
        tx.stripePaymentIntentId,
        tx.stripeTransferId ?? '',
        tx.createdAt,
      ]),
    ]
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-400 mt-0.5">Full payment lifecycle — capture, transfer, escrow</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => { fetchTransactions(); fetchStats(); fetchPayoutAttempts(); fetchPayoutStats() }}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            disabled={transactions.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {isStatsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 h-20 animate-pulse" />
          ))
        ) : stats ? (
          <>
            <StatCard
              label="Total Revenue"
              value={fmt(stats.totalRevenue)}
              sub={`${stats.transactionCount} transactions`}
              icon={DollarSign}
              color="bg-blue-100 text-blue-600"
            />
            <StatCard
              label="Platform Fees"
              value={fmt(stats.totalPlatformFees)}
              sub={`Avg ${fmt(stats.avgAmount)} / job`}
              icon={TrendingUp}
              color="bg-violet-100 text-violet-600"
            />
            <StatCard
              label="Tradie Payouts"
              value={fmt(stats.totalTradiePayouts)}
              sub={`${stats.byStatus?.released ?? 0} released`}
              icon={CreditCard}
              color="bg-green-100 text-green-600"
            />
            <StatCard
              label="Stuck Payments"
              value={String(stats.stuckPayments)}
              sub="Captured · no transfer"
              icon={AlertTriangle}
              color="bg-red-100 text-red-600"
              alert={stats.stuckPayments > 0}
            />
          </>
        ) : null}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Instant Payout Attempts</h2>
            <p className="text-xs text-gray-400 mt-0.5">Tradie bank cashout monitoring - instant, fallback, failure, and eligibility state</p>
          </div>
          {isPayoutLoading && <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin" />}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 p-4 border-b border-gray-100 bg-gray-50/50">
          {isPayoutStatsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-white rounded-lg border border-gray-200 animate-pulse" />
            ))
          ) : payoutStats ? (
            <>
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Attempts</p>
                <p className="text-lg font-bold text-gray-900">{payoutStats.totalAttempts}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Instant</p>
                <p className="text-lg font-bold text-emerald-600">{payoutStats.byResolvedMethod?.instant ?? 0}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Fallback</p>
                <p className="text-lg font-bold text-blue-600">{payoutStats.fallbackCount}</p>
              </div>
              <div className={`bg-white rounded-lg border p-3 ${payoutStats.unresolvedFailureCount > 0 ? 'border-red-200 bg-red-50/60' : 'border-gray-200'}`}>
                <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Blocked/Failed</p>
                <p className={`text-lg font-bold ${payoutStats.unresolvedFailureCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {payoutStats.unresolvedFailureCount}
                </p>
              </div>
              <div className={`bg-white rounded-lg border p-3 ${payoutStats.walletDebitFailedCount > 0 ? 'border-red-200 bg-red-50/60' : 'border-gray-200'}`}>
                <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Wallet Debit Fail</p>
                <p className={`text-lg font-bold ${payoutStats.walletDebitFailedCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {payoutStats.walletDebitFailedCount}
                </p>
              </div>
            </>
          ) : null}
        </div>

        {isPayoutLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 text-[#2563EB] animate-spin" />
          </div>
        ) : payoutAttempts.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-gray-400">No payout attempts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Attempt / Tradie</th>
                  <th className="text-right px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Gross / Net</th>
                  <th className="text-center px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                  <th className="text-center px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Eligibility</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell">Stripe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payoutAttempts.map(attempt => {
                  const method = attempt.resolvedMethod || attempt.requestedMethod || 'unresolved'
                  const statusStyle = PAYOUT_STATUS_STYLES[attempt.status] ?? PAYOUT_STATUS_STYLES.unknown
                  const methodStyle = PAYOUT_METHOD_STYLES[method] ?? PAYOUT_METHOD_STYLES.unresolved
                  const eligibilityReason = attempt.eligibilitySnapshot?.reason || attempt.failureMessage || attempt.reasonCode || 'No reason recorded'

                  return (
                    <tr key={attempt._id} className={attempt.status === 'failed' || attempt.status === 'blocked' ? 'bg-red-50/20' : 'hover:bg-blue-50/30'}>
                      <td className="px-4 py-3">
                        <p className="text-xs font-mono text-gray-700">{attempt.attemptRef || 'No ref'}</p>
                        <p className="text-[11px] text-gray-500">{attempt.tradieId?.name ?? 'Unknown tradie'}</p>
                        <p className="text-[10px] text-gray-400">{fmtDate(attempt.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-xs font-semibold text-gray-900">{fmt(attempt.grossAmount)}</p>
                        <p className="text-[11px] text-green-600">{fmt(attempt.netAmount)} net</p>
                        <p className="text-[10px] text-violet-500">{fmt(attempt.feeAmount)} fee</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${methodStyle}`}>
                          {method}
                        </span>
                        {attempt.fallbackUsed && (
                          <p className="text-[9px] text-blue-600 mt-1">fallback used</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusStyle}`}>
                          {attempt.status}
                        </span>
                        <p className={`text-[9px] mt-1 ${attempt.walletDebitStatus === 'failed' ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                          wallet {attempt.walletDebitStatus}
                        </p>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <p className="text-[11px] text-gray-600 max-w-72 truncate" title={eligibilityReason}>{eligibilityReason}</p>
                        <p className="text-[10px] text-gray-400">
                          instant {fmt(attempt.balanceSnapshot?.stripeInstantAvailable ?? 0)}
                          {' / net '}
                          {fmt(attempt.balanceSnapshot?.stripeInstantNetAvailable ?? 0)}
                        </p>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell">
                        <p className="text-[10px] font-mono text-gray-400 max-w-44 truncate" title={attempt.stripePayoutId || undefined}>
                          {attempt.stripePayoutId || 'No payout id'}
                        </p>
                        <p className="text-[10px] font-mono text-gray-400 max-w-44 truncate" title={attempt.stripeAccountId}>
                          {attempt.stripeAccountId}
                        </p>
                        {attempt.destination && (
                          <p className="text-[10px] font-mono text-gray-400 max-w-44 truncate" title={attempt.destination}>
                            dest {attempt.destination}
                          </p>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 mb-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') applySearch() }}
              placeholder="Search by ref, job code, client or tradie name, Stripe PI..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
            />
          </div>
          <button
            onClick={applySearch}
            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium rounded-lg transition-colors"
          >
            Search
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />

          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setStatusFilter(opt.value); setPage(1) }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors ${statusFilter === opt.value
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              {opt.label}
            </button>
          ))}

          <div className="w-px h-4 bg-gray-200 mx-1" />

          <select
            value={channelFilter}
            onChange={e => { setChannelFilter(e.target.value); setPage(1) }}
            className="bg-white border border-gray-200 rounded-lg text-[11px] text-gray-600 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="all">All Channels</option>
            <option value="marketplace">Marketplace</option>
            <option value="cleaning_agency">Cleaning Agency</option>
          </select>

          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={fromDate}
              onChange={e => { setFromDate(e.target.value); setPage(1) }}
              className="bg-white border border-gray-200 rounded-lg text-[11px] text-gray-600 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
            <span className="text-gray-300 text-xs">→</span>
            <input
              type="date"
              value={toDate}
              onChange={e => { setToDate(e.target.value); setPage(1) }}
              className="bg-white border border-gray-200 rounded-lg text-[11px] text-gray-600 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
            {(fromDate || toDate) && (
              <button
                onClick={() => { setFromDate(''); setToDate(''); setPage(1) }}
                className="text-[11px] text-red-400 hover:text-red-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {!isLoading && (
        <p className="text-xs text-gray-400 mb-3">
          {total} transaction{total !== 1 ? 's' : ''}
          {stats?.stuckPayments && stats.stuckPayments > 0 ? (
            <span className="ml-2 text-red-500 font-semibold">⚠ {stats.stuckPayments} stuck</span>
          ) : null}
        </p>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 text-[#2563EB] animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <CreditCard className="w-8 h-8 text-gray-300" />
            <p className="text-sm text-gray-400">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Ref / Job <SortBtn field="createdAt" />
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Client / Tradie
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Amount <SortBtn field="amount" />
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell whitespace-nowrap">
                    Fee / Earnings
                  </th>
                  <th className="text-center px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell whitespace-nowrap">
                    Captured <SortBtn field="capturedAt" />
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell whitespace-nowrap">
                    Released <SortBtn field="releasedAt" />
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider hidden 2xl:table-cell">
                    Stripe PI
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map(tx => {
                  const stuck = isStuck(tx)
                  const job = tx.jobId
                  return (
                    <tr
                      key={tx._id}
                      className={`hover:bg-blue-50/40 transition-colors ${stuck ? 'bg-red-50/30' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-1.5">
                          {stuck && (
                            <span title="Stuck: captured but no transfer">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                            </span>
                          )}
                          <div>
                            <p className="text-xs font-mono text-gray-600 leading-tight">{tx.paymentRef || '—'}</p>
                            {job ? (
                              <Link
                                href={`/admin/jobs/${job._id}`}
                                className="text-[10px] text-[#2563EB] hover:underline font-mono"
                              >
                                {job.jobCode}
                              </Link>
                            ) : (
                              <span className="text-[10px] text-gray-400">No job</span>
                            )}
                            <div className="mt-0.5 flex items-center gap-1">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${CHANNEL_STYLES[tx.paymentChannel] ?? 'bg-gray-100 text-gray-500'}`}>
                                {tx.paymentChannel === 'cleaning_agency' ? (
                                  <><Building2 className="w-2.5 h-2.5 inline mr-0.5" />Agency</>
                                ) : (
                                  <><ShoppingBag className="w-2.5 h-2.5 inline mr-0.5" />Marketplace</>
                                )}
                              </span>
                              {!tx.liveMode && (
                                <>
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-gray-100 text-gray-400 border border-gray-200">
                                    SANDBOX
                                  </span>
                                  <button
                                    onClick={() => handleMarkLive(tx._id)}
                                    className="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition-colors"
                                    title="Mark this payment as a real live payment"
                                  >
                                    Mark Live
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-xs text-gray-700 font-medium leading-tight">
                          {tx.clientId?.name ?? '—'}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          → {tx.tradieId?.name ?? '—'}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <p className="text-sm font-bold text-gray-900">{fmt(tx.amount)}</p>
                        <p className="text-[10px] text-gray-400 uppercase">{tx.method}</p>
                      </td>

                      <td className="px-4 py-3 text-right hidden lg:table-cell">
                        <p className="text-xs text-violet-600 font-medium">{fmt(tx.platformFee)}</p>
                        <p className="text-xs text-green-600 font-medium">{fmt(tx.tradieEarnings)}</p>
                        <p className="text-[10px] text-gray-400">{Math.round(tx.platformCommissionRate * 100)}% fee</p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLES[tx.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {tx.status}
                        </span>
                        {stuck && (
                          <p className="text-[9px] text-red-500 font-semibold mt-0.5">no transfer</p>
                        )}
                        {tx.stripeTransferId && (
                          <p className="text-[9px] text-green-500 mt-0.5">✓ transferred</p>
                        )}
                      </td>

                      <td className="px-4 py-3 hidden xl:table-cell">
                        <p className="text-[11px] text-gray-500">{fmtDate(tx.capturedAt)}</p>
                      </td>

                      <td className="px-4 py-3 hidden xl:table-cell">
                        <p className="text-[11px] text-gray-500">{fmtDate(tx.releasedAt)}</p>
                        {tx.escrowReleaseAt && !tx.releasedAt && (
                          <p className="text-[10px] text-amber-500">
                            Due {fmtDate(tx.escrowReleaseAt)}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3 hidden 2xl:table-cell">
                        <p className="text-[10px] font-mono text-gray-400 max-w-35 truncate" title={tx.stripePaymentIntentId}>
                          {tx.stripePaymentIntentId}
                        </p>
                        {tx.stripeTransferId && (
                          <p className="text-[10px] font-mono text-green-500 max-w-35 truncate" title={tx.stripeTransferId}>
                            {tx.stripeTransferId}
                          </p>
                        )}
                      </td>

                      <td className="px-3 py-3">
                        {job && (
                          <Link href={`/admin/jobs/${job._id}`}>
                            <ChevronRight className="w-4 h-4 text-gray-300 hover:text-gray-500" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-500 disabled:opacity-30 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-xs text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-500 disabled:opacity-30 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
