import { getTodayDateString } from './goalUtils.js'

export const HABITS_STORAGE_KEY = 'lifesync_habits'

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
    const year = current.getFullYear()
    const month = String(current.getMonth() + 1).padStart(2, '0')
    const day = String(current.getDate()).padStart(2, '0')
    result.push(`${year}-${month}-${day}`)
  }
  return result
}

/**
 * Normalizes a habit object so streakDays, streak label, completed, and weeklyLog stay aligned.
 */
export function normalizeHabit(habit, referenceDate = getTodayDateString()) {
  const dateKeys = getPastDateKeys(7, referenceDate)
  const existingLog =
    habit.weeklyLog && typeof habit.weeklyLog === 'object'
      ? { ...habit.weeklyLog }
      : {}

  const hasTodayEntry = Object.prototype.hasOwnProperty.call(
    existingLog,
    referenceDate,
  )
  const completedToday = hasTodayEntry
    ? Boolean(existingLog[referenceDate])
    : Boolean(habit.completed)

  existingLog[referenceDate] = completedToday

  // Ensure every date in the 7-day window has a boolean entry
  for (const key of dateKeys) {
    if (!Object.prototype.hasOwnProperty.call(existingLog, key)) {
      existingLog[key] = false
    }
  }

  const parsedStreak =
    typeof habit.streakDays === 'number'
      ? habit.streakDays
      : Number.parseInt(String(habit.streak || '0'), 10) || 0

  const streakDays = Math.max(0, parsedStreak)

  return {
    ...habit,
    completed: completedToday,
    streakDays,
    streak: `${streakDays} ${streakDays === 1 ? 'day' : 'days'}`,
    weeklyLog: existingLog,
  }
}

/**
 * Loads habits from localStorage, falling back to fallbackHabits.
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
 * Toggles a habit's completion for today, updating its weeklyLog and streak count.
 */
export function toggleHabitCompletion(
  habit,
  referenceDate = getTodayDateString(),
) {
  const nextCompleted = !habit.completed
  const currentStreak =
    typeof habit.streakDays === 'number' ? habit.streakDays : 0
  const nextStreak = nextCompleted
    ? currentStreak + 1
    : Math.max(0, currentStreak - 1)

  const nextWeeklyLog = {
    ...(habit.weeklyLog || {}),
    [referenceDate]: nextCompleted,
  }

  return {
    ...habit,
    completed: nextCompleted,
    streakDays: nextStreak,
    streak: `${nextStreak} ${nextStreak === 1 ? 'day' : 'days'}`,
    weeklyLog: nextWeeklyLog,
  }
}
