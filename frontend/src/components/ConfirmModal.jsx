import { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

/**
 * Reusable confirmation modal used before deleting a task.
 */
function ConfirmModal({ title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={onCancel}
    >
      <div
        className="modal-card confirm-modal-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div className="confirm-title-wrap">
            <div className="confirm-icon" aria-hidden="true">
              <AlertTriangle size={18} />
            </div>
            <h3 id="confirm-modal-title" className="modal-title">
              {title}
            </h3>
          </div>

          <button
            type="button"
            className="icon-btn"
            onClick={onCancel}
            aria-label="Close confirmation dialog"
          >
            <X size={18} />
          </button>
        </div>

        <p className="confirm-message">{message}</p>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
