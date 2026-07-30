"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ChevronDown, Facebook, Instagram, Linkedin, Star, Twitter, Youtube } from "lucide-react"
import { FixerQRLogo, FixesQRLogo } from "./QRWordmarks"

type FooterLink = { label: string; href: string | null }

function RedditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M7.2 10.2A7.6 5.1 0 0 1 12 8.7a7.6 5.1 0 0 1 4.8 1.5" />
      <path d="M18.4 11.2a2 2 0 1 1 .4 3.9C18 17.8 15.4 19.6 12 19.6s-6-1.8-6.8-4.5a2 2 0 1 1 .4-3.9" />
      <circle cx="9.2" cy="14.1" r=".8" fill="currentColor" stroke="none" />
      <circle cx="14.8" cy="14.1" r=".8" fill="currentColor" stroke="none" />
      <path d="M9.4 16.5c1.5.9 3.7.9 5.2 0M12.7 8.8l1-4.4 3.6.8" />
      <circle cx="18.3" cy="5.4" r="1.2" />
    </svg>
  )
}

const footerLinks: Record<string, FooterLink[]> = {
  "For Clients / Homeowners": [
    { label: "Articles", href: "/articles" },
    { label: "FAQs", href: "/faqs" },
    { label: "Licensing", href: "/licensing" },
    { label: "Council Regulations", href: "/council-regulations" },
    { label: "Trust & Quality", href: "/trust-and-quality" },
    { label: "Job Poster T&Cs", href: "/job-poster-tcs" },
    { label: "Direct Contracts", href: "/direct-contracts" },
    { label: "Contract-to-hire", href: null },
    { label: "Hire worldwide", href: null },
    { label: "Hire in the USA", href: null },
  ],
  "For Tradies": [
    { label: "Register With Fixer", href: "/i-want-to-work" },
    { label: "How to Find Work", href: "/how-to-find-work" },
    { label: "Direct Contracts", href: "/direct-contracts" },
    { label: "How Fixes Works", href: "/how-fixes-works" },
    { label: "FAQs", href: "/faqs-tradie" },
    { label: "Member Login", href: "/app/fixer" },
  ],
  Resources: [
    { label: "Help & support", href: "/support" },
    { label: "Fixes reviews", href: "/reviews" },
    { label: "Resources", href: "/resources" },
    { label: "Blog", href: "/blog" },
    { label: "Community", href: "/community" },
  ],
  Company: [
    { label: "About us", href: "/about-us" },
    { label: "Leadership", href: "/about-us#team" },
    { label: "Investor relations", href: "/investors" },
    { label: "Careers", href: "/careers" },
    { label: "Our impact", href: "/community-impact" },
    { label: "Press", href: "/press" },
    { label: "Contact us", href: "/contact-us" },
    { label: "Trust, safety & security", href: "/safety" },
  ],
}

const socialLinks = [
  { label: "Facebook", icon: Facebook, href: process.env.NEXT_PUBLIC_FACEBOOK_URL || null },
  { label: "LinkedIn", icon: Linkedin, href: process.env.NEXT_PUBLIC_LINKEDIN_URL || null },
  { label: "X", icon: Twitter, href: process.env.NEXT_PUBLIC_TWITTER_URL || null },
  { label: "YouTube", icon: Youtube, href: process.env.NEXT_PUBLIC_YOUTUBE_URL || null },
  { label: "Instagram", icon: Instagram, href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || null },
  { label: "Reddit", icon: RedditIcon, href: null },
]

const bottomLinks = [
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Client Privacy Policy", href: "/privacy-policy/client" },
  { label: "Tradie Privacy Policy", href: "/privacy-policy/tradie" },
  { label: "CA Notice at Collection", href: "/ca-notice" },
  { label: "Cookie Setting", href: "/cookie-settings" },
  { label: "Accessibility", href: "/accessibility" },
]

export function Footer() {
  const [openSection, setOpenSection] = useState<string | null>(null)

  return (
    <footer className="relative isolate overflow-hidden bg-[#031C19] font-manrope text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[164px] top-[76.54px] h-[548px] w-[658px] rounded-[603px] bg-linear-to-l from-[#08544B] to-[#D2FF00] opacity-24 blur-[125px]"
      />
      <section className="relative z-10 border-b border-white/10 px-5 py-12 sm:px-8 lg:py-16">
        <div className="mx-auto max-w-320">
          <div className="text-left lg:text-center">
            <p className="text-xs font-medium uppercase text-white/75">Download the app</p>
            <h2 className="mt-5 text-[36px] font-semibold leading-12 tracking-[-0.03em] lg:text-[40px] lg:leading-13.75">
              It&apos;s Easier in the Fixes AU App.
            </h2>
            <p className="mt-4 max-w-150 text-base leading-7 text-white/80 lg:mx-auto">
              Find trusted professionals, request quotes, manage bookings, and track every job all from one place, wherever you are.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:mt-14 lg:grid-cols-2 lg:gap-6">
            <DownloadCard type="fixes" />
            <DownloadCard type="fixer" />
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto max-w-320 px-5 sm:px-8 lg:px-0">
        <div className="hidden grid-cols-4 gap-12 py-12 lg:grid">
          {Object.entries(footerLinks).map(([heading, links]) => (
            <FooterLinkGroup key={heading} heading={heading} links={links} />
          ))}
        </div>

        <div className="divide-y divide-white/10 py-6 lg:hidden">
          {Object.entries(footerLinks).map(([heading, links]) => {
            const isOpen = openSection === heading
            return (
              <div key={heading}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between py-6 text-left text-lg font-semibold"
                  aria-expanded={isOpen}
                  onClick={() => setOpenSection(isOpen ? null : heading)}
                >
                  {heading}
                  <ChevronDown className={`size-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <ul className="space-y-3 pb-6">
                    {links.map((link, index) => <FooterLinkItem key={`${link.label}-${index}`} link={link} />)}
                  </ul>
                )}
              </div>
            )
          })}
        </div>

        <div className="grid gap-8 border-t border-white/10 py-10 lg:grid-cols-2 lg:gap-14 lg:py-12">
          <Acknowledgement
            flags={[
              { src: "/home-page-assets/redesign/flag-aboriginal.png", alt: "Aboriginal flag" },
              { src: "/home-page-assets/redesign/flag-torres-strait.png", alt: "Torres Strait Islander flag" },
            ]}
          >
            Fixes is proud to be building our community across Australia. In doing so we acknowledge First Nations people, the Traditional Custodians of the lands, skies and seas, and pay our respects to Elders past and present.
          </Acknowledgement>
          <Acknowledgement
            flags={[
              { src: "/home-page-assets/redesign/flag-progress-pride.png", alt: "Progress Pride flag" },
              { src: "/home-page-assets/redesign/flag-transgender.png", alt: "Transgender flag" },
            ]}
          >
            Diversity and inclusion is part of our DNA. We celebrate all genders, abilities, ages, religions, ethnicities, sexual orientations and backgrounds.
          </Acknowledgement>
        </div>

        <div className="flex flex-col gap-8 border-t border-white/10 py-9 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-5 sm:gap-7">
            <span className="text-sm text-white/50">Follow us</span>
            {socialLinks.map(({ label, icon: Icon, href }) =>
              href ? (
                <Link key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="text-white transition hover:text-[#AFFF43]">
                  <Icon className="size-5" />
                </Link>
              ) : (
                <span key={label} aria-label={`${label} link coming soon`} className="cursor-default text-white" role="img">
                  <Icon className="size-5" />
                </span>
              ),
            )}
          </div>
          <div className="flex items-center gap-2" aria-label="Trustpilot rating four out of five">
            <Star className="size-6 fill-[#00B67A] text-[#00B67A]" />
            <span className="text-lg font-semibold">Trustpilot</span>
            <div className="ml-1 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <span key={index} className={`flex size-5 items-center justify-center ${index < 4 ? "bg-[#72CF10]" : "bg-[#A5A5A5]"}`}>
                  <Star className="size-3.5 fill-white text-white" />
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-9 lg:flex lg:items-center lg:gap-8">
          <div className="flex items-center gap-5">
            <Image src="/logo.svg" alt="Fixes" width={112} height={40} className="h-10 w-auto brightness-0 invert" style={{ width: "auto" }} />
            <span className="text-sm text-white/50">© 2026 All rights reserved.</span>
          </div>
          <nav className="mt-8 flex flex-col gap-5 text-base text-white/75 lg:mt-0 lg:flex-row lg:flex-wrap lg:gap-x-6 lg:gap-y-2 lg:text-sm" aria-label="Legal links">
            {bottomLinks.map((link) => (
              <Link key={link.label} href={link.href} className="transition hover:text-white">{link.label}</Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}

function DownloadCard({ type }: { type: "fixes" | "fixer" }) {
  const isFixes = type === "fixes"
  const href = isFixes ? "/app/fixes" : "/app/fixer"
  const desktopTitle = isFixes ? "Download the Fixes app" : "Download the Fixer Tradie app"
  const mobileTitle = isFixes ? "Download the Fixes app" : "Download the Fixer app"
  const qr = isFixes ? "/qr-fixes-client.png" : "/qr-fixer-tradie.png"
  const logo = isFixes ? "/logo.svg" : "/fixer-logo.svg"

  return (
    <Link href={href} className="group flex min-h-23 items-center gap-4 rounded-xl border-2 border-[#A5A5A5] bg-white p-3 text-[#031C19] transition hover:-translate-y-1 hover:shadow-xl sm:p-4 lg:min-h-60 lg:gap-7 lg:rounded-[22px] lg:border-0 lg:p-7">
      <div className={`relative flex size-18 shrink-0 items-center justify-center overflow-hidden rounded-2xl lg:size-40 lg:rounded-none ${isFixes ? "bg-[#AFFF43] lg:bg-transparent" : "bg-[#08544B] lg:bg-transparent"}`}>
        <Image src={qr} alt="" width={160} height={160} className="hidden size-full rounded-xl object-cover lg:block" />
        <span className="pointer-events-none absolute inset-0 hidden items-center justify-center lg:flex" aria-hidden="true">
          <span className="flex h-2.5 w-6 items-center justify-center rounded-[2px] bg-black">
            {isFixes ? <FixesQRLogo /> : <FixerQRLogo />}
          </span>
        </span>
        <Image src={logo} alt="" width={90} height={36} className="h-auto w-13 lg:hidden" style={{ height: "auto" }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="hidden text-2xl font-semibold leading-8 lg:block">{desktopTitle}</p>
        <p className="text-xl font-semibold leading-7 lg:hidden">{mobileTitle}</p>
        <p className="mt-1 text-sm text-[#616161] lg:text-base"><span className="lg:hidden">Click to download</span><span className="hidden lg:inline">Scan to download</span></p>
      </div>
      <ArrowRight className="size-6 shrink-0 text-[#031C19] transition group-hover:translate-x-1 lg:size-8" strokeWidth={1.5} />
    </Link>
  )
}

function FooterLinkGroup({ heading, links }: { heading: string; links: FooterLink[] }) {
  return (
    <div>
      <h3 className="text-base font-semibold">{heading}</h3>
      <ul className="mt-5 space-y-3">
        {links.map((link, index) => <FooterLinkItem key={`${link.label}-${index}`} link={link} />)}
      </ul>
    </div>
  )
}

function FooterLinkItem({ link }: { link: FooterLink }) {
  return (
    <li>
      {link.href ? (
        <Link href={link.href} className="text-sm text-white/70 transition hover:text-white">{link.label}</Link>
      ) : (
        <span className="cursor-default text-sm text-white/70">{link.label}</span>
      )}
    </li>
  )
}

function Acknowledgement({ flags, children }: { flags: { src: string; alt: string }[]; children: ReactNode }) {
  return (
    <div className="flex items-start gap-5">
      <div className="grid w-15 shrink-0 gap-1">
        {flags.map((flag) => (
          <Image key={flag.src} src={flag.src} alt={flag.alt} width={60} height={36} className="h-auto w-15" style={{ height: "auto" }} />
        ))}
      </div>
      <p className="text-sm font-semibold leading-5 text-white/90">{children}</p>
    </div>
  )
}
