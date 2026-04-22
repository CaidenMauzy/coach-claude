'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'

interface ReportData {
  kpis: {
    totalRevenue: number
    activeJobs: number
    pendingQuotes: number
    outstandingAmount: number
    totalClients: number
  }
  monthlyRevenue: Array<{ month: string; revenue: number }>
  recentActivity: Array<{ id: string; status: string }>
}

const JOB_STATUS_COLORS: Record<string, string> = {
  completed: '#2eb844',
  in_progress: '#3b82f6',
  scheduled: '#f59e0b',
  cancelled: '#ef4444',
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (!data) return null

  const maxRevenue = Math.max(...data.monthlyRevenue.map(m => m.revenue), 1)

  // Build job status counts from recentActivity
  const statusCounts = data.recentActivity.reduce<Record<string, number>>((acc, j) => {
    acc[j.status] = (acc[j.status] || 0) + 1
    return acc
  }, {})
  const totalJobs = Object.values(statusCounts).reduce((a, b) => a + b, 0)

  // Pie chart segments
  type Segment = { status: string; count: number; color: string; pct: number; offset: number }
  const segments: Segment[] = []
  let cumulative = 0
  for (const [status, count] of Object.entries(statusCounts)) {
    const pct = totalJobs > 0 ? (count / totalJobs) * 100 : 0
    segments.push({ status, count, color: JOB_STATUS_COLORS[status] || '#9ca3af', pct, offset: cumulative })
    cumulative += pct
  }

  const circumference = 2 * Math.PI * 40

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 text-sm mt-1">Business performance overview</p>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: formatCurrency(data.kpis.totalRevenue), color: '#2eb844' },
          { label: 'Active Jobs', value: String(data.kpis.activeJobs), color: '#3b82f6' },
          { label: 'Pending Quotes', value: String(data.kpis.pendingQuotes), color: '#f59e0b' },
          { label: 'Outstanding', value: formatCurrency(data.kpis.outstandingAmount), color: '#ef4444' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="text-xs font-medium text-gray-500 mb-1">{kpi.label}</div>
            <div className="text-xl font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Monthly Revenue (Last 6 Months)</h2>
          <div className="space-y-3">
            {data.monthlyRevenue.map(m => (
              <div key={m.month} className="flex items-center gap-3">
                <div className="w-10 text-xs text-gray-500 text-right flex-shrink-0">{m.month}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center justify-end pr-2 text-xs text-white font-medium transition-all"
                    style={{
                      width: `${Math.max((m.revenue / maxRevenue) * 100, m.revenue > 0 ? 8 : 0)}%`,
                      backgroundColor: '#2eb844',
                    }}
                  >
                    {m.revenue > 0 ? formatCurrency(m.revenue) : ''}
                  </div>
                </div>
                {m.revenue === 0 && <span className="text-xs text-gray-400">$0</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Jobs by Status Donut */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Jobs by Status</h2>
          {totalJobs === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No job data yet</div>
          ) : (
            <div className="flex items-center gap-8">
              <svg viewBox="0 0 100 100" className="w-32 h-32 flex-shrink-0 -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="18" />
                {segments.map((seg, i) => (
                  <circle
                    key={i}
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="18"
                    strokeDasharray={`${(seg.pct / 100) * circumference} ${circumference}`}
                    strokeDashoffset={-((seg.offset / 100) * circumference)}
                  />
                ))}
              </svg>
              <div className="space-y-2 flex-1">
                {segments.map(seg => (
                  <div key={seg.status} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                      <span className="text-gray-600 capitalize">{seg.status.replace('_', ' ')}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{seg.count}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-100 flex justify-between text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="font-semibold">{totalJobs}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Financial Summary</h2>
          <div className="space-y-3">
            {[
              { label: 'Total Revenue Collected', value: data.kpis.totalRevenue, color: 'text-green-700' },
              { label: 'Outstanding Receivables', value: data.kpis.outstandingAmount, color: 'text-red-600' },
              { label: 'Net Position', value: data.kpis.totalRevenue + data.kpis.outstandingAmount, color: 'text-gray-900' },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{row.label}</span>
                <span className={`font-semibold ${row.color}`}>{formatCurrency(row.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Business Metrics */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Business Metrics</h2>
          <div className="space-y-3">
            {[
              { label: 'Total Clients', value: data.kpis.totalClients },
              { label: 'Active Jobs', value: data.kpis.activeJobs },
              { label: 'Open Quotes', value: data.kpis.pendingQuotes },
              { label: 'Avg Revenue / Client', value: data.kpis.totalClients > 0 ? formatCurrency(data.kpis.totalRevenue / data.kpis.totalClients) : '$0' },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{row.label}</span>
                <span className="font-semibold text-gray-900">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
