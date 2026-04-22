'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDateTime, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'

interface KPIs {
  totalRevenue: number
  activeJobs: number
  pendingQuotes: number
  outstandingAmount: number
  totalClients: number
}

interface TodayJob {
  id: string
  number: string
  title: string
  status: string
  scheduledAt: string | null
  client: { name: string }
  assignedTo: { name: string } | null
}

interface RecentActivity {
  id: string
  number: string
  title: string
  status: string
  updatedAt: string
  client: { name: string }
}

interface MonthRevenue {
  month: string
  revenue: number
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [todayJobs, setTodayJobs] = useState<TodayJob[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthRevenue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(data => {
        setKpis(data.kpis)
        setTodayJobs(data.todayJobs || [])
        setRecentActivity(data.recentActivity || [])
        setMonthlyRevenue(data.monthlyRevenue || [])
      })
      .finally(() => setLoading(false))
  }, [])

  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue), 1)

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/jobs/new" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Job
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
          </div>
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(kpis?.totalRevenue || 0)}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
          </div>
          <p className="text-sm text-gray-500">Active Jobs</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{kpis?.activeJobs || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
          </div>
          <p className="text-sm text-gray-500">Pending Quotes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{kpis?.pendingQuotes || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            </div>
          </div>
          <p className="text-sm text-gray-500">Outstanding</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(kpis?.outstandingAmount || 0)}</p>
        </div>
      </div>

      {/* Charts and Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Revenue Overview</h2>
          <div className="flex items-end gap-2 h-40">
            {monthlyRevenue.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-blue-500 rounded-t-sm transition-all hover:bg-blue-600"
                  style={{ height: `${Math.max((m.revenue / maxRevenue) * 130, 2)}px` }}
                  title={`${m.month}: ${formatCurrency(m.revenue)}`}
                />
                <span className="text-xs text-gray-500">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { href: '/clients/new', label: 'Add Client', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
              { href: '/quotes/new', label: 'Create Quote', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
              { href: '/jobs/new', label: 'Schedule Job', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
              { href: '/invoices/new', label: 'New Invoice', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
            ].map(action => (
              <Link
                key={action.href}
                href={action.href}
                className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${action.color}`}
              >
                <span>{action.label}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Jobs and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Jobs */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Today&apos;s Jobs</h2>
            <Link href="/schedule" className="text-blue-600 text-sm hover:underline">View schedule</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {todayJobs.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400">
                <p className="text-sm">No jobs scheduled for today</p>
                <Link href="/jobs/new" className="text-blue-600 text-sm mt-1 hover:underline">Schedule a job</Link>
              </div>
            ) : (
              todayJobs.map(job => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                    <p className="text-xs text-gray-500">{job.client.name} {job.scheduledAt ? `• ${new Date(job.scheduledAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : ''}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[job.status]}`}>
                    {STATUS_LABELS[job.status]}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Jobs</h2>
            <Link href="/jobs" className="text-blue-600 text-sm hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400">
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              recentActivity.slice(0, 6).map(item => (
                <Link key={item.id} href={`/jobs/${item.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.client.name} • {item.number}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[item.status]}`}>
                    {STATUS_LABELS[item.status]}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
