import { Database, Layers, Server } from 'lucide-react'

/**
 * Informational Settings panel explaining current frontend state and backend task integration.
 */
function SettingsPanel() {
  return (
    <section className="dashboard-card" aria-label="Settings">
      <div className="card-header">
        <div>
          <h2 className="card-title">Workspace settings</h2>
          <p className="card-subtitle">
            Frontend environment and Task Manager backend connection
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
              Built with React.js, Vite, Lucide icons, and Recharts. Tasks sync
              with Flask through <code>src/api/api.js</code>, while Habits, Goals,
              and Calendar still use browser <code>localStorage</code>.
            </p>
          </div>
        </div>

        <div className="settings-row">
          <span className="activity-icon" aria-hidden="true">
            <Server size={16} strokeWidth={1.5} />
          </span>
          <div>
            <h3 className="settings-heading">Task Manager API (connected)</h3>
            <p className="settings-text">
              Python Flask REST endpoints (<code>/api/tasks</code>) run at{' '}
              <code>http://127.0.0.1:5000</code> with Flask-CORS enabled.
            </p>
          </div>
        </div>

        <div className="settings-row">
          <span className="activity-icon" aria-hidden="true">
            <Database size={16} strokeWidth={1.5} />
          </span>
          <div>
            <h3 className="settings-heading">SQLite database (tasks)</h3>
            <p className="settings-text">
              SQLite persistence in <code>backend/data/lifesync.db</code> stores
              tasks permanently across browser refreshes and server restarts.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SettingsPanel
