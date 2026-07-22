'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Building2, Info, Loader2, RefreshCw, Search } from 'lucide-react'
import { api } from '@/lib/api'

type AgencyStatus = 'draft' | 'pending_verification' | 'active' | 'offline' | 'suspended' | 'rejected'

interface Agency {
  _id: string
  name: string
  slug: string
  status: AgencyStatus
  ownerName?: string
  businessEmail?: string
  phone?: string
  abn?: string
  categories: string[]
  stripeAccountStatus: string
  isOnline: boolean
  negativeBalance?: number
  createdAt: string
}

const STATUS_LABEL: Record<AgencyStatus, string> = {
  draft: 'Draft',
  pending_verification: 'Pending Verification',
  active: 'Active',
  offline: 'Offline',
  suspended: 'Suspended',
  rejected: 'Rejected',
}

const STATUS_STYLE: Record<AgencyStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  pending_verification: 'bg-amber-100 text-amber-700',
  active: 'bg-green-100 text-green-700',
  offline: 'bg-slate-100 text-slate-600',
  suspended: 'bg-red-100 text-red-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function AdminAgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const qs = new URLSearchParams({ limit: '100' })
      if (status !== 'all') qs.set('status', status)
      if (search.trim()) qs.set('search', search.trim())
      const res = await api.getPaginated<Agency>(`/api/admin/agencies?${qs}`)
      setAgencies(res.data || [])
    } catch (err: any) {
      setError(err?.message || 'Failed to load agencies.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const counts = useMemo(() => agencies.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {} as Record<string, number>), [agencies])

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Agencies
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage approved Direct Contracts agency tenants.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800 flex gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        Agencies can only go online when active and Stripe-ready. This page does not enable dispatch by itself.
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              onKeyDown={event => { if (event.key === 'Enter') load() }}
              placeholder="Search agency, email, slug, or ABN"
              className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <select value={status} onChange={event => setStatus(event.target.value)} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500">
            <option value="all">All statuses</option>
            {Object.entries(STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <button onClick={load} className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold">Search</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <button key={value} onClick={() => { setStatus(value); setTimeout(load, 0) }} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-left">
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
        ) : agencies.length === 0 ? (
          <div className="py-20 text-center text-sm text-gray-500">No agencies found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-500 uppercase">Agency</th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-500 uppercase">Categories</th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-500 uppercase">Stripe</th>
                  <th className="text-right px-5 py-3 text-[10px] font-bold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {agencies.map(agency => (
                  <tr key={agency._id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{agency.name}</p>
                      <p className="text-xs text-gray-500">{agency.businessEmail || agency.ownerName || agency.slug}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-md">
                        {(agency.categories || []).slice(0, 4).map(category => (
                          <span key={category} className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-[10px] font-semibold">{category.replace(/_/g, ' ')}</span>
                        ))}
                        {(agency.categories || []).length > 4 && <span className="text-xs text-gray-400">+{agency.categories.length - 4}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLE[agency.status]}`}>{STATUS_LABEL[agency.status]}</span>
                        {agency.isOnline && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">Online</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">{agency.stripeAccountStatus.replace(/_/g, ' ')}</td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/admin/agencies/${agency._id}`} className="text-blue-600 font-semibold text-xs hover:underline">Open</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
