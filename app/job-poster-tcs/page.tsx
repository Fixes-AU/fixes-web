import type { Metadata } from 'next'
import { Header, Footer } from '@/components/upwork'

export const metadata: Metadata = {
  title: 'Job Poster Terms & Conditions | Fixes',
  description: 'Terms and conditions for clients and homeowners posting jobs on the Fixes platform.',
}

export default function JobPosterTcsPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <section className="bg-(--upwork-navy) text-white py-16 lg:py-24 px-4 lg:px-6">
        <div className="max-w-275 mx-auto text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#A4FF43] mb-4">
            Legal
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[3rem] font-extrabold leading-tight mb-6">
            Job Poster T&amp;Cs
          </h1>
          <p className="text-base text-white/70 leading-relaxed max-w-150 mx-auto">
            Please read these terms carefully before posting a job or engaging a tradesperson on the Fixes platform.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 px-4 lg:px-6 grow">
        <div className="max-w-200 mx-auto">
          <h2 className="text-2xl font-extrabold text-(--upwork-navy) mb-6">1. Introduction</h2>
          <p className="text-(--upwork-gray) mb-6 leading-relaxed">
            These Terms and Conditions ("Terms") apply when you use the Fixes platform to post jobs, request quotes, and hire tradespeople. By using the platform as a Client, you agree to follow these Terms.
          </p>
          
          <h2 className="text-2xl font-extrabold text-(--upwork-navy) mb-6">2. Posting Jobs</h2>
          <p className="text-(--upwork-gray) mb-6 leading-relaxed">
            When you post a job, give accurate and honest details about the work, location, and any hazards. You must have the right to approve work at the property.
          </p>
          
          <h2 className="text-2xl font-extrabold text-(--upwork-navy) mb-6">3. Payments and Escrow</h2>
          <p className="text-(--upwork-gray) mb-6 leading-relaxed">
            When you accept a quote from a Fixer, the agreed amount is charged through Stripe and held safely in escrow. The money is only released to the Fixer after you confirm the job is done to your satisfaction, or after a dispute is resolved.
          </p>

          <h2 className="text-2xl font-extrabold text-(--upwork-navy) mb-6">4. Cancellations</h2>
          <p className="text-(--upwork-gray) mb-6 leading-relaxed">
            If you cancel a job after a Fixer has been sent or has arrived, a cancellation fee may apply to cover the Fixer's time and travel. See our full cancellation policy for details and fees.
          </p>

          <div className="bg-[#f6f6f6] p-6 rounded-xl mt-10">
            <p className="text-sm text-(--upwork-gray)">
              <strong>Last Updated:</strong> June 2026<br/>
              For full legal details, please contact our support team.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
