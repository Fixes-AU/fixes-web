'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, CheckCircle2, CreditCard, ExternalLink, FileCheck2, Info, Loader2, Save, Users, XCircle } from 'lucide-react'
import { api } from '@/lib/api'
import AdminActionConfirmDialog from '@/components/admin/AdminActionConfirmDialog'

interface AgencyMember {
  _id: string
  role: string
  status: string
  hideFinancials: boolean
  userId?: { name: string; email: string; fixId?: string }
}

interface Agency {
  _id: string
  name: string
  slug: string
  status: string
  ownerName?: string
  businessEmail?: string
  phone?: string
  abn?: string
  categories: string[]
  stripeAccountStatus: string
  isOnline: boolean
  negativeBalance?: number
  documents?: {
    _id: string
    type: string
    label?: string
    category?: string
    url?: string
    isVerified?: boolean
    rejectedAt?: string | null
    rejectionReason?: string
    requestedMoreInfo?: string
    uploadedAt?: string
  }[]
  serviceAreas?: { label?: string; suburb?: string; postcode?: string; state?: string }[]
}

interface DocumentRequirement {
  type: string
  label: string
  categories: string[]
}

type AgencyDocument = NonNullable<Agency['documents']>[number]

export default function AdminAgencyDetailPage() {
  const params = useParams<{ id: string }>()
  const [agency, setAgency] = useState<Agency | null>(null)
  const [members, setMembers] = useState<AgencyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [stripeStatus, setStripeStatus] = useState('')
  const [isOnline, setIsOnline] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [requirements, setRequirements] = useState<DocumentRequirement[]>([])
  const [selectedDoc, setSelectedDoc] = useState<AgencyDocument | null>(null)
  const [docAction, setDocAction] = useState<'verify' | 'reject' | 'request-info' | null>(null)
  const [docNote, setDocNote] = useState('')
  const [docConfirmOpen, setDocConfirmOpen] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get<{ agency: Agency; members: AgencyMember[]; documentRequirements: DocumentRequirement[] }>(`/api/admin/agencies/${params.id}`)
      setAgency(res.data.agency)
      setMembers(res.data.members || [])
      setRequirements(res.data.documentRequirements || [])
      setStatus(res.data.agency.status)
      setStripeStatus(res.data.agency.stripeAccountStatus)
      setIsOnline(res.data.agency.isOnline)
    } catch (err: any) {
      setError(err?.message || 'Failed to load agency.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (params.id) load() }, [params.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (token: string) => {
    await api.raw(`/api/admin/agencies/${params.id}`, {
      method: 'PATCH',
      headers: { 'X-Admin-Action-Token': token },
      body: { status, stripeAccountStatus: stripeStatus, isOnline },
    })
  }

  const openDocAction = (doc: AgencyDocument, action: typeof docAction) => {
    setSelectedDoc(doc)
    setDocAction(action)
    setDocNote('')
    setDocConfirmOpen(action === 'verify')
  }

  const executeDocAction = async (token: string) => {
    if (!selectedDoc || !docAction) return
    const body = docAction === 'verify'
      ? {}
      : docAction === 'reject'
        ? { rejectionReason: docNote }
        : { requestedMoreInfo: docNote }
    await api.raw(`/api/admin/agencies/${params.id}/documents/${selectedDoc._id}/${docAction}`, {
      method: 'PATCH',
      headers: { 'X-Admin-Action-Token': token },
      body,
    })
  }

  if (loading) {
    return <div className="py-24 flex justify-center"><Loader2 className="w-7 h-7 animate-spin text-gray-400" /></div>
  }

  if (!agency) {
    return <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error || 'Agency not found.'}</div>
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/agencies" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" /> Back to agencies
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            {agency.name}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{agency.businessEmail || agency.ownerName} - {agency.slug}</p>
        </div>
        <button onClick={() => setConfirmOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
          <Save className="w-4 h-4" /> Save Admin State
        </button>
      </div>

      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}

      <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        Online is blocked unless status is Active and Stripe status is Active. Active jobs should be reviewed before suspension.
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <section className="bg-white border border-gray-200 rounded-xl p-5 lg:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-4">Agency Controls</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <label className="space-y-1">
              <span className="text-xs font-semibold text-gray-500">Status</span>
              <select value={status} onChange={event => setStatus(event.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm">
                {['draft', 'pending_verification', 'active', 'offline', 'suspended', 'rejected'].map(value => <option key={value} value={value}>{value.replace(/_/g, ' ')}</option>)}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold text-gray-500">Stripe Status</span>
              <select value={stripeStatus} onChange={event => setStripeStatus(event.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm">
                {['not_connected', 'pending', 'active', 'requires_action'].map(value => <option key={value} value={value}>{value.replace(/_/g, ' ')}</option>)}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold text-gray-500">Online</span>
              <button
                type="button"
                onClick={() => setIsOnline(prev => !prev)}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm font-semibold ${isOnline ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
              >
                {isOnline ? 'Online' : 'Offline'}
              </button>
            </label>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-blue-600" /> Finance Guard</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-gray-500">Stripe</dt><dd className="font-semibold text-gray-900">{agency.stripeAccountStatus.replace(/_/g, ' ')}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-gray-500">Negative balance</dt><dd className="font-semibold text-gray-900">${Number(agency.negativeBalance || 0).toFixed(2)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-gray-500">Can dispatch</dt><dd className="font-semibold text-gray-900">{agency.status === 'active' && agency.isOnline && agency.stripeAccountStatus === 'active' ? 'Yes' : 'No'}</dd></div>
          </dl>
        </section>
      </div>

      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {(agency.categories || []).map(category => <span key={category} className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">{category.replace(/_/g, ' ')}</span>)}
          {(agency.categories || []).length === 0 && <p className="text-sm text-gray-500">No categories configured.</p>}
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><FileCheck2 className="w-4 h-4 text-blue-600" /> Documents</h2>
            <p className="text-xs text-gray-500 mt-1">Verify category-specific documents before allowing normal dispatch eligibility.</p>
          </div>
          <span className="text-xs text-gray-400">{(agency.documents || []).filter(doc => doc.isVerified).length}/{requirements.length || agency.documents?.length || 0} verified</span>
        </div>

        {requirements.length > 0 && (
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 mb-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">Required by categories</p>
            <div className="flex flex-wrap gap-1.5">
              {requirements.map(req => (
                <span key={req.type} className="px-2 py-1 rounded-full bg-white border border-gray-200 text-[10px] font-semibold text-gray-600">{req.label}</span>
              ))}
            </div>
          </div>
        )}

        {(agency.documents || []).length === 0 ? (
          <p className="text-sm text-gray-500">No agency documents uploaded yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {(agency.documents || []).map(doc => (
              <div key={doc._id} className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-900">{doc.label || doc.type.replace(/_/g, ' ')}</p>
                    {doc.isVerified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase"><CheckCircle2 className="w-3 h-3" /> Verified</span>
                    ) : doc.rejectedAt ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase"><XCircle className="w-3 h-3" /> Rejected</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase">Pending</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{doc.type}{doc.category ? ` - ${doc.category}` : ''}</p>
                  {doc.rejectionReason && <p className="text-xs text-red-600 mt-2">Rejected: {doc.rejectionReason}</p>}
                  {doc.requestedMoreInfo && <p className="text-xs text-amber-700 mt-2">Needs info: {doc.requestedMoreInfo}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {doc.url && (
                    <a href={doc.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600">
                      <ExternalLink className="w-3.5 h-3.5" /> View
                    </a>
                  )}
                  <button onClick={() => openDocAction(doc, 'verify')} className="px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-semibold">Verify</button>
                  <button onClick={() => openDocAction(doc, 'request-info')} className="px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold">Need Info</button>
                  <button onClick={() => openDocAction(doc, 'reject')} className="px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-semibold">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-blue-600" /> Members</h2>
        {members.length === 0 ? (
          <p className="text-sm text-gray-500">No linked members yet. Owner invite/member onboarding comes in the next slice.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {members.map(member => (
              <div key={member._id} className="py-3 flex justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{member.userId?.name || 'Unknown user'}</p>
                  <p className="text-xs text-gray-500">{member.userId?.email} - {member.role}</p>
                </div>
                <span className="text-xs text-gray-500">{member.hideFinancials ? 'financials hidden' : 'finance visible'}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <AdminActionConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Update agency admin state"
        description="This updates agency status, Stripe readiness state, and online flag. Dispatch still remains controlled by backend eligibility."
        action="agency:update"
        confirmLabel="Save"
        onConfirm={save}
        onSuccess={load}
        onError={(err) => setError(err.message)}
      />

      {selectedDoc && docAction && !docConfirmOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-lg p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">
              {docAction === 'verify' ? 'Verify document' : docAction === 'reject' ? 'Reject document' : 'Request more document info'}
            </h2>
            <p className="text-sm text-gray-500">{selectedDoc.label || selectedDoc.type}</p>
            {docAction !== 'verify' && (
              <textarea
                value={docNote}
                onChange={event => setDocNote(event.target.value)}
                rows={4}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                placeholder={docAction === 'reject' ? 'Rejection reason' : 'What does the agency need to provide?'}
              />
            )}
            <div className="flex justify-end gap-2">
              <button onClick={() => { setSelectedDoc(null); setDocAction(null) }} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">Cancel</button>
              <button
                onClick={() => setDocConfirmOpen(true)}
                disabled={!docNote.trim()}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedDoc && docAction && (
        <AdminActionConfirmDialog
          open={docConfirmOpen}
          onOpenChange={(open) => {
            setDocConfirmOpen(open)
            if (!open && docAction === 'verify') {
              setSelectedDoc(null)
              setDocAction(null)
            }
          }}
          title={docAction === 'verify' ? 'Verify agency document' : docAction === 'reject' ? 'Reject agency document' : 'Request more information'}
          description="Enter your password to confirm this agency document review action."
          action={`agency_document:${docAction === 'request-info' ? 'request_info' : docAction}`}
          confirmLabel={docAction === 'verify' ? 'Verify' : docAction === 'reject' ? 'Reject' : 'Request Info'}
          variant={docAction === 'reject' ? 'destructive' : 'default'}
          onConfirm={executeDocAction}
          onSuccess={() => { setSelectedDoc(null); setDocAction(null); setDocConfirmOpen(false); load() }}
          onError={(err) => setError(err.message)}
        />
      )}
    </div>
  )
}
