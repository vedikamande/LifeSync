import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { filterTasks } from '../utils/taskUtils.js'
import ConfirmModal from './ConfirmModal.jsx'
import TaskItem from './TaskItem.jsx'
import TaskModal from './TaskModal.jsx'

const STATUS_FILTERS = ['All', 'Pending', 'Completed']
const PRIORITY_FILTERS = ['All', 'High', 'Medium', 'Low']

/**
 * Full Task Manager card supporting Add/Edit modal, delete confirmation, search, and filters.
 */
function TodayTasks({
  tasks,
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
  const [taskPendingDelete, setTaskPendingDelete] = useState(null)

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
    setIsTaskModalOpen(true)
  }

  function openEditModal(task) {
    setEditingTask(task)
    setIsTaskModalOpen(true)
  }

  function closeTaskModal() {
    setIsTaskModalOpen(false)
    setEditingTask(null)
  }

  function handleSaveTask(formData) {
    if (editingTask) {
      onEditTask(editingTask.id, formData)
    } else {
      onAddTask(formData)
    }
    closeTaskModal()
  }

  function handleConfirmDelete() {
    if (!taskPendingDelete) return
    onDeleteTask(taskPendingDelete.id)
    setTaskPendingDelete(null)
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
          <h2 className="card-title">Today&apos;s Tasks</h2>
          <p className="card-subtitle">
            Add, edit, search, and filter tasks — saved automatically.
          </p>
        </div>

        <button type="button" className="btn-primary" onClick={openAddModal}>
          <Plus size={16} />
          <span>Add Task</span>
        </button>
      </div>

      <div className="task-toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" aria-hidden="true" />
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks by title..."
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
                {priority === 'All' ? 'All Priorities' : `${priority} Priority`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks yet. Click &ldquo;Add Task&rdquo; to create your first task!</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks match your current search or filters.</p>
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
              onToggle={onToggleTask}
              onEdit={openEditModal}
              onRequestDelete={setTaskPendingDelete}
            />
          ))}
        </ul>
      )}

      {isTaskModalOpen && (
        <TaskModal
          key={editingTask ? editingTask.id : 'new-task'}
          initialTask={editingTask}
          onSave={handleSaveTask}
          onClose={closeTaskModal}
        />
      )}

      {taskPendingDelete && (
        <ConfirmModal
          title="Delete Task?"
          message={`Are you sure you want to delete "${taskPendingDelete.title}"? This action cannot be undone.`}
          confirmLabel="Delete Task"
          onConfirm={handleConfirmDelete}
          onCancel={() => setTaskPendingDelete(null)}
        />
      )}
    </section>
  )
}

export default TodayTasks
