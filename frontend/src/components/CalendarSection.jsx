import { useState } from 'react'
import {
  getActivitiesForDate,
  getDateIndicatorMap,
  getUpcomingActivities,
  isValidDateKey,
} from '../utils/calendarUtils.js'
import { getTodayDateString } from '../utils/goalUtils.js'
import CalendarGrid from './CalendarGrid.jsx'
import ConfirmModal from './ConfirmModal.jsx'
import DailySchedulePanel from './DailySchedulePanel.jsx'
import EventModal from './EventModal.jsx'
import UpcomingActivities from './UpcomingActivities.jsx'

/**
 * Full Calendar & Scheduling workspace integrating events, tasks, habits, and goal deadlines.
 */
function CalendarSection({
  events,
  tasks,
  habits,
  goals,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
}) {
  const todayKey = getTodayDateString()
  const [todayYear, todayMonth] = todayKey.split('-').map(Number)

  const [viewYear, setViewYear] = useState(todayYear)
  const [viewMonth, setViewMonth] = useState(todayMonth - 1)
  const [selectedDate, setSelectedDate] = useState(todayKey)

  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [eventPendingDelete, setEventPendingDelete] = useState(null)

  const indicatorMap = getDateIndicatorMap(
    { events, tasks, habits, goals },
    todayKey,
  )
  const dailyItems = getActivitiesForDate(
    selectedDate,
    { events, tasks, habits, goals },
    todayKey,
  )
  const upcomingItems = getUpcomingActivities(
    { events, tasks, goals },
    todayKey,
  )

  function handlePrevMonth() {
    if (viewMonth === 0) {
      setViewYear((prev) => prev - 1)
      setViewMonth(11)
    } else {
      setViewMonth((prev) => prev - 1)
    }
  }

  function handleNextMonth() {
    if (viewMonth === 11) {
      setViewYear((prev) => prev + 1)
      setViewMonth(0)
    } else {
      setViewMonth((prev) => prev + 1)
    }
  }

  function handleGoToToday() {
    setViewYear(todayYear)
    setViewMonth(todayMonth - 1)
    setSelectedDate(todayKey)
  }

  function handleSelectDate(dateKey) {
    if (!isValidDateKey(dateKey)) return
    setSelectedDate(dateKey)

    const [year, month] = dateKey.split('-').map(Number)
    if (year !== viewYear || month - 1 !== viewMonth) {
      setViewYear(year)
      setViewMonth(month - 1)
    }
  }

  function openAddEventModal() {
    setEditingEvent(null)
    setIsEventModalOpen(true)
  }

  function openEditEventModal(eventRecord) {
    setEditingEvent(eventRecord)
    setIsEventModalOpen(true)
  }

  function closeEventModal() {
    setIsEventModalOpen(false)
    setEditingEvent(null)
  }

  function handleSaveEvent(formData) {
    if (editingEvent) {
      onEditEvent(editingEvent.id, formData)
    } else {
      onAddEvent(formData)
    }
    handleSelectDate(formData.date)
    closeEventModal()
  }

  function handleConfirmDelete() {
    if (!eventPendingDelete) return
    onDeleteEvent(eventPendingDelete.id)
    setEventPendingDelete(null)
  }

  return (
    <div className="calendar-layout">
      <div className="calendar-main-column">
        <CalendarGrid
          viewYear={viewYear}
          viewMonth={viewMonth}
          selectedDate={selectedDate}
          todayKey={todayKey}
          indicatorMap={indicatorMap}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onGoToToday={handleGoToToday}
          onSelectDate={handleSelectDate}
        />

        <UpcomingActivities
          items={upcomingItems}
          onSelectDate={handleSelectDate}
        />
      </div>

      <div className="calendar-side-column">
        <DailySchedulePanel
          selectedDate={selectedDate}
          items={dailyItems}
          onOpenAddEvent={openAddEventModal}
          onEditEvent={openEditEventModal}
          onRequestDeleteEvent={setEventPendingDelete}
        />
      </div>

      {isEventModalOpen && (
        <EventModal
          key={editingEvent ? editingEvent.id : `new-event-${selectedDate}`}
          initialEvent={editingEvent}
          defaultDate={selectedDate}
          onSave={handleSaveEvent}
          onClose={closeEventModal}
        />
      )}

      {eventPendingDelete && (
        <ConfirmModal
          title="Delete event"
          message={`Delete "${eventPendingDelete.title}" on ${eventPendingDelete.date}? This cannot be undone.`}
          confirmLabel="Delete event"
          onConfirm={handleConfirmDelete}
          onCancel={() => setEventPendingDelete(null)}
        />
      )}
    </div>
  )
}

export default CalendarSection
