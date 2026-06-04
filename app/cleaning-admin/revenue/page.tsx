'use client'

import { useEffect, useState } from 'react'
import { BarChart3, Loader2, Download, DollarSign, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'

interface RevenueData {
  period: string
  totalRevenue: number
  totalJobs: number
  totalPaidOut: number
  platformCommission: number
  breakdown: { date: string; revenue: number; jobs: number }[]
}

interface ApiRevenueReport {
  period: { start: string; end: string }
  summary: {
    totalPayments: number
    totalClientPayments: number
    totalCleanerPayouts: number
    totalPlatformFees: number
  }
  payments: { amount: number; date: string }[]
}

function getDateRange(period: 'week' | 'month' | 'quarter') {
  const end = new Date()
  const start = new Date()
  if (period === 'week') {
    start.setDate(end.getDate() - 7)
  } else if (period === 'quarter') {
    start.setMonth(end.getMonth() - 3)
  } else {
    start.setDate(1)
  }
  return { start, end }
}

function mapReportToRevenue(period: 'week' | 'month' | 'quarter', data: ApiRevenueReport): RevenueData {
  const breakdownMap = new Map<string, { revenue: number; jobs: number }>()
  for (const p of data.payments ?? []) {
    const date = new Date(p.date).toISOString().split('T')[0]
    const existing = breakdownMap.get(date) ?? { revenue: 0, jobs: 0 }
    breakdownMap.set(date, { revenue: existing.revenue + p.amount, jobs: existing.jobs + 1 })
  }
  const breakdown = Array.from(breakdownMap.entries())
    .map(([date, v]) => ({ date, revenue: v.revenue, jobs: v.jobs }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const s = data.summary
  return {
    period,
    totalRevenue: s.totalClientPayments ?? 0,
    totalJobs: s.totalPayments ?? 0,
    totalPaidOut: s.totalCleanerPayouts ?? 0,
    platformCommission: s.totalPlatformFees ?? 0,
    breakdown,
  }
}

export default function RevenuePage() {
  const [revenue, setRevenue] = useState<RevenueData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month')

  useEffect(() => {
    setIsLoading(true)
    const { start, end } = getDateRange(period)
    const qs = `?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
    api.get<ApiRevenueReport>(`/api/cleaning-admin/revenue${qs}`)
      .then((res) => setRevenue(mapReportToRevenue(period, res.data)))
      .catch(() => setRevenue(null))
      .finally(() => setIsLoading(false))
  }, [period])

  const handleExportCSV = () => {
    if (!revenue) return
    const rows = [['Date', 'Revenue ($)', 'Jobs']]
    revenue.breakdown.forEach((d) => {
      rows.push([d.date, d.revenue.toFixed(2), String(d.jobs)])
    })
    rows.push([])
    rows.push(['Total Revenue', revenue.totalRevenue.toFixed(2), String(revenue.totalJobs)])
    rows.push(['Total Paid Out', revenue.totalPaidOut.toFixed(2), ''])
    rows.push(['Platform Commission', revenue.platformCommission.toFixed(2), ''])

    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cleaning-revenue-${period}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Revenue Report</h1>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(['week', 'month', 'quarter'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                  period === p ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={handleExportCSV}
            disabled={!revenue}
            className="flex items-center gap-1.5 bg-teal-600 text-white text-sm font-medium py-2 px-4 rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-teal-600 animate-spin" /></div>
      ) : !revenue ? (
        <div className="bg-white border border-gray-200 rounded-xl flex flex-col items-center justify-center py-16">
          <BarChart3 className="w-8 h-8 text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">No revenue data available</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-teal-600" />
                <span className="text-xs text-gray-500">Total Revenue</span>
              </div>
              <p className="text-xl font-bold text-gray-800">${revenue.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-500">Total Jobs</span>
              </div>
              <p className="text-xl font-bold text-gray-800">{revenue.totalJobs}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-gray-500">Paid to Cleaners</span>
              </div>
              <p className="text-xl font-bold text-gray-800">${revenue.totalPaidOut.toFixed(2)}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-500">Platform Commission</span>
              </div>
              <p className="text-xl font-bold text-gray-800">${revenue.platformCommission.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-800">Daily Breakdown</h2>
            </div>
            {revenue.breakdown.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No payments in this period</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase">Jobs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {revenue.breakdown.map((row) => (
                    <tr key={row.date} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-sm text-gray-700">{new Date(row.date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-800 text-right font-medium">${row.revenue.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-sm text-gray-600 text-right">{row.jobs}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t border-gray-200">
                    <td className="px-4 py-2.5 text-sm font-semibold text-gray-800">Total</td>
                    <td className="px-4 py-2.5 text-sm font-bold text-teal-600 text-right">${revenue.totalRevenue.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-sm font-semibold text-gray-600 text-right">{revenue.totalJobs}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
