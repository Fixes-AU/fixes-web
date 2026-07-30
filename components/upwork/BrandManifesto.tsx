import Image from "next/image"
import Link from "next/link"
import { Check, ChevronRight } from "lucide-react"

const purposePoints = [
  "Across Australia and soon beyond",
  "Fixes AU Trusted Experts. Quality Work. Every Time.",
]

export function BrandManifesto() {
  return (
    <section className="bg-[#F6F6F6] py-15 font-manrope lg:py-20">
      <div className="mx-auto grid max-w-320 items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-0 lg:px-0">
        <div className="order-2 overflow-hidden rounded-[24px] lg:order-1 lg:h-154.25 lg:rounded-[29px]">
          <Image
            src="/home-page-assets/redesign/purpose-tradie-customer.png"
            alt="A Fixes professional greeting a homeowner"
            width={1275}
            height={1234}
            sizes="(max-width: 1023px) calc(100vw - 40px), 640px"
            className="aspect-square size-full object-cover"
          />
        </div>

        <div className="order-1 lg:order-2 lg:px-17">
          <p className="text-xs font-medium uppercase tracking-[0.02em] text-[#08544B]">Our Purpose</p>
          <h2 className="mt-4 text-[32px] font-semibold leading-11 tracking-[-0.04em] text-[#031C19] lg:text-[40px] lg:leading-13.75">
            We&apos;re Redefining How Australia Gets Things Fixed.
          </h2>
          <p className="mt-5 text-sm leading-6 text-[#616161] lg:text-base lg:leading-7">
            Whether it&apos;s a leaking tap, a fresh coat of paint, or a complete home renovation, finding the right professional shouldn&apos;t be complicated. That&apos;s why Fixes AU connects homeowners with trusted local experts through a faster, simpler, and more reliable experience.
          </p>
          <p className="mt-4 text-sm leading-6 text-[#616161] lg:text-base lg:leading-7">
            Every job posted creates an opportunity. Every successful match helps a homeowner move forward and a professional grow their business. We&apos;re building a marketplace where quality work, trust, and transparency come first.
          </p>

          <ul className="mt-6 space-y-3">
            {purposePoints.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm font-medium text-[#031C19]">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#08544B] text-white">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>

          <Link
            href="/about-us"
            className="mt-7 inline-flex h-11 items-center gap-1 rounded-full bg-[#08544B] px-6 text-sm font-semibold text-white transition hover:bg-[#063F39] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08544B]"
          >
            Learn More
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
