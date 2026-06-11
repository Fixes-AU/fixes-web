// fixes-web/app/safety/page.tsx
 
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Manrope } from 'next/font/google'
import { Header, Footer } from '@/components/upwork'
import {
  Shield,
  CheckCircle,
  Lock,
  UserCheck,
  Eye,
  AlertTriangle,
  BadgeCheck,
  Phone,
  Star,
} from 'lucide-react'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['700'],
})

export const metadata: Metadata = {
  title: 'Your Safety Drives Us | Fixes — Trust & Safety',
  description:
    'Learn about the safety measures, verification processes, and trust systems that make Fixes the safest way to hire a tradie in Australia and New Zealand.',
}

export default function SafetyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="bg-(--upwork-navy) text-white py-20 lg:py-28 px-4 lg:px-6">
        <div className="max-w-275 mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">
              Trust &amp; Safety
            </p>
            <h1
              className={`${manrope.className} text-3xl sm:text-4xl lg:text-[3rem] font-bold leading-tight mb-6`}
            >
              Your safety<br />drives everything<br />we build
            </h1>
            <p className="text-base text-white/70 leading-relaxed max-w-120">
              Whether you&apos;re the client opening your front door or the fixer arriving on-site,
              your safety is our top priority. Technology, verification, and transparency are at
              the heart of how we operate.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="relative flex items-center justify-center">
              <div className="w-50 h-50 sm:w-60 sm:h-60 lg:w-70 lg:h-70 bg-white/10 rounded-full" />
              <Image
                src="/about-page-assets/Remove background project - June 11, 2026 at 21.27.34.png"
                alt="Safety shield icon"
                width={300}
                height={300}
                className="absolute w-30 sm:w-40 lg:w-50 h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-4 lg:px-6">
        <div className="max-w-275 mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl lg:text-[2rem] font-extrabold text-(--upwork-navy) mb-4 leading-tight">
              How we keep you safe
            </h2>
            <p className="text-[0.95rem] text-(--upwork-gray) leading-relaxed max-w-155 mx-auto">
              Every fixer on our platform goes through a rigorous multi-step verification
              process before they can accept a single job.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BadgeCheck,
                title: 'Licence Verification',
                description: 'We verify every tradie\'s trade licence against state and territory registries. No licence, no access to the platform.',
              },
              {
                icon: Shield,
                title: 'Insurance Checks',
                description: 'All fixers must hold current public liability insurance. We verify policy details and expiry dates before activation.',
              },
              {
                icon: UserCheck,
                title: 'Identity Verification',
                description: 'Government-issued ID verification ensures every fixer is who they say they are. No anonymous accounts — ever.',
              },
              {
                icon: Eye,
                title: 'Background Checks',
                description: 'We partner with accredited background check providers to screen fixers for relevant criminal history before they go live.',
              },
              {
                icon: Star,
                title: 'Rating & Review System',
                description: 'Clients rate every job. Fixers who consistently fall below our quality threshold are suspended pending review.',
              },
              {
                icon: Lock,
                title: 'Secure Payments',
                description: 'All payments are processed through Stripe\'s PCI-compliant infrastructure. No cash exchanges, no disputes.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-[#f6f6f6] rounded-xl px-6 py-7">
                <item.icon className="w-7 h-7 text-(--upwork-green) mb-4" />
                <h3 className="text-base font-extrabold text-(--upwork-navy) mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-(--upwork-gray) leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-4 lg:px-6 bg-[#f6f6f6]">
        <div className="max-w-275 mx-auto">
          <h2 className="text-2xl lg:text-[2rem] font-extrabold text-(--upwork-navy) mb-10 leading-tight">
            Safety for clients
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Know who\'s coming',
                description: 'Before your fixer arrives, you\'ll see their full name, verified photo, licence details, insurance status, and star rating. No surprises.',
              },
              {
                title: 'Real-time job tracking',
                description: 'Track your fixer\'s arrival in real time. Know exactly when they\'re on their way and when they\'ve arrived at your property.',
              },
              {
                title: 'In-app communication',
                description: 'All communication happens through the app — your personal phone number is never shared with the fixer directly.',
              },
              {
                title: 'Dispute resolution',
                description: 'If something goes wrong, our dedicated support team mediates disputes and ensures fair outcomes for both parties.',
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-(--upwork-green) shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-extrabold text-(--upwork-navy) mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-(--upwork-gray) leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-4 lg:px-6">
        <div className="max-w-275 mx-auto">
          <h2 className="text-2xl lg:text-[2rem] font-extrabold text-(--upwork-navy) mb-10 leading-tight">
            Safety for fixers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Verified client profiles',
                description: 'Clients provide verified contact details and property addresses before posting a job. No fake or fraudulent job postings.',
              },
              {
                title: 'Guaranteed payment',
                description: 'Clients pre-authorise payment before the job begins. Once you mark the job complete, payment is released — no chasing invoices.',
              },
              {
                title: 'Safety check-in',
                description: 'Our app includes a check-in feature for fixers working alone. If you don\'t check in within a set time, our team follows up.',
              },
              {
                title: 'Report & block',
                description: 'Fixers can instantly report unsafe situations or block clients. We take every report seriously and act within 24 hours.',
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <CheckCircle className="w-6 h-6 text-(--upwork-green) shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-extrabold text-(--upwork-navy) mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-(--upwork-gray) leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-4 lg:px-6 bg-(--upwork-navy) text-white">
        <div className="max-w-200 mx-auto text-center">
          <AlertTriangle className="w-10 h-10 text-[#A4FF43] mx-auto mb-5" />
          <h2 className="text-2xl lg:text-[2rem] font-extrabold mb-4 leading-tight">
            Need help? We&apos;re here 24/7
          </h2>
          <p className="text-base text-white/70 leading-relaxed mb-8 max-w-135 mx-auto">
            If you ever feel unsafe during a job or need urgent support,
            our safety team is available around the clock.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="tel:1800000000"
              className="inline-flex items-center gap-2 px-7 py-3 font-bold text-sm text-(--upwork-navy) hover:opacity-90 transition-colors"
              style={{ backgroundColor: '#A4FF43', borderRadius: '27px' }}
            >
              <Phone className="w-4 h-4" />
              Call 1800 FIXES
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-2 px-7 py-3 font-bold text-sm text-white border border-white/30 hover:border-white/60 transition-colors"
              style={{ borderRadius: '27px' }}
            >
              Report an Incident
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-4 lg:px-6">
        <div className="max-w-175 mx-auto text-center">
          <h2 className="text-2xl lg:text-[2rem] font-extrabold text-(--upwork-navy) mb-5 leading-tight">
            Our commitment to you
          </h2>
          <p className="text-[0.95rem] text-(--upwork-gray) leading-relaxed mb-4">
            Safety isn&apos;t a feature — it&apos;s the foundation of everything we build.
            We continuously invest in new technologies, partnerships, and processes
            to make Fixes the safest platform for hiring and working as a tradie in Australia.
          </p>
          <p className="text-[0.95rem] text-(--upwork-gray) leading-relaxed">
            If you have suggestions for how we can improve, we want to hear from you.
            Reach out to our trust &amp; safety team at{' '}
            <Link href="mailto:safety@fixesau.com" className="text-(--upwork-green) hover:underline font-bold">
              safety@fixesau.com
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
