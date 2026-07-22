// fixes-web/app/admin/variations/page.tsx

'use client'

import { type ComponentType, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  HelpCircle,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  RotateCcw,
  Send,
  XCircle,
} from 'lucide-react'
import { api } from '@/lib/api'
import AdminActionConfirmDialog from '@/components/admin/AdminActionConfirmDialog'

type ScopeChangeStatus =
  | 'pending_admin_review'
  | 'pending_client'
  | 'accepted'
  | 'declined'
  | 'admin_requested_changes'
  | 'admin_rejected'
  | 'proof_submitted'

type ActionType = 'send' | 'request_updates' | 'reject'

interface Variation {
  _id: string
  status: ScopeChangeStatus
  description: string
  photos?: { url: string; publicId: string }[]
  estimatedExtraCost?: number | null
  originalPrice: number
  newPrice: number
  priceDifference: number
  gstAmount?: number
  totalIncGst?: number
  adminNotes?: string | null
  createdAt: string
  clientSentAt?: string | null
  jobId?: {
    _id: string
    jobCode: string
    title: string
    status: string
    category: string
    selectedTier?: string
    clientId?: { name?: string; email?: string; fixId?: string }
    assignedTradieId?: { name?: string; email?: string; fixId?: string }
    payment?: { amount?: number; gstAmount?: number; status?: string }
  }
  requestedBy?: { name?: string; email?: string; fixId?: string }
  adminReviewedBy?: { name?: string; email?: string; fixId?: string } | null
  newQuoteOptions?: Array<{
    tier: string
    suggestedFixedPrice: number
    gstAmount?: number
    totalIncGst?: number
    estimatedHours?: { min: number; max: number }
    price?: { min: number; max: number; currency: string }
    reasoning?: string
  }>
}

type QuoteOption = NonNullable<Variation['newQuoteOptions']>[number]

const STATUS_CONFIG: Record<ScopeChangeStatus, { label: string; classes: string; icon: ComponentType<{ className?: string }> }> = {
  pending_admin_review: { label: 'Fixes Review', classes: 'bg-blue-100 text-blue-700', icon: Clock },
  pending_client: { label: 'Client Review', classes: 'bg-amber-100 text-amber-700', icon: Send },
  accepted: { label: 'Accepted', classes: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  declined: { label: 'Client Declined', classes: 'bg-red-100 text-red-700', icon: XCircle },
  admin_requested_changes: { label: 'Needs Updates', classes: 'bg-purple-100 text-purple-700', icon: RotateCcw },
  admin_rejected: { label: 'Rejected', classes: 'bg-gray-100 text-gray-700', icon: XCircle },
  proof_submitted: { label: 'Proof Submitted', classes: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
}

const FILTERS: Array<'all' | ScopeChangeStatus> = [
  'pending_admin_review',
  'pending_client',
  'accepted',
  'declined',
  'admin_requested_changes',
  'admin_rejected',
  'proof_submitted',
  'all',
]

function money(value?: number | null) {
  return `$${(Number(value) || 0).toFixed(2)}`
}

function fmt(iso?: string | null) {
  if (!iso) return 'Not set'
  return new Date(iso).toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function quoteTotal(option?: QuoteOption) {
  const subtotal = Number(option?.suggestedFixedPrice) || 0
  const gst = Number(option?.gstAmount) > 0 ? Number(option?.gstAmount) : Math.round(subtotal * 0.1 * 100) / 100
  return Number(option?.totalIncGst) > 0 ? Number(option?.totalIncGst) : Math.round((subtotal + gst) * 100) / 100
}

export default function AdminVariationsPage() {
  const [items, setItems] = useState<Variation[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | ScopeChangeStatus>('pending_admin_review')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [guideOpen, setGuideOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<ActionType>('send')
  const [selected, setSelected] = useState<Variation | null>(null)
  const [reviewForm, setReviewForm] = useState({
    suggestedFixedPrice: '',
    estimatedHoursMin: '',
    estimatedHoursMax: '',
    priceMin: '',
    priceMax: '',
    reasoning: '',
    adminNotes: '',
  })

  const loadItems = async (status = statusFilter) => {
    setLoading(true)
    setError('')
    try {
      const qs = new URLSearchParams({ status, limit: '150' })
      const res = await api.get<{ scopeChanges: Variation[] }>(`/api/admin/scope-changes?${qs}`)
      setItems(res.data.scopeChanges || [])
    } catch (err: any) {
      setError(err?.message || 'Failed to load variations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadItems() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const counts = useMemo(() => {
    return items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [items])

  const hydrateReviewForm = (item: Variation) => {
    const option = item.newQuoteOptions?.[0]
    setReviewForm({
      suggestedFixedPrice: option?.suggestedFixedPrice ? String(option.suggestedFixedPrice) : '',
      estimatedHoursMin: option?.estimatedHours?.min != null ? String(option.estimatedHours.min) : '',
      estimatedHoursMax: option?.estimatedHours?.max != null ? String(option.estimatedHours.max) : '',
      priceMin: option?.price?.min != null ? String(option.price.min) : '',
      priceMax: option?.price?.max != null ? String(option.price.max) : '',
      reasoning: option?.reasoning || '',
      adminNotes: item.adminNotes || '',
    })
  }

  const openReview = (item: Variation, action: ActionType) => {
    setSelected(item)
    setPendingAction(action)
    setDialogOpen(true)
  }

  const executeAction = async (token: string) => {
    if (!selected) return
    const endpoint = pendingAction === 'send'
      ? `/api/admin/scope-changes/${selected._id}/send-to-client`
      : pendingAction === 'request_updates'
        ? `/api/admin/scope-changes/${selected._id}/request-updates`
        : `/api/admin/scope-changes/${selected._id}/reject`

    await api.raw(endpoint, {
      method: 'PATCH',
      headers: { 'X-Admin-Action-Token': token },
      body: pendingAction === 'send'
        ? {
            suggestedFixedPrice: reviewForm.suggestedFixedPrice,
            estimatedHoursMin: reviewForm.estimatedHoursMin,
            estimatedHoursMax: reviewForm.estimatedHoursMax,
            priceMin: reviewForm.priceMin,
            priceMax: reviewForm.priceMax,
            reasoning: reviewForm.reasoning,
            adminNotes: reviewForm.adminNotes,
          }
        : { adminNotes: reviewForm.adminNotes },
    })
    setDialogOpen(false)
    setSelected(null)
    await loadItems()
  }

  const actionMeta = {
    send: {
      action: 'scope_change:send_to_client',
      title: 'Send Variation To Client',
      description: 'Confirm the reviewed quote and send it to the client for approval/payment difference.',
      label: 'Send to Client',
    },
    request_updates: {
      action: 'scope_change:request_updates',
      title: 'Request Tradie Updates',
      description: 'Close this review and ask the tradie to submit clearer variation details.',
      label: 'Request Updates',
    },
    reject: {
      action: 'scope_change:reject',
      title: 'Reject Variation',
      description: 'Reject this variation and return the job to the original agreed scope.',
      label: 'Reject Variation',
    },
  }[pendingAction]

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--upwork-navy) flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            Variation Review
            <button
              onClick={() => setGuideOpen(v => !v)}
              className="p-1 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50"
              title="How variation review works"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </h1>
          <p className="text-sm text-(--upwork-gray)">Review tradie-submitted variations before any updated quote reaches the client.</p>
        </div>
        <button
          onClick={() => loadItems()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-(--upwork-gray) hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {guideOpen && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
          <p className="font-semibold mb-2">Review flow</p>
          <div className="grid md:grid-cols-4 gap-3">
            <div className="bg-white/70 rounded-lg p-3">1. Tradie submits notes, photos, and optional rough cost.</div>
            <div className="bg-white/70 rounded-lg p-3">2. Fixes reviews and adjusts the quote if needed.</div>
            <div className="bg-white/70 rounded-lg p-3">3. Client approves the reviewed quote and pays only the balance, or gets a lower adjusted capture amount.</div>
            <div className="bg-white/70 rounded-lg p-3">4. Declines move into proof/dispute handling instead of auto-paying the new scope.</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {FILTERS.map(status => {
          const label = status === 'all' ? 'All' : STATUS_CONFIG[status].label
          return (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); loadItems(status) }}
              className={`bg-white border rounded-xl p-3 text-left hover:border-blue-500 ${statusFilter === status ? 'border-blue-500 shadow-sm' : 'border-gray-200'}`}
            >
              <p className="text-xl font-bold text-(--upwork-navy)">{status === 'all' ? items.length : counts[status] || 0}</p>
              <p className="text-xs text-(--upwork-gray)">{label}</p>
            </button>
          )
        })}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center text-(--upwork-gray)">No variations found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map(item => {
              const cfg = STATUS_CONFIG[item.status]
              const StatusIcon = cfg.icon
              const option = item.newQuoteOptions?.[0]
              const originalTotal = Number(item.jobId?.payment?.amount) > 0
                ? Number(item.jobId?.payment?.amount)
                : Math.round(item.originalPrice * 1.1 * 100) / 100
              const reviewedTotal = quoteTotal(option)
              const diff = Number(item.priceDifference) || Math.round((reviewedTotal - originalTotal) * 100) / 100
              const isExpanded = expandedId === item._id
              const canReview = item.status === 'pending_admin_review'

              return (
                <div key={item._id} className="p-4">
                  <button
                    onClick={() => {
                      if (isExpanded) {
                        setExpandedId(null)
                      } else {
                        hydrateReviewForm(item)
                        setExpandedId(item._id)
                      }
                    }}
                    className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-left"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.classes}`}>
                          <StatusIcon className="w-3.5 h-3.5" /> {cfg.label}
                        </span>
                        <span className="font-semibold text-(--upwork-navy)">{item.jobId?.jobCode || 'Unknown job'}</span>
                        <span className="text-xs text-gray-400">{fmt(item.createdAt)}</span>
                      </div>
                      <p className="font-semibold text-gray-900 truncate">{item.jobId?.title || 'Variation'}</p>
                      <p className="text-sm text-gray-500 truncate">{item.description}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-right shrink-0">
                      <div>
                        <p className="text-[10px] uppercase text-gray-400 font-semibold">Original</p>
                        <p className="text-sm font-bold text-gray-800">{money(originalTotal)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-gray-400 font-semibold">Reviewed</p>
                        <p className="text-sm font-bold text-gray-800">{money(reviewedTotal)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-gray-400 font-semibold">Difference</p>
                        <p className={`text-sm font-bold ${diff > 0 ? 'text-red-600' : diff < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                          {diff > 0 ? '+' : diff < 0 ? '-' : ''}{money(Math.abs(diff))}
                        </p>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-4 grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
                      <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                            <p className="text-xs font-semibold text-gray-500 mb-1">Client</p>
                            <p className="font-medium text-gray-900">{item.jobId?.clientId?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{item.jobId?.clientId?.email}</p>
                          </div>
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                            <p className="text-xs font-semibold text-gray-500 mb-1">Tradie</p>
                            <p className="font-medium text-gray-900">{item.jobId?.assignedTradieId?.name || item.requestedBy?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{item.jobId?.assignedTradieId?.email || item.requestedBy?.email}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2">Tradie variation notes</p>
                          <div className="border border-gray-200 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap">{item.description}</div>
                        </div>

                        {typeof item.estimatedExtraCost === 'number' && (
                          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex justify-between text-sm">
                            <span className="text-amber-800 font-semibold">Tradie rough cost</span>
                            <span className="text-amber-900 font-bold">{money(item.estimatedExtraCost)} AUD</span>
                          </div>
                        )}

                        {item.photos?.length ? (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 mb-2">Variation photos</p>
                            <div className="flex flex-wrap gap-2">
                              {item.photos.map((photo, idx) => (
                                <a key={photo.publicId || idx} href={photo.url} target="_blank" rel="noopener noreferrer" className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                  <img src={photo.url} alt={`Variation photo ${idx + 1}`} className="w-full h-full object-cover" />
                                </a>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 border border-dashed border-gray-200 rounded-xl p-4 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" /> No photos attached
                          </div>
                        )}
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900">Reviewed quote</p>
                          <Link href={item.jobId?._id ? `/admin/jobs/${item.jobId._id}` : '/admin/jobs'} className="text-xs font-semibold text-blue-600 hover:underline">
                            Open job
                          </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <label className="text-xs font-semibold text-gray-600">
                            Subtotal
                            <input className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" value={reviewForm.suggestedFixedPrice} onChange={e => setReviewForm(v => ({ ...v, suggestedFixedPrice: e.target.value }))} disabled={!canReview} />
                          </label>
                          <label className="text-xs font-semibold text-gray-600">
                            Price range min
                            <input className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" value={reviewForm.priceMin} onChange={e => setReviewForm(v => ({ ...v, priceMin: e.target.value }))} disabled={!canReview} />
                          </label>
                          <label className="text-xs font-semibold text-gray-600">
                            Hours min
                            <input className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" value={reviewForm.estimatedHoursMin} onChange={e => setReviewForm(v => ({ ...v, estimatedHoursMin: e.target.value }))} disabled={!canReview} />
                          </label>
                          <label className="text-xs font-semibold text-gray-600">
                            Hours max
                            <input className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" value={reviewForm.estimatedHoursMax} onChange={e => setReviewForm(v => ({ ...v, estimatedHoursMax: e.target.value }))} disabled={!canReview} />
                          </label>
                        </div>
                        <label className="text-xs font-semibold text-gray-600 block">
                          Client-facing quote reasoning
                          <textarea className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-20" value={reviewForm.reasoning} onChange={e => setReviewForm(v => ({ ...v, reasoning: e.target.value }))} disabled={!canReview} />
                        </label>
                        <label className="text-xs font-semibold text-gray-600 block">
                          Admin notes
                          <textarea className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-20" value={reviewForm.adminNotes} onChange={e => setReviewForm(v => ({ ...v, adminNotes: e.target.value }))} disabled={!canReview && !['pending_client', 'accepted', 'declined'].includes(item.status)} />
                        </label>

                        {canReview ? (
                          <div className="grid sm:grid-cols-3 gap-2 pt-2">
                            <button onClick={() => openReview(item, 'send')} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-600 text-white text-xs font-bold px-3 py-2 hover:bg-green-700">
                              <Send className="w-3.5 h-3.5" /> Send
                            </button>
                            <button onClick={() => openReview(item, 'request_updates')} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold px-3 py-2 hover:bg-amber-600">
                              <RotateCcw className="w-3.5 h-3.5" /> Updates
                            </button>
                            <button onClick={() => openReview(item, 'reject')} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 text-white text-xs font-bold px-3 py-2 hover:bg-red-700">
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 pt-2">This variation is not waiting for admin review.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <AdminActionConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        action={actionMeta.action}
        title={actionMeta.title}
        description={actionMeta.description}
        confirmLabel={actionMeta.label}
        onConfirm={executeAction}
        onSuccess={() => {}}
      />
    </div>
  )
}
