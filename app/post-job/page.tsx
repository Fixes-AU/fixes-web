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
