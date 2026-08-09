'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Smartphone, Download, Loader2 } from 'lucide-react'

const APP_STORE_URL = 'https://apps.apple.com/au/app/fixes/id6777596020'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.fixesau.app'

function getPlatform(): 'ios' | 'android' | 'desktop' {
  if (typeof navigator === 'undefined') return 'desktop'
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'desktop'
}

function OpenAppContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const jobId = searchParams.get('jobId') || ''
  const email = searchParams.get('email') || ''

  const [status, setStatus] = useState<'trying' | 'fallback'>('trying')
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop')

  useEffect(() => {
    const detected = getPlatform()
    setPlatform(detected)

    const params = new URLSearchParams()
    if (token) params.set('token', token)
    if (jobId) params.set('jobId', jobId)
    if (email) params.set('email', email)
    const deepLink = `fixes://login?${params.toString()}`

    if (detected === 'desktop') {
      setStatus('fallback')
      return
    }

    window.location.href = deepLink

    const fallbackTimer = setTimeout(() => {
      setStatus('fallback')
    }, 1500)

    const handleBlur = () => {
      clearTimeout(fallbackTimer)
    }
    window.addEventListener('blur', handleBlur)

    return () => {
      clearTimeout(fallbackTimer)
      window.removeEventListener('blur', handleBlur)
    }
  }, [token, jobId, email])

  const playStoreWithReferrer = (token || jobId)
    ? `${PLAY_STORE_URL}&referrer=${encodeURIComponent(`token=${token}&jobId=${jobId}&email=${email}`)}`
    : PLAY_STORE_URL
  const storeUrl = platform === 'ios' ? APP_STORE_URL : playStoreWithReferrer

  const handleStoreRedirect = () => {
    window.location.href = storeUrl
  }

  return (
    <div className="min-h-screen bg-[#f9faf9] flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 w-full max-w-md text-center shadow-sm">
        {status === 'trying' ? (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Loader2 className="w-8 h-8 text-[var(--upwork-green)] animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-[var(--upwork-navy)] mb-2">Opening Fixes app…</h1>
            <p className="text-sm text-gray-400">If the app doesn&apos;t open, tap the button below.</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Smartphone className="w-8 h-8 text-[var(--upwork-green)]" />
            </div>
            <h1 className="text-xl font-bold text-[var(--upwork-navy)] mb-2">
              {platform === 'desktop' ? 'Download the Fixes App' : 'Get the Fixes App'}
            </h1>
            <p className="text-sm text-gray-400 mb-6">
              {platform === 'desktop'
                ? 'Scan the QR code from your phone, or download the app from the links below.'
                : 'Install the Fixes app to view your quote, accept it, and get connected with a verified tradie.'}
            </p>

            {platform !== 'desktop' && (
              <button
                onClick={handleStoreRedirect}
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-[var(--upwork-green)] hover:opacity-90 text-white text-sm font-medium transition-opacity mb-4"
              >
                <Download className="w-4 h-4" />
                {platform === 'ios' ? 'Download from App Store' : 'Download from Google Play'}
              </button>
            )}

            <div className="flex gap-3 justify-center">
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                App Store
              </a>
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.36l2.473 1.432a1 1 0 0 1 0 1.744l-2.473 1.432-2.546-2.546 2.546-2.062zM5.864 2.658L16.8 9.285l-2.302 2.302L5.864 2.658z"/></svg>
                Google Play
              </a>
            </div>

            {email && (
              <div className="mt-6 p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Log in with this email after installing:</p>
                <p className="text-sm font-semibold text-[var(--upwork-navy)]">{email}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function OpenAppPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f9faf9] flex items-center justify-center px-4">
          <Loader2 className="w-8 h-8 text-[var(--upwork-green)] animate-spin" />
        </div>
      }
    >
      <OpenAppContent />
    </Suspense>
  )
}
