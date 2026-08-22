import Image from "next/image"
import {
  Sparkles,
  TreeDeciduous,
  Zap,
  type LucideIcon,
} from "lucide-react"

type Testimonial = {
  id: string
  category: string
  quote: string
  name: string
  title: string
  rating: 4 | 5
  imageSrc: string
  imageAlt: string
  icon: LucideIcon
  showOnMobile: boolean
}

const testimonials: Testimonial[] = [
  {
    id: "jaden-smith",
    category: "Electrical",
    quote:
      "Had a downlight stop working and needed it replaced. Put the job through Fixes and it was honestly so easy. Got a price straight away and the electrician came out, replaced it and had everything working again pretty quickly.",
    name: "Jaden Smith",
    title: "Client, Australia",
    rating: 4,
    imageSrc:
      "/home-page-assets/redesign/testimonials/client-jaden-smith.webp",
    imageAlt: "AI-generated portrait for Jaden Smith's client review",
    icon: Zap,
    showOnMobile: true,
  },
  {
    id: "sayed-munir",
    category: "Cleaning",
    quote:
      "Honestly, really happy with the service. Needed my windows cleaned and gave Fixes a try. Was surprised at how easy it was to book and the price was really reasonable. The guy who came out was friendly, on time and did a great job.\n\nWindows look so much better now. Definitely will use Fixes again.",
    name: "Sayed Munir",
    title: "Client, Australia",
    rating: 5,
    imageSrc:
      "/home-page-assets/redesign/testimonials/client-sayed-munir.webp",
    imageAlt: "AI-generated portrait for Sayed Munir's client review",
    icon: Sparkles,
    showOnMobile: false,
  },
  {
    id: "lucy-parker",
    category: "Landscaping & Civil",
    quote:
      "I needed to get my grass cut and decided to try the Fixes app. It was super easy to use — I got an instant, fair price and a tradie was able to come out and do the job perfectly.\n\nThe whole process was quick, simple and completely stress-free. No chasing quotes or waiting around. I’ll definitely be using Fixes again and highly recommend it!",
    name: "Lucy Parker",
    title: "Client, Australia",
    rating: 5,
    imageSrc:
      "/home-page-assets/redesign/testimonials/client-lucy-parker.webp",
    imageAlt: "AI-generated portrait for Lucy Parker's client review",
    icon: TreeDeciduous,
    showOnMobile: true,
  },
  {
    id: "jack-williams",
    category: "Electrical",
    quote:
      "Fixes has made it much easier to keep my week full without spending hours chasing leads. The job details are clear before I accept anything, the customers know what to expect, and payment is straightforward. I can spend more time on the tools and less time doing admin.",
    name: "Jack Williams",
    title: "Electrician, Brisbane QLD",
    rating: 4,
    imageSrc:
      "/home-page-assets/redesign/testimonials/tradie-jack-williams.webp",
    imageAlt: "AI-generated portrait for Jack Williams' tradie review",
    icon: Zap,
    showOnMobile: true,
  },
  {
    id: "matilda-harris",
    category: "Cleaning",
    quote:
      "I’ve picked up some really good local jobs through Fixes. I can check the work, the location and the price before I accept, which makes planning my days a lot easier. Everything is in one place and I’m not going back and forth trying to organise the basics.",
    name: "Matilda Harris",
    title: "Window Cleaner, Sydney NSW",
    rating: 5,
    imageSrc:
      "/home-page-assets/redesign/testimonials/tradie-matilda-harris.webp",
    imageAlt: "AI-generated portrait for Matilda Harris' tradie review",
    icon: Sparkles,
    showOnMobile: true,
  },
  {
    id: "noah-thompson",
    category: "Landscaping & Civil",
    quote:
      "I was a bit unsure about using an app for work at first, but Fixes has been simple. The jobs match the type of work I do, customers are ready to go, and I know the scope before I arrive. It’s helped me fill quiet spots in the week without the usual hassle.",
    name: "Noah Thompson",
    title: "Lawn Care Tradie, Melbourne VIC",
    rating: 4,
    imageSrc:
      "/home-page-assets/redesign/testimonials/tradie-noah-thompson.webp",
    imageAlt: "AI-generated portrait for Noah Thompson's tradie review",
    icon: TreeDeciduous,
    showOnMobile: false,
  },
]

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

        <div className="mt-7.5 grid items-stretch gap-x-4 gap-y-7.5 md:grid-cols-2 lg:mt-15 lg:grid-cols-3 lg:gap-x-[16.82px] lg:gap-y-15">
          {testimonials.map((testimonial) => {
            const Icon = testimonial.icon

            return (
              <article
                key={testimonial.id}
                className={`${testimonial.showOnMobile ? "flex" : "hidden md:flex"} h-full min-h-[336.25px] flex-col rounded-[14.17px] border border-[#E6E6E6] bg-white px-[31.88px] py-[21.25px] lg:min-h-[399.02px] lg:rounded-[16.82px] lg:px-[37.84px] lg:py-[25.23px]`}
              >
                <div className="flex items-center gap-[7.09px] text-[14.17px] font-medium leading-[21px] text-black lg:gap-[8.41px] lg:text-[16.82px] lg:leading-[25px]">
                  <Icon className="size-[24.09px] shrink-0 text-[#0E8B7D] stroke-[1.5] lg:size-[28.59px] lg:stroke-[1.8]" />
                  {testimonial.category}
                </div>

                <blockquote className="mt-[14.17px] whitespace-pre-line pb-[8.5px] text-[14.17px] leading-6 text-[#031C19] lg:mt-[16.82px] lg:pb-[10.09px] lg:text-[16.82px] lg:leading-[29px]">
                  “{testimonial.quote}”
                </blockquote>

                <div
                  className="h-[13.42px] text-[13.42px] leading-none tracking-[3.15px] text-[#DEAF03] lg:h-[15.92px] lg:text-[15.92px] lg:tracking-[3.75px]"
                  aria-label={`${testimonial.rating} out of five star rating`}
                >
                  {Array.from({ length: 5 }, (_, index) => (
                    <span key={index} aria-hidden="true">
                      {index < testimonial.rating ? "★" : "☆"}
                    </span>
                  ))}
                </div>

                <div className="mt-[12.75px] flex flex-1 items-end border-t border-[rgba(9,34,16,0.1)] pt-[13.46px] lg:mt-[15.14px] lg:pt-[15.98px]">
                  <Image
                    src={testimonial.imageSrc}
                    alt={testimonial.imageAlt}
                    width={59}
                    height={59}
                    sizes="(max-width: 1023px) 50px, 59px"
                    className="size-[49.6px] shrink-0 rounded-full object-cover lg:size-[58.87px]"
                  />
                  <div className="min-w-0 pl-[9.92px] lg:pl-[11.77px]">
                    <p className="text-[17px] font-normal leading-[26px] text-[#031C19] lg:text-[20.18px] lg:leading-[30px]">
                      {testimonial.name}
                    </p>
                    <p className="text-[10px] font-medium uppercase leading-5 text-[#666] lg:text-[11.77px] lg:leading-6">
                      {testimonial.title}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
