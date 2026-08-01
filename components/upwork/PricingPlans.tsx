import Image from "next/image"
import Link from "next/link"
import { Check, ChevronRight } from "lucide-react"

const includedFeatures = [
  "Post jobs for free no upfront cost",
  "Get matched with nearby, top-rated tradies",
  "View tradie profiles, ratings and reviews",
  "Message and book directly in the app",
  "Secure payment only released when job is approved",
]

export function PricingPlans() {
  return (
    <section className="relative overflow-hidden bg-white py-15 font-manrope lg:py-20">
      <Image
        src="/home-page-assets/redesign/pricing-backdrop.webp"
        alt=""
        width={1926}
        height={816}
        loading="eager"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-16 h-3/5 w-full -scale-y-100 object-cover opacity-70"
      />
      <div className="relative mx-auto max-w-320 px-5 sm:px-8 lg:px-0">
        <div className="text-center">
          <h2 className="text-[32px] font-semibold leading-11 tracking-[-0.04em] text-black lg:text-[40px] lg:leading-13.75">
            Choose how you want to hire
          </h2>
          <p className="mt-3 text-sm text-[#616161] lg:text-base">Flexible options designed to fit your hiring needs</p>
        </div>

        <div className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 sm:-mx-8 sm:px-8 lg:mx-auto lg:grid lg:max-w-195 lg:grid-cols-2 lg:gap-5 lg:overflow-visible lg:px-0">
          <article className="flex w-[calc(100vw-56px)] max-w-95 shrink-0 snap-start flex-col rounded-2xl border border-[#08544B] bg-white p-6 shadow-sm lg:w-auto lg:max-w-none">
            <h3 className="text-xl font-semibold text-[#031C19]">Basic</h3>
            <p className="mt-3 min-h-17 text-sm leading-5 text-[#616161]">
              Book a tradie for any job around the home no subscription, no lock-in. Just post, hire, and pay when the work is done.
            </p>
            <div className="mt-5 border-b border-black/8 pb-5">
              <p className="text-3xl font-semibold text-[#031C19]">Free</p>
            </div>
            <Link
              href="/register"
              className="mt-5 flex h-11 items-center justify-center rounded-full border border-[#031C19] text-sm font-semibold text-[#031C19] transition hover:bg-[#031C19] hover:text-white"
            >
              Get Started
            </Link>
            <p className="mt-6 text-sm font-semibold text-[#031C19]">What&apos;s Included</p>
            <FeatureList />
          </article>

          <article
            aria-disabled="true"
            className="relative flex w-[calc(100vw-56px)] max-w-95 shrink-0 snap-start flex-col rounded-2xl border border-[#DCDCE6] bg-white shadow-sm lg:w-auto lg:max-w-none"
          >
            <div className="pointer-events-none flex h-full select-none flex-col overflow-hidden rounded-[15px] p-6 blur-[3px]">
              <span className="absolute right-5 top-5 rounded-full bg-[#E8F4EB] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#08544B]">popular</span>
              <h3 className="text-xl font-semibold text-[#031C19]">Business</h3>
              <p className="mt-3 min-h-17 text-sm leading-5 text-[#616161]">
                Hire multiple tradies across your work sites with premium tools, priority matching and centralised billing all in one place.
              </p>
              <div className="mt-5 flex items-end gap-1 border-b border-black/8 pb-5">
                <p className="text-3xl font-semibold text-[#031C19]">$299</p>
                <span className="pb-1 text-xs text-[#616161]">/month + job costs</span>
              </div>
              <div className="mt-5 flex h-11 items-center justify-center rounded-full bg-[#0E8C7D] text-sm font-semibold text-white">
                Get Started
              </div>
              <p className="mt-6 text-sm font-semibold text-[#031C19]">What&apos;s Included</p>
              <FeatureList />
            </div>
            <p className="absolute -bottom-7 inset-x-0 text-center text-[10px] font-semibold text-[#0E8C7D]">
              This Feature Will Be Coming Soon
            </p>
          </article>
        </div>

        <div className="mt-1 text-center">
          <Link href="/pricing" className="inline-flex items-center gap-1 text-xs font-semibold text-[#0E8C7D] hover:underline sm:text-sm">
            Compare features across plans
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function FeatureList() {
  return (
    <ul className="mt-4 space-y-3">
      {includedFeatures.map((feature) => (
        <li key={feature} className="flex items-start gap-2 text-xs leading-5 text-[#031C19] sm:text-sm">
          <Check className="mt-0.5 size-4 shrink-0 text-[#08544B]" strokeWidth={2.4} />
          {feature}
        </li>
      ))}
    </ul>
  )
}
