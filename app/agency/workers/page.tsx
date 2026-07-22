'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Copy, Loader2, Mail, RefreshCw, UserPlus, Users } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'

interface Membership {
  _id: string
  role: string
  permissions: string[]
  agencyId?: { _id: string; name: string; categories: string[] }
}

interface Member {
  _id: string
  role: string
  status: string
  categories: string[]
  hideFinancials: boolean
  canReceiveAssignments: boolean
  userId?: { name: string; email: string; phone?: string; fixId?: string }
}

interface Invite {
  _id: string
  email?: string
  phone?: string
  name?: string
  role: string
  categories: string[]
  status: string
  expiresAt: string
  createdAt: string
}

const hasAgencyPermission = (member: Membership | null, permission: string) =>
  !!member && (
    member.role === 'owner' ||
    member.permissions?.includes('agency:*') ||
    member.permissions?.includes(permission)
  )

const canUseWorkersPortal = (member: Membership) =>
  member.role !== 'worker' &&
  !!member.agencyId?._id &&
  (
    hasAgencyPermission(member, 'agency:view_jobs') ||
    hasAgencyPermission(member, 'agency:assign_workers') ||
    hasAgencyPermission(member, 'agency:invite_members') ||
    hasAgencyPermission(member, 'agency:remove_members')
  )

export default function AgencyWorkersPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [membership, setMembership] = useState<Membership | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [inviteUrl, setInviteUrl] = useState('')
  const [form, setForm] = useState({ email: '', phone: '', name: '', role: 'worker' })
  const [inviteCategories, setInviteCategories] = useState<string[]>([])

  const agency = membership?.agencyId
  const canInvite = hasAgencyPermission(membership, 'agency:invite_members')

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login?next=/agency/workers')
  }, [isLoading, user, router])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const me = await api.get<{ agencyMemberships: Membership[] }>('/api/agency/me')
      const active = (me.data.agencyMemberships || []).find(canUseWorkersPortal) || null
      setMembership(active)
      if (active?.agencyId?._id) {
        const memberRes = await api.get<{ members: Member[] }>(`/api/agency/${active.agencyId._id}/members`)
        const inviteRes = hasAgencyPermission(active, 'agency:invite_members')
          ? await api.get<{ invites: Invite[] }>(`/api/agency/${active.agencyId._id}/invites`)
          : { data: { invites: [] } }
        setMembers(memberRes.data.members || [])
        setInvites(inviteRes.data.invites || [])
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load agency workers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'tradie') {
      load()
    } else if (user) {
      setLoading(false)
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleCategory = (category: string) => {
    setInviteCategories(prev => prev.includes(category) ? prev.filter(item => item !== category) : [...prev, category])
  }

  const createInvite = async () => {
    if (!agency?._id) return
    if (!form.email.trim() && !form.phone.trim()) {
      setError('Email or phone is required.')
      return
    }

    setCreating(true)
    setError('')
    setInviteUrl('')
    try {
      const res = await api.post<{ invite: Invite; inviteUrl: string; emailSent: boolean }>(`/api/agency/${agency._id}/invites`, {
        email: form.email.trim(),
        phone: form.phone.trim(),
        name: form.name.trim(),
        role: form.role,
        categories: inviteCategories,
      })
      setInviteUrl(res.data.inviteUrl)
      setForm({ email: '', phone: '', name: '', role: 'worker' })
      setInviteCategories([])
      await load()
    } catch (err: any) {
      setError(err?.message || 'Failed to create invite.')
    } finally {
      setCreating(false)
    }
  }

  if (isLoading || loading) {
    return <main className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-gray-400" /></main>
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <section className="max-w-6xl mx-auto space-y-6">
        <Link href="/agency" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"><ArrowLeft className="w-4 h-4" /> Back to agency</Link>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2"><Users className="w-7 h-7 text-blue-600" /> Workers</h1>
            <p className="text-sm text-gray-500 mt-1">{agency?.name || 'Agency'} worker invites and roles.</p>
          </div>
          <button onClick={load} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600"><RefreshCw className="w-4 h-4" /> Refresh</button>
        </div>

        {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}
        {!agency && <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">No agency manager worker access found for this account.</div>}
        {inviteUrl && (
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <span>Invite created. Copy this link if email delivery is not available.</span>
            <button onClick={() => navigator.clipboard.writeText(inviteUrl)} className="inline-flex items-center gap-1.5 font-semibold"><Copy className="w-4 h-4" /> Copy Link</button>
          </div>
        )}

        {canInvite ? (
          <section className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><UserPlus className="w-5 h-5 text-blue-600" /> Invite worker or manager</h2>
            <div className="grid md:grid-cols-4 gap-3">
              <input value={form.email} onChange={event => setForm(prev => ({ ...prev, email: event.target.value }))} placeholder="Email" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
              <input value={form.phone} onChange={event => setForm(prev => ({ ...prev, phone: event.target.value }))} placeholder="Phone optional" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
              <input value={form.name} onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))} placeholder="Name optional" className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
              <select value={form.role} onChange={event => setForm(prev => ({ ...prev, role: event.target.value }))} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm">
                {['worker', 'manager', 'dispatcher', 'finance', 'support'].map(role => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              {(agency?.categories || []).map(category => (
                <button key={category} type="button" onClick={() => toggleCategory(category)} className={`px-2.5 py-1.5 rounded-full text-xs font-semibold border ${inviteCategories.includes(category) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                  {category.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
            <button onClick={createInvite} disabled={creating || !agency} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-60">
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Invite
            </button>
          </section>
        ) : agency ? (
          <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
            Your role can review agency workers, but only owners and authorised managers can invite new users.
          </div>
        ) : null}

        <div className="grid lg:grid-cols-2 gap-4">
          <section className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Members</h2>
            <div className="divide-y divide-gray-100">
              {members.length === 0 ? <p className="text-sm text-gray-500 py-8 text-center">No members yet.</p> : members.map(member => (
                <div key={member._id} className="py-3">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{member.userId?.name || 'Unknown user'}</p>
                      <p className="text-xs text-gray-500">{member.userId?.email} - {member.role} - {member.status}</p>
                    </div>
                    <span className="text-xs text-gray-400">{member.hideFinancials ? 'no finance' : 'finance'}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {canInvite && (
            <section className="bg-white border border-gray-200 rounded-2xl p-5">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Mail className="w-4 h-4 text-blue-600" /> Invites</h2>
              <div className="divide-y divide-gray-100">
                {invites.length === 0 ? <p className="text-sm text-gray-500 py-8 text-center">No invites yet.</p> : invites.map(invite => (
                  <div key={invite._id} className="py-3">
                    <p className="text-sm font-semibold text-gray-900">{invite.name || invite.email || invite.phone}</p>
                    <p className="text-xs text-gray-500">{invite.role} - {invite.status} - expires {new Date(invite.expiresAt).toLocaleDateString('en-AU')}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  )
}
