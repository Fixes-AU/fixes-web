import Image from "next/image"
import { Hammer } from "lucide-react"

const testimonial = {
  category: "Building & Construction",
  quote:
    "I needed an emergency plumber and didn't want to get ripped off. The AI quoting tool gave me an instant, fair price, and the tradie was at my door in 30 minutes. Paying securely through escrow gave me total peace of mind.",
  name: "Tina Johansson",
  title: "Client, USA",
}

export function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-white py-15 font-manrope lg:py-[26.485px]">
      <div
        className="pointer-events-none absolute inset-y-0 left-1/2 w-[111.25%] -translate-x-1/2"
        aria-hidden="true"
      >
        <Image
          src="/home-page-assets/redesign/testimonial-swoosh.svg"
          alt=""
          width={1602}
          height={1026}
          sizes="111.25vw"
          className="absolute inset-0 size-full object-cover lg:object-fill"
        />
      </div>

      <div className="relative mx-auto max-w-320 px-5 sm:px-8 lg:px-0">
        <h2 className="text-[32px] font-semibold leading-11 tracking-[-0.04em] text-black lg:text-[40px] lg:leading-[55px]">
          Proven Results On Fixes
        </h2>

        <div className="mt-7.5 grid gap-x-4 gap-y-7.5 md:grid-cols-2 lg:mt-15 lg:grid-cols-3 lg:gap-x-[16.82px] lg:gap-y-15">
          {Array.from({ length: 6 }).map((_, index) => (
            <article
              key={index}
              className={`${index > 3 ? "hidden md:flex" : "flex"} h-[336.25px] flex-col justify-center rounded-[14.17px] border border-[#E6E6E6] bg-white px-[31.88px] py-[21.25px] lg:h-[399.02px] lg:rounded-[16.82px] lg:px-[37.84px] lg:py-[25.23px]`}
            >
              <div className="flex items-center gap-[7.09px] text-[14.17px] font-medium leading-[21px] text-black lg:gap-[8.41px] lg:text-[16.82px] lg:leading-[25px]">
                <Hammer className="size-[24.09px] shrink-0 text-[#0E8B7D] stroke-[1.5] lg:size-[28.59px] lg:stroke-[1.8]" />
                {testimonial.category}
              </div>

              <blockquote className="mt-[14.17px] pb-[8.5px] text-[14.17px] leading-6 text-[#031C19] lg:mt-[16.82px] lg:pb-[10.09px] lg:text-[16.82px] lg:leading-[29px]">
                “{testimonial.quote}”
              </blockquote>

              <div
                className="h-[13.42px] text-[13.42px] leading-none tracking-[3.15px] text-[#DEAF03] lg:h-[15.92px] lg:text-[15.92px] lg:tracking-[3.75px]"
                aria-label="Three out of five star rating"
              >
                ★★★☆☆
              </div>

              <div className="mt-[12.75px] flex flex-1 items-start border-t border-[rgba(9,34,16,0.1)] pt-[13.46px] lg:mt-[15.14px] lg:pt-[15.98px]">
                <Image
                  src="/home-page-assets/redesign/testimonial-avatar.jpg"
                  alt="Tina Johansson"
                  width={59}
                  height={59}
                  className="size-[49.6px] shrink-0 rounded-full object-cover lg:size-[58.87px]"
                />
                <div className="pl-[9.92px] lg:pl-[11.77px]">
                  <p className="text-[17px] font-normal leading-[26px] text-[#031C19] lg:text-[20.18px] lg:leading-[30px]">
                    {testimonial.name}
                  </p>
                  <p className="text-[10px] font-medium uppercase leading-5 text-[#666] lg:text-[11.77px] lg:leading-6">
                    {testimonial.title}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
