import type { Metadata } from 'next'
import { Header, Footer } from '@/components/upwork'

export const metadata: Metadata = {
  title: 'Press | Fixes',
  description: 'News, press releases, and media resources for Fixes.',
}

export default function PressPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <section className="bg-(--upwork-navy) text-white py-16 lg:py-24 px-4 lg:px-6">
        <div className="max-w-275 mx-auto text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#A4FF43] mb-4">
            Newsroom
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[3rem] font-extrabold leading-tight mb-6">
            Press &amp; Media
          </h1>
          <p className="text-base text-white/70 leading-relaxed max-w-150 mx-auto">
            The latest news, announcements, and media resources from Fixes.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 px-4 lg:px-6 grow">
        <div className="max-w-275 mx-auto text-center">
          <div className="bg-[#f6f6f6] rounded-2xl p-12 lg:p-20 border border-gray-100">
            <h2 className="text-2xl font-extrabold text-(--upwork-navy) mb-4">
              Media Inquiries
            </h2>
            <p className="text-[0.95rem] text-(--upwork-gray) leading-relaxed max-w-125 mx-auto mb-8">
              For all press and media inquiries, including requests for interviews or brand assets, please contact our PR team.
            </p>
            <a href="mailto:contact@fixesau.com" className="inline-flex items-center justify-center px-8 py-4 font-bold text-(--upwork-navy) transition-colors hover:opacity-90 rounded-full bg-[#A4FF43]">
              Contact Press Team
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
