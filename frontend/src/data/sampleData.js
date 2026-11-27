import { getTodayDateString } from '../utils/goalUtils.js'
import { getPastDateKeys } from '../utils/habitUtils.js'

function buildHabitLog(activeOffsets) {
  const keys = getPastDateKeys(7, getTodayDateString())
  const log = {}
  keys.forEach((key, index) => {
    const daysAgo = keys.length - 1 - index
    log[key] = activeOffsets.includes(daysAgo)
  })
  return log
}

function buildIsoOffset(daysAgo, hours = 9, minutes = 30) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

export const INITIAL_TASKS = [
  {
    id: 1,
    title: 'Review React component props and useState flow',
    description: 'Practice passing callbacks and state between parent and child components.',
    priority: 'High',
    dueDate: '2026-11-26',
    category: 'Study',
    completed: true,
  },
  {
    id: 2,
    title: 'Design Today’s Tasks layout for LifeSync',
    description: 'Refine task cards, priority badges, and responsive modal spacing.',
    priority: 'High',
    dueDate: '2026-11-27',
    category: 'Work',
    completed: false,
  },
  {
    id: 3,
    title: 'Organize study notes for Python Flask API',
    description: 'Outline REST endpoints for tasks, habits, and goals before backend setup.',
    priority: 'Medium',
    dueDate: '2026-11-28',
    category: 'Study',
    completed: false,
  },
  {
    id: 4,
    title: 'Plan tomorrow’s morning reading session',
    description: 'Pick one chapter on clean JavaScript patterns.',
    priority: 'Low',
    dueDate: '2026-11-29',
    category: 'Personal',
    completed: false,
  },
]

export const INITIAL_HABITS = [
  {
    id: 1,
    name: 'Reading',
    description: 'Read 20 pages of technical or personal growth books.',
    category: 'Learning',
    weeklyLog: buildHabitLog([0, 1, 2, 3, 4]),
  },
  {
    id: 2,
    name: 'Exercise',
    description: '30 minutes of brisk walking, stretching, or strength work.',
    category: 'Health',
    weeklyLog: buildHabitLog([1, 2, 3, 5]),
  },
  {
    id: 3,
    name: 'Coding Practice',
    description: 'Solve coding exercises or build LifeSync components daily.',
    category: 'Learning',
    weeklyLog: buildHabitLog([0, 1, 2, 3, 4, 5, 6]),
  },
  {
    id: 4,
    name: 'Meditation',
    description: '10 minutes of quiet breathing before starting work.',
    category: 'Mindfulness',
    weeklyLog: buildHabitLog([1, 2, 4, 5]),
  },
]

export const INITIAL_GOALS = [
  {
    id: 1,
    title: 'Learn React',
    description:
      'Master React functional components, props, useState, useEffect, and reusable UI architecture.',
    category: 'Education',
    startDate: '2026-10-15',
    targetDate: '2026-11-30',
    progress: 65,
    status: 'In Progress',
  },
  {
    id: 2,
    title: 'Complete Full Stack Project',
    description:
      'Build the complete LifeSync frontend dashboard and prepare it for Python Flask + SQLite integration.',
    category: 'Career',
    startDate: '2026-10-01',
    targetDate: '2026-11-20',
    progress: 40,
    status: 'Overdue',
  },
  {
    id: 3,
    title: 'Improve Python Skills',
    description:
      'Practice Python functions, REST API design, and SQLite queries for backend development.',
    category: 'Education',
    startDate: '2026-11-01',
    targetDate: '2026-12-15',
    progress: 80,
    status: 'In Progress',
  },
  {
    id: 4,
    title: 'Build Morning Fitness Routine',
    description:
      'Establish a consistent 30-minute stretching and cardio schedule three mornings a week.',
    category: 'Fitness',
    startDate: '2026-11-26',
    targetDate: '2026-12-20',
    progress: 0,
    status: 'Not Started',
  },
]

export const INITIAL_ACTIVITIES = [
  {
    id: 'init-1',
    type: 'task',
    title: 'Task completed',
    description: 'Completed "Review React component props and useState flow"',
    timestamp: buildIsoOffset(0, 9, 15),
  },
  {
    id: 'init-2',
    type: 'habit',
    title: 'Habit completed',
    description: 'Checked off "Coding Practice" for today',
    timestamp: buildIsoOffset(0, 8, 30),
  },
  {
    id: 'init-3',
    type: 'goal',
    title: 'Goal progress updated',
    description: '"Improve Python Skills" reached 80%',
    timestamp: buildIsoOffset(1, 18, 45),
  },
  {
    id: 'init-4',
    type: 'goal',
    title: 'Goal progress updated',
    description: '"Learn React" reached 65%',
    timestamp: buildIsoOffset(2, 16, 10),
  },
]

export const INITIAL_EVENTS = [
  {
    id: 1,
    title: 'Sprint Planning & Weekly Review',
    description: 'Review upcoming LifeSync milestones and prioritize tasks.',
    date: getTodayDateString(),
    startTime: '10:00',
    endTime: '10:45',
    category: 'Meeting',
    priority: 'High',
  },
  {
    id: 2,
    title: 'React State & Hooks Study Block',
    description: 'Practice building reusable calendar and modal components.',
    date: '2026-11-28',
    startTime: '15:00',
    endTime: '16:30',
    category: 'Education',
    priority: 'Medium',
  },
  {
    id: 3,
    title: 'Evening Walk & Stretch',
    description: '30-minute outdoor walk away from screens.',
    date: '2026-11-29',
    startTime: '18:00',
    endTime: '18:30',
    category: 'Personal',
    priority: 'Low',
  },
]
