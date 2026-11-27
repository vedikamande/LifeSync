import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { HABIT_CATEGORIES } from '../utils/habitUtils.js'

/**
 * Modal form for creating a new habit or editing an existing habit.
 */
function HabitModal({ initialHabit, onSave, onClose }) {
  const isEditing = Boolean(initialHabit)

  const [name, setName] = useState(initialHabit?.name ?? '')
  const [description, setDescription] = useState(
    initialHabit?.description ?? '',
  )
  const [category, setCategory] = useState(initialHabit?.category ?? 'Health')
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

  function handleSubmit(event) {
    event.preventDefault()
    const trimmedName = name.trim()

    if (!trimmedName) {
      setError('Please enter a habit name.')
      return
    }

    onSave({
      name: trimmedName,
      description: description.trim(),
      category,
    })
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="habit-modal-title"
      onClick={onClose}
    >
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 id="habit-modal-title" className="modal-title">
              {isEditing ? 'Edit habit' : 'Add new habit'}
            </h3>
            <p className="modal-subtitle">
              {isEditing
                ? 'Update the habit name, notes, or category'
                : 'Create a daily habit to build your streak'}
            </p>
          </div>

          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close habit form"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="habit-name" className="form-label">
              Habit name <span className="required-star">*</span>
            </label>
            <input
              id="habit-name"
              type="text"
              className="form-control"
              placeholder="e.g., Morning walk"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                if (error) setError('')
              }}
              autoFocus
            />
            {error && <p className="form-error">{error}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="habit-description" className="form-label">
              Description <span className="optional-text">(optional)</span>
            </label>
            <textarea
              id="habit-description"
              className="form-control form-textarea"
              rows={3}
              placeholder="Add routine details or daily target..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="habit-category" className="form-label">
              Category
            </label>
            <select
              id="habit-category"
              className="form-control"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {HABIT_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {isEditing ? 'Save changes' : 'Save habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default HabitModal
