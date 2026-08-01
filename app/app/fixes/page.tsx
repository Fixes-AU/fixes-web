import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
 
const APP_STORE_URL = "https://apps.apple.com/au/app/fixes/id6777596020"
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.fixesau.app"

export default async function FixesAppRedirect() {
  const headersList = await headers()
  const ua = headersList.get("user-agent") || ""

  if (/iPad|iPhone|iPod/i.test(ua)) {
    redirect(APP_STORE_URL)
  } else if (/android/i.test(ua) && PLAY_STORE_URL) {
    redirect(PLAY_STORE_URL)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0f2d0a] px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <Link href="/" aria-label="Fixes home" className="inline-block">
            <Image
              src="/logo.svg"
              alt="Fixes"
              width={140}
              height={46}
              className="h-10 w-auto mx-auto brightness-0 invert"
            />
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">
          Download the Fixes App
        </h1>
        <p className="text-[#9FE1CB] mb-10 text-lg">
          For homeowners — post jobs, get AI quotes, and track your tradie live.
        </p>

        <section aria-labelledby="fixes-app-features" className="mb-8 rounded-2xl border border-white/15 bg-white/5 p-5 text-left">
          <h2 id="fixes-app-features" className="text-lg font-semibold text-white">Home repairs without the guesswork</h2>
          <p className="mt-3 text-sm leading-6 text-[#CDEDE2]">
            The Fixes app gives homeowners one place to describe a job, review an AI-assisted quote, connect with a suitable
            tradie, and follow the work through completion. Clear scope and timing details help everyone understand what is
            expected before the job begins.
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[#CDEDE2]">
            <li><strong className="text-white">Create a detailed request:</strong> choose a service, explain the problem, add photos, and include access or scheduling information.</li>
            <li><strong className="text-white">Hire with more context:</strong> review job information and work with verified professionals suited to the requested trade and location.</li>
            <li><strong className="text-white">Keep progress together:</strong> track status, messages, scope updates, and secure platform payments from one job record.</li>
          </ul>
          <p className="mt-4 text-sm leading-6 text-[#CDEDE2]">
            Download the client app for your device and create an account when you are ready to post. You can prepare job
            details first and confirm the scope, timing, and payment information before proceeding.
          </p>
          <p className="mt-3 text-sm leading-6 text-[#CDEDE2]">
            For the clearest request, include photos, measurements where relevant, parking or access notes, and any immediate
            safety concerns. These details help the platform and responding tradie understand the work before arrival.
          </p>
          <p className="mt-3 text-sm leading-6 text-[#CDEDE2]">
            Fixes can support common repairs, scheduled maintenance, cleaning, and home-improvement requests across available
            service categories. Review the selected trade and job information carefully, and keep children, pets, and unsafe
            areas clear when a professional is due to attend.
          </p>
          <p className="mt-3 text-sm leading-6 text-[#CDEDE2]">
            Important messages and approved scope changes stay connected to the job, giving you a clearer record if you need
            help or want to review what was agreed.
          </p>
        </section>

        <div className="flex flex-col gap-4">
          <Link
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 bg-white text-[#0f2d0a] font-semibold py-4 px-6 rounded-2xl hover:bg-gray-100 transition-colors text-lg"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Download on the App Store
          </Link>

          {PLAY_STORE_URL ? (
            <Link
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-white text-[#0f2d0a] font-semibold py-4 px-6 rounded-2xl hover:bg-gray-100 transition-colors text-lg"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M3.18 23.29c-.35-.55-.18-1.12-.18-1.68V2.41c0-.58-.16-1.16.19-1.7l10.39 11.29L3.18 23.29zM15.1 13.5l2.62 2.62c-2.34 1.32-4.67 2.64-7.01 3.96-.07.04-.16.06-.27.1L15.1 13.5zm.06-3l-4.7-6.73c.1.04.18.06.26.1 2.33 1.32 4.66 2.63 6.99 3.95L15.16 10.5zM16.69 12l2.39-2.39c.95.55 1.88 1.08 2.85 1.63.33.19.33.33 0 .52-.96.56-1.91 1.1-2.86 1.64L16.69 12z"/>
              </svg>
              Get it on Google Play
            </Link>
          ) : (
            <div className="flex items-center justify-center gap-3 bg-gray-800 text-gray-400 font-semibold py-4 px-6 rounded-2xl text-lg cursor-not-allowed">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M3.18 23.29c-.35-.55-.18-1.12-.18-1.68V2.41c0-.58-.16-1.16.19-1.7l10.39 11.29L3.18 23.29zM15.1 13.5l2.62 2.62c-2.34 1.32-4.67 2.64-7.01 3.96-.07.04-.16.06-.27.1L15.1 13.5zm.06-3l-4.7-6.73c.1.04.18.06.26.1 2.33 1.32 4.66 2.63 6.99 3.95L15.16 10.5zM16.69 12l2.39-2.39c.95.55 1.88 1.08 2.85 1.63.33.19.33.33 0 .52-.96.56-1.91 1.1-2.86 1.64L16.69 12z"/>
              </svg>
              Google Play — Coming Soon
            </div>
          )}
        </div>

        <p className="text-[#639922] text-sm mt-10">
          fixesau.com — work worth doing, done.
        </p>
      </div>
    </main>
  )
}
