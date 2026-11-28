import { useEffect, useState } from 'react'
import {
  createTaskApi,
  deleteTaskApi,
  fetchTasksApi,
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
import {
  INITIAL_ACTIVITIES,
  INITIAL_EVENTS,
  INITIAL_GOALS,
  INITIAL_HABITS,
} from '../data/sampleData.js'
import {
  createActivityRecord,
  loadActivitiesFromStorage,
  saveActivitiesToStorage,
} from '../utils/activityUtils.js'
import {
  loadEventsFromStorage,
  normalizeEvent,
  saveEventsToStorage,
} from '../utils/calendarUtils.js'
import {
  clampProgress,
  getGoalStatus,
  loadGoalsFromStorage,
  normalizeGoal,
  saveGoalsToStorage,
} from '../utils/goalUtils.js'
import {
  loadHabitsFromStorage,
  markHabitCompletedForDate,
  normalizeHabit,
  saveHabitsToStorage,
} from '../utils/habitUtils.js'

const OVERVIEW_ACTIVITY_LIMIT = 6

/**
 * Main dashboard workspace.
 * - Task Manager: synced with Python Flask + SQLite via src/api/api.js (no localStorage for new tasks).
 * - Habits, Goals, Calendar Events, and Activities: kept on browser localStorage without modification.
 */
function HomePage({ activeSection }) {
  // Tasks come exclusively from the Flask + SQLite backend.
  const [tasks, setTasks] = useState([])
  const [isTasksLoading, setIsTasksLoading] = useState(true)
  const [tasksError, setTasksError] = useState('')
  const [taskSuccessMessage, setTaskSuccessMessage] = useState('')
  const [pendingTaskIds, setPendingTaskIds] = useState([])

  // Other modules stay on browser localStorage until their integration phase.
  const [habits, setHabits] = useState(() =>
    loadHabitsFromStorage(INITIAL_HABITS),
  )
  const [goals, setGoals] = useState(() => loadGoalsFromStorage(INITIAL_GOALS))
  const [events, setEvents] = useState(() =>
    loadEventsFromStorage(INITIAL_EVENTS),
  )
  const [activities, setActivities] = useState(() =>
    loadActivitiesFromStorage(INITIAL_ACTIVITIES),
  )

  // Fetch all saved tasks from GET /api/tasks when the dashboard loads.
  useEffect(() => {
    let cancelled = false

    fetchTasksApi()
      .then((data) => {
        if (!cancelled) {
          setTasks(Array.isArray(data?.tasks) ? data.tasks : [])
          setTasksError('')
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setTasksError(
            err.message || 'Failed to load tasks from the Flask backend.',
          )
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsTasksLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Auto-hide task success confirmation after 3 seconds.
  useEffect(() => {
    if (!taskSuccessMessage) return undefined
    const timer = setTimeout(() => setTaskSuccessMessage(''), 3000)
    return () => clearTimeout(timer)
  }, [taskSuccessMessage])

  useEffect(() => {
    saveHabitsToStorage(habits)
  }, [habits])

  useEffect(() => {
    saveGoalsToStorage(goals)
  }, [goals])

  useEffect(() => {
    saveEventsToStorage(events)
  }, [events])

  useEffect(() => {
    saveActivitiesToStorage(activities)
  }, [activities])

  function pushActivity(type, title, description) {
    const newEntry = createActivityRecord({ type, title, description })
    setActivities((prev) => [newEntry, ...prev])
  }

  function markTaskBusy(taskId) {
    setPendingTaskIds((prev) =>
      prev.includes(taskId) ? prev : [...prev, taskId],
    )
  }

  function clearTaskBusy(taskId) {
    setPendingTaskIds((prev) => prev.filter((id) => id !== taskId))
  }

  function showTaskSuccess(message) {
    setTasksError('')
    setTaskSuccessMessage(message)
  }

  async function handleRetryLoadTasks() {
    setIsTasksLoading(true)
    setTasksError('')
    try {
      const data = await fetchTasksApi()
      setTasks(Array.isArray(data?.tasks) ? data.tasks : [])
    } catch (err) {
      setTasksError(
        err.message || 'Failed to load tasks from the Flask backend.',
      )
    } finally {
      setIsTasksLoading(false)
    }
  }

  // POST /api/tasks -> save a new task in SQLite and prepend the returned record.
  async function handleAddTask(taskData) {
    try {
      const data = await createTaskApi(taskData)
      const createdTask = data.task
      setTasks((prev) => [createdTask, ...prev])
      pushActivity(
        'task',
        'Task created',
        `Added "${createdTask.title}" (${createdTask.priority} priority)`,
      )
      showTaskSuccess('Task saved to SQLite.')
      return { ok: true }
    } catch (err) {
      const message = err.message || 'Could not save task to the server.'
      setTasksError(message)
      return { ok: false, error: message }
    }
  }

  // PUT /api/tasks/<id> -> update task details in SQLite and refresh state.
  async function handleEditTask(taskId, updatedFields) {
    if (pendingTaskIds.includes(taskId)) {
      return { ok: false, error: 'Task update is already in progress.' }
    }

    markTaskBusy(taskId)
    try {
      const data = await updateTaskApi(taskId, updatedFields)
      const updatedTask = data.task
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updatedTask : task)),
      )
      showTaskSuccess('Task updated.')
      return { ok: true }
    } catch (err) {
      const message = err.message || 'Could not update task.'
      setTasksError(message)
      return { ok: false, error: message }
    } finally {
      clearTaskBusy(taskId)
    }
  }

  // PUT /api/tasks/<id> -> toggle completion status while blocking duplicate clicks.
  async function handleToggleTask(taskId) {
    if (pendingTaskIds.includes(taskId)) return

    const target = tasks.find((task) => task.id === taskId)
    if (!target) return

    const nextCompleted = !target.completed
    markTaskBusy(taskId)
    try {
      const data = await updateTaskApi(taskId, { completed: nextCompleted })
      const updatedTask = data.task
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updatedTask : task)),
      )

      if (nextCompleted) {
        pushActivity(
          'task',
          'Task completed',
          `Completed "${updatedTask.title}"`,
        )
      }
      showTaskSuccess(
        nextCompleted ? 'Task marked completed.' : 'Task marked pending.',
      )
    } catch (err) {
      setTasksError(err.message || 'Could not update task status.')
    } finally {
      clearTaskBusy(taskId)
    }
  }

  // DELETE /api/tasks/<id> -> remove task from SQLite and update state on success.
  async function handleDeleteTask(taskId) {
    if (pendingTaskIds.includes(taskId)) {
      return { ok: false, error: 'Delete is already in progress.' }
    }

    const target = tasks.find((task) => task.id === taskId)
    markTaskBusy(taskId)
    try {
      await deleteTaskApi(taskId)
      setTasks((prev) => prev.filter((task) => task.id !== taskId))

      if (target) {
        pushActivity('task', 'Task deleted', `Removed "${target.title}"`)
      }
      showTaskSuccess('Task deleted.')
      return { ok: true }
    } catch (err) {
      const message = err.message || 'Could not delete task.'
      setTasksError(message)
      return { ok: false, error: message }
    } finally {
      clearTaskBusy(taskId)
    }
  }

  /* Habit Handlers (localStorage - unchanged) */
  function handleAddHabit(habitData) {
    const newHabit = normalizeHabit({
      id: Date.now(),
      ...habitData,
      completedDates: [],
    })
    setHabits((prev) => [newHabit, ...prev])
    pushActivity(
      'habit',
      'Habit created',
      `Added "${newHabit.name}" (${newHabit.category})`,
    )
  }

  function handleEditHabit(habitId, updatedFields) {
    const target = habits.find((habit) => habit.id === habitId)
    if (!target) return

    const updatedHabit = normalizeHabit({ ...target, ...updatedFields })
    setHabits((prev) =>
      prev.map((habit) => (habit.id === habitId ? updatedHabit : habit)),
    )
    pushActivity('habit', 'Habit updated', `Updated "${updatedHabit.name}"`)
  }

  function handleDeleteHabit(habitId) {
    const target = habits.find((habit) => habit.id === habitId)
    setHabits((prev) => prev.filter((habit) => habit.id !== habitId))

    if (target) {
      pushActivity('habit', 'Habit deleted', `Removed "${target.name}"`)
    }
  }

  function handleCompleteHabitForDate(habitId, dateKey) {
    const target = habits.find((habit) => habit.id === habitId)
    if (!target) return

    const { habit: updatedHabit, alreadyCompleted } = markHabitCompletedForDate(
      target,
      dateKey,
    )
    if (alreadyCompleted) return

    setHabits((prev) =>
      prev.map((habit) => (habit.id === habitId ? updatedHabit : habit)),
    )
    pushActivity(
      'habit',
      'Habit completed',
      `Checked off "${updatedHabit.name}" on ${dateKey} (${updatedHabit.streakDays} day streak)`,
    )
  }

  /* Goal Handlers (localStorage - unchanged) */
  function handleAddGoal(goalData) {
    const newGoal = normalizeGoal({
      id: Date.now(),
      ...goalData,
      progress: 0,
    })
    setGoals((prev) => [newGoal, ...prev])
    pushActivity(
      'goal',
      'Goal created',
      `Created "${newGoal.title}" (${newGoal.category})`,
    )
  }

  function handleEditGoal(goalId, updatedFields) {
    const target = goals.find((goal) => goal.id === goalId)
    if (!target) return

    const updatedGoal = normalizeGoal({ ...target, ...updatedFields })
    setGoals((prev) =>
      prev.map((goal) => (goal.id === goalId ? updatedGoal : goal)),
    )

    if (updatedGoal.progress !== target.progress) {
      pushActivity(
        'goal',
        updatedGoal.status === 'Completed'
          ? 'Goal completed'
          : 'Goal progress updated',
        `"${updatedGoal.title}" moved from ${target.progress}% to ${updatedGoal.progress}%`,
      )
    }
  }

  function handleDeleteGoal(goalId) {
    const target = goals.find((goal) => goal.id === goalId)
    setGoals((prev) => prev.filter((goal) => goal.id !== goalId))

    if (target) {
      pushActivity('goal', 'Goal deleted', `Removed "${target.title}"`)
    }
  }

  function handleSetGoalProgress(goalId, rawProgress) {
    const target = goals.find((goal) => goal.id === goalId)
    if (!target) return

    const nextProgress = clampProgress(rawProgress)
    if (nextProgress === target.progress) return

    const nextStatus = getGoalStatus(nextProgress, target.targetDate)
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? { ...goal, progress: nextProgress, status: nextStatus }
          : goal,
      ),
    )

    pushActivity(
      'goal',
      nextStatus === 'Completed' ? 'Goal completed' : 'Goal progress updated',
      `"${target.title}" moved from ${target.progress}% to ${nextProgress}%`,
    )
  }

  /* Calendar Event Handlers (localStorage - unchanged) */
  function handleAddEvent(eventData) {
    const newEvent = normalizeEvent({
      id: Date.now(),
      ...eventData,
    })
    setEvents((prev) => [newEvent, ...prev])
    pushActivity(
      'event',
      'Event scheduled',
      `Added "${newEvent.title}" on ${newEvent.date}`,
    )
  }

  function handleEditEvent(eventId, updatedFields) {
    const target = events.find((event) => event.id === eventId)
    if (!target) return

    const updatedEvent = normalizeEvent({ ...target, ...updatedFields })
    setEvents((prev) =>
      prev.map((event) => (event.id === eventId ? updatedEvent : event)),
    )
    pushActivity(
      'event',
      'Event updated',
      `Updated "${updatedEvent.title}" (${updatedEvent.date})`,
    )
  }

  function handleDeleteEvent(eventId) {
    const target = events.find((event) => event.id === eventId)
    setEvents((prev) => prev.filter((event) => event.id !== eventId))

    if (target) {
      pushActivity('event', 'Event deleted', `Removed "${target.title}"`)
    }
  }

  // Real task statistics calculated directly from SQLite tasks state.
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completed).length
  const pendingTasks = totalTasks - completedTasks
  const activeGoals = goals.filter(
    (goal) => getGoalStatus(goal.progress) !== 'Completed',
  ).length

  return (
    <main className="dashboard-content">
      {activeSection !== 'settings' &&
        activeSection !== 'reports' &&
        activeSection !== 'calendar' && (
          <StatsCards
            totalTasks={totalTasks}
            completedTasks={completedTasks}
            pendingTasks={pendingTasks}
            activeGoals={activeGoals}
          />
        )}

      {activeSection === 'overview' && (
        <div className="dashboard-grid">
          <div className="grid-column">
            <TodayTasks
              tasks={tasks}
              isLoading={isTasksLoading}
              error={tasksError}
              successMessage={taskSuccessMessage}
              pendingTaskIds={pendingTaskIds}
              onRetry={handleRetryLoadTasks}
              onDismissError={() => setTasksError('')}
              onDismissSuccess={() => setTaskSuccessMessage('')}
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
          isLoading={isTasksLoading}
          error={tasksError}
          successMessage={taskSuccessMessage}
          pendingTaskIds={pendingTaskIds}
          onRetry={handleRetryLoadTasks}
          onDismissError={() => setTasksError('')}
          onDismissSuccess={() => setTaskSuccessMessage('')}
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
