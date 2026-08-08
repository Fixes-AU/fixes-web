// fixes-web/app/admin/page.tsx

'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  Users,
  Briefcase,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Radio,
  Wifi,
  WifiOff,
} from 'lucide-react'
import { api } from '@/lib/api'
import { publishAdminOnlineTradiesCount } from '@/lib/admin-online-tradies-events'
import { connectSocket, getSocket } from '@/lib/socket'
import type { AdminStats } from '@/lib/types'

const REFRESH_INTERVAL_MS = 30_000 

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isStale, setIsStale] = useState(false)
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)
  const statsRef = useRef<AdminStats | null>(null)
  const requestInFlightRef = useRef(false)
  const pendingRefreshRef = useRef(false)

  const load = useCallback(async (silent = false) => {
    if (requestInFlightRef.current) {
      pendingRefreshRef.current = true
      return
    }

    requestInFlightRef.current = true
    if (!silent) setIsLoading(true)
    else setIsRefreshing(true)

    try {
      const res = await api.get<AdminStats>('/api/admin/stats')
      statsRef.current = res.data
      setStats(res.data)
      publishAdminOnlineTradiesCount(res.data.tradies.online)
      setLastUpdated(new Date())
      setLoadError(null)
      setIsStale(false)
    } catch {
      const hasPreviousData = statsRef.current !== null
      setLoadError(
        hasPreviousData
          ? 'Could not refresh the latest dashboard data. Showing the last successful update.'
          : 'Could not load dashboard data. Check your connection and try again.'
      )
      setIsStale(hasPreviousData)
    } finally {
      requestInFlightRef.current = false
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!isLoading && !isRefreshing && pendingRefreshRef.current) {
      pendingRefreshRef.current = false
      load(true)
    }
  }, [isLoading, isRefreshing, load])

  useEffect(() => {
    const interval = setInterval(() => load(true), REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [load])

  useEffect(() => {
    const socket = getSocket() ?? connectSocket()
    let refreshTimeout: ReturnType<typeof setTimeout> | null = null

    const handleConnect = () => {
      setIsRealtimeConnected(true)
      if (statsRef.current) load(true)
    }
    const handleDisconnect = () => setIsRealtimeConnected(false)
    const handleConnectError = () => setIsRealtimeConnected(false)
    const handleTradieStatusChanged = () => {
      if (refreshTimeout) clearTimeout(refreshTimeout)
      refreshTimeout = setTimeout(() => load(true), 250)
    }

    setIsRealtimeConnected(socket.connected)
    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)
    socket.on('admin:tradie_status_changed', handleTradieStatusChanged)

    return () => {
      if (refreshTimeout) clearTimeout(refreshTimeout)
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)
      socket.off('admin:tradie_status_changed', handleTradieStatusChanged)
    }
  }, [load])

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center py-24">
        <div
          className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin"
          role="status"
          aria-label="Loading dashboard"
        />
      </div>
    )
  }

  if (!stats) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Platform overview and key metrics</p>
        </div>
        <div className="max-w-xl rounded-xl border border-red-200 bg-red-50 p-5" role="alert">
          <p className="text-sm font-semibold text-red-700">Dashboard unavailable</p>
          <p className="mt-1 text-sm text-red-600">
            {loadError ?? 'Could not load dashboard data. Check your connection and try again.'}
          </p>
          <button
            onClick={() => load()}
            disabled={isLoading}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Retry
          </button>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats.users.total,
      sub: `${stats.users.clients} clients • ${stats.users.tradies} tradies`,
      icon: Users,
      iconBg: 'bg-[#EFF6FF]',
      iconColor: 'text-[#2563EB]',
    },
    {
      label: 'Total Jobs',
      value: stats.jobs.total,
      sub: `${stats.jobs.active} active • ${stats.jobs.completed} done`,
      icon: Briefcase,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Pending Verification',
      value: stats.tradies.pendingVerification,
      sub: `${stats.tradies.fullyVerified} fully verified`,
      icon: ShieldCheck,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Revenue',
      value: `$${stats.revenue.totalRevenue.toLocaleString()}`,
      sub: `$${stats.revenue.platformFee.toLocaleString()} platform fee`,
      icon: DollarSign,
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
    },
  ]

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Platform overview and key metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`hidden sm:inline-flex items-center gap-1.5 text-xs ${
              isRealtimeConnected ? 'text-emerald-600' : 'text-amber-600'
            }`}
            title={
              isRealtimeConnected
                ? 'Availability changes update in realtime'
                : 'Realtime updates unavailable; dashboard continues polling every 30 seconds'
            }
          >
            {isRealtimeConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {isRealtimeConnected ? 'Live updates' : '30s polling'}
          </span>
          {lastUpdated && (
            <span className="text-xs text-gray-400 hidden sm:block">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => load(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {loadError && isStale && (
        <div
          className="mb-4 flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <p className="text-xs text-amber-700">{loadError}</p>
          <button
            onClick={() => load(true)}
            disabled={isRefreshing}
            className="self-start text-xs font-semibold text-amber-700 underline-offset-2 hover:underline disabled:opacity-50 sm:self-auto"
          >
            Retry now
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-400">{card.label}</span>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-[11px] text-gray-400 mt-1">{card.sub}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: 'Online Tradies',
            value: stats.tradies.online,
            sub: stats.tradies.online === 0 ? 'No tradies online' : 'Available for jobs',
            icon: Radio,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            isLiveMetric: true,
          },
          { label: 'Completed Payments', value: stats.revenue.completedPayments, sub: undefined, icon: TrendingUp, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', isLiveMetric: false },
          { label: 'Tradie Earnings', value: `$${stats.revenue.tradieEarnings.toLocaleString()}`, sub: undefined, icon: DollarSign, iconBg: 'bg-[#EFF6FF]', iconColor: 'text-[#2563EB]', isLiveMetric: false },
          { label: 'Cancelled Jobs', value: stats.jobs.cancelled, sub: undefined, icon: AlertTriangle, iconBg: 'bg-red-50', iconColor: 'text-red-500', isLiveMetric: false },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.iconBg}`}>
                <Icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 mb-0.5">{item.label}</p>
                <p
                  className="text-xl font-bold text-gray-900"
                  aria-live={item.isLiveMetric ? 'polite' : undefined}
                  aria-atomic={item.isLiveMetric ? 'true' : undefined}
                  aria-label={item.isLiveMetric ? `${item.label}: ${item.value}` : undefined}
                >
                  {item.value}
                </p>
                {item.sub && <p className="mt-0.5 text-[10px] text-gray-400">{item.sub}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
