import type { Metadata } from 'next'
import { Header, Footer } from '@/components/upwork'

export const metadata: Metadata = {
  title: 'Direct Contracts | Fixes',
  description: 'Information about establishing direct, recurring contracts with trusted tradies and cleaners on Fixes.',
}

export default function DirectContractsPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <section className="bg-(--upwork-navy) text-white py-16 lg:py-24 px-4 lg:px-6">
        <div className="max-w-275 mx-auto text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#A4FF43] mb-4">
            For Ongoing Needs
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[3rem] font-extrabold leading-tight mb-6">
            Direct Contracts
          </h1>
          <p className="text-base text-white/70 leading-relaxed max-w-150 mx-auto">
            Found a fixer you love? Set up a direct contract for recurring services like cleaning, lawn mowing, or regular maintenance.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 px-4 lg:px-6 grow">
        <div className="max-w-200 mx-auto">
          <h2 className="text-2xl font-extrabold text-(--upwork-navy) mb-6">How Direct Contracts Work</h2>
          <p className="text-(--upwork-gray) mb-8 leading-relaxed">
            Direct Contracts allow you to bypass the standard quoting process and book a specific tradesperson or cleaner you've worked with before for ongoing work.
          </p>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#f6f6f6] flex items-center justify-center font-bold text-(--upwork-navy) shrink-0">1</div>
              <div>
                <h3 className="text-lg font-bold text-(--upwork-navy) mb-2">Invite your Fixer</h3>
                <p className="text-(--upwork-gray)">Send a Direct Contract request to a fixer you've previously hired through the platform, outlining the schedule and agreed rates.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#f6f6f6] flex items-center justify-center font-bold text-(--upwork-navy) shrink-0">2</div>
              <div>
                <h3 className="text-lg font-bold text-(--upwork-navy) mb-2">Automated Scheduling</h3>
                <p className="text-(--upwork-gray)">Once accepted, jobs will be automatically created and scheduled based on your chosen frequency (weekly, fortnightly, monthly).</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#f6f6f6] flex items-center justify-center font-bold text-(--upwork-navy) shrink-0">3</div>
              <div>
                <h3 className="text-lg font-bold text-(--upwork-navy) mb-2">Seamless Payments</h3>
                <p className="text-(--upwork-gray)">Payments are processed automatically after each scheduled visit is marked as completed by your fixer. You remain in full control and can pause or cancel the contract at any time.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-sm text-(--upwork-gray)">
              Direct Contracts feature is currently in Beta and rolling out to select clients and agencies.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
