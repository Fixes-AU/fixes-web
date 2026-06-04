'use client'

import { useEffect, useState } from 'react'
import { DollarSign, Loader2, Save, AlertCircle } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { CLEANING_TYPE_LABELS } from '@/lib/constants'

interface Rate {
  cleaningType: string
  ratePerHour: number
  minimumHours: number
  label?: string
}

interface ApiRate {
  cleaningType: string
  ratePerHour: number
  minHours?: number
  label?: string
}

const DEFAULT_TYPES = Object.keys(CLEANING_TYPE_LABELS)

export default function RatesPage() {
  const [rates, setRates] = useState<Rate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    api.get<ApiRate[]>('/api/cleaning-admin/rates')
      .then((res) => {
        const existing = res.data ?? []
        const merged = existing.length > 0
          ? existing.map((r) => ({
              cleaningType: r.cleaningType,
              ratePerHour: r.ratePerHour ?? 0,
              minimumHours: r.minHours ?? 2,
              label: r.label,
            }))
          : DEFAULT_TYPES.map((t) => ({ cleaningType: t, ratePerHour: 0, minimumHours: 2 }))
        setRates(merged)
      })
      .catch(() => {
        setRates(DEFAULT_TYPES.map((t) => ({ cleaningType: t, ratePerHour: 0, minimumHours: 1 })))
      })
      .finally(() => setIsLoading(false))
  }, [])

  const updateRate = (idx: number, field: 'ratePerHour' | 'minimumHours', value: string) => {
    setRates((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: Number(value) || 0 } : r))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError('')
    setSaveSuccess(false)
    try {
      await api.patch('/api/cleaning-admin/rates', {
        rates: rates.map((r) => ({
          cleaningType: r.cleaningType,
          ratePerHour: r.ratePerHour,
          minHours: r.minimumHours,
        })),
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Failed to save rates')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-teal-600 animate-spin" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Hourly Rates</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 bg-teal-600 text-white text-sm font-medium py-2 px-4 rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saveSuccess && (
        <div className="mb-4 flex items-center gap-2 bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl">
          <DollarSign className="w-4 h-4" /> Rates updated successfully
        </div>
      )}
      {saveError && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4" /> {saveError}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Cleaning Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-36">Rate/hr ($)</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-36">Min. Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rates.map((rate, idx) => (
              <tr key={rate.cleaningType} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                  {CLEANING_TYPE_LABELS[rate.cleaningType] || rate.cleaningType}
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={rate.ratePerHour || ''}
                    onChange={(e) => updateRate(idx, 'ratePerHour', e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={rate.minimumHours || ''}
                    onChange={(e) => updateRate(idx, 'minimumHours', e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
