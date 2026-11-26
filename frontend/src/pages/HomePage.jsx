import { useEffect, useState } from 'react'
import GoalsSection from '../components/GoalsSection.jsx'
import HabitTracker from '../components/HabitTracker.jsx'
import RecentActivities from '../components/RecentActivities.jsx'
import ReportsSection from '../components/ReportsSection.jsx'
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
  createActivityRecord,
  loadActivitiesFromStorage,
  saveActivitiesToStorage,
} from '../utils/activityUtils.js'
import {
  clampProgress,
  getGoalStatus,
  loadGoalsFromStorage,
  normalizeGoal,
  saveGoalsToStorage,
} from '../utils/goalUtils.js'
import {
  loadHabitsFromStorage,
  saveHabitsToStorage,
  toggleHabitCompletion,
} from '../utils/habitUtils.js'
import { loadTasksFromStorage, saveTasksToStorage } from '../utils/taskUtils.js'

const OVERVIEW_ACTIVITY_LIMIT = 6

/**
 * Main dashboard workspace coordinating persisted tasks, habits, goals, activities, and progress reports.
 */
function HomePage({ activeSection }) {
  const [tasks, setTasks] = useState(() => loadTasksFromStorage(INITIAL_TASKS))
  const [habits, setHabits] = useState(() =>
    loadHabitsFromStorage(INITIAL_HABITS),
  )
  const [goals, setGoals] = useState(() => loadGoalsFromStorage(INITIAL_GOALS))
  const [activities, setActivities] = useState(() =>
    loadActivitiesFromStorage(INITIAL_ACTIVITIES),
  )

  useEffect(() => {
    saveTasksToStorage(tasks)
  }, [tasks])

  useEffect(() => {
    saveHabitsToStorage(habits)
  }, [habits])

  useEffect(() => {
    saveGoalsToStorage(goals)
  }, [goals])

  useEffect(() => {
    saveActivitiesToStorage(activities)
  }, [activities])

  function pushActivity(type, title, description) {
    const newEntry = createActivityRecord({ type, title, description })
    setActivities((prev) => [newEntry, ...prev])
  }

  function handleAddTask(taskData) {
    const newTask = {
      id: Date.now(),
      ...taskData,
      completed: false,
    }
    setTasks((prev) => [newTask, ...prev])
    pushActivity(
      'task',
      'Task created',
      `Added "${newTask.title}" (${newTask.priority} priority)`,
    )
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
      pushActivity('task', 'Task completed', `Completed "${target.title}"`)
    }
  }

  function handleDeleteTask(taskId) {
    const target = tasks.find((task) => task.id === taskId)
    setTasks((prev) => prev.filter((task) => task.id !== taskId))

    if (target) {
      pushActivity('task', 'Task deleted', `Removed "${target.title}"`)
    }
  }

  function handleToggleHabit(habitId) {
    const target = habits.find((habit) => habit.id === habitId)
    if (!target) return

    const updatedHabit = toggleHabitCompletion(target)
    setHabits((prev) =>
      prev.map((habit) => (habit.id === habitId ? updatedHabit : habit)),
    )

    if (updatedHabit.completed) {
      pushActivity(
        'habit',
        'Habit completed',
        `Checked off "${updatedHabit.name}" (${updatedHabit.streak} streak)`,
      )
    }
  }

  function handleAddGoal(goalData) {
    const newGoal = normalizeGoal({
      id: Date.now(),
      ...goalData,
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
      nextStatus === 'Completed' ? 'Goal completed' : 'Goal progress updated',
      `"${target.title}" moved from ${target.progress}% to ${nextProgress}%`,
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
      {activeSection !== 'settings' && activeSection !== 'reports' && (
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
