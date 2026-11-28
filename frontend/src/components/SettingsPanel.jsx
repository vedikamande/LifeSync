import { Database, Layers, Server } from 'lucide-react'

/**
 * Informational Settings panel describing the live React, Flask, and SQLite stack.
 */
function SettingsPanel() {
  return (
    <section className="dashboard-card" aria-label="Settings">
      <div className="card-header">
        <div>
          <h2 className="card-title">Workspace settings</h2>
          <p className="card-subtitle">
            Connected React, Flask, and SQLite architecture
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
              Built with React.js, Vite, Lucide icons, and Recharts, communicating
              with Flask through <code>src/api/api.js</code>.
            </p>
          </div>
        </div>

        <div className="settings-row">
          <span className="activity-icon" aria-hidden="true">
            <Server size={16} strokeWidth={1.5} />
          </span>
          <div>
            <h3 className="settings-heading">Backend API (connected)</h3>
            <p className="settings-text">
              Python Flask REST API running at{' '}
              <code>http://127.0.0.1:5000</code> with Flask-CORS enabled.
            </p>
          </div>
        </div>

        <div className="settings-row">
          <span className="activity-icon" aria-hidden="true">
            <Database size={16} strokeWidth={1.5} />
          </span>
          <div>
            <h3 className="settings-heading">Database storage (connected)</h3>
            <p className="settings-text">
              SQLite persistence in <code>backend/data/lifesync.db</code> stores
              tasks, habits, habit logs, goals, and calendar events across
              restarts.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SettingsPanel
