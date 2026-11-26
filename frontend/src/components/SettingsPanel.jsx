import { Database, Layers, Server } from 'lucide-react'

/**
 * Informational Settings panel explaining current frontend state and future backend plan.
 */
function SettingsPanel() {
  return (
    <section className="dashboard-card" aria-label="Settings">
      <div className="card-header">
        <div>
          <h2 className="card-title">Workspace settings</h2>
          <p className="card-subtitle">
            Frontend environment and planned backend stack
          </p>
        </div>
      </div>

      <div className="settings-list">
        <div className="settings-row">
          <span className="activity-icon" aria-hidden="true">
            <Layers size={16} strokeWidth={1.5} />
          </span>
          <div>
            <h3 className="settings-heading">Frontend application</h3>
            <p className="settings-text">
              Built with React.js, Vite, and Lucide icons using browser{' '}
              <code>localStorage</code> persistence via <code>useState</code> and{' '}
              <code>useEffect</code>.
            </p>
          </div>
        </div>

        <div className="settings-row">
          <span className="activity-icon" aria-hidden="true">
            <Server size={16} strokeWidth={1.5} />
          </span>
          <div>
            <h3 className="settings-heading">Backend API (planned)</h3>
            <p className="settings-text">
              Python Flask REST endpoints will connect through{' '}
              <code>src/services/api.js</code> in the next phase.
            </p>
          </div>
        </div>

        <div className="settings-row">
          <span className="activity-icon" aria-hidden="true">
            <Database size={16} strokeWidth={1.5} />
          </span>
          <div>
            <h3 className="settings-heading">Database storage (planned)</h3>
            <p className="settings-text">
              SQLite persistence will store tasks, habits, and goals across
              sessions once the backend is connected.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SettingsPanel
