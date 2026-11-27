import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  buildMonthCalendarDays,
  formatMonthYear,
} from '../utils/calendarUtils.js'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * Interactive monthly calendar grid with month navigation, today/selected highlights, and activity dots.
 */
function CalendarGrid({
  viewYear,
  viewMonth,
  selectedDate,
  todayKey,
  indicatorMap,
  onPrevMonth,
  onNextMonth,
  onGoToToday,
  onSelectDate,
}) {
  const days = buildMonthCalendarDays(viewYear, viewMonth)
  const monthLabel = formatMonthYear(viewYear, viewMonth)

  return (
    <section className="dashboard-card" aria-label="Monthly Calendar">
      <div className="calendar-toolbar">
        <div>
          <h2 className="card-title">{monthLabel}</h2>
          <p className="card-subtitle">
            Click a date to view events, tasks, habits, and goal deadlines
          </p>
        </div>

        <div className="calendar-nav-controls">
          <button
            type="button"
            className="btn-secondary"
            onClick={onGoToToday}
          >
            Today
          </button>

          <button
            type="button"
            className="icon-btn"
            onClick={onPrevMonth}
            aria-label="Previous month"
            title="Previous month"
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>

          <button
            type="button"
            className="icon-btn"
            onClick={onNextMonth}
            aria-label="Next month"
            title="Next month"
          >
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="calendar-weekdays" aria-hidden="true">
        {WEEKDAYS.map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid" role="grid" aria-label={monthLabel}>
        {days.map((cell) => {
          const isToday = cell.dateKey === todayKey
          const isSelected = cell.dateKey === selectedDate
          const indicators = indicatorMap[cell.dateKey]

          return (
            <button
              key={cell.dateKey}
              type="button"
              className={`calendar-day ${
                cell.isCurrentMonth ? '' : 'outside-month'
              } ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}`}
              onClick={() => onSelectDate(cell.dateKey)}
              aria-label={`Select ${cell.dateKey}`}
              aria-pressed={isSelected}
            >
              <span className="calendar-day-num">{cell.dayNumber}</span>

              {indicators && (
                <span className="calendar-dots" aria-hidden="true">
                  {indicators.hasEvent && (
                    <span className="cal-dot dot-event" title="Event" />
                  )}
                  {indicators.hasTask && (
                    <span className="cal-dot dot-task" title="Task due" />
                  )}
                  {indicators.hasHabit && (
                    <span className="cal-dot dot-habit" title="Habit" />
                  )}
                  {indicators.hasGoal && (
                    <span className="cal-dot dot-goal" title="Goal deadline" />
                  )}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="calendar-legend" aria-label="Calendar indicator legend">
        <span className="legend-item">
          <span className="cal-dot dot-event" />
          Events
        </span>
        <span className="legend-item">
          <span className="cal-dot dot-task" />
          Tasks
        </span>
        <span className="legend-item">
          <span className="cal-dot dot-habit" />
          Habits
        </span>
        <span className="legend-item">
          <span className="cal-dot dot-goal" />
          Goal deadlines
        </span>
      </div>
    </section>
  )
}

export default CalendarGrid
