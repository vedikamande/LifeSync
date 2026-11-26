import {
  AlertCircle,
  Calendar,
  Eye,
  Minus,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import {
  formatGoalDate,
  getDeadlineInfo,
  getGoalStatus,
} from '../utils/goalUtils.js'

/**
 * Individual goal card with category dot, status/deadline tags, progress bar, and actions.
 */
function GoalCard({
  goal,
  onSetProgress,
  onViewDetails,
  onEdit,
  onRequestDelete,
}) {
  const status = getGoalStatus(goal.progress)
  const deadline = getDeadlineInfo(goal.targetDate, goal.progress)

  return (
    <article
      className={`goal-card ${deadline.state === 'overdue' ? 'goal-overdue' : ''} ${
        status === 'Completed' ? 'goal-completed' : ''
      }`}
    >
      <div className="goal-card-top">
        <div className="goal-heading-block">
          <button
            type="button"
            className="goal-title-btn"
            onClick={() => onViewDetails(goal)}
          >
            {goal.title}
          </button>

          <div className="goal-badges-row">
            <span className="goal-category-badge">
              <span
                className={`category-dot dot-${goal.category.toLowerCase()}`}
                aria-hidden="true"
              />
              {goal.category}
            </span>

            <span
              className={`goal-status-badge status-${status
                .toLowerCase()
                .replace(/\s+/g, '-')}`}
            >
              {status}
            </span>

            {deadline.state === 'overdue' && (
              <span className="deadline-pill deadline-overdue">
                <AlertCircle size={14} strokeWidth={1.5} />
                {deadline.badgeText}
              </span>
            )}

            {deadline.state === 'upcoming' && (
              <span className="deadline-pill deadline-upcoming">
                <Calendar size={14} strokeWidth={1.5} />
                {deadline.badgeText}
              </span>
            )}
          </div>
        </div>

        <div className="goal-actions">
          <button
            type="button"
            className="action-btn"
            onClick={() => onViewDetails(goal)}
            aria-label={`View details for ${goal.title}`}
            title="View details"
          >
            <Eye size={16} strokeWidth={1.5} />
          </button>

          <button
            type="button"
            className="action-btn"
            onClick={() => onEdit(goal)}
            aria-label={`Edit ${goal.title}`}
            title="Edit goal"
          >
            <Pencil size={16} strokeWidth={1.5} />
          </button>

          <button
            type="button"
            className="action-btn action-btn-danger"
            onClick={() => onRequestDelete(goal)}
            aria-label={`Delete ${goal.title}`}
            title="Delete goal"
          >
            <Trash2 size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {goal.description && (
        <p className="goal-description">{goal.description}</p>
      )}

      <div className="goal-progress-section">
        <div className="goal-progress-meta">
          <span className="goal-deadline-text">
            <Calendar size={14} strokeWidth={1.5} />
            <span>
              Deadline{' '}
              {goal.targetDate
                ? formatGoalDate(goal.targetDate)
                : 'Not set'}
            </span>
          </span>

          <div className="goal-controls">
            <button
              type="button"
              className="step-btn"
              onClick={() => onSetProgress(goal.id, goal.progress - 10)}
              disabled={goal.progress <= 0}
              aria-label={`Decrease progress for ${goal.title}`}
            >
              <Minus size={14} strokeWidth={1.5} />
            </button>
            <span className="goal-percent">{goal.progress}%</span>
            <button
              type="button"
              className="step-btn"
              onClick={() => onSetProgress(goal.id, goal.progress + 10)}
              disabled={goal.progress >= 100}
              aria-label={`Increase progress for ${goal.title}`}
            >
              <Plus size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div
          className="progress-track"
          role="progressbar"
          aria-valuenow={goal.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${goal.title} progress`}
        >
          <div
            className={`progress-fill ${goal.progress === 100 ? 'progress-complete' : ''}`}
            style={{ width: `${goal.progress}%` }}
          />
        </div>

        <input
          type="range"
          min="0"
          max="100"
          step="5"
          className="progress-range compact-range"
          value={goal.progress}
          onChange={(event) => onSetProgress(goal.id, Number(event.target.value))}
          aria-label={`Adjust progress slider for ${goal.title}`}
        />
      </div>
    </article>
  )
}

export default GoalCard
