import type { Metadata } from 'next'
import { Header, Footer } from '@/components/upwork'

export const metadata: Metadata = {
  title: 'How Fixes Works | Fixes',
  description: 'Learn how the Fixes ecosystem connects homeowners with trusted tradespeople instantly.',
}

export default function HowFixesWorksPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <section className="bg-(--upwork-navy) text-white py-16 lg:py-24 px-4 lg:px-6">
        <div className="max-w-275 mx-auto text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#A4FF43] mb-4">
            The Platform
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[3rem] font-extrabold leading-tight mb-6">
            How Fixes Works
          </h1>
          <p className="text-base text-white/70 leading-relaxed max-w-150 mx-auto">
            Fixes is transforming the trade services industry across Australia and New Zealand by making hiring and working seamless, safe, and entirely digital.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 px-4 lg:px-6 grow">
        <div className="max-w-200 mx-auto">
          
          <div className="mb-12">
            <h2 className="text-2xl font-extrabold text-(--upwork-navy) mb-4">1. Instant Quoting via AI</h2>
            <p className="text-(--upwork-gray) leading-relaxed">
              Gone are the days of waiting weeks for a quote. Clients snap a few photos, describe the issue, and our proprietary AI engine generates an accurate, upfront quote instantly. We standardise pricing so everyone gets a fair deal.
            </p>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-extrabold text-(--upwork-navy) mb-4">2. Smart Dispatching</h2>
            <p className="text-(--upwork-gray) leading-relaxed">
              Once a client accepts the quote, the job is dispatched to nearby, verified tradies based on their GPS location and trade category. The first tradie to accept secures the job. No bidding, no lead fees.
            </p>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-extrabold text-(--upwork-navy) mb-4">3. Escrow and Guaranteed Payments</h2>
            <p className="text-(--upwork-gray) leading-relaxed">
              Clients pre-authorise payment when requesting the job. Funds are held securely in escrow by Stripe. When the tradie completes the work and uploads photos, the funds are instantly released. Tradies never have to chase an invoice again.
            </p>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  )
}
