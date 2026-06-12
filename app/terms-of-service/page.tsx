import type { Metadata } from 'next'
import { Header, Footer } from '@/components/upwork'

export const metadata: Metadata = {
  title: 'Terms of Service | Fixes',
  description: 'Terms of Service for using the Fixes platform.',
}

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <section className="bg-(--upwork-navy) text-white py-16 lg:py-24 px-4 lg:px-6">
        <div className="max-w-275 mx-auto text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#A4FF43] mb-4">
            Legal
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-[3rem] font-extrabold leading-tight mb-6">
            Terms of Service
          </h1>
          <p className="text-base text-white/70 leading-relaxed max-w-150 mx-auto">
            Please read these terms carefully before using the Fixes platform.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24 px-4 lg:px-6 grow">
        <div className="max-w-200 mx-auto">
          <h2 className="text-2xl font-extrabold text-(--upwork-navy) mb-4">1. Introduction</h2>
          <p className="text-(--upwork-gray) mb-6 leading-relaxed">
            These Terms of Service govern your use of our website, mobile applications, and services. By accessing or using Fixes, you agree to be bound by these Terms.
          </p>
          <div className="bg-[#f6f6f6] rounded-2xl p-8 mb-6 border border-gray-100">
             <p className="text-(--upwork-gray) leading-relaxed">
              We are currently finalizing our comprehensive Terms of Service. Please check back soon or contact our legal team at contact@fixesau.com for specific inquiries.
             </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
