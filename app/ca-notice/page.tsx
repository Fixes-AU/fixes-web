import type { Metadata } from 'next'
import { Header, Footer } from '@/components/upwork'

export const metadata: Metadata = {
  title: 'CA Notice at Collection | Fixes',
  description: 'California Notice at Collection for Fixes platform.',
}

export default function CaNoticePage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <section className="bg-(--upwork-navy) text-white py-16 lg:py-24 px-4 lg:px-6">
        <div className="max-w-275 mx-auto text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#A4FF43] mb-4">
            Legal
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[3rem] font-extrabold leading-tight mb-6">
            CA Notice at Collection
          </h1>
          <p className="text-base text-white/70 leading-relaxed max-w-150 mx-auto">
            Information for California residents regarding the collection of personal information.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 px-4 lg:px-6 grow">
        <div className="max-w-200 mx-auto">
          <div className="bg-[#f6f6f6] rounded-2xl p-8 mb-6 border border-gray-100">
             <p className="text-(--upwork-gray) leading-relaxed">
              While Fixes currently operates exclusively in Australia and New Zealand, we maintain this notice for compliance purposes. We do not sell your personal information. Please refer to our Privacy Policy for comprehensive details on the data we collect and how it is used.
             </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
