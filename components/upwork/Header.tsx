"use client"

import { useEffect, useId, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, Menu, X } from "lucide-react"

const navItems = [
  {
    label: "Find Talent",
    items: [
      { title: "Post a Job", href: "/post-job", desc: "Get an AI quote and find tradies" },
      { title: "Browse Categories", href: "/categories", desc: "View all supported trades" },
      { title: "How to Hire", href: "/tips", desc: "Tips for hiring on Fixes" },
    ],
  },
  {
    label: "Find Work",
    items: [
      { title: "Join as a Tradie", href: "/i-want-to-work", desc: "Apply to get consistent work" },
      { title: "Trust & Safety", href: "/safety", desc: "How we protect our tradies" },
    ],
  },
  {
    label: "Why Fixes",
    items: [
      { title: "About Us", href: "/about-us", desc: "Our mission and team" },
      { title: "Blog", href: "/blog", desc: "Latest news and updates" },
      { title: "Community Impact", href: "/community-impact", desc: "How we help the community" },
      { title: "Investors", href: "/investors", desc: "Invest in Fixes" },
    ],
  },
] as const

interface HeaderProps {
  deferNavigationPrefetch?: boolean
}

export function Header({ deferNavigationPrefetch = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null)
  const mobileMenuId = useId()
  const navigationPrefetch = deferNavigationPrefetch ? false : undefined

  useEffect(() => {
    if (!mobileMenuOpen) setOpenMobileDropdown(null)
  }, [mobileMenuOpen])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false)
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [])

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white font-manrope">
      <div className="mx-auto flex h-19 max-w-335 items-center justify-between px-5 sm:px-8 lg:px-10">
        <div className="flex items-center gap-8 xl:gap-10">
          <button
            type="button"
            className="-ml-2 inline-flex size-10 items-center justify-center rounded-full text-[#031C19] transition hover:bg-black/5 lg:hidden"
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileMenuOpen}
            aria-controls={mobileMenuId}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

          <Link href="/" prefetch={navigationPrefetch} className="flex shrink-0 items-center" aria-label="Fixes home">
            <Image src="/logo.svg" alt="Fixes" width={92} height={32} className="h-7 w-auto sm:h-8" style={{ width: "auto" }} priority />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            {navItems.map((item) => (
              <div key={item.label} className="group relative">
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[14px] font-medium text-[#031C19] transition hover:bg-[#F5F5F5] focus-visible:bg-[#F5F5F5] focus-visible:outline-none"
                >
                  {item.label}
                  <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
                </button>
                <div className="invisible absolute left-0 top-full z-50 w-72 translate-y-1 rounded-2xl border border-black/8 bg-white p-2 opacity-0 shadow-[0_18px_50px_rgba(3,28,25,0.12)] transition group-hover:visible group-hover:translate-y-2 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-2 group-focus-within:opacity-100">
                  {item.items.map((subItem) => (
                    <Link
                      key={subItem.title}
                      href={subItem.href}
                      prefetch={navigationPrefetch}
                      className="block rounded-xl px-4 py-3 transition hover:bg-[#F4F9EF] focus-visible:bg-[#F4F9EF] focus-visible:outline-none"
                    >
                      <span className="block text-sm font-semibold text-[#031C19]">{subItem.title}</span>
                      <span className="mt-0.5 block text-xs text-[#616161]">{subItem.desc}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <Link
              href="/enterprise"
              prefetch={navigationPrefetch}
              className="rounded-full px-3 py-2 text-[14px] font-medium text-[#031C19] transition hover:bg-[#F5F5F5] focus-visible:bg-[#F5F5F5] focus-visible:outline-none"
            >
              Enterprise
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/i-want-to-work"
            prefetch={navigationPrefetch}
            className="hidden rounded-full px-3 py-2 text-[14px] font-medium text-[#031C19] transition hover:bg-[#F5F5F5] focus-visible:bg-[#F5F5F5] focus-visible:outline-none md:inline-flex"
          >
            Become a Fixer
          </Link>
          <Link
            href="/login"
            prefetch={navigationPrefetch}
            className="hidden rounded-full px-3 py-2 text-[14px] font-medium text-[#031C19] transition hover:bg-[#F5F5F5] focus-visible:bg-[#F5F5F5] focus-visible:outline-none sm:inline-flex"
          >
            Login
          </Link>
          <Link
            href="/register"
            prefetch={navigationPrefetch}
            className="inline-flex h-10 items-center rounded-full bg-[#08544B] px-5 text-[13px] font-semibold text-white transition hover:bg-[#063F39] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08544B] sm:px-6 sm:text-sm"
          >
            Sign Up
          </Link>
        </div>
      </div>

      {mobileMenuOpen && (
        <div id={mobileMenuId} className="border-t border-black/8 bg-white px-5 py-5 shadow-xl lg:hidden">
          <nav className="mx-auto flex max-w-2xl flex-col" aria-label="Mobile navigation">
            {navItems.map((item) => {
              const expanded = openMobileDropdown === item.label
              return (
                <div key={item.label} className="border-b border-black/8">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between py-4 text-left text-base font-semibold text-[#031C19]"
                    aria-expanded={expanded}
                    onClick={() => setOpenMobileDropdown(expanded ? null : item.label)}
                  >
                    {item.label}
                    <ChevronDown className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
                  </button>
                  {expanded && (
                    <div className="pb-3">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.title}
                          href={subItem.href}
                          prefetch={navigationPrefetch}
                          onClick={closeMobileMenu}
                          className="block rounded-xl px-3 py-2.5 text-sm text-[#616161] hover:bg-[#F5F5F5] hover:text-[#031C19]"
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            <Link href="/enterprise" prefetch={navigationPrefetch} onClick={closeMobileMenu} className="border-b border-black/8 py-4 text-base font-semibold text-[#031C19]">
              Enterprise
            </Link>
            <Link href="/i-want-to-work" prefetch={navigationPrefetch} onClick={closeMobileMenu} className="border-b border-black/8 py-4 text-base font-semibold text-[#031C19]">
              Become a Fixer
            </Link>
            <Link href="/login" prefetch={navigationPrefetch} onClick={closeMobileMenu} className="py-4 text-base font-semibold text-[#031C19] sm:hidden">
              Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
