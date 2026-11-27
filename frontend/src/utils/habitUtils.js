import { getTodayDateString } from './goalUtils.js'

export const HABITS_STORAGE_KEY = 'lifesync_habits'
export const HABIT_CATEGORIES = [
  'Health',
  'Learning',
  'Mindfulness',
  'Productivity',
  'Personal',
]

/**
 * Formats a Date object as YYYY-MM-DD in local time.
 */
export function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Returns an array of YYYY-MM-DD strings for the last N days ending on referenceDate.
 */
export function getPastDateKeys(days = 7, referenceDate = getTodayDateString()) {
  const anchor = new Date(`${referenceDate}T00:00:00`)
  if (Number.isNaN(anchor.getTime())) return [referenceDate]

  const result = []
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const current = new Date(anchor)
    current.setDate(anchor.getDate() - offset)
    result.push(toDateKey(current))
  }
  return result
}

/**
 * Returns the 7 YYYY-MM-DD dates (Monday through Sunday) for the week containing referenceDate.
 */
export function getCurrentWeekDates(referenceDate = getTodayDateString()) {
  const anchor = new Date(`${referenceDate}T00:00:00`)
  if (Number.isNaN(anchor.getTime())) return []

  const dayOfWeek = anchor.getDay() // 0 = Sun, 1 = Mon, ...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(anchor)
  monday.setDate(anchor.getDate() + diffToMonday)

  const week = []
  for (let i = 0; i < 7; i += 1) {
    const current = new Date(monday)
    current.setDate(monday.getDate() + i)
    week.push({
      dateKey: toDateKey(current),
      shortLabel: current.toLocaleDateString('en-US', { weekday: 'short' }),
    })
  }
  return week
}

/**
 * Calculates consecutive completed days ending on referenceDate (or yesterday if today is not yet logged).
 */
export function calculateConsecutiveStreak(
  completedDates = [],
  referenceDate = getTodayDateString(),
) {
  const dateSet = new Set(completedDates)
  const anchor = new Date(`${referenceDate}T00:00:00`)
  if (Number.isNaN(anchor.getTime())) return 0

  // Start counting from today if checked in today; otherwise start from yesterday so
  // an active streak isn't wiped before today's check-in.
  const cursor = new Date(anchor)
  if (!dateSet.has(referenceDate)) {
    cursor.setDate(cursor.getDate() - 1)
  }

  let streak = 0
  while (dateSet.has(toDateKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

/**
 * Normalizes a habit record so completedDates, weeklyLog, completed (today), and streak stay synced.
 */
export function normalizeHabit(habit, referenceDate = getTodayDateString()) {
  const dateSet = new Set(
    Array.isArray(habit.completedDates) ? habit.completedDates : [],
  )

  if (habit.weeklyLog && typeof habit.weeklyLog === 'object') {
    for (const [dateKey, isDone] of Object.entries(habit.weeklyLog)) {
      if (isDone) dateSet.add(dateKey)
    }
  }

  if (habit.completed && !habit.weeklyLog && !habit.completedDates) {
    dateSet.add(referenceDate)
  }

  const completedDates = Array.from(dateSet).sort()
  const weeklyLog = {}
  for (const key of getPastDateKeys(7, referenceDate)) {
    weeklyLog[key] = dateSet.has(key)
  }
  for (const dateKey of completedDates) {
    weeklyLog[dateKey] = true
  }

  const completedToday = dateSet.has(referenceDate)
  const streakDays = calculateConsecutiveStreak(completedDates, referenceDate)

  return {
    id: habit.id,
    name: habit.name || 'Untitled habit',
    description: habit.description || '',
    category: habit.category || 'Personal',
    completedDates,
    weeklyLog,
    completed: completedToday,
    streakDays,
    streak: `${streakDays} ${streakDays === 1 ? 'day' : 'days'}`,
  }
}

/**
 * Loads habits from browser localStorage, falling back to fallbackHabits.
 */
export function loadHabitsFromStorage(
  fallbackHabits,
  storage = globalThis.localStorage,
  referenceDate = getTodayDateString(),
) {
  if (!storage) {
    return fallbackHabits.map((h) => normalizeHabit(h, referenceDate))
  }

  try {
    const raw = storage.getItem(HABITS_STORAGE_KEY)
    if (!raw) {
      return fallbackHabits.map((h) => normalizeHabit(h, referenceDate))
    }

    const parsed = JSON.parse(raw)
    const list = Array.isArray(parsed) ? parsed : fallbackHabits
    return list.map((h) => normalizeHabit(h, referenceDate))
  } catch {
    return fallbackHabits.map((h) => normalizeHabit(h, referenceDate))
  }
}

/**
 * Saves habits array to browser localStorage.
 */
export function saveHabitsToStorage(habits, storage = globalThis.localStorage) {
  if (!storage) return

  try {
    storage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits))
  } catch {
    // Ignore storage quota or private-browsing errors silently.
  }
}

/**
 * Checks if a habit is already completed on the given YYYY-MM-DD date.
 */
export function isHabitCompletedOnDate(habit, dateKey) {
  if (Array.isArray(habit.completedDates)) {
    return habit.completedDates.includes(dateKey)
  }
  return Boolean(habit.weeklyLog && habit.weeklyLog[dateKey])
}

/**
 * Marks a habit completed for a specific date. Prevents duplicate check-ins on the same day.
 * Returns { habit, alreadyCompleted }.
 */
export function markHabitCompletedForDate(
  habit,
  dateKey = getTodayDateString(),
  todayKey = getTodayDateString(),
) {
  if (isHabitCompletedOnDate(habit, dateKey)) {
    return { habit, alreadyCompleted: true }
  }

  const nextCompletedDates = Array.from(
    new Set([...(habit.completedDates || []), dateKey]),
  ).sort()

  const updated = normalizeHabit(
    {
      ...habit,
      completedDates: nextCompletedDates,
      weeklyLog: {
        ...(habit.weeklyLog || {}),
        [dateKey]: true,
      },
    },
    todayKey,
  )

  return { habit: updated, alreadyCompleted: false }
}

/**
 * Computes Habit Dashboard summary counts for the selected date (defaults to today).
 */
export function getHabitDashboardSummary(
  habits,
  selectedDate = getTodayDateString(),
) {
  const total = habits.length
  const completedToday = habits.filter((habit) =>
    isHabitCompletedOnDate(habit, selectedDate),
  ).length
  const pending = total - completedToday
  const completionRate =
    total === 0 ? 0 : Math.round((completedToday / total) * 100)

  return { total, completedToday, pending, completionRate }
}

/**
 * Computes current week completed check-ins and weekly completion percentage across all habits.
 */
export function getWeeklyHabitProgress(
  habits,
  referenceDate = getTodayDateString(),
) {
  const weekDates = getCurrentWeekDates(referenceDate)
  const totalPossible = habits.length * weekDates.length

  if (totalPossible === 0) {
    return { completedCount: 0, totalPossible: 0, percentage: 0, weekDates }
  }

  let completedCount = 0
  for (const habit of habits) {
    for (const day of weekDates) {
      if (isHabitCompletedOnDate(habit, day.dateKey)) {
        completedCount += 1
      }
    }
  }

  const percentage = Math.round((completedCount / totalPossible) * 100)
  return { completedCount, totalPossible, percentage, weekDates }
}
