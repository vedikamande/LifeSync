import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import {
  EVENT_CATEGORIES,
  EVENT_PRIORITIES,
  isValidDateKey,
} from '../utils/calendarUtils.js'
import { getTodayDateString } from '../utils/goalUtils.js'

/**
 * Modal form for adding a new calendar event or editing an existing event.
 */
function EventModal({ initialEvent, defaultDate, onSave, onClose }) {
  const isEditing = Boolean(initialEvent)

  const [title, setTitle] = useState(initialEvent?.title ?? '')
  const [description, setDescription] = useState(
    initialEvent?.description ?? '',
  )
  const [date, setDate] = useState(
    initialEvent?.date ?? defaultDate ?? getTodayDateString(),
  )
  const [startTime, setStartTime] = useState(initialEvent?.startTime ?? '')
  const [endTime, setEndTime] = useState(initialEvent?.endTime ?? '')
  const [category, setCategory] = useState(initialEvent?.category ?? 'Personal')
  const [priority, setPriority] = useState(initialEvent?.priority ?? 'Medium')
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
      setError('Please enter an event title.')
      return
    }

    if (!isValidDateKey(date)) {
      setError('Please select a valid date.')
      return
    }

    if (startTime && endTime && endTime < startTime) {
      setError('End time cannot be earlier than start time.')
      return
    }

    onSave({
      title: trimmedTitle,
      description: description.trim(),
      date,
      startTime,
      endTime,
      category,
      priority,
    })
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
      onClick={onClose}
    >
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 id="event-modal-title" className="modal-title">
              {isEditing ? 'Edit event' : 'Add new event'}
            </h3>
            <p className="modal-subtitle">
              {isEditing
                ? 'Update event schedule, category, or priority'
                : 'Schedule a new event on your calendar'}
            </p>
          </div>

          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close event form"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="event-title" className="form-label">
              Event title <span className="required-star">*</span>
            </label>
            <input
              id="event-title"
              type="text"
              className="form-control"
              placeholder="e.g., Project review meeting"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value)
                if (error) setError('')
              }}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="event-description" className="form-label">
              Description <span className="optional-text">(optional)</span>
            </label>
            <textarea
              id="event-description"
              className="form-control form-textarea"
              rows={2}
              placeholder="Add notes, agenda, or location..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="event-date" className="form-label">
              Date <span className="required-star">*</span>
            </label>
            <input
              id="event-date"
              type="date"
              className="form-control"
              value={date}
              onChange={(event) => {
                setDate(event.target.value)
                if (error) setError('')
              }}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="event-start-time" className="form-label">
                Start time
              </label>
              <input
                id="event-start-time"
                type="time"
                className="form-control"
                value={startTime}
                onChange={(event) => {
                  setStartTime(event.target.value)
                  if (error) setError('')
                }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="event-end-time" className="form-label">
                End time
              </label>
              <input
                id="event-end-time"
                type="time"
                className="form-control"
                value={endTime}
                onChange={(event) => {
                  setEndTime(event.target.value)
                  if (error) setError('')
                }}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="event-category" className="form-label">
                Category
              </label>
              <select
                id="event-category"
                className="form-control"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {EVENT_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="event-priority" className="form-label">
                Priority
              </label>
              <select
                id="event-priority"
                className="form-control"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                {EVENT_PRIORITIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {isEditing ? 'Save changes' : 'Save event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventModal
