import type { Metadata } from 'next'
import { Header, Footer } from '@/components/upwork'

export const metadata: Metadata = {
  title: 'Trust & Quality | Fixes',
  description: 'Discover how Fixes ensures trust, safety, and high-quality outcomes for every job posted on our platform.',
}

export default function TrustAndQualityPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <section className="bg-(--upwork-navy) text-white py-16 lg:py-24 px-4 lg:px-6">
        <div className="max-w-275 mx-auto text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#A4FF43] mb-4">
            Our Guarantee
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[3rem] font-extrabold leading-tight mb-6">
            Trust &amp; Quality
          </h1>
          <p className="text-base text-white/70 leading-relaxed max-w-150 mx-auto">
            We are committed to providing a reliable, safe, and high-quality experience for both homeowners and tradies.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 px-4 lg:px-6 grow">
        <div className="max-w-200 mx-auto">
          <h2 className="text-2xl font-extrabold text-(--upwork-navy) mb-6">The Fixes Quality Standard</h2>
          <p className="text-(--upwork-gray) mb-8 leading-relaxed">
            We believe that finding a reliable tradie shouldn't feel like a gamble. Our platform is built on transparency and accountability, ensuring that every job meets a high standard of quality.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
            <div className="bg-[#f6f6f6] p-8 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-bold text-(--upwork-navy) mb-3">Community Reviews</h3>
              <p className="text-(--upwork-gray) text-sm leading-relaxed">
                After every job, clients are prompted to leave a rating and written review. This transparent feedback loop ensures fixers are held accountable for their work and professionalism.
              </p>
            </div>
            <div className="bg-[#f6f6f6] p-8 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-bold text-(--upwork-navy) mb-3">Dispute Resolution</h3>
              <p className="text-(--upwork-gray) text-sm leading-relaxed">
                In the rare event that a job doesn't go to plan, our dedicated support team is here to mediate. We hold funds securely in escrow until both parties are satisfied.
              </p>
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-(--upwork-navy) mb-4">Continuous Monitoring</h3>
          <p className="text-(--upwork-gray) leading-relaxed">
            Our system continuously monitors fixer performance. If a tradie's average rating drops below our strict quality threshold, their account is automatically flagged for review and potential suspension. This ensures only the best tradespeople remain active on the Fixes platform.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
