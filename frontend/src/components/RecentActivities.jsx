import { CheckCircle2, Flame, TrendingUp } from 'lucide-react'

const ACTIVITY_META = {
  task: { label: 'Task', icon: CheckCircle2 },
  goal: { label: 'Goal', icon: TrendingUp },
  habit: { label: 'Habit', icon: Flame },
}

/**
 * Activity timeline displaying recently completed tasks, habits, and updated goals.
 */
function RecentActivities({ activities }) {
  return (
    <section className="dashboard-card" aria-label="Recent Activities">
      <div className="card-header">
        <div>
          <h2 className="card-title">Recent activities</h2>
          <p className="card-subtitle">Completed tasks and goal updates</p>
        </div>
      </div>

      {activities.length === 0 ? (
        <p className="empty-state">
          Complete a task or update a goal to see recent activity here.
        </p>
      ) : (
        <ul className="activity-list">
          {activities.map((activity) => {
            const meta = ACTIVITY_META[activity.type] || ACTIVITY_META.task
            const Icon = meta.icon

            return (
              <li key={activity.id} className="activity-item">
                <span className="activity-icon" aria-hidden="true">
                  <Icon size={16} strokeWidth={1.5} />
                </span>
                <div className="activity-body">
                  <p className="activity-title">{activity.title}</p>
                  <div className="activity-meta">
                    <span className="activity-tag">{meta.label}</span>
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
