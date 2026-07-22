// fixes-web/app/admin/jobs/[id]/page.tsx


'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Loader2,
  User,
  Briefcase,
  DollarSign,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Camera,
  ShieldCheck,
  Search,
  MapPin,
  UserPlus,
} from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS, CATEGORY_LABELS, TIER_LABELS } from '@/lib/constants'
import type { Job, Quote, User as UserType } from '@/lib/types'
import AdminActionConfirmDialog from '@/components/admin/AdminActionConfirmDialog'

interface Payment {
  _id: string
  stripePaymentIntentId: string
  stripeTransferId?: string | null
  stripeAgencyTransferId?: string | null
  amount: number
  platformFee: number
  tradieEarnings: number
  agencyEarnings?: number | null
  payeeType?: 'tradie' | 'agency'
  paymentChannel?: 'marketplace' | 'cleaning_agency' | 'direct_contract_agency'
  status: 'pending' | 'captured' | 'released' | 'refunded' | 'disputed' | 'requires_manual_review'
  capturedAt?: string
  releasedAt?: string
  createdAt: string
}

interface JobDetail extends Omit<Job, 'clientId' | 'assignedTradieId' | 'quote' | 'payment'> {
  clientId: UserType
  assignedTradieId: UserType | string | null
  quote: Quote | string | null
  payment: Payment | string | null
}

function ActionButton({
  label,
  description,
  icon: Icon,
  color,
  onClick,
  disabled,
  isLoading,
}: {
  label: string
  description: string
  icon: React.ElementType
  color: string
  onClick: () => void
  disabled: boolean
  isLoading: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${color}`}
    >
      <div className="flex items-center gap-3 text-left">
        <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
        </div>
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs opacity-75">{description}</p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 opacity-60 shrink-0" />
    </button>
  )
}


interface AvailableTradie {
  userId: string
  name: string
  email: string
  phone: string
  avatarUrl: string | null
  rating: { average: number; count: number }
  distance: number | null
  isOnline: boolean
  categories: string[]
}

function ManualAssignPanel({ jobId, onAssigned }: { jobId: string; onAssigned: () => void }) {
  const [tradies, setTradies] = useState<AvailableTradie[]>([])
  const [filteredTradies, setFilteredTradies] = useState<AvailableTradie[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAssigning, setIsAssigning] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [expanded, setExpanded] = useState(false)

  const fetchTradies = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const res = await api.get<AvailableTradie[]>(`/api/admin/jobs/${jobId}/available-tradies`)
      const data = Array.isArray(res.data) ? res.data : []
      setTradies(data)
      setFilteredTradies(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load tradies')
    } finally {
      setIsLoading(false)
    }
  }, [jobId])

  useEffect(() => {
    if (expanded && tradies.length === 0) fetchTradies()
  }, [expanded]) // eslint-disable-line

  useEffect(() => {
    if (!search.trim()) {
      setFilteredTradies(tradies)
    } else {
      const q = search.toLowerCase()
      setFilteredTradies(
        tradies.filter(t =>
          t.name.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q) ||
          t.phone.includes(q)
        )
      )
    }
  }, [search, tradies])

  const handleAssign = async (tradie: AvailableTradie) => {
    if (!window.confirm(`Assign ${tradie.name} to this job? This will set the job to "accepted" immediately.`)) return
    setIsAssigning(tradie.userId)
    setError('')
    setSuccess('')
    try {
      await api.post(`/api/admin/jobs/${jobId}/manual-assign`, { tradieId: tradie.userId })
      setSuccess(`✅ ${tradie.name} has been assigned to this job`)
      onAssigned()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Assignment failed')
    } finally {
      setIsAssigning(null)
    }
  }

  return (
    <div className="bg-white rounded-xl border-2 border-blue-200 p-5 mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-left">
            <h2 className="text-sm font-semibold text-gray-900">Assign Tradie Manually</h2>
            <p className="text-[11px] text-gray-400">Select a verified tradie to assign directly</p>
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <div className="mt-4 space-y-3">
          {success && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              {success}
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 text-gray-800 placeholder:text-gray-400"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            </div>
          ) : filteredTradies.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">
              {tradies.length === 0 ? 'No verified tradies found for this category' : 'No tradies match your search'}
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredTradies.map((tradie) => (
                <div
                  key={tradie.userId}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                        {tradie.avatarUrl ? (
                          <img src={tradie.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${tradie.isOnline ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{tradie.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span className={tradie.isOnline ? 'text-green-600 font-medium' : ''}>
                          {tradie.isOnline ? 'Online' : 'Offline'}
                        </span>
                        {tradie.distance != null && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            {tradie.distance}km
                          </span>
                        )}
                        {tradie.rating.count > 0 && (
                          <span>⭐ {tradie.rating.average} ({tradie.rating.count})</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAssign(tradie)}
                    disabled={isAssigning !== null}
                    className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center gap-1.5"
                  >
                    {isAssigning === tradie.userId ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <UserPlus className="w-3 h-3" />
                    )}
                    Assign
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-[10px] text-gray-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Assigning sets the job to &ldquo;accepted&rdquo; immediately. The tradie will be notified in their app.
          </p>
        </div>
      )}
    </div>
  )
}


export default function AdminJobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [job, setJob] = useState<JobDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [pendingAction, setPendingAction] = useState<{ key: string; endpoint: string; method: 'post' | 'patch'; actionName: string; title: string; description: string } | null>(null)

  const fetchJob = useCallback(async () => {
    try {
      const res = await api.get<{ job: JobDetail }>(`/api/admin/jobs/${jobId}`)
      setJob(res.data.job)
    } catch {
      setMessage({ type: 'error', text: 'Failed to load job' })
    } finally {
      setIsLoading(false)
    }
  }, [jobId])

  useEffect(() => { fetchJob() }, [fetchJob])

  const requestAction = (key: string, endpoint: string, actionName: string, title: string, description: string, method: 'post' | 'patch' = 'post') => {
    setMessage(null)
    setPendingAction({ key, endpoint, method, actionName, title, description })
  }

  const executeAction = async (token: string) => {
    if (!pendingAction) return
    const { key, endpoint, method } = pendingAction
    setActionLoading(key)
    try {
      await api.raw(endpoint, {
        method: method.toUpperCase() as 'POST' | 'PATCH',
        headers: { 'X-Admin-Action-Token': token },
      })
      setMessage({ type: 'success', text: getSuccessMessage(key) })
      await fetchJob()
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Action failed'
      setMessage({ type: 'error', text: msg })
    } finally {
      setActionLoading(null)
    }
  }

  const getSuccessMessage = (action: string) => {
    switch (action) {
      case 'simulate-accept': return '✅ Tradie acceptance simulated — job is now Accepted'
      case 'simulate-complete': return '✅ Job marked as Completed — Capture is now available'
      case 'capture': return payment?.payeeType === 'agency'
        ? '✅ Payment captured — agency transfer initiated'
        : '✅ Payment captured — tradie wallet credited'
      case 'repair-wallet': return payment?.payeeType === 'agency'
        ? '✅ Agency transfer repaired'
        : '✅ Wallet repaired — tradie credited and Stripe transfer initiated'
      default: return '✅ Done'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
      </div>
    )
  }

  if (!job) {
    return <p className="text-sm text-gray-400 py-10 text-center">Job not found</p>
  }

  const payment = typeof job.payment === 'object' && job.payment ? job.payment as Payment : null
  const quote = typeof job.quote === 'object' && job.quote ? job.quote as Quote : null
  const selectedOption = quote?.options?.find(o => o.tier === job.selectedTier) || quote?.options?.[0]
  const quoteTotal = selectedOption
    ? Number(selectedOption.totalIncGst) > 0
      ? Number(selectedOption.totalIncGst)
      : Math.round((Number(selectedOption.suggestedFixedPrice) || 0) * 1.1 * 100) / 100
    : null

  const canSimulateAccept = job.status === 'dispatching'
  const canSimulateComplete = ['accepted', 'on_the_way', 'in_progress'].includes(job.status)
  const canCapture = job.status === 'completed' && payment?.status === 'pending'
  const needsWalletRepair = job.status === 'completed' && payment?.status === 'captured' && !payment?.stripeTransferId
  const isDirectAgencyContract = job.fulfillmentType === 'agency_direct_contract' || payment?.payeeType === 'agency'
  const payeeLabel = isDirectAgencyContract ? 'Agency' : 'Tradie'
  const payeeAccountLabel = isDirectAgencyContract ? 'agency Stripe account' : 'tradie wallet'
  const payeeAmount = isDirectAgencyContract
    ? (payment?.agencyEarnings ?? payment?.tradieEarnings)
    : payment?.tradieEarnings

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
          <p className="text-xs font-mono text-gray-400 mt-0.5">{job.jobCode}</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${JOB_STATUS_COLORS[job.status]}`}>
          {JOB_STATUS_LABELS[job.status] ?? job.status}
        </span>
      </div>

      {message && (
        <div className={`flex items-start gap-2 px-4 py-3 rounded-xl mb-5 text-sm ${message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
          {message.type === 'success'
            ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Job Details</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-xs text-gray-500">Category</dt>
              <dd className="text-xs font-medium text-gray-800">{CATEGORY_LABELS[job.category as keyof typeof CATEGORY_LABELS] ?? job.category}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-xs text-gray-500">Client</dt>
              <dd className="text-xs font-medium text-gray-800">{job.clientId?.name ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-xs text-gray-500">{isDirectAgencyContract ? 'Assigned Worker' : 'Assigned Tradie'}</dt>
              <dd className="text-xs font-medium text-gray-800">
                {typeof job.assignedTradieId === 'object' && job.assignedTradieId
                  ? (job.assignedTradieId as UserType).name
                  : 'Not yet assigned'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-xs text-gray-500">Quote Price</dt>
              <dd className="text-xs font-semibold text-gray-900">
                {quoteTotal != null ? `$${quoteTotal.toFixed(2)} AUD` : '—'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-xs text-gray-500">Tier Selected</dt>
              <dd className="text-xs font-semibold text-gray-900 capitalize">
                {job.selectedTier ? (TIER_LABELS[job.selectedTier] ?? job.selectedTier) : '—'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-xs text-gray-500">Location</dt>
              <dd className="text-xs text-gray-600">{job.location?.suburb}, {job.location?.state}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Payment</h2>
          {payment ? (
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-xs text-gray-500">Status</dt>
                <dd className={`text-xs font-semibold px-2 py-0.5 rounded-full ${payment.status === 'captured' ? 'bg-green-100 text-green-700' :
                    payment.status === 'refunded' ? 'bg-red-100 text-red-600' :
                      'bg-amber-100 text-amber-700'
                  }`}>
                  {payment.status === 'pending' ? 'Authorized (Escrow)' : payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-xs text-gray-500">Total Amount</dt>
                <dd className="text-xs font-semibold text-gray-900">${payment.amount} AUD</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-xs text-gray-500">Platform Fee (15%)</dt>
                <dd className="text-xs text-gray-600">${payment.platformFee} AUD</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-xs text-gray-500">{payeeLabel} Earnings</dt>
                <dd className="text-xs font-medium text-green-700">${payeeAmount ?? payment.tradieEarnings} AUD</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-xs text-gray-500">Stripe PI</dt>
                <dd className="text-[10px] font-mono text-gray-400 truncate max-w-35">{payment.stripePaymentIntentId}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-xs text-gray-400">No payment record yet</p>
          )}
        </div>
      </div>

      {(job.status === 'dispatching' || job.status === 'scheduled') && (
        <ManualAssignPanel jobId={jobId} onAssigned={fetchJob} />
      )}

      {(job.completionPhotos?.length > 0 || job.status === 'completed') && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              Proof of Work
            </h2>
            {job.completionPhotos?.length > 0 && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full font-medium">
                <ShieldCheck className="w-3 h-3" />
                {job.completionPhotos.length} photo{job.completionPhotos.length !== 1 ? 's' : ''} submitted
              </span>
            )}
          </div>

          {job.completionPhotos?.length > 0 ? (
            <>
              <p className="text-xs text-gray-400 mb-4">
                Watermarked photos captured by the tradie — each contains GPS address, timestamp, and tradie ID baked in.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {job.completionPhotos.map((photo, i) => (
                  <a
                    key={photo.publicId}
                    href={photo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-square rounded-xl overflow-hidden border border-gray-100 hover:border-green-300 transition-colors"
                  >
                    <img
                      src={photo.url}
                      alt={`Completion photo ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/50 to-transparent px-2 py-1.5">
                      <p className="text-[10px] text-white/80">Photo {i + 1}</p>
                    </div>
                  </a>
                ))}
              </div>
              {job.completedAt && (
                <p className="text-xs text-gray-400 mt-4">
                  Job completed: {new Date(job.completedAt).toLocaleString('en-AU', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Camera className="w-8 h-8 text-gray-200 mb-2" />
              <p className="text-xs text-gray-400">No completion photos yet.</p>
              <p className="text-xs text-gray-300 mt-0.5">Photos will appear once the tradie submits them via the mobile app.</p>
            </div>
          )}
        </div>
      )}

      {job.images && job.images.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              Client Photos
            </h2>
            <span className="text-xs text-gray-400">{job.images.length} photo{job.images.length !== 1 ? 's' : ''} uploaded</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {job.images.map((img: { url: string; publicId: string }, i: number) => (
              <a
                key={img.publicId}
                href={img.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square rounded-xl overflow-hidden border border-gray-100 hover:border-blue-300 transition-colors"
              >
                <img
                  src={img.url}
                  alt={`Job photo ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/50 to-transparent px-2 py-1.5">
                  <p className="text-[10px] text-white/80">Photo {i + 1}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="bg-linear-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-yellow-400" />
          <h2 className="text-sm font-semibold">Test Control Panel</h2>
          <span className="text-[10px] px-2 py-0.5 bg-yellow-400/20 text-yellow-300 rounded-full font-medium">Dev Only</span>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Simulate tradie actions that normally happen via the mobile app.
          Run these in order: Accept → Complete → Capture.
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${!canSimulateAccept && ['accepted', 'on_the_way', 'in_progress', 'completed'].includes(job.status)
                ? 'bg-green-500 text-white'
                : canSimulateAccept ? 'bg-yellow-400 text-slate-900' : 'bg-slate-600 text-slate-400'
              }`}>
              {(!canSimulateAccept && ['accepted', 'on_the_way', 'in_progress', 'completed'].includes(job.status)) ? '✓' : '1'}
            </div>
            <ActionButton
              label="Simulate Tradie Accept"
              description="Job status: dispatching → accepted"
              icon={User}
              color={canSimulateAccept
                ? 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700'
                : 'bg-slate-700/50 border-slate-600 text-slate-400 cursor-not-allowed'}
              onClick={() => requestAction(
                'simulate-accept',
                `/api/admin/jobs/${jobId}/simulate-accept`,
                'dev_job:simulate_accept',
                'Simulate Tradie Accept',
                'This will change the job status from dispatching to accepted. Enter your password to confirm.'
              )}
              disabled={!canSimulateAccept}
              isLoading={actionLoading === 'simulate-accept'}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${job.status === 'completed' ? 'bg-green-500 text-white'
                : canSimulateComplete ? 'bg-yellow-400 text-slate-900'
                  : 'bg-slate-600 text-slate-400'
              }`}>
              {job.status === 'completed' ? '✓' : '2'}
            </div>
            <ActionButton
              label="Simulate Job Complete"
              description="Job status: accepted/in_progress → completed"
              icon={Briefcase}
              color={canSimulateComplete
                ? 'bg-purple-600 border-purple-500 text-white hover:bg-purple-700'
                : 'bg-slate-700/50 border-slate-600 text-slate-400 cursor-not-allowed'}
              onClick={() => requestAction(
                'simulate-complete',
                `/api/admin/jobs/${jobId}/simulate-complete`,
                'dev_job:simulate_complete',
                'Simulate Job Complete',
                'This will mark the job as completed. Enter your password to confirm.'
              )}
              disabled={!canSimulateComplete}
              isLoading={actionLoading === 'simulate-complete'}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${payment?.status === 'captured' ? 'bg-green-500 text-white'
                : canCapture ? 'bg-yellow-400 text-slate-900'
                  : 'bg-slate-600 text-slate-400'
              }`}>
              {payment?.status === 'captured' ? '✓' : '3'}
            </div>
            <ActionButton
              label="Capture Payment"
              description={`Release $${payeeAmount ?? '—'} AUD to ${payeeAccountLabel}`}
              icon={DollarSign}
              color={canCapture
                ? 'bg-green-600 border-green-500 text-white hover:bg-green-700'
                : 'bg-slate-700/50 border-slate-600 text-slate-400 cursor-not-allowed'}
              onClick={() => requestAction(
                'capture',
                `/api/payments/capture/${jobId}`,
                'payment:capture',
                'Capture Payment',
                `This will capture $${payment?.amount ?? '—'} AUD and release $${payeeAmount ?? '—'} AUD to the ${payeeAccountLabel}. This action involves real money. Enter your password to confirm.`
              )}
              disabled={!canCapture}
              isLoading={actionLoading === 'capture'}
            />
          </div>
        </div>

        {payment?.status === 'captured' && !payment?.stripeTransferId && (
          <div className="mt-4 flex items-center gap-2 text-amber-400 text-xs font-medium">
            <AlertCircle className="w-4 h-4" />
            Payment captured but transfer to {isDirectAgencyContract ? 'agency' : 'tradie'} is missing — use repair below
          </div>
        )}

        {payment?.status === 'captured' && payment?.stripeTransferId && (
          <div className="mt-4 flex items-center gap-2 text-green-400 text-xs font-medium">
            <CheckCircle className="w-4 h-4" />
            Payment captured & transferred — {payeeLabel} earned ${payeeAmount ?? payment.tradieEarnings} AUD
          </div>
        )}

        {payment?.status === 'released' && (
          <div className="mt-4 flex items-center gap-2 text-green-400 text-xs font-medium">
            <CheckCircle className="w-4 h-4" />
            Payment released — {payeeLabel} earned ${payeeAmount ?? payment.tradieEarnings} AUD
          </div>
        )}

        {needsWalletRepair && (
          <div className="mt-4">
            <ActionButton
              label={isDirectAgencyContract ? 'Repair Agency Transfer' : 'Repair Wallet'}
              description={isDirectAgencyContract
                ? `Release $${payeeAmount ?? '—'} AUD to agency Stripe account`
                : `Credit $${payment?.tradieEarnings ?? '—'} AUD to tradie wallet + trigger Stripe transfer`}
              icon={DollarSign}
              color="bg-amber-600 border-amber-500 text-white hover:bg-amber-700"
              onClick={() => requestAction(
                'repair-wallet',
                `/api/admin/jobs/${jobId}/repair-wallet`,
                'payment:repair_wallet',
                isDirectAgencyContract ? 'Repair Agency Transfer' : 'Repair Wallet & Transfer',
                isDirectAgencyContract
                  ? `This will release $${payeeAmount ?? '—'} AUD to the agency Stripe account. This involves real money. Enter your password to confirm.`
                  : `This will credit $${payment?.tradieEarnings ?? '—'} AUD to the tradie's wallet and initiate the Stripe transfer. This involves real money. Enter your password to confirm.`
              )}
              disabled={false}
              isLoading={actionLoading === 'repair-wallet'}
            />
          </div>
        )}
      </div>

      <AdminActionConfirmDialog
        open={!!pendingAction}
        onOpenChange={(open) => { if (!open) setPendingAction(null) }}
        title={pendingAction?.title ?? ''}
        description={pendingAction?.description ?? ''}
        action={pendingAction?.actionName ?? ''}
        variant={pendingAction?.actionName === 'payment:capture' ? 'destructive' : 'default'}
        confirmLabel={pendingAction?.title ?? 'Confirm'}
        onConfirm={executeAction}
        onSuccess={() => setPendingAction(null)}
      />
    </div>
  )
}
