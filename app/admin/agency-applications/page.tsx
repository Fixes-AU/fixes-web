'use client'

import { useEffect, useMemo, useState } from 'react'
import { Building2, CheckCircle2, FileCheck2, Info, Loader2, RefreshCw, Search, XCircle } from 'lucide-react'
import { api } from '@/lib/api'
import AdminActionConfirmDialog from '@/components/admin/AdminActionConfirmDialog'

type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'needs_more_info'

interface AgencyApplication {
  _id: string
  status: ApplicationStatus
  companyName: string
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  abn?: string
  requestedCategories: string[]
  serviceAreas?: { label?: string; suburb?: string; postcode?: string; state?: string }[]
  documents?: { type: string; label?: string; url?: string; notes?: string }[]
  reviewNotes?: string
  requestedMoreInfo?: string
  approvedAgencyId?: { _id: string; name: string; status: string } | string | null
  createdAt: string
}

const STATUS_STYLE: Record<ApplicationStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  needs_more_info: 'bg-purple-100 text-purple-700',
}

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  needs_more_info: 'Needs Info',
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminAgencyApplicationsPage() {
  const [applications, setApplications] = useState<AgencyApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<AgencyApplication | null>(null)
  const [action, setAction] = useState<'approve' | 'reject' | 'request-info' | null>(null)
  const [notes, setNotes] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const qs = new URLSearchParams({ limit: '100' })
      if (status !== 'all') qs.set('status', status)
      if (search.trim()) qs.set('search', search.trim())
      const res = await api.getPaginated<AgencyApplication>(`/api/admin/agency-applications?${qs}`)
      setApplications(res.data || [])
    } catch (err: any) {
      setError(err?.message || 'Failed to load agency applications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const counts = useMemo(() => applications.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {} as Record<string, number>), [applications])

  const openAction = (item: AgencyApplication, nextAction: typeof action) => {
    setSelected(item)
    setAction(nextAction)
    setNotes('')
    setConfirmOpen(false)
  }

  const executeAction = async (token: string) => {
    if (!selected || !action) return
    const endpoint = `/api/admin/agency-applications/${selected._id}/${action}`
    const body = action === 'request-info'
      ? { requestedMoreInfo: notes }
      : { reviewNotes: notes }
    await api.raw(endpoint, {
      method: 'PATCH',
      headers: { 'X-Admin-Action-Token': token },
      body,
    })
  }

  const actionMeta = {
    approve: {
      title: 'Approve agency application',
      description: 'This creates an agency tenant. It still will not go online until status and Stripe readiness allow it.',
      label: 'Approve',
      variant: 'default' as const,
      actionName: 'agency:approve_application',
    },
    reject: {
      title: 'Reject agency application',
      description: 'Reject this application with review notes for audit history.',
      label: 'Reject',
      variant: 'destructive' as const,
      actionName: 'agency:reject_application',
    },
    'request-info': {
      title: 'Request more information',
      description: 'Move this application to Needs Info and record what the agency must provide.',
      label: 'Request Info',
      variant: 'default' as const,
      actionName: 'agency:request_info',
    },
  }

  const meta = action ? actionMeta[action] : null

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-blue-600" />
            Agency Applications
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review Direct Contracts agency onboarding before any agency can receive jobs.
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800 flex gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        Approving creates the agency record only. Dispatch remains blocked until the agency is active, online, and Stripe-ready.
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              onKeyDown={event => { if (event.key === 'Enter') load() }}
              placeholder="Search company, owner, email, or ABN"
              className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={status}
            onChange={event => setStatus(event.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All statuses</option>
            {Object.entries(STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <button onClick={load} className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold">Search</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <button
              key={value}
              onClick={() => { setStatus(value); setTimeout(load, 0) }}
              className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-left"
            >
              <p className="text-lg font-bold text-gray-900">{counts[value] || 0}</p>
              <p className="text-[11px] text-gray-500">{label}</p>
            </button>
          ))}
        </div>
      </div>

      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="w-7 h-7 animate-spin text-gray-400" /></div>
        ) : applications.length === 0 ? (
          <div className="py-20 text-center text-sm text-gray-500">No agency applications found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {applications.map(item => (
              <div key={item._id} className="p-5">
                <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-gray-900">{item.companyName}</h2>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLE[item.status]}`}>
                        {STATUS_LABEL[item.status]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{item.ownerName} - {item.ownerEmail} - {item.ownerPhone}</p>
                    <p className="text-xs text-gray-400 mt-1">Submitted {formatDate(item.createdAt)}{item.abn ? ` - ABN ${item.abn}` : ''}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(item.requestedCategories || []).map(category => (
                        <span key={category} className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-semibold">
                          {category.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                    {(item.requestedMoreInfo || item.reviewNotes) && (
                      <p className="text-xs text-gray-500 mt-3 max-w-3xl">{item.requestedMoreInfo || item.reviewNotes}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.status !== 'approved' && (
                      <>
                        <button onClick={() => openAction(item, 'approve')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </button>
                        <button onClick={() => openAction(item, 'request-info')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold">
                          <Info className="w-4 h-4" /> Need Info
                        </button>
                        <button onClick={() => openAction(item, 'reject')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-semibold">
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </>
                    )}
                    {item.approvedAgencyId && (
                      <a href={`/admin/agencies/${typeof item.approvedAgencyId === 'string' ? item.approvedAgencyId : item.approvedAgencyId._id}`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold">
                        <Building2 className="w-4 h-4" /> Open Agency
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && action && meta && !confirmOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-lg p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">{meta.title}</h2>
            <p className="text-sm text-gray-500">{selected.companyName}</p>
            <textarea
              value={notes}
              onChange={event => setNotes(event.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              placeholder={action === 'request-info' || action === 'reject' ? 'Required note' : 'Optional admin notes'}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setSelected(null); setAction(null) }} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">Cancel</button>
              <button
                onClick={() => setConfirmOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold"
                disabled={(action === 'request-info' || action === 'reject') && !notes.trim()}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {selected && action && meta && (
        <AdminActionConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={meta.title}
          description={meta.description}
          action={meta.actionName}
          variant={meta.variant}
          confirmLabel={meta.label}
          onConfirm={executeAction}
          onSuccess={() => { setSelected(null); setAction(null); setConfirmOpen(false); load() }}
          onError={(err) => setError(err.message)}
        />
      )}
    </div>
  )
}
