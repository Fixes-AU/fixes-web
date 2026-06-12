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
            These Job Poster Terms and Conditions ("Terms") govern your use of the Fixes platform to post jobs, request quotes, and hire tradespeople. By using the platform as a Client, you agree to comply with these Terms.
          </p>
          
          <h2 className="text-2xl font-extrabold text-(--upwork-navy) mb-6">2. Posting Jobs</h2>
          <p className="text-(--upwork-gray) mb-6 leading-relaxed">
            When posting a job, you must provide accurate, complete, and honest information about the scope of work, location, and any relevant details or hazards. You must have the legal right to authorise work at the specified property.
          </p>
          
          <h2 className="text-2xl font-extrabold text-(--upwork-navy) mb-6">3. Payments and Escrow</h2>
          <p className="text-(--upwork-gray) mb-6 leading-relaxed">
            Upon accepting a quote from a Fixer, the agreed funds will be captured via Stripe and held securely in escrow. Funds will only be released to the Fixer once you have confirmed the job is completed to a satisfactory standard, or in accordance with our dispute resolution policy.
          </p>

          <h2 className="text-2xl font-extrabold text-(--upwork-navy) mb-6">4. Cancellations</h2>
          <p className="text-(--upwork-gray) mb-6 leading-relaxed">
            If you cancel a job after a Fixer has been dispatched or has arrived on-site, a cancellation fee may apply to compensate the Fixer for their time and travel. Please refer to our full cancellation policy for specific details and fee structures.
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
