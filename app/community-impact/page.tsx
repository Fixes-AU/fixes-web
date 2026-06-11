// fixes-web/app/community-impact/page.tsx
 
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Manrope } from 'next/font/google'
import { Header, Footer } from '@/components/upwork'
import { Heart, Users, GraduationCap, Handshake, MapPin, TrendingUp } from 'lucide-react'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['700'],
})

export const metadata: Metadata = {
  title: 'Community Impact | Fixes — Empowering Local Tradies',
  description:
    'Discover how Fixes is empowering local tradies, strengthening communities, and building a fairer trades industry across Australia and New Zealand.',
}

export default function CommunityImpactPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="relative w-full overflow-hidden" style={{ aspectRatio: '1920 / 600' }}>
        <Image
          src="/about-page-assets/community-impact.jpg"
          alt="Fixes community impact"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 z-10 flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-12">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-white/60 mb-3">
            Community Impact
          </p>
          <h1
            className={`${manrope.className} text-2xl sm:text-3xl lg:text-[3rem] font-bold text-white leading-tight mb-4`}
          >
            Building stronger<br />communities, one<br />fix at a time
          </h1>
          <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-120">
            We&apos;re not just connecting tradies and homeowners — we&apos;re empowering local
            businesses, creating jobs, and making essential services accessible to all Australians.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-4 lg:px-6">
        <div className="max-w-275 mx-auto">
          <h2 className="text-2xl lg:text-[2rem] font-extrabold text-(--upwork-navy) mb-10 text-center leading-tight">
            Our impact across Australia &amp; New Zealand
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: '$2.4M+', label: 'Paid to local tradies', icon: TrendingUp },
              { value: '1,200+', label: 'Small businesses supported', icon: Users },
              { value: '150+', label: 'Suburbs reached', icon: MapPin },
              { value: '45+', label: 'Trade categories served', icon: Handshake },
            ].map((stat) => (
              <div key={stat.label} className="text-center py-6">
                <stat.icon className="w-8 h-8 text-(--upwork-green) mx-auto mb-3" />
                <p className="text-2xl lg:text-3xl font-extrabold text-(--upwork-navy) mb-1">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-(--upwork-gray)">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-4 lg:px-6 bg-[#f6f6f6]">
        <div className="max-w-275 mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <Heart className="w-8 h-8 text-(--upwork-green) mb-5" />
            <h2 className="text-xl lg:text-[1.75rem] font-extrabold text-(--upwork-navy) mb-5 leading-tight">
              Empowering local tradies to thrive
            </h2>
            <p className="text-[0.95rem] text-(--upwork-gray) leading-relaxed mb-4">
              Every tradie on Fixes is a small business owner. We provide the tools,
              technology, and customer pipeline they need to grow their business without
              the overhead of traditional marketing or word-of-mouth limitations.
            </p>
            <p className="text-[0.95rem] text-(--upwork-gray) leading-relaxed mb-4">
              Our AI-powered quoting engine ensures fair pricing for every job, while
              our Instant Pay system means tradies get paid the same day — not 30 days later.
              We&apos;re levelling the playing field for sole operators and small teams.
            </p>
            <p className="text-[0.95rem] text-(--upwork-gray) leading-relaxed">
              Since launch, Fixes has helped over 1,200 tradies earn a living doing
              what they love, with an average 40% increase in monthly bookings after
              joining the platform.
            </p>
          </div>
          <div className="bg-white rounded-xl px-8 py-8">
            <blockquote className="text-[0.95rem] text-(--upwork-navy) leading-relaxed italic mb-5">
              &ldquo;Before Fixes, I was spending half my week chasing quotes and following up
              leads. Now the jobs come to me, the pricing is fair, and I get paid instantly.
              I&apos;ve doubled my revenue in six months.&rdquo;
            </blockquote>
            <p className="text-sm font-bold text-(--upwork-navy)">Jake M.</p>
            <p className="text-xs text-(--upwork-gray)">Licensed Electrician, Brisbane</p>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-4 lg:px-6">
        <div className="max-w-275 mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="md:order-2">
            <GraduationCap className="w-8 h-8 text-(--upwork-green) mb-5" />
            <h2 className="text-xl lg:text-[1.75rem] font-extrabold text-(--upwork-navy) mb-5 leading-tight">
              Supporting the next generation of tradies
            </h2>
            <p className="text-[0.95rem] text-(--upwork-gray) leading-relaxed mb-4">
              Australia faces a growing skills shortage across the trades. Fixes is
              committed to being part of the solution. We partner with TAFEs, trade
              schools, and industry bodies to support apprenticeship programs and help
              young Australians start their careers in the trades.
            </p>
            <p className="text-[0.95rem] text-(--upwork-gray) leading-relaxed mb-4">
              Through our Fixes Apprenticeship Fund, we provide financial support,
              mentorship connections, and guaranteed starter jobs for graduating apprentices
              who join the platform.
            </p>
            <p className="text-[0.95rem] text-(--upwork-gray) leading-relaxed">
              Our goal is to support 500 apprentices by 2028, helping bridge the skills
              gap while building a pipeline of trusted, qualified fixers.
            </p>
          </div>
          <div className="md:order-1 bg-[#f6f6f6] rounded-xl px-8 py-8">
            <h3 className="text-base font-extrabold text-(--upwork-navy) mb-6">
              Apprenticeship Fund Goals
            </h3>
            <div className="space-y-5">
              {[
                { label: 'Apprentices supported to date', value: '87' },
                { label: 'TAFE & trade school partners', value: '12' },
                { label: 'Target by 2028', value: '500' },
                { label: 'Average first-year earnings on Fixes', value: '$62K' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-(--upwork-gray)">{item.label}</span>
                  <span className="text-sm font-extrabold text-(--upwork-navy)">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-4 lg:px-6 bg-[#f6f6f6]">
        <div className="max-w-275 mx-auto">
          <div className="text-center mb-12">
            <Handshake className="w-8 h-8 text-(--upwork-green) mx-auto mb-5" />
            <h2 className="text-xl lg:text-[1.75rem] font-extrabold text-(--upwork-navy) mb-4 leading-tight">
              Making essential services accessible to all
            </h2>
            <p className="text-[0.95rem] text-(--upwork-gray) leading-relaxed max-w-155 mx-auto">
              Every Australian deserves access to a trusted tradie — regardless of where
              they live or how much they earn. Here&apos;s how we&apos;re working to make that a reality.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                title: 'Regional Reach',
                description: 'Expanding beyond capital cities to connect regional and rural communities with qualified tradies, closing the service gap for underserved areas.',
              },
              {
                title: 'Fair & Transparent Pricing',
                description: 'Our AI quoting engine ensures every homeowner receives a fair, market-rate price — eliminating price gouging and building trust in the process.',
              },
              {
                title: 'Community Partnerships',
                description: 'We partner with local councils, housing authorities, and community organisations to provide discounted services for vulnerable residents and emergency repairs.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl px-6 py-6">
                <h3 className="text-base font-extrabold text-(--upwork-navy) mb-3">
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

      <section className="py-16 lg:py-20 px-4 lg:px-6">
        <div className="max-w-175 mx-auto text-center">
          <h2 className="text-2xl lg:text-[2rem] font-extrabold text-(--upwork-navy) mb-5 leading-tight">
            Join us in building a better trades industry
          </h2>
          <p className="text-[0.95rem] text-(--upwork-gray) leading-relaxed mb-8">
            Whether you&apos;re a tradie looking to grow your business, a homeowner
            who needs a fix, or a community partner — there&apos;s a place for you on Fixes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/i-want-to-work"
              className="inline-flex items-center gap-2 px-7 py-3 font-bold text-sm text-(--upwork-navy) hover:opacity-90 transition-colors"
              style={{ backgroundColor: '#A4FF43', borderRadius: '27px' }}
            >
              Become a Fixer
            </Link>
            <Link
              href="/post-job"
              className="inline-flex items-center gap-2 px-7 py-3 font-bold text-sm text-(--upwork-navy) border-2 border-(--upwork-navy) hover:bg-(--upwork-navy) hover:text-white transition-colors"
              style={{ borderRadius: '27px' }}
            >
              Post a Job
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
