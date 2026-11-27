import { AlertCircle, Calendar, Clock } from 'lucide-react'
import { formatGoalDate } from '../utils/goalUtils.js'

const SOURCE_LABELS = {
  event: 'Event',
  task: 'Task',
  goal: 'Goal',
}

function formatCountdown(daysUntil) {
  if (daysUntil === 0) return 'Today'
  if (daysUntil === 1) return 'Tomorrow'
  return `In ${daysUntil} days`
}

/**
 * Displays chronologically sorted upcoming events, tasks, and goal deadlines with approaching highlights.
 */
function UpcomingActivities({ items, onSelectDate }) {
  return (
    <section className="dashboard-card" aria-label="Upcoming activities">
      <div className="card-header">
        <div>
          <h2 className="card-title">Upcoming activities</h2>
          <p className="card-subtitle">
            Sorted by date and time · approaching deadlines highlighted
          </p>
        </div>

        <span className="count-meta">{items.length} upcoming</span>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <p>No upcoming events, pending tasks, or goal deadlines.</p>
        </div>
      ) : (
        <ul className="upcoming-list">
          {items.map((item) => (
            <li
              key={item.uid}
              className={`upcoming-item ${
                item.isApproaching ? 'is-approaching' : ''
              }`}
            >
              <div className="upcoming-main">
                <div className="upcoming-title-row">
                  <span className={`source-tag source-${item.sourceType}`}>
                    {SOURCE_LABELS[item.sourceType] || 'Item'}
                  </span>

                  <button
                    type="button"
                    className="upcoming-title-btn"
                    onClick={() => onSelectDate(item.date)}
                  >
                    {item.title}
                  </button>
                </div>

                <div className="upcoming-meta">
                  <span className="schedule-time">
                    <Calendar size={13} strokeWidth={1.5} />
                    <span>{formatGoalDate(item.date)}</span>
                  </span>

                  <span className="schedule-time">
                    <Clock size={13} strokeWidth={1.5} />
                    <span>{item.timeLabel}</span>
                  </span>

                  <span className="category-badge">{item.category}</span>
                </div>
              </div>

              {item.isApproaching && (
                <span className="approaching-pill">
                  <AlertCircle size={13} strokeWidth={1.5} />
                  {formatCountdown(item.daysUntil)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default UpcomingActivities
