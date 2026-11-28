import { useState } from 'react'
import { Calendar, Plus } from 'lucide-react'
import { getTodayDateString } from '../utils/goalUtils.js'
import {
  HABIT_CATEGORIES,
  getWeeklyHabitProgress,
} from '../utils/habitUtils.js'
import ConfirmModal from './ConfirmModal.jsx'
import HabitCard from './HabitCard.jsx'
import HabitHistoryModal from './HabitHistoryModal.jsx'
import HabitModal from './HabitModal.jsx'
import HabitStats from './HabitStats.jsx'

/**
 * Full Habit Tracker module supporting CRUD, date-wise tracking, streaks, and weekly progress.
 */
function HabitTracker({
  habits,
  onAddHabit,
  onEditHabit,
  onDeleteHabit,
  onCompleteHabitForDate,
}) {
  const todayKey = getTodayDateString()
  const [selectedDate, setSelectedDate] = useState(todayKey)
  const [categoryFilter, setCategoryFilter] = useState('All')

  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [historyHabit, setHistoryHabit] = useState(null)
  const [habitPendingDelete, setHabitPendingDelete] = useState(null)

  const weeklyProgress = getWeeklyHabitProgress(habits, todayKey)

  const filteredHabits =
    categoryFilter === 'All'
      ? habits
      : habits.filter((habit) => habit.category === categoryFilter)

  function openAddModal() {
    setEditingHabit(null)
    setIsHabitModalOpen(true)
  }

  function openEditModal(habit) {
    setEditingHabit(habit)
    setIsHabitModalOpen(true)
  }

  function closeHabitModal() {
    setIsHabitModalOpen(false)
    setEditingHabit(null)
  }

  function handleSaveHabit(formData) {
    if (editingHabit) {
      onEditHabit(editingHabit.id, formData)
    } else {
      onAddHabit(formData)
    }
    closeHabitModal()
  }

  function handleConfirmDelete() {
    if (!habitPendingDelete) return
    onDeleteHabit(habitPendingDelete.id)
    setHabitPendingDelete(null)
  }

  return (
    <section className="dashboard-card" aria-label="Habit Tracker">
      <div className="card-header">
        <div>
          <h2 className="card-title">Habit tracker</h2>
          <p className="card-subtitle">
            Daily check-ins, consecutive streaks, and weekly consistency
          </p>
        </div>

        <button type="button" className="btn-primary" onClick={openAddModal}>
          <Plus size={16} strokeWidth={1.5} />
          <span>Add habit</span>
        </button>
      </div>

      <HabitStats habits={habits} selectedDate={selectedDate} />

      <div className="weekly-progress-panel" aria-label="Weekly habit progress">
        <div className="weekly-progress-top">
          <span className="weekly-progress-title">
            Current week progress ({weeklyProgress.completedCount}/
            {weeklyProgress.totalPossible} check-ins)
          </span>
          <span className="weekly-progress-meta">
            {weeklyProgress.percentage}%
          </span>
        </div>

        <div
          className="progress-track"
          role="progressbar"
          aria-valuenow={weeklyProgress.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Weekly habit completion percentage"
        >
          <div
            className={`progress-fill ${
              weeklyProgress.percentage === 100 ? 'progress-complete' : ''
            }`}
            style={{ width: `${weeklyProgress.percentage}%` }}
          />
        </div>
      </div>

      <div className="habit-date-bar">
        <div className="habit-date-picker-wrap">
          <Calendar size={16} strokeWidth={1.5} aria-hidden="true" />
          <label htmlFor="habit-tracking-date" className="habit-date-label">
            Tracking date
          </label>
          <input
            id="habit-tracking-date"
            type="date"
            className="habit-date-input"
            value={selectedDate}
            max={todayKey}
            onChange={(event) => {
              if (event.target.value) setSelectedDate(event.target.value)
            }}
          />
          {selectedDate !== todayKey && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setSelectedDate(todayKey)}
            >
              Today
            </button>
          )}
        </div>

        <select
          className="priority-select"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          aria-label="Filter habits by category"
        >
          <option value="All">All categories</option>
          {HABIT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {habits.length === 0 ? (
        <div className="empty-state">
          <p>No habits yet. Use Add habit to start tracking a daily routine.</p>
        </div>
      ) : filteredHabits.length === 0 ? (
        <div className="empty-state">
          <p>No habits found in the {categoryFilter} category.</p>
          <button
            type="button"
            className="btn-link"
            onClick={() => setCategoryFilter('All')}
          >
            Show all habits
          </button>
        </div>
      ) : (
        <ul className="habit-list">
          {filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              selectedDate={selectedDate}
              weekDates={weeklyProgress.weekDates}
              onCompleteForDate={onCompleteHabitForDate}
              onViewHistory={setHistoryHabit}
              onEdit={openEditModal}
              onRequestDelete={setHabitPendingDelete}
            />
          ))}
        </ul>
      )}

      {isHabitModalOpen && (
        <HabitModal
          key={editingHabit ? editingHabit.id : 'new-habit'}
          initialHabit={editingHabit}
          onSave={handleSaveHabit}
          onClose={closeHabitModal}
        />
      )}

      {historyHabit && (
        <HabitHistoryModal
          habit={historyHabit}
          onClose={() => setHistoryHabit(null)}
        />
      )}

      {habitPendingDelete && (
        <ConfirmModal
          title="Delete habit"
          message={`Delete "${habitPendingDelete.name}"? Its streak history will be removed.`}
          confirmLabel="Delete habit"
          onConfirm={handleConfirmDelete}
          onCancel={() => setHabitPendingDelete(null)}
        />
      )}
    </section>
  )
}

export default HabitTracker
