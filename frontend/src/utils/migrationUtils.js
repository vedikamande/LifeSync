import {
  createEventApi,
  createGoalApi,
  createHabitApi,
  createTaskApi,
} from '../api/api.js'
import { EVENTS_STORAGE_KEY } from './calendarUtils.js'
import { GOALS_STORAGE_KEY } from './goalUtils.js'
import { HABITS_STORAGE_KEY } from './habitUtils.js'
import { TASKS_STORAGE_KEY } from './taskUtils.js'

function readLegacyArray(key, storage = globalThis.localStorage) {
  if (!storage) return []
  try {
    const raw = storage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function clearLegacyKey(key, storage = globalThis.localStorage) {
  if (!storage) return
  try {
    storage.removeItem(key)
  } catch {
    // Ignore storage access errors
  }
}

/**
 * Migrates any existing localStorage tasks/habits/goals/events into SQLite once
 * when the backend database tables are empty, then clears legacy localStorage keys.
 */
export async function migrateLegacyLocalStorage(
  currentData,
  creators = {
    createTask: createTaskApi,
    createHabit: createHabitApi,
    createGoal: createGoalApi,
    createEvent: createEventApi,
  },
  storage = globalThis.localStorage,
) {
  let migratedAny = false

  if (currentData.tasks.length === 0) {
    const legacyTasks = readLegacyArray(TASKS_STORAGE_KEY, storage)
    for (const item of legacyTasks) {
      if (!item?.title) continue
      await creators.createTask({
        title: item.title,
        description: item.description || '',
        priority: item.priority || 'Medium',
        dueDate: item.dueDate || '',
        category: item.category || 'Personal',
        completed: Boolean(item.completed),
      })
      migratedAny = true
    }
  }
  clearLegacyKey(TASKS_STORAGE_KEY, storage)

  if (currentData.habits.length === 0) {
    const legacyHabits = readLegacyArray(HABITS_STORAGE_KEY, storage)
    for (const item of legacyHabits) {
      if (!item?.name) continue
      await creators.createHabit({
        name: item.name,
        description: item.description || '',
        category: item.category || 'Personal',
        completedDates: Array.isArray(item.completedDates)
          ? item.completedDates
          : [],
      })
      migratedAny = true
    }
  }
  clearLegacyKey(HABITS_STORAGE_KEY, storage)

  if (currentData.goals.length === 0) {
    const legacyGoals = readLegacyArray(GOALS_STORAGE_KEY, storage)
    for (const item of legacyGoals) {
      if (!item?.title) continue
      await creators.createGoal({
        title: item.title,
        description: item.description || '',
        category: item.category === 'Study' ? 'Education' : item.category || 'Personal',
        startDate: item.startDate || '',
        targetDate: item.targetDate || '',
        progress: Number(item.progress) || 0,
      })
      migratedAny = true
    }
  }
  clearLegacyKey(GOALS_STORAGE_KEY, storage)

  if (currentData.events.length === 0) {
    const legacyEvents = readLegacyArray(EVENTS_STORAGE_KEY, storage)
    for (const item of legacyEvents) {
      if (!item?.title || !item?.date) continue
      await creators.createEvent({
        title: item.title,
        description: item.description || '',
        date: item.date,
        startTime: item.startTime || '',
        endTime: item.endTime || '',
        category: item.category || 'Personal',
        priority: item.priority || 'Medium',
      })
      migratedAny = true
    }
  }
  clearLegacyKey(EVENTS_STORAGE_KEY, storage)

  return migratedAny
}
