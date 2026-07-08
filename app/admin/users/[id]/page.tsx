// fixes-web/app/admin/users/[id]/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, User as UserIcon, Mail, Phone, Calendar,
  ShieldCheck, Ban, CheckCircle2, Briefcase, Loader2,
  Pencil, Trash2, AlertTriangle, X,
} from 'lucide-react'
import { api } from '@/lib/api'
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS, CATEGORY_LABELS } from '@/lib/constants'
import type { AdminUserDetail, JobCategory, JobStatus, ApiResponse } from '@/lib/types'
import AdminActionConfirmDialog from '@/components/admin/AdminActionConfirmDialog'

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [data, setData] = useState<AdminUserDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const [pendingBan, setPendingBan] = useState(false)
  const [pendingEdit, setPendingEdit] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<'soft' | 'hard' | null>(null)
  const [deleteStep, setDeleteStep] = useState<'choose' | 'confirm'>('choose')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<AdminUserDetail>(`/api/admin/users/${userId}`)
        setData(res.data)
      } catch { /* silent */ } finally { setIsLoading(false) }
    }
    load()
  }, [userId])

  const executeBan = async (token: string) => {
    await api.raw(`/api/admin/users/${userId}/ban`, {
      method: 'PATCH',
      headers: { 'X-Admin-Action-Token': token },
    })
  }

  const openEdit = () => {
    if (!data) return
    setEditName(data.user.name)
    setEditEmail(data.user.email)
    setEditPhone(data.user.phone || '')
    setEditError('')
    setEditOpen(true)
  }

  const executeEdit = async (token: string) => {
    const res = await api.raw<ApiResponse<{ user: AdminUserDetail['user'] }>>(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'X-Admin-Action-Token': token },
      body: { name: editName, email: editEmail, phone: editPhone } as Record<string, unknown>,
    })
    if (res.data?.user) {
      setData((prev) => prev ? { ...prev, user: { ...prev.user, ...res.data.user } } : prev)
    }
    setEditOpen(false)
  }

  const executeDelete = async (token: string) => {
    if (!pendingDelete) return
    await api.raw(`/api/admin/users/${userId}/${pendingDelete}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Action-Token': token },
    })
    router.push('/admin/users')
  }

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
    </div>
  )

  if (!data) return (
    <div className="flex flex-col items-center justify-center py-24">
      <UserIcon className="w-10 h-10 text-gray-300 mb-3" />
      <p className="text-sm text-gray-400">User not found</p>
      <button onClick={() => router.push('/admin/users')} className="text-xs text-[#2563EB] hover:underline mt-2">Back to users</button>
    </div>
  )

  const { user, profile, recentJobs } = data

  return (
    <div>
      <button onClick={() => router.push('/admin/users')}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mb-5">
        <ArrowLeft className="w-3.5 h-3.5" />Back to users
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold text-lg shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">{user.name}</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium capitalize bg-[#EFF6FF] text-[#2563EB]">{user.role}</span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs mb-5">
            <div className="flex items-center gap-2 text-gray-500">
              <Mail className="w-3.5 h-3.5 text-gray-400" /><span>{user.email}</span>
              {user.isEmailVerified && <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-auto" />}
            </div>
            {user.phone && (
              <div className="flex items-center gap-2 text-gray-500">
                <Phone className="w-3.5 h-3.5 text-gray-400" /><span>{user.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>Joined {new Date(user.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <p className="text-gray-400 font-mono text-[10px] pt-1">{user.fixId}</p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {user.isActive ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" />Active</span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-red-500"><Ban className="w-3.5 h-3.5" />Banned</span>
            )}
            {user.role !== 'admin' && (
              <button onClick={() => setPendingBan(true)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  user.isActive ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                }`}>
                {user.isActive ? 'Ban User' : 'Unban User'}
              </button>
            )}
          </div>

          {user.role !== 'admin' && (
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <button onClick={openEdit}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] transition-colors">
                <Pencil className="w-3.5 h-3.5" />Edit
              </button>
              <button onClick={() => { setDeleteOpen(true); setDeleteStep('choose'); setDeleteError(''); setPendingDelete(null) }}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />Delete
              </button>
            </div>
          )}
        </div>

        {profile && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2563EB]" />Tradie Profile
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 block mb-2">Categories</span>
                <div className="flex flex-wrap gap-1">
                  {profile.categories.map((cat) => (
                    <span key={cat} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                      {CATEGORY_LABELS[cat as JobCategory] || cat}
                    </span>
                  ))}
                </div>
              </div>
              {[
                ['Rating', `${profile.rating.average.toFixed(1)} (${profile.rating.count})`],
                ['Success Rate', `${Math.round(profile.jobSuccessRate)}%`],
                ['Verified', profile.isFullyVerified ? 'Fully Verified' : 'Pending'],
                ['Online', profile.isOnline ? 'Yes' : 'No'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-400">{label}</span>
                  <span className={
                    val === 'Fully Verified' ? 'text-emerald-600' :
                    val === 'Pending' ? 'text-amber-600' : 'text-gray-700'
                  }>{val}</span>
                </div>
              ))}
              <Link href={`/admin/tradies/${userId}`}
                className="block text-center text-xs font-medium mt-3 py-2 rounded-lg bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] transition-colors">
                View Documents →
              </Link>
            </div>
          </div>
        )}

        <div className={`bg-white rounded-xl border border-gray-200 p-5 ${!profile ? 'lg:col-span-2' : ''}`}>
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#2563EB]" />Recent Jobs
          </h2>
          {!recentJobs || recentJobs.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">No jobs yet</p>
          ) : (
            <div className="space-y-2">
              {recentJobs.map((job) => (
                <div key={job._id} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-xs text-gray-700 font-medium">{job.title}</p>
                    <p className="text-[10px] text-gray-400">{job.jobCode} • {CATEGORY_LABELS[job.category as JobCategory] || job.category}</p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${JOB_STATUS_COLORS[job.status as JobStatus]}`}>
                    {JOB_STATUS_LABELS[job.status as JobStatus]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-gray-900">Edit User</h3>
              <button onClick={() => setEditOpen(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Name</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email</label>
                <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} type="email"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} type="tel"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]" />
              </div>
              {editError && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />{editError}
                </p>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditOpen(false)}
                className="flex-1 text-xs px-4 py-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 font-medium transition-colors">
                Cancel
              </button>
              <button onClick={() => { setEditOpen(false); setPendingEdit(true) }}
                className="flex-1 text-xs px-4 py-2.5 rounded-lg bg-[#2563EB] text-white font-medium hover:bg-[#1D4ED8] transition-colors flex items-center justify-center gap-1.5">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteOpen && !pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-500" />Delete User
              </h3>
              <button onClick={() => setDeleteOpen(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-gray-500 mb-4">Choose how to remove this account:</p>
              <button onClick={() => { setPendingDelete('soft'); setDeleteOpen(false) }}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all">
                <p className="text-sm font-semibold text-gray-800 mb-1">Deactivate Account</p>
                <p className="text-xs text-gray-400">Disables the account and anonymizes personal data. The record is preserved for audit purposes.</p>
              </button>
              <button onClick={() => { setPendingDelete('hard'); setDeleteOpen(false) }}
                className="w-full text-left p-4 rounded-xl border border-red-200 hover:border-red-300 hover:bg-red-50/50 transition-all">
                <p className="text-sm font-semibold text-red-600 mb-1">Permanently Delete</p>
                <p className="text-xs text-gray-400">Irreversibly removes the user and all associated data including jobs, messages, payments, and reviews.</p>
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminActionConfirmDialog
        open={pendingBan}
        onOpenChange={(open) => { if (!open) setPendingBan(false) }}
        title={user.isActive ? `Ban ${user.name}` : `Unban ${user.name}`}
        description={user.isActive
          ? 'This will suspend the user\'s account and prevent them from logging in. Enter your password to confirm.'
          : 'This will reactivate the user\'s account. Enter your password to confirm.'
        }
        action="user:ban_toggle"
        variant={user.isActive ? 'destructive' : 'default'}
        confirmLabel={user.isActive ? 'Ban User' : 'Unban User'}
        onConfirm={executeBan}
        onSuccess={() => {
          setPendingBan(false)
          setData((prev) => prev ? { ...prev, user: { ...prev.user, isActive: !prev.user.isActive } } : prev)
        }}
      />

      <AdminActionConfirmDialog
        open={pendingEdit}
        onOpenChange={(open) => { if (!open) setPendingEdit(false) }}
        title="Edit User Details"
        description={`Update ${user.name}'s profile information. Enter your password to confirm.`}
        action="user:update"
        confirmLabel="Save Changes"
        onConfirm={executeEdit}
        onSuccess={() => setPendingEdit(false)}
        onError={() => setPendingEdit(false)}
      />

      <AdminActionConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => { if (!open) setPendingDelete(null) }}
        title={pendingDelete === 'hard' ? 'Permanently Delete User' : 'Deactivate User'}
        description={pendingDelete === 'hard'
          ? `This will permanently delete ${user.name} and ALL associated data (jobs, payments, messages, reviews). This CANNOT be undone.`
          : `This will deactivate ${user.name}'s account and anonymize their personal data. The record is preserved for audit.`
        }
        action="user:delete"
        variant="destructive"
        confirmLabel={pendingDelete === 'hard' ? 'Delete Permanently' : 'Deactivate Account'}
        onConfirm={executeDelete}
        onSuccess={() => setPendingDelete(null)}
        onError={() => setPendingDelete(null)}
      />
    </div>
  )
}
