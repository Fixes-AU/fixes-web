'use client'
 
import { useEffect, useState } from 'react'
import { Loader2, Save, AlertCircle, Percent } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { CATEGORY_LABELS } from '@/lib/constants'
import type { JobCategory } from '@/lib/types'
import AdminActionConfirmDialog from '@/components/admin/AdminActionConfirmDialog'

interface CommissionRate {
  _id?: string
  category: string
  platformPercentage: number
  tradiePercentage: number
  updatedAt?: string
}

interface PlatformConfig {
  commissionRates: CommissionRate[]
}

const CATEGORY_ORDER: JobCategory[] = [
  'electrical', 'plumbing', 'hvac', 'plastering', 'painting',
  'flooring', 'carpentry', 'emergency_make_safe', 'general_labourer',
  'handyman', 'gardening_landscaping',
  'cleaning', 'waste_removal', 'other',
]

export default function CommissionPage() {
  const [rates, setRates] = useState<CommissionRate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)

  useEffect(() => {
    api.get<{ data: PlatformConfig }>('/api/admin/platform-config')
      .then((res) => {
        const raw = res.data.data?.commissionRates || (res.data as any).commissionRates || []
        const sorted = CATEGORY_ORDER.map((cat) => {
          const found = raw.find((r: CommissionRate) => r.category === cat)
          return found || { category: cat, platformPercentage: 20, tradiePercentage: 80 }
        })
        setRates(sorted)
      })
      .catch(() => {
        setRates(CATEGORY_ORDER.map((cat) => ({ category: cat, platformPercentage: 20, tradiePercentage: 80 })))
      })
      .finally(() => setIsLoading(false))
  }, [])

  const updatePlatform = (idx: number, value: string) => {
    const pct = Math.max(0, Math.min(100, Number(value) || 0))
    setRates((prev) =>
      prev.map((r, i) =>
        i === idx ? { ...r, platformPercentage: pct, tradiePercentage: 100 - pct } : r
      )
    )
  }

  const handleSave = () => {
    setSaveError('')
    setSaveSuccess(false)
    setShowPasswordDialog(true)
  }

  const executeSave = async (token: string) => {
    await api.raw('/api/admin/platform-config', {
      method: 'PATCH',
      body: {
        commissionRates: rates.map((r) => ({
          category: r.category,
          platformPercentage: r.platformPercentage,
        })),
      },
      headers: { 'X-Admin-Action-Token': token },
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Platform Commission Rates</h1>
          <p className="text-sm text-gray-500 mt-1">Configure the platform/tradie revenue split for each trade category</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 bg-[#2563EB] text-white text-sm font-medium py-2 px-4 rounded-xl hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <AdminActionConfirmDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        title="Update Commission Rates"
        description="This will change the platform/tradie revenue split for all future jobs. Enter your password to confirm."
        action="platform_config:update"
        variant="destructive"
        confirmLabel="Save Changes"
        onConfirm={executeSave}
        onSuccess={() => {
          setSaveSuccess(true)
          setTimeout(() => setSaveSuccess(false), 3000)
        }}
        onError={(err) => setSaveError(err.message)}
      />

      {saveSuccess && (
        <div className="mb-4 flex items-center gap-2 bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl">
          <Percent className="w-4 h-4" /> Commission rates updated successfully
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
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-40">Platform %</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-40">Tradie %</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-48">Split Preview</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rates.map((rate, idx) => (
              <tr key={rate.category} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                  {CATEGORY_LABELS[rate.category as JobCategory] || rate.category}
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={rate.platformPercentage}
                    onChange={(e) => updatePlatform(idx, e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-gray-600">{rate.tradiePercentage}%</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2563EB] rounded-full transition-all"
                        style={{ width: `${rate.platformPercentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {rate.platformPercentage}/{rate.tradiePercentage}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Changes take effect on new jobs only. Existing jobs retain the commission rate at the time of creation.
      </p>
    </div>
  )
}
