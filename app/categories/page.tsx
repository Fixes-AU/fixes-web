// fixes-web/app/categories/page.tsx

import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Zap, Droplets, Wind, Paintbrush, PaintRoller,
  Grid, Hammer, ShieldAlert, HardHat, Sparkles,
  Trash2, CircleEllipsis, ArrowRight, ChevronRight, Wrench, Leaf,
} from 'lucide-react'
import { Header, Footer } from '@/components/upwork'
import { SERVICE_DATA } from '@/lib/service-data'

export const metadata: Metadata = {
  title: 'Trade Categories | Fixes — Find Tradies by Trade',
  description:
    'Browse all trade categories on Fixes. Find licensed electricians, plumbers, HVAC technicians, painters, carpenters, cleaners, and more across Australia.',
}

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

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="bg-linear-to-b from-(--upwork-navy) to-[#0a2a1f] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            All Trade Categories
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Browse every trade category on Fixes. Find the right licensed, insured
            professional for any job — big or small.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 lg:px-6 -mt-8 mb-12 relative z-10">
        <Link
          href="/categories/emergency"
          className="flex items-center gap-4 bg-red-50 border-2 border-red-200 rounded-2xl p-5 lg:p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-7 h-7 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-red-600">Emergency Make Safe — 24/7</p>
            <p className="text-sm text-red-400">
              Exposed wiring, burst pipes, storm damage — urgent safety response available around the clock.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform shrink-0" />
        </Link>
      </section>

      <section className="max-w-7xl mx-auto px-4 lg:px-6 pb-20">
        <h2 className="text-2xl lg:text-3xl font-bold text-(--upwork-navy) mb-8">
          Browse by Trade
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICE_DATA.filter((s) => s.category !== 'emergency_make_safe').map((service) => {
            const Icon = ICON_MAP[service.category] || CircleEllipsis
            return (
              <Link
                key={service.slug}
                href={`/categories/${service.slug}`}
                className="group relative border border-gray-200 rounded-2xl p-6 hover:border-(--upwork-green) hover:shadow-lg transition-all bg-white"
              >
                <div
                  className="absolute top-0 left-6 right-6 h-1 rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: service.accent }}
                />

                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${service.accent}15` }}
                  >
                    <div style={{ color: service.accent }}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-(--upwork-navy) group-hover:text-(--upwork-green) transition-colors">
                      {service.label}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{service.tagline}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-(--upwork-green) group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {service.popularTasks.slice(0, 3).map((task) => (
                    <span
                      key={task.label}
                      className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
                    >
                      {task.label}
                    </span>
                  ))}
                  {service.popularTasks.length > 3 && (
                    <span className="text-xs text-gray-400 px-1 py-1">
                      +{service.popularTasks.length - 3} more
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <Footer />
    </main>
  )
}
