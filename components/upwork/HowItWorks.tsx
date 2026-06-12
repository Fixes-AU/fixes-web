"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, MapPin, CheckCircle2, FileText, Wifi, BellRing } from "lucide-react"

const CashIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M7 9m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z" />
    <path d="M14 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M17 9v-2a2 2 0 0 0 -2 -2h-10a2 2 0 0 0 -2 2v6a2 2 0 0 0 2 2h2" />
  </svg>
)

const hiringSteps = [
  {
    icon: FileText,
    title: "Post your job",
    description: "Add details, timing and photos so tradies know exactly what's needed.",
    cta: "",
  },
  {
    icon: MapPin,
    title: "Get connected to a top-rated tradie",
    description: "We match you with nearby, highly rated tradies ready for your job.",
    cta: "",
  },
  {
    icon: CheckCircle2,
    title: "Get your job done",
    description: "Your tradie gets to work and you pay only when the job is complete.",
    cta: "",
  },
]

const workingSteps = [
  {
    icon: Wifi,
    title: "Go online",
    description: "Create your profile and go online to let customers know you're available.",
    cta: "",
  },
  {
    icon: BellRing,
    title: "Receive nearby jobs",
    description: "Get notified of local jobs that match your trade and skills instantly.",
    cta: "",
  },
  {
    icon: CashIcon,
    title: "Get paid as you deliver",
    description: "Complete the work and receive payment securely once the job is done.",
    cta: "",
  },
]

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState<"hiring" | "working">("hiring")
  const steps = activeTab === "hiring" ? hiringSteps : workingSteps

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <h2 className="text-3xl lg:text-4xl font-bold text-(--upwork-navy) text-center mb-8">
          How it works
        </h2>

        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-(--upwork-light-gray) rounded-full p-1">
            <button
              onClick={() => setActiveTab("hiring")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === "hiring"
                  ? "bg-(--upwork-navy) text-white"
                  : "text-(--upwork-navy) hover:text-(--upwork-green)"
              }`}
            >
              For hiring
            </button>
            <button
              onClick={() => setActiveTab("working")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === "working"
                  ? "bg-(--upwork-navy) text-white"
                  : "text-(--upwork-navy) hover:text-(--upwork-green)"
              }`}
            >
              For finding work
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-12 md:gap-0 mt-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="flex flex-col md:flex-row items-center md:items-start w-full md:w-auto">
                <div className="flex flex-col items-center text-center flex-1 max-w-70 px-4">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full bg-(--upwork-light-gray) flex items-center justify-center">
                      <Icon className="w-10 h-10 text-(--upwork-green)" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-7 h-7 bg-(--upwork-green) text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-(--upwork-navy) mb-3">
                    {step.title}
                  </h3>
                  <p className="text-(--upwork-gray) mb-4">
                    {step.description}
                  </p>
                  {step.cta && (
                    <button className="flex items-center gap-1 text-(--upwork-green) font-medium hover:underline">
                      {step.cta}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden md:block flex-1 min-w-10 max-w-20 h-0.5 bg-[#C0DD97] mt-12 mx-2" />
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-16 p-8 bg-(--upwork-light-gray) rounded-2xl text-center">
          <h3 className="text-xl font-bold text-(--upwork-navy) mb-2">
            {activeTab === "hiring" 
              ? "Get a free AI-powered quote" 
              : "Ready to find local jobs?"}
          </h3>
          <p className="text-(--upwork-gray) mb-6 max-w-2xl mx-auto">
            {activeTab === "hiring"
              ? "Describe your job, upload photos, and our AI will calculate an instant, fair price for your specific needs."
              : "Join thousands of tradies on Fixes getting paid for the work they do best."}
          </p>
          <Link 
            href={activeTab === "hiring" ? "/post-job" : "/register"}
            className="inline-flex items-center gap-2 px-6 py-3 bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white font-medium rounded-full transition-colors"
          >
            {activeTab === "hiring" ? "Get a Quote" : "Sign Up as a Tradie"}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
