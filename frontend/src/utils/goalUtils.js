export const GOALS_STORAGE_KEY = 'lifesync_goals'
export const GOAL_CATEGORIES = [
  'Personal',
  'Education',
  'Career',
  'Health',
  'Fitness',
  'Finance',
  'Other',
]
export const GOAL_STATUSES = [
  'Not Started',
  'In Progress',
  'Completed',
  'Overdue',
]

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
 * Clamps a numeric progress value cleanly between 0 and 100.
 */
export function clampProgress(value) {
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return 0
  return Math.max(0, Math.min(100, Math.round(numeric)))
}

/**
 * Normalizes goal categories (mapping legacy 'Study' to 'Education').
 */
export function normalizeGoalCategory(category) {
  if (category === 'Study') return 'Education'
  return GOAL_CATEGORIES.includes(category) ? category : 'Other'
}

/**
 * Derives goal status automatically from progress and target completion date.
 */
export function getGoalStatus(
  progress,
  targetDate = '',
  referenceDate = getTodayDateString(),
) {
  const value = clampProgress(progress)
  if (value === 100) return 'Completed'
  if (targetDate && targetDate < referenceDate) return 'Overdue'
  if (value === 0) return 'Not Started'
  return 'In Progress'
}

/**
 * Normalizes a goal record so category, progress, and derived status always stay in sync.
 */
export function normalizeGoal(goal, referenceDate = getTodayDateString()) {
  const progress = clampProgress(goal.progress)
  const category = normalizeGoalCategory(goal.category)
  return {
    ...goal,
    category,
    progress,
    status: getGoalStatus(progress, goal.targetDate, referenceDate),
  }
}

/**
 * Loads saved goals from browser localStorage, falling back to fallbackGoals.
 */
export function loadGoalsFromStorage(
  fallbackGoals,
  storage = globalThis.localStorage,
  referenceDate = getTodayDateString(),
) {
  if (!storage) {
    return fallbackGoals.map((goal) => normalizeGoal(goal, referenceDate))
  }

  try {
    const raw = storage.getItem(GOALS_STORAGE_KEY)
    if (!raw) {
      return fallbackGoals.map((goal) => normalizeGoal(goal, referenceDate))
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.map((goal) => normalizeGoal(goal, referenceDate))
      : fallbackGoals.map((goal) => normalizeGoal(goal, referenceDate))
  } catch {
    return fallbackGoals.map((goal) => normalizeGoal(goal, referenceDate))
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
 * Computes Goal Dashboard summary counts and overall goal progress percentage.
 */
export function getGoalSummary(goals, referenceDate = getTodayDateString()) {
  const summary = goals.reduce(
    (acc, goal) => {
      acc.total += 1
      const progress = clampProgress(goal.progress)
      acc.progressSum += progress

      const status = getGoalStatus(progress, goal.targetDate, referenceDate)
      if (status === 'Completed') {
        acc.completed += 1
      } else {
        acc.active += 1
        if (status === 'Overdue') acc.overdue += 1
        else if (status === 'In Progress') acc.inProgress += 1
        else acc.notStarted += 1
      }
      return acc
    },
    {
      total: 0,
      completed: 0,
      active: 0,
      overdue: 0,
      inProgress: 0,
      notStarted: 0,
      progressSum: 0,
    },
  )

  const overallProgress =
    summary.total === 0 ? 0 : Math.round(summary.progressSum / summary.total)

  return {
    total: summary.total,
    completed: summary.completed,
    active: summary.active,
    overdue: summary.overdue,
    inProgress: summary.inProgress,
    notStarted: summary.notStarted,
    overallProgress,
  }
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
 * Filters goals by search query (title), category, and derived status (including Overdue).
 */
export function filterGoals(
  goals,
  { searchQuery = '', categoryFilter = 'All', statusFilter = 'All' },
  referenceDate = getTodayDateString(),
) {
  const normalizedQuery = searchQuery.trim().toLowerCase()

  return goals.filter((goal) => {
    const matchesSearch =
      !normalizedQuery || goal.title.toLowerCase().includes(normalizedQuery)

    const category = normalizeGoalCategory(goal.category)
    const matchesCategory =
      categoryFilter === 'All' || category === categoryFilter

    const status = getGoalStatus(goal.progress, goal.targetDate, referenceDate)
    const matchesStatus = statusFilter === 'All' || status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })
}

/**
 * Sorts goals by target completion date ('earliest', 'latest', or 'default').
 * Goals without a target date are placed after dated goals.
 */
export function sortGoalsByTargetDate(goals, sortOrder = 'default') {
  if (sortOrder !== 'earliest' && sortOrder !== 'latest') {
    return goals
  }

  return [...goals].sort((a, b) => {
    const hasA = Boolean(a.targetDate)
    const hasB = Boolean(b.targetDate)

    if (!hasA && !hasB) return 0
    if (!hasA) return 1
    if (!hasB) return -1

    return sortOrder === 'earliest'
      ? a.targetDate.localeCompare(b.targetDate)
      : b.targetDate.localeCompare(a.targetDate)
  })
}
