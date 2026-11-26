import { Calendar, Menu, User } from 'lucide-react'

const FORMATTED_DATE = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

/**
 * Top dashboard header showing greeting, formatted current date, and profile icon.
 */
function DashboardHeader({ onOpenMenu }) {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button
          type="button"
          className="icon-btn mobile-menu-btn"
          onClick={onOpenMenu}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 className="header-greeting">Good Morning!</h1>
          <p className="header-subtitle">
            Stay organized and track your daily progress in LifeSync.
          </p>
        </div>
      </div>

      <div className="header-right">
        <div className="date-badge">
          <Calendar size={16} />
          <span>{FORMATTED_DATE}</span>
        </div>

        <div className="profile-badge" title="User Profile">
          <div className="profile-avatar">
            <User size={18} />
          </div>
          <span className="profile-label">Personal</span>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
