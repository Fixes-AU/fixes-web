// fixes-web/app/about-us/page.tsx

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Manrope } from 'next/font/google'
import { Header, Footer } from '@/components/upwork'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['700'],
})

export const metadata: Metadata = {
  title: 'About Us | Fixes — Hire Trusted Tradies Instantly',
  description:
    'Learn about Fixes — Australia\'s AI-powered tradie marketplace. Our story, mission, values, and the team building the future of home services across Australia and New Zealand.',
}

export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="relative w-full overflow-hidden" style={{ aspectRatio: '1920 / 768' }}>
        <div className="absolute inset-0 z-0">
          <Image
            src="/about-page-assets/Gemini_Generated_Image_ho4zv7ho4zv7ho4z-2@2x.png"
            alt=""
            fill
            className="object-cover object-center"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(0,80,40,0.88) 0%, rgba(0,80,40,0.55) 35%, rgba(0,80,40,0.18) 65%, transparent 100%)',
            }}
          />
        </div>

        <div className="absolute bottom-0 right-0 lg:right-[8%] z-10 flex items-end justify-end">
          <Image
            src="/about-page-assets/Gemini_Generated_Image_9809t59809t59809-2@2x.png"
            alt="The Fixes founding team"
            width={1200}
            height={600}
            className="w-[70vw] sm:w-[60vw] lg:w-[50vw] max-w-195 h-auto object-contain"
            priority
          />
        </div>

        <div className="absolute bottom-[18%] sm:bottom-[20%] lg:bottom-[22%] left-0 z-20 w-full px-6 sm:px-32 lg:px-48">
          <h1
            className={`${manrope.className} font-bold text-white leading-tight`}
            style={{ fontSize: 'clamp(1.75rem, 4vw, 78px)' }}
          >
            About Us
          </h1>
        </div>
      </section>

      <section className="py-10 lg:py-20 px-4 lg:px-6">
        <div className="max-w-200 mx-auto">
          <h2 className="text-2xl lg:text-[2rem] font-extrabold text-(--upwork-navy) leading-snug mb-8">
            We reimagine the way<br />
            Australians and Kiwis get things fixed.
          </h2>

          <div className="space-y-5 text-(--upwork-gray) text-[0.95rem] leading-relaxed">
            <p>
              Getting things fixed is what we power. It&apos;s our lifeblood. It runs through every job posted, every trade
              matched, every handshake at the front door.
            </p>
            <p>
              It&apos;s what gets us out of bed each morning. It pushes us to constantly reimagine how we can connect
              people better — for you. For every leaking tap, every rewire, every renovation.
            </p>
            <p>
              For every trade who deserves steady work. For every homeowner who just needs it done right.
            </p>
            <p>
              Across Australia and New Zealand. In your suburb.<br />
              At the incredible speed of now.
            </p>
          </div>
        </div>
      </section>

      <section className="relative w-full overflow-hidden" style={{ aspectRatio: '1920 / 686' }}>
        <Image
          src="/about-page-assets/cgo-background@2x.png"
          alt="Medee — Chief Growth Officer at Fixes"
          fill
          className="object-cover object-center"
        />

        <div className="absolute inset-0 z-10 flex flex-col justify-center px-4 pr-[45%] sm:px-12 sm:pr-[50%] lg:pl-[15%] lg:pr-[50%] py-4 sm:py-12">
          <h2 className="text-base sm:text-2xl lg:text-[2.5rem] font-extrabold text-white leading-tight mb-1 sm:mb-5">
            A letter from our<br />CGO
          </h2>
          <p className="text-[10px] sm:text-sm lg:text-[0.95rem] text-white/75 leading-snug sm:leading-relaxed mb-2 sm:mb-8 max-w-95">
            Read about our team&apos;s commitment to provide everyone on
            our platform with the technology that can help them
            move ahead.
          </p>
          <Link
            href="#"
            className="inline-flex items-center gap-2 px-4 sm:px-7 py-1.5 sm:py-3 font-bold text-[10px] sm:text-sm text-(--upwork-navy) w-fit transition-colors hover:opacity-90"
            style={{ backgroundColor: '#A4FF43', borderRadius: '27px' }}
          >
            Read Medee&apos;s Letter
          </Link>
        </div>
      </section>

      <section className="py-10 lg:py-20 px-4 lg:px-6">
        <div className="max-w-275 mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <h2 className="text-2xl lg:text-[2rem] font-extrabold text-(--upwork-navy) mb-5 leading-tight">
              Your safety drives us
            </h2>
            <p className="text-[0.95rem] text-(--upwork-gray) leading-relaxed mb-5">
              Whether you&apos;re the client waiting for a tradie or the fixer walking through the door, your
              safety is essential. We are committed to doing our part, and
              technology is at the heart of our approach. We partner with
              safety advocates and develop new technologies and systems
              to help improve safety and help make it easier for everyone to
              get around.
            </p>
            <Link href="/safety" className="text-[0.95rem] font-bold text-(--upwork-navy) underline underline-offset-3 hover:text-(--upwork-green) transition-colors">
              Learn more
            </Link>
          </div>

          <div className="flex justify-center items-center">
            <div className="relative flex items-center justify-center">
              <div className="w-50 h-50 sm:w-65 sm:h-65 lg:w-[320px] lg:h-80 bg-gray-100" />
              <Image
                src="/about-page-assets/Remove background project - June 11, 2026 at 21.27.34.png"
                alt="Safety shield icon"
                width={300}
                height={300}
                className="absolute w-35 sm:w-50 lg:w-62.5 h-auto object-contain mix-blend-multiply"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 lg:py-20 px-4 lg:px-6">
        <div className="max-w-275 mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="rounded-xl overflow-hidden">
            <Image
              src="/about-page-assets/community-impact.jpg"
              alt="Fixes community impact across Australia"
              width={600}
              height={400}
              className="w-full h-auto object-cover rounded-xl"
            />
          </div>
          <div>
            <h3 className="text-xl lg:text-[1.75rem] font-extrabold text-(--upwork-navy) mb-5 leading-tight">
              Community Impact
            </h3>
            <p className="text-[0.95rem] text-(--upwork-gray) leading-relaxed mb-5">
              Fixes is committed to empowering local tradies and strengthening
              communities across Australia and New Zealand. We believe every
              neighbourhood deserves access to trusted, skilled tradespeople
              — without the guesswork. By connecting homeowners directly with
              verified fixers, we&apos;re creating opportunities for small businesses
              to thrive while making essential services accessible to all.
              We support local trade apprenticeships and partner with community
              organisations to help build a fairer, more connected trades
              industry.
            </p>
            <Link href="/community-impact" className="text-[0.95rem] font-bold text-(--upwork-navy) underline underline-offset-3 hover:text-(--upwork-green) transition-colors">
              Learn more
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10 lg:py-20 px-4 lg:px-6">
        <div className="max-w-275 mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="md:order-2 rounded-xl overflow-hidden flex items-center justify-center">
            <Image
              src="/about-page-assets/fixes-platform-tools.png"
              alt="Fixes platform tools and tradie ecosystem"
              width={500}
              height={333}
              className="w-[85%] sm:w-[75%] max-w-105 h-auto object-contain mix-blend-multiply"
            />
          </div>
          <div className="md:order-1">
            <h3 className="text-xl lg:text-[1.75rem] font-extrabold text-(--upwork-navy) mb-5 leading-tight">
              Beyond the fix
            </h3>
            <p className="text-[0.95rem] text-(--upwork-gray) leading-relaxed mb-5">
              In addition to helping homeowners find trusted tradies for every
              job, we&apos;re building tools that make running a trade business
              easier and more rewarding. From AI-powered quoting that ensures
              fair pricing, to streamlined payment systems that guarantee
              tradies get paid on time — Fixes is reimagining the entire
              trade services experience. We&apos;re always helping tradies grow
              their business and clients find peace of mind.
            </p>
          </div>
        </div>
      </section>

      <section className="py-10 lg:py-20 px-4 lg:px-6">
        <div className="max-w-275 mx-auto">
          <h2 className="text-2xl lg:text-[2rem] font-extrabold text-(--upwork-navy) mb-10 leading-tight">
            Keep up with the latest
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            <div>
              <h3 className="text-base font-extrabold text-(--upwork-navy) mb-3">Fixes Blog</h3>
              <p className="text-sm text-(--upwork-gray) leading-relaxed mb-5">
                Get announcements about partnerships, app
                updates, initiatives and more near you and
                around the world.
              </p>
              <Link href="/blog" className="text-sm font-bold text-(--upwork-navy) underline underline-offset-3 hover:text-(--upwork-green) transition-colors">
                Go to Fixes Blog
              </Link>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-(--upwork-navy) mb-3">Blog</h3>
              <p className="text-sm text-(--upwork-gray) leading-relaxed mb-5">
                Find new places to explore and learn about Fixes
                products, partnerships and more.
              </p>
              <Link href="/blog" className="text-sm font-bold text-(--upwork-navy) underline underline-offset-3 hover:text-(--upwork-green) transition-colors">
                Read our posts
              </Link>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-(--upwork-navy) mb-3">Investor relations</h3>
              <p className="text-sm text-(--upwork-gray) leading-relaxed mb-5">
                Download financial reports, see next-quarter
                plans and read about our corporate
                responsibility initiatives.
              </p>
              <Link href="/investors" className="text-sm font-bold text-(--upwork-navy) underline underline-offset-3 hover:text-(--upwork-green) transition-colors">
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 lg:py-20 px-4 lg:px-6 bg-[#f6f6f6]">
        <div className="max-w-275 mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl lg:text-[2.25rem] font-extrabold text-(--upwork-navy) leading-tight">
              Come reimagine<br />with us
            </h2>
          </div>
          <div className="flex justify-center">
            <Image
              src="/about-page-assets/australia-map-in-blue-vector-28893627.png"
              alt="Map of Australia — Fixes operates nationwide"
              width={500}
              height={440}
              className="w-full max-w-105 h-auto object-contain"
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
