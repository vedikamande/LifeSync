import { Calendar, Menu, User } from 'lucide-react'

const FORMATTED_DATE = new Date().toLocaleDateString('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const SECTION_TITLES = {
  overview: 'Overview',
  tasks: 'My Tasks',
  habits: 'Habit Tracker',
  goals: 'My Goals',
  calendar: 'Calendar',
  activities: 'Activities',
  reports: 'Progress reports',
  settings: 'Settings',
}

/**
 * Top bar showing the active workspace title, morning context, formatted date, and profile icon.
 */
function DashboardHeader({ activeSection = 'overview', onOpenMenu }) {
  const pageTitle = SECTION_TITLES[activeSection] || 'Overview'

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button
          type="button"
          className="icon-btn mobile-menu-btn"
          onClick={onOpenMenu}
          aria-label="Open navigation menu"
        >
          <Menu size={16} strokeWidth={1.5} />
        </button>

        <div>
          <h1 className="header-title">{pageTitle}</h1>
          <p className="header-subtitle">Good morning · Daily planner</p>
        </div>
      </div>

      <div className="header-right">
        <div className="date-meta">
          <Calendar size={16} strokeWidth={1.5} />
          <span>{FORMATTED_DATE}</span>
        </div>

        <div className="profile-chip" title="Personal account">
          <span className="profile-avatar" aria-hidden="true">
            <User size={16} strokeWidth={1.5} />
          </span>
          <span className="profile-label">Personal</span>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
