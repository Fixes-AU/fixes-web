import type { Metadata } from 'next'
import { Header, Footer } from '@/components/upwork'

export const metadata: Metadata = {
  title: 'Help & Support | Fixes',
  description: 'Get help with the Fixes app, report an issue, or contact our support team.',
}

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <section className="bg-(--upwork-navy) text-white py-16 lg:py-24 px-4 lg:px-6">
        <div className="max-w-275 mx-auto text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#A4FF43] mb-4">
            We're Here For You
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[3rem] font-extrabold leading-tight mb-6">
            Help &amp; Support
          </h1>
          <p className="text-base text-white/70 leading-relaxed max-w-150 mx-auto">
            Find answers to your questions, track your jobs, or get in touch with our dedicated support team.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 px-4 lg:px-6 grow">
        <div className="max-w-200 mx-auto text-center">
          <div className="bg-[#f6f6f6] rounded-2xl p-12 lg:p-20 border border-gray-100">
            <h2 className="text-2xl font-extrabold text-(--upwork-navy) mb-4">
              Contact Us Directly
            </h2>
            <p className="text-[0.95rem] text-(--upwork-gray) leading-relaxed max-w-125 mx-auto mb-8">
              Whether you're a client needing help with a job or a tradie with a question about a payout, our team is ready to assist.
            </p>
            <a href="mailto:contact@fixesau.com" className="inline-flex items-center justify-center px-8 py-4 font-bold text-(--upwork-navy) transition-colors hover:opacity-90 rounded-full bg-[#A4FF43]">
              Email contact@fixesau.com
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
