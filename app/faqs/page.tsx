import type { Metadata } from 'next'
import { Header, Footer } from '@/components/upwork'

export const metadata: Metadata = {
  title: 'Client FAQs | Fixes — Hire Trusted Tradies Instantly',
  description: 'Frequently asked questions for clients and homeowners using the Fixes platform.',
}

export default function ClientFaqsPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <section className="bg-(--upwork-navy) text-white py-16 lg:py-24 px-4 lg:px-6">
        <div className="max-w-275 mx-auto text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#A4FF43] mb-4">
            Help &amp; Support
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[3rem] font-extrabold leading-tight mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-base text-white/70 leading-relaxed max-w-150 mx-auto">
            Find answers to common questions about posting jobs, payments, matching with tradies, and the Fixes guarantee.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 px-4 lg:px-6 grow">
        <div className="max-w-200 mx-auto">
          <div className="bg-[#f6f6f6] rounded-2xl p-8 lg:p-12 mb-6 border border-gray-100">
            <h3 className="text-xl font-extrabold text-(--upwork-navy) mb-3">How does pricing work?</h3>
            <p className="text-(--upwork-gray) text-[0.95rem] leading-relaxed">
              When you post a job, our AI engine generates an accurate, upfront quote based on the job details and photos you provide. You will see this single, transparent price before confirming your request, so there are no surprises.
            </p>
          </div>
          
          <div className="bg-[#f6f6f6] rounded-2xl p-8 lg:p-12 mb-6 border border-gray-100">
            <h3 className="text-xl font-extrabold text-(--upwork-navy) mb-3">Are the tradies verified?</h3>
            <p className="text-(--upwork-gray) text-[0.95rem] leading-relaxed">
              Yes, every fixer on our platform undergoes a rigorous verification process. We check trade licences, public liability insurance, and government-issued ID to ensure your safety and the quality of work.
            </p>
          </div>

          <div className="bg-[#f6f6f6] rounded-2xl p-8 lg:p-12 mb-6 border border-gray-100">
            <h3 className="text-xl font-extrabold text-(--upwork-navy) mb-3">How do I pay for a job?</h3>
            <p className="text-(--upwork-gray) text-[0.95rem] leading-relaxed">
              Payments are handled securely through the Fixes app via Stripe. When you accept a quote, the funds are held securely in escrow and are only released to the tradie once you confirm the job is completed.
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
