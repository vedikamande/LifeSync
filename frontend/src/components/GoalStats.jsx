import { getGoalSummary } from '../utils/goalUtils.js'

/**
 * Displays the 4 Goal Dashboard figures: Total, Completed, In Progress, Not Started.
 */
function GoalStats({ goals }) {
  const summary = getGoalSummary(goals)

  const items = [
    { label: 'Total goals', value: summary.total },
    { label: 'Completed', value: summary.completed },
    { label: 'In progress', value: summary.inProgress },
    { label: 'Not started', value: summary.notStarted },
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
