/** Group flat Job.cleaningTasks (with isSubtask) for client/tradie UI. */

export interface FlatCleaningTask {
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed'
  photos?: { url: string; publicId?: string; uploadedAt?: string }[]
  completedAt?: string | null
  order?: number
  isSubtask?: boolean
  parentTask?: string | null
  subtasks?: { title: string; status?: string }[]
}

export interface GroupedCleaningTask {
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed'
  photos?: FlatCleaningTask['photos']
  completedAt?: string | null
  order: number
  subtasks: { title: string; status?: string }[]
}

export function groupCleaningTasksForDisplay(tasks: FlatCleaningTask[]): GroupedCleaningTask[] {
  if (!tasks?.length) return []

  const hasSubtaskFlags = tasks.some((t) => t.isSubtask)
  if (!hasSubtaskFlags) {
    return tasks
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((t, i) => ({
        title: t.title,
        description: t.description,
        status: t.status,
        photos: t.photos,
        completedAt: t.completedAt,
        order: t.order ?? i,
        subtasks: (t.subtasks || []).map((s) => ({
          title: typeof s === 'string' ? s : s.title,
          status: typeof s === 'string' ? undefined : s.status,
        })),
      }))
  }

  const mains = tasks.filter((t) => !t.isSubtask).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  return mains.map((main, i) => ({
    title: main.title,
    description: main.description,
    status: main.status,
    photos: main.photos,
    completedAt: main.completedAt,
    order: main.order ?? i,
    subtasks: tasks
      .filter((t) => t.isSubtask && t.parentTask === main.title)
      .map((s) => ({ title: s.title, status: s.status })),
  }))
}

export function countMainCleaningTasks(tasks: FlatCleaningTask[]) {
  const groups = groupCleaningTasksForDisplay(tasks)
  const completed = groups.filter((g) => g.status === 'completed').length
  return { completed, total: groups.length }
}
