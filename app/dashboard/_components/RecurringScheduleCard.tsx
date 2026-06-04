'use client'

import { useState } from 'react'
import { Repeat, Calendar, Loader2, Pause, Play, XCircle } from 'lucide-react'
import { api } from '@/lib/api'

interface RecurringJob {
  _id: string
  status: string
  scheduledFor?: string
  jobCode?: string
}

interface RecurringSchedule {
  _id: string
  frequency: 'weekly' | 'fortnightly'
  dayOfWeek: number
  preferredTime: string
  totalInstances: number
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  assignPreference: 'same_cleaner' | 'any_cleaner'
  startDate: string
  endDate: string
  jobs: RecurringJob[]
}

interface RecurringScheduleCardProps {
  schedule: RecurringSchedule
  onUpdate?: () => void
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function RecurringScheduleCard({ schedule, onUpdate }: RecurringScheduleCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const completedJobs = schedule.jobs.filter((j) => j.status === 'completed').length
  const totalJobs = schedule.totalInstances

  const handleAction = async (action: 'pause' | 'resume' | 'cancel') => {
    setIsUpdating(true)
    try {
      const newStatus = action === 'pause' ? 'paused' : action === 'resume' ? 'active' : 'cancelled'
      await api.patch(`/api/cleaning/recurring/${schedule._id}`, { status: newStatus })
      onUpdate?.()
    } catch {
    } finally {
      setIsUpdating(false)
    }
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-50 text-green-700 border-green-200',
    paused: 'bg-amber-50 text-amber-700 border-amber-200',
    completed: 'bg-gray-50 text-gray-500 border-gray-200',
    cancelled: 'bg-red-50 text-red-500 border-red-200',
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--upwork-navy)] flex items-center gap-1.5">
          <Repeat className="w-4 h-4 text-gray-400" />
          Recurring Schedule
        </h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${statusColors[schedule.status] || statusColors.active}`}>
          {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--upwork-gray)]">Frequency</span>
          <span className="font-medium text-[var(--upwork-navy)] capitalize">{schedule.frequency}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--upwork-gray)]">Day</span>
          <span className="font-medium text-[var(--upwork-navy)]">{DAYS[schedule.dayOfWeek]}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--upwork-gray)]">Time</span>
          <span className="font-medium text-[var(--upwork-navy)]">{schedule.preferredTime}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--upwork-gray)]">Progress</span>
          <span className="font-medium text-[var(--upwork-navy)]">{completedJobs}/{totalJobs} sessions</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--upwork-gray)]">Cleaner</span>
          <span className="font-medium text-[var(--upwork-navy)]">
            {schedule.assignPreference === 'same_cleaner' ? 'Same cleaner' : 'Any available'}
          </span>
        </div>
      </div>

      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-[var(--upwork-green)] rounded-full transition-all"
          style={{ width: `${totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0}%` }}
        />
      </div>

      {schedule.jobs.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-[var(--upwork-navy)] mb-2">Upcoming Sessions</p>
          <div className="space-y-1.5">
            {schedule.jobs
              .filter((j) => j.status !== 'completed' && j.status !== 'cancelled')
              .slice(0, 3)
              .map((j) => (
                <div key={j._id} className="flex items-center gap-2 text-xs">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-[var(--upwork-gray)]">
                    {j.scheduledFor
                      ? new Date(j.scheduledFor).toLocaleDateString('en-AU', {
                          weekday: 'short', day: 'numeric', month: 'short',
                        })
                      : 'TBD'}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
                    {j.status}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {schedule.status === 'active' && (
        <div className="flex gap-2">
          <button
            onClick={() => handleAction('pause')}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs font-medium hover:bg-amber-100 transition-colors disabled:opacity-50"
          >
            {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Pause className="w-3 h-3" />}
            Pause
          </button>
          <button
            onClick={() => handleAction('cancel')}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
            Cancel
          </button>
        </div>
      )}

      {schedule.status === 'paused' && (
        <button
          onClick={() => handleAction('resume')}
          disabled={isUpdating}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-green-200 bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
        >
          {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
          Resume Schedule
        </button>
      )}
    </div>
  )
}
