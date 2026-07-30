// fixes-web/app/page.tsx

import {
  Header,
  HeroSection,
  CategoryTabs,
  HowItWorks,
  CTASection,
  PricingPlans,
  Testimonials,
  TrustedBy,
  BrandManifesto,
  Footer,
} from "@/components/upwork"

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-clip bg-white font-manrope">
      <Header />
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
