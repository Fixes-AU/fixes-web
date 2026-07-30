import Image from "next/image"
import { Hammer, Star } from "lucide-react"

const testimonial = {
  category: "Building & Construction",
  quote: "I needed an emergency plumber and didn't want to get ripped off. The AI quoting tool gave me an instant, fair price, and the tradie was at my door in 30 minutes. Paying securely through escrow gave me total peace of mind.",
  name: "Tina Johansson",
  title: "Client, USA",
}

export function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-white py-15 font-manrope lg:py-20">
      <div className="pointer-events-none absolute -right-[18%] top-10 h-96 w-[70%] rotate-[-8deg] rounded-[50%] bg-[#08544B]/[0.78]" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-[22%] bottom-0 h-96 w-[65%] rotate-[-9deg] rounded-[50%] bg-[#08544B]/[0.78]" aria-hidden="true" />

      <div className="relative mx-auto max-w-320 px-5 sm:px-8 lg:px-0">
        <h2 className="text-[32px] font-semibold leading-11 tracking-[-0.04em] text-black lg:text-[40px] lg:leading-13.75">
          Proven Results On Fixes
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <article
              key={index}
              className={`${index > 3 ? "hidden md:flex" : "flex"} min-h-84 flex-col rounded-2xl border border-black/6 bg-white p-6 shadow-[0_8px_24px_rgba(3,28,25,0.05)]`}
            >
              <div className="flex items-center gap-2 text-[11px] font-semibold text-[#08544B]">
                <Hammer className="size-4" />
                {testimonial.category}
              </div>
              <blockquote className="mt-5 flex-1 text-sm leading-6 text-[#031C19]">
                “{testimonial.quote}”
              </blockquote>
              <div className="mt-4 flex gap-0.5" aria-label="Five star rating">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star key={starIndex} className="size-3.5 fill-[#FFC800] text-[#FFC800]" />
                ))}
              </div>
              <div className="mt-5 flex items-center gap-3">
                <Image
                  src="/home-page-assets/redesign/testimonial-avatar.jpg"
                  alt="Tina Johansson"
                  width={48}
                  height={48}
                  className="size-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-[#031C19]">{testimonial.name}</p>
                  <p className="mt-0.5 text-xs text-[#616161]">{testimonial.title}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
