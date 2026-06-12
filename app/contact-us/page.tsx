import type { Metadata } from 'next'
import { Header, Footer } from '@/components/upwork'

export const metadata: Metadata = {
  title: 'Contact Us | Fixes',
  description: 'Get in touch with the Fixes team.',
}

export default function ContactUsPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <section className="bg-(--upwork-navy) text-white py-16 lg:py-24 px-4 lg:px-6">
        <div className="max-w-275 mx-auto text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#A4FF43] mb-4">
            Reach Out
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[3rem] font-extrabold leading-tight mb-6">
            Contact Us
          </h1>
          <p className="text-base text-white/70 leading-relaxed max-w-150 mx-auto">
            We'd love to hear from you. Whether you have a question about the platform, feedback, or a business inquiry.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 px-4 lg:px-6 grow">
        <div className="max-w-200 mx-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
            <div className="bg-[#f6f6f6] p-8 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-bold text-(--upwork-navy) mb-3">General Support</h3>
              <p className="text-(--upwork-gray) text-sm leading-relaxed mb-4">
                Need help with a job or your account? Our support team is available to assist you.
              </p>
              <a href="mailto:contact@fixesau.com" className="font-bold text-[#14a800] hover:underline">
                contact@fixesau.com
              </a>
            </div>
            <div className="bg-[#f6f6f6] p-8 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-bold text-(--upwork-navy) mb-3">Office Location</h3>
              <p className="text-(--upwork-gray) text-sm leading-relaxed mb-4">
                86-88 St Helens Crescent<br/>
                Narre Warren North<br/>
                VIC 3804, Australia
              </p>
            </div>
          </div>
          
        </div>
      </section>

      <Footer />
    </main>
  )
}
