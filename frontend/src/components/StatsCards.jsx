/**
 * Displays dynamic summary figures computed from live tasks and goals state.
 */
function StatsCards({ totalTasks, completedTasks, pendingTasks, activeGoals }) {
  const cards = [
    {
      label: 'Total tasks',
      value: totalTasks,
      hint: 'Scheduled today',
    },
    {
      label: 'Completed tasks',
      value: completedTasks,
      hint: 'Checked off',
    },
    {
      label: 'Pending tasks',
      value: pendingTasks,
      hint: 'Remaining',
    },
    {
      label: 'Active goals',
      value: activeGoals,
      hint: 'In progress',
    },
  ]

  return (
    <section className="stats-grid" aria-label="Dashboard statistics">
      {cards.map((card) => (
        <article key={card.label} className="stat-card">
          <span className="stat-label">{card.label}</span>
          <div className="stat-value">{card.value}</div>
          <div className="stat-hint">{card.hint}</div>
        </article>
      ))}
    </section>
  )
}

export default StatsCards
