import { useEffect } from 'react'
import { AlertCircle, Calendar, Clock, Pencil, Target, X } from 'lucide-react'
import {
  formatGoalDate,
  getDeadlineInfo,
  getGoalStatus,
} from '../utils/goalUtils.js'

/**
 * Modal displaying full details for a selected goal.
 */
function GoalDetailsModal({ goal, onEdit, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const status = getGoalStatus(goal.progress)
  const deadline = getDeadlineInfo(goal.targetDate, goal.progress)

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="goal-details-title"
      onClick={onClose}
    >
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div className="goal-details-heading">
            <span className="goal-icon" aria-hidden="true">
              <Target size={17} />
            </span>
            <div>
              <h3 id="goal-details-title" className="modal-title">
                {goal.title}
              </h3>
              <div className="goal-details-badges">
                <span
                  className={`goal-category-badge category-${goal.category.toLowerCase()}`}
                >
                  {goal.category}
                </span>
                <span
                  className={`goal-status-badge status-${status
                    .toLowerCase()
                    .replace(/\s+/g, '-')}`}
                >
                  {status}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close goal details"
          >
            <X size={18} />
          </button>
        </div>

        <div className="goal-details-body">
          <div className="details-block">
            <div className="details-label">Description</div>
            <p className="details-text">
              {goal.description || 'No description provided for this goal.'}
            </p>
          </div>

          <div className="details-dates-grid">
            <div className="details-date-card">
              <div className="details-label">
                <Calendar size={13} />
                <span>Start Date</span>
              </div>
              <div className="details-value">
                {formatGoalDate(goal.startDate)}
              </div>
            </div>

            <div className="details-date-card">
              <div className="details-label">
                <Clock size={13} />
                <span>Target Deadline</span>
              </div>
              <div className="details-value">
                {formatGoalDate(goal.targetDate)}
              </div>
            </div>
          </div>

          {(deadline.state === 'overdue' || deadline.state === 'upcoming') && (
            <div className={`deadline-banner deadline-${deadline.state}`}>
              <AlertCircle size={16} />
              <span>{deadline.badgeText}</span>
            </div>
          )}

          <div className="details-block">
            <div className="details-progress-top">
              <span className="details-label">Current Progress</span>
              <strong className="goal-percent">{goal.progress}%</strong>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-valuenow={goal.progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`progress-fill ${goal.progress === 100 ? 'progress-complete' : ''}`}
                style={{ width: `${goal.progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => onEdit(goal)}
          >
            <Pencil size={15} />
            <span>Edit Goal</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default GoalDetailsModal
