import { useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'

/**
 * Reusable confirmation modal used before deleting items.
 */
function ConfirmModal({
  title,
  message,
  confirmLabel = 'Delete',
  isConfirming = false,
  error = '',
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !isConfirming) {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel, isConfirming])

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={() => {
        if (!isConfirming) onCancel()
      }}
    >
      <div
        className="modal-card confirm-modal-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div className="confirm-title-wrap">
            <div className="confirm-icon" aria-hidden="true">
              <AlertTriangle size={16} strokeWidth={1.5} />
            </div>
            <h3 id="confirm-modal-title" className="modal-title">
              {title}
            </h3>
          </div>

          <button
            type="button"
            className="icon-btn"
            onClick={onCancel}
            disabled={isConfirming}
            aria-label="Close confirmation dialog"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <p className="confirm-message">{message}</p>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={isConfirming}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
