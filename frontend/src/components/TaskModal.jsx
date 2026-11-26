import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const CATEGORIES = ['Study', 'Personal', 'Work']
const PRIORITIES = ['High', 'Medium', 'Low']

/**
 * Modal dialog for creating a new task or editing an existing task.
 */
function TaskModal({ initialTask, onSave, onClose }) {
  const isEditing = Boolean(initialTask)

  const [title, setTitle] = useState(initialTask?.title ?? '')
  const [description, setDescription] = useState(initialTask?.description ?? '')
  const [priority, setPriority] = useState(initialTask?.priority ?? 'Medium')
  const [dueDate, setDueDate] = useState(initialTask?.dueDate ?? '')
  const [category, setCategory] = useState(initialTask?.category ?? 'Study')
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
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      setError('Please enter a task title.')
      return
    }

    onSave({
      title: trimmedTitle,
      description: description.trim(),
      priority,
      dueDate,
      category,
    })
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      onClick={onClose}
    >
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 id="task-modal-title" className="modal-title">
              {isEditing ? 'Edit Task' : 'Add New Task'}
            </h3>
            <p className="modal-subtitle">
              {isEditing
                ? 'Update the details for this task.'
                : 'Fill in the details to add a task to your list.'}
            </p>
          </div>

          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close task form"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="task-title" className="form-label">
              Task Title <span className="required-star">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              className="form-control"
              placeholder="e.g., Complete React hooks assignment"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
                if (error) setError('')
              }}
              autoFocus
            />
            {error && <p className="form-error">{error}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="task-description" className="form-label">
              Description <span className="optional-text">(optional)</span>
            </label>
            <textarea
              id="task-description"
              className="form-control form-textarea"
              rows={3}
              placeholder="Add helpful notes or steps..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-priority" className="form-label">
                Priority
              </label>
              <select
                id="task-priority"
                className="form-control"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                {PRIORITIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-category" className="form-label">
                Category
              </label>
              <select
                id="task-category"
                className="form-control"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="task-due-date" className="form-label">
              Due Date
            </label>
            <input
              id="task-due-date"
              type="date"
              className="form-control"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {isEditing ? 'Save Changes' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskModal
