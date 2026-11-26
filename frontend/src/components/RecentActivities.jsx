import { CheckCircle2, Flame, TrendingUp } from 'lucide-react'

const ACTIVITY_META = {
  task: { label: 'Task', icon: CheckCircle2, tone: 'blue' },
  goal: { label: 'Goal', icon: TrendingUp, tone: 'lavender' },
  habit: { label: 'Habit', icon: Flame, tone: 'lavender' },
}

/**
 * Activity timeline displaying recently completed tasks and updated goals.
 */
function RecentActivities({ activities }) {
  return (
    <section className="dashboard-card" aria-label="Recent Activities">
      <div className="card-header">
        <div>
          <h2 className="card-title">Recent Activities</h2>
          <p className="card-subtitle">
            Latest completed tasks and updated goals.
          </p>
        </div>
      </div>

      {activities.length === 0 ? (
        <p className="empty-state">
          Complete a task or update a goal to see your recent activity here.
        </p>
      ) : (
        <ul className="activity-list">
          {activities.map((activity) => {
            const meta = ACTIVITY_META[activity.type] || ACTIVITY_META.task
            const Icon = meta.icon

            return (
              <li key={activity.id} className="activity-item">
                <div className={`activity-icon activity-icon-${meta.tone}`}>
                  <Icon size={16} />
                </div>
                <div className="activity-body">
                  <p className="activity-title">{activity.title}</p>
                  <div className="activity-meta">
                    <span className={`activity-tag tag-${meta.tone}`}>
                      {meta.label}
                    </span>
                    <span className="activity-time">{activity.time}</span>
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
