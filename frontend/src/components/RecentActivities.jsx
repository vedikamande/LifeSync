import { useState } from 'react'
import { CalendarDays, CheckCircle2, Flame, TrendingUp } from 'lucide-react'
import {
  ACTIVITY_FILTERS,
  filterActivities,
  formatActivityDateTime,
  sortActivitiesNewestFirst,
} from '../utils/activityUtils.js'

const ACTIVITY_META = {
  task: { label: 'Task', icon: CheckCircle2 },
  goal: { label: 'Goal', icon: TrendingUp },
  habit: { label: 'Habit', icon: Flame },
  event: { label: 'Event', icon: CalendarDays },
}

/**
 * Activity timeline displaying recorded tasks, habits, and goals newest-first with type filters.
 */
function RecentActivities({ activities, maxItems = null }) {
  const [activeFilter, setActiveFilter] = useState('All')

  const sorted = sortActivitiesNewestFirst(activities)
  const filtered = filterActivities(sorted, activeFilter)
  const visibleActivities =
    typeof maxItems === 'number' ? filtered.slice(0, maxItems) : filtered

  return (
    <section className="dashboard-card" aria-label="Activities">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            {maxItems ? 'Recent activities' : 'Activity log'}
          </h2>
          <p className="card-subtitle">
            Recorded task, habit, and goal updates
          </p>
        </div>

        <span className="count-meta">{filtered.length} logged</span>
      </div>

      <div className="activity-filter-bar" role="group" aria-label="Filter activities">
        {ACTIVITY_FILTERS.map((filterLabel) => (
          <button
            key={filterLabel}
            type="button"
            className={`filter-tab ${activeFilter === filterLabel ? 'active' : ''}`}
            onClick={() => setActiveFilter(filterLabel)}
          >
            {filterLabel}
          </button>
        ))}
      </div>

      {activities.length === 0 ? (
        <div className="empty-state">
          <p>No activities recorded yet. Complete a task, habit, or goal to begin.</p>
        </div>
      ) : visibleActivities.length === 0 ? (
        <div className="empty-state">
          <p>No {activeFilter.toLowerCase()} activities recorded yet.</p>
        </div>
      ) : (
        <ul className="activity-list">
          {visibleActivities.map((activity) => {
            const meta = ACTIVITY_META[activity.type] || ACTIVITY_META.task
            const Icon = meta.icon
            const { dateLabel, timeLabel } = formatActivityDateTime(
              activity.timestamp,
            )

            return (
              <li key={activity.id} className="activity-item">
                <span className="activity-icon" aria-hidden="true">
                  <Icon size={16} strokeWidth={1.5} />
                </span>

                <div className="activity-body">
                  <div className="activity-header-row">
                    <span className="activity-title">{activity.title}</span>
                    <span className="activity-tag">{meta.label}</span>
                  </div>

                  {activity.description && (
                    <p className="activity-description">
                      {activity.description}
                    </p>
                  )}

                  <div className="activity-meta">
                    <span className="activity-time">
                      {timeLabel ? `${dateLabel} · ${timeLabel}` : dateLabel}
                    </span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default RecentActivities
