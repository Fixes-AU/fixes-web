// fixes-web/app/verify-email/[token]/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, Loader2, Mail, Smartphone } from 'lucide-react'
import { api } from '@/lib/api'

type State = 'loading' | 'success' | 'error' | 'already_verified'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent))
  }, [])
  return isMobile
}

function AppStoreButtons() {
  return (
    <div className="flex flex-col gap-3 w-full">
      <a
        href="fixes://verified"
        className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-6 rounded-xl bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white text-sm font-medium transition-colors"
      >
        <Smartphone className="w-4 h-4" />
        Open Fixes App
      </a>
      <div className="flex gap-3 justify-center">
        <a
          href="https://apps.apple.com/app/fixes"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
          App Store
        </a>
        <a
          href="https://play.google.com/store/apps/details?id=com.fixes"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302-2.302 2.302-2.593-2.302 2.593-2.302zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/></svg>
          Google Play
        </a>
      </div>
      <Link
        href="/dashboard"
        className="text-xs text-(--upwork-gray) hover:text-(--upwork-navy) transition-colors"
      >
        or continue on web →
      </Link>
    </div>
  )
}

export default function VerifyEmailPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const [state, setState] = useState<State>('loading')
  const [countdown, setCountdown] = useState(5)
  const [role, setRole] = useState<'client' | 'tradie' | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    async function verify() {
      try {
        const res = await api.get<{ message: string; role?: string }>(`/api/auth/verify-email/${token}`, true)
        
        if (res.data.role) {
          setRole(res.data.role as 'client' | 'tradie')
        }

        if (res.data.message === 'Email already verified') {
          setState('already_verified')
        } else {
          setState('success')
        }
      } catch {
        setState('error')
      }
    }
    verify()
  }, [token])

  useEffect(() => {
    if (state !== 'success' && state !== 'already_verified') return
    if (role === 'tradie') return
    if (isMobile) return

    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval)
          router.push('/dashboard')
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [state, role, isMobile, router])

  return (
    <div className="min-h-screen bg-[#f9faf9] flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 w-full max-w-md text-center shadow-sm">

        {state === 'loading' && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Loader2 className="w-8 h-8 text-(--upwork-green) animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-(--upwork-navy) mb-2">Verifying your email…</h1>
            <p className="text-sm text-gray-400">Please wait a moment.</p>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-(--upwork-navy) mb-2">Email verified!</h1>
            {role === 'tradie' ? (
              <p className="text-sm text-gray-500 mb-6 font-medium">
                You can safely close this window and return to the Fixer app.
              </p>
            ) : isMobile ? (
              <div className="mt-4 space-y-4">
                <p className="text-sm text-gray-500">
                  You're all set. Open the Fixes app to accept your quote and connect with a tradie.
                </p>
                <AppStoreButtons />
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-6">
                  Your email address has been verified. Redirecting to your dashboard in{' '}
                  <span className="font-semibold text-(--upwork-navy)">{countdown}s</span>…
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-6 rounded-xl bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white text-sm font-medium transition-colors"
                >
                  Go to Dashboard
                </Link>
              </>
            )}
          </>
        )}

        {state === 'already_verified' && (
          <>
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-xl font-bold text-(--upwork-navy) mb-2">Already verified</h1>
            {role === 'tradie' ? (
              <p className="text-sm text-gray-500 mb-6 font-medium">
                You can safely close this window and return to the Fixer app.
              </p>
            ) : isMobile ? (
              <div className="mt-4 space-y-4">
                <p className="text-sm text-gray-500">
                  Your email is already verified. Open the Fixes app to continue.
                </p>
                <AppStoreButtons />
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-6">
                  Your email is already verified. Redirecting to your dashboard in{' '}
                  <span className="font-semibold text-(--upwork-navy)">{countdown}s</span>…
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-6 rounded-xl bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white text-sm font-medium transition-colors"
                >
                  Go to Dashboard
                </Link>
              </>
            )}
          </>
        )}

        {state === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-(--upwork-navy) mb-2">Link expired or invalid</h1>
            <p className="text-sm text-gray-400 mb-6">
              This verification link has expired or is invalid. You can request a fresh one from your profile.
            </p>
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-6 rounded-xl bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white text-sm font-medium transition-colors"
            >
              <Mail className="w-4 h-4" />
              Go to Profile to Resend
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
