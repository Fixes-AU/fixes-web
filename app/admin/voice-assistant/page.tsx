'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Loader2,
  MessageSquareText,
  PhoneCall,
  RefreshCw,
  ShieldAlert,
  Smartphone,
  Volume2,
  X,
} from 'lucide-react'
import { api, ApiError } from '@/lib/api'

type OperationalState = {
  available: boolean
  environmentEnabled: boolean
  configurationValid: boolean
  configurationErrorCount: number
  intakeEnabled: boolean
  killSwitchActive: boolean
  killSwitchReason?: string
  transferOpen: boolean
  updatedAt: string
}
type Configuration = {
  enabled: boolean
  publicBaseUrlConfigured: boolean
  webBaseUrlConfigured: boolean
  disclosureVersion: string
  retention: { draftLinkMs: number; draftContentMs: number; recordingMs: number; metricsMs: number }
  sms: { maxSends: number; resendCooldownMs: number }
  providersConfigured: { twilio: boolean; deepgram: boolean; anthropic: boolean; elevenLabs: boolean }
}
type Metrics = { days: number; calls: number; drafts: number; reviewReady: number; converted: number; smsAccepted: number; transferred: number; callbacks: number; failed: number }
type DraftSummary = {
  publicId: string
  status: string
  category?: string
  title?: string
  missingFields?: string[]
  sms?: { deliveryStatus?: string; sendState?: string; sendAttempts?: number; errorCode?: string }
  finalJobId?: string
  convertedAt?: string
}
type VoiceCall = {
  id: string
  callSid: string
  status: string
  callerMasked: string
  disclosure: { completedAt?: string; legalBasis?: string; objectedAt?: string }
  recording: { available: boolean; status?: string; durationSeconds?: number; deleteAfter?: string; errorCode?: string }
  providerContext?: { speechToText?: string; languageModel?: string; textToSpeech?: string; promptVersion?: string }
  startedAt: string
  answeredAt?: string
  endedAt?: string
  outcome?: string
  transfer?: { status?: string; requestedAt?: string; failureCode?: string }
  callbackRequest?: { status?: string; requestedAt?: string; reason?: string } | null
  error?: { code?: string; provider?: string; recovered?: boolean }
  draft?: DraftSummary | null
}
type CallDetail = {
  call: VoiceCall
  draft?: (DraftSummary & { payload?: Record<string, unknown>; fieldProvenance?: Record<string, unknown> }) | null
  transcript: Array<{ id: string; sequence: number; speaker: string; text: string; confidence?: number; createdAt: string }>
}

const badgeClasses: Record<string, string> = {
  active: 'bg-green-50 text-green-700',
  completed: 'bg-blue-50 text-blue-700',
  transferred: 'bg-violet-50 text-violet-700',
  failed: 'bg-red-50 text-red-700',
  abandoned: 'bg-amber-50 text-amber-700',
  notice_pending: 'bg-gray-100 text-gray-700',
  initiated: 'bg-gray-100 text-gray-700',
  transferring: 'bg-violet-50 text-violet-700',
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClasses[status] || 'bg-gray-100 text-gray-700'}`}>{status.replaceAll('_', ' ')}</span>
}

function time(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' })
}

function duration(seconds?: number) {
  if (seconds == null) return '—'
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

export default function VoiceAssistantAdminPage() {
  const [state, setState] = useState<OperationalState | null>(null)
  const [configuration, setConfiguration] = useState<Configuration | null>(null)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [calls, setCalls] = useState<VoiceCall[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<CallDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [settingsWorking, setSettingsWorking] = useState(false)
  const [recordingUrl, setRecordingUrl] = useState('')
  const [recordingLoading, setRecordingLoading] = useState(false)
  const [callbackPhone, setCallbackPhone] = useState('')
  const [callbackPhoneLoading, setCallbackPhoneLoading] = useState(false)

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: '25' })
    if (status) params.set('status', status)
    if (search.trim().length >= 3) params.set('search', search.trim())
    return params.toString()
  }, [page, search, status])

  const load = useCallback(async (quiet = false) => {
    quiet ? setRefreshing(true) : setLoading(true)
    setError('')
    try {
      const [statusResponse, callsResponse] = await Promise.all([
        api.get<{ state: OperationalState; configuration: Configuration; metrics: Metrics }>('/api/voice-assistant/admin/status'),
        api.get<{ calls: VoiceCall[]; pagination: { totalPages: number } }>(`/api/voice-assistant/admin/calls?${query}`),
      ])
      setState(statusResponse.data.state)
      setConfiguration(statusResponse.data.configuration)
      setMetrics(statusResponse.data.metrics)
      setCalls(callsResponse.data.calls)
      setTotalPages(Math.max(1, callsResponse.data.pagination.totalPages || 1))
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Call-assistant monitoring could not be loaded.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [query])

  useEffect(() => { load() }, [load])
  useEffect(() => () => {
    if (recordingUrl) URL.revokeObjectURL(recordingUrl)
  }, [recordingUrl])

  const openDetail = async (call: VoiceCall) => {
    if (recordingUrl) URL.revokeObjectURL(recordingUrl)
    setRecordingUrl('')
    setCallbackPhone('')
    setDetailLoading(true)
    setError('')
    try {
      const response = await api.get<CallDetail>(`/api/voice-assistant/admin/calls/${call.id}`)
      setSelected(response.data)
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Call details could not be loaded.')
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDetail = () => {
    if (recordingUrl) URL.revokeObjectURL(recordingUrl)
    setRecordingUrl('')
    setCallbackPhone('')
    setSelected(null)
  }

  const loadRecording = async () => {
    if (!selected?.call.recording.available) return
    setRecordingLoading(true)
    setError('')
    try {
      const blob = await api.getBlob(`/api/voice-assistant/admin/calls/${selected.call.id}/recording`)
      if (recordingUrl) URL.revokeObjectURL(recordingUrl)
      setRecordingUrl(URL.createObjectURL(blob))
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'The call recording could not be loaded.')
    } finally {
      setRecordingLoading(false)
    }
  }

  const loadCallbackPhone = async () => {
    if (!selected?.call.callbackRequest) return
    setCallbackPhoneLoading(true)
    setError('')
    try {
      const response = await api.get<{ phone: string }>(`/api/voice-assistant/admin/calls/${selected.call.id}/callback-number`)
      setCallbackPhone(response.data.phone)
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'The callback number could not be loaded.')
    } finally {
      setCallbackPhoneLoading(false)
    }
  }

  const updateSettings = async (patch: Record<string, unknown>) => {
    setSettingsWorking(true)
    setError('')
    try {
      await api.patch('/api/voice-assistant/admin/settings', patch)
      await load(true)
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'The service setting could not be changed.')
    } finally {
      setSettingsWorking(false)
    }
  }

  if (loading) return <div className="flex min-h-[55vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>

  const providerCount = configuration ? Object.values(configuration.providersConfigured).filter(Boolean).length : 0
  const healthy = Boolean(state?.available)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><div className="flex items-center gap-2"><PhoneCall className="h-6 w-6 text-blue-600" /><h1 className="text-2xl font-bold text-gray-900">AI Call Assistant</h1></div><p className="mt-1 text-sm text-gray-500">Understand calls, drafts, messages, transfers, conversions and failures in one place.</p></div>
        <button type="button" onClick={() => load(true)} disabled={refreshing} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh</button>
      </div>

      {error && <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Overall health</p><p className={`mt-3 flex items-center gap-2 text-lg font-bold ${healthy ? 'text-green-700' : 'text-amber-700'}`}>{healthy ? <CheckCircle2 className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}{healthy ? 'Ready for calls' : 'Not accepting calls'}</p><p className="mt-1 text-xs text-gray-500">Environment, config and kill switch combined</p></div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Environment</p><p className="mt-3 text-lg font-bold text-gray-900">{state?.environmentEnabled ? 'Enabled' : 'Disabled'}</p><p className="mt-1 text-xs text-gray-500">{state?.configurationValid ? 'Configuration is valid' : `${state?.configurationErrorCount || 0} configuration issue(s)`}</p></div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Providers</p><p className="mt-3 text-lg font-bold text-gray-900">{providerCount}/4 configured</p><p className="mt-1 text-xs text-gray-500">Twilio, speech, AI and voice</p></div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Human transfer</p><p className={`mt-3 text-lg font-bold ${state?.transferOpen ? 'text-green-700' : 'text-gray-700'}`}>{state?.transferOpen ? 'Open now' : 'Closed now'}</p><p className="mt-1 text-xs text-gray-500">Sydney business-hours policy</p></div>
      </div>

      {metrics && <div className="grid grid-cols-2 gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-4 lg:grid-cols-8">{[['Calls', metrics.calls], ['Drafts', metrics.drafts], ['Review ready', metrics.reviewReady], ['SMS accepted', metrics.smsAccepted], ['Converted', metrics.converted], ['Transferred', metrics.transferred], ['Callbacks', metrics.callbacks], ['Failed', metrics.failed]].map(([label, value]) => <div key={String(label)}><p className="text-xl font-bold text-gray-900">{value}</p><p className="text-[11px] text-gray-500">{label}</p></div>)}<p className="col-span-2 text-[10px] text-gray-400 sm:col-span-4 lg:col-span-8">Content-free service totals for the last {metrics.days} days.</p></div>}

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="font-bold text-gray-900">Service controls</h2><p className="mt-1 text-sm text-gray-500">These controls stop or allow new AI calls without a deployment.</p></div><div className="flex flex-col gap-2 sm:flex-row"><button type="button" disabled={settingsWorking || !state} onClick={() => updateSettings({ intakeEnabled: !state?.intakeEnabled })} className={`rounded-lg px-4 py-2 text-sm font-semibold ${state?.intakeEnabled ? 'border border-gray-300 bg-white text-gray-700' : 'bg-blue-600 text-white'}`}>{state?.intakeEnabled ? 'Pause new calls' : 'Allow new calls'}</button><button type="button" disabled={settingsWorking || !state} onClick={() => updateSettings({ killSwitchActive: !state?.killSwitchActive, killSwitchReason: state?.killSwitchActive ? '' : 'Disabled from admin monitoring' })} className={`rounded-lg px-4 py-2 text-sm font-semibold ${state?.killSwitchActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{state?.killSwitchActive ? 'Release kill switch' : 'Activate kill switch'}</button></div></div>
        {state?.killSwitchActive && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">Kill switch is active. New calls must use the configured human/after-hours fallback. {state.killSwitchReason && `Reason: ${state.killSwitchReason}`}</div>}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-gray-900">Recent calls</h2><p className="text-xs text-gray-500">Phone numbers are masked; open a call for its authorized transcript.</p></div><div className="flex flex-col gap-2 sm:flex-row"><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search call ID or masked number" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" /><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm"><option value="">All statuses</option>{['notice_pending','active','transferring','transferred','completed','failed','abandoned'].map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}</select></div></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-4 py-3">Caller / started</th><th className="px-4 py-3">Call</th><th className="px-4 py-3">Draft</th><th className="px-4 py-3">SMS</th><th className="px-4 py-3">Recording</th><th className="px-4 py-3">Outcome</th></tr></thead><tbody className="divide-y divide-gray-100">{calls.map((call) => <tr key={call.id} onClick={() => openDetail(call)} className="cursor-pointer hover:bg-blue-50/40"><td className="px-4 py-4"><p className="font-semibold text-gray-900">{call.callerMasked}</p><p className="mt-1 text-xs text-gray-400">{time(call.startedAt)}</p></td><td className="px-4 py-4"><StatusBadge status={call.status} /><p className="mt-1 max-w-[170px] truncate font-mono text-[10px] text-gray-400">{call.callSid}</p></td><td className="px-4 py-4">{call.draft ? <><p className="font-medium text-gray-800">{call.draft.title || 'Untitled draft'}</p><p className="mt-1 text-xs capitalize text-gray-500">{call.draft.category || 'No category'} · {call.draft.status.replaceAll('_', ' ')}</p></> : <span className="text-gray-400">No draft</span>}</td><td className="px-4 py-4"><p className="capitalize text-gray-700">{call.draft?.sms?.deliveryStatus || call.draft?.sms?.sendState || 'Not sent'}</p>{call.draft?.sms?.errorCode && <p className="text-xs text-red-600">Error {call.draft.sms.errorCode}</p>}</td><td className="px-4 py-4"><p className="text-gray-700">{call.recording.available ? duration(call.recording.durationSeconds) : 'Unavailable'}</p><p className="text-xs capitalize text-gray-400">{call.recording.status || 'No recording'}</p></td><td className="px-4 py-4"><p className="text-gray-700">{call.outcome || call.error?.code || '—'}</p>{call.error?.recovered && <span className="text-xs text-green-600">Recovered</span>}</td></tr>)}</tbody></table></div>
        {!calls.length && <div className="py-14 text-center"><PhoneCall className="mx-auto h-9 w-9 text-gray-300" /><p className="mt-3 font-medium text-gray-600">No calls match these filters</p></div>}
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-gray-500"><span>Page {page} of {totalPages}</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-gray-200 p-2 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-gray-200 p-2 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>
      </div>

      {selected?.call.callbackRequest?.status === 'requested' && <div className="fixed right-4 top-24 z-[60] w-[calc(100%-2rem)] max-w-xl rounded-xl border border-amber-200 bg-white p-4 shadow-2xl sm:right-8 sm:w-72"><p className="text-sm font-semibold text-gray-900">Callback requested</p><p className="mt-1 text-xs text-gray-500">{selected.call.callbackRequest.reason || 'The caller asked the Fixes team to call back.'}</p>{callbackPhone ? <a href={`tel:${callbackPhone}`} className="mt-3 block rounded-lg bg-[var(--upwork-green)] px-3 py-2 text-center text-sm font-semibold text-white">Call {callbackPhone}</a> : <button type="button" onClick={loadCallbackPhone} disabled={callbackPhoneLoading} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 disabled:opacity-50">{callbackPhoneLoading && <Loader2 className="h-4 w-4 animate-spin" />} Reveal callback number</button>}<p className="mt-2 text-[11px] text-gray-500">Number access is permission-controlled and audited.</p></div>}

      {selected?.call.recording.available && <div className="fixed bottom-4 right-4 z-[60] w-[calc(100%-2rem)] max-w-xl rounded-xl border border-gray-200 bg-white p-4 shadow-2xl sm:right-8 sm:w-72"><p className="flex items-center gap-2 text-sm font-semibold text-gray-900"><Volume2 className="h-4 w-4 text-blue-600" /> Secure call recording</p>{recordingUrl ? <audio controls preload="metadata" src={recordingUrl} className="mt-3 w-full" /> : <button type="button" onClick={loadRecording} disabled={recordingLoading} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{recordingLoading && <Loader2 className="h-4 w-4 animate-spin" />} Load recording</button>}<p className="mt-2 text-[11px] text-gray-500">Playback is audited and the audio expires after 30 days.</p></div>}

      {(selected || detailLoading) && <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={closeDetail}><div className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>{detailLoading && !selected ? <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div> : selected && <><div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4"><div><h2 className="font-bold text-gray-900">Call details</h2><p className="font-mono text-xs text-gray-400">{selected.call.callSid}</p></div><button type="button" onClick={closeDetail} className="rounded-lg p-2 hover:bg-gray-100"><X className="h-5 w-5" /></button></div><div className="space-y-5 p-5"><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-gray-50 p-4"><p className="text-xs text-gray-400">Caller</p><p className="mt-1 font-semibold text-gray-900">{selected.call.callerMasked}</p></div><div className="rounded-xl bg-gray-50 p-4"><p className="text-xs text-gray-400">Status</p><div className="mt-1"><StatusBadge status={selected.call.status} /></div></div><div className="rounded-xl bg-gray-50 p-4"><p className="text-xs text-gray-400">Recording</p><p className="mt-1 font-semibold text-gray-900">{selected.call.recording.available ? duration(selected.call.recording.durationSeconds) : 'Unavailable'}</p></div></div><div className="rounded-xl border border-gray-200 p-4"><h3 className="flex items-center gap-2 font-semibold text-gray-900"><FileText className="h-4 w-4 text-blue-600" /> Extracted job draft</h3>{selected.draft ? <div className="mt-3 space-y-2 text-sm"><p><span className="text-gray-400">Title:</span> {selected.draft.title || 'Untitled'}</p><p><span className="text-gray-400">Category:</span> {selected.draft.category || 'Not selected'}</p><p><span className="text-gray-400">Status:</span> {selected.draft.status.replaceAll('_', ' ')}</p>{selected.draft.missingFields?.length ? <p className="text-amber-700">Missing: {selected.draft.missingFields.join(', ')}</p> : <p className="text-green-700">All required call fields collected</p>}</div> : <p className="mt-3 text-sm text-gray-500">No draft was created during this call.</p>}</div><div className="rounded-xl border border-gray-200 p-4"><h3 className="flex items-center gap-2 font-semibold text-gray-900"><MessageSquareText className="h-4 w-4 text-blue-600" /> Transcript</h3><div className="mt-4 space-y-3">{selected.transcript.map((turn) => <div key={turn.id} className={`max-w-[90%] rounded-xl px-4 py-3 text-sm ${turn.speaker === 'caller' ? 'mr-auto bg-gray-100 text-gray-800' : 'ml-auto bg-blue-50 text-blue-900'}`}><p className="mb-1 text-[10px] font-bold uppercase tracking-wide opacity-60">{turn.speaker}</p><p className="whitespace-pre-wrap leading-6">{turn.text}</p></div>)}{!selected.transcript.length && <p className="text-sm text-gray-500">No transcript turns were stored.</p>}</div></div><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-gray-200 p-4"><p className="flex items-center gap-2 text-sm font-semibold text-gray-900"><Smartphone className="h-4 w-4" /> SMS</p><p className="mt-2 text-sm capitalize text-gray-600">{selected.call.draft?.sms?.deliveryStatus || 'Not sent'}</p></div><div className="rounded-xl border border-gray-200 p-4"><p className="flex items-center gap-2 text-sm font-semibold text-gray-900"><Clock3 className="h-4 w-4" /> Timeline</p><p className="mt-2 text-xs text-gray-500">Started {time(selected.call.startedAt)}</p><p className="text-xs text-gray-500">Ended {time(selected.call.endedAt)}</p></div></div><div className="rounded-xl bg-gray-50 p-4 text-xs text-gray-500"><p className="flex items-center gap-2 font-semibold text-gray-700"><Bot className="h-4 w-4" /> Provider context</p><p className="mt-2">Speech: {selected.call.providerContext?.speechToText || 'Not recorded'} · AI: {selected.call.providerContext?.languageModel || 'Not recorded'} · Voice: {selected.call.providerContext?.textToSpeech || 'Not recorded'}</p></div></div></>}</div></div>}
    </div>
  )
}
