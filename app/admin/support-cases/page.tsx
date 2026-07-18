// fixes-web/app/admin/support-cases/page.tsx

'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Briefcase, ChevronDown, LifeBuoy, Loader2, PlusCircle, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import AdminActionConfirmDialog from '@/components/admin/AdminActionConfirmDialog'

type SupportCaseStatus = 'open' | 'under_review' | 'waiting_on_customer' | 'escalated_to_dispute' | 'resolved' | 'closed'

interface SupportCase {
  _id: string
  caseNumber: string
  type: string
  subject: string
  description: string
  requestedOutcome: string
  priority: 'normal' | 'high' | 'urgent'
  status: SupportCaseStatus
  requesterId?: { _id: string; name: string; email: string; role: string; fixId?: string }
  jobId?: { _id: string; jobCode: string; title: string; status: string; category: string }
  disputeId?: { _id: string; status: string } | string | null
  evidence?: { url: string; publicId: string }[]
  adminNotes?: string
  resolutionNotes?: string
  createdAt: string
}

const STATUS_CONFIG: Record<SupportCaseStatus, { label: string; classes: string }> = {
  open: { label: 'Open', classes: 'bg-red-100 text-red-700' },
  under_review: { label: 'Under Review', classes: 'bg-amber-100 text-amber-700' },
  waiting_on_customer: { label: 'Waiting on Customer', classes: 'bg-blue-100 text-blue-700' },
  escalated_to_dispute: { label: 'Escalated', classes: 'bg-purple-100 text-purple-700' },
  resolved: { label: 'Resolved', classes: 'bg-green-100 text-green-700' },
  closed: { label: 'Closed', classes: 'bg-gray-100 text-gray-600' },
}

const NEXT_STATUSES: SupportCaseStatus[] = ['open', 'under_review', 'waiting_on_customer', 'resolved', 'closed']
const DISPUTE_REASONS = [
  { value: 'poor_quality', label: 'Poor quality' },
  { value: 'incomplete', label: 'Incomplete work' },
  { value: 'overcharged', label: 'Overcharged' },
  { value: 'damage', label: 'Property damage' },
  { value: 'no_show', label: 'No show' },
  { value: 'payment_withheld', label: 'Payment withheld' },
  { value: 'abusive_client', label: 'Abusive client' },
  { value: 'other', label: 'Other' },
]

const CASE_TYPES = [
  { value: 'completed_job_issue', label: 'Completed job issue' },
  { value: 'payment_issue', label: 'Payment issue' },
  { value: 'safety_issue', label: 'Safety issue' },
  { value: 'account_issue', label: 'Account issue' },
  { value: 'technical_issue', label: 'Technical issue' },
  { value: 'other', label: 'Other' },
]

const REQUESTED_OUTCOMES = [
  { value: 'support_review', label: 'Support review' },
  { value: 'refund_review', label: 'Refund review' },
  { value: 'quality_review', label: 'Quality review' },
  { value: 'payment_review', label: 'Payment review' },
  { value: 'safety_review', label: 'Safety review' },
]

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminSupportCasesPage() {
  const [cases, setCases] = useState<SupportCase[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedCase, setSelectedCase] = useState<SupportCase | null>(null)
  const [showEscalateDialog, setShowEscalateDialog] = useState(false)
  const [disputeReason, setDisputeReason] = useState('poor_quality')
  const [disputeDescription, setDisputeDescription] = useState('')
  const [error, setError] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({
    jobRef: '',
    requesterRole: 'client',
    type: 'completed_job_issue',
    requestedOutcome: 'support_review',
    priority: 'normal',
    subject: '',
    description: '',
  })

  const loadCases = async (status = statusFilter) => {
    setLoading(true)
    setError('')
    try {
      const qs = new URLSearchParams({ limit: '100' })
      if (status !== 'all') qs.set('status', status)
      const res = await api.get<{ cases: SupportCase[] }>(`/api/support/cases/admin/all?${qs}`)
      setCases(res.data.cases || [])
    } catch (err: any) {
      setError(err?.message || 'Failed to load support cases.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCases() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const counts = useMemo(() => {
    return cases.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [cases])

  const updateStatus = async (caseId: string, status: SupportCaseStatus) => {
    setUpdatingId(caseId)
    try {
      const res = await api.patch<{ supportCase: SupportCase }>(`/api/support/cases/${caseId}/status`, { status })
      setCases(prev => prev.map(item => item._id === caseId ? { ...item, ...res.data.supportCase } : item))
    } catch (err: any) {
      setError(err?.message || 'Failed to update support case.')
    } finally {
      setUpdatingId(null)
    }
  }

  const openEscalation = (supportCase: SupportCase) => {
    setSelectedCase(supportCase)
    setDisputeDescription(supportCase.description)
    setDisputeReason('poor_quality')
    setShowEscalateDialog(false)
  }

  const submitAdminCase = async () => {
    if (!createForm.jobRef.trim() || !createForm.subject.trim() || !createForm.description.trim()) return

    setCreating(true)
    setError('')
    try {
      await api.post('/api/support/cases/admin', {
        jobId: createForm.jobRef.trim(),
        requesterRole: createForm.requesterRole,
        type: createForm.type,
        requestedOutcome: createForm.requestedOutcome,
        priority: createForm.priority,
        subject: createForm.subject.trim(),
        description: createForm.description.trim(),
        source: 'admin',
      })
      setCreateOpen(false)
      setCreateForm({
        jobRef: '',
        requesterRole: 'client',
        type: 'completed_job_issue',
        requestedOutcome: 'support_review',
        priority: 'normal',
        subject: '',
        description: '',
      })
      loadCases()
    } catch (err: any) {
      setError(err?.message || 'Failed to open support case.')
    } finally {
      setCreating(false)
    }
  }

  const executeEscalation = async (token: string) => {
    if (!selectedCase) return
    await api.raw(`/api/support/cases/${selectedCase._id}/escalate-dispute`, {
      method: 'POST',
      body: {
        reason: disputeReason,
        description: disputeDescription,
      },
      headers: { 'X-Admin-Action-Token': token },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--upwork-navy) flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-blue-600" />
            Support Cases
          </h1>
          <p className="text-sm text-(--upwork-gray)">Review job issues and escalate valid cases into disputes.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
          >
            <PlusCircle className="w-4 h-4" /> Open Case
          </button>
          <button
            onClick={() => loadCases()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-(--upwork-gray) hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {(['all', ...Object.keys(STATUS_CONFIG)] as Array<'all' | SupportCaseStatus>).map(status => (
          <button
            key={status}
            onClick={() => { setStatusFilter(status); loadCases(status) }}
            className={`bg-white border rounded-xl p-3 text-left hover:border-blue-500 ${statusFilter === status ? 'border-blue-500 shadow-sm' : 'border-gray-200'}`}
          >
            <p className="text-xl font-bold text-(--upwork-navy)">{status === 'all' ? cases.length : counts[status] || 0}</p>
            <p className="text-xs text-(--upwork-gray)">{status === 'all' ? 'All' : STATUS_CONFIG[status].label}</p>
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
        ) : cases.length === 0 ? (
          <div className="py-20 text-center text-(--upwork-gray)">No support cases found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {cases.map(item => {
              const open = expandedId === item._id
              const cfg = STATUS_CONFIG[item.status]
              const canEscalate = !!item.jobId && !item.disputeId && item.status !== 'escalated_to_dispute' && item.status !== 'closed'

              return (
                <div key={item._id}>
                  <button
                    onClick={() => setExpandedId(open ? null : item._id)}
                    className="w-full text-left px-5 py-4 hover:bg-gray-50 flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2 mb-1">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${cfg.classes}`}>{cfg.label}</span>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-500">{item.type.replace(/_/g, ' ')}</span>
                        {item.priority !== 'normal' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-600">{item.priority}</span>}
                      </div>
                      <p className="font-semibold text-(--upwork-navy) truncate">{item.subject}</p>
                      <p className="text-xs text-(--upwork-gray)">
                        {item.caseNumber} - {item.requesterId?.name || 'Unknown'} - {item.jobId?.jobCode || 'No job'} - {fmt(item.createdAt)}
                      </p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 mt-2 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>

                  {open && (
                    <div className="px-5 pb-5 pt-2 bg-gray-50 border-t border-gray-100 space-y-4">
                      <div className="grid md:grid-cols-3 gap-3">
                        <div className="bg-white border border-gray-200 rounded-xl p-3">
                          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Customer</p>
                          <p className="text-sm font-semibold text-(--upwork-navy)">{item.requesterId?.name || 'Unknown'}</p>
                          <p className="text-xs text-(--upwork-gray)">{item.requesterId?.email}</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-3">
                          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Job</p>
                          <p className="text-sm font-semibold text-(--upwork-navy)">{item.jobId?.jobCode || 'Not linked'}</p>
                          <p className="text-xs text-(--upwork-gray)">{item.jobId?.title || '-'}</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-3">
                          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Requested Outcome</p>
                          <p className="text-sm font-semibold text-(--upwork-navy)">{item.requestedOutcome.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-(--upwork-gray)">Status: {item.status.replace(/_/g, ' ')}</p>
                        </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Description</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{item.description}</p>
                      </div>

                      {item.evidence && item.evidence.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Evidence</p>
                          <div className="flex flex-wrap gap-2">
                            {item.evidence.map(ev => (
                              <a key={ev.publicId} href={ev.url} target="_blank" rel="noopener noreferrer" className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                                <img src={ev.url} alt="Support evidence" className="w-full h-full object-cover" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          {NEXT_STATUSES.filter(status => status !== item.status).map(status => (
                            <button
                              key={status}
                              disabled={updatingId === item._id}
                              onClick={() => updateStatus(item._id, status)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 ${STATUS_CONFIG[status].classes}`}
                            >
                              {updatingId === item._id ? 'Updating...' : STATUS_CONFIG[status].label}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          {item.jobId && (
                            <a href={`/admin/jobs/${item.jobId._id}`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-(--upwork-navy) hover:bg-gray-50">
                              <Briefcase className="w-3.5 h-3.5" /> View Job
                            </a>
                          )}
                          {canEscalate && (
                            <button
                              onClick={() => openEscalation(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" /> Escalate to Dispute
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selectedCase && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/30 px-4 py-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-xl p-5 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-(--upwork-navy)">Prepare Dispute Escalation</h2>
              <p className="text-sm text-(--upwork-gray)">Review the reason and description before password confirmation.</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-(--upwork-navy) block mb-2">Dispute Reason</label>
              <select value={disputeReason} onChange={e => setDisputeReason(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
                {DISPUTE_REASONS.map(reason => <option key={reason.value} value={reason.value}>{reason.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-(--upwork-navy) block mb-2">Dispute Description</label>
              <textarea value={disputeDescription} onChange={e => setDisputeDescription(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm min-h-32" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setSelectedCase(null); setShowEscalateDialog(false) }} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-(--upwork-gray)">Cancel</button>
              <button onClick={() => setShowEscalateDialog(true)} disabled={!disputeDescription.trim()} className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold disabled:opacity-50">Continue</button>
            </div>
          </div>
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/30 px-4 py-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-2xl p-5 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-(--upwork-navy)">Open Support Case</h2>
              <p className="text-sm text-(--upwork-gray)">Create a case for a client or tradie from a job ID or job code.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-semibold text-(--upwork-navy) block mb-2">Job ID or Job Code</span>
                <input
                  value={createForm.jobRef}
                  onChange={e => setCreateForm(prev => ({ ...prev, jobRef: e.target.value }))}
                  placeholder="FIX-JOB-2026-000000 or Mongo ID"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-(--upwork-navy) block mb-2">Open For</span>
                <select
                  value={createForm.requesterRole}
                  onChange={e => setCreateForm(prev => ({ ...prev, requesterRole: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                >
                  <option value="client">Client</option>
                  <option value="tradie">Tradie</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-(--upwork-navy) block mb-2">Case Type</span>
                <select
                  value={createForm.type}
                  onChange={e => setCreateForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                >
                  {CASE_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-(--upwork-navy) block mb-2">Requested Outcome</span>
                <select
                  value={createForm.requestedOutcome}
                  onChange={e => setCreateForm(prev => ({ ...prev, requestedOutcome: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                >
                  {REQUESTED_OUTCOMES.map(outcome => <option key={outcome.value} value={outcome.value}>{outcome.label}</option>)}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-(--upwork-navy) block mb-2">Subject</span>
              <input
                value={createForm.subject}
                onChange={e => setCreateForm(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-(--upwork-navy) block mb-2">Customer Notes</span>
              <textarea
                value={createForm.description}
                onChange={e => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm min-h-32"
              />
            </label>

            <div className="flex justify-end gap-2">
              <button onClick={() => setCreateOpen(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-(--upwork-gray)">Cancel</button>
              <button
                onClick={submitAdminCase}
                disabled={creating || !createForm.jobRef.trim() || !createForm.subject.trim() || !createForm.description.trim()}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                {creating ? 'Opening...' : 'Open Case'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminActionConfirmDialog
        open={showEscalateDialog}
        onOpenChange={setShowEscalateDialog}
        title="Escalate Support Case to Dispute"
        description="This will mark the job as disputed and freeze any pending escrow payment while the case is investigated."
        action="support_case:escalate_dispute"
        variant="destructive"
        confirmLabel="Escalate to Dispute"
        onConfirm={executeEscalation}
        onSuccess={() => {
          setSelectedCase(null)
          setShowEscalateDialog(false)
          loadCases()
        }}
      />
    </div>
  )
}
