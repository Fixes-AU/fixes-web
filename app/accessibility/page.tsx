import type { Metadata } from 'next'
import { Header, Footer } from '@/components/upwork'

export const metadata: Metadata = {
  title: 'Accessibility | Fixes',
  description: 'Our commitment to digital accessibility for all users.',
}

export default function AccessibilityPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <section className="bg-(--upwork-navy) text-white py-16 lg:py-24 px-4 lg:px-6">
        <div className="max-w-275 mx-auto text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#A4FF43] mb-4">
            Inclusion
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[3rem] font-extrabold leading-tight mb-6">
            Accessibility Statement
          </h1>
          <p className="text-base text-white/70 leading-relaxed max-w-150 mx-auto">
            Fixes is committed to ensuring digital accessibility for people with disabilities.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 px-4 lg:px-6 grow">
        <div className="max-w-200 mx-auto">
          <p className="text-(--upwork-gray) mb-6 leading-relaxed">
            We are continually improving the user experience for everyone, and applying the relevant accessibility standards (WCAG 2.1).
          </p>
          
          <h2 className="text-2xl font-extrabold text-(--upwork-navy) mb-4 mt-10">Feedback</h2>
          <p className="text-(--upwork-gray) mb-6 leading-relaxed">
            We welcome your feedback on the accessibility of Fixes. If you encounter any accessibility barriers on our web platform or mobile applications, please let us know:
          </p>
          
          <div className="bg-[#f6f6f6] rounded-2xl p-8 mb-6 border border-gray-100 text-center">
             <a href="mailto:contact@fixesau.com" className="font-bold text-[#14a800] hover:underline">
               contact@fixesau.com
             </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
