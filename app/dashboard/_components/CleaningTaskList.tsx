'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import {
  Check,
  Loader2,
  Camera,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import {
  countMainCleaningTasks,
  groupCleaningTasksForDisplay,
  type FlatCleaningTask,
} from '@/lib/cleaningTasks'

interface CleaningTaskListProps {
  tasks: FlatCleaningTask[]
  jobStatus: string
}

export default function CleaningTaskList({ tasks, jobStatus }: CleaningTaskListProps) {
  const groupedTasks = useMemo(() => groupCleaningTasksForDisplay(tasks), [tasks])
  const { completed: completedCount, total: totalCount } = useMemo(
    () => countMainCleaningTasks(tasks),
    [tasks]
  )
  const [expandedTask, setExpandedTask] = useState<number | null>(null)

  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-white" />
      case 'in_progress':
        return <Loader2 className="w-4 h-4 text-white animate-spin" />
      default:
        return <span className="w-2 h-2 rounded-full bg-white" />
    }
  }

  const statusBg = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'in_progress':
        return 'bg-blue-500'
      default:
        return 'bg-gray-300'
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'in_progress':
        return 'In Progress'
      default:
        return 'Pending'
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--upwork-navy)] flex items-center gap-1.5">
          <Check className="w-4 h-4 text-gray-400" />
          Task Progress
        </h3>
        <span className="text-xs font-medium text-[var(--upwork-gray)]">
          {completedCount}/{totalCount} tasks completed
        </span>
      </div>

      <div className="w-full h-2 bg-gray-100 rounded-full mb-5 overflow-hidden">
        <div
          className="h-full bg-[var(--upwork-green)] rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="space-y-2">
        {groupedTasks.map((task, idx) => {
          const isExpanded = expandedTask === idx
          const hasPhotos = task.photos && task.photos.length > 0
          const hasSubtasks = task.subtasks.length > 0
          const canExpand = hasSubtasks || hasPhotos

          return (
            <div key={`${task.title}-${idx}`} className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => canExpand && setExpandedTask(isExpanded ? null : idx)}
                className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${canExpand ? 'hover:bg-gray-50' : ''}`}
                disabled={!canExpand}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${statusBg(task.status)}`}>
                  {statusIcon(task.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-[var(--upwork-navy)]'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      task.status === 'completed'
                        ? 'bg-green-50 text-green-700'
                        : task.status === 'in_progress'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-gray-50 text-gray-500'
                    }`}>
                      {statusLabel(task.status)}
                    </span>
                    {hasSubtasks && (
                      <span className="text-xs text-gray-400">
                        {task.subtasks.filter((s) => s.status === 'completed').length}/{task.subtasks.length} subtasks
                      </span>
                    )}
                    {hasPhotos && (
                      <span className="flex items-center gap-0.5 text-xs text-gray-400">
                        <Camera className="w-3 h-3" />
                        {task.photos!.length}
                      </span>
                    )}
                  </div>
                </div>
                {canExpand && (
                  isExpanded
                    ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 px-3 py-3 bg-gray-50/50">
                  {task.description && (
                    <p className="text-xs text-[var(--upwork-gray)] mb-3">{task.description}</p>
                  )}

                  {hasSubtasks && (
                    <div className="space-y-1.5 mb-3">
                      {task.subtasks.map((sub, si) => (
                        <div key={si} className="flex items-center gap-2 pl-2">
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                            sub.status === 'completed'
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300'
                          }`}>
                            {sub.status === 'completed' && <Check className="w-2 h-2 text-white" />}
                          </div>
                          <span className={`text-xs ${sub.status === 'completed' ? 'text-gray-400 line-through' : 'text-[var(--upwork-navy)]'}`}>
                            {sub.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {hasPhotos && (
                    <div>
                      <p className="text-xs font-medium text-[var(--upwork-navy)] mb-2">Task Photos</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {task.photos!.map((photo, pi) => (
                          <a
                            key={pi}
                            href={photo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aspect-square rounded-lg overflow-hidden relative block group"
                          >
                            <Image
                              src={photo.url}
                              alt={`Task photo ${pi + 1}`}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                              sizes="120px"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {task.completedAt && (
                    <p className="text-xs text-gray-400 mt-2">
                      Completed {new Date(task.completedAt).toLocaleString('en-AU', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {jobStatus === 'in_progress' && completedCount < totalCount && (
        <p className="text-xs text-[var(--upwork-gray)] mt-4 text-center">
          Your cleaner is working through the tasks. Expand a task to see subtasks and photos.
        </p>
      )}
    </div>
  )
}
