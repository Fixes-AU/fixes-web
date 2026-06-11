import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-16 lg:py-24 bg-(--upwork-navy)">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
          Find trusted tradies for your next project
        </h2>
        <Link href="/post-job">
          <Button
            size="lg"
            className="bg-white text-(--upwork-navy) hover:bg-gray-100 rounded-full px-8 py-6 text-base font-semibold"
          >
            Post a Job
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>
    </section>
  )
}
