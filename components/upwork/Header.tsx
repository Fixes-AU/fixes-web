"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, Search, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { 
    label: "Find Talent", 
    hasDropdown: true,
    items: [
      { title: "Post a Job", href: "/post-job", desc: "Get an AI quote and find tradies" },
      { title: "Browse Categories", href: "/categories", desc: "View all supported trades" },
      { title: "How to Hire", href: "/tips", desc: "Tips for hiring on Fixes" }
    ]
  },
  { 
    label: "Find Work", 
    hasDropdown: true,
    items: [
      { title: "Join as a Tradie", href: "/i-want-to-work", desc: "Apply to get consistent work" },
      { title: "Trust & Safety", href: "/safety", desc: "How we protect our tradies" }
    ]
  },
  { 
    label: "Why Fixes", 
    hasDropdown: true,
    items: [
      { title: "About Us", href: "/about-us", desc: "Our mission and team" },
      { title: "Blog", href: "/blog", desc: "Latest news and updates" },
      { title: "Community Impact", href: "/community-impact", desc: "How we help the community" },
      { title: "Investors", href: "/investors", desc: "Invest in Fixes" }
    ]
  },
  { label: "Enterprise", hasDropdown: false, href: "/enterprise" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null)

  const toggleMobileDropdown = (label: string) => {
    setOpenMobileDropdown(prev => prev === label ? null : label)
  }

  return (
    <header className="sticky top-0 z-50 bg-[#FFFCE9] border-b border-(--upwork-border)">
      <div className="bg-(--upwork-navy) text-white py-2 px-4 text-center text-sm">
        <span className="font-semibold">Stop doing everything.</span>{" "}
        Manage your team and multiple sites on Fixes Business.{" "}
        <Link href="/register?plan=business" className="underline hover:no-underline">
          Get started
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <div key={item.label} className="relative group">
                  {item.hasDropdown ? (
                    <>
                      <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-(--upwork-navy) hover:text-(--upwork-green) transition-colors">
                        {item.label}
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 shadow-xl rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left z-50">
                        <div className="p-3 flex flex-col gap-1">
                          {item.items?.map((subItem) => (
                            <Link
                              key={subItem.title}
                              href={subItem.href}
                              className="block px-4 py-3 hover:bg-[#f4f9ef] rounded-xl transition-colors group/item"
                            >
                              <p className="text-sm font-semibold text-(--upwork-navy) group-hover/item:text-(--upwork-green) transition-colors">
                                {subItem.title}
                              </p>
                              {subItem.desc && (
                                <p className="text-xs text-(--upwork-gray) mt-0.5 line-clamp-1">
                                  {subItem.desc}
                                </p>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.href || "#"}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-(--upwork-navy) hover:text-(--upwork-green) transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-(--upwork-green) hover:text-(--upwork-green-dark) font-medium"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white rounded-full px-5">
                  Sign Up
                </Button>
              </Link>
            </div>

            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 py-4 px-4 overflow-y-auto max-h-[80vh]">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <div key={item.label}>
                {item.hasDropdown ? (
                  <div className="flex flex-col gap-1">
                    <button 
                      onClick={() => toggleMobileDropdown(item.label)}
                      className="flex items-center justify-between px-4 py-3 text-sm font-bold text-(--upwork-navy) hover:bg-gray-50 rounded-lg w-full text-left"
                    >
                      {item.label}
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openMobileDropdown === item.label ? 'rotate-180' : ''}`} />
                    </button>
                    {openMobileDropdown === item.label && (
                      <div className="pl-4 pr-2 flex flex-col gap-1 mt-1">
                        {item.items?.map((subItem) => (
                          <Link
                            key={subItem.title}
                            href={subItem.href}
                            className="block px-4 py-2.5 text-sm font-medium text-(--upwork-navy) hover:bg-[#f4f9ef] rounded-lg"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href || "#"}
                    className="flex items-center justify-between px-4 py-3 text-sm font-bold text-(--upwork-navy) hover:bg-gray-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-200">
            <Link href="/login">
              <Button
                variant="outline"
                className="w-full border-(--upwork-green) text-(--upwork-green)"
              >
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="w-full bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}


