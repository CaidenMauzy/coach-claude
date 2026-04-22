'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDate, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'

interface Job {
  id: string
  number: string
  title: string
  status: string
  scheduledAt: string | null
  createdAt: string
  client: { id: string; name: string; phone: string | null; address: string | null; city: string | null; state: string | null }
  assignedTo: { id: string; name: string } | null
  invoice: { id: string; status: string } | null
}

const statusFilters = ['all', 'scheduled', 'in_progress', 'completed', 'cancelled']

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = statusFilter !== 'all' ? `?status=${statusFilter}` : ''
    fetch(`/api/jobs${params}`)
      .then(r => r.json())
      .then(data => setJobs(data.jobs || []))
      .finally(() => setLoading(false))
  }, [statusFilter])

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-500 text-sm mt-0.5">{jobs.length} jobs</p>
        </div>
        <Link href="/jobs/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Job
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {statusFilters.map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {status === 'all' ? 'All' : STATUS_LABELS[status] || status}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
            <p className="text-gray-500 font-medium">No jobs found</p>
            <Link href="/jobs/new" className="text-blue-600 text-sm mt-1 hover:underline">Create your first job</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Job</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Scheduled</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Assigned To</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Invoice</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <Link href={`/jobs/${job.id}`} className="block">
                        <p className="text-sm font-medium text-gray-900 hover:text-blue-600">{job.title}</p>
                        <p className="text-xs text-gray-400">{job.number}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 hidden sm:table-cell">
                      <Link href={`/clients/${job.client.id}`} className="hover:text-blue-600">{job.client.name}</Link>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-500 hidden md:table-cell">
                      {job.scheduledAt ? formatDate(job.scheduledAt) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-500 hidden lg:table-cell">
                      {job.assignedTo?.name || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[job.status]}`}>
                        {STATUS_LABELS[job.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                      {job.invoice ? (
                        <Link href={`/invoices/${job.invoice.id}`} className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[job.invoice.status]}`}>
                          {STATUS_LABELS[job.invoice.status]}
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link href={`/jobs/${job.id}`} className="text-blue-600 hover:text-blue-700 text-sm">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
