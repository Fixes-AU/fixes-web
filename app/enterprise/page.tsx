import { Header, Footer } from "@/components/upwork"
import Link from "next/link"
import { Button } from "@/components/ui/button"
 
export default function EnterprisePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7f2]">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 lg:p-16 rounded-3xl shadow-sm border border-[#dde8d4]">
          <h1 className="text-4xl lg:text-5xl font-bold text-(--upwork-navy) mb-6">
            Fixes Enterprise
          </h1>
          <p className="text-xl text-(--upwork-navy) mb-12 max-w-2xl mx-auto">
            The all-in-one solution for property managers, facility management companies, and large trade agencies.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-8 lg:gap-12 text-left mb-16">
            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-xl text-(--upwork-navy)">Multi-site Management</h3>
              <p className="text-(--upwork-gray) leading-relaxed">Manage hundreds of properties, dispatch cleaners, and track maintenance operations from a single centralized dashboard.</p>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-xl text-(--upwork-navy)">Centralized Billing</h3>
              <p className="text-(--upwork-gray) leading-relaxed">Access consolidated monthly invoices, handle bulk payment processing, and implement custom corporate spending controls.</p>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-xl text-(--upwork-navy)">Priority Dispatch</h3>
              <p className="text-(--upwork-gray) leading-relaxed">Instantly connect with our top 1% of vetted, highly-rated tradies for emergency commercial repairs and ongoing contracts.</p>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-xl text-(--upwork-navy)">Custom Analytics</h3>
              <p className="text-(--upwork-gray) leading-relaxed">Generate comprehensive AI-driven reports on response times, repair costs, and asset lifecycle tracking to optimize budgets.</p>
            </div>
          </div>

          <div className="bg-[#f4f9ef] border-2 border-(--upwork-green) rounded-2xl p-8 mb-10 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-(--upwork-green) mb-4">Panel Under Development</h2>
            <p className="text-(--upwork-navy) text-lg">
              The dedicated enterprise panel for agencies and companies is currently under active development. 
              In the meantime, you can create a standard business account to start posting and tracking jobs immediately.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register?plan=business">
              <Button className="bg-(--upwork-green) hover:bg-(--upwork-green-dark) text-white rounded-full px-8 py-6 text-lg font-semibold w-full sm:w-auto">
                Create business account
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="rounded-full px-8 py-6 text-lg font-semibold border-gray-300 text-(--upwork-navy) hover:bg-gray-50 w-full sm:w-auto">
                Back to home
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
