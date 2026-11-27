import { getTodayDateString } from '../utils/goalUtils.js'
import { getHabitDashboardSummary } from '../utils/habitUtils.js'

/**
 * Displays the 4 Habit Dashboard figures: total, completed today, pending, and completion percentage.
 */
function HabitStats({ habits, selectedDate }) {
  const summary = getHabitDashboardSummary(habits, selectedDate)
  const isToday = selectedDate === getTodayDateString()

  const items = [
    { label: 'Total habits', value: summary.total },
    {
      label: isToday ? 'Completed today' : 'Completed on date',
      value: summary.completedToday,
    },
    { label: 'Pending habits', value: summary.pending },
    { label: 'Completion rate', value: `${summary.completionRate}%` },
  ]

  return (
    <div className="habit-stats-grid" aria-label="Habit Dashboard summary">
      {items.map((item) => (
        <div key={item.label} className="habit-stat-box">
          <div className="habit-stat-label">{item.label}</div>
          <div className="habit-stat-value">{item.value}</div>
        </div>
      ))}
    </div>
  )
}

export default HabitStats
