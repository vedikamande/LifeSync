import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckSquare,
  Flame,
  LayoutDashboard,
  Settings,
  Target,
  X,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
  { id: 'habits', label: 'Habit Tracker', icon: Flame },
  { id: 'goals', label: 'My Goals', icon: Target },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'activities', label: 'Activities', icon: Activity },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

/**
 * Quiet left navigation sidebar with flat brand mark and responsive drawer support.
 */
function Sidebar({ activeSection, onSelectSection, isOpen, onClose }) {
  function handleNavClick(sectionId) {
    onSelectSection(sectionId)
    onClose()
  }

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
        aria-label="Sidebar navigation"
      >
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <svg
              className="brand-mark"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <rect x="2" y="3" width="16" height="2.2" rx="1.1" fill="currentColor" />
              <rect x="2" y="8.9" width="11" height="2.2" rx="1.1" fill="currentColor" />
              <rect x="2" y="14.8" width="14" height="2.2" rx="1.1" fill="#1d4ed8" />
            </svg>
            <span className="brand-name">LifeSync</span>
          </div>

          <button
            type="button"
            className="icon-btn mobile-close-btn"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <span className="nav-icon-box" aria-hidden="true">
                  <Icon size={16} strokeWidth={1.5} />
                </span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <span className="workspace-caption">Flask + SQLite</span>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
