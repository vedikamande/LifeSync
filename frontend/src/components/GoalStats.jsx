import { CheckCircle2, CircleDashed, Target, TrendingUp } from 'lucide-react'
import { getGoalSummary } from '../utils/goalUtils.js'

/**
 * Displays the 4 Goal Dashboard metrics: Total, Completed, In Progress, Not Started.
 */
function GoalStats({ goals }) {
  const summary = getGoalSummary(goals)

  const items = [
    {
      label: 'Total Goals',
      value: summary.total,
      icon: Target,
      tone: 'blue',
    },
    {
      label: 'Completed Goals',
      value: summary.completed,
      icon: CheckCircle2,
      tone: 'emerald',
    },
    {
      label: 'In Progress Goals',
      value: summary.inProgress,
      icon: TrendingUp,
      tone: 'lavender',
    },
    {
      label: 'Not Started Goals',
      value: summary.notStarted,
      icon: CircleDashed,
      tone: 'slate',
    },
  ]

  return (
    <div className="goal-stats-grid" aria-label="Goal Dashboard summary">
      {items.map((item) => {
        const Icon = item.icon

        return (
          <div key={item.label} className="goal-stat-box">
            <div className={`goal-stat-icon tone-${item.tone}`}>
              <Icon size={16} />
            </div>
            <div>
              <div className="goal-stat-value">{item.value}</div>
              <div className="goal-stat-label">{item.label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default GoalStats
