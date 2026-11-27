import { useState } from 'react'
import { AlertCircle, Calendar, Plus, Search } from 'lucide-react'
import {
  GOAL_CATEGORIES,
  GOAL_STATUSES,
  filterGoals,
  getDeadlineInfo,
  sortGoalsByTargetDate,
} from '../utils/goalUtils.js'
import ConfirmModal from './ConfirmModal.jsx'
import GoalCard from './GoalCard.jsx'
import GoalDetailsModal from './GoalDetailsModal.jsx'
import GoalModal from './GoalModal.jsx'
import GoalStats from './GoalStats.jsx'

const STATUS_TABS = ['All', ...GOAL_STATUSES]

/**
 * Complete Goal Management workspace with 5 KPI stats, category/status filters, target-date sorting, and CRUD modals.
 */
function GoalsSection({
  goals,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onSetGoalProgress,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('default')

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [detailsGoalId, setDetailsGoalId] = useState(null)
  const [goalPendingDelete, setGoalPendingDelete] = useState(null)

  const filteredGoals = filterGoals(goals, {
    searchQuery,
    categoryFilter,
    statusFilter,
  })
  const visibleGoals = sortGoalsByTargetDate(filteredGoals, sortBy)

  const detailsGoal = goals.find((goal) => goal.id === detailsGoalId) || null

  const overdueCount = goals.filter(
    (goal) => getDeadlineInfo(goal.targetDate, goal.progress).state === 'overdue',
  ).length
  const upcomingCount = goals.filter(
    (goal) => getDeadlineInfo(goal.targetDate, goal.progress).state === 'upcoming',
  ).length

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    categoryFilter !== 'All' ||
    statusFilter !== 'All' ||
    sortBy !== 'default'

  function openAddModal() {
    setEditingGoal(null)
    setIsGoalModalOpen(true)
  }

  function openEditModal(goal) {
    setDetailsGoalId(null)
    setEditingGoal(goal)
    setIsGoalModalOpen(true)
  }

  function closeGoalModal() {
    setIsGoalModalOpen(false)
    setEditingGoal(null)
  }

  function handleSaveGoal(formData) {
    if (editingGoal) {
      onEditGoal(editingGoal.id, formData)
    } else {
      onAddGoal(formData)
    }
    closeGoalModal()
  }

  function handleConfirmDelete() {
    if (!goalPendingDelete) return
    onDeleteGoal(goalPendingDelete.id)
    if (detailsGoalId === goalPendingDelete.id) {
      setDetailsGoalId(null)
    }
    setGoalPendingDelete(null)
  }

  function handleClearFilters() {
    setSearchQuery('')
    setCategoryFilter('All')
    setStatusFilter('All')
    setSortBy('default')
  }

  return (
    <section className="dashboard-card" aria-label="Goal Tracker">
      <div className="card-header">
        <div>
          <h2 className="card-title">Goal tracker</h2>
          <p className="card-subtitle">Milestones, deadlines, and completion</p>
        </div>

        <button type="button" className="btn-primary" onClick={openAddModal}>
          <Plus size={16} strokeWidth={1.5} />
          <span>Add goal</span>
        </button>
      </div>

      <GoalStats goals={goals} />

      {(overdueCount > 0 || upcomingCount > 0) && (
        <div className="deadline-summary-bar">
          {overdueCount > 0 && (
            <span className="deadline-pill deadline-overdue">
              <AlertCircle size={14} strokeWidth={1.5} />
              {overdueCount} overdue {overdueCount === 1 ? 'goal' : 'goals'}
            </span>
          )}
          {upcomingCount > 0 && (
            <span className="deadline-pill deadline-upcoming">
              <Calendar size={14} strokeWidth={1.5} />
              {upcomingCount} due within 7 days
            </span>
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
            placeholder="Search goals"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Search goals by title"
          />
        </div>

        <div className="filter-controls">
          <div className="status-tabs" role="group" aria-label="Filter by goal status">
            {STATUS_TABS.map((status) => (
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

          <div className="goal-filter-selects">
            <select
              className="priority-select"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              aria-label="Filter by goal category"
            >
              <option value="All">All categories</option>
              {GOAL_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              className="priority-select"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              aria-label="Sort goals by target date"
            >
              <option value="default">Sort: Default</option>
              <option value="earliest">Target date: Earliest</option>
              <option value="latest">Target date: Latest</option>
            </select>
          </div>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="empty-state">
          <p>No goals yet. Use Add goal to create your first milestone.</p>
        </div>
      ) : visibleGoals.length === 0 ? (
        <div className="empty-state">
          <p>No goals match the current search or filters.</p>
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
        <div className="goals-list">
          {visibleGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onSetProgress={onSetGoalProgress}
              onViewDetails={(selected) => setDetailsGoalId(selected.id)}
              onEdit={openEditModal}
              onRequestDelete={setGoalPendingDelete}
            />
          ))}
        </div>
      )}

      {isGoalModalOpen && (
        <GoalModal
          key={editingGoal ? editingGoal.id : 'new-goal'}
          initialGoal={editingGoal}
          onSave={handleSaveGoal}
          onClose={closeGoalModal}
        />
      )}

      {detailsGoal && (
        <GoalDetailsModal
          goal={detailsGoal}
          onEdit={openEditModal}
          onClose={() => setDetailsGoalId(null)}
        />
      )}

      {goalPendingDelete && (
        <ConfirmModal
          title="Delete goal"
          message={`Delete "${goalPendingDelete.title}"? This cannot be undone.`}
          confirmLabel="Delete goal"
          onConfirm={handleConfirmDelete}
          onCancel={() => setGoalPendingDelete(null)}
        />
      )}
    </section>
  )
}

export default GoalsSection
