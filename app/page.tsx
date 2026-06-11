// fixes-web/app/page.tsx

import {
  Header,
  HeroSection,
  CategoryTabs,
  SkillsSearch,
  HowItWorks,
  PricingPlans,
  Testimonials,
  TrustedBy,
  Footer,
} from "@/components/upwork"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <CategoryTabs />
      <HowItWorks />
      <PricingPlans />
      <Testimonials />
      <TrustedBy />
      <Footer />
    </main>
  )
}
