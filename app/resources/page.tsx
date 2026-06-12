import type { Metadata } from 'next'
import { Header, Footer } from '@/components/upwork'

export const metadata: Metadata = {
  title: 'Resources | Fixes',
  description: 'Helpful resources, guides, and tools for the Fixes community.',
}

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <section className="bg-(--upwork-navy) text-white py-16 lg:py-24 px-4 lg:px-6">
        <div className="max-w-275 mx-auto text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#A4FF43] mb-4">
            Learn &amp; Grow
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[3rem] font-extrabold leading-tight mb-6">
            Platform Resources
          </h1>
          <p className="text-base text-white/70 leading-relaxed max-w-150 mx-auto">
            Access guides, templates, and insights to help you manage your home or grow your trade business.
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
              Our resource hub is currently under construction. Stay tuned for expert articles, downloadable guides, and more.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
