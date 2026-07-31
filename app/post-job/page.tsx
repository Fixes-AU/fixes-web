// fixes-web/app/post-job/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { PostJobWizard } from '@/components/upwork/PostJobWizard'
import { parseFragmentState } from '@/lib/fragmentState'

export default function PostJobPage() {
  const [fragment, setFragment] = useState<string | null>(null)

  useEffect(() => {
    const syncFragment = () => setFragment(window.location.hash)

    syncFragment()
    window.addEventListener('hashchange', syncFragment)
    return () => window.removeEventListener('hashchange', syncFragment)
  }, [])

  if (fragment === null) {
    return <div className="min-h-screen bg-linear-to-br from-white via-[#f2f7f2] to-white" />
  }

  const fragmentParams = parseFragmentState(fragment)
  const searchQuery = fragmentParams.get('q') || ''
  const preselectedCategory = fragmentParams.get('category') || ''
  const jobId = fragmentParams.get('jobId') || ''

  return (
    <PostJobWizard
      key={fragment}
      searchQuery={searchQuery}
      preselectedCategory={preselectedCategory}
      existingJobId={jobId}
    />
  )
}
