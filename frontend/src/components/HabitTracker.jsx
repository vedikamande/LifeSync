import { Check, Flame } from 'lucide-react'

/**
 * Daily habit check-in list for Reading, Exercise, Coding Practice, and Meditation.
 */
function HabitTracker({ habits, onToggleHabit }) {
  const completedCount = habits.filter((habit) => habit.completed).length

  return (
    <section className="dashboard-card" aria-label="Habit Tracker">
      <div className="card-header">
        <div>
          <h2 className="card-title">Habit Tracker</h2>
          <p className="card-subtitle">
            Build consistency with your daily routines.
          </p>
        </div>
        <span className="count-pill lavender-pill">
          {completedCount}/{habits.length} done
        </span>
      </div>

      <ul className="habit-list">
        {habits.map((habit) => (
          <li
            key={habit.id}
            className={`habit-item ${habit.completed ? 'completed' : ''}`}
          >
            <button
              type="button"
              className={`check-btn lavender-check ${habit.completed ? 'checked' : ''}`}
              onClick={() => onToggleHabit(habit.id)}
              aria-label={`Toggle ${habit.name} habit`}
            >
              {habit.completed && <Check size={14} />}
            </button>

            <div className="habit-info">
              <span className="habit-name">{habit.name}</span>
              <span className="habit-streak">
                <Flame size={13} />
                {habit.streak}
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
    </section>
  )
}

export default HabitTracker
