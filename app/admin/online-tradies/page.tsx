// fixes-web/app/admin/online-tradies/page.tsx

'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MapPin,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  User,
} from 'lucide-react'
import { api } from '@/lib/api'
import { publishAdminOnlineTradiesCount } from '@/lib/admin-online-tradies-events'
import { connectSocket, getSocket } from '@/lib/socket'
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS, TRADIE_CATEGORY_LABELS, VALID_CATEGORIES } from '@/lib/constants'
import type { JobStatus, OnlineTradie, TradieCategory } from '@/lib/types'

type BooleanFilter = 'all' | 'true' | 'false'

const PAGE_SIZE = 20
const REFRESH_INTERVAL_MS = 30_000

function timeAgo(iso?: string | null) {
  if (!iso) return 'Never'

  const diff = Date.now() - new Date(iso).getTime()
  if (!Number.isFinite(diff)) return 'Never'
  if (diff < 60_000) return 'just now'

  const mins = Math.floor(diff / 60_000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return `${mins}m ago`
}

function formatDateTime(iso?: string | null) {
  if (!iso) return 'Never'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Never'

  return date.toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getStatusLabel(status: string) {
  return JOB_STATUS_LABELS[status as JobStatus] || status.replace(/_/g, ' ')
}

function getStatusClass(status: string) {
  return JOB_STATUS_COLORS[status as JobStatus] || 'bg-gray-100 text-gray-600'
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'T'
}

function CategoryBadges({ categories }: { categories: TradieCategory[] }) {
  if (!categories.length) {
    return <span className="text-xs text-gray-400">No categories</span>
  }

  const visibleCategories = categories.slice(0, 3)
  const hiddenCount = categories.length - visibleCategories.length

  return (
    <div className="flex flex-wrap gap-1">
      {visibleCategories.map(category => (
        <span
          key={category}
          className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700"
        >
          {TRADIE_CATEGORY_LABELS[category]}
        </span>
      ))}
      {hiddenCount > 0 && (
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
          +{hiddenCount}
        </span>
      )}
    </div>
  )
}

function TradieAvatar({ tradie }: { tradie: OnlineTradie }) {
  if (tradie.avatarUrl) {
    return (
      <img
        src={tradie.avatarUrl}
        alt={`${tradie.name} profile photo`}
        className="h-10 w-10 rounded-full object-cover"
      />
    )
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-700">
      {initials(tradie.name)}
    </div>
  )
}

function ActiveJob({ tradie }: { tradie: OnlineTradie }) {
  if (!tradie.activeJob) {
    return <span className="text-xs text-gray-400">No active job</span>
  }

  const location = [tradie.activeJob.suburb, tradie.activeJob.state].filter(Boolean).join(', ')

  return (
    <Link href={`/admin/jobs/${tradie.activeJob._id}`} className="group block min-w-0">
      <div className="flex items-center gap-1.5">
        <span className="truncate text-xs font-semibold text-gray-800 group-hover:text-[#2563EB]">
          {tradie.activeJob.jobCode || tradie.activeJob.title}
        </span>
        <ExternalLink className="h-3 w-3 shrink-0 text-gray-300 group-hover:text-[#2563EB]" />
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusClass(tradie.activeJob.status)}`}>
          {getStatusLabel(tradie.activeJob.status)}
        </span>
        {location && <span className="text-[10px] text-gray-400">{location}</span>}
      </div>
    </Link>
  )
}

function TradieCard({ tradie }: { tradie: OnlineTradie }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <TradieAvatar tradie={tradie} />
        <div className="min-w-0 flex-1">
          <Link href={`/admin/users/${tradie.userId}`} className="group">
            <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-[#2563EB]">{tradie.name}</p>
            <p className="truncate text-xs text-gray-400">{tradie.email}</p>
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              <Radio className="h-3 w-3" />
              Online
            </span>
            {tradie.isFullyVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </span>
            )}
            {tradie.isAgencyTradie && (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                <Building2 className="h-3 w-3" />
                Agency
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <CategoryBadges categories={tradie.categories} />
        <ActiveJob tradie={tradie} />
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-gray-400">Online updated</p>
            <p className="font-medium text-gray-700" title={formatDateTime(tradie.onlineUpdatedAt)}>
              {timeAgo(tradie.onlineUpdatedAt)}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Location update</p>
            <p className="font-medium text-gray-700" title={formatDateTime(tradie.lastLocationUpdatedAt)}>
              {timeAgo(tradie.lastLocationUpdatedAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminOnlineTradiesPage() {
  const [tradies, setTradies] = useState<OnlineTradie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isStale, setIsStale] = useState(false)
  const [error, setError] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | TradieCategory>('all')
  const [verificationFilter, setVerificationFilter] = useState<BooleanFilter>('all')
  const [agencyFilter, setAgencyFilter] = useState<BooleanFilter>('all')
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)
  const latestRequestRef = useRef(0)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const fetchOnlineTradies = useCallback(async (silent = false) => {
    const requestId = ++latestRequestRef.current
    if (silent) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      const qs = new URLSearchParams()
      qs.set('page', String(page))
      qs.set('limit', String(PAGE_SIZE))
      if (search) qs.set('search', search)
      if (categoryFilter !== 'all') qs.set('category', categoryFilter)
      if (verificationFilter !== 'all') qs.set('isFullyVerified', verificationFilter)
      if (agencyFilter !== 'all') qs.set('isAgencyTradie', agencyFilter)

      const res = await api.getPaginated<OnlineTradie>(`/api/admin/tradies/online?${qs.toString()}`)
      if (requestId !== latestRequestRef.current) return

      setTradies(res.data)
      setTotal(res.pagination.total)
      publishAdminOnlineTradiesCount(res.pagination.total)
      setLastUpdated(new Date().toISOString())
      setError('')
      setIsStale(false)
    } catch (err) {
      if (requestId !== latestRequestRef.current) return
      setError(err instanceof Error ? err.message : 'Unable to load online tradies')
      setIsStale(true)
    } finally {
      if (requestId === latestRequestRef.current) {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    }
  }, [agencyFilter, categoryFilter, page, search, verificationFilter])

  useEffect(() => {
    fetchOnlineTradies()
  }, [fetchOnlineTradies])

  useEffect(() => {
    const interval = setInterval(() => fetchOnlineTradies(true), REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchOnlineTradies])

  useEffect(() => {
    const socket = getSocket() ?? connectSocket()
    let refreshTimeout: ReturnType<typeof setTimeout> | null = null

    const syncConnectionState = () => setIsRealtimeConnected(socket.connected)
    const handleStatusChanged = () => {
      if (refreshTimeout) clearTimeout(refreshTimeout)
      refreshTimeout = setTimeout(() => fetchOnlineTradies(true), 250)
    }

    syncConnectionState()
    socket.on('connect', syncConnectionState)
    socket.on('disconnect', syncConnectionState)
    socket.on('admin:tradie_status_changed', handleStatusChanged)

    return () => {
      if (refreshTimeout) clearTimeout(refreshTimeout)
      socket.off('connect', syncConnectionState)
      socket.off('disconnect', syncConnectionState)
      socket.off('admin:tradie_status_changed', handleStatusChanged)
    }
  }, [fetchOnlineTradies])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const categoryOptions = useMemo(
    () => VALID_CATEGORIES.map(category => ({
      value: category,
      label: TRADIE_CATEGORY_LABELS[category],
    })),
    []
  )

  const applySearch = () => {
    setSearch(searchInput.trim())
    setPage(1)
  }

  const resetFilters = () => {
    setSearch('')
    setSearchInput('')
    setCategoryFilter('all')
    setVerificationFilter('all')
    setAgencyFilter('all')
    setPage(1)
  }

  const hasFilters = search || categoryFilter !== 'all' || verificationFilter !== 'all' || agencyFilter !== 'all'

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Radio className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Online Tradies</h1>
              <p className="mt-0.5 text-sm text-gray-400">Tradies connected now and available for jobs</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-medium ${
            isRealtimeConnected
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-gray-200 bg-gray-50 text-gray-500'
          }`}>
            <span className={`h-2 w-2 rounded-full ${isRealtimeConnected ? 'bg-emerald-500' : 'bg-gray-400'}`} />
            Live updates
          </span>
          {lastUpdated && (
            <span className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-gray-500">
              Updated {timeAgo(lastUpdated)}
            </span>
          )}
          <button
            onClick={() => fetchOnlineTradies(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 xl:flex-row">
          <div className="flex min-w-0 flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') applySearch()
                }}
                placeholder="Search name, email, phone, or FIX-ID..."
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
            <button
              onClick={applySearch}
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8]"
            >
              Search
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:w-[560px]">
            <select
              value={categoryFilter}
              onChange={(event) => { setCategoryFilter(event.target.value as 'all' | TradieCategory); setPage(1) }}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="all">All categories</option>
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select
              value={verificationFilter}
              onChange={(event) => { setVerificationFilter(event.target.value as BooleanFilter); setPage(1) }}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="all">All verification</option>
              <option value="true">Verified only</option>
              <option value="false">Not verified</option>
            </select>
            <select
              value={agencyFilter}
              onChange={(event) => { setAgencyFilter(event.target.value as BooleanFilter); setPage(1) }}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="all">All tradies</option>
              <option value="false">Individual</option>
              <option value="true">Agency</option>
            </select>
          </div>
        </div>
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="mt-3 text-xs font-medium text-gray-500 hover:text-gray-700"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-gray-400">
          {isLoading ? 'Loading online tradies...' : `${total} live online ${total === 1 ? 'tradie' : 'tradies'}`}
        </p>
        {isStale && error && <p className="text-xs font-medium text-amber-600">{error}</p>}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white lg:block">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-[#2563EB]" />
          </div>
        ) : tradies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <User className="mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-400">No online tradies found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Tradie</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Categories</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Quality</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Active Job</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">Location Update</th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tradies.map(tradie => (
                  <tr key={tradie.userId} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <TradieAvatar tradie={tradie} />
                        <div className="min-w-0">
                          <Link href={`/admin/users/${tradie.userId}`} className="group">
                            <p className="truncate font-semibold text-gray-800 group-hover:text-[#2563EB]">{tradie.name}</p>
                            <p className="truncate text-[10px] text-gray-400">{tradie.email}</p>
                          </Link>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Connected {timeAgo(tradie.liveConnectedAt || tradie.onlineUpdatedAt)}
                            </span>
                            {tradie.fixId && <span className="text-[10px] font-mono text-gray-400">{tradie.fixId}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <CategoryBadges categories={tradie.categories} />
                      <p className="mt-1 text-[10px] capitalize text-gray-400">{tradie.skillLevel}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Star className="h-3.5 w-3.5 text-amber-400" />
                          <span>{tradie.rating.average.toFixed(1)} ({tradie.rating.count})</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          <span>{tradie.jobSuccessRate}% success</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {tradie.isFullyVerified && (
                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">Verified</span>
                          )}
                          {tradie.isAgencyTradie && (
                            <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700">Agency</span>
                          )}
                          {!tradie.isActive && (
                            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600">Banned</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="max-w-[260px] px-4 py-3">
                      <ActiveJob tradie={tradie} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-1.5 text-xs text-gray-600">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <div>
                          <p className="font-medium">{timeAgo(tradie.lastLocationUpdatedAt)}</p>
                          <p className="text-[10px] text-gray-400">{formatDateTime(tradie.lastLocationUpdatedAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/users/${tradie.userId}`}
                          className="rounded-lg bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
                        >
                          User
                        </Link>
                        <Link
                          href={`/admin/tradies/${tradie.userId}`}
                          className="rounded-lg bg-[#EFF6FF] px-2.5 py-1 text-[10px] font-medium text-[#2563EB] transition-colors hover:bg-blue-100"
                        >
                          Profile
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="space-y-3 lg:hidden">
        {isLoading ? (
          <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-16">
            <Loader2 className="h-5 w-5 animate-spin text-[#2563EB]" />
          </div>
        ) : tradies.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16">
            <User className="mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-400">No online tradies found</p>
          </div>
        ) : (
          tradies.map(tradie => <TradieCard key={tradie.userId} tradie={tradie} />)
        )}
      </div>

      {total > PAGE_SIZE && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPage(current => Math.max(1, current - 1))}
            disabled={page === 1}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-xs text-gray-400">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(current => current + 1)}
            disabled={page >= totalPages}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
