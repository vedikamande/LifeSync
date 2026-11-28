import { useCallback, useEffect, useState } from 'react'
import {
  completeHabitApi,
  createEventApi,
  createGoalApi,
  createHabitApi,
  createTaskApi,
  deleteEventApi,
  deleteGoalApi,
  deleteHabitApi,
  deleteTaskApi,
  fetchDashboardSummary,
  fetchEventsApi,
  fetchGoalsApi,
  fetchHabitsApi,
  fetchTasksApi,
  updateEventApi,
  updateGoalApi,
  updateHabitApi,
  updateTaskApi,
} from '../api/api.js'
import CalendarSection from '../components/CalendarSection.jsx'
import GoalsSection from '../components/GoalsSection.jsx'
import HabitTracker from '../components/HabitTracker.jsx'
import RecentActivities from '../components/RecentActivities.jsx'
import ReportsSection from '../components/ReportsSection.jsx'
import SettingsPanel from '../components/SettingsPanel.jsx'
import StatsCards from '../components/StatsCards.jsx'
import TodayTasks from '../components/TodayTasks.jsx'
import { INITIAL_ACTIVITIES } from '../data/sampleData.js'
import {
  createActivityRecord,
  loadActivitiesFromStorage,
  saveActivitiesToStorage,
} from '../utils/activityUtils.js'
import { normalizeEvent } from '../utils/calendarUtils.js'
import { clampProgress, normalizeGoal } from '../utils/goalUtils.js'
import { normalizeHabit } from '../utils/habitUtils.js'
import { migrateLegacyLocalStorage } from '../utils/migrationUtils.js'

const OVERVIEW_ACTIVITY_LIMIT = 6

const EMPTY_SUMMARY = {
  totalTasks: 0,
  completedTasks: 0,
  pendingTasks: 0,
  totalHabits: 0,
  completedHabitsToday: 0,
  totalGoals: 0,
  completedGoals: 0,
  upcomingEvents: 0,
}

/**
 * Main dashboard workspace connected to the Python Flask + SQLite backend.
 */
function HomePage({ activeSection }) {
  const [tasks, setTasks] = useState([])
  const [habits, setHabits] = useState([])
  const [goals, setGoals] = useState([])
  const [events, setEvents] = useState([])
  const [summary, setSummary] = useState(EMPTY_SUMMARY)
  const [activities, setActivities] = useState(() =>
    loadActivitiesFromStorage(INITIAL_ACTIVITIES),
  )

  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    saveActivitiesToStorage(activities)
  }, [activities])

  useEffect(() => {
    if (!successMessage) return undefined
    const timer = setTimeout(() => setSuccessMessage(''), 3000)
    return () => clearTimeout(timer)
  }, [successMessage])

  const refreshSummary = useCallback(async () => {
    try {
      const nextSummary = await fetchDashboardSummary()
      setSummary(nextSummary)
    } catch {
      // Errors on initial load are surfaced by loadAllData
    }
  }, [])

  async function fetchWorkspacePayload() {
    const [tasksRes, habitsRes, goalsRes, eventsRes, summaryRes] =
      await Promise.all([
        fetchTasksApi(),
        fetchHabitsApi(),
        fetchGoalsApi(),
        fetchEventsApi(),
        fetchDashboardSummary(),
      ])

    const fetched = {
      tasks: tasksRes.tasks || [],
      habits: habitsRes.habits || [],
      goals: goalsRes.goals || [],
      events: eventsRes.events || [],
    }

    const migrated = await migrateLegacyLocalStorage(fetched)
    if (!migrated) {
      return {
        tasks: fetched.tasks,
        habits: fetched.habits.map((h) => normalizeHabit(h)),
        goals: fetched.goals.map((g) => normalizeGoal(g)),
        events: fetched.events.map((e) => normalizeEvent(e)),
        summary: summaryRes,
        migrated: false,
      }
    }

    const [t2, h2, g2, e2, s2] = await Promise.all([
      fetchTasksApi(),
      fetchHabitsApi(),
      fetchGoalsApi(),
      fetchEventsApi(),
      fetchDashboardSummary(),
    ])
    return {
      tasks: t2.tasks || [],
      habits: (h2.habits || []).map((h) => normalizeHabit(h)),
      goals: (g2.goals || []).map((g) => normalizeGoal(g)),
      events: (e2.events || []).map((e) => normalizeEvent(e)),
      summary: s2,
      migrated: true,
    }
  }

  useEffect(() => {
    let cancelled = false

    fetchWorkspacePayload()
      .then((payload) => {
        if (cancelled) return
        setTasks(payload.tasks)
        setHabits(payload.habits)
        setGoals(payload.goals)
        setEvents(payload.events)
        setSummary(payload.summary)
        if (payload.migrated) {
          setSuccessMessage('Existing local data imported into SQLite.')
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setApiError(
            err.message || 'Failed to load data from the Flask backend.',
          )
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function handleRetryLoad() {
    setIsLoading(true)
    setApiError('')
    try {
      const payload = await fetchWorkspacePayload()
      setTasks(payload.tasks)
      setHabits(payload.habits)
      setGoals(payload.goals)
      setEvents(payload.events)
      setSummary(payload.summary)
    } catch (err) {
      setApiError(
        err.message || 'Failed to load data from the Flask backend.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  function pushActivity(type, title, description) {
    const newEntry = createActivityRecord({ type, title, description })
    setActivities((prev) => [newEntry, ...prev])
  }

  function showSuccess(message) {
    setApiError('')
    setSuccessMessage(message)
  }

  /* Task Handlers */
  async function handleAddTask(taskData) {
    try {
      const res = await createTaskApi(taskData)
      setTasks((prev) => [res.task, ...prev])
      pushActivity(
        'task',
        'Task created',
        `Added "${res.task.title}" (${res.task.priority} priority)`,
      )
      showSuccess('Task saved to SQLite.')
      refreshSummary()
    } catch (err) {
      setApiError(err.message || 'Could not save task.')
    }
  }

  async function handleEditTask(taskId, updatedFields) {
    try {
      const res = await updateTaskApi(taskId, updatedFields)
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? res.task : task)),
      )
      showSuccess('Task updated.')
      refreshSummary()
    } catch (err) {
      setApiError(err.message || 'Could not update task.')
    }
  }

  async function handleToggleTask(taskId) {
    const target = tasks.find((task) => task.id === taskId)
    if (!target) return

    const nextCompleted = !target.completed
    try {
      const res = await updateTaskApi(taskId, { completed: nextCompleted })
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? res.task : task)),
      )

      if (nextCompleted) {
        pushActivity('task', 'Task completed', `Completed "${res.task.title}"`)
      }
      showSuccess(
        nextCompleted ? 'Task marked completed.' : 'Task marked pending.',
      )
      refreshSummary()
    } catch (err) {
      setApiError(err.message || 'Could not update task status.')
    }
  }

  async function handleDeleteTask(taskId) {
    const target = tasks.find((task) => task.id === taskId)
    try {
      await deleteTaskApi(taskId)
      setTasks((prev) => prev.filter((task) => task.id !== taskId))
      if (target) {
        pushActivity('task', 'Task deleted', `Removed "${target.title}"`)
      }
      showSuccess('Task deleted.')
      refreshSummary()
    } catch (err) {
      setApiError(err.message || 'Could not delete task.')
    }
  }

  /* Habit Handlers */
  async function handleAddHabit(habitData) {
    try {
      const res = await createHabitApi(habitData)
      const normalized = normalizeHabit(res.habit)
      setHabits((prev) => [normalized, ...prev])
      pushActivity(
        'habit',
        'Habit created',
        `Added "${normalized.name}" (${normalized.category})`,
      )
      showSuccess('Habit saved to SQLite.')
      refreshSummary()
    } catch (err) {
      setApiError(err.message || 'Could not create habit.')
    }
  }

  async function handleEditHabit(habitId, updatedFields) {
    try {
      const res = await updateHabitApi(habitId, updatedFields)
      const normalized = normalizeHabit(res.habit)
      setHabits((prev) =>
        prev.map((habit) => (habit.id === habitId ? normalized : habit)),
      )
      pushActivity('habit', 'Habit updated', `Updated "${normalized.name}"`)
      showSuccess('Habit updated.')
      refreshSummary()
    } catch (err) {
      setApiError(err.message || 'Could not update habit.')
    }
  }

  async function handleDeleteHabit(habitId) {
    const target = habits.find((habit) => habit.id === habitId)
    try {
      await deleteHabitApi(habitId)
      setHabits((prev) => prev.filter((habit) => habit.id !== habitId))
      if (target) {
        pushActivity('habit', 'Habit deleted', `Removed "${target.name}"`)
      }
      showSuccess('Habit deleted.')
      refreshSummary()
    } catch (err) {
      setApiError(err.message || 'Could not delete habit.')
    }
  }

  async function handleCompleteHabitForDate(habitId, dateKey) {
    try {
      const res = await completeHabitApi(habitId, dateKey)
      const normalized = normalizeHabit(res.habit)
      setHabits((prev) =>
        prev.map((habit) => (habit.id === habitId ? normalized : habit)),
      )
      pushActivity(
        'habit',
        'Habit completed',
        `Checked off "${normalized.name}" on ${dateKey} (${normalized.streakDays} day streak)`,
      )
      showSuccess(`Checked in "${normalized.name}" for ${dateKey}.`)
      refreshSummary()
    } catch (err) {
      setApiError(err.message || 'Could not mark habit completed.')
    }
  }

  /* Goal Handlers */
  async function handleAddGoal(goalData) {
    try {
      const res = await createGoalApi(goalData)
      const normalized = normalizeGoal(res.goal)
      setGoals((prev) => [normalized, ...prev])
      pushActivity(
        'goal',
        'Goal created',
        `Created "${normalized.title}" (${normalized.category})`,
      )
      showSuccess('Goal saved to SQLite.')
      refreshSummary()
    } catch (err) {
      setApiError(err.message || 'Could not create goal.')
    }
  }

  async function handleEditGoal(goalId, updatedFields) {
    const target = goals.find((goal) => goal.id === goalId)
    try {
      const res = await updateGoalApi(goalId, updatedFields)
      const normalized = normalizeGoal(res.goal)
      setGoals((prev) =>
        prev.map((goal) => (goal.id === goalId ? normalized : goal)),
      )
      if (target && normalized.progress !== target.progress) {
        pushActivity(
          'goal',
          normalized.status === 'Completed'
            ? 'Goal completed'
            : 'Goal progress updated',
          `"${normalized.title}" moved from ${target.progress}% to ${normalized.progress}%`,
        )
      }
      showSuccess('Goal updated.')
      refreshSummary()
    } catch (err) {
      setApiError(err.message || 'Could not update goal.')
    }
  }

  async function handleDeleteGoal(goalId) {
    const target = goals.find((goal) => goal.id === goalId)
    try {
      await deleteGoalApi(goalId)
      setGoals((prev) => prev.filter((goal) => goal.id !== goalId))
      if (target) {
        pushActivity('goal', 'Goal deleted', `Removed "${target.title}"`)
      }
      showSuccess('Goal deleted.')
      refreshSummary()
    } catch (err) {
      setApiError(err.message || 'Could not delete goal.')
    }
  }

  async function handleSetGoalProgress(goalId, rawProgress) {
    const target = goals.find((goal) => goal.id === goalId)
    if (!target) return

    const nextProgress = clampProgress(rawProgress)
    if (nextProgress === target.progress) return

    try {
      const res = await updateGoalApi(goalId, { progress: nextProgress })
      const normalized = normalizeGoal(res.goal)
      setGoals((prev) =>
        prev.map((goal) => (goal.id === goalId ? normalized : goal)),
      )
      pushActivity(
        'goal',
        normalized.status === 'Completed'
          ? 'Goal completed'
          : 'Goal progress updated',
        `"${target.title}" moved from ${target.progress}% to ${normalized.progress}%`,
      )
      showSuccess(`Goal progress updated to ${normalized.progress}%.`)
      refreshSummary()
    } catch (err) {
      setApiError(err.message || 'Could not update goal progress.')
    }
  }

  /* Calendar Event Handlers */
  async function handleAddEvent(eventData) {
    try {
      const res = await createEventApi(eventData)
      const normalized = normalizeEvent(res.event)
      setEvents((prev) => [normalized, ...prev])
      pushActivity(
        'event',
        'Event scheduled',
        `Added "${normalized.title}" on ${normalized.date}`,
      )
      showSuccess('Event saved to SQLite.')
      refreshSummary()
    } catch (err) {
      setApiError(err.message || 'Could not create event.')
    }
  }

  async function handleEditEvent(eventId, updatedFields) {
    try {
      const res = await updateEventApi(eventId, updatedFields)
      const normalized = normalizeEvent(res.event)
      setEvents((prev) =>
        prev.map((event) => (event.id === eventId ? normalized : event)),
      )
      pushActivity(
        'event',
        'Event updated',
        `Updated "${normalized.title}" (${normalized.date})`,
      )
      showSuccess('Event updated.')
      refreshSummary()
    } catch (err) {
      setApiError(err.message || 'Could not update event.')
    }
  }

  async function handleDeleteEvent(eventId) {
    const target = events.find((event) => event.id === eventId)
    try {
      await deleteEventApi(eventId)
      setEvents((prev) => prev.filter((event) => event.id !== eventId))
      if (target) {
        pushActivity('event', 'Event deleted', `Removed "${target.title}"`)
      }
      showSuccess('Event deleted.')
      refreshSummary()
    } catch (err) {
      setApiError(err.message || 'Could not delete event.')
    }
  }

  return (
    <main className="dashboard-content">
      {isLoading && (
        <div className="feedback-banner banner-loading" role="status">
          <span>Loading your LifeSync workspace from SQLite...</span>
        </div>
      )}

      {apiError && (
        <div className="feedback-banner banner-error" role="alert">
          <span>{apiError}</span>
          <div className="banner-actions">
            <button
              type="button"
              className="banner-btn"
              onClick={handleRetryLoad}
            >
              Retry
            </button>
            <button
              type="button"
              className="banner-btn"
              onClick={() => setApiError('')}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="feedback-banner banner-success" role="status">
          <span>{successMessage}</span>
          <button
            type="button"
            className="banner-btn"
            onClick={() => setSuccessMessage('')}
          >
            Dismiss
          </button>
        </div>
      )}

      {activeSection !== 'settings' &&
        activeSection !== 'reports' &&
        activeSection !== 'calendar' && <StatsCards summary={summary} />}

      {activeSection === 'overview' && (
        <div className="dashboard-grid">
          <div className="grid-column">
            <TodayTasks
              tasks={tasks}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
            />
            <GoalsSection
              goals={goals}
              onAddGoal={handleAddGoal}
              onEditGoal={handleEditGoal}
              onDeleteGoal={handleDeleteGoal}
              onSetGoalProgress={handleSetGoalProgress}
            />
          </div>

          <div className="grid-column">
            <HabitTracker
              habits={habits}
              onAddHabit={handleAddHabit}
              onEditHabit={handleEditHabit}
              onDeleteHabit={handleDeleteHabit}
              onCompleteHabitForDate={handleCompleteHabitForDate}
            />
            <RecentActivities
              activities={activities}
              maxItems={OVERVIEW_ACTIVITY_LIMIT}
            />
          </div>
        </div>
      )}

      {activeSection === 'tasks' && (
        <TodayTasks
          tasks={tasks}
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {activeSection === 'habits' && (
        <HabitTracker
          habits={habits}
          onAddHabit={handleAddHabit}
          onEditHabit={handleEditHabit}
          onDeleteHabit={handleDeleteHabit}
          onCompleteHabitForDate={handleCompleteHabitForDate}
        />
      )}

      {activeSection === 'goals' && (
        <GoalsSection
          goals={goals}
          onAddGoal={handleAddGoal}
          onEditGoal={handleEditGoal}
          onDeleteGoal={handleDeleteGoal}
          onSetGoalProgress={handleSetGoalProgress}
        />
      )}

      {activeSection === 'calendar' && (
        <CalendarSection
          events={events}
          tasks={tasks}
          habits={habits}
          goals={goals}
          onAddEvent={handleAddEvent}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
        />
      )}

      {activeSection === 'activities' && (
        <RecentActivities activities={activities} />
      )}

      {activeSection === 'reports' && (
        <ReportsSection
          tasks={tasks}
          habits={habits}
          goals={goals}
          activities={activities}
        />
      )}

      {activeSection === 'settings' && <SettingsPanel />}
    </main>
  )
}

export default HomePage
