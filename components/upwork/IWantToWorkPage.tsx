"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { BellRing } from "lucide-react"
import { Header } from "./Header"
import { Footer } from "./Footer"
import styles from "./IWantToWorkPage.module.css"

type StepMode = "hiring" | "working"
type StepIconName = "create" | "upload" | "packageReceive" | "saveMoney" | "wifi" | "emailReceive" | "moneyReceive"
type PlatformIconName = "moneyHand" | "personSupport" | "notification" | "aiMatch" | "shieldTick" | "feed"

type Step = {
  title: string
  description: string
  icon: StepIconName
}

const hiringSteps: Step[] = [
  {
    title: "Create Your Account",
    description: "Add details, timing and photos so tradies know exactly what's needed.",
    icon: "create",
  },
  {
    title: "Post Your Job",
    description: "Describe your project, upload photos, and set your preferred schedule.",
    icon: "upload",
  },
  {
    title: "Receive Quotes",
    description: "Compare quotes, profiles, reviews, and ratings from verified tradies.",
    icon: "packageReceive",
  },
  {
    title: "Hire & Pay Securely",
    description: "Choose the right professional and pay safely through Fixes.",
    icon: "saveMoney",
  },
]

const workingSteps: Step[] = [
  {
    title: "Create Your Account",
    description: "Sign up, complete your profile, and verify your trade to start receiving local job opportunities.",
    icon: "create",
  },
  {
    title: "Go Online",
    description: "Set your availability and service area so customers can discover you when they need your skills.",
    icon: "wifi",
  },
  {
    title: "Receive Nearby Jobs",
    description: "Get instantly matched with nearby jobs that fit your trade, location, and schedule.",
    icon: "emailReceive",
  },
  {
    title: "Complete Work & Get Paid",
    description: "Finish the job, delight your customer, and receive secure payment directly through Fixes AU.",
    icon: "moneyReceive",
  },
]

const benefits = [
  {
    title: "AI-Powered Instant Quotes",
    description: "Generate accurate job estimates from photos and details in minutes",
    type: "quote",
  },
  {
    title: "Smart Job Matching",
    description: "Receive nearby job opportunities tailored to your trade, location, and availability",
    type: "image",
    image: "/i-want-to-work-assets/smart-job-matching.webp",
    alt: "Fixes smart job matching interface",
  },
  {
    title: "Secure Escrow Payments",
    description: "Every payment is protected in escrow and released automatically once the job is completed.",
    type: "image",
    image: "/i-want-to-work-assets/secure-escrow.webp",
    alt: "Fixes secure escrow payment confirmation",
  },
  {
    title: "Zero Lead Fees",
    description: "No subscriptions or upfront lead costs. You only pay when you complete a job and get paid.",
    type: "image",
    image: "/i-want-to-work-assets/zero-lead-fees.webp",
    alt: "Fixes zero lead fees payment screen",
  },
] as const

const platformFeatures = [
  { title: "Secure Escrow Payments", description: "Protected payments from start to finish.", icon: "moneyHand" },
  { title: "Local Support", description: "Real local help whenever you need it.", icon: "personSupport" },
  { title: "Instant Notifications", description: "Never miss a new job opportunity.", icon: "notification" },
  { title: "AI Job Matching", description: "Find relevant jobs near you instantly.", icon: "aiMatch" },
  { title: "Verified Professionals", description: "Work with trusted, verified tradies only.", icon: "shieldTick" },
  { title: "Zero Lead Fees", description: "Pay only when work is completed.", icon: "feed" },
] as const satisfies ReadonlyArray<{ title: string; description: string; icon: PlatformIconName }>

export function IWantToWorkPage() {
  const [stepMode, setStepMode] = useState<StepMode>("hiring")

  return (
    <main className={styles.page}>
      <Header campaign />

      <div className={styles.pageFlow}>
        <Hero />

        <section className={styles.contentStack}>
          <StepsSection mode={stepMode} onModeChange={setStepMode} />
          <BenefitsSection />
        </section>

        <PlatformSection />
        <TestimonialSection />

        <section className={styles.lowerStack}>
          <AppSection />
          <ReadySection />
        </section>

        <Footer campaign />
      </div>
    </main>
  )
}

function Hero() {
  return (
    <section className={styles.hero}>
      <Image
        src="/i-want-to-work-assets/hero-desktop.webp"
        alt="Fixes tradie reviewing a new job beside his service van"
        fill
        priority
        sizes="(max-width: 767px) 0px, 100vw"
        className={styles.heroDesktopImage}
      />
      <Image
        src="/i-want-to-work-assets/hero-mobile.webp"
        alt="Fixes tradie reviewing a new job beside his service van"
        fill
        priority
        sizes="(max-width: 767px) 100vw, 0px"
        className={styles.heroMobileImage}
      />
      <div className={styles.heroShade} aria-hidden="true" />
      <div className={styles.jobAlert} aria-hidden="true">
        <BellRing />
        <span>New job alert!</span>
      </div>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrowLight}>Get started with Fixes AU</p>
        <h1>Choose How You Want to Get Started.</h1>
        <p className={styles.heroDescription}>
          Whether you&apos;re looking to hire trusted professionals or grow your trade business, Fixes AU makes it simple to get started in just a few steps.
        </p>
        <div className={styles.heroActions}>
          <Link href="/register/tradie" className={styles.primaryHeroButton}>Create Your Account</Link>
          <Link href="/app/fixer" className={styles.secondaryHeroButton}>Download the App</Link>
        </div>
      </div>
    </section>
  )
}

function StepsSection({ mode, onModeChange }: { mode: StepMode; onModeChange: (mode: StepMode) => void }) {
  const steps = mode === "hiring" ? hiringSteps : workingSteps

  return (
    <section className={styles.stepsSection}>
      <div className={styles.stepsHeadingRow}>
        <h2>Hire Trusted Professionals in Four Simple Steps.</h2>
        <div className={styles.modeToggle} role="tablist" aria-label="Choose how to use Fixes">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "hiring"}
            className={mode === "hiring" ? styles.activeMode : undefined}
            onClick={() => onModeChange("hiring")}
          >
            For Hiring
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "working"}
            className={mode === "working" ? styles.activeMode : undefined}
            onClick={() => onModeChange("working")}
          >
            For Finding Work
          </button>
        </div>
      </div>

      <div className={styles.stepsCanvas}>
        {steps.map((step, index) => (
          <StepCard key={`${mode}-${step.title}`} step={step} index={index} />
        ))}
        <StepArrow index={0} />
        <StepArrow index={1} />
        <StepArrow index={2} />
      </div>
    </section>
  )
}

function StepCard({ step, index }: { step: Step; index: number }) {
  return (
    <article className={`${styles.stepGroup} ${styles[`stepGroup${index + 1}`]}`}>
      <span className={styles.stepNumber} aria-hidden="true">{index + 1}</span>
      <div className={styles.stepCardShell}>
        <div className={styles.stepCard}>
          <div className={styles.stepIcon}><StepIcon name={step.icon} /></div>
          <h3>{step.title}</h3>
          <p>{step.description}</p>
        </div>
      </div>
    </article>
  )
}

function StepIcon({ name }: { name: StepIconName }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }

  switch (name) {
    case "create":
      return (
        <svg {...commonProps}>
          <path d="M12.5 5H6.75A1.75 1.75 0 0 0 5 6.75v10.5C5 18.22 5.78 19 6.75 19h10.5c.97 0 1.75-.78 1.75-1.75V11.5" />
          <path d="m11 13 9-9M15.5 4H20v4.5" />
        </svg>
      )
    case "upload":
      return (
        <svg {...commonProps}>
          <path d="M5 11.5v6.25c0 .97.78 1.75 1.75 1.75h10.5c.97 0 1.75-.78 1.75-1.75V11.5" />
          <path d="M12 15V4m0 0L8 8m4-4 4 4" />
        </svg>
      )
    case "packageReceive":
      return (
        <svg {...commonProps}>
          <path d="m4.5 7.5 7.5 4.25 7.5-4.25M12 11.75V20" />
          <path d="m4.5 7.5 7.5-4 7.5 4v9L12 20l-7.5-3.5v-9Z" />
          <path d="M12 3.5v5m0 0-2-2m2 2 2-2" />
        </svg>
      )
    case "saveMoney":
      return (
        <svg {...commonProps}>
          <circle cx="15.5" cy="7.5" r="4.5" />
          <path d="M15.5 5v5m1.5-4h-2.25a1.25 1.25 0 0 0 0 2.5h1.5a1.25 1.25 0 0 1 0 2.5H14" />
          <path d="M3.5 13.5h3l3.2 3h4.1c1.6 0 1.6 2.5 0 2.5h-3.3" />
          <path d="M6.5 19h9l5-4.5c-.75-.75-1.8-.85-2.7-.25L14.5 16.5M3.5 12.5v7.5" />
        </svg>
      )
    case "wifi":
      return (
        <svg {...commonProps}>
          <path d="M3.5 8.5a13 13 0 0 1 17 0M6.5 12a8.5 8.5 0 0 1 11 0M9.5 15.5a4 4 0 0 1 5 0" />
          <circle cx="12" cy="19" r=".75" fill="currentColor" stroke="none" />
        </svg>
      )
    case "emailReceive":
      return (
        <svg {...commonProps}>
          <rect x="3.5" y="5.5" width="15" height="12" rx="2" />
          <path d="m4.5 7 6.5 4.5L17.5 7M20.5 10v7m0 0-2.5-2.5m2.5 2.5 2.5-2.5" />
        </svg>
      )
    case "moneyReceive":
      return (
        <svg {...commonProps}>
          <rect x="4.5" y="4.5" width="15" height="15" rx="4" />
          <path d="M12 8v8m2-6.5h-3a1.5 1.5 0 0 0 0 3h2a1.5 1.5 0 0 1 0 3h-3" />
          <path d="M17 3v4h4M7 21v-4H3" />
        </svg>
      )
  }
}

function StepArrow({ index }: { index: number }) {
  const middle = index === 1

  return (
    <svg className={`${styles.stepArrow} ${styles[`stepArrow${index + 1}`]}`} viewBox="0 0 112 50" fill="none" aria-hidden="true">
      {middle ? (
        <>
          <path d="M3 10C29 38 71 40 102 13" stroke="#AFFF43" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M91 14L102 13L99 24" stroke="#AFFF43" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <path d="M3 25C28 3 70 6 102 32" stroke="#AFFF43" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M91 31L102 32L99 21" stroke="#AFFF43" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  )
}

function BenefitsSection() {
  return (
    <section className={styles.benefitsSection}>
      <div className={styles.centeredHeading}>
        <h2>Everything You Need to Succeed.</h2>
        <p>Whether you&apos;re hiring or finding work, Fixes AU provides the tools to make every job simple, secure, and stress-free.</p>
      </div>

      <div className={styles.benefitGrid}>
        {benefits.map((benefit) => (
          <article className={styles.benefitCard} key={benefit.title}>
            <div className={styles.benefitVisual}>
              <div className={styles.limeWave} aria-hidden="true" />
              {benefit.type === "quote" ? (
                <QuotePreview />
              ) : (
                <Image src={benefit.image} alt={benefit.alt} fill sizes="(max-width: 767px) 310px, 260px" className={styles.benefitImage} />
              )}
            </div>
            <div className={styles.benefitText}>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function QuotePreview() {
  return (
    <div className={styles.quotePreview}>
      <div className={styles.quoteHeading}>
        <strong>$2,800 - 3,500</strong>
        <span>AI estimated from your project details</span>
      </div>
      <div className={styles.matchSummary}>
        <strong>Match Found</strong>
        <span>Matched with nearby top-rated available tradie</span>
      </div>
      <div className={styles.tradieMatch}>
        <Image src="/i-want-to-work-assets/matched-tradie.webp" alt="Matched Fixes tradie" width={34} height={34} />
        <span><strong>John Doe</strong><small>Electrician</small></span>
        <em>
          Best Match
          <span className={styles.bestMatchMark} aria-hidden="true">
            <span />
            <Image
              src="/home-page-assets/redesign/ai-quote-mark.png"
              alt=""
              width={611}
              height={548}
            />
          </span>
        </em>
      </div>
    </div>
  )
}

function PlatformSection() {
  return (
    <section className={styles.platformSection}>
      <div className={styles.platformInner}>
        <div className={styles.platformHeading}>
          <p className={styles.eyebrowGreen}>Why choose Fixes</p>
          <h2>Built for Homeowners. Trusted by Tradies.</h2>
          <p>More than a marketplace Fixes AU is a smarter way to connect, hire, and grow.</p>
        </div>

        <div className={styles.featureGrid}>
          {platformFeatures.map(({ title, description, icon }) => (
            <article key={title} className={styles.featureCard}>
              <span className={styles.featureIcon}><PlatformIcon name={icon} /></span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function PlatformIcon({ name }: { name: PlatformIconName }) {
  if (name === "aiMatch") {
    return (
      <svg
        className={styles.aiMatchGlyph}
        viewBox="167.973 2684.91 23.916 21.47"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M190.459 2690.83L191.889 2684.91C191.889 2684.91 191.004 2684.96 189.731 2685.06C187.852 2685.21 185.061 2685.64 182.591 2687.32C180.403 2688.95 178.653 2691.28 177.474 2693.41C176.239 2695.65 175.604 2697.68 174.368 2698.94C172.701 2700.77 169.348 2700.44 169.348 2700.44L167.973 2706.38C167.973 2706.38 169.248 2706.31 170.897 2706.15C173.128 2705.92 175.813 2705.55 178.219 2703.31C180.18 2701.56 181.16 2699.14 182.208 2696.96C183.188 2694.92 184.246 2693.09 185.665 2692.06C187.617 2690.58 190.459 2690.83 190.459 2690.83Z" />
      </svg>
    )
  }

  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": true,
  }

  switch (name) {
    case "moneyHand":
      return (
        <svg {...commonProps}>
          <path d="M6.25 2A2.25 2.25 0 0 0 4 4.25v15.5A2.25 2.25 0 0 0 6.25 22h7.5A2.25 2.25 0 0 0 16 19.771v-1.52a.75.75 0 0 0-.75-.75c-.453 0-.739-.123-.936-.282c-.208-.167-.38-.425-.511-.789c-.273-.755-.302-1.75-.302-2.68a.75.75 0 0 0-.202-.512l-.165-.177a3 3 0 0 0-.17-.173c-.074-.07-.3-.285-1.183-1.168c-.469-.469-.728-.865-.813-1.168a.6.6 0 0 1-.016-.325a.7.7 0 0 1 .205-.323a.7.7 0 0 1 .322-.204a.6.6 0 0 1 .324.016c.302.085.698.346 1.167.815c.54.54 1.053 1.047 1.512 1.5c.76.752 1.373 1.36 1.72 1.73a.75.75 0 0 0 1.097-1.023A55 55 0 0 0 16 11.424V8.06l2.842 2.842c.421.422.659.994.659 1.59v8.758a.75.75 0 0 0 1.5 0v-8.757a3.75 3.75 0 0 0-1.099-2.652L16 5.939v-1.69A2.25 2.25 0 0 0 13.75 2zm7.124 16.388a2.7 2.7 0 0 0 1.126.534V19h-.75a.75.75 0 0 0-.75.75v.75h-1.5v-.75a2.25 2.25 0 0 1 1.276-2.028c.16.244.356.472.598.666m-1.372-4.342c.002.253.007.526.022.81a3.5 3.5 0 1 1-1.55-6.324q-.2.133-.378.312c-.292.292-.5.63-.597 1.01s-.074.754.025 1.104c.189.673.665 1.291 1.197 1.823A67 67 0 0 0 11.957 14l.004.003l.037.039zM7 3.5h1.5v.75A2.25 2.25 0 0 1 6.25 6.5H5.5V5h.75A.75.75 0 0 0 7 4.25zm4.5 0H13v.75c0 .414.336.75.75.75h.75v1.5h-.75a2.25 2.25 0 0 1-2.25-2.25zm-3 17H7v-.75a.75.75 0 0 0-.75-.75H5.5v-1.5h.75a2.25 2.25 0 0 1 2.25 2.25z" />
        </svg>
      )
    case "personSupport":
      return (
        <svg {...commonProps} viewBox="0 0 32 32">
          <path d="M9 11a7 7 0 1 1 14 0a1 1 0 1 0 2 0a9 9 0 1 0-14.385 7.212a9 9 0 0 0 3.558 1.602a2 2 0 1 0 .216-2A7 7 0 0 1 9 11m1 0a6 6 0 1 1 7.913 5.689A3 3 0 0 0 16 16c-.727 0-1.393.259-1.913.689A6 6 0 0 1 10 11m6 11a3 3 0 0 0 2.83-4h5.67a3.5 3.5 0 0 1 3.5 3.5v.5c0 2.393-1.523 4.417-3.685 5.793C22.141 29.177 19.198 30 16 30s-6.14-.823-8.315-2.207C5.523 26.417 4 24.393 4 22v-.5A3.5 3.5 0 0 1 7.5 18h1.359a10 10 0 0 0 4.662 2.69c.54.791 1.45 1.31 2.479 1.31" />
        </svg>
      )
    case "notification":
      return (
        <svg {...commonProps}>
          <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H15v3.25A2.75 2.75 0 0 0 17.75 10H20v7.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Z" />
          <circle cx="18.25" cy="5.75" r="2.75" />
        </svg>
      )
    case "shieldTick":
      return (
        <svg {...commonProps}>
          <path d="M18.5408 4.11984L13.0408 2.05984C12.4708 1.84984 11.5408 1.84984 10.9708 2.05984L5.47078 4.11984C4.41078 4.51984 3.55078 5.75984 3.55078 6.88984V14.9898C3.55078 15.7998 4.08078 16.8698 4.73078 17.3498L10.2308 21.4598C11.2008 22.1898 12.7908 22.1898 13.7608 21.4598L19.2608 17.3498C19.9108 16.8598 20.4408 15.7998 20.4408 14.9898V6.88984C20.4508 5.75984 19.5908 4.51984 18.5408 4.11984ZM15.4808 9.71984L11.1808 14.0198C11.0308 14.1698 10.8408 14.2398 10.6508 14.2398C10.4608 14.2398 10.2708 14.1698 10.1208 14.0198L8.52078 12.3998C8.23078 12.1098 8.23078 11.6298 8.52078 11.3398C8.81078 11.0498 9.29078 11.0498 9.58078 11.3398L10.6608 12.4198L14.4308 8.64984C14.7208 8.35984 15.2008 8.35984 15.4908 8.64984C15.7808 8.93984 15.7808 9.42984 15.4808 9.71984Z" />
        </svg>
      )
    case "feed":
      return (
        <svg {...commonProps}>
          <path fillRule="evenodd" d="M5.5 4h13A2.5 2.5 0 0 1 21 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-11A2.5 2.5 0 0 1 5.5 4ZM7 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm3.5.25a.75.75 0 0 0 0 1.5H17a.75.75 0 0 0 0-1.5h-6.5ZM7 12a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm3.5.25a.75.75 0 0 0 0 1.5H17a.75.75 0 0 0 0-1.5h-6.5ZM7 16a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm3.5.25a.75.75 0 0 0 0 1.5H15a.75.75 0 0 0 0-1.5h-4.5Z" clipRule="evenodd" />
        </svg>
      )
  }
}

function TestimonialSection() {
  return (
    <section className={styles.testimonialSection}>
      <div className={styles.testimonialInner}>
        <div className={styles.testimonialHeading}>
          <p className={styles.eyebrowGreen}>Testimonials</p>
          <h2>Real People. Real Results.</h2>
        </div>

        <article className={styles.testimonialCard}>
          <blockquote>
            &ldquo;Fixes AU transformed the way I run my business. Instead of searching for work, quality jobs now come to me. The AI quoting, secure payments, and verified customers have helped me save time, increase bookings, and focus on delivering great results.&rdquo;
          </blockquote>
          <div className={styles.stars} aria-label="Three out of five stars">
            <span>★</span><span>★</span><span>★</span><span className={styles.dimStar}>★</span><span className={styles.dimStar}>★</span>
          </div>
          <div className={styles.testimonialAuthor}>
            <strong>Mike Thompson</strong>
            <span>Licensed Electrician • Melbourne, VIC</span>
          </div>
        </article>
      </div>
    </section>
  )
}

function AppSection() {
  return (
    <section className={styles.appSection}>
      <div className={styles.appCopy}>
        <div>
          <h2>Everything You Need,<br />Wherever You Are.</h2>
          <p>Manage jobs, communicate with customers, receive payments, and grow your business—all from the Fixes AU app.</p>
        </div>
        <div className={styles.storeButtons}>
          <StoreButton store="apple" />
          <StoreButton store="google" />
        </div>
      </div>
      <div className={styles.appPreview}>
        <Image src="/i-want-to-work-assets/app-preview.webp" alt="Fixes app job assignment and offer notifications" fill sizes="(max-width: 767px) 350px, 620px" />
      </div>
    </section>
  )
}

function StoreButton({ store }: { store: "apple" | "google" }) {
  const isApple = store === "apple"

  return (
    <Link
      href="/app/fixer"
      className={`${styles.storeButton} ${isApple ? styles.appleStoreButton : styles.googleStoreButton}`}
      aria-label={isApple ? "Download on the App Store" : "Download on Google Play"}
    >
      {isApple ? <AppleStoreMark /> : <GooglePlayMark />}
      <span>
        <small>{isApple ? "Download on the" : "Android App On"}</small>
        <strong>{isApple ? "App Store" : "Google Play"}</strong>
      </span>
    </Link>
  )
}

function AppleStoreMark() {
  return (
    <svg className={styles.appleStoreMark} viewBox="89.138 4057.48 28.195 32" aria-hidden="true">
      <path d="M112.939 4074.5C112.955 4073.27 113.289 4072.07 113.909 4071C114.529 4069.93 115.416 4069.04 116.486 4068.4C115.806 4067.45 114.909 4066.67 113.866 4066.12C112.824 4065.57 111.664 4065.26 110.479 4065.22C107.951 4064.97 105.501 4066.7 104.213 4066.7C102.9 4066.7 100.917 4065.25 98.7814 4065.29C97.4001 4065.34 96.054 4065.73 94.8741 4066.43C93.6942 4067.13 92.7208 4068.12 92.0488 4069.3C89.1379 4074.22 91.3092 4081.45 94.0977 4085.43C95.4928 4087.38 97.1234 4089.55 99.2569 4089.48C101.345 4089.39 102.124 4088.18 104.645 4088.18C107.141 4088.18 107.873 4089.48 110.05 4089.43C112.29 4089.39 113.701 4087.47 115.048 4085.51C116.05 4084.12 116.821 4082.58 117.333 4080.96C116.032 4080.42 114.921 4079.52 114.14 4078.37C113.358 4077.22 112.941 4075.88 112.939 4074.5Z" />
      <path d="M108.828 4062.61C110.049 4061.18 110.651 4059.34 110.505 4057.48C108.639 4057.67 106.915 4058.54 105.677 4059.92C105.072 4060.59 104.608 4061.37 104.313 4062.22C104.017 4063.07 103.896 4063.96 103.956 4064.86C104.889 4064.87 105.813 4064.67 106.656 4064.28C107.5 4063.89 108.243 4063.32 108.828 4062.61Z" />
    </svg>
  )
}

function GooglePlayMark() {
  return (
    <svg className={styles.googlePlayMark} viewBox="266.667 4057.48 28 32" aria-hidden="true">
      <path d="M270.167 4088.98C270.721 4088.98 271.239 4088.83 271.685 4088.56L271.726 4088.53L271.729 4088.53L285.783 4080.24L279.734 4073.5L267.348 4086.95C267.765 4088.14 268.876 4088.98 270.167 4088.98Z" />
      <path d="M292.569 4076.23L292.581 4076.22C293.523 4075.7 294.167 4074.69 294.167 4073.51C294.167 4072.34 293.533 4071.33 292.601 4070.8L292.576 4070.79L292.554 4070.78L286.6 4067.25L280.165 4073.1L286.646 4079.73L292.569 4076.23Z" />
      <path className={styles.googlePlaySolid} d="M266.786 4060.14C266.708 4060.43 266.667 4060.74 266.667 4061.06V4085.9C266.667 4086.22 266.708 4086.53 266.787 4086.82L280.185 4073.12L266.786 4060.14Z" />
      <path d="M285.736 4066.73L271.721 4058.42L271.714 4058.42C271.261 4058.14 270.732 4057.98 270.167 4057.98C268.881 4057.98 267.773 4058.82 267.351 4060L279.835 4072.76L285.736 4066.73Z" />
    </svg>
  )
}

function ReadySection() {
  return (
    <section className={styles.readySection}>
      <div className={styles.readyPattern} aria-hidden="true" />
      <div className={styles.readyContent}>
        <h2>Ready to Get Started?</h2>
        <p>Whether you&apos;re hiring a trusted professional or growing your trade business, Fixes AU makes every step simple.</p>
        <div className={styles.readyActions}>
          <Link href="/post-job">Post a Job</Link>
          <Link href="/register/tradie">Become a Fixer</Link>
        </div>
      </div>
    </section>
  )
}
