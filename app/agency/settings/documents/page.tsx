'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, FileUp, Info, Loader2, ShieldCheck, UploadCloud, XCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { uploadFile } from '@/lib/uploadService'
import { useAuth } from '@/contexts/auth-context'

interface Membership {
  _id: string
  role: string
  permissions: string[]
  agencyId?: { _id: string; name: string; categories: string[] }
}

interface Requirement {
  type: string
  label: string
  categories: string[]
}

interface AgencyDocument {
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
}

const hasAgencyPermission = (member: Membership | null, permission: string) =>
  !!member && (
    member.role === 'owner' ||
    member.permissions?.includes('agency:*') ||
    member.permissions?.includes(permission)
  )

const canUseDocumentsPortal = (member: Membership) =>
  member.role !== 'worker' &&
  !!member.agencyId?._id &&
  hasAgencyPermission(member, 'agency:manage_documents')

export default function AgencyDocumentsPage() {
  const { user } = useAuth()
  const [membership, setMembership] = useState<Membership | null>(null)
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [documents, setDocuments] = useState<AgencyDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingType, setUploadingType] = useState<string | null>(null)
  const [error, setError] = useState('')

  const agency = membership?.agencyId

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const me = await api.get<{ agencyMemberships: Membership[] }>('/api/agency/me')
      const active = (me.data.agencyMemberships || []).find(canUseDocumentsPortal) || null
      setMembership(active)
      if (active?.agencyId?._id) {
        const categories = active.agencyId.categories || []
        const [reqRes, docRes] = await Promise.all([
          api.get<{ requirements: Requirement[] }>(`/api/agency/document-requirements?categories=${categories.join(',')}`, true),
          api.get<{ documents: AgencyDocument[] }>(`/api/agency/${active.agencyId._id}/documents`),
        ])
        setRequirements(reqRes.data.requirements || [])
        setDocuments(docRes.data.documents || [])
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load agency documents.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'tradie') {
      load()
    } else if (user) {
      setLoading(false)
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const uploadDocument = async (requirement: Requirement, file: File) => {
    if (!agency?._id) return
    setUploadingType(requirement.type)
    setError('')
    try {
      const uploaded = await uploadFile(file, 'documents')
      await api.post(`/api/agency/${agency._id}/documents`, {
        type: requirement.type,
        label: requirement.label,
        publicId: uploaded.publicId,
        url: uploaded.url,
        notes: `Uploaded for ${requirement.categories.join(', ')}`,
      })
      await load()
    } catch (err: any) {
      setError(err?.message || 'Failed to upload document.')
    } finally {
      setUploadingType(null)
    }
  }

  const findDoc = (type: string) => documents.find(doc => doc.type === type)

  if (loading) {
    return <main className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-gray-400" /></main>
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <section className="max-w-5xl mx-auto space-y-6">
        <Link href="/agency" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"><ArrowLeft className="w-4 h-4" /> Back to agency</Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><ShieldCheck className="w-7 h-7 text-blue-600" /> Agency Documents</h1>
          <p className="text-sm text-gray-500 mt-1">{agency?.name || 'Agency'} category-specific document readiness.</p>
        </div>
        {!agency && <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">No agency document management access found for this account.</div>}

        {agency && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800 flex gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            Fixes admin must verify required documents before the agency can safely receive jobs.
          </div>
        )}
        {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}

        {agency && <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {requirements.length === 0 ? (
            <div className="py-16 text-center">
              <FileUp className="w-9 h-9 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No category requirements found for this agency.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {requirements.map(requirement => {
                const doc = findDoc(requirement.type)
                const uploading = uploadingType === requirement.type
                return (
                  <div key={requirement.type} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-gray-900">{requirement.label}</h2>
                        {doc?.isVerified ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : doc?.rejectedAt ? <XCircle className="w-4 h-4 text-red-600" /> : null}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Required for {requirement.categories.map(c => c.replace(/_/g, ' ')).join(', ')}</p>
                      {doc?.url && <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-2 inline-block">View uploaded document</a>}
                      {doc?.requestedMoreInfo && <p className="text-xs text-amber-700 mt-2">Admin requested: {doc.requestedMoreInfo}</p>}
                      {doc?.rejectionReason && <p className="text-xs text-red-600 mt-2">Rejected: {doc.rejectionReason}</p>}
                    </div>
                    <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold cursor-pointer hover:bg-blue-700">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                      {doc?.url ? 'Replace' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={event => {
                          const file = event.target.files?.[0]
                          if (file) uploadDocument(requirement, file)
                          event.currentTarget.value = ''
                        }}
                      />
                    </label>
                  </div>
                )
              })}
            </div>
          )}
        </section>}
      </section>
    </main>
  )
}
