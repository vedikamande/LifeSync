import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import {
  GOAL_CATEGORIES,
  clampProgress,
  getGoalStatus,
  getTodayDateString,
} from '../utils/goalUtils.js'

/**
 * Modal form for adding a new goal or editing an existing goal.
 */
function GoalModal({ initialGoal, onSave, onClose }) {
  const isEditing = Boolean(initialGoal)

  const [title, setTitle] = useState(initialGoal?.title ?? '')
  const [description, setDescription] = useState(initialGoal?.description ?? '')
  const [category, setCategory] = useState(initialGoal?.category ?? 'Study')
  const [startDate, setStartDate] = useState(
    initialGoal?.startDate ?? getTodayDateString(),
  )
  const [targetDate, setTargetDate] = useState(initialGoal?.targetDate ?? '')
  const [progress, setProgress] = useState(
    initialGoal ? clampProgress(initialGoal.progress) : 0,
  )
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

  const derivedStatus = getGoalStatus(progress)

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      setError('Please enter a goal title.')
      return
    }

    if (startDate && targetDate && targetDate < startDate) {
      setError('Target completion date cannot be earlier than the start date.')
      return
    }

    const safeProgress = clampProgress(progress)

    onSave({
      title: trimmedTitle,
      description: description.trim(),
      category,
      startDate,
      targetDate,
      progress: safeProgress,
      status: getGoalStatus(safeProgress),
    })
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="goal-modal-title"
      onClick={onClose}
    >
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 id="goal-modal-title" className="modal-title">
              {isEditing ? 'Edit Goal' : 'Add New Goal'}
            </h3>
            <p className="modal-subtitle">
              {isEditing
                ? 'Update your goal details, deadline, or progress.'
                : 'Define a clear goal, timeline, and starting progress.'}
            </p>
          </div>

          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close goal form"
          >
            <X size={18} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="goal-title" className="form-label">
              Goal Title <span className="required-star">*</span>
            </label>
            <input
              id="goal-title"
              type="text"
              className="form-control"
              placeholder="e.g., Master Python Flask & SQLite"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
                if (error) setError('')
              }}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="goal-description" className="form-label">
              Description <span className="optional-text">(optional)</span>
            </label>
            <textarea
              id="goal-description"
              className="form-control form-textarea"
              rows={3}
              placeholder="Describe what success looks like..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="goal-category" className="form-label">
              Category
            </label>
            <select
              id="goal-category"
              className="form-control"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {GOAL_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="goal-start-date" className="form-label">
                Start Date
              </label>
              <input
                id="goal-start-date"
                type="date"
                className="form-control"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value)
                  if (error) setError('')
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="goal-target-date" className="form-label">
                Target Completion Date
              </label>
              <input
                id="goal-target-date"
                type="date"
                className="form-control"
                value={targetDate}
                onChange={(event) => {
                  setTargetDate(event.target.value)
                  if (error) setError('')
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="progress-input-header">
              <label htmlFor="goal-progress" className="form-label">
                Initial Progress Percentage: <strong>{progress}%</strong>
              </label>
              <span
                className={`goal-status-badge status-${derivedStatus
                  .toLowerCase()
                  .replace(/\s+/g, '-')}`}
              >
                {derivedStatus}
              </span>
            </div>
            <input
              id="goal-progress"
              type="range"
              min="0"
              max="100"
              step="5"
              className="progress-range"
              value={progress}
              onChange={(event) => setProgress(clampProgress(event.target.value))}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {isEditing ? 'Save Changes' : 'Save Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GoalModal
