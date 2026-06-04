'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

export default function AdminSelectPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!user || user.role !== 'admin') {
      router.replace('/login')
      return
    }
    if (user.isCleaningAdmin && user.isFullAdmin === false) {
      router.replace('/cleaning-admin')
    } else if (!user.isCleaningAdmin) {
      router.replace('/admin')
    }
  }, [user, isLoading, router])

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-[#f2f7f2] to-white flex flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="inline-block">
            <Image src="/logo.svg" alt="Fixes" width={120} height={40} className="h-8 w-auto" priority />
          </Link>
          <div className="flex items-center gap-5">
            <p className="text-sm text-(--upwork-gray) hidden sm:block">
              {user.name}
            </p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-(--upwork-gray) hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl">
          <h1 className="text-2xl font-bold text-(--upwork-navy) text-center mb-2">
            Choose your panel
          </h1>
          <p className="text-sm text-(--upwork-gray) text-center mb-10">
            You have access to multiple dashboards. Pick one to get started.
          </p>

          <div className="space-y-4">
            <Link
              href="/admin"
              className="group flex items-center gap-5 bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#2563EB] hover:shadow-sm transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-[#2563EB]/10 flex items-center justify-center shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-(--upwork-navy)">Fixes Admin</h2>
                <p className="text-sm text-(--upwork-gray) mt-0.5">Users, jobs, tradies, disputes & platform settings</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#2563EB] transition-colors shrink-0" />
            </Link>

            <Link
              href="/cleaning-admin"
              className="group flex items-center gap-5 bg-white rounded-2xl border border-gray-200 p-6 hover:border-teal-500 hover:shadow-sm transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-(--upwork-navy)">Cleaning Admin</h2>
                <p className="text-sm text-(--upwork-gray) mt-0.5">Jobs, cleaners, invites, rates, revenue & dispatch</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-teal-500 transition-colors shrink-0" />
            </Link>
          </div>

          <p className="text-center text-xs text-(--upwork-gray) mt-8">
            Switch anytime from the header inside either panel.
          </p>
        </div>
      </main>
    </div>
  )
}
