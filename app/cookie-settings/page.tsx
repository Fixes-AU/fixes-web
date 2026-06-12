import type { Metadata } from 'next'
import { Header, Footer } from '@/components/upwork'

export const metadata: Metadata = {
  title: 'Cookie Settings | Fixes',
  description: 'Manage your cookie preferences for the Fixes platform.',
}

export default function CookieSettingsPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <section className="bg-(--upwork-navy) text-white py-16 lg:py-24 px-4 lg:px-6">
        <div className="max-w-275 mx-auto text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#A4FF43] mb-4">
            Privacy
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[3rem] font-extrabold leading-tight mb-6">
            Cookie Settings
          </h1>
          <p className="text-base text-white/70 leading-relaxed max-w-150 mx-auto">
            Control how we use cookies and tracking technologies to improve your experience.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 px-4 lg:px-6 grow">
        <div className="max-w-200 mx-auto">
          <h2 className="text-2xl font-extrabold text-(--upwork-navy) mb-4">Manage Preferences</h2>
          <p className="text-(--upwork-gray) mb-6 leading-relaxed">
            The Fixes web platform primarily uses essential cookies required for the site to function properly, alongside anonymised Vercel Analytics. We do not use third-party advertising trackers.
          </p>
          
          <div className="bg-[#f6f6f6] rounded-2xl p-8 mb-6 border border-gray-100">
             <h3 className="text-lg font-bold text-(--upwork-navy) mb-2">Essential Cookies (Always Active)</h3>
             <p className="text-sm text-(--upwork-gray) leading-relaxed">
              These cookies are necessary for the website to function and cannot be switched off. They are usually set in response to actions made by you, such as logging in or filling in forms.
             </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
