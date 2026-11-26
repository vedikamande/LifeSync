export const ACTIVITIES_STORAGE_KEY = 'lifesync_activities'
export const ACTIVITY_FILTERS = ['All', 'Tasks', 'Habits', 'Goals']
export const MAX_STORED_ACTIVITIES = 100

const FILTER_TYPE_MAP = {
  Tasks: 'task',
  Habits: 'habit',
  Goals: 'goal',
}

/**
 * Builds a structured activity record with an ISO timestamp.
 */
export function createActivityRecord({
  type,
  title,
  description = '',
  timestamp = new Date().toISOString(),
}) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    title,
    description,
    timestamp,
  }
}

/**
 * Normalizes legacy or stored activity items so every record has description and timestamp.
 */
export function normalizeActivity(item) {
  return {
    id: item.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: item.type || 'task',
    title: item.title || 'Activity recorded',
    description: item.description || '',
    timestamp: item.timestamp || new Date().toISOString(),
  }
}

/**
 * Sorts activities from newest to oldest using timestamp.
 */
export function sortActivitiesNewestFirst(activities) {
  return [...activities].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime()
    const timeB = new Date(b.timestamp).getTime()
    return (Number.isNaN(timeB) ? 0 : timeB) - (Number.isNaN(timeA) ? 0 : timeA)
  })
}

/**
 * Loads saved activity history from browser localStorage, falling back to fallbackActivities.
 */
export function loadActivitiesFromStorage(
  fallbackActivities,
  storage = globalThis.localStorage,
) {
  if (!storage) {
    return sortActivitiesNewestFirst(fallbackActivities.map(normalizeActivity))
  }

  try {
    const raw = storage.getItem(ACTIVITIES_STORAGE_KEY)
    if (!raw) {
      return sortActivitiesNewestFirst(fallbackActivities.map(normalizeActivity))
    }

    const parsed = JSON.parse(raw)
    const list = Array.isArray(parsed) ? parsed : fallbackActivities
    return sortActivitiesNewestFirst(list.map(normalizeActivity))
  } catch {
    return sortActivitiesNewestFirst(fallbackActivities.map(normalizeActivity))
  }
}

/**
 * Persists activity history to browser localStorage, keeping up to MAX_STORED_ACTIVITIES records.
 */
export function saveActivitiesToStorage(
  activities,
  storage = globalThis.localStorage,
) {
  if (!storage) return

  try {
    const trimmed = sortActivitiesNewestFirst(activities).slice(
      0,
      MAX_STORED_ACTIVITIES,
    )
    storage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    // Ignore storage quota or private-browsing errors silently.
  }
}

/**
 * Filters activities by category tab ('All', 'Tasks', 'Habits', 'Goals').
 */
export function filterActivities(activities, filterLabel = 'All') {
  if (filterLabel === 'All') return activities
  const targetType = FILTER_TYPE_MAP[filterLabel]
  if (!targetType) return activities
  return activities.filter((activity) => activity.type === targetType)
}

/**
 * Formats an ISO timestamp into separate readable date and time strings.
 */
export function formatActivityDateTime(timestamp) {
  if (!timestamp) {
    return { dateLabel: 'Today', timeLabel: '', fullLabel: 'Today' }
  }

  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) {
    return { dateLabel: String(timestamp), timeLabel: '', fullLabel: String(timestamp) }
  }

  const dateLabel = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const timeLabel = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  return {
    dateLabel,
    timeLabel,
    fullLabel: `${dateLabel} · ${timeLabel}`,
  }
}
