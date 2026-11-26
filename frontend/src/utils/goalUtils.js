export const GOALS_STORAGE_KEY = 'lifesync_goals'
export const GOAL_CATEGORIES = ['Study', 'Career', 'Health', 'Personal']
export const GOAL_STATUSES = ['Not Started', 'In Progress', 'Completed']

/**
 * Clamps a numeric progress value cleanly between 0 and 100.
 */
export function clampProgress(value) {
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return 0
  return Math.max(0, Math.min(100, Math.round(numeric)))
}

/**
 * Derives goal status automatically from progress percentage.
 */
export function getGoalStatus(progress) {
  const value = clampProgress(progress)
  if (value === 0) return 'Not Started'
  if (value === 100) return 'Completed'
  return 'In Progress'
}

/**
 * Normalizes a goal record so progress and status always stay in sync.
 */
export function normalizeGoal(goal) {
  const progress = clampProgress(goal.progress)
  return {
    ...goal,
    progress,
    status: getGoalStatus(progress),
  }
}

/**
 * Loads saved goals from browser localStorage, falling back to fallbackGoals.
 */
export function loadGoalsFromStorage(
  fallbackGoals,
  storage = globalThis.localStorage,
) {
  if (!storage) return fallbackGoals.map(normalizeGoal)

  try {
    const raw = storage.getItem(GOALS_STORAGE_KEY)
    if (!raw) return fallbackGoals.map(normalizeGoal)

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.map(normalizeGoal)
      : fallbackGoals.map(normalizeGoal)
  } catch {
    return fallbackGoals.map(normalizeGoal)
  }
}

/**
 * Persists the current goals array to browser localStorage.
 */
export function saveGoalsToStorage(goals, storage = globalThis.localStorage) {
  if (!storage) return

  try {
    storage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals))
  } catch {
    // Ignore storage quota or private-browsing errors silently.
  }
}

/**
 * Computes Goal Dashboard summary counts.
 */
export function getGoalSummary(goals) {
  return goals.reduce(
    (summary, goal) => {
      summary.total += 1
      const status = getGoalStatus(goal.progress)
      if (status === 'Completed') summary.completed += 1
      else if (status === 'In Progress') summary.inProgress += 1
      else summary.notStarted += 1
      return summary
    },
    { total: 0, completed: 0, inProgress: 0, notStarted: 0 },
  )
}

/**
 * Formats an ISO date string (YYYY-MM-DD) for readable display.
 */
export function formatGoalDate(dateString) {
  if (!dateString) return 'Not set'

  const parsed = new Date(`${dateString}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return dateString

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Returns local YYYY-MM-DD string for today's date.
 */
export function getTodayDateString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Computes deadline status (overdue, upcoming within 7 days, or normal).
 */
export function getDeadlineInfo(
  targetDate,
  progress,
  referenceDate = getTodayDateString(),
) {
  if (!targetDate) {
    return { state: 'none', badgeText: 'No deadline', daysLeft: null }
  }

  const target = new Date(`${targetDate}T00:00:00`)
  const today = new Date(`${referenceDate}T00:00:00`)
  if (Number.isNaN(target.getTime()) || Number.isNaN(today.getTime())) {
    return { state: 'normal', badgeText: targetDate, daysLeft: null }
  }

  const msPerDay = 24 * 60 * 60 * 1000
  const daysLeft = Math.round((target.getTime() - today.getTime()) / msPerDay)

  if (clampProgress(progress) >= 100) {
    return { state: 'completed', badgeText: 'Completed', daysLeft }
  }

  if (daysLeft < 0) {
    const overdueDays = Math.abs(daysLeft)
    return {
      state: 'overdue',
      badgeText: `Overdue by ${overdueDays} ${overdueDays === 1 ? 'day' : 'days'}`,
      daysLeft,
    }
  }

  if (daysLeft === 0) {
    return { state: 'upcoming', badgeText: 'Due today', daysLeft }
  }

  if (daysLeft <= 7) {
    return {
      state: 'upcoming',
      badgeText: `Due in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`,
      daysLeft,
    }
  }

  return { state: 'normal', badgeText: formatGoalDate(targetDate), daysLeft }
}

/**
 * Filters goals by search query (title), category, and derived status.
 */
export function filterGoals(
  goals,
  { searchQuery = '', categoryFilter = 'All', statusFilter = 'All' },
) {
  const normalizedQuery = searchQuery.trim().toLowerCase()

  return goals.filter((goal) => {
    const matchesSearch =
      !normalizedQuery || goal.title.toLowerCase().includes(normalizedQuery)

    const matchesCategory =
      categoryFilter === 'All' || goal.category === categoryFilter

    const status = getGoalStatus(goal.progress)
    const matchesStatus = statusFilter === 'All' || status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })
}
