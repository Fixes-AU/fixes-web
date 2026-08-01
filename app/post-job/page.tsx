// fixes-web/app/post-job/page.tsx

'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import { PostJobWizard } from '@/components/upwork/PostJobWizard'
import { parseFragmentState } from '@/lib/fragmentState'

function subscribeToHashChange(onStoreChange: () => void) {
  window.addEventListener('hashchange', onStoreChange)
  return () => window.removeEventListener('hashchange', onStoreChange)
}

function getHash() {
  return window.location.hash
}

function getServerHash() {
  return ''
}

export default function PostJobPage() {
  const fragment = useSyncExternalStore(subscribeToHashChange, getHash, getServerHash)
  const fragmentParams = parseFragmentState(fragment)
  const searchQuery = fragmentParams.get('q') || ''
  const preselectedCategory = fragmentParams.get('category') || ''
  const jobId = fragmentParams.get('jobId') || ''

  return (
    <>
      <PostJobWizard
        key={fragment}
        searchQuery={searchQuery}
        preselectedCategory={preselectedCategory}
        existingJobId={jobId}
      />
      <section aria-labelledby="post-job-guide" className="bg-[#f6f8f5] px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="post-job-guide" className="text-2xl font-bold text-(--upwork-navy) sm:text-3xl">
              Post your job with clarity and confidence
            </h2>
            <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
              Fixes turns the details you provide into a clear job request that suitable local tradies can understand quickly.
              Add the trade, scope, timing, location, and supporting photos so the right professional has useful information
              before accepting the work.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="font-semibold text-(--upwork-navy)">Describe what needs fixing</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Choose the closest service category and explain the problem in your own words. Photos, access details, and
                preferred timing help tradies assess the task and arrive better prepared.
              </p>
            </article>
            <article className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="font-semibold text-(--upwork-navy)">Review the quote and scope</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Fixes uses the information supplied to support fast, transparent quoting. Review the proposed scope, price,
                schedule, and any diagnostic questions before you confirm the job.
              </p>
            </article>
            <article className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="font-semibold text-(--upwork-navy)">Stay informed from start to finish</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Track job progress, keep important details together, and use secure platform payments. If plans change, the
                recorded job scope gives you and the tradie a shared reference point.
              </p>
            </article>
          </div>

          <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-6 text-gray-600">
            Not sure which trade to choose? Browse the <Link href="/categories" className="font-semibold text-(--upwork-green) hover:underline">service categories</Link> or
            read <Link href="/how-fixes-works" className="font-semibold text-(--upwork-green) hover:underline">how Fixes works</Link> before posting.
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-center text-sm leading-6 text-gray-600">
            For urgent or potentially unsafe work, describe the immediate risk and avoid attempting repairs outside your
            experience. Clear safety and access information helps the responding professional plan the right first step.
          </p>
        </div>
      </section>
      <footer className="border-t border-gray-200 bg-white px-4 py-5">
        <nav
          aria-label="Related Fixes pages"
          className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm"
        >
          <Link href="/categories" className="text-gray-600 transition-colors hover:text-(--upwork-green)">
            Browse services
          </Link>
          <Link href="/how-fixes-works" className="text-gray-600 transition-colors hover:text-(--upwork-green)">
            How Fixes works
          </Link>
          <Link href="/safety" className="text-gray-600 transition-colors hover:text-(--upwork-green)">
            Safety and trust
          </Link>
          <Link href="/support" className="text-gray-600 transition-colors hover:text-(--upwork-green)">
            Help centre
          </Link>
        </nav>
      </footer>
    </>
  )
}
