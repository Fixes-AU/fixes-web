import type { Metadata } from 'next'
import { Header, Footer } from '@/components/upwork'

export const metadata: Metadata = {
  title: 'Fixes Reviews | Fixes',
  description: 'Read reviews and testimonials from homeowners and tradespeople using Fixes.',
}

export default function ReviewsPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <section className="bg-(--upwork-navy) text-white py-16 lg:py-24 px-4 lg:px-6">
        <div className="max-w-275 mx-auto text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#A4FF43] mb-4">
            Testimonials
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[3rem] font-extrabold leading-tight mb-6">
            Fixes Reviews
          </h1>
          <p className="text-base text-white/70 leading-relaxed max-w-150 mx-auto">
            See what our community of verified homeowners and skilled tradies has to say about the Fixes experience.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 px-4 lg:px-6 grow">
        <div className="max-w-275 mx-auto text-center">
          <div className="bg-[#f6f6f6] rounded-2xl p-12 lg:p-20 border border-gray-100">
            <h2 className="text-2xl font-extrabold text-(--upwork-navy) mb-4">
              Coming Soon
            </h2>
            <p className="text-[0.95rem] text-(--upwork-gray) leading-relaxed max-w-125 mx-auto">
              We are compiling the latest reviews and success stories from our beta users. Check back soon for a full showcase of community feedback.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
