import { Database, Layers, Server } from 'lucide-react'

/**
 * Informational Settings panel explaining current frontend state and future backend plan.
 */
function SettingsPanel() {
  return (
    <section className="dashboard-card" aria-label="Settings">
      <div className="card-header">
        <div>
          <h2 className="card-title">Workspace Settings</h2>
          <p className="card-subtitle">
            Overview of your LifeSync environment and upcoming backend stack.
          </p>
        </div>
      </div>

      <div className="settings-list">
        <div className="settings-row">
          <div className="activity-icon activity-icon-blue">
            <Layers size={16} />
          </div>
          <div>
            <h3 className="settings-heading">Frontend Application</h3>
            <p className="settings-text">
              Built with React.js (JavaScript), Vite, and Lucide icons using
              local sample data via React <code>useState</code>.
            </p>
          </div>
        </div>

        <div className="settings-row">
          <div className="activity-icon activity-icon-lavender">
            <Server size={16} />
          </div>
          <div>
            <h3 className="settings-heading">Backend API (Planned)</h3>
            <p className="settings-text">
              Python Flask REST endpoints will be connected via{' '}
              <code>src/services/api.js</code> in the next phase.
            </p>
          </div>
        </div>

        <div className="settings-row">
          <div className="activity-icon activity-icon-blue">
            <Database size={16} />
          </div>
          <div>
            <h3 className="settings-heading">Database Storage (Planned)</h3>
            <p className="settings-text">
              SQLite persistence will save your tasks, habits, and goals across
              sessions once the backend is added.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SettingsPanel
