/**
 * Displays dynamic summary statistics fetched from the Flask + SQLite backend.
 */
function StatsCards({ summary }) {
  const cards = [
    {
      label: 'Total tasks',
      value: summary.totalTasks,
      hint: 'In database',
    },
    {
      label: 'Completed tasks',
      value: summary.completedTasks,
      hint: 'Checked off',
    },
    {
      label: 'Pending tasks',
      value: summary.pendingTasks,
      hint: 'Remaining',
    },
    {
      label: 'Upcoming events',
      value: summary.upcomingEvents,
      hint: 'Scheduled',
    },
    {
      label: 'Total habits',
      value: summary.totalHabits,
      hint: 'Tracked routines',
    },
    {
      label: 'Habits today',
      value: summary.completedHabitsToday,
      hint: 'Completed today',
    },
    {
      label: 'Total goals',
      value: summary.totalGoals,
      hint: 'Active & done',
    },
    {
      label: 'Completed goals',
      value: summary.completedGoals,
      hint: '100% reached',
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
