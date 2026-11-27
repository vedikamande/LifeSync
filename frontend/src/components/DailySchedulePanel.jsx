import { Clock, Pencil, Plus, Trash2 } from 'lucide-react'
import { formatGoalDate } from '../utils/goalUtils.js'

const SOURCE_LABELS = {
  event: 'Event',
  task: 'Task',
  habit: 'Habit',
  goal: 'Goal',
}

/**
 * Displays all activities (events, tasks, habits, goal deadlines) for the selected calendar date.
 */
function DailySchedulePanel({
  selectedDate,
  items,
  onOpenAddEvent,
  onEditEvent,
  onRequestDeleteEvent,
}) {
  return (
    <section className="dashboard-card" aria-label="Daily schedule">
      <div className="card-header">
        <div>
          <h2 className="card-title">{formatGoalDate(selectedDate)}</h2>
          <p className="card-subtitle">
            {items.length}{' '}
            {items.length === 1 ? 'scheduled item' : 'scheduled items'}
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => onOpenAddEvent(selectedDate)}
        >
          <Plus size={16} strokeWidth={1.5} />
          <span>Add event</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <p>No activities scheduled for {formatGoalDate(selectedDate)}.</p>
        </div>
      ) : (
        <ul className="schedule-list">
          {items.map((item) => {
            const statusClass = String(item.status || 'Scheduled')
              .toLowerCase()
              .replace(/\s+/g, '-')

            return (
              <li key={item.uid} className="schedule-item">
                <div className="schedule-item-top">
                  <div className="schedule-title-wrap">
                    <span className={`source-tag source-${item.sourceType}`}>
                      {SOURCE_LABELS[item.sourceType] || 'Item'}
                    </span>
                    <span className="schedule-title">{item.title}</span>
                  </div>

                  {item.sourceType === 'event' && (
                    <div className="task-actions">
                      <button
                        type="button"
                        className="action-btn"
                        onClick={() => onEditEvent(item.rawEvent)}
                        aria-label={`Edit "${item.title}"`}
                        title="Edit event"
                      >
                        <Pencil size={16} strokeWidth={1.5} />
                      </button>

                      <button
                        type="button"
                        className="action-btn action-btn-danger"
                        onClick={() => onRequestDeleteEvent(item.rawEvent)}
                        aria-label={`Delete "${item.title}"`}
                        title="Delete event"
                      >
                        <Trash2 size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  )}
                </div>

                {item.description && (
                  <p className="schedule-description">{item.description}</p>
                )}

                <div className="schedule-meta-row">
                  <span className="schedule-time">
                    <Clock size={13} strokeWidth={1.5} />
                    <span>{item.timeLabel}</span>
                  </span>

                  <span className="category-badge">{item.category}</span>

                  {item.priority && (
                    <span
                      className={`priority-badge priority-${item.priority.toLowerCase()}`}
                    >
                      {item.priority}
                    </span>
                  )}

                  <span className={`schedule-status status-tag-${statusClass}`}>
                    {item.status}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default DailySchedulePanel
