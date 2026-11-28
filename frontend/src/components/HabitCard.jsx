import { Check, Flame, History, Pencil, Trash2 } from 'lucide-react'
import { isHabitCompletedOnDate } from '../utils/habitUtils.js'

/**
 * Individual habit card with duplicate-safe daily check-in, streak counter, weekly dots, and edit/delete.
 */
function HabitCard({
  habit,
  selectedDate,
  weekDates,
  onCompleteForDate,
  onViewHistory,
  onEdit,
  onRequestDelete,
}) {
  const isCompletedForDate = isHabitCompletedOnDate(habit, selectedDate)
  const categoryKey = String(habit.category || 'Personal').toLowerCase()

  return (
    <li className={`habit-card ${isCompletedForDate ? 'completed' : ''}`}>
      <div className="habit-card-top">
        <button
          type="button"
          className={`check-btn ${isCompletedForDate ? 'checked' : ''}`}
          onClick={() => onCompleteForDate(habit.id, selectedDate)}
          disabled={isCompletedForDate}
          title={
            isCompletedForDate
              ? 'Already checked in for this date'
              : `Mark "${habit.name}" completed for ${selectedDate}`
          }
          aria-label={
            isCompletedForDate
              ? `${habit.name} already completed on ${selectedDate}`
              : `Mark ${habit.name} completed on ${selectedDate}`
          }
        >
          {isCompletedForDate && <Check size={14} strokeWidth={2} />}
        </button>

        <div className="habit-card-body">
          <div className="habit-title-row">
            <span className="habit-name">{habit.name}</span>
          </div>

          {habit.description && (
            <p className="habit-description">{habit.description}</p>
          )}

          <div className="habit-meta-row">
            <span className="habit-category-badge">
              <span
                className={`habit-dot dot-habit-${categoryKey}`}
                aria-hidden="true"
              />
              {habit.category || 'Personal'}
            </span>

            <span className="habit-streak-pill">
              <Flame size={13} strokeWidth={1.5} />
              <span>{habit.streakDays || 0} day streak</span>
            </span>

            <span
              className={`habit-status ${isCompletedForDate ? 'done' : 'pending'}`}
            >
              {isCompletedForDate ? 'Checked in' : 'Pending'}
            </span>
          </div>
        </div>

        <div className="task-actions">
          <button
            type="button"
            className="action-btn"
            onClick={() => onViewHistory(habit)}
            aria-label={`View history for ${habit.name}`}
            title="View completion history"
          >
            <History size={16} strokeWidth={1.5} />
          </button>

          <button
            type="button"
            className="action-btn"
            onClick={() => onEdit(habit)}
            aria-label={`Edit ${habit.name}`}
            title="Edit habit"
          >
            <Pencil size={16} strokeWidth={1.5} />
          </button>

          <button
            type="button"
            className="action-btn action-btn-danger"
            onClick={() => onRequestDelete(habit)}
            aria-label={`Delete ${habit.name}`}
            title="Delete habit"
          >
            <Trash2 size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="habit-week-row" aria-label="Current week check-ins">
        {weekDates.map((day) => {
          const doneOnDay = isHabitCompletedOnDate(habit, day.dateKey)
          const isSelectedDay = day.dateKey === selectedDate

          return (
            <div
              key={day.dateKey}
              className={`week-day-chip ${doneOnDay ? 'done' : ''} ${
                isSelectedDay ? 'selected' : ''
              }`}
              title={`${day.shortLabel} (${day.dateKey}): ${
                doneOnDay ? 'Completed' : 'Not completed'
              }`}
            >
              <span className="week-day-label">{day.shortLabel.slice(0, 2)}</span>
              <span className="week-day-dot" aria-hidden="true" />
            </div>
          )
        })}
      </div>
    </li>
  )
}

export default HabitCard
