import { Calendar, Check, Pencil, Trash2 } from 'lucide-react'
import { formatDueDate } from '../utils/taskUtils.js'

/**
 * Renders a single task card with completion checkbox, metadata badges, and edit/delete actions.
 */
function TaskItem({ task, onToggle, onEdit, onRequestDelete }) {
  return (
    <li className={`task-card ${task.completed ? 'completed' : ''}`}>
      <button
        type="button"
        className={`check-btn ${task.completed ? 'checked' : ''}`}
        onClick={() => onToggle(task.id)}
        aria-label={
          task.completed
            ? `Mark "${task.title}" as pending`
            : `Mark "${task.title}" as completed`
        }
      >
        {task.completed && <Check size={14} />}
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
            className={`priority-badge priority-${task.priority.toLowerCase()}`}
          >
            {task.priority}
          </span>

          <span className="category-badge">{task.category}</span>

          <span
            className={`status-pill ${task.completed ? 'status-done' : 'status-pending'}`}
          >
            {task.completed ? 'Completed' : 'Pending'}
          </span>

          <span className="due-date-text">
            <Calendar size={13} />
            <span>{formatDueDate(task.dueDate)}</span>
          </span>
        </div>
      </div>

      <div className="task-actions">
        <button
          type="button"
          className="action-btn"
          onClick={() => onEdit(task)}
          aria-label={`Edit "${task.title}"`}
          title="Edit task"
        >
          <Pencil size={15} />
        </button>

        <button
          type="button"
          className="action-btn action-btn-danger"
          onClick={() => onRequestDelete(task)}
          aria-label={`Delete "${task.title}"`}
          title="Delete task"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </li>
  )
}

export default TaskItem
