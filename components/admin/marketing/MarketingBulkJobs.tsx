'use client'

import { useCallback, useEffect, useState } from 'react'
import { Download, Loader2, RefreshCw } from 'lucide-react'
import { ApiError } from '@/lib/api'
import { MarketingBulkJob, marketingApi } from '@/lib/marketing'

export default function MarketingBulkJobs({ campaignId, canExport, refreshKey }: { campaignId: string; canExport: boolean; refreshKey: number }) {
  const [jobs, setJobs] = useState<MarketingBulkJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    try { const response = await marketingApi.bulkJobs(campaignId); setJobs(response.data.jobs); setError('') }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Bulk jobs could not be loaded.') }
    finally { setLoading(false) }
  }, [campaignId])
  useEffect(() => { setLoading(true); void load() }, [load, refreshKey])
  useEffect(() => {
    if (!jobs.some(job => ['pending', 'processing', 'retry_scheduled'].includes(job.status))) return
    const timer = setInterval(() => { void load() }, 5000)
    return () => clearInterval(timer)
  }, [jobs, load])
  const download = async (job: MarketingBulkJob) => {
    try {
      const blob = await marketingApi.bulkResult(job._id)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = `fixes-bulk-codes-${job._id}.csv`
      document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url)
    } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Bulk result could not be downloaded.') }
  }
  if (loading) return <div className="py-5 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>
  if (!jobs.length && !error) return null
  return <div className="rounded-xl border border-gray-200 overflow-hidden"><div className="px-4 py-3 bg-gray-50 flex items-center justify-between"><div><h3 className="text-sm font-semibold text-gray-800">Bulk generation jobs</h3><p className="text-[10px] text-gray-400">Results remain downloadable for seven days.</p></div><button onClick={load} className="marketing-button-secondary"><RefreshCw className="w-3.5 h-3.5" /></button></div>{error && <p className="px-4 py-2 text-xs text-red-600">{error}</p>}<div className="divide-y divide-gray-100">{jobs.map(job => <div key={job._id} className="px-4 py-3 flex items-center justify-between gap-3"><div><p className="text-xs font-semibold text-gray-700">{job.codePrefix}-… · {job.generatedCount}/{job.requestedCount}</p><p className="text-[10px] text-gray-400">{job.status.replaceAll('_', ' ')} · {new Date(job.createdAt).toLocaleString('en-AU')}</p>{job.lastErrorCode && <p className="text-[10px] text-red-500">{job.lastErrorCode}</p>}</div>{canExport && ['completed', 'partial_failed'].includes(job.status) && <button onClick={() => download(job)} className="marketing-button-secondary"><Download className="w-3.5 h-3.5" /> CSV</button>}{['pending', 'processing', 'retry_scheduled'].includes(job.status) && <Loader2 className="w-4 h-4 animate-spin text-violet-500" />}</div>)}</div></div>
}
