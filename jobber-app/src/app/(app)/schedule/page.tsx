'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface Job {
  id: string
  title: string
  status: string
  scheduledAt: string | null
  client: { name: string }
  assignedTo: { name: string } | null
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getMonthData(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  const cells: Array<{ date: Date; current: boolean }> = []
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), current: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), current: true })
  }
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({ date: new Date(year, month + 1, d), current: false })
  }
  return cells
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export default function SchedulePage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    fetch('/api/jobs').then(r => r.json()).then(d => setJobs(d.jobs || []))
  }, [])

  const cells = getMonthData(viewDate.getFullYear(), viewDate.getMonth())

  function prevMonth() { setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)) }
  function nextMonth() { setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)) }

  function getJobsForDate(date: Date) {
    return jobs.filter(j => j.scheduledAt && isSameDay(new Date(j.scheduledAt), date))
  }

  const selectedJobs = selectedDate ? getJobsForDate(selectedDate) : []

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-500 text-sm mt-1">
            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))}
              className="px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 text-gray-600">
              Today
            </button>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
              <ChevronRight size={18} />
            </button>
          </div>
          <Link href="/jobs/new"><Button size="sm"><Plus size={14} /> New Job</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-500 py-3 uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((cell, i) => {
              const dayJobs = getJobsForDate(cell.date)
              const isToday = isSameDay(cell.date, today)
              const isSelected = selectedDate && isSameDay(cell.date, selectedDate)
              return (
                <div
                  key={i}
                  onClick={() => setSelectedDate(cell.date)}
                  className={`min-h-[80px] p-2 border-b border-r border-gray-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-green-50' : cell.current ? 'hover:bg-gray-50' : 'bg-gray-50/50'
                  }`}
                >
                  <div className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                    isToday ? 'text-white' : cell.current ? 'text-gray-900' : 'text-gray-400'
                  }`} style={isToday ? { backgroundColor: '#2eb844' } : {}}>
                    {cell.date.getDate()}
                  </div>
                  <div className="space-y-0.5">
                    {dayJobs.slice(0, 2).map(job => (
                      <div
                        key={job.id}
                        className={`text-xs px-1 py-0.5 rounded truncate font-medium ${STATUS_COLORS[job.status] || 'bg-gray-100 text-gray-700'}`}
                      >
                        {job.title}
                      </div>
                    ))}
                    {dayJobs.length > 2 && (
                      <div className="text-xs text-gray-400">+{dayJobs.length - 2} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-3">
            {selectedDate
              ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
              : 'Select a day'}
          </h2>
          {!selectedDate ? (
            <p className="text-sm text-gray-400">Click a day to see scheduled jobs.</p>
          ) : selectedJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400 mb-3">No jobs scheduled</p>
              <Link href={`/jobs/new`}>
                <Button size="sm" variant="secondary"><Plus size={13} /> Add Job</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedJobs.map(job => (
                <Link key={job.id} href={`/jobs/${job.id}`}
                  className="block p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 leading-tight">{job.title}</p>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${STATUS_COLORS[job.status] || ''}`}>
                      {STATUS_LABELS[job.status] || job.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{job.client.name}</p>
                  {job.assignedTo && <p className="text-xs text-gray-400">{job.assignedTo.name}</p>}
                  {job.scheduledAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(job.scheduledAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
