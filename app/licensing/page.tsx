import type { Metadata } from 'next'
import { Header, Footer } from '@/components/upwork'

export const metadata: Metadata = {
  title: 'Australian Trade Licensing Requirements | Fixes',
  description: 'Learn about the trade licensing requirements for fixers on the Fixes platform in Australia and New Zealand.',
}

export default function LicensingPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <section className="bg-(--upwork-navy) text-white py-16 lg:py-24 px-4 lg:px-6">
        <div className="max-w-275 mx-auto text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#A4FF43] mb-4">
            Compliance
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[3rem] font-extrabold leading-tight mb-6">
            Trade Licensing
          </h1>
          <p className="text-base text-white/70 leading-relaxed max-w-150 mx-auto">
            Understanding the licensing requirements for tradespeople on the Fixes platform. We take compliance seriously to ensure your safety and quality of work.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 px-4 lg:px-6 grow">
        <div className="max-w-200 mx-auto">
          <h2 className="text-2xl font-extrabold text-(--upwork-navy) mb-6">Our Strict Verification Process</h2>
          <p className="text-(--upwork-gray) mb-6 leading-relaxed">
            Every tradesperson on the Fixes platform must hold a valid licence for regulated trades like plumbing, electrical, and gas fitting. Our compliance team checks each licence against state and national registries before a fixer can accept jobs.
          </p>
          
          <h3 className="text-xl font-bold text-(--upwork-navy) mb-4 mt-10">Regulated vs. Unregulated Trades</h3>
          <p className="text-(--upwork-gray) mb-6 leading-relaxed">
            In Australia and New Zealand, some trades need a licence by law, while others do not. 
            For trades that do not need a licence (like general cleaning or basic gardening), fixers must still provide proof of identity, a background check, and public liability insurance.
          </p>
          
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-6 mt-8">
            <h4 className="text-[#15803d] font-bold mb-2">Check Your State Requirements</h4>
            <p className="text-[#15803d] text-sm">
              Licensing laws differ by state and territory. If you are not sure whether a job needs a licensed professional, check your local state government or consumer affairs website.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
