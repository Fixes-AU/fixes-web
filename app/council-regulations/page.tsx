import type { Metadata } from 'next'
import { Header, Footer } from '@/components/upwork'

export const metadata: Metadata = {
  title: 'Council Regulations | Fixes',
  description: 'Important information regarding local council regulations and permits for home improvement projects.',
}

export default function CouncilRegulationsPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <section className="bg-(--upwork-navy) text-white py-16 lg:py-24 px-4 lg:px-6">
        <div className="max-w-275 mx-auto text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#A4FF43] mb-4">
            Homeowner Guide
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[3rem] font-extrabold leading-tight mb-6">
            Council Regulations
          </h1>
          <p className="text-base text-white/70 leading-relaxed max-w-150 mx-auto">
            A general guide to understanding when you might need council approval or building permits for your home repair or renovation jobs.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 px-4 lg:px-6 grow">
        <div className="max-w-200 mx-auto">
          <h2 className="text-2xl font-extrabold text-(--upwork-navy) mb-6">When is a permit required?</h2>
          <p className="text-(--upwork-gray) mb-6 leading-relaxed">
            While many small repairs and maintenance jobs do not require council approval, larger projects such as structural changes, extensions, decks above a certain height, or major plumbing works often do. 
            It is the homeowner's responsibility to ensure that any necessary permits or approvals are obtained before work commences.
          </p>
          
          <div className="bg-[#f6f6f6] rounded-2xl p-8 mb-8 border border-gray-100">
            <h3 className="text-lg font-bold text-(--upwork-navy) mb-3">Common jobs needing approval:</h3>
            <ul className="list-disc pl-5 text-(--upwork-gray) space-y-2">
              <li>Building a new deck, pergola, or carport</li>
              <li>Installing a new swimming pool or spa</li>
              <li>Significant structural alterations to the home</li>
              <li>Removing large, protected trees</li>
              <li>Major drainage or sewerage works</li>
            </ul>
          </div>
          
          <h3 className="text-xl font-bold text-(--upwork-navy) mb-4">Working with Fixers</h3>
          <p className="text-(--upwork-gray) mb-6 leading-relaxed">
            Our experienced fixers can often advise you if they believe a permit may be required for the scope of work you have requested. However, they are not legal experts. Always consult directly with your local city council or a registered building surveyor before proceeding with major work.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
