import { getGoalStatus, getTodayDateString } from './goalUtils.js'
import { getCurrentWeekDates, isHabitCompletedOnDate, toDateKey } from './habitUtils.js'

export const EVENTS_STORAGE_KEY = 'lifesync_events'
export const EVENT_CATEGORIES = [
  'Personal',
  'Work',
  'Education',
  'Meeting',
  'Other',
]
export const EVENT_PRIORITIES = ['High', 'Medium', 'Low']

/**
 * Checks whether a string is a valid YYYY-MM-DD calendar date.
 */
export function isValidDateKey(dateString) {
  if (typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false
  }
  const [year, month, day] = dateString.split('-').map(Number)
  const parsed = new Date(year, month - 1, day)
  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  )
}

/**
 * Formats an HH:MM 24-hour time string into 12-hour readable time (e.g., 14:30 -> 2:30 PM).
 */
export function formatTimeLabel(timeString) {
  if (typeof timeString !== 'string' || !/^\d{2}:\d{2}$/.test(timeString)) {
    return ''
  }
  const [hours, minutes] = timeString.split(':').map(Number)
  if (hours > 23 || minutes > 59) return ''

  const date = new Date(2026, 0, 1, hours, minutes)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * Formats a start/end time range cleanly, handling missing start or end times.
 */
export function formatEventTimeRange(startTime, endTime) {
  const start = formatTimeLabel(startTime)
  const end = formatTimeLabel(endTime)
  if (start && end) return `${start} – ${end}`
  if (start) return start
  if (end) return `Until ${end}`
  return 'All day'
}

/**
 * Formats a year and 0-indexed month (e.g., "November 2026").
 */
export function formatMonthYear(year, monthIndex) {
  const date = new Date(year, monthIndex, 1)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Normalizes a calendar event record with safe defaults for missing fields.
 */
export function normalizeEvent(event) {
  return {
    id: event.id ?? Date.now(),
    title: String(event.title || 'Untitled event').trim(),
    description: String(event.description || '').trim(),
    date: isValidDateKey(event.date) ? event.date : getTodayDateString(),
    startTime: typeof event.startTime === 'string' ? event.startTime : '',
    endTime: typeof event.endTime === 'string' ? event.endTime : '',
    category: EVENT_CATEGORIES.includes(event.category)
      ? event.category
      : 'Other',
    priority: EVENT_PRIORITIES.includes(event.priority)
      ? event.priority
      : 'Medium',
  }
}

/**
 * Loads saved calendar events from localStorage, falling back to fallbackEvents.
 */
export function loadEventsFromStorage(
  fallbackEvents,
  storage = globalThis.localStorage,
) {
  if (!storage) return fallbackEvents.map(normalizeEvent)

  try {
    const raw = storage.getItem(EVENTS_STORAGE_KEY)
    if (!raw) return fallbackEvents.map(normalizeEvent)

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.map(normalizeEvent)
      : fallbackEvents.map(normalizeEvent)
  } catch {
    return fallbackEvents.map(normalizeEvent)
  }
}

/**
 * Persists calendar events array to browser localStorage.
 */
export function saveEventsToStorage(events, storage = globalThis.localStorage) {
  if (!storage) return

  try {
    storage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events))
  } catch {
    // Ignore storage quota or private-browsing errors silently.
  }
}

/**
 * Builds the 35 or 42 day cells (Sunday–Saturday) for a given month and year.
 */
export function buildMonthCalendarDays(year, monthIndex) {
  const firstOfMonth = new Date(year, monthIndex, 1)
  const startDayOfWeek = firstOfMonth.getDay() // 0 (Sun) .. 6 (Sat)
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

  const totalCells = startDayOfWeek + daysInMonth > 35 ? 42 : 35
  const gridStart = new Date(year, monthIndex, 1 - startDayOfWeek)

  const cells = []
  for (let i = 0; i < totalCells; i += 1) {
    const current = new Date(gridStart)
    current.setDate(gridStart.getDate() + i)
    cells.push({
      dateKey: toDateKey(current),
      dayNumber: current.getDate(),
      isCurrentMonth: current.getMonth() === monthIndex,
    })
  }
  return cells
}

/**
 * Returns all unified daily activities (events, due tasks, habits, goal deadlines) for a given date.
 */
export function getActivitiesForDate(
  dateKey,
  { events = [], tasks = [], habits = [], goals = [] },
  todayKey = getTodayDateString(),
) {
  if (!isValidDateKey(dateKey)) return []

  const items = []

  // 1. Calendar Events
  for (const event of events) {
    if (event.date !== dateKey) continue
    items.push({
      uid: `event-${event.id}`,
      sourceType: 'event',
      sourceId: event.id,
      title: event.title,
      description: event.description || '',
      timeLabel: formatEventTimeRange(event.startTime, event.endTime),
      sortTime: event.startTime || '23:59',
      category: event.category || 'Other',
      priority: event.priority || 'Medium',
      status: event.date < todayKey ? 'Past' : 'Scheduled',
      rawEvent: event,
    })
  }

  // 2. Tasks with matching due date (synced from Task Manager)
  for (const task of tasks) {
    if (!isValidDateKey(task.dueDate) || task.dueDate !== dateKey) continue
    items.push({
      uid: `task-${task.id}`,
      sourceType: 'task',
      sourceId: task.id,
      title: task.title,
      description: task.description || '',
      timeLabel: 'Task due',
      sortTime: '23:59',
      category: task.category || 'Personal',
      priority: task.priority || 'Medium',
      status: task.completed ? 'Completed' : 'Pending',
    })
  }

  // 3. Habits (checked-in dates from Habit Tracker, plus daily scheduled habits for current week/today)
  const currentWeekKeys = new Set(
    getCurrentWeekDates(todayKey).map((d) => d.dateKey),
  )
  const isScheduledHabitDay =
    dateKey === todayKey || currentWeekKeys.has(dateKey)

  for (const habit of habits) {
    const completedOnDate = isHabitCompletedOnDate(habit, dateKey)
    if (!completedOnDate && !isScheduledHabitDay) continue

    items.push({
      uid: `habit-${habit.id}-${dateKey}`,
      sourceType: 'habit',
      sourceId: habit.id,
      title: habit.name,
      description: habit.description || '',
      timeLabel: 'Daily habit',
      sortTime: '08:00',
      category: habit.category || 'Personal',
      priority: null,
      status: completedOnDate
        ? 'Completed'
        : dateKey > todayKey
          ? 'Scheduled'
          : 'Pending',
    })
  }

  // 4. Goals with matching target completion date (synced from Goal Management)
  for (const goal of goals) {
    if (!isValidDateKey(goal.targetDate) || goal.targetDate !== dateKey) continue
    const goalStatus = getGoalStatus(goal.progress, goal.targetDate, todayKey)
    items.push({
      uid: `goal-${goal.id}`,
      sourceType: 'goal',
      sourceId: goal.id,
      title: goal.title,
      description: goal.description || '',
      timeLabel: `Goal deadline (${goal.progress}%)`,
      sortTime: '23:59',
      category: goal.category || 'Personal',
      priority: null,
      status: goalStatus,
    })
  }

  return items.sort((a, b) => a.sortTime.localeCompare(b.sortTime))
}

/**
 * Builds a lookup map of dateKey -> indicator flags ({ hasEvent, hasTask, hasHabit, hasGoal })
 * so calendar cells show subtle indicators without recomputing full details on every cell.
 */
export function getDateIndicatorMap(
  { events = [], tasks = [], habits = [], goals = [] },
  todayKey = getTodayDateString(),
) {
  const map = {}

  function ensureDate(dateKey) {
    if (!isValidDateKey(dateKey)) return null
    if (!map[dateKey]) {
      map[dateKey] = {
        hasEvent: false,
        hasTask: false,
        hasHabit: false,
        hasGoal: false,
      }
    }
    return map[dateKey]
  }

  for (const event of events) {
    const bucket = ensureDate(event.date)
    if (bucket) bucket.hasEvent = true
  }

  for (const task of tasks) {
    const bucket = ensureDate(task.dueDate)
    if (bucket) bucket.hasTask = true
  }

  for (const habit of habits) {
    if (Array.isArray(habit.completedDates)) {
      for (const dateKey of habit.completedDates) {
        const bucket = ensureDate(dateKey)
        if (bucket) bucket.hasHabit = true
      }
    }
  }
  if (habits.length > 0) {
    const todayBucket = ensureDate(todayKey)
    if (todayBucket) todayBucket.hasHabit = true
  }

  for (const goal of goals) {
    const bucket = ensureDate(goal.targetDate)
    if (bucket) bucket.hasGoal = true
  }

  return map
}

/**
 * Returns upcoming Events, pending Tasks, and active Goal deadlines sorted chronologically,
 * highlighting items approaching their deadlines (within 3 days).
 */
export function getUpcomingActivities(
  { events = [], tasks = [], goals = [] },
  todayKey = getTodayDateString(),
  limit = 10,
) {
  const today = new Date(`${todayKey}T00:00:00`)
  const msPerDay = 24 * 60 * 60 * 1000
  const items = []

  function getDaysUntil(dateKey) {
    if (!isValidDateKey(dateKey) || Number.isNaN(today.getTime())) return null
    const target = new Date(`${dateKey}T00:00:00`)
    return Math.round((target.getTime() - today.getTime()) / msPerDay)
  }

  for (const event of events) {
    if (!isValidDateKey(event.date) || event.date < todayKey) continue
    const daysUntil = getDaysUntil(event.date)
    items.push({
      uid: `upcoming-event-${event.id}`,
      sourceType: 'event',
      title: event.title,
      date: event.date,
      sortTime: event.startTime || '23:59',
      timeLabel: formatEventTimeRange(event.startTime, event.endTime),
      category: event.category,
      status: 'Scheduled',
      daysUntil,
      isApproaching: daysUntil !== null && daysUntil >= 0 && daysUntil <= 3,
    })
  }

  for (const task of tasks) {
    if (
      task.completed ||
      !isValidDateKey(task.dueDate) ||
      task.dueDate < todayKey
    ) {
      continue
    }
    const daysUntil = getDaysUntil(task.dueDate)
    items.push({
      uid: `upcoming-task-${task.id}`,
      sourceType: 'task',
      title: task.title,
      date: task.dueDate,
      sortTime: '23:59',
      timeLabel: 'Task due',
      category: task.category || 'Personal',
      status: 'Pending',
      daysUntil,
      isApproaching: daysUntil !== null && daysUntil >= 0 && daysUntil <= 3,
    })
  }

  for (const goal of goals) {
    if (!isValidDateKey(goal.targetDate) || goal.targetDate < todayKey) continue
    const status = getGoalStatus(goal.progress, goal.targetDate, todayKey)
    if (status === 'Completed') continue
    const daysUntil = getDaysUntil(goal.targetDate)
    items.push({
      uid: `upcoming-goal-${goal.id}`,
      sourceType: 'goal',
      title: goal.title,
      date: goal.targetDate,
      sortTime: '23:59',
      timeLabel: `Goal deadline (${goal.progress}%)`,
      category: goal.category || 'Personal',
      status,
      daysUntil,
      isApproaching: daysUntil !== null && daysUntil >= 0 && daysUntil <= 3,
    })
  }

  items.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date)
    if (dateCompare !== 0) return dateCompare
    return a.sortTime.localeCompare(b.sortTime)
  })

  return typeof limit === 'number' ? items.slice(0, limit) : items
}
