// fixes-web/app/admin/team/page.tsx

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, Shield, ShieldCheck, ShieldAlert, Crown,
  Loader2, X, Check, ChevronDown,
} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
import AdminActionConfirmDialog from '@/components/admin/AdminActionConfirmDialog'

interface AdminUser {
  _id: string
  name: string
  email: string
  fixId: string
  avatarUrl?: string
  isActive: boolean
  isSuperAdmin: boolean
  isFullAdmin: boolean
  isCleaningAdmin: boolean
  adminPermissions: string[]
  createdAt: string
}

interface PermissionsConfig {
  allPermissions: string[]
  presets: Record<string, string[]>
  labels: Record<string, string>
}

const PRESET_LABELS: Record<string, { label: string; description: string; color: string }> = {
  full_admin: {
    label: 'Full Admin',
    description: 'All permissions except admin management',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  support_admin: {
    label: 'Support Admin',
    description: 'View-only access to users, jobs, disputes, and bug reports',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  cleaning_admin: {
    label: 'Cleaning Admin',
    description: 'Dashboard and jobs access only',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
  },
}

function getRoleBadge(admin: AdminUser) {
  if (admin.isSuperAdmin) return { label: 'Super Admin', color: 'bg-purple-100 text-purple-700' }
  if (admin.isFullAdmin !== false) return { label: 'Full Admin', color: 'bg-blue-50 text-blue-600' }
  if (admin.isCleaningAdmin) return { label: 'Cleaning Admin', color: 'bg-teal-50 text-teal-600' }
  if (admin.adminPermissions?.length > 0) return { label: 'Limited Admin', color: 'bg-amber-50 text-amber-600' }
  return { label: 'No Access', color: 'bg-red-50 text-red-500' }
}

export default function AdminTeamPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [config, setConfig] = useState<PermissionsConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [customPerms, setCustomPerms] = useState<string[]>([])
  const [pendingSave, setPendingSave] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [teamRes, configRes] = await Promise.all([
        api.get<{ admins: AdminUser[] }>('/api/admin/team'),
        api.get<PermissionsConfig>('/api/admin/permissions-config'),
      ])
      setAdmins(teamRes.data.admins)
      setConfig(configRes.data)
    } catch {
      /* silent */
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user?.isSuperAdmin) {
      fetchData()
    } else {
      router.replace('/admin')
    }
  }, [user, fetchData, router])

  const openEditor = (admin: AdminUser) => {
    setEditingAdmin(admin)
    setCustomPerms([...(admin.adminPermissions || [])])

    if (config) {
      const currentPerms = admin.adminPermissions || []
      let matchedPreset: string | null = null
      for (const [key, perms] of Object.entries(config.presets)) {
        if (
          currentPerms.length === perms.length &&
          perms.every(p => currentPerms.includes(p))
        ) {
          matchedPreset = key
          break
        }
      }
      setSelectedPreset(matchedPreset)
    }
  }

  const selectPreset = (presetKey: string) => {
    if (!config) return
    setSelectedPreset(presetKey)
    setCustomPerms([...config.presets[presetKey]])
  }

  const togglePerm = (perm: string) => {
    setSelectedPreset(null)
    setCustomPerms(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    )
  }

  const executeSave = async (token: string) => {
    if (!editingAdmin) return
    const body: Record<string, unknown> = selectedPreset
      ? { preset: selectedPreset }
      : {
        permissions: customPerms,
        isFullAdmin: false,
        isCleaningAdmin: customPerms.length === config?.presets.cleaning_admin?.length &&
          config?.presets.cleaning_admin?.every(p => customPerms.includes(p)),
      }

    await api.raw(`/api/admin/users/${editingAdmin._id}/permissions`, {
      method: 'PATCH',
      headers: { 'X-Admin-Action-Token': token },
      body,
    })
  }

  const viewPerms = config?.allPermissions.filter(p => p.startsWith('view:')) || []
  const actionPerms = config?.allPermissions.filter(p => p.startsWith('action:')) || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Crown className="w-5 h-5 text-purple-500" />
          Admin Team
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Manage admin permissions and access levels
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(PRESET_LABELS).map(([key, meta]) => (
          <div
            key={key}
            className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${meta.color}`}
          >
            {meta.label}
          </div>
        ))}
        <div className="text-[10px] px-2.5 py-1 rounded-full border bg-purple-50 text-purple-700 border-purple-200 font-medium">
          Super Admin
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Permissions
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Joined
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.map(admin => {
                const badge = getRoleBadge(admin)
                const isSelf = admin._id === user?._id
                return (
                  <tr key={admin._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                          {admin.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {admin.name}
                            {isSelf && <span className="text-[10px] text-gray-400 ml-1">(you)</span>}
                          </p>
                          <p className="text-[10px] text-gray-400">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-[10px] text-gray-400">
                        {admin.isSuperAdmin
                          ? 'All permissions'
                          : admin.isFullAdmin !== false
                            ? 'All (except admin mgmt)'
                            : `${admin.adminPermissions?.length || 0} permissions`}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-400">
                        {new Date(admin.createdAt).toLocaleDateString('en-AU', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!admin.isSuperAdmin && !isSelf ? (
                        <button
                          onClick={() => openEditor(admin)}
                          className="text-[10px] px-2.5 py-1 rounded-lg bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE] transition-colors font-medium"
                        >
                          Edit Permissions
                        </button>
                      ) : admin.isSuperAdmin ? (
                        <span className="text-[10px] text-purple-400 flex items-center justify-end gap-1">
                          <Crown className="w-3 h-3" /> Protected
                        </span>
                      ) : null}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#2563EB]" />
                  Edit Permissions — {editingAdmin.name}
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">{editingAdmin.email}</p>
              </div>
              <button onClick={() => setEditingAdmin(null)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-3">Quick Presets</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {Object.entries(PRESET_LABELS).map(([key, meta]) => (
                    <button
                      key={key}
                      onClick={() => selectPreset(key)}
                      className={`text-left p-3 rounded-xl border transition-all ${selectedPreset === key
                          ? 'border-[#2563EB] bg-[#EFF6FF] ring-1 ring-[#2563EB]'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <p className="text-xs font-semibold text-gray-800">{meta.label}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{meta.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-3">
                  Section Access
                  {selectedPreset && (
                    <span className="text-[10px] text-gray-400 font-normal ml-2">
                      (toggle any to switch to custom)
                    </span>
                  )}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {viewPerms.map(perm => {
                    const active = customPerms.includes(perm)
                    return (
                      <button
                        key={perm}
                        onClick={() => togglePerm(perm)}
                        className={`flex items-center gap-2 text-left px-3 py-2 rounded-lg text-xs transition-colors ${active
                            ? 'bg-emerald-50 text-emerald-700 font-medium'
                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                          }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${active ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
                          }`}>
                          {active && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        {config?.labels[perm] || perm}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-700 mb-3">Action Permissions</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {actionPerms
                    .filter(p => p !== 'action:manage_admins')
                    .map(perm => {
                      const active = customPerms.includes(perm)
                      return (
                        <button
                          key={perm}
                          onClick={() => togglePerm(perm)}
                          className={`flex items-center gap-2 text-left px-3 py-2 rounded-lg text-xs transition-colors ${active
                              ? 'bg-emerald-50 text-emerald-700 font-medium'
                              : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                            }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${active ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
                            }`}>
                            {active && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          {config?.labels[perm] || perm}
                        </button>
                      )
                    })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-[10px] text-gray-400">
                {customPerms.length} permission{customPerms.length !== 1 ? 's' : ''} selected
                {selectedPreset && ` (${PRESET_LABELS[selectedPreset]?.label} preset)`}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingAdmin(null)}
                  className="text-xs px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setEditingAdmin(null)
                    setPendingSave(true)
                  }}
                  className="text-xs px-4 py-2 rounded-lg bg-[#2563EB] text-white font-medium hover:bg-[#1D4ED8] transition-colors"
                >
                  Save Permissions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AdminActionConfirmDialog
        open={pendingSave}
        onOpenChange={open => {
          if (!open) setPendingSave(false)
        }}
        title="Update Admin Permissions"
        description={`Update permissions for ${editingAdmin?.name || 'this admin'}. Enter your password to confirm.`}
        action="admin:manage_permissions"
        confirmLabel="Update Permissions"
        onConfirm={executeSave}
        onSuccess={() => {
          setPendingSave(false)
          setEditingAdmin(null)
          fetchData()
        }}
      />
    </div>
  )
}
