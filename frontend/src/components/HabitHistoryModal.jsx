import { useEffect, useState } from 'react'
import { Calendar, Flame, X } from 'lucide-react'
import { fetchHabitHistoryApi } from '../api/api.js'
import { formatGoalDate } from '../utils/goalUtils.js'

/**
 * Modal displaying completion history fetched live from Flask (/api/habits/<id>/history).
 */
function HabitHistoryModal({ habit, onClose }) {
  const [historyData, setHistoryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    let cancelled = false

    async function loadHistory() {
      setLoading(true)
      setError('')
      try {
        const result = await fetchHabitHistoryApi(habit.id)
        if (!cancelled) {
          setHistoryData(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load habit history.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadHistory()
    return () => {
      cancelled = true
    }
  }, [habit.id])

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="habit-history-title"
      onClick={onClose}
    >
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 id="habit-history-title" className="modal-title">
              {habit.name} · History
            </h3>
            <p className="modal-subtitle">
              Completion dates stored in SQLite
            </p>
          </div>

          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close habit history"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading completion history...</p>
          </div>
        ) : error ? (
          <div className="feedback-banner banner-error" role="alert">
            <span>{error}</span>
          </div>
        ) : (
          <div className="history-body">
            <div className="history-summary-row">
              <span className="habit-streak-pill">
                <Flame size={14} strokeWidth={1.5} />
                <span>{historyData.streakDays} day streak</span>
              </span>
              <span className="count-meta">
                {historyData.totalCompletions} total check-ins
              </span>
            </div>

            {historyData.history.length === 0 ? (
              <div className="empty-state">
                <p>No check-ins recorded yet for this habit.</p>
              </div>
            ) : (
              <ul className="history-list">
                {historyData.history.map((entry) => (
                  <li key={entry.id} className="history-item">
                    <span className="history-date">
                      <Calendar size={14} strokeWidth={1.5} />
                      <span>{formatGoalDate(entry.completionDate)}</span>
                    </span>
                    <span className="habit-status done">Completed</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default HabitHistoryModal
