import {
  Activity,
  CheckSquare,
  Flame,
  LayoutDashboard,
  Settings,
  Sparkles,
  Target,
  X,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
  { id: 'habits', label: 'Habit Tracker', icon: Flame },
  { id: 'goals', label: 'My Goals', icon: Target },
  { id: 'activities', label: 'Activities', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings },
]

/**
 * Modern SaaS navigation sidebar with responsive drawer support.
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
            <div className="brand-logo" aria-hidden="true">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="brand-name">LifeSync</div>
              <div className="brand-tagline">Personal Suite</div>
            </div>
          </div>

          <button
            type="button"
            className="icon-btn mobile-close-btn"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <X size={18} />
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
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="workspace-pill">
            <span className="workspace-dot" aria-hidden="true" />
            <span>Frontend Mode (Local Data)</span>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
