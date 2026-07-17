// fixes-web/app/categories/[slug]/page.tsx

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Zap, Droplets, Wind, Paintbrush, PaintRoller,
  Grid, Hammer, ShieldAlert, HardHat, Sparkles,
  Trash2, CircleEllipsis, ArrowRight, ChevronRight, Wrench, Leaf,
  CheckCircle2, Shield, Clock, Star,
  ArrowLeft,
} from 'lucide-react'
import { Header, Footer } from '@/components/upwork'
import { SERVICE_DATA, getServiceBySlug } from '@/lib/service-data'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  electrical: Zap,
  plumbing: Droplets,
  hvac: Wind,
  plastering: PaintRoller,
  painting: Paintbrush,
  flooring: Grid,
  carpentry: Hammer,
  emergency_make_safe: ShieldAlert,
  general_labourer: HardHat,
  handyman: Wrench,
  gardening_landscaping: Leaf,
  cleaning: Sparkles,
  waste_removal: Trash2,
  other: CircleEllipsis,
}

export async function generateStaticParams() {
  return SERVICE_DATA.map((service) => ({ slug: service.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) {
    return { title: 'Category Not Found | Fixes' }
  }
  return {
    title: `${service.label} | Fixes — Hire Trusted ${service.label}s`,
    description: service.description,
  }
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = getServiceBySlug(slug)

  if (!service) {
    notFound()
  }

  const Icon = ICON_MAP[service.category] || CircleEllipsis

  const related = SERVICE_DATA.filter(
    (s) => s.category !== service.category && s.slug !== 'other'
  ).slice(0, 4)

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section
        className="relative py-16 lg:py-24 overflow-hidden"
        style={{ backgroundColor: `${service.accent}08` }}
      >
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: service.accent }}
        />
        <div
          className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-2xl opacity-10"
          style={{ backgroundColor: service.accent }}
        />

        <div className="max-w-7xl mx-auto px-4 lg:px-6 relative">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Link href="/" className="hover:text-(--upwork-green) transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/categories" className="hover:text-(--upwork-green) transition-colors">Categories</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-(--upwork-navy) font-medium">{service.label}</span>
          </div>

          <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-16">
            <div className="flex-1">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: `${service.accent}18` }}
              >
                <div style={{ color: service.accent }}>
                  <Icon className="w-8 h-8" />
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-(--upwork-navy) mb-3">
                {service.label}
              </h1>
              <p className="text-lg text-gray-500 mb-6 max-w-xl">{service.tagline}</p>
              <p className="text-gray-600 leading-relaxed max-w-xl mb-8">
                {service.description}
              </p>

              <Link
                href={`/post-job?category=${service.category}`}
                className="inline-flex items-center gap-2 bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white font-semibold py-3.5 px-8 rounded-xl transition-colors text-lg"
              >
                Post a {service.label} Job
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="w-full lg:w-80 shrink-0">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-(--upwork-navy) uppercase tracking-wider">
                  Why Fixes
                </h3>
                {[
                  { icon: Shield, label: 'Licensed & insured tradies', desc: 'Every professional is verified before joining' },
                  { icon: Star, label: 'AI-powered smart pricing', desc: 'Fair, transparent quotes in seconds' },
                  { icon: Clock, label: 'Fast dispatch', desc: 'Get a tradie to your door when you need one' },
                  { icon: CheckCircle2, label: 'Satisfaction guaranteed', desc: 'Your payment is held until the job is done right' },
                ].map((badge) => (
                  <div key={badge.label} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                      <badge.icon className="w-4 h-4 text-(--upwork-green)" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-(--upwork-navy)">{badge.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{badge.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-(--upwork-navy) mb-2">
            Popular Tasks
          </h2>
          <p className="text-gray-500 mb-8">Tap a task to get started with a pre-filled job description.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {service.popularTasks.map((task) => (
              <Link
                key={task.label}
                href={`/post-job?category=${service.category}&q=${encodeURIComponent(task.preFilledTitle)}`}
                className="flex items-center justify-between gap-3 border border-gray-200 rounded-xl px-5 py-4 hover:border-(--upwork-green) hover:bg-green-50/30 transition-all group"
              >
                <span className="text-sm font-medium text-(--upwork-navy) group-hover:text-(--upwork-green) transition-colors">
                  {task.label}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-(--upwork-green) group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 lg:px-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-(--upwork-navy) text-center mb-12">
            How It Works
          </h2>

          <div className="space-y-8">
            {service.howItWorks.map((step, i) => (
              <div key={i} className="flex items-start gap-5">
                <div className="w-10 h-10 rounded-full bg-(--upwork-green) flex items-center justify-center shrink-0">
                  <span className="text-white font-bold">{i + 1}</span>
                </div>
                <div className="pt-1">
                  <h3 className="text-lg font-bold text-(--upwork-navy) mb-1">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href={`/post-job?category=${service.category}`}
              className="inline-flex items-center gap-2 bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white font-semibold py-3.5 px-8 rounded-xl transition-colors"
            >
              Get Your Personalised Quote
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 lg:px-6">
          <div className="bg-linear-to-br from-(--upwork-navy) to-[#0a2a1f] rounded-3xl p-8 lg:p-12 text-center">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Sparkles className="w-7 h-7 text-(--upwork-green)" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
              Smart Pricing for Every Job
            </h2>
            <p className="text-gray-300 max-w-lg mx-auto mb-8 leading-relaxed">
              Every job is unique. Our AI analyses your description, photos, and location to
              generate a personalised, fair quote — no hidden fees, no call-out charges.
            </p>
            <Link
              href={`/post-job?category=${service.category}`}
              className="inline-flex items-center gap-2 bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white font-semibold py-3 px-7 rounded-xl transition-colors"
            >
              Get a Quote Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-(--upwork-navy) mb-8">
            Explore Other Trades
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((rel) => {
              const RelIcon = ICON_MAP[rel.category] || CircleEllipsis
              return (
                <Link
                  key={rel.slug}
                  href={`/categories/${rel.slug}`}
                  className="group border border-gray-200 rounded-2xl p-5 hover:border-(--upwork-green) hover:shadow-md transition-all bg-white text-center"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: `${rel.accent}15` }}
                  >
                    <div style={{ color: rel.accent }}>
                      <RelIcon className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-(--upwork-navy) group-hover:text-(--upwork-green) transition-colors">
                    {rel.label}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">{rel.tagline}</p>
                </Link>
              )
            })}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 text-(--upwork-green) font-medium hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              View all trade categories
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
