import { Check } from 'lucide-react'

/**
 * Daily habit check-in list for Reading, Exercise, Coding Practice, and Meditation.
 */
function HabitTracker({ habits, onToggleHabit }) {
  const completedCount = habits.filter((habit) => habit.completed).length

  return (
    <section className="dashboard-card" aria-label="Habit Tracker">
      <div className="card-header">
        <div>
          <h2 className="card-title">Habit tracker</h2>
          <p className="card-subtitle">Daily routine check-ins</p>
        </div>
        <span className="count-meta">
          {completedCount}/{habits.length} done
        </span>
      </div>

      {habits.length === 0 ? (
        <div className="empty-state">
          <p>No habits configured.</p>
        </div>
      ) : (
        <ul className="habit-list">
          {habits.map((habit) => (
            <li
              key={habit.id}
              className={`habit-item ${habit.completed ? 'completed' : ''}`}
            >
              <button
                type="button"
                className={`check-btn ${habit.completed ? 'checked' : ''}`}
                onClick={() => onToggleHabit(habit.id)}
                aria-label={`Toggle ${habit.name} habit`}
              >
                {habit.completed && <Check size={14} strokeWidth={2} />}
              </button>

              <div className="habit-info">
                <span className="habit-name">{habit.name}</span>
                <span className="habit-streak">
                  {habit.streak || `${habit.streakDays || 0} days`} streak
                </span>
              </div>

              <span
                className={`habit-status ${habit.completed ? 'done' : 'pending'}`}
              >
                {habit.completed ? 'Done' : 'Pending'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default HabitTracker
