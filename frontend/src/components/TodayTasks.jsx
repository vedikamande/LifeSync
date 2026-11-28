import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { filterTasks } from '../utils/taskUtils.js'
import ConfirmModal from './ConfirmModal.jsx'
import TaskItem from './TaskItem.jsx'
import TaskModal from './TaskModal.jsx'

const STATUS_FILTERS = ['All', 'Pending', 'Completed']
const PRIORITY_FILTERS = ['All', 'High', 'Medium', 'Low']

/**
 * Full Task Manager card connected to Flask + SQLite via props from HomePage.
 * Supports Add/Edit modal, delete confirmation, search, filters, loading states, and duplicate-submit protection.
 */
function TodayTasks({
  tasks,
  isLoading = false,
  error = '',
  successMessage = '',
  pendingTaskIds = [],
  onRetry,
  onDismissError,
  onDismissSuccess,
  onAddTask,
  onEditTask,
  onToggleTask,
  onDeleteTask,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [isSubmittingTask, setIsSubmittingTask] = useState(false)
  const [modalError, setModalError] = useState('')

  const [taskPendingDelete, setTaskPendingDelete] = useState(null)
  const [isDeletingTask, setIsDeletingTask] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const filteredTasks = filterTasks(tasks, {
    searchQuery,
    statusFilter,
    priorityFilter,
  })

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'All' ||
    priorityFilter !== 'All'

  function openAddModal() {
    setEditingTask(null)
    setModalError('')
    setIsTaskModalOpen(true)
  }

  function openEditModal(task) {
    setEditingTask(task)
    setModalError('')
    setIsTaskModalOpen(true)
  }

  function closeTaskModal() {
    if (isSubmittingTask) return
    setIsTaskModalOpen(false)
    setEditingTask(null)
    setModalError('')
  }

  async function handleSaveTask(formData) {
    if (isSubmittingTask) return

    setIsSubmittingTask(true)
    setModalError('')
    try {
      const result = editingTask
        ? await onEditTask(editingTask.id, formData)
        : await onAddTask(formData)

      if (result && result.ok === false) {
        setModalError(result.error || 'Could not save task. Please try again.')
        return
      }

      setIsTaskModalOpen(false)
      setEditingTask(null)
    } finally {
      setIsSubmittingTask(false)
    }
  }

  function closeDeleteModal() {
    if (isDeletingTask) return
    setTaskPendingDelete(null)
    setDeleteError('')
  }

  async function handleConfirmDelete() {
    if (!taskPendingDelete || isDeletingTask) return

    setIsDeletingTask(true)
    setDeleteError('')
    try {
      const result = await onDeleteTask(taskPendingDelete.id)
      if (result && result.ok === false) {
        setDeleteError(result.error || 'Could not delete task. Please try again.')
        return
      }
      setTaskPendingDelete(null)
    } finally {
      setIsDeletingTask(false)
    }
  }

  function handleClearFilters() {
    setSearchQuery('')
    setStatusFilter('All')
    setPriorityFilter('All')
  }

  return (
    <section className="dashboard-card" aria-label="Task Manager">
      <div className="card-header">
        <div>
          <h2 className="card-title">Today&apos;s tasks</h2>
          <p className="card-subtitle">Synced with Flask &amp; SQLite</p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={openAddModal}
          disabled={isLoading || isSubmittingTask}
        >
          <Plus size={16} strokeWidth={1.5} />
          <span>Add task</span>
        </button>
      </div>

      {isLoading && (
        <div className="feedback-banner banner-loading task-banner" role="status">
          <span>Loading tasks from Flask database...</span>
        </div>
      )}

      {error && (
        <div className="feedback-banner banner-error task-banner" role="alert">
          <span>{error}</span>
          <div className="banner-actions">
            {onRetry && (
              <button
                type="button"
                className="banner-btn"
                onClick={onRetry}
                disabled={isLoading}
              >
                Retry
              </button>
            )}
            {onDismissError && (
              <button
                type="button"
                className="banner-btn"
                onClick={onDismissError}
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="feedback-banner banner-success task-banner" role="status">
          <span>{successMessage}</span>
          {onDismissSuccess && (
            <button
              type="button"
              className="banner-btn"
              onClick={onDismissSuccess}
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      <div className="task-toolbar">
        <div className="search-box">
          <Search
            size={16}
            strokeWidth={1.5}
            className="search-icon"
            aria-hidden="true"
          />
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Search tasks by title"
          />
        </div>

        <div className="filter-controls">
          <div className="status-tabs" role="group" aria-label="Filter by status">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                type="button"
                className={`filter-tab ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>

          <select
            className="priority-select"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            aria-label="Filter by priority"
          >
            {PRIORITY_FILTERS.map((priority) => (
              <option key={priority} value={priority}>
                {priority === 'All' ? 'All priorities' : `${priority} priority`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && tasks.length === 0 ? (
        <div className="empty-state">
          <p>Fetching your tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <p>
            {error
              ? 'Unable to load tasks right now. Check the Flask server and click Retry.'
              : 'No tasks yet. Use Add task to create your first item.'}
          </p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks match the current search or filters.</p>
          {hasActiveFilters && (
            <button
              type="button"
              className="btn-link"
              onClick={handleClearFilters}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <ul className="task-list">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isBusy={pendingTaskIds.includes(task.id)}
              onToggle={onToggleTask}
              onEdit={openEditModal}
              onRequestDelete={(item) => {
                setDeleteError('')
                setTaskPendingDelete(item)
              }}
            />
          ))}
        </ul>
      )}

      {isTaskModalOpen && (
        <TaskModal
          key={editingTask ? editingTask.id : 'new-task'}
          initialTask={editingTask}
          isSubmitting={isSubmittingTask}
          submitError={modalError}
          onSave={handleSaveTask}
          onClose={closeTaskModal}
        />
      )}

      {taskPendingDelete && (
        <ConfirmModal
          title="Delete task"
          message={`Delete "${taskPendingDelete.title}"? This cannot be undone.`}
          confirmLabel={isDeletingTask ? 'Deleting...' : 'Delete task'}
          isConfirming={isDeletingTask}
          error={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={closeDeleteModal}
        />
      )}
    </section>
  )
}

export default TodayTasks
