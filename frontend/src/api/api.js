/**
 * Centralized REST API client for communicating with the Python Flask + SQLite backend.
 */
export const API_BASE_URL = 'http://127.0.0.1:5000'

/**
 * Custom Error preserving HTTP status codes from Flask JSON error responses.
 */
export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * Core fetch wrapper handling JSON headers, network errors, and HTTP error payloads.
 */
export async function apiRequest(path, options = {}, baseUrl = API_BASE_URL) {
  const url = `${baseUrl}${path}`
  const hasBody = options.body !== undefined

  const config = {
    method: options.method || 'GET',
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    ...(hasBody ? { body: JSON.stringify(options.body) } : {}),
  }

  let response
  try {
    response = await fetch(url, config)
  } catch {
    throw new ApiError(
      `Cannot connect to the Flask server at ${baseUrl}. Make sure backend/app.py is running.`,
      0,
    )
  }

  let data = null
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    try {
      data = await response.json()
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    const message =
      (data && (data.error || data.message)) ||
      `Request failed with status ${response.status}.`
    throw new ApiError(message, response.status)
  }

  return data
}

export const apiGet = (path, baseUrl) =>
  apiRequest(path, { method: 'GET' }, baseUrl)

export const apiPost = (path, body, baseUrl) =>
  apiRequest(path, { method: 'POST', body }, baseUrl)

export const apiPut = (path, body, baseUrl) =>
  apiRequest(path, { method: 'PUT', body }, baseUrl)

export const apiDelete = (path, baseUrl) =>
  apiRequest(path, { method: 'DELETE' }, baseUrl)

/* Health & Dashboard */
export const checkBackendHealth = () => apiGet('/api/health')
export const fetchDashboardSummary = () => apiGet('/api/dashboard/summary')

/* Tasks API */
export const fetchTasksApi = () => apiGet('/api/tasks')
export const createTaskApi = (payload) => apiPost('/api/tasks', payload)
export const updateTaskApi = (taskId, payload) =>
  apiPut(`/api/tasks/${taskId}`, payload)
export const deleteTaskApi = (taskId) => apiDelete(`/api/tasks/${taskId}`)

/* Habits API */
export const fetchHabitsApi = () => apiGet('/api/habits')
export const createHabitApi = (payload) => apiPost('/api/habits', payload)
export const updateHabitApi = (habitId, payload) =>
  apiPut(`/api/habits/${habitId}`, payload)
export const deleteHabitApi = (habitId) => apiDelete(`/api/habits/${habitId}`)
export const completeHabitApi = (habitId, date) =>
  apiPost(`/api/habits/${habitId}/complete`, date ? { date } : {})
export const fetchHabitHistoryApi = (habitId) =>
  apiGet(`/api/habits/${habitId}/history`)
export const fetchHabitStatusApi = (habitId, date) =>
  apiGet(
    `/api/habits/${habitId}/status${date ? `?date=${encodeURIComponent(date)}` : ''}`,
  )

/* Goals API */
export const fetchGoalsApi = () => apiGet('/api/goals')
export const createGoalApi = (payload) => apiPost('/api/goals', payload)
export const updateGoalApi = (goalId, payload) =>
  apiPut(`/api/goals/${goalId}`, payload)
export const deleteGoalApi = (goalId) => apiDelete(`/api/goals/${goalId}`)

/* Calendar Events API */
export const fetchEventsApi = () => apiGet('/api/events')
export const createEventApi = (payload) => apiPost('/api/events', payload)
export const updateEventApi = (eventId, payload) =>
  apiPut(`/api/events/${eventId}`, payload)
export const deleteEventApi = (eventId) => apiDelete(`/api/events/${eventId}`)
