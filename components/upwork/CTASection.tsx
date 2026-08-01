"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createFragmentHref } from "@/lib/fragmentState"

export function CTASection() {
  const router = useRouter()
  const [description, setDescription] = useState("")

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = description.trim()
    router.push(createFragmentHref("/post-job", { q: query }))
  }

  return (
    <section className="bg-[#050D00] font-manrope lg:bg-white lg:py-20">
      <div className="mx-auto max-w-320">
        <div className="relative h-[813px] overflow-hidden bg-[#050D00] lg:h-[552px] lg:rounded-[24px]">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-2 h-[395px] w-[calc(100%-24px)] -translate-x-1/2 object-contain lg:left-auto lg:right-0 lg:top-1/2 lg:h-[520px] lg:w-[640px] lg:-translate-y-1/2 lg:translate-x-0"
          >
            <source src="/home-page-assets/redesign/ai-quote-animation.mp4" type="video/mp4" />
          </video>

          <div
            className="pointer-events-none absolute bottom-[5px] left-[5px] h-[421px] w-[calc(100%-10px)] rounded-[13px] border border-[#C3C3C3]/30 opacity-10 blur-[0.2px] lg:inset-y-[8px] lg:left-[8px] lg:h-auto lg:w-[632px] lg:rounded-[24px]"
            style={{
              backgroundImage: "url('/home-page-assets/redesign/ai-quote-mark.png')",
              backgroundPosition: "top left",
              backgroundRepeat: "repeat",
              backgroundSize: "122px 110px",
            }}
            aria-hidden="true"
          />

          <div className="absolute left-5 top-[427px] w-[calc(100%-40px)] lg:left-[57px] lg:top-[91px] lg:w-[512px]">
            <h2 className="text-[32px] font-semibold leading-[44px] tracking-[-0.04em] text-white lg:text-[43px] lg:leading-[50px]">
              Get an Instant Quote,<br />Powered by AI
            </h2>
            <p className="mt-[30px] max-w-[350px] text-sm font-medium leading-6 text-white lg:mt-6 lg:max-w-[464px]">
              Describe your project, upload a few photos, and let our AI estimate a fair price before you connect with trusted local professionals.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="absolute left-5 top-[647px] h-[121px] w-[calc(100%-40px)] overflow-hidden rounded-[20px] border border-[#8D8C8C] bg-white lg:left-[57px] lg:top-[320px] lg:h-[122px] lg:w-[534px]"
          >
            <label htmlFor="home-ai-quote" className="sr-only">Describe your project</label>
            <textarea
              id="home-ai-quote"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={'Describe your project... (e.g., "I need a plumber to fix a leaking kitchen sink.")'}
              className="h-full w-full resize-none border-0 bg-transparent px-4 pb-14 pt-4 text-[13px] leading-[18px] text-[#031C19] outline-none placeholder:text-[#5A5A5A] focus:ring-2 focus:ring-inset focus:ring-[#AFFF43]"
            />
            <button
              type="submit"
              className="absolute bottom-[7px] right-[11px] flex h-[36px] w-[140px] items-center rounded-full bg-[#181818] pl-2 pr-[30px] text-[12.85px] font-medium leading-[18px] text-white transition hover:bg-[#08544B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#AFFF43] lg:bottom-[11px] lg:h-[40px] lg:w-[159px] lg:pl-3 lg:pr-[36px] lg:text-[14.6px] lg:leading-5"
            >
              <span className="whitespace-nowrap">Get My AI Quote</span>
              <span className="absolute right-0.5 flex size-[29px] shrink-0 items-center justify-center lg:right-1 lg:size-[33px]" aria-hidden="true">
                <span className="absolute inset-0 rounded-full bg-[#AFFF43]/70 blur-[11px] lg:blur-[12.5px]" />
                <Image
                  src="/home-page-assets/redesign/ai-quote-mark.png"
                  alt=""
                  width={611}
                  height={548}
                  className="relative z-10 h-[17px] w-[19px] object-contain lg:h-[19px] lg:w-[21px]"
                />
              </span>
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
