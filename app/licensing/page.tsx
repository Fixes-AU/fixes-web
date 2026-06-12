import type { Metadata } from 'next'
import { Header, Footer } from '@/components/upwork'

export const metadata: Metadata = {
  title: 'Licensing Information | Fixes',
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
            Every tradesperson on the Fixes platform must provide a valid trade licence for regulated trades (such as plumbing, electrical, and gas fitting). Our dedicated compliance team cross-references these licences against state and national registries before a fixer is allowed to accept any jobs.
          </p>
          
          <h3 className="text-xl font-bold text-(--upwork-navy) mb-4 mt-10">Regulated vs. Unregulated Trades</h3>
          <p className="text-(--upwork-gray) mb-6 leading-relaxed">
            In Australia and New Zealand, some trades require mandatory licensing by law, while others do not. 
            For unregulated trades (like general cleaning or basic gardening), fixers are still required to provide proof of identity, background checks, and public liability insurance.
          </p>
          
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-6 mt-8">
            <h4 className="text-[#15803d] font-bold mb-2">Check Your State Requirements</h4>
            <p className="text-[#15803d] text-sm">
              Licensing laws vary between states and territories. If you are unsure whether a job requires a licensed professional, please refer to your local state government or consumer affairs website.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
