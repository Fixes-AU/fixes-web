"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, ChevronRight, MapPin, Search, Star, UsersRound } from "lucide-react"

const categoryTags = [
  { label: "Electrician", value: "electrical" },
  { label: "Plumber", value: "plumbing" },
  { label: "Carpenter", value: "carpentry" },
  { label: "HVAC Technician", value: "hvac" },
]

const trustMetrics = [
  { icon: UsersRound, label: "1M+ customers" },
  { icon: MapPin, label: "2.5M+ tasks done" },
  { icon: Star, label: "4M+ user reviews" },
]

type NetworkInformation = EventTarget & {
  effectiveType?: string
  saveData?: boolean
}

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformation
}

const slowConnectionTypes = new Set(["slow-2g", "2g", "3g"])

export function HeroSection() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)

  useEffect(() => {
    const mobileViewport = window.matchMedia("(max-width: 1023px)")
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const connection = (navigator as NavigatorWithConnection).connection

    const updateMediaPreference = () => {
      const hasConstrainedConnection = Boolean(
        connection?.saveData ||
        (connection?.effectiveType && slowConnectionTypes.has(connection.effectiveType)),
      )

      setShouldLoadVideo(
        !mobileViewport.matches && !reducedMotion.matches && !hasConstrainedConnection,
      )
    }

    updateMediaPreference()
    mobileViewport.addEventListener("change", updateMediaPreference)
    reducedMotion.addEventListener("change", updateMediaPreference)
    connection?.addEventListener("change", updateMediaPreference)

    return () => {
      mobileViewport.removeEventListener("change", updateMediaPreference)
      reducedMotion.removeEventListener("change", updateMediaPreference)
      connection?.removeEventListener("change", updateMediaPreference)
    }
  }, [])

  const handleSearch = () => {
    const query = searchQuery.trim()
    router.push(query ? `/post-job?q=${encodeURIComponent(query)}` : "/post-job")
  }

  return (
    <section className="bg-white pb-15 font-manrope lg:pb-20">
      <div className="mx-auto max-w-320 px-5 pt-4 sm:px-8 lg:px-0">
        <div className="flex min-h-18 items-center justify-between gap-4 rounded-2xl bg-linear-to-r from-[#EFF7B8] to-[#B6E4DF] px-5 py-4 sm:px-7">
          <p className="max-w-4xl text-[13px] font-medium leading-5 text-[#031C19] sm:text-sm">
            Stop doing everything. Hire the top 1% of talent on Business Plus.
          </p>
          <Link
            href="/register?plan=business"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#031C19] hover:underline sm:text-sm"
          >
            Get started
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-320 lg:px-0">
        <div className="relative h-174 overflow-hidden bg-[#031C19] sm:mx-8 sm:rounded-3xl lg:mx-0 lg:h-auto lg:min-h-168.75">
          <Image
            src="/home-page-assets/fixes-hero-poster.webp"
            alt=""
            fill
            priority
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="absolute inset-0 size-full object-cover object-[58%_center] lg:object-center"
            aria-hidden="true"
          />
          {shouldLoadVideo && (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 size-full object-cover object-center"
              aria-hidden="true"
            >
              <source src="/home-page-assets/fixes-hero.mp4" type="video/mp4" />
            </video>
          )}
          <div className="absolute inset-0 bg-linear-to-r from-black/78 via-black/48 to-black/10 lg:from-black/72 lg:via-black/35" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/60 to-transparent lg:hidden" />

          <div className="relative z-10 flex h-full min-h-174 flex-col justify-end px-5 pb-8 pt-20 sm:px-10 lg:min-h-168.75 lg:justify-center lg:px-18 lg:py-14">
            <div className="max-w-161">
              <h1 className="max-w-150 text-[40px] font-semibold leading-13 tracking-[-0.02em] text-white lg:text-[64px] lg:leading-20">
                Hire The Right Experts For Every Need.
              </h1>
              <p className="mt-4 max-w-151 text-xs font-medium leading-4 tracking-[-0.02em] text-white/92 sm:text-sm sm:leading-5 lg:text-lg lg:leading-6">
                From repairs and maintenance to renovations and cleaning, connect with verified local professionals, compare quotes, and hire with confidence.
              </p>

              <div className="mt-7 flex h-11 w-full max-w-155 items-center rounded-full border border-white/30 bg-black/45 p-1 backdrop-blur-sm sm:w-128">
                <button
                  type="button"
                  className="flex h-full flex-1 items-center justify-center rounded-full border border-white bg-white/12 text-xs font-medium text-white sm:text-sm"
                >
                  I want to hire
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/i-want-to-work")}
                  className="flex h-full flex-1 items-center justify-center rounded-full text-xs font-medium text-white transition hover:bg-white/10 sm:text-sm"
                >
                  I want to work
                </button>
              </div>

              <div className="relative mt-4 w-full max-w-155 sm:w-128">
                <label htmlFor="home-hero-search" className="sr-only">Describe what you need to hire for</label>
                <input
                  id="home-hero-search"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleSearch()
                  }}
                  placeholder="Describe what you need to hire for…"
                  className="h-12 w-full rounded-full border-0 bg-white py-3 pl-5 pr-14 text-xs text-[#031C19] shadow-lg outline-none placeholder:text-[#616161] focus:ring-2 focus:ring-[#AFFF43] sm:text-sm"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  aria-label="Search for a tradie"
                  className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#031C19] text-[#AFFF43] transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <Search className="size-4" />
                </button>
              </div>

              <div className="mt-4 flex max-w-161 gap-2 overflow-x-auto pb-1 no-scrollbar">
                {categoryTags.map((tag) => (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => router.push(`/post-job?category=${tag.value}`)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/45 bg-black/25 px-3 py-2 text-[10px] font-medium text-white transition hover:bg-white/12 sm:text-xs"
                  >
                    {tag.label}
                    <ArrowRight className="size-3" />
                  </button>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-medium text-white sm:text-xs">
                {trustMetrics.map(({ icon: Icon, label }) => (
                  <span key={label} className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    <Icon className="size-3.5" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
