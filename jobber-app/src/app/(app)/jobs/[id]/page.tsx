'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, formatDate, formatDateTime, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'

interface Job {
  id: string
  number: string
  title: string
  description: string | null
  status: string
  scheduledAt: string | null
  completedAt: string | null
  notes: string | null
  createdAt: string
  client: { id: string; name: string; email: string | null; phone: string | null; address: string | null; city: string | null; state: string | null }
  assignedTo: { id: string; name: string; email: string; role: string } | null
  lineItems: Array<{ id: string; description: string; quantity: number; unitPrice: number; discount: number; total: number }>
  quote: { id: string; number: string; status: string } | null
  invoice: { id: string; number: string; status: string; total: number } | null
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetch(`/api/jobs/${params.id}`)
      .then(r => r.json())
      .then(data => setJob(data.job))
      .finally(() => setLoading(false))
  }, [params.id])

  async function updateStatus(status: string) {
    setUpdating(true)
    const data: Record<string, unknown> = { status }
    if (status === 'completed') data.completedAt = new Date().toISOString()
    const res = await fetch(`/api/jobs/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const result = await res.json()
    if (res.ok) setJob(result.job)
    setUpdating(false)
  }

  async function convertToInvoice() {
    setUpdating(true)
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: job!.client.id,
          jobId: job!.id,
          title: job!.title,
          notes: job!.notes,
          lineItems: job!.lineItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
          })),
        }),
      })
      const data = await res.json()
      if (res.ok) router.push(`/invoices/${data.invoice.id}`)
    } catch {}
    setUpdating(false)
  }

  async function handleDelete() {
    if (!confirm('Delete this job?')) return
    await fetch(`/api/jobs/${params.id}`, { method: 'DELETE' })
    router.push('/jobs')
  }

  if (loading) return <div className="p-6 text-center text-gray-400">Loading...</div>
  if (!job) return <div className="p-6 text-center text-red-500">Job not found</div>

  const subtotal = job.lineItems.reduce((sum, item) => sum + item.total, 0)

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/jobs" className="text-gray-400 hover:text-gray-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{job.number}</h1>
              <span className={`text-sm px-2.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[job.status]}`}>
                {STATUS_LABELS[job.status]}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">{job.title}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {job.status === 'scheduled' && (
            <button onClick={() => updateStatus('in_progress')} disabled={updating} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              Start Job
            </button>
          )}
          {job.status === 'in_progress' && (
            <button onClick={() => updateStatus('completed')} disabled={updating} className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
              Complete
            </button>
          )}
          {job.status === 'completed' && !job.invoice && (
            <button onClick={convertToInvoice} disabled={updating} className="px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50">
              Create Invoice
            </button>
          )}
          {job.invoice && (
            <Link href={`/invoices/${job.invoice.id}`} className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              View Invoice
            </Link>
          )}
          {(job.status === 'scheduled' || job.status === 'in_progress') && (
            <button onClick={() => updateStatus('cancelled')} disabled={updating} className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
              Cancel Job
            </button>
          )}
          <button onClick={handleDelete} className="px-3 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          {job.description && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-sm text-gray-600">{job.description}</p>
            </div>
          )}

          {/* Line Items */}
          {job.lineItems.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Line Items</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Description</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Qty</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Unit Price</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {job.lineItems.map(item => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-gray-100 flex justify-between text-sm font-semibold text-gray-900">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
            </div>
          )}

          {/* Notes */}
          {job.notes && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-2">Notes</h2>
              <p className="text-sm text-gray-600">{job.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Job Info</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Number</span>
                <span className="font-medium text-gray-900">{job.number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-700">{formatDate(job.createdAt)}</span>
              </div>
              {job.scheduledAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Scheduled</span>
                  <span className="text-gray-700">{formatDateTime(job.scheduledAt)}</span>
                </div>
              )}
              {job.completedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Completed</span>
                  <span className="text-gray-700">{formatDate(job.completedAt)}</span>
                </div>
              )}
              {job.assignedTo && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Assigned To</span>
                  <span className="text-gray-700">{job.assignedTo.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Client</h2>
            <Link href={`/clients/${job.client.id}`} className="block hover:bg-gray-50 rounded-lg -mx-2 px-2 py-1 transition-colors">
              <p className="text-sm font-medium text-blue-600">{job.client.name}</p>
              {job.client.email && <p className="text-xs text-gray-500">{job.client.email}</p>}
              {job.client.phone && <p className="text-xs text-gray-500">{job.client.phone}</p>}
              {(job.client.address || job.client.city) && (
                <p className="text-xs text-gray-500">{[job.client.address, job.client.city, job.client.state].filter(Boolean).join(', ')}</p>
              )}
            </Link>
          </div>

          {job.quote && (
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-2">From Quote</h2>
              <Link href={`/quotes/${job.quote.id}`} className="text-blue-700 text-sm font-medium hover:underline">
                {job.quote.number}
              </Link>
            </div>
          )}

          {job.invoice && (
            <div className="bg-green-50 rounded-xl border border-green-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-2">Invoice</h2>
              <Link href={`/invoices/${job.invoice.id}`} className="text-green-700 text-sm font-medium hover:underline">
                {job.invoice.number}
              </Link>
              <p className="text-sm text-gray-600 mt-1">{formatCurrency(job.invoice.total)}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[job.invoice.status]} mt-1 inline-block`}>
                {STATUS_LABELS[job.invoice.status]}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
