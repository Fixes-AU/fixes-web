import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Post a Job | Fixes",
  description: "Describe your project, get an instant AI-powered quote, and connect with verified local tradies in minutes. Free to post — pay only when the job is done.",
}

export default function PostJobLayout({ children }: { children: React.ReactNode }) {
  return children
}
