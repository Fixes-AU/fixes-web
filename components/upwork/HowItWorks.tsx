"use client"

import { useState } from "react"
import Image from "next/image"
import { WorkflowIcon, type WorkflowIconName } from "./WorkflowIcon"

type Step = {
  icon: WorkflowIconName
  shortTitle: string
  title: string
  description: string
  image: string
  imageAlt: string
}

const hiringSteps: Step[] = [
  {
    icon: "post",
    shortTitle: "Post your job",
    title: "Post your job",
    description: "Add details, timing and photos so tradies know exactly what's needed.",
    image: "/home-page-assets/redesign/hiring-post-job.webp",
    imageAlt: "Fixes tradie checking a new job on his phone",
  },
  {
    icon: "connect",
    shortTitle: "Connected Tradie",
    title: "Get connected to a top-rated tradie",
    description: "Add details, timing and photos so tradies know exactly what's needed.",
    image: "/home-page-assets/redesign/hiring-connected-tradie.webp",
    imageAlt: "Team of Fixes professionals ready to help",
  },
  {
    icon: "done",
    shortTitle: "Job Done",
    title: "Get your job done",
    description: "Your tradie gets to work and you pay only when the job is complete.",
    image: "/home-page-assets/redesign/hiring-job-done.webp",
    imageAlt: "Fixes tradie greeting a customer after completing a job",
  },
]

const workingSteps: Step[] = [
  {
    icon: "wifi",
    shortTitle: "Go online",
    title: "Go online",
    description: "Create your profile and go online to let customers know you're available.",
    image: "/home-page-assets/redesign/work-go-online.webp",
    imageAlt: "Fixes tradie setting his availability from his phone",
  },
  {
    icon: "mail",
    shortTitle: "Receive nearby jobs",
    title: "Receive nearby jobs",
    description: "Get notified of local jobs that match your trade and skills instantly.",
    image: "/home-page-assets/redesign/work-nearby-jobs.webp",
    imageAlt: "Fixes tradie receiving a nearby job notification",
  },
  {
    icon: "payment",
    shortTitle: "Get paid as you deliver",
    title: "Get paid as you deliver",
    description: "Complete the work and receive payment securely once the job is done.",
    image: "/home-page-assets/redesign/work-get-paid.webp",
    imageAlt: "Fixes tradie greeting a satisfied customer",
  },
]

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState<"hiring" | "working">("hiring")
  const steps = activeTab === "hiring" ? hiringSteps : workingSteps

  return (
    <section className="bg-white py-15 font-manrope lg:py-20">
      <div className="mx-auto max-w-320 px-5 sm:px-8 lg:px-0">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[32px] font-semibold leading-11 tracking-[-0.04em] text-black lg:text-[40px] lg:leading-13.75">
            How It Works
          </h2>
          <div className="inline-flex w-full max-w-83.5 items-center rounded-full bg-[#F5F5F5] p-1" role="tablist" aria-label="How Fixes works">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "hiring"}
              onClick={() => setActiveTab("hiring")}
              className={`h-12 flex-1 rounded-full px-4 text-sm font-medium transition sm:text-base ${activeTab === "hiring" ? "bg-[#031C19] text-white" : "text-black hover:bg-black/5"}`}
            >
              For Hiring
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "working"}
              onClick={() => setActiveTab("working")}
              className={`h-12 flex-1 rounded-full px-4 text-sm font-medium transition sm:text-base ${activeTab === "working" ? "bg-[#031C19] text-white" : "text-black hover:bg-black/5"}`}
            >
              For Finding Work
            </button>
          </div>
        </div>

        <div className="mt-11 flex items-start px-1 sm:px-6 lg:mt-14 lg:px-22">
          {steps.map((step, index) => {
            return (
              <div key={`${activeTab}-${step.title}`} className="contents">
                <div className="flex w-20 shrink-0 flex-col items-center text-center sm:w-32 lg:w-45">
                  <span className="flex size-12 items-center justify-center rounded-full bg-[#08544B] text-[#AFFF43] sm:size-16 lg:size-18.75">
                    <WorkflowIcon name={step.icon} className="size-5 text-[#AFFF43] sm:size-7 lg:size-8" />
                  </span>
                  <span className="mt-2.5 text-[10px] font-bold leading-4 text-[#031C19] sm:text-xs lg:text-[17px] lg:leading-6">
                    {step.shortTitle}
                  </span>
                </div>
                {index < steps.length - 1 && <span className="mt-6 h-1.5 min-w-5 flex-1 rounded-full bg-[#08544B] sm:mt-8 lg:mt-9" />}
              </div>
            )
          })}
        </div>

        <div className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0">
          {steps.map((step, index) => (
            <article
              key={`${activeTab}-${step.title}-card`}
              className="w-[calc(100vw-56px)] max-w-102.5 shrink-0 snap-start rounded-[24px] bg-[#F6F6F6] p-4 sm:w-[72vw] sm:p-5 lg:w-auto lg:max-w-none lg:rounded-[29px] lg:p-6"
            >
              <div className="relative">
                <div className="relative aspect-365/235 overflow-hidden rounded-[17px]">
                  <Image src={step.image} alt={step.imageAlt} fill sizes="(max-width: 1023px) 82vw, 365px" className="object-cover" />
                </div>
                <span className="absolute -bottom-7 right-5 flex size-16 items-center justify-center rounded-full border-4 border-[#F6F6F6] bg-[#08544B] text-xl font-semibold text-white lg:size-17.5 lg:text-2xl">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="min-h-37 pt-12">
                <h3 className="text-xl font-bold leading-7 text-[#031C19] lg:text-2xl lg:leading-8">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-5 text-[#616161] lg:text-[17px] lg:leading-5.5">
                  {step.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
