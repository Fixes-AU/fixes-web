// fixes-web/app/dashboard/support/page.tsx

'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Loader2, UploadCloud, X } from 'lucide-react'
import { api } from '@/lib/api'
import { uploadFile } from '@/lib/uploadService'
import type { Job } from '@/lib/types'

const SUPPORT_TYPES = [
  { value: 'completed_job_issue', label: 'Completed job issue' },
  { value: 'payment_issue', label: 'Payment concern' },
  { value: 'safety_issue', label: 'Safety concern' },
  { value: 'account_issue', label: 'Account issue' },
  { value: 'technical_issue', label: 'Technical issue' },
  { value: 'other', label: 'Other' },
]

const OUTCOMES = [
  { value: 'support_review', label: 'Support review' },
  { value: 'quality_review', label: 'Quality review' },
  { value: 'refund_review', label: 'Refund review' },
  { value: 'payment_review', label: 'Payment review' },
  { value: 'safety_review', label: 'Safety review' },
]

interface EvidenceFile {
  localUri: string
  url: string
  publicId: string
}

function DashboardSupportContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobId = searchParams.get('jobId')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [job, setJob] = useState<Job | null>(null)
  const [loadingJob, setLoadingJob] = useState(!!jobId)
  const [type, setType] = useState(jobId ? 'completed_job_issue' : 'other')
  const [requestedOutcome, setRequestedOutcome] = useState(jobId ? 'quality_review' : 'support_review')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [evidence, setEvidence] = useState<EvidenceFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successCase, setSuccessCase] = useState<{ caseNumber: string } | null>(null)

  useEffect(() => {
    if (!jobId) return
    setLoadingJob(true)
    api.get<{ job: Job }>(`/api/jobs/${jobId}`)
      .then(res => {
        setJob(res.data.job)
        setSubject(`Help with ${res.data.job.jobCode}`)
      })
      .catch(() => setError('Could not load job details. You can still submit a support case.'))
      .finally(() => setLoadingJob(false))
  }, [jobId])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    if (evidence.length + files.length > 5) {
      setError('Maximum 5 evidence photos allowed.')
      return
    }

    setUploading(true)
    setError('')
    try {
      for (const file of files) {
        const localUri = URL.createObjectURL(file)
        const { url, publicId } = await uploadFile(file, 'dispute_evidence')
        setEvidence(prev => [...prev, { localUri, url, publicId }])
      }
    } catch {
      setError('One or more uploads failed. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!subject.trim() || !description.trim()) return

    setSubmitting(true)
    setError('')
    try {
      const res = await api.post<{ supportCase: { caseNumber: string } }>('/api/support/cases', {
        jobId: jobId || undefined,
        type,
        requestedOutcome,
        priority: requestedOutcome === 'safety_review' ? 'urgent' : 'normal',
        subject: subject.trim(),
        description: description.trim(),
        source: 'client_web',
        evidence: evidence.map(item => ({ url: item.url, publicId: item.publicId })),
      })
      setSuccessCase({ caseNumber: res.data.supportCase.caseNumber })
      setEvidence([])
    } catch (err: any) {
      setError(err?.message || 'Could not submit support case.')
    } finally {
      setSubmitting(false)
    }
  }

  if (successCase) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-(--upwork-navy) mb-2">Support case submitted</h1>
          <p className="text-sm text-(--upwork-gray) mb-6">
            Case {successCase.caseNumber} has been sent to our support team. If it needs payment action, support will escalate it into a dispute after review.
          </p>
          <button onClick={() => router.push(jobId ? `/dashboard/jobs/${jobId}` : '/dashboard')} className="px-5 py-2.5 rounded-xl bg-(--upwork-green) text-white text-sm font-semibold">
            Back to {jobId ? 'Job' : 'Dashboard'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-(--upwork-gray) hover:text-(--upwork-navy)">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div>
        <h1 className="text-2xl font-bold text-(--upwork-navy)">Help & Support</h1>
        <p className="text-sm text-(--upwork-gray)">Submit a support case for review. Payment disputes are opened by support only after checking the job details.</p>
      </div>

      {jobId && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          {loadingJob ? (
            <p className="text-sm text-blue-700 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading job details...</p>
          ) : job ? (
            <div>
              <p className="text-sm font-semibold text-blue-900">{job.jobCode} - {job.title}</p>
              <p className="text-xs text-blue-700 mt-1">Status: {job.status.replace(/_/g, ' ')}</p>
            </div>
          ) : (
            <p className="text-sm text-blue-700">This case will still be submitted, but the job details could not be loaded.</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5">
        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>}

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-(--upwork-navy) mb-2">Case Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm">
              {SUPPORT_TYPES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-(--upwork-navy) mb-2">Requested Outcome</label>
            <select value={requestedOutcome} onChange={e => setRequestedOutcome(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm">
              {OUTCOMES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-(--upwork-navy) mb-2">Subject</label>
          <input value={subject} onChange={e => setSubject(e.target.value)} maxLength={120} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Short summary" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-(--upwork-navy) mb-2">What happened?</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={2000} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm min-h-36" placeholder="Include what went wrong, what outcome you are asking support to review, and any important chat or timing details." />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-(--upwork-navy)">Evidence Photos <span className="font-normal text-gray-400">(optional, max 5)</span></label>
          {evidence.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {evidence.map((item, index) => (
                <div key={item.publicId} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                  <img src={item.url} alt={`Evidence ${index + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setEvidence(prev => prev.filter((_, i) => i !== index))} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {evidence.length < 5 && (
            <>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full border-2 border-dashed border-gray-200 rounded-xl p-7 flex flex-col items-center justify-center text-center hover:border-(--upwork-green) disabled:opacity-50">
                {uploading ? <Loader2 className="w-7 h-7 animate-spin text-gray-400 mb-2" /> : <UploadCloud className="w-7 h-7 text-gray-400 mb-2" />}
                <span className="text-sm font-semibold text-(--upwork-navy)">{uploading ? 'Uploading...' : 'Upload evidence'}</span>
              </button>
            </>
          )}
        </div>

        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button type="submit" disabled={!subject.trim() || !description.trim() || submitting || uploading} className="px-6 py-3 rounded-xl bg-(--upwork-green) text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit Support Case
          </button>
        </div>
      </form>
    </div>
  )
}

export default function DashboardSupportPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto py-10 text-sm text-(--upwork-gray)">Loading support...</div>}>
      <DashboardSupportContent />
    </Suspense>
  )
}
