import { CheckCircle2, Clock, ListTodo, Target } from 'lucide-react'

/**
 * Displays dynamic summary metrics computed from tasks and goals state.
 */
function StatsCards({ totalTasks, completedTasks, pendingTasks, activeGoals }) {
  const cards = [
    {
      label: 'Total Tasks',
      value: totalTasks,
      hint: 'Scheduled today',
      icon: ListTodo,
      accent: 'blue',
    },
    {
      label: 'Completed Tasks',
      value: completedTasks,
      hint: 'Finished so far',
      icon: CheckCircle2,
      accent: 'lavender',
    },
    {
      label: 'Pending Tasks',
      value: pendingTasks,
      hint: 'Remaining to do',
      icon: Clock,
      accent: 'blue',
    },
    {
      label: 'Active Goals',
      value: activeGoals,
      hint: 'In progress',
      icon: Target,
      accent: 'lavender',
    },
  ]

  return (
    <section className="stats-grid" aria-label="Dashboard statistics">
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <article key={card.label} className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">{card.label}</span>
              <div className={`stat-icon stat-icon-${card.accent}`}>
                <Icon size={18} />
              </div>
            </div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-hint">{card.hint}</div>
          </article>
        )
      })}
    </section>
  )
}

export default StatsCards
