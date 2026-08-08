'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Save, Plus, Search, TestTube, Settings, List, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { CATEGORY_LABELS } from '@/lib/constants'
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

const CATEGORIES = [
  'electrical', 'plumbing', 'hvac', 'plastering', 'painting',
  'flooring', 'carpentry', 'roofing', 'emergency_make_safe', 'general_labourer',
  'handyman', 'gardening_landscaping', 'cleaning', 'waste_removal',
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
        {([['entries', 'Entries', List], ['config', 'Config', Settings], ['test', 'Test', TestTube]] as const).map(([key, label, Icon]) => (
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
        <div className="max-w-xl space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h2 className="text-base font-semibold text-gray-800">Algorithm Settings</h2>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.enableAlgorithmPricing}
                onChange={(e) => setConfig({ ...config, enableAlgorithmPricing: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Enable Price List Algorithm</span>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Algorithm Weight</label>
                <input
                  type="number" step="0.05" min="0" max="1"
                  value={config.algorithmWeight}
                  onChange={(e) => setConfig({ ...config, algorithmWeight: Number(e.target.value), aiWeight: Math.round((1 - Number(e.target.value)) * 100) / 100 })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">AI Weight</label>
                <input
                  type="number" step="0.05" min="0" max="1"
                  value={config.aiWeight}
                  onChange={(e) => setConfig({ ...config, aiWeight: Number(e.target.value), algorithmWeight: Math.round((1 - Number(e.target.value)) * 100) / 100 })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">High Confidence Threshold</label>
                <input
                  type="number" step="0.05" min="0" max="1"
                  value={config.highConfidenceThreshold}
                  onChange={(e) => setConfig({ ...config, highConfidenceThreshold: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Low Confidence Threshold</label>
                <input
                  type="number" step="0.05" min="0" max="1"
                  value={config.lowConfidenceThreshold}
                  onChange={(e) => setConfig({ ...config, lowConfidenceThreshold: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 space-y-1">
            <p><strong>How it works:</strong></p>
            <p>• The algorithm matches job descriptions to your price list entries using keyword scoring</p>
            <p>• The final price = (AI price × AI weight) + (Algorithm price × Algorithm weight)</p>
            <p>• High confidence matches (&gt; {config.highConfidenceThreshold}) get a +15% algorithm weight boost</p>
            <p>• If deviation between AI and algorithm exceeds {config.maxDeviationPercent}%, the higher-confidence source wins outright</p>
          </div>
        </div>
      )}

      {/* ─── TEST TAB ──────────────────────────── */}
      {tab === 'test' && (
        <div className="max-w-2xl space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-800">Test Price Matcher</h2>
            <p className="text-sm text-gray-500">Enter a job title/description to see how the algorithm matches it against the price list</p>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Job title (e.g. Install ceiling fan)"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <textarea
                placeholder="Job description (optional)"
                value={testDescription}
                onChange={(e) => setTestDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <select
                value={testCategory}
                onChange={(e) => setTestCategory(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{(CATEGORY_LABELS as any)[c] || c}</option>
                ))}
              </select>
              <button
                onClick={runTest}
                disabled={isTesting || !testTitle}
                className="flex items-center gap-1.5 bg-[#2563EB] text-white text-sm font-medium py-2 px-4 rounded-xl hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors"
              >
                {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
                Run Test
              </button>
            </div>
          </div>

          {testResult && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h3 className="text-base font-semibold text-gray-800">Results</h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-green-600 font-medium">Algorithm Price</p>
                  <p className="text-lg font-bold text-green-800">{testResult.price ? `$${testResult.price}` : 'No match'}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-blue-600 font-medium">Confidence</p>
                  <p className="text-lg font-bold text-blue-800">{(testResult.confidence * 100).toFixed(0)}%</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600 font-medium">Latency</p>
                  <p className="text-lg font-bold text-gray-800">{testResult.latencyMs}ms</p>
                </div>
              </div>

              {testResult.matchResult?.bestMatch && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-yellow-700 mb-1">Best Match</p>
                  <p className="text-sm text-yellow-900">
                    {testResult.matchResult.bestMatch.serviceName} — ${testResult.matchResult.bestMatch.price}
                    <span className="text-yellow-600 ml-2">(score: {testResult.matchResult.bestMatch.matchScore.toFixed(2)})</span>
                  </p>
                </div>
              )}

              {testResult.matchResult?.services && testResult.matchResult.services.length > 1 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Other Matches</p>
                  <div className="space-y-1">
                    {testResult.matchResult.services.slice(1).map((s, i) => (
                      <div key={i} className="flex justify-between text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded">
                        <span>{s.serviceName}</span>
                        <span className="font-mono">${s.price} <span className="text-gray-400">({s.matchScore.toFixed(2)})</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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
