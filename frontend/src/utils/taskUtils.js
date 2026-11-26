export const TASKS_STORAGE_KEY = 'lifesync_tasks'

/**
 * Loads saved tasks from browser localStorage, falling back to fallbackTasks.
 */
export function loadTasksFromStorage(fallbackTasks, storage = globalThis.localStorage) {
  if (!storage) return fallbackTasks

  try {
    const raw = storage.getItem(TASKS_STORAGE_KEY)
    if (!raw) return fallbackTasks

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : fallbackTasks
  } catch {
    return fallbackTasks
  }
}

/**
 * Persists the current tasks array to browser localStorage.
 */
export function saveTasksToStorage(tasks, storage = globalThis.localStorage) {
  if (!storage) return

  try {
    storage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
  } catch {
    // Ignore storage quota or private-browsing errors silently.
  }
}

/**
 * Filters tasks by search text (title), completion status, and priority.
 */
export function filterTasks(tasks, { searchQuery = '', statusFilter = 'All', priorityFilter = 'All' }) {
  const normalizedQuery = searchQuery.trim().toLowerCase()

  return tasks.filter((task) => {
    const matchesSearch =
      !normalizedQuery || task.title.toLowerCase().includes(normalizedQuery)

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Completed' && task.completed) ||
      (statusFilter === 'Pending' && !task.completed)

    const matchesPriority =
      priorityFilter === 'All' || task.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into a readable short date.
 */
export function formatDueDate(dueDate) {
  if (!dueDate) return 'No due date'

  const parsed = new Date(`${dueDate}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return dueDate

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
