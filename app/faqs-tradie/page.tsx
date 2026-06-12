import type { Metadata } from 'next'
import { Header, Footer } from '@/components/upwork'

export const metadata: Metadata = {
  title: 'Tradie FAQs | Fixes',
  description: 'Frequently asked questions for tradies and fixers using the Fixes platform.',
}

export default function TradieFaqsPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <section className="bg-(--upwork-navy) text-white py-16 lg:py-24 px-4 lg:px-6">
        <div className="max-w-275 mx-auto text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#A4FF43] mb-4">
            Help &amp; Support
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[3rem] font-extrabold leading-tight mb-6">
            Tradie FAQs
          </h1>
          <p className="text-base text-white/70 leading-relaxed max-w-150 mx-auto">
            Everything you need to know about working, earning, and growing your business on the Fixes platform.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 px-4 lg:px-6 grow">
        <div className="max-w-200 mx-auto">
          
          <div className="bg-[#f6f6f6] rounded-2xl p-8 lg:p-12 mb-6 border border-gray-100">
            <h3 className="text-xl font-extrabold text-(--upwork-navy) mb-3">Are there any lead fees?</h3>
            <p className="text-(--upwork-gray) text-[0.95rem] leading-relaxed">
              No. We do not charge you to view leads or to quote on jobs. Fixes operates on a simple commission structure, meaning we only make money when you successfully complete a job and get paid.
            </p>
          </div>
          
          <div className="bg-[#f6f6f6] rounded-2xl p-8 lg:p-12 mb-6 border border-gray-100">
            <h3 className="text-xl font-extrabold text-(--upwork-navy) mb-3">When do I get paid?</h3>
            <p className="text-(--upwork-gray) text-[0.95rem] leading-relaxed">
              Funds are held in escrow before you even arrive on site. Once the job is marked complete and the client provides the OTP, payouts are processed automatically via Stripe Connect. Standard bank processing times apply (usually 2-3 business days).
            </p>
          </div>

          <div className="bg-[#f6f6f6] rounded-2xl p-8 lg:p-12 mb-6 border border-gray-100">
            <h3 className="text-xl font-extrabold text-(--upwork-navy) mb-3">What happens if the scope of work changes?</h3>
            <p className="text-(--upwork-gray) text-[0.95rem] leading-relaxed">
              If a job requires more work than originally stated, you can submit a 'Scope Change' request directly in the app. The client will be prompted to approve the new total and the extra funds will be added to the escrow pool before you proceed.
            </p>
          </div>

          <div className="text-center mt-12">
            <p className="text-(--upwork-gray) mb-4">Have more questions?</p>
            <a href="mailto:contact@fixesau.com" className="inline-flex items-center justify-center px-6 py-3 font-bold text-(--upwork-navy) transition-colors hover:opacity-90 rounded-full bg-[#A4FF43]">
              Contact Support
            </a>
          </div>
          
        </div>
      </section>

      <Footer />
    </main>
  )
}
