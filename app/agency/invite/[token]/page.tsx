'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, CheckCircle2, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'

interface InviteView {
  _id: string
  agency?: { name: string; status: string }
  email?: string
  name?: string
  role: string
  categories: string[]
  expiresAt: string
}

export default function AgencyInvitePage() {
  const params = useParams<{ token: string }>()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [invite, setInvite] = useState<InviteView | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await api.get<{ invite: InviteView }>(`/api/agency/invites/${params.token}`, true)
        setInvite(res.data.invite)
      } catch (err: any) {
        setError(err?.message || 'Invalid or expired invite.')
      } finally {
        setLoading(false)
      }
    }
    if (params.token) load()
  }, [params.token])

  const accept = async () => {
    if (!user) {
      router.push(`/login?next=/agency/invite/${params.token}`)
      return
    }
    setAccepting(true)
    setError('')
    try {
      await api.post(`/api/agency/invites/${params.token}/accept`, {})
      setAccepted(true)
    } catch (err: any) {
      setError(err?.message || 'Failed to accept invite.')
    } finally {
      setAccepting(false)
    }
  }

  if (loading || isLoading) {
    return <main className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-gray-400" /></main>
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <section className="max-w-lg w-full bg-white border border-gray-200 rounded-2xl p-7 text-center shadow-sm">
        {accepted ? (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Invite accepted</h1>
            <p className="text-sm text-gray-500 mt-2">Your agency membership is active.</p>
            <Link href="/agency" className="inline-flex mt-6 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold">Open Agency Portal</Link>
          </>
        ) : (
          <>
            <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Agency invitation</h1>
            {error ? (
              <p className="text-sm text-red-600 mt-3">{error}</p>
            ) : (
              <>
                <p className="text-sm text-gray-500 mt-3">
                  {invite?.agency?.name} invited you to join as <strong>{invite?.role}</strong>.
                </p>
                <button onClick={accept} disabled={accepting} className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-60">
                  {accepting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {user ? 'Accept Invite' : 'Sign in to Accept'}
                </button>
              </>
            )}
          </>
        )}
      </section>
    </main>
  )
}
