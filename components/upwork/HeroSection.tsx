"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, ChevronRight, MapPin, Search, Star, UsersRound } from "lucide-react"
import { createFragmentHref } from "@/lib/fragmentState"

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

type WindowWithIdleCallback = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
  cancelIdleCallback?: (handle: number) => void
}

const slowConnectionTypes = new Set(["slow-2g", "2g", "3g"])
const videoIdleTimeoutMs = 2_000
const videoFallbackDelayMs = 1_500

export function HeroSection() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)

  useEffect(() => {
    const mobileViewport = window.matchMedia("(max-width: 1023px)")
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const connection = (navigator as NavigatorWithConnection).connection
    const idleWindow = window as WindowWithIdleCallback
    let idleCallbackHandle: number | null = null
    let fallbackTimeoutHandle: number | null = null
    let videoRequested = false

    const canLoadVideo = () => {
      const hasConstrainedConnection = Boolean(
        connection?.saveData ||
        (connection?.effectiveType && slowConnectionTypes.has(connection.effectiveType)),
      )

      return !mobileViewport.matches && !reducedMotion.matches && !hasConstrainedConnection
    }

    const removeInteractionListeners = () => {
      window.removeEventListener("pointerdown", requestVideo)
      window.removeEventListener("keydown", requestVideo)
      window.removeEventListener("wheel", requestVideo)
    }

    const clearScheduledLoad = () => {
      window.removeEventListener("load", scheduleIdleLoad)
      removeInteractionListeners()

      if (idleCallbackHandle !== null) {
        idleWindow.cancelIdleCallback?.(idleCallbackHandle)
        idleCallbackHandle = null
      }

      if (fallbackTimeoutHandle !== null) {
        window.clearTimeout(fallbackTimeoutHandle)
        fallbackTimeoutHandle = null
      }
    }

    function requestVideo() {
      if (videoRequested || !canLoadVideo()) return

      videoRequested = true
      clearScheduledLoad()
      setShouldLoadVideo(true)
    }

    function scheduleIdleLoad() {
      if (videoRequested || !canLoadVideo()) return

      if (idleWindow.requestIdleCallback) {
        idleCallbackHandle = idleWindow.requestIdleCallback(requestVideo, {
          timeout: videoIdleTimeoutMs,
        })
      } else {
        fallbackTimeoutHandle = window.setTimeout(requestVideo, videoFallbackDelayMs)
      }
    }

    const scheduleEligibleVideo = () => {
      if (!canLoadVideo()) {
        videoRequested = false
        clearScheduledLoad()
        setShouldLoadVideo(false)
        return
      }

      if (videoRequested) return

      window.addEventListener("pointerdown", requestVideo, { once: true, passive: true })
      window.addEventListener("keydown", requestVideo, { once: true })
      window.addEventListener("wheel", requestVideo, { once: true, passive: true })

      if (document.readyState === "complete") {
        scheduleIdleLoad()
      } else {
        window.addEventListener("load", scheduleIdleLoad, { once: true })
      }
    }

    const updateMediaPreference = () => {
      clearScheduledLoad()
      scheduleEligibleVideo()
    }

    scheduleEligibleVideo()
    mobileViewport.addEventListener("change", updateMediaPreference)
    reducedMotion.addEventListener("change", updateMediaPreference)
    connection?.addEventListener("change", updateMediaPreference)

    return () => {
      clearScheduledLoad()
      mobileViewport.removeEventListener("change", updateMediaPreference)
      reducedMotion.removeEventListener("change", updateMediaPreference)
      connection?.removeEventListener("change", updateMediaPreference)
    }
  }, [])

  const handleSearch = () => {
    const query = searchQuery.trim()
    router.push(createFragmentHref("/post-job", { q: query }))
  }

  return (
    <section className="bg-white pb-15 font-manrope lg:pb-20">
      <div className="mx-auto max-w-320 px-5 pt-4 sm:px-8 lg:px-0">
        <div className="flex min-h-18 items-center justify-between gap-4 rounded-2xl bg-linear-to-r from-[#EFF7B8] to-[#B6E4DF] px-5 py-4 sm:px-7">
          <p className="max-w-4xl text-[13px] font-medium leading-5 text-[#031C19] sm:text-sm">
            Stop doing everything. Hire the top 1% of talent on Business Plus.
          </p>
          <Link
            href={createFragmentHref("/register", { plan: "business" })}
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

              <div className="lg:mt-10 lg:h-[240.97px] lg:w-[604px] lg:rounded-[20px] lg:bg-black/30 lg:px-[34px] lg:py-5 lg:backdrop-blur-[15px]">
              <div className="mt-7 flex h-11 w-full max-w-155 items-center rounded-full border border-white/30 bg-black/45 p-1 backdrop-blur-sm sm:w-128 lg:mt-0 lg:h-12 lg:w-full lg:max-w-none lg:border-0 lg:bg-white/20 lg:p-0 lg:backdrop-blur-none">
                <button
                  type="button"
                  className="flex h-full flex-1 items-center justify-center rounded-full border border-white bg-white/12 text-xs font-medium text-white sm:text-sm lg:border-2 lg:text-[14.1px] lg:tracking-[0.48px]"
                >
                  I want to hire
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/i-want-to-work")}
                  className="flex h-full flex-1 items-center justify-center rounded-full text-xs font-medium text-white transition hover:bg-white/10 sm:text-sm lg:text-[14.1px] lg:tracking-[0.48px]"
                >
                  I want to work
                </button>
              </div>

              <div className="relative mt-4 w-full max-w-155 sm:w-128 lg:mt-[33px] lg:w-full lg:max-w-none">
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
                  className="h-12 w-full rounded-full border-0 bg-white py-3 pl-5 pr-14 text-xs text-[#031C19] shadow-lg outline-none placeholder:text-[#616161] focus:ring-2 focus:ring-[#AFFF43] sm:text-sm lg:h-[52px] lg:border-2 lg:border-[#181818] lg:py-1.5 lg:pr-[60px] lg:text-[14.1px]"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  aria-label="Search for a tradie"
                  className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#031C19] text-[#AFFF43] transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:size-10"
                >
                  <Search className="size-4 lg:size-6" />
                </button>
              </div>

              <div className="mt-4 flex max-w-161 gap-2 overflow-x-auto pb-1 no-scrollbar lg:mt-[33px] lg:max-w-none lg:gap-[15.48px] lg:overflow-visible lg:pb-0">
                {categoryTags.map((tag) => (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => router.push(createFragmentHref("/post-job", { category: tag.value }))}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/45 bg-black/25 px-3 py-2 text-[10px] font-medium text-white transition hover:bg-white/12 sm:text-xs lg:gap-[1.84px] lg:border-white lg:bg-white/10 lg:px-[18.4px] lg:py-[9.2px] lg:text-[13px] lg:leading-[14px]"
                  >
                    {tag.label}
                    <ArrowRight className="size-3 lg:size-[16.56px]" />
                  </button>
                ))}
              </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-medium text-white sm:text-xs lg:mt-10 lg:gap-x-6 lg:text-sm lg:font-normal lg:tracking-[0.25px]">
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
