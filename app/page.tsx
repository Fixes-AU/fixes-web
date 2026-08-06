// fixes-web/app/page.tsx

import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { Header } from "@/components/upwork/Header"
import { HeroSection } from "@/components/upwork/HeroSection"
import { CategoryTabs } from "@/components/upwork/CategoryTabs"
import { BrandManifesto } from "@/components/upwork/BrandManifesto"
import { PricingPlans } from "@/components/upwork/PricingPlans"
import { Testimonials } from "@/components/upwork/Testimonials"
import { TrustedBy } from "@/components/upwork/TrustedBy"

export const metadata: Metadata = {
  title: "Fixes | Hire Trusted Tradies Instantly",
  description: "Find verified local electricians, plumbers, carpenters, and cleaners in minutes. Get AI-powered quotes and pay securely.",
}

const HowItWorks = dynamic(
  () => import("@/components/upwork/HowItWorks").then((mod) => ({ default: mod.HowItWorks })),
)
const CTASection = dynamic(
  () => import("@/components/upwork/CTASection").then((mod) => ({ default: mod.CTASection })),
)
const Footer = dynamic(
  () => import("@/components/upwork/Footer").then((mod) => ({ default: mod.Footer })),
)

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-clip bg-white font-manrope">
      <Header deferNavigationPrefetch />
      <HeroSection />
      <CategoryTabs />
      <HowItWorks />
      <BrandManifesto />
      <CTASection />
      <PricingPlans />
      <Testimonials />
      <TrustedBy />
      <Footer />
    </main>
  )
}
