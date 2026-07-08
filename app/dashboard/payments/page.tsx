// fixes-web/app/dashboard/payments/page.tsx

'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Receipt, Loader2, Clock, CheckCircle2, ArrowDownCircle,
  AlertTriangle, RefreshCw, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { api } from '@/lib/api'

interface PopulatedJob {
  _id: string
  jobCode: string
  title: string
  category: string
  status: string
}

interface PaymentItem {
  _id: string
  paymentRef: string
  jobId: PopulatedJob | null
  amount: number
  platformFee: number
  tradieEarnings: number
  status: string
  cancellationFeeAmount: number
  cancellationRefundAmount: number
  createdAt: string
  capturedAt: string | null
  releasedAt: string | null
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
  pending: { label: 'Authorised', style: 'bg-amber-50 text-amber-600' },
  captured: { label: 'Captured', style: 'bg-blue-50 text-blue-600' },
  released: { label: 'Paid', style: 'bg-emerald-50 text-emerald-600' },
  refunded: { label: 'Refunded', style: 'bg-gray-100 text-gray-500' },
  disputed: { label: 'Disputed', style: 'bg-red-50 text-red-600' },
  requires_manual_review: { label: 'Processing', style: 'bg-orange-50 text-orange-600' },
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)

  const fetchPayments = useCallback(async (p: number) => {
    setIsLoading(true)
    try {
      const res = await api.raw<{
        success: boolean
        data: PaymentItem[]
        pagination: PaginationInfo
      }>(`/api/payments/history?page=${p}&limit=15`)
      setPayments(res.data || [])
      setPagination(res.pagination || null)
    } catch {
      // silent
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPayments(page)
  }, [page, fetchPayments])

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })

  const formatAmount = (amount: number) => `$${amount.toFixed(2)} AUD`

  const totalSpent = payments.reduce((sum, p) => {
    if (p.status === 'refunded') return sum
    return sum + p.amount
  }, 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-400 mt-0.5">Your payment transaction history</p>
      </div>

      {!isLoading && payments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400 font-medium mb-1">Total Payments</p>
            <p className="text-2xl font-bold text-gray-900">{pagination?.total || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400 font-medium mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400 font-medium mb-1">Showing</p>
            <p className="text-2xl font-bold text-gray-900">Page {page} of {pagination?.totalPages || 1}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 text-[#2563EB] animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Receipt className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-700">No Payments Yet</p>
            <p className="text-xs text-gray-400 mt-1">Your payment history will appear here once you book a job.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Job</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Ref</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => {
                  const config = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending
                  return (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]">{p.jobId?.title || 'Unknown'}</p>
                        <p className="text-[10px] text-gray-400">{p.jobId?.jobCode || '—'}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-gray-400 font-mono">{p.paymentRef}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-900">{formatAmount(p.amount)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${config.style}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-gray-400">{formatDate(p.createdAt)}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex gap-3 text-[10px]">
                          {p.cancellationFeeAmount > 0 && (
                            <span className="text-amber-600">Fee: ${p.cancellationFeeAmount.toFixed(2)}</span>
                          )}
                          {p.cancellationRefundAmount > 0 && (
                            <span className="text-emerald-600">Refund: ${p.cancellationRefundAmount.toFixed(2)}</span>
                          )}
                          {p.cancellationFeeAmount === 0 && p.cancellationRefundAmount === 0 && (
                            <span className="text-gray-300">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />Previous
          </button>
          <span className="text-xs text-gray-400">Page {page} of {pagination.totalPages}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= pagination.totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-colors"
          >
            Next<ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
