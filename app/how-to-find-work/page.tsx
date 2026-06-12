import type { Metadata } from 'next'
import { Header, Footer } from '@/components/upwork'

export const metadata: Metadata = {
  title: 'How to Find Work | Fixes',
  description: 'Learn how to easily find and secure trade jobs in your local area using the Fixes Fixer app.',
}

export default function HowToFindWorkPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <section className="bg-(--upwork-navy) text-white py-16 lg:py-24 px-4 lg:px-6">
        <div className="max-w-275 mx-auto text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#A4FF43] mb-4">
            For Tradies
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[3rem] font-extrabold leading-tight mb-6">
            How to Find Work
          </h1>
          <p className="text-base text-white/70 leading-relaxed max-w-150 mx-auto">
            Stop chasing leads and paying for quotes. With Fixes, the work comes directly to you. Here is how to maximise your earnings on the platform.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 px-4 lg:px-6 grow">
        <div className="max-w-200 mx-auto">
          <div className="flex gap-6 mb-10">
            <div className="w-12 h-12 rounded-full bg-[#f6f6f6] flex items-center justify-center font-bold text-(--upwork-navy) shrink-0 text-xl">1</div>
            <div>
              <h3 className="text-2xl font-extrabold text-(--upwork-navy) mb-3">Set Your Radius and Categories</h3>
              <p className="text-(--upwork-gray) leading-relaxed">
                Log into the Fixer app and set your maximum travel radius and the trade categories you are qualified for. We use this data to instantly match you with jobs precisely in your area.
              </p>
            </div>
          </div>
          
          <div className="flex gap-6 mb-10">
            <div className="w-12 h-12 rounded-full bg-[#f6f6f6] flex items-center justify-center font-bold text-(--upwork-navy) shrink-0 text-xl">2</div>
            <div>
              <h3 className="text-2xl font-extrabold text-(--upwork-navy) mb-3">Go Online to Receive Dispatches</h3>
              <p className="text-(--upwork-gray) leading-relaxed">
                When you are ready to work, simply toggle your status to 'Online' in the app. As soon as a client posts a job that matches your criteria and our AI quoting engine determines the price, you will receive a push notification dispatch.
              </p>
            </div>
          </div>

          <div className="flex gap-6 mb-10">
            <div className="w-12 h-12 rounded-full bg-[#f6f6f6] flex items-center justify-center font-bold text-(--upwork-navy) shrink-0 text-xl">3</div>
            <div>
              <h3 className="text-2xl font-extrabold text-(--upwork-navy) mb-3">Accept and Head to Site</h3>
              <p className="text-(--upwork-gray) leading-relaxed">
                Review the job details, photos, and upfront payout amount. If it works for you, tap 'Accept'. The job is yours—no bidding wars. The app will navigate you directly to the client's property.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
