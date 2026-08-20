'use client'

import { ShieldAlert } from 'lucide-react'

export default function AdminNoAccessPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
        <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h1 className="text-xl font-bold text-gray-900">No admin workspace assigned</h1>
        <p className="text-sm text-gray-600 mt-2">
          Your account is active but currently has no panel capability. Contact a super admin to assign the appropriate workspace and permissions.
        </p>
      </div>
    </main>
  )
}
