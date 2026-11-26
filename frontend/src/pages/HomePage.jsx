import { useEffect, useState } from 'react'
import GoalsSection from '../components/GoalsSection.jsx'
import HabitTracker from '../components/HabitTracker.jsx'
import RecentActivities from '../components/RecentActivities.jsx'
import SettingsPanel from '../components/SettingsPanel.jsx'
import StatsCards from '../components/StatsCards.jsx'
import TodayTasks from '../components/TodayTasks.jsx'
import {
  INITIAL_ACTIVITIES,
  INITIAL_GOALS,
  INITIAL_HABITS,
  INITIAL_TASKS,
} from '../data/sampleData.js'
import {
  clampProgress,
  getGoalStatus,
  loadGoalsFromStorage,
  normalizeGoal,
  saveGoalsToStorage,
} from '../utils/goalUtils.js'
import { loadTasksFromStorage, saveTasksToStorage } from '../utils/taskUtils.js'

const MAX_RECENT_ACTIVITIES = 6

/**
 * Main dashboard workspace coordinating tasks, habits, goals (persisted in localStorage), and live activities.
 */
function HomePage({ activeSection }) {
  const [tasks, setTasks] = useState(() => loadTasksFromStorage(INITIAL_TASKS))
  const [habits, setHabits] = useState(INITIAL_HABITS)
  const [goals, setGoals] = useState(() => loadGoalsFromStorage(INITIAL_GOALS))
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES)

  useEffect(() => {
    saveTasksToStorage(tasks)
  }, [tasks])

  useEffect(() => {
    saveGoalsToStorage(goals)
  }, [goals])

  function pushActivity(type, title) {
    const newEntry = {
      id: Date.now() + Math.random(),
      type,
      title,
      time: 'Just now',
    }
    setActivities((prev) => [newEntry, ...prev].slice(0, MAX_RECENT_ACTIVITIES))
  }

  function handleAddTask(taskData) {
    const newTask = {
      id: Date.now(),
      ...taskData,
      completed: false,
    }
    setTasks((prev) => [newTask, ...prev])
  }

  function handleEditTask(taskId, updatedFields) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, ...updatedFields } : task,
      ),
    )
  }

  function handleToggleTask(taskId) {
    const target = tasks.find((task) => task.id === taskId)
    if (!target) return

    const nextCompleted = !target.completed
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: nextCompleted } : task,
      ),
    )

    if (nextCompleted) {
      pushActivity('task', `Completed "${target.title}"`)
    }
  }

  function handleDeleteTask(taskId) {
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
  }

  function handleToggleHabit(habitId) {
    const target = habits.find((habit) => habit.id === habitId)
    if (!target) return

    const nextCompleted = !target.completed
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === habitId ? { ...habit, completed: nextCompleted } : habit,
      ),
    )

    if (nextCompleted) {
      pushActivity('habit', `Checked off "${target.name}" habit`)
    }
  }

  function handleAddGoal(goalData) {
    const newGoal = normalizeGoal({
      id: Date.now(),
      ...goalData,
    })
    setGoals((prev) => [newGoal, ...prev])
    pushActivity('goal', `Created new goal "${newGoal.title}"`)
  }

  function handleEditGoal(goalId, updatedFields) {
    const target = goals.find((goal) => goal.id === goalId)
    if (!target) return

    const updatedGoal = normalizeGoal({ ...target, ...updatedFields })
    setGoals((prev) =>
      prev.map((goal) => (goal.id === goalId ? updatedGoal : goal)),
    )
    pushActivity(
      'goal',
      updatedGoal.status === 'Completed'
        ? `Completed goal "${updatedGoal.title}"`
        : `Updated goal "${updatedGoal.title}" (${updatedGoal.progress}%)`,
    )
  }

  function handleDeleteGoal(goalId) {
    setGoals((prev) => prev.filter((goal) => goal.id !== goalId))
  }

  function handleSetGoalProgress(goalId, rawProgress) {
    const target = goals.find((goal) => goal.id === goalId)
    if (!target) return

    const nextProgress = clampProgress(rawProgress)
    if (nextProgress === target.progress) return

    const nextStatus = getGoalStatus(nextProgress)
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? { ...goal, progress: nextProgress, status: nextStatus }
          : goal,
      ),
    )

    pushActivity(
      'goal',
      nextStatus === 'Completed'
        ? `Completed goal "${target.title}" (100%)`
        : `Updated "${target.title}" progress to ${nextProgress}%`,
    )
  }

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completed).length
  const pendingTasks = totalTasks - completedTasks
  const activeGoals = goals.filter(
    (goal) => getGoalStatus(goal.progress) !== 'Completed',
  ).length

  return (
    <main className="dashboard-content">
      {activeSection !== 'settings' && (
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
            <HabitTracker habits={habits} onToggleHabit={handleToggleHabit} />
            <RecentActivities activities={activities} />
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
        <HabitTracker habits={habits} onToggleHabit={handleToggleHabit} />
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

      {activeSection === 'activities' && (
        <RecentActivities activities={activities} />
      )}

      {activeSection === 'settings' && <SettingsPanel />}
    </main>
  )
}

export default HomePage
