import { Calendar, Check, Pencil, Trash2 } from 'lucide-react'
import { formatDueDate } from '../utils/taskUtils.js'

/**
 * Renders a single task row with completion checkbox, metadata tags, and edit/delete actions.
 */
function TaskItem({
  task,
  isBusy = false,
  onToggle,
  onEdit,
  onRequestDelete,
}) {
  const priorityLabel = task.priority || 'Medium'

  return (
    <li className={`task-card ${task.completed ? 'completed' : ''}`}>
      <button
        type="button"
        className={`check-btn ${task.completed ? 'checked' : ''}`}
        onClick={() => onToggle(task.id)}
        disabled={isBusy}
        aria-label={
          task.completed
            ? `Mark "${task.title}" as pending`
            : `Mark "${task.title}" as completed`
        }
      >
        {task.completed && <Check size={14} strokeWidth={2} />}
      </button>

      <div className="task-body">
        <div className="task-title-row">
          <span className="task-title">{task.title}</span>
        </div>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        <div className="task-meta-row">
          <span
            className={`priority-badge priority-${priorityLabel.toLowerCase()}`}
          >
            {priorityLabel}
          </span>

          <span className="category-badge">{task.category || 'Personal'}</span>

          <span
            className={`status-pill ${task.completed ? 'status-done' : 'status-pending'}`}
          >
            {task.completed ? 'Completed' : 'Pending'}
          </span>

          <span className="due-date-text">
            <Calendar size={14} strokeWidth={1.5} />
            <span>{formatDueDate(task.dueDate)}</span>
          </span>
        </div>
      </div>

      <div className="task-actions">
        <button
          type="button"
          className="action-btn"
          onClick={() => onEdit(task)}
          disabled={isBusy}
          aria-label={`Edit "${task.title}"`}
          title="Edit task"
        >
          <Pencil size={16} strokeWidth={1.5} />
        </button>

        <button
          type="button"
          className="action-btn action-btn-danger"
          onClick={() => onRequestDelete(task)}
          disabled={isBusy}
          aria-label={`Delete "${task.title}"`}
          title="Delete task"
        >
          <Trash2 size={16} strokeWidth={1.5} />
        </button>
      </div>
    </li>
  )
}

export default TaskItem
