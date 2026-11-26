import { getGoalStatus, getGoalSummary, getTodayDateString } from './goalUtils.js'
import { getPastDateKeys } from './habitUtils.js'

/**
 * Computes Task Statistics from actual tasks state.
 */
export function getTaskReportStats(tasks) {
  const total = tasks.length
  const completed = tasks.filter((task) => task.completed).length
  const pending = total - completed
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100)

  return { total, completed, pending, completionRate }
}

/**
 * Computes Habit Statistics (including weekly completion % and streaks) from actual habits state.
 */
export function getHabitReportStats(
  habits,
  referenceDate = getTodayDateString(),
) {
  const total = habits.length
  const completedToday = habits.filter((habit) => habit.completed).length
  const dateKeys = getPastDateKeys(7, referenceDate)

  if (total === 0) {
    return {
      total: 0,
      completedToday: 0,
      weeklyCompletionRate: 0,
      bestStreak: 0,
      streaks: [],
    }
  }

  let totalChecks = 0
  const totalPossible = total * dateKeys.length

  const streaks = habits.map((habit) => {
    const log = habit.weeklyLog || {}
    for (const key of dateKeys) {
      if (log[key]) totalChecks += 1
    }

    const streakDays =
      typeof habit.streakDays === 'number'
        ? habit.streakDays
        : Number.parseInt(String(habit.streak || '0'), 10) || 0

    return {
      id: habit.id,
      name: habit.name,
      streakDays,
      completedToday: Boolean(habit.completed),
    }
  })

  const weeklyCompletionRate = Math.round((totalChecks / totalPossible) * 100)
  const bestStreak = streaks.reduce(
    (max, item) => Math.max(max, item.streakDays),
    0,
  )

  return {
    total,
    completedToday,
    weeklyCompletionRate,
    bestStreak,
    streaks,
  }
}

/**
 * Computes Goal Statistics including average progress across all goals.
 */
export function getGoalReportStats(goals) {
  const summary = getGoalSummary(goals)
  const averageProgress =
    summary.total === 0
      ? 0
      : Math.round(
          goals.reduce((sum, goal) => sum + (Number(goal.progress) || 0), 0) /
            summary.total,
        )

  return {
    ...summary,
    averageProgress,
  }
}

function formatShortDay(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`)
  if (Number.isNaN(date.getTime())) return dateKey
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

/**
 * Builds 7-day task completion bar chart data from actual tasks and recorded task completion activities.
 */
export function getWeeklyTaskChartData(
  tasks,
  activities = [],
  referenceDate = getTodayDateString(),
) {
  const dateKeys = getPastDateKeys(7, referenceDate)
  const keySet = new Set(dateKeys)

  const countsByDay = Object.fromEntries(
    dateKeys.map((key) => [
      key,
      { dateKey: key, day: formatShortDay(key), completed: 0, pending: 0 },
    ]),
  )

  // Map tasks with due dates in the 7-day window; tasks without a matching date map to today.
  for (const task of tasks) {
    const targetDay =
      task.dueDate && keySet.has(task.dueDate) ? task.dueDate : referenceDate

    if (!countsByDay[targetDay]) continue

    if (task.completed) {
      countsByDay[targetDay].completed += 1
    } else {
      countsByDay[targetDay].pending += 1
    }
  }

  // Also reflect historical task completions logged in activities on earlier days in the window
  // if no scheduled due-date task already counted for that day.
  for (const activity of activities) {
    if (activity.type !== 'task' || !activity.timestamp) continue
    const titleLower = String(activity.title || '').toLowerCase()
    if (!titleLower.includes('completed')) continue

    const dayKey = String(activity.timestamp).slice(0, 10)
    if (dayKey !== referenceDate && countsByDay[dayKey]) {
      countsByDay[dayKey].completed = Math.max(countsByDay[dayKey].completed, 1)
    }
  }

  return dateKeys.map((key) => countsByDay[key])
}

/**
 * Builds Habit completion pie chart data from today's habit status.
 */
export function getHabitPieChartData(habits) {
  if (habits.length === 0) return []

  const completed = habits.filter((habit) => habit.completed).length
  const remaining = habits.length - completed

  return [
    { name: 'Completed today', value: completed },
    { name: 'Remaining', value: remaining },
  ]
}

/**
 * Builds Goal progress bar chart data from actual goals state.
 */
export function getGoalChartData(goals) {
  return goals.map((goal) => ({
    name:
      goal.title.length > 18 ? `${goal.title.slice(0, 16)}…` : goal.title,
    fullTitle: goal.title,
    progress: goal.progress,
    status: getGoalStatus(goal.progress),
  }))
}

/**
 * Builds 7-day Weekly Productivity Line Chart combining habit completion rate and task progress.
 */
export function getWeeklyProductivityChartData(
  tasks,
  habits,
  activities = [],
  referenceDate = getTodayDateString(),
) {
  const dateKeys = getPastDateKeys(7, referenceDate)
  const weeklyTasks = getWeeklyTaskChartData(tasks, activities, referenceDate)
  const taskByKey = Object.fromEntries(
    weeklyTasks.map((entry) => [entry.dateKey, entry]),
  )

  return dateKeys.map((dateKey) => {
    const taskBucket = taskByKey[dateKey] || { completed: 0, pending: 0 }
    const totalDayTasks = taskBucket.completed + taskBucket.pending
    const taskScore =
      totalDayTasks === 0
        ? 0
        : Math.round((taskBucket.completed / totalDayTasks) * 100)

    const habitsCompleted = habits.filter(
      (habit) => habit.weeklyLog && habit.weeklyLog[dateKey],
    ).length
    const habitScore =
      habits.length === 0
        ? 0
        : Math.round((habitsCompleted / habits.length) * 100)

    let score = 0
    if (habits.length > 0 && totalDayTasks > 0) {
      score = Math.round((habitScore + taskScore) / 2)
    } else if (habits.length > 0) {
      score = habitScore
    } else if (totalDayTasks > 0) {
      score = taskScore
    }

    return {
      dateKey,
      day: formatShortDay(dateKey),
      score,
      tasksCompleted: taskBucket.completed,
      habitsCompleted,
    }
  })
}
