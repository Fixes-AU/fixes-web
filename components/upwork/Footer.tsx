import Link from "next/link"
import Image from "next/image"
import { Manrope } from "next/font/google"
import { Facebook, Twitter, Linkedin, Instagram, Youtube, ArrowRight } from "lucide-react"

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["700"],
})

const footerLinks: Record<string, { label: string; href: string }[]> = {
  "For Clients / Homeowners": [
    { label: "Articles", href: "#" },
    { label: "FAQs", href: "#" },
    { label: "Licensing", href: "#" },
    { label: "Council Regulations", href: "#" },
    { label: "Trust & Quality", href: "#" },
    { label: "Job Poster T&Cs", href: "#" },
    { label: "Direct Contracts", href: "#" },
  ],
  "For Tradies": [
    { label: "Register with Fixer", href: "/i-want-to-work" },
    { label: "How to Find Work", href: "#" },
    { label: "Direct Contracts", href: "#" },
    { label: "How Fixes Works", href: "#" },
    { label: "FAQs", href: "#" },
    { label: "Member Login", href: "#" },
  ],
  "Resources": [
    { label: "Help & Support", href: "/support" },
    { label: "Fixes Reviews", href: "#" },
    { label: "Resources", href: "#" },
    { label: "Blog", href: "/blog" },
    { label: "Community", href: "#" },
  ],
  "Company": [
    { label: "About Us", href: "/about-us" },
    { label: "Leadership", href: "/about-us#team" },
    { label: "Investor Relations", href: "/investors" },
    { label: "Careers", href: "#" },
    { label: "Our Impact", href: "/community-impact" },
    { label: "Press", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Trust, Safety & Security", href: "/safety" },
  ],
}

const socialLinks = [
  { icon: Facebook, label: "Facebook", envKey: "NEXT_PUBLIC_FACEBOOK_URL" },
  { icon: Linkedin, label: "LinkedIn", envKey: "NEXT_PUBLIC_LINKEDIN_URL" },
  { icon: Twitter, label: "Twitter", envKey: "NEXT_PUBLIC_TWITTER_URL" },
  { icon: Youtube, label: "YouTube", envKey: "NEXT_PUBLIC_YOUTUBE_URL" },
  { icon: Instagram, label: "Instagram", envKey: "NEXT_PUBLIC_INSTAGRAM_URL" },
]

const bottomLinks = [
  "Terms of Service",
  "Privacy Policy",
  "CA Notice at Collection",
  "Cookie Settings",
  "Accessibility",
]

export function Footer() {
  return (
    <footer className="bg-(--upwork-navy) text-white">
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10 lg:py-14">
          <h2
            className={`${manrope.className} text-2xl sm:text-3xl lg:text-[44px] font-bold text-center mb-8 lg:mb-10`}
          >
            It&apos;s easier in the apps
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-342.5 mx-auto">
            <div
              className="flex items-center gap-4 bg-white px-5 py-5 w-full"
              style={{ borderRadius: '23px', maxWidth: '675px', height: 'auto', minHeight: '120px' }}
            >
              <div className="shrink-0 w-20 h-20 lg:w-24 lg:h-24 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-xs font-bold text-gray-400">
                QR
              </div>
              <div className="grow min-w-0">
                <p className="text-[0.95rem] lg:text-lg font-bold text-black">Download the Fixes app</p>
                <p className="text-xs lg:text-sm text-gray-400">Scan to download</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" />
            </div>

            <div
              className="flex items-center gap-4 bg-white px-5 py-5 w-full"
              style={{ borderRadius: '23px', maxWidth: '675px', height: 'auto', minHeight: '120px' }}
            >
              <div className="shrink-0 w-20 h-20 lg:w-24 lg:h-24 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-xs font-bold text-gray-400">
                QR
              </div>
              <div className="grow min-w-0">
                <p className="text-[0.95rem] lg:text-lg font-bold text-black">Download the Fixer Tradie app</p>
                <p className="text-xs lg:text-sm text-gray-400">Scan to download</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-base mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm text-gray-400">Follow us</span>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                const href = process.env[social.envKey] || "#"
                return (
                  <Link
                    key={social.label}
                    href={href}
                    target={href !== "#" ? "_blank" : undefined}
                    rel={href !== "#" ? "noopener noreferrer" : undefined}
                    className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={80}
                height={28}
                className="h-5 w-auto brightness-0 invert"
              />
              <span className="text-sm text-gray-400">© 2015 - 2026 All rights reserved.</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {bottomLinks.map((link) => (
                <Link
                  key={link}
                  href="#"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
