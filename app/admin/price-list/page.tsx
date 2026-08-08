'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { Loader2, Save, Plus, Search, TestTube, Settings, List, Trash2, DollarSign, Upload, X, ChevronDown, ChevronUp, Sparkles, Cpu, Scale, BarChart3, Image as ImageIcon, Clock, MapPin, AlertTriangle, Info, Zap } from 'lucide-react'
import { api } from '@/lib/api'
import { uploadFile } from '@/lib/uploadService'
import { CATEGORY_LABELS, AUSTRALIAN_STATES } from '@/lib/constants'
import AdminActionConfirmDialog from '@/components/admin/AdminActionConfirmDialog'

interface PriceListEntry {
  _id: string
  category: string
  entryType: string
  serviceName: string
  price: number
  priceType: string
  unit: string
  sizeVariant: string | null
  bedroomCount: number | null
  isActive: boolean
  source: string
}

interface PriceListConfig {
  algorithmWeight: number
  aiWeight: number
  highConfidenceThreshold: number
  lowConfidenceThreshold: number
  enableAlgorithmPricing: boolean
  materialMarkupPercent: number
  maxDeviationPercent: number
}

interface AlgorithmTestResult {
  enabled: boolean
  price: number | null
  confidence: number
  matchResult?: {
    services: Array<{ serviceName: string; price: number; matchScore: number }>
    materials: Array<{ serviceName: string; price: number }>
    callouts: Array<{ serviceName: string; price: number }>
    bestMatch: { serviceName: string; price: number; matchScore: number } | null
  }
  priceBreakdown?: Record<string, unknown>
  latencyMs: number
}

interface QuoteOption {
  tier: string
  price?: { min: number; max: number }
  suggestedFixedPrice: number
  confidence: number
  reasoning?: string
  gstAmount?: number
  totalIncGst?: number
  [key: string]: unknown
}

interface SimulationResult {
  quotes: QuoteOption[]
  morningOptions?: QuoteOption[]
  weekdayOptions?: QuoteOption[]
  detectedCategory: string
  isLargeProject: boolean
  telemetry: {
    inputTitle?: string
    inputCategory?: string
    imageCount?: number
    isAfterHours?: boolean
    isWeekend?: boolean
    success?: boolean
    engine?: string
    modelVersion?: string
    latencyMs?: number
    finishReason?: string
    tokensIn?: number
    tokensOut?: number
    tokensTotal?: number
    safetyRatings?: Array<{ category: string; probability: string }>
    rawOutputPreview?: string
    thinkingSteps?: string[]
    _partsDetected?: string[]
    _algorithmResult?: {
      price: number | null
      confidence: number
      matchedService?: string
      latencyMs?: number
      matchResult?: {
        services: Array<{ serviceName: string; price: number; matchScore: number }>
        materials: Array<{ serviceName: string; price: number; matchScore?: number }>
        callouts: Array<{ serviceName: string; price: number }>
        bestMatch: { serviceName: string; price: number; matchScore: number } | null
      }
      priceBreakdown?: Record<string, unknown>
    } | null
    _reconciliation?: {
      finalPrice: number
      source: string
      aiPrice?: number
      algorithmPrice?: number
      aiWeight?: number
      algorithmWeight?: number
      deviationPercent?: number
      reason?: string
      breakdown?: Record<string, unknown>
    } | null
    [key: string]: unknown
  }
  simulationMeta: {
    isAfterHours: boolean
    isWeekend: boolean
    timezone: string
    imageCount: number
    location: { suburb: string; state: string }
  }
}

interface UploadedImage {
  url: string
  publicId: string
  uploading?: boolean
  localPreview?: string
}

const CATEGORIES = [
  'electrical', 'plumbing', 'hvac', 'plastering', 'painting',
  'flooring', 'carpentry', 'roofing', 'emergency_make_safe', 'general_labourer',
  'handyman', 'gardening_landscaping', 'auto_care', 'cleaning', 'waste_removal',
]

const ENTRY_TYPES = ['service', 'material', 'callout', 'hourly_rate']

type Tab = 'entries' | 'config' | 'test'

export default function PriceListPage() {
  const [tab, setTab] = useState<Tab>('entries')
  const [entries, setEntries] = useState<PriceListEntry[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [search, setSearch] = useState('')
  const [config, setConfig] = useState<PriceListConfig | null>(null)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null)
  const [actionLabel, setActionLabel] = useState('')

  const [testTitle, setTestTitle] = useState('')
  const [testDescription, setTestDescription] = useState('')
  const [testCategory, setTestCategory] = useState('electrical')
  const [testResult, setTestResult] = useState<AlgorithmTestResult | null>(null)
  const [isTesting, setIsTesting] = useState(false)

  // Simulator state
  const [simTitle, setSimTitle] = useState('')
  const [simDescription, setSimDescription] = useState('')
  const [simCategory, setSimCategory] = useState('electrical')
  const [simImages, setSimImages] = useState<UploadedImage[]>([])
  const [simSuburb, setSimSuburb] = useState('Sydney')
  const [simState, setSimState] = useState('NSW')
  const [simPreferredTime, setSimPreferredTime] = useState<string>('now')
  const [simScheduledFor, setSimScheduledFor] = useState('')
  const [simForceAfterHours, setSimForceAfterHours] = useState<boolean | null>(null)
  const [simForceWeekend, setSimForceWeekend] = useState<boolean | null>(null)
  const [simResult, setSimResult] = useState<SimulationResult | null>(null)
  const [simError, setSimError] = useState<string | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [expandedTelemetry, setExpandedTelemetry] = useState(false)
  const [expandedRawOutput, setExpandedRawOutput] = useState(false)
  const [expandedReasoningIdx, setExpandedReasoningIdx] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState('')

  const fetchEntries = useCallback(async () => {
    setIsLoading(true)
    try {
      const qs = new URLSearchParams()
      qs.set('page', String(page))
      qs.set('limit', '30')
      if (categoryFilter) qs.set('category', categoryFilter)
      if (typeFilter) qs.set('entryType', typeFilter)
      if (search) qs.set('search', search)
      const res = await api.getPaginated<PriceListEntry>(`/api/admin/price-list?${qs}`)
      setEntries(res.data || [])
      setTotal(res.pagination?.total || 0)
    } catch { /* silent */ } finally { setIsLoading(false) }
  }, [page, categoryFilter, typeFilter, search])

  const fetchConfig = useCallback(async () => {
    try {
      const res = await api.get<PriceListConfig>('/api/admin/price-list/config')
      setConfig(res.data)
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    if (tab === 'entries') fetchEntries()
    if (tab === 'config') fetchConfig()
  }, [tab, fetchEntries, fetchConfig])

  const startEdit = (entry: PriceListEntry) => {
    setEditingId(entry._id)
    setEditPrice(String(entry.price))
  }

  const saveEdit = (entryId: string) => {
    setActionLabel('Update price')
    setPendingAction(() => async () => {
      await api.raw(`/api/admin/price-list/${entryId}`, {
        method: 'PATCH',
        body: { price: Number(editPrice) },
        headers: { 'X-Admin-Action-Token': '__TOKEN__' },
      })
      setEditingId(null)
      fetchEntries()
    })
    setShowPasswordDialog(true)
  }

  const handleDelete = (entry: PriceListEntry) => {
    setActionLabel(`Deactivate "${entry.serviceName}"`)
    setPendingAction(() => async () => {
      await api.raw(`/api/admin/price-list/${entry._id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Action-Token': '__TOKEN__' },
      })
      fetchEntries()
    })
    setShowPasswordDialog(true)
  }

  const saveConfig = () => {
    if (!config) return
    setActionLabel('Update pricing algorithm config')
    setPendingAction(() => async () => {
      await api.raw('/api/admin/price-list/config', {
        method: 'PATCH',
        body: config,
        headers: { 'X-Admin-Action-Token': '__TOKEN__' },
      })
      fetchConfig()
    })
    setShowPasswordDialog(true)
  }

  const runTest = async () => {
    if (!testTitle || !testCategory) return
    setIsTesting(true)
    setTestResult(null)
    try {
      const res = await api.post<AlgorithmTestResult>('/api/admin/price-list/test-match', {
        title: testTitle,
        description: testDescription,
        category: testCategory,
      })
      setTestResult(res.data)
    } catch { /* silent */ } finally { setIsTesting(false) }
  }

  const handleImageUpload = async (files: FileList) => {
    setIsUploadingImage(true)
    const newImages: UploadedImage[] = []
    for (const file of Array.from(files)) {
      try {
        const { url, publicId } = await uploadFile(file, 'jobs')
        newImages.push({ url, publicId })
      } catch (err) {
        console.error('Image upload failed:', err)
      }
    }
    setSimImages(prev => [...prev, ...newImages])
    setIsUploadingImage(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (idx: number) => {
    setSimImages(prev => prev.filter((_, i) => i !== idx))
  }

  const runSimulation = async () => {
    if (!simTitle || !simDescription || !simCategory) return
    setIsSimulating(true)
    setSimResult(null)
    setSimError(null)
    try {
      const body: Record<string, unknown> = {
        title: simTitle,
        description: simDescription,
        category: simCategory,
        imageUrls: simImages.map(img => img.url),
        location: { suburb: simSuburb || 'Sydney', state: simState || 'NSW' },
        preferredTime: simPreferredTime,
        diagnosticAnswers: {},
      }
      if (simPreferredTime === 'scheduled' && simScheduledFor) {
        body.scheduledFor = new Date(simScheduledFor).toISOString()
      }
      if (simForceAfterHours !== null) body.isAfterHours = simForceAfterHours
      if (simForceWeekend !== null) body.isWeekend = simForceWeekend

      const res = await api.post<SimulationResult>('/api/admin/price-list/simulate', body)
      setSimResult(res.data)
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err: unknown) {
      setSimError(err instanceof Error ? err.message : 'Simulation failed')
    } finally {
      setIsSimulating(false)
    }
  }

  const executeAction = async (token: string) => {
    if (!pendingAction) return
    const fn = pendingAction
    await fn()
  }

  const totalPages = Math.ceil(total / 30)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Price List Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage pricing data, algorithm configuration, and test matches</p>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {([['entries', 'Entries', List], ['config', 'Config', Settings], ['test', 'Simulator', Sparkles]] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? 'bg-white text-[#2563EB] shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ─── ENTRIES TAB ──────────────────────────── */}
      {tab === 'entries' && (
        <div>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{(CATEGORY_LABELS as any)[c] || c}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
            >
              <option value="">All Types</option>
              {ENTRY_TYPES.map(t => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
            <span className="self-center text-xs text-gray-400">{total} entries</span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Service</th>
                      <th className="text-left px-4 py-3 font-medium">Category</th>
                      <th className="text-left px-4 py-3 font-medium">Type</th>
                      <th className="text-right px-4 py-3 font-medium">Price</th>
                      <th className="text-left px-4 py-3 font-medium">Unit</th>
                      <th className="text-center px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {entries.map(entry => (
                      <tr key={entry._id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{entry.serviceName}</td>
                        <td className="px-4 py-3 text-gray-600">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                            {(CATEGORY_LABELS as any)[entry.category] || entry.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 capitalize">{entry.entryType.replace('_', ' ')}</td>
                        <td className="px-4 py-3 text-right font-mono">
                          {editingId === entry._id ? (
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-20 px-2 py-1 border rounded text-right text-sm"
                              autoFocus
                            />
                          ) : (
                            <span className="cursor-pointer hover:text-blue-600" onClick={() => startEdit(entry)}>
                              ${entry.price.toLocaleString()}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{entry.unit}</td>
                        <td className="px-4 py-3 text-center">
                          {editingId === entry._id ? (
                            <div className="flex gap-1 justify-center">
                              <button onClick={() => saveEdit(entry._id)} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100">Save</button>
                              <button onClick={() => setEditingId(null)} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded hover:bg-gray-100">Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => handleDelete(entry)} className="text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40">Previous</button>
                  <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ─── CONFIG TAB ──────────────────────────── */}
      {tab === 'config' && config && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Algorithm Settings</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-gray-500">{config.enableAlgorithmPricing ? 'Active' : 'Disabled'}</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={config.enableAlgorithmPricing}
                    onChange={(e) => setConfig({ ...config, enableAlgorithmPricing: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
                </div>
              </label>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-500 mb-3">Price Blending Weights</p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Algorithm: {Math.round(config.algorithmWeight * 100)}%</span>
                    <span>AI: {Math.round(config.aiWeight * 100)}%</span>
                  </div>
                  <input
                    type="range" min="0" max="100" step="5"
                    value={Math.round(config.algorithmWeight * 100)}
                    onChange={(e) => {
                      const algoW = Number(e.target.value) / 100
                      setConfig({ ...config, algorithmWeight: algoW, aiWeight: Math.round((1 - algoW) * 100) / 100 })
                    }}
                    className="w-full h-2 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>100% Algorithm</span>
                    <span>50/50</span>
                    <span>100% AI</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">High Confidence</label>
                <input
                  type="number" step="0.05" min="0" max="1"
                  value={config.highConfidenceThreshold}
                  onChange={(e) => setConfig({ ...config, highConfidenceThreshold: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Low Confidence</label>
                <input
                  type="number" step="0.05" min="0" max="1"
                  value={config.lowConfidenceThreshold}
                  onChange={(e) => setConfig({ ...config, lowConfidenceThreshold: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Material Markup %</label>
                <input
                  type="number" step="5" min="0" max="100"
                  value={config.materialMarkupPercent}
                  onChange={(e) => setConfig({ ...config, materialMarkupPercent: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Max Deviation %</label>
                <input
                  type="number" step="5" min="10" max="100"
                  value={config.maxDeviationPercent}
                  onChange={(e) => setConfig({ ...config, maxDeviationPercent: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>

            <button
              onClick={saveConfig}
              className="flex items-center gap-1.5 bg-[#2563EB] text-white text-sm font-medium py-2 px-4 rounded-xl hover:bg-[#1d4ed8] transition-colors"
            >
              <Save className="w-4 h-4" /> Save Config
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Split</h3>
              <div className="flex items-center justify-center gap-3">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-400 flex items-center justify-center">
                    <span className="text-sm font-bold text-emerald-700">{Math.round(config.algorithmWeight * 100)}%</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1.5">Algorithm</p>
                </div>
                <span className="text-gray-300 text-lg">+</span>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-50 border-4 border-blue-400 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-700">{Math.round(config.aiWeight * 100)}%</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1.5">Gemini AI</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 space-y-1.5">
              <p className="font-semibold text-sm">How it works</p>
              <p>• Matches job descriptions to price list entries using keyword scoring</p>
              <p>• Final price = (AI × {Math.round(config.aiWeight * 100)}%) + (Algo × {Math.round(config.algorithmWeight * 100)}%)</p>
              <p>• High confidence (&gt;{config.highConfidenceThreshold}) boosts algorithm weight by +15%</p>
              <p>• Deviation &gt;{config.maxDeviationPercent}% → higher-confidence source wins outright</p>
              <p>• Materials marked up by {config.materialMarkupPercent}% (retail → client price)</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── SIMULATOR TAB ──────────────────────────── */}
      {tab === 'test' && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column — Simulator Form */}
          <div className="w-full lg:w-[440px] lg:flex-shrink-0 lg:sticky lg:top-4 lg:self-start space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div>
                <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Job Posting Simulator
                </h2>
                <p className="text-xs text-gray-500 mt-1">Run the full AI + algorithm pricing pipeline without creating real jobs</p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Trade Category</label>
                <select
                  value={simCategory}
                  onChange={(e) => setSimCategory(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{(CATEGORY_LABELS as Record<string, string>)[c] || c}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-medium text-gray-500">Job Title</label>
                  <span className="text-[10px] text-gray-400">{simTitle.length}/150</span>
                </div>
                <input
                  type="text"
                  maxLength={150}
                  placeholder="e.g. Install ceiling fan in master bedroom"
                  value={simTitle}
                  onChange={(e) => setSimTitle(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Description */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-medium text-gray-500">Description</label>
                  <span className="text-[10px] text-gray-400">{simDescription.length}/2000</span>
                </div>
                <textarea
                  maxLength={2000}
                  rows={4}
                  placeholder="Describe the job as a customer would..."
                  value={simDescription}
                  onChange={(e) => setSimDescription(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Photos */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Photos <span className="text-gray-400">(optional — sent to Gemini AI)</span>
                </label>
                <div
                  onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                >
                  {isUploadingImage ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                      <span className="text-xs text-gray-500">Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Click to upload images</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG up to 10MB</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                />
                {simImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {simImages.map((img, i) => (
                      <div key={img.publicId} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <img src={img.url} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={(e) => { e.stopPropagation(); removeImage(i) }}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Suburb"
                    value={simSuburb}
                    onChange={(e) => setSimSuburb(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <select
                    value={simState}
                    onChange={(e) => setSimState(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {AUSTRALIAN_STATES.map(s => (
                      <option key={s.value} value={s.value}>{s.value}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Timing */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Preferred Timing</label>
                <select
                  value={simPreferredTime}
                  onChange={(e) => setSimPreferredTime(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="now">Now</option>
                  <option value="scheduled">Schedule for Later</option>
                  <option value="1-2weeks">In 1-2 Weeks</option>
                  <option value="no-rush">No Rush</option>
                </select>
                {simPreferredTime === 'scheduled' && (
                  <input
                    type="datetime-local"
                    value={simScheduledFor}
                    onChange={(e) => setSimScheduledFor(e.target.value)}
                    className="w-full mt-2 px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                )}
              </div>

              {/* Advanced overrides */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                Advanced Overrides
              </button>
              {showAdvanced && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-3 border border-gray-100">
                  <p className="text-[10px] text-gray-500">Override auto-detected time context for testing surcharges</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Force After-Hours</span>
                    <div className="flex gap-1.5">
                      {(['auto', 'on', 'off'] as const).map(opt => (
                        <button
                          key={opt}
                          onClick={() => setSimForceAfterHours(opt === 'auto' ? null : opt === 'on')}
                          className={`px-2 py-1 text-[10px] rounded font-medium transition-colors ${
                            (simForceAfterHours === null && opt === 'auto') ||
                            (simForceAfterHours === true && opt === 'on') ||
                            (simForceAfterHours === false && opt === 'off')
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {opt === 'auto' ? 'Auto' : opt === 'on' ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Force Weekend</span>
                    <div className="flex gap-1.5">
                      {(['auto', 'on', 'off'] as const).map(opt => (
                        <button
                          key={opt}
                          onClick={() => setSimForceWeekend(opt === 'auto' ? null : opt === 'on')}
                          className={`px-2 py-1 text-[10px] rounded font-medium transition-colors ${
                            (simForceWeekend === null && opt === 'auto') ||
                            (simForceWeekend === true && opt === 'on') ||
                            (simForceWeekend === false && opt === 'off')
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {opt === 'auto' ? 'Auto' : opt === 'on' ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={runSimulation}
                disabled={isSimulating || !simTitle.trim() || !simDescription.trim() || !simCategory}
                className="w-full flex items-center justify-center gap-2 bg-[#2563EB] text-white text-sm font-medium py-3 px-4 rounded-xl hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSimulating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing with Gemini AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Run Full Simulation
                  </>
                )}
              </button>

              {/* Cost note */}
              <p className="text-[10px] text-center text-gray-400">
                Each simulation makes a real Gemini API call (small token cost)
              </p>
            </div>
          </div>

          {/* Right column — Results + Info */}
          <div className="flex-1 min-w-0 space-y-6" ref={resultsRef}>
            {/* Empty state */}
            {!simResult && !isSimulating && !simError && (
              <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-12 flex flex-col items-center justify-center text-center">
                <Sparkles className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-400">No simulation run yet</p>
                <p className="text-xs text-gray-400 mt-1 max-w-sm">Fill out the job details on the left and click &quot;Run Full Simulation&quot; to see how the complete pricing pipeline would handle it</p>
              </div>
            )}

            {/* Loading state */}
            {isSimulating && (
              <div className="bg-white rounded-xl border border-gray-200 p-12 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                <p className="text-sm font-medium text-gray-600">Running full pricing pipeline...</p>
                <p className="text-xs text-gray-400 mt-1">Gemini AI analysis + Price list algorithm + Reconciliation</p>
                <div className="flex gap-4 mt-4 text-[10px] text-gray-400">
                  <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Analysis</span>
                  <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> Algorithm</span>
                  <span className="flex items-center gap-1"><Scale className="w-3 h-3" /> Reconciliation</span>
                </div>
              </div>
            )}

            {/* Error state */}
            {simError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Simulation Failed</p>
                    <p className="text-xs text-red-600 mt-1">{simError}</p>
                    <button
                      onClick={runSimulation}
                      className="mt-3 text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors font-medium"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {simResult && (
              <>
                {/* Summary KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <p className="text-[10px] uppercase tracking-wide text-green-600 font-semibold">Final Price</p>
                    <p className="text-2xl font-bold text-green-800 mt-1">
                      {simResult.quotes[0]?.suggestedFixedPrice
                        ? `$${simResult.quotes[0].suggestedFixedPrice.toLocaleString()}`
                        : '—'}
                    </p>
                    {simResult.quotes[0]?.totalIncGst && (
                      <p className="text-[10px] text-gray-400 mt-0.5">${simResult.quotes[0].totalIncGst.toLocaleString()} inc. GST</p>
                    )}
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <p className="text-[10px] uppercase tracking-wide text-blue-600 font-semibold">AI Confidence</p>
                    <p className="text-2xl font-bold text-blue-800 mt-1">
                      {simResult.quotes[0]?.confidence != null
                        ? `${Math.round(simResult.quotes[0].confidence * 100)}%`
                        : '—'}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div
                        className="h-1.5 rounded-full bg-blue-500 transition-all"
                        style={{ width: `${Math.round((simResult.quotes[0]?.confidence || 0) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <p className="text-[10px] uppercase tracking-wide text-purple-600 font-semibold">Detected Category</p>
                    <p className="text-sm font-bold text-purple-800 mt-2">
                      {(CATEGORY_LABELS as Record<string, string>)[simResult.detectedCategory] || simResult.detectedCategory}
                    </p>
                    {simResult.detectedCategory !== simCategory && (
                      <p className="text-[10px] text-amber-600 mt-1 font-medium">Re-classified by AI</p>
                    )}
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <p className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">Latency</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      {simResult.telemetry.latencyMs ? `${(simResult.telemetry.latencyMs / 1000).toFixed(1)}s` : '—'}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{simResult.telemetry.engine || 'unknown'}</p>
                  </div>
                </div>

                {/* Meta badges */}
                <div className="flex flex-wrap gap-2">
                  {simResult.simulationMeta.isAfterHours && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-amber-50 text-amber-700 px-2 py-1 rounded-full border border-amber-200">
                      <Clock className="w-3 h-3" /> After-Hours
                    </span>
                  )}
                  {simResult.simulationMeta.isWeekend && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-orange-50 text-orange-700 px-2 py-1 rounded-full border border-orange-200">
                      <Clock className="w-3 h-3" /> Weekend
                    </span>
                  )}
                  {simResult.isLargeProject && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-red-50 text-red-700 px-2 py-1 rounded-full border border-red-200">
                      <AlertTriangle className="w-3 h-3" /> Large Project
                    </span>
                  )}
                  {simResult.simulationMeta.imageCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full border border-blue-200">
                      <ImageIcon className="w-3 h-3" /> {simResult.simulationMeta.imageCount} image{simResult.simulationMeta.imageCount > 1 ? 's' : ''} analyzed
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-gray-50 text-gray-600 px-2 py-1 rounded-full border border-gray-200">
                    <MapPin className="w-3 h-3" /> {simResult.simulationMeta.location.suburb}, {simResult.simulationMeta.location.state}
                  </span>
                </div>

                {/* Quote Options */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    Quote Options ({simResult.quotes.length} tier{simResult.quotes.length !== 1 ? 's' : ''})
                  </h3>
                  <div className="space-y-3">
                    {simResult.quotes.map((q, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                            {q.tier || `Tier ${i + 1}`}
                          </span>
                          <span className="text-xs text-gray-400">
                            Confidence: {q.confidence != null ? `${Math.round(q.confidence * 100)}%` : '—'}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-3 mb-2">
                          <span className="text-xl font-bold text-gray-800">${q.suggestedFixedPrice?.toLocaleString() || '—'}</span>
                          {q.price && (
                            <span className="text-xs text-gray-500">
                              Range: ${q.price.min?.toLocaleString()}–${q.price.max?.toLocaleString()}
                            </span>
                          )}
                          {q.gstAmount != null && (
                            <span className="text-xs text-gray-400">
                              +${q.gstAmount?.toLocaleString()} GST = ${q.totalIncGst?.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {q.reasoning && (
                          <div>
                            <button
                              onClick={() => setExpandedReasoningIdx(expandedReasoningIdx === i ? null : i)}
                              className="text-[10px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                            >
                              {expandedReasoningIdx === i ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              AI Reasoning
                            </button>
                            {expandedReasoningIdx === i && (
                              <p className="text-xs text-gray-600 mt-1 leading-relaxed bg-white p-3 rounded border border-gray-100">{q.reasoning}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Morning/Weekday alternatives */}
                  {simResult.morningOptions && simResult.morningOptions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-2">Morning Re-quote Options</p>
                      <div className="space-y-1">
                        {simResult.morningOptions.map((q, i) => (
                          <div key={i} className="flex justify-between text-sm bg-green-50 px-3 py-2 rounded-lg">
                            <span className="text-gray-700">{q.tier}</span>
                            <span className="font-mono text-green-700">${q.suggestedFixedPrice?.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {simResult.weekdayOptions && simResult.weekdayOptions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-2">Weekday Re-quote Options</p>
                      <div className="space-y-1">
                        {simResult.weekdayOptions.map((q, i) => (
                          <div key={i} className="flex justify-between text-sm bg-blue-50 px-3 py-2 rounded-lg">
                            <span className="text-gray-700">{q.tier}</span>
                            <span className="font-mono text-blue-700">${q.suggestedFixedPrice?.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Algorithm Match Panel */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-500" />
                    Price List Algorithm Match
                  </h3>
                  {simResult.telemetry._algorithmResult?.price != null ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-emerald-50 rounded-lg p-3 text-center">
                          <p className="text-[10px] uppercase tracking-wide text-emerald-600 font-semibold">Algo Price</p>
                          <p className="text-xl font-bold text-emerald-800 mt-0.5">${simResult.telemetry._algorithmResult.price}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                          <p className="text-[10px] uppercase tracking-wide text-blue-600 font-semibold">Confidence</p>
                          <p className="text-xl font-bold text-blue-800 mt-0.5">{Math.round(simResult.telemetry._algorithmResult.confidence * 100)}%</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">Latency</p>
                          <p className="text-xl font-bold text-gray-800 mt-0.5">{simResult.telemetry._algorithmResult.latencyMs || 0}ms</p>
                        </div>
                      </div>

                      {simResult.telemetry._algorithmResult.matchResult?.bestMatch && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-[10px] uppercase tracking-wide font-semibold text-yellow-700 mb-1">Best Match</p>
                          <p className="text-sm font-medium text-yellow-900">
                            {simResult.telemetry._algorithmResult.matchResult.bestMatch.serviceName}
                          </p>
                          <p className="text-xs text-yellow-700 mt-0.5">
                            ${simResult.telemetry._algorithmResult.matchResult.bestMatch.price} &bull; score: {simResult.telemetry._algorithmResult.matchResult.bestMatch.matchScore.toFixed(2)}
                          </p>
                        </div>
                      )}

                      {simResult.telemetry._algorithmResult.matchResult?.services &&
                        simResult.telemetry._algorithmResult.matchResult.services.length > 1 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-2">Other Matches</p>
                          <div className="space-y-1 max-h-36 overflow-y-auto">
                            {simResult.telemetry._algorithmResult.matchResult.services.slice(1, 6).map((s, i) => (
                              <div key={i} className="flex justify-between text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                <span className="truncate mr-3">{s.serviceName}</span>
                                <span className="font-mono text-xs whitespace-nowrap">${s.price} <span className="text-gray-400">({s.matchScore.toFixed(2)})</span></span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-500">No algorithm match found for this job</p>
                    </div>
                  )}
                </div>

                {/* Reconciliation Breakdown */}
                {simResult.telemetry._reconciliation && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-purple-500" />
                      Reconciliation Breakdown
                    </h3>
                    <div className="space-y-4">
                      {/* Source badge */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Source:</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          simResult.telemetry._reconciliation.source === 'blended'
                            ? 'bg-purple-100 text-purple-700'
                            : simResult.telemetry._reconciliation.source === 'ai_only'
                              ? 'bg-blue-100 text-blue-700'
                              : simResult.telemetry._reconciliation.source === 'algorithm_override'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                        }`}>
                          {simResult.telemetry._reconciliation.source?.replace(/_/g, ' ') || 'unknown'}
                        </span>
                      </div>

                      {/* Weight bar */}
                      {simResult.telemetry._reconciliation.source === 'blended' && (
                        <div>
                          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                            <span>AI: {Math.round((simResult.telemetry._reconciliation.breakdown?.aiWeight as number || simResult.telemetry._reconciliation.aiWeight || 0) * 100)}%</span>
                            <span>Algo: {Math.round((simResult.telemetry._reconciliation.breakdown?.algorithmWeight as number || simResult.telemetry._reconciliation.algorithmWeight || 0) * 100)}%</span>
                          </div>
                          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex">
                            <div
                              className="h-full bg-blue-400 transition-all"
                              style={{ width: `${Math.round((simResult.telemetry._reconciliation.breakdown?.aiWeight as number || simResult.telemetry._reconciliation.aiWeight || 0) * 100)}%` }}
                            />
                            <div
                              className="h-full bg-emerald-400 transition-all"
                              style={{ width: `${Math.round((simResult.telemetry._reconciliation.breakdown?.algorithmWeight as number || simResult.telemetry._reconciliation.algorithmWeight || 0) * 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] mt-1">
                            <span className="text-blue-600">Gemini AI</span>
                            <span className="text-emerald-600">Algorithm</span>
                          </div>
                        </div>
                      )}

                      {/* Price comparison */}
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-[10px] uppercase tracking-wide text-blue-600 font-semibold">AI Price</p>
                          <p className="text-lg font-bold text-blue-800">
                            ${simResult.telemetry._reconciliation.breakdown?.aiPrice as number || simResult.telemetry._reconciliation.aiPrice || '—'}
                          </p>
                        </div>
                        <div className="bg-emerald-50 rounded-lg p-3">
                          <p className="text-[10px] uppercase tracking-wide text-emerald-600 font-semibold">Algo Price</p>
                          <p className="text-lg font-bold text-emerald-800">
                            ${simResult.telemetry._reconciliation.breakdown?.algorithmPrice as number || simResult.telemetry._reconciliation.algorithmPrice || '—'}
                          </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3">
                          <p className="text-[10px] uppercase tracking-wide text-purple-600 font-semibold">Final</p>
                          <p className="text-lg font-bold text-purple-800">${simResult.telemetry._reconciliation.finalPrice}</p>
                        </div>
                      </div>

                      {simResult.telemetry._reconciliation.breakdown?.deviationPercent != null && (
                        <p className="text-xs text-gray-500">
                          Deviation: <span className="font-medium">{simResult.telemetry._reconciliation.breakdown.deviationPercent as number}%</span>
                        </p>
                      )}
                      {simResult.telemetry._reconciliation.breakdown?.reason && (
                        <p className="text-xs text-gray-500">
                          Reason: <span className="font-medium">{simResult.telemetry._reconciliation.breakdown.reason as string}</span>
                        </p>
                      )}
                      {simResult.telemetry._reconciliation.reason && !simResult.telemetry._reconciliation.breakdown?.reason && (
                        <p className="text-xs text-gray-500">
                          Reason: <span className="font-medium">{simResult.telemetry._reconciliation.reason}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Telemetry Details (collapsible) */}
                <div className="bg-white rounded-xl border border-gray-200">
                  <button
                    onClick={() => setExpandedTelemetry(!expandedTelemetry)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-gray-500" />
                      Telemetry Details
                    </h3>
                    {expandedTelemetry ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expandedTelemetry && (
                    <div className="px-5 pb-5 space-y-4">
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-gray-500 font-medium">Model</p>
                          <p className="text-gray-800 font-mono mt-0.5">{simResult.telemetry.modelVersion || '—'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-gray-500 font-medium">Engine</p>
                          <p className="text-gray-800 font-mono mt-0.5">{simResult.telemetry.engine || '—'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-gray-500 font-medium">Finish Reason</p>
                          <p className="text-gray-800 font-mono mt-0.5">{simResult.telemetry.finishReason || '—'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-gray-500 font-medium">Tokens In</p>
                          <p className="text-gray-800 font-mono mt-0.5">{simResult.telemetry.tokensIn?.toLocaleString() || '—'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-gray-500 font-medium">Tokens Out</p>
                          <p className="text-gray-800 font-mono mt-0.5">{simResult.telemetry.tokensOut?.toLocaleString() || '—'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-gray-500 font-medium">Total Tokens</p>
                          <p className="text-gray-800 font-mono mt-0.5">{simResult.telemetry.tokensTotal?.toLocaleString() || '—'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-gray-500 font-medium">Images Analyzed</p>
                          <p className="text-gray-800 font-mono mt-0.5">{simResult.telemetry.imageCount || 0}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-gray-500 font-medium">Large Project</p>
                          <p className="text-gray-800 font-mono mt-0.5">{simResult.isLargeProject ? 'Yes' : 'No'}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-gray-500 font-medium">Success</p>
                          <p className="text-gray-800 font-mono mt-0.5">{simResult.telemetry.success ? 'Yes' : 'No'}</p>
                        </div>
                      </div>

                      {simResult.telemetry._partsDetected && simResult.telemetry._partsDetected.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-2">Parts Detected</p>
                          <div className="flex flex-wrap gap-1">
                            {simResult.telemetry._partsDetected.map((p, i) => (
                              <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{p}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {simResult.telemetry.safetyRatings && simResult.telemetry.safetyRatings.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-2">Safety Ratings</p>
                          <div className="flex flex-wrap gap-1">
                            {simResult.telemetry.safetyRatings.map((r, i) => (
                              <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                {r.category}: {r.probability}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {simResult.telemetry.rawOutputPreview && (
                        <div>
                          <button
                            onClick={() => setExpandedRawOutput(!expandedRawOutput)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                          >
                            {expandedRawOutput ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            Raw AI Output
                          </button>
                          {expandedRawOutput && (
                            <pre className="mt-2 text-[10px] text-gray-600 bg-gray-50 p-3 rounded-lg overflow-x-auto max-h-60 overflow-y-auto whitespace-pre-wrap border border-gray-100">
                              {simResult.telemetry.rawOutputPreview}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ─── Information Section ──────────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                About the Job Simulator
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <h4 className="text-xs font-semibold text-gray-800 mb-1">What does this do?</h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Runs the exact same pricing pipeline that real job postings go through &mdash; Gemini AI analysis (including image understanding),
                    price list keyword matching, confidence-weighted reconciliation &mdash; but without creating any Job, Quote, or log records in the database.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-100">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center mb-2">
                    <TestTube className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <h4 className="text-xs font-semibold text-gray-800 mb-1">When to use it</h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Test newly added price list entries, verify AI category detection, check how images affect quotes, experiment with after-hours/weekend surcharges,
                    or validate the AI + algorithm blending behavior before it impacts real customers.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-100">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                    <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <h4 className="text-xs font-semibold text-gray-800 mb-1">Understanding results</h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    <strong>Quote Options</strong> show the AI&apos;s tiered price estimates. <strong>Algorithm Match</strong> shows what the price list matched.
                    <strong> Reconciliation</strong> shows how the two were blended. <strong>Telemetry</strong> shows model, tokens, and latency details.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-100">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center mb-2">
                    <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <h4 className="text-xs font-semibold text-gray-800 mb-1">Cost and safety</h4>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Each simulation calls the real Gemini API (small token cost, typically &lt;$0.01). No jobs, quotes, or payments are created.
                    Uploaded images go to Cloudinary but can be cleaned up. This is completely safe for production.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AdminActionConfirmDialog
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        actionLabel={actionLabel}
        onConfirm={executeAction}
      />
    </div>
  )
}
