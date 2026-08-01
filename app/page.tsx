// fixes-web/app/page.tsx

import { Header } from "@/components/upwork/Header"
import { HeroSection } from "@/components/upwork/HeroSection"
import { CategoryTabs } from "@/components/upwork/CategoryTabs"
import { HowItWorks } from "@/components/upwork/HowItWorks"
import { BrandManifesto } from "@/components/upwork/BrandManifesto"
import { CTASection } from "@/components/upwork/CTASection"
import { PricingPlans } from "@/components/upwork/PricingPlans"
import { Testimonials } from "@/components/upwork/Testimonials"
import { TrustedBy } from "@/components/upwork/TrustedBy"
import { Footer } from "@/components/upwork/Footer"

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
