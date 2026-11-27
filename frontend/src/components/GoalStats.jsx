import { getGoalSummary } from '../utils/goalUtils.js'

/**
 * Displays Goal Dashboard metrics: Total, Completed, Active, Overdue, and Overall Progress.
 */
function GoalStats({ goals }) {
  const summary = getGoalSummary(goals)

  const items = [
    { label: 'Total goals', value: summary.total },
    { label: 'Completed goals', value: summary.completed },
    { label: 'Active goals', value: summary.active },
    { label: 'Overdue goals', value: summary.overdue },
    { label: 'Overall progress', value: `${summary.overallProgress}%` },
  ]

  return (
    <div className="goal-stats-grid" aria-label="Goal Dashboard summary">
      {items.map((item) => (
        <div key={item.label} className="goal-stat-box">
          <div className="goal-stat-label">{item.label}</div>
          <div className="goal-stat-value">{item.value}</div>
        </div>
      ))}
    </div>
  )
}

export default GoalStats
