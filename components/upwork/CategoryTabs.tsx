import Link from "next/link"
import {
  Anvil,
  Car,
  Droplets,
  Flame,
  Hammer,
  House,
  Paintbrush,
  TreeDeciduous,
  Wrench,
  Zap,
} from "lucide-react"

const categories = [
  { slug: "carpenter", label: "Building & Construction", icon: Hammer },
  { slug: "electrician", label: "Electrical", icon: Zap },
  { slug: "plumber", label: "Plumbing & Gas", icon: Droplets },
  { slug: "hvac", label: "Mechanical & Fitting", icon: Wrench },
  { slug: "other", label: "Automative", icon: Car },
  { slug: "hvac", label: "HVAC & Refrigeration", icon: Flame },
  { slug: "labourer", label: "Landscaping & Civil", icon: TreeDeciduous },
  { slug: "plasterer", label: "Finishing Trades", icon: House },
  { slug: "other", label: "Metal & Welding", icon: Anvil },
  { slug: "painter", label: "Painting & Decorating", icon: Paintbrush },
] as const

export function CategoryTabs() {
  return (
    <section className="bg-white py-15 font-manrope lg:py-20">
      <div className="mx-auto max-w-320 px-5 sm:px-8 lg:px-0">
        <h2 className="max-w-200 text-[32px] font-semibold leading-11 tracking-[-0.04em] text-black lg:text-[40px] lg:leading-13.75">
          Find The Right Service For Every Home Project
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:mt-12 lg:grid-cols-5 lg:gap-5">
          {categories.map(({ slug, label, icon: Icon }, index) => (
            <Link
              key={`${slug}-${label}`}
              href={`/categories/${slug}`}
              className={`group flex min-h-36 flex-col items-start justify-between rounded-2xl border bg-white p-4 shadow-[0_5px_20px_rgba(3,28,25,0.06)] transition hover:-translate-y-1 hover:border-[#72CF10] hover:shadow-[0_12px_30px_rgba(3,28,25,0.10)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08544B] sm:min-h-40 sm:p-5 lg:min-h-44 ${
                index === 0 ? "border-[#72CF10]" : "border-black/5"
              }`}
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-[#F4F7F5] text-[#0E8C7D] transition group-hover:bg-[#E9F5EF]">
                <Icon className="size-5" strokeWidth={1.8} />
              </span>
              <span className="mt-5 max-w-36 text-[13px] font-medium leading-5 text-[#031C19] sm:text-sm">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
