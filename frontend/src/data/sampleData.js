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
  { id: 1, name: 'Reading', streak: '5 day streak', completed: true },
  { id: 2, name: 'Exercise', streak: '3 day streak', completed: false },
  { id: 3, name: 'Coding Practice', streak: '7 day streak', completed: true },
  { id: 4, name: 'Meditation', streak: '4 day streak', completed: false },
]

export const INITIAL_GOALS = [
  {
    id: 1,
    title: 'Learn React',
    description:
      'Master React functional components, props, useState, useEffect, and reusable UI architecture.',
    category: 'Study',
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
    status: 'In Progress',
  },
  {
    id: 3,
    title: 'Improve Python Skills',
    description:
      'Practice Python functions, REST API design, and SQLite queries for backend development.',
    category: 'Study',
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
    category: 'Health',
    startDate: '2026-11-26',
    targetDate: '2026-12-20',
    progress: 0,
    status: 'Not Started',
  },
]

export const INITIAL_ACTIVITIES = [
  {
    id: 1,
    type: 'task',
    title: 'Completed "Review React component props and useState flow"',
    time: 'Earlier today',
  },
  {
    id: 2,
    type: 'goal',
    title: 'Updated "Improve Python Skills" progress to 80%',
    time: 'Yesterday',
  },
  {
    id: 3,
    type: 'goal',
    title: 'Updated "Learn React" progress to 65%',
    time: '2 days ago',
  },
]
