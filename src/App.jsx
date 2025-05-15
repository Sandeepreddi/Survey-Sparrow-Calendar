import { useState, useMemo } from 'react'
import dayjs from 'dayjs'
import eventsData from './events.json';

import './index.css'

dayjs.locale('en')

function getRandomColor() {
  const letters = '0123456789ABCDEF'
  let color = '#'
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

function App() {
  const today = dayjs()
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showAddEventForm, setShowAddEventForm] = useState(false)
  const [events, setEvents] = useState(eventsData)
  const [newEvent, setNewEvent] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    startTime: '09:00',
    endTime: '10:00',
    title: '',
    description: ''
  })

  // Stable random colors per event
  const eventColorMap = useMemo(() => {
    const map = {}
    events.forEach(ev => {
      const key = `${ev.date}-${ev.startTime}-${ev.endTime}-${ev.title}`
      map[key] = getRandomColor()
    })
    return map
  }, [events])

  // Calendar calculations
  const startOfMonth = currentDate.startOf('month')
  const startDay = startOfMonth.day()
  const daysInMonth = currentDate.daysInMonth()
  const calendarDays = []
  for (let i = 0; i < startDay; i++) calendarDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(dayjs(currentDate).date(d))

  const prevMonth = () => setCurrentDate(currentDate.subtract(1, 'month'))
  const nextMonth = () => setCurrentDate(currentDate.add(1, 'month'))

  const getEventsForDate = date => {
    if (!date) return []
    return events.filter(ev => ev.date === date.format('YYYY-MM-DD'))
  }

  const handleInputChange = e => {
    const { name, value } = e.target
    setNewEvent(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitEvent = e => {
    e.preventDefault()
    if (!newEvent.title || !newEvent.date || !newEvent.startTime || !newEvent.endTime) {
      alert('Please fill all required fields.')
      return
    }
    if (newEvent.startTime >= newEvent.endTime) {
      alert('End time must be after start time.')
      return
    }
    setEvents([...events, newEvent])
    setShowAddEventForm(false)
    setSelectedDate(dayjs(newEvent.date))
    // reset form
    setNewEvent({
      date: newEvent.date,
      startTime: '09:00',
      endTime: '10:00',
      title: '',
      description: ''
    })
  }

  const clearForm = () => {
    setNewEvent({
      date: selectedDate ? selectedDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      startTime: '09:00',
      endTime: '10:00',
      title: '',
      description: ''
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Calendar</h1>
          <p className="text-gray-600 mt-1">View and manage your schedule</p>
        </div>

        {/* Main container */}
        <div className="bg-white shadow-lg rounded-lg p-4 lg:p-6 flex flex-col lg:flex-row gap-6">
          {/* Calendar */}
          <div className="w-full lg:w-2/3">
            <div className="flex items-center justify-between mb-4">
  <div className="flex items-center gap-2">
    <button
      onClick={() => setCurrentDate(currentDate.subtract(1, 'year'))}
      className="p-2 rounded hover:bg-gray-200 text-lg"
      title="Previous Year"
    >
      «
    </button>
    <button
      onClick={() => setCurrentDate(currentDate.subtract(1, 'month'))}
      className="p-2 rounded hover:bg-gray-200 text-lg"
      title="Previous Month"
    >
      ‹
    </button>
  </div>
  <span className="text-xl font-bold">{currentDate.format('MMMM YYYY')}</span>
  <div className="flex items-center gap-2">
    <button
      onClick={() => setCurrentDate(currentDate.add(1, 'month'))}
      className="p-2 rounded hover:bg-gray-200 text-lg"
      title="Next Month"
    >
      ›
    </button>
    <button
      onClick={() => setCurrentDate(currentDate.add(1, 'year'))}
      className="p-2 rounded hover:bg-gray-200 text-lg"
      title="Next Year"
    >
      »
    </button>
  </div>
</div>


            <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-600 mb-2">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, idx) => {
                const dayEvents = getEventsForDate(date)
                const isToday = date?.isSame(today, 'day')
                const isSelected = date?.isSame(selectedDate, 'day')
                return (
                  <div
                    key={idx}
                    onClick={() => date && setSelectedDate(date)}
                    className={`
                      h-24 p-1 rounded-lg cursor-pointer transition-colors flex flex-col
                      ${
                        isToday
                          ? 'bg-blue-100 border-blue-300'
                          : 'bg-white border border-gray-200'
                      }
                      ${isSelected ? 'ring-2 ring-blue-500' : ''}
                      hover:bg-blue-50
                    `}
                  >
                    <div className={`
                      w-8 h-8 flex items-center justify-center rounded-full
                      ${isToday ? 'bg-blue-600 text-white' : ''}
                      ${isSelected && !isToday ? 'text-blue-600 font-bold' : ''}
                    `}>
                      {date?.date()}
                    </div>
                    <div className="mt-1 space-y-1 text-xs overflow-hidden">
                      {dayEvents.slice(0,2).map((ev, i) => {
                        const key = `${ev.date}-${ev.startTime}-${ev.endTime}-${ev.title}`
                        return (
                          <div
                            key={i}
                            className="truncate px-1 py-0.5 rounded"
                            style={{
                              backgroundColor: `${eventColorMap[key]}20`,
                              color: eventColorMap[key],
                              borderLeft: `3px solid ${eventColorMap[key]}`
                            }}
                          >
                            {ev.title}
                          </div>
                        )
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-gray-500 text-center">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Side panel */}
          <div className="w-full lg:w-1/3">
         

            {selectedDate && (

              <div className="sticky top-0 bg-white">
                <h1 className="text-center font-bold text-3xl mb-4 flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Events
                </h1>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold">
                      {selectedDate.format('dddd, MMMM D')}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedDate.format('YYYY')}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="text-2xl p-1 hover:bg-gray-200 rounded-full"
                  >
                    ×
                  </button>
                </div>

                {/* Add Event button */}
                <button
                  onClick={() => setShowAddEventForm(prev => !prev)}
                 className="w-full mb-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Event
                  </button>

                {/* Inline Add Event Form */}
                {showAddEventForm && (
                  <form
                    onSubmit={handleSubmitEvent}
                    className="bg-gray-50 p-4 rounded-lg shadow-inner space-y-3 mb-6"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title*</label>
                      <input
                        type="text"
                        name="title"
                        value={newEvent.title}
                        onChange={handleInputChange}
                        className="w-full mt-1 p-2 border border-gray-300 rounded text-sm"
                        placeholder="Event title"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Start Time*</label>
                        <input
                          type="time"
                          name="startTime"
                          value={newEvent.startTime}
                          onChange={handleInputChange}
                          className="w-full mt-1 p-2 border border-gray-300 rounded text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">End Time*</label>
                        <input
                          type="time"
                          name="endTime"
                          value={newEvent.endTime}
                          onChange={handleInputChange}
                          className="w-full mt-1 p-2 border border-gray-300 rounded text-sm"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        name="description"
                        value={newEvent.description}
                        onChange={handleInputChange}
                        className="w-full mt-1 p-2 border border-gray-300 rounded text-sm"
                        rows="2"
                        placeholder="Optional"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={clearForm}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-800 text-sm cursor-pointer"
                      >
                        Clear
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-white text-sm "
                      >
                        Save
                      </button>
                    </div>
                  </form>
                )}

                {/* Events list */}
                <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                  
                  {getEventsForDate(selectedDate).length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No events scheduled</p>
                  ) : (
                    getEventsForDate(selectedDate).map((ev, i) => {
                      const key = `${ev.date}-${ev.startTime}-${ev.endTime}-${ev.title}`
                      return (
                        <div
                          key={i}
                          className="border-l-4 pl-4 py-3 rounded-lg bg-white shadow-sm hover:shadow-md transition"
                          style={{ borderColor: eventColorMap[key] }}
                        >
                          <h3 className="font-bold text-gray-800">{ev.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {ev.startTime} – {ev.endTime}
                          </p>
                          {ev.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {ev.description}
                            </p>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
