// fixes-web/app/investors/page.tsx
 
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Manrope } from 'next/font/google'
import { Header, Footer } from '@/components/upwork'
import {
  ArrowRight,
  FileText,
  BarChart3,
  Users,
  Mail,
  Calendar,
  TrendingUp,
  Shield,
  Download,
  ExternalLink,
} from 'lucide-react'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['700'],
})

export const metadata: Metadata = {
  title: 'Investor Relations | Fixes — Australia\'s AI-Powered Tradie Marketplace',
  description:
    'Investor relations for Fixes Pty Ltd. Access financial reports, company governance, latest news, and resources for current and prospective investors.',
}

export default function InvestorsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="bg-(--upwork-navy) text-white py-20 lg:py-28 px-4 lg:px-6">
        <div className="max-w-275 mx-auto">
          <p className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">
            Investor Relations
          </p>
          <h1
            className={`${manrope.className} text-3xl sm:text-4xl lg:text-[3.25rem] font-bold leading-tight mb-6`}
          >
            Building the future of<br />trade services in Australia<br />&amp; New Zealand
          </h1>
          <p className="text-base lg:text-lg text-white/70 leading-relaxed max-w-170 mb-10">
            Fixes is Australia&apos;s AI-powered tradie marketplace connecting homeowners
            with trusted, verified tradespeople. We&apos;re reimagining how people find,
            book, and pay for home services — one fix at a time.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="#annual-reports"
              className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm text-(--upwork-navy) transition-colors hover:opacity-90"
              style={{ backgroundColor: '#A4FF43', borderRadius: '27px' }}
            >
              <FileText className="w-4 h-4" />
              Annual Reports
            </Link>
            <Link
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm text-white border border-white/30 hover:border-white/60 transition-colors"
              style={{ borderRadius: '27px' }}
            >
              <Mail className="w-4 h-4" />
              Contact Investor Relations
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-4 lg:px-6">
        <div className="max-w-275 mx-auto">
          <h2 className="text-2xl lg:text-[2rem] font-extrabold text-(--upwork-navy) mb-10 leading-tight">
            Company Highlights
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Platform GMV', value: '$2.4M+', sub: 'Gross marketplace value (FY25)' },
              { label: 'Verified Fixers', value: '1,200+', sub: 'Licensed & insured tradies' },
              { label: 'Jobs Completed', value: '8,500+', sub: 'Successful jobs to date' },
              { label: 'Markets', value: 'AU & NZ', sub: 'Expanding nationwide' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[#f6f6f6] rounded-xl px-6 py-7"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-(--upwork-gray) mb-2">
                  {stat.label}
                </p>
                <p className="text-2xl lg:text-3xl font-extrabold text-(--upwork-navy) mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-(--upwork-gray)">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-4 lg:px-6 bg-[#f6f6f6]">
        <div className="max-w-275 mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl lg:text-[2rem] font-extrabold text-(--upwork-navy) leading-tight">
              Latest News &amp; Updates
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                date: 'June 2026',
                title: 'Fixes Launches AI-Powered Instant Quoting for All Trade Categories',
                type: 'Press Release',
              },
              {
                date: 'May 2026',
                title: 'Fixes Expands to New Zealand — Auckland & Wellington Now Live',
                type: 'Announcement',
              },
              {
                date: 'April 2026',
                title: 'Fixes Raises Seed Round to Accelerate Growth Across Australia',
                type: 'Funding',
              },
            ].map((news) => (
              <div
                key={news.title}
                className="bg-white rounded-xl px-6 py-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-(--upwork-green)">
                    {news.type}
                  </span>
                  <span className="text-xs text-(--upwork-gray)">{news.date}</span>
                </div>
                <p className="text-[0.95rem] font-bold text-(--upwork-navy) leading-snug mb-4">
                  {news.title}
                </p>
                <Link
                  href="#"
                  className="text-sm font-bold text-(--upwork-navy) inline-flex items-center gap-1 hover:text-(--upwork-green) transition-colors"
                >
                  Read more <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="annual-reports" className="py-16 lg:py-20 px-4 lg:px-6">
        <div className="max-w-275 mx-auto">
          <h2 className="text-2xl lg:text-[2rem] font-extrabold text-(--upwork-navy) mb-3 leading-tight">
            Financial Reports
          </h2>
          <p className="text-[0.95rem] text-(--upwork-gray) leading-relaxed mb-10 max-w-150">
            Download our latest financial reports, quarterly results, and investor presentations.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'FY2026 Annual Report', size: '2.4 MB', icon: FileText },
              { title: 'Q1 2026 Quarterly Results', size: '1.1 MB', icon: BarChart3 },
              { title: 'Investor Presentation — June 2026', size: '3.6 MB', icon: TrendingUp },
              { title: 'FY2025 Annual Report', size: '2.1 MB', icon: FileText },
              { title: 'Q4 2025 Quarterly Results', size: '980 KB', icon: BarChart3 },
              { title: 'Corporate Responsibility Report 2025', size: '1.8 MB', icon: Shield },
            ].map((doc) => (
              <Link
                key={doc.title}
                href="#"
                className="flex items-center gap-4 bg-[#f6f6f6] rounded-xl px-5 py-5 hover:bg-gray-200/70 transition-colors group"
              >
                <div className="shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <doc.icon className="w-5 h-5 text-(--upwork-navy)" />
                </div>
                <div className="grow min-w-0">
                  <p className="text-sm font-bold text-(--upwork-navy) leading-snug">
                    {doc.title}
                  </p>
                  <p className="text-xs text-(--upwork-gray)">{doc.size}</p>
                </div>
                <Download className="w-4 h-4 text-(--upwork-gray) shrink-0 group-hover:text-(--upwork-navy) transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-4 lg:px-6 bg-[#f6f6f6]">
        <div className="max-w-275 mx-auto">
          <h2 className="text-2xl lg:text-[2rem] font-extrabold text-(--upwork-navy) mb-10 leading-tight">
            Events &amp; Presentations
          </h2>

          <div className="space-y-4">
            {[
              {
                date: 'Jul 15, 2026',
                title: 'Fixes Q2 2026 Earnings Call',
                location: 'Virtual',
              },
              {
                date: 'Aug 22, 2026',
                title: 'Australian PropTech & TradesTech Summit',
                location: 'Sydney, AU',
              },
              {
                date: 'Sep 10, 2026',
                title: 'Fixes Investor Day 2026',
                location: 'Melbourne, AU',
              },
            ].map((event) => (
              <div
                key={event.title}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 bg-white rounded-xl px-6 py-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 shrink-0">
                  <Calendar className="w-5 h-5 text-(--upwork-green)" />
                  <span className="text-sm font-bold text-(--upwork-navy) whitespace-nowrap">
                    {event.date}
                  </span>
                </div>
                <div className="grow">
                  <p className="text-[0.95rem] font-bold text-(--upwork-navy)">
                    {event.title}
                  </p>
                  <p className="text-xs text-(--upwork-gray)">{event.location}</p>
                </div>
                <Link
                  href="#"
                  className="text-sm font-bold text-(--upwork-navy) inline-flex items-center gap-1 hover:text-(--upwork-green) transition-colors shrink-0"
                >
                  Details <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-4 lg:px-6">
        <div className="max-w-275 mx-auto">
          <h2 className="text-2xl lg:text-[2rem] font-extrabold text-(--upwork-navy) mb-3 leading-tight">
            Corporate Governance
          </h2>
          <p className="text-[0.95rem] text-(--upwork-gray) leading-relaxed mb-10 max-w-150">
            We are committed to maintaining the highest standards of corporate governance,
            transparency, and accountability to our shareholders and the wider community.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Board of Directors',
                description: 'Meet our experienced board members guiding Fixes\' strategic direction.',
                icon: Users,
                link: '/about-us#leadership',
              },
              {
                title: 'Documents & Charters',
                description: 'Access our corporate charter, bylaws, and committee charters.',
                icon: FileText,
                link: '#',
              },
              {
                title: 'Code of Conduct',
                description: 'Our commitment to ethical business practices and integrity.',
                icon: Shield,
                link: '#',
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.link}
                className="bg-[#f6f6f6] rounded-xl px-6 py-6 hover:bg-gray-200/70 transition-colors group block"
              >
                <item.icon className="w-7 h-7 text-(--upwork-green) mb-4" />
                <h3 className="text-base font-extrabold text-(--upwork-navy) mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-(--upwork-gray) leading-relaxed mb-3">
                  {item.description}
                </p>
                <span className="text-sm font-bold text-(--upwork-navy) inline-flex items-center gap-1 group-hover:text-(--upwork-green) transition-colors">
                  View <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 px-4 lg:px-6 bg-[#f6f6f6]">
        <div className="max-w-275 mx-auto">
          <h2 className="text-2xl lg:text-[2rem] font-extrabold text-(--upwork-navy) mb-10 leading-tight">
            Investor Resources
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: 'Investor FAQs', icon: FileText, link: '#' },
              { title: 'Email Alerts', icon: Mail, link: '#' },
              { title: 'Analyst Coverage', icon: BarChart3, link: '#' },
              { title: 'Investor Contacts', icon: Users, link: '#contact' },
            ].map((resource) => (
              <Link
                key={resource.title}
                href={resource.link}
                className="flex items-center gap-4 bg-white rounded-xl px-5 py-5 hover:shadow-md transition-shadow group"
              >
                <resource.icon className="w-6 h-6 text-(--upwork-green) shrink-0" />
                <span className="text-sm font-bold text-(--upwork-navy) group-hover:text-(--upwork-green) transition-colors">
                  {resource.title}
                </span>
                <ArrowRight className="w-4 h-4 text-(--upwork-gray) ml-auto shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-16 lg:py-20 px-4 lg:px-6">
        <div className="max-w-275 mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl lg:text-[2rem] font-extrabold text-(--upwork-navy) mb-5 leading-tight">
              Contact Investor Relations
            </h2>
            <p className="text-[0.95rem] text-(--upwork-gray) leading-relaxed mb-8">
              For investor enquiries, media requests, or to be added to our
              investor mailing list, please reach out to our team.
            </p>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-(--upwork-navy) mb-1">Email</p>
                <Link
                  href="mailto:investors@fixesau.com"
                  className="text-sm text-(--upwork-green) hover:underline"
                >
                  investors@fixesau.com
                </Link>
              </div>
              <div>
                <p className="text-sm font-bold text-(--upwork-navy) mb-1">Registered Office</p>
                <p className="text-sm text-(--upwork-gray)">
                  Fixes Pty Ltd<br />
                  Melbourne, VIC 3000<br />
                  Australia
                </p>
              </div>
              <div>
                <p className="text-sm font-bold text-(--upwork-navy) mb-1">ABN</p>
                <p className="text-sm text-(--upwork-gray)">
                  XX XXX XXX XXX
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#f6f6f6] rounded-xl px-6 py-8">
            <h3 className="text-base font-extrabold text-(--upwork-navy) mb-5">
              Stay Updated
            </h3>
            <p className="text-sm text-(--upwork-gray) leading-relaxed mb-6">
              Subscribe to receive email alerts for press releases,
              financial results, and upcoming events.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="grow px-4 py-3 text-sm bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-(--upwork-green) transition-colors"
              />
              <button
                className="px-6 py-3 font-bold text-sm text-(--upwork-navy) shrink-0 hover:opacity-90 transition-colors"
                style={{ backgroundColor: '#A4FF43', borderRadius: '27px' }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
