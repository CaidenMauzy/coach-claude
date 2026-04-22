'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, formatDate, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'

interface ClientDetail {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  notes: string | null
  tags: string | null
  createdAt: string
  quotes: Array<{ id: string; number: string; title: string; status: string; total: number; createdAt: string }>
  jobs: Array<{ id: string; number: string; title: string; status: string; scheduledAt: string | null; assignedTo: { name: string } | null }>
  invoices: Array<{ id: string; number: string; title: string; status: string; total: number; dueDate: string | null }>
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<ClientDetail>>({})
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'quotes' | 'invoices'>('overview')

  useEffect(() => {
    fetch(`/api/clients/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setClient(data.client)
        setEditData(data.client)
      })
      .finally(() => setLoading(false))
  }, [params.id])

  async function handleSave() {
    const res = await fetch(`/api/clients/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    })
    const data = await res.json()
    if (res.ok) {
      setClient({ ...client!, ...data.client })
      setEditing(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this client? This cannot be undone.')) return
    await fetch(`/api/clients/${params.id}`, { method: 'DELETE' })
    router.push('/clients')
  }

  if (loading) return <div className="p-6 text-center text-gray-400">Loading...</div>
  if (!client) return <div className="p-6 text-center text-red-500">Client not found</div>

  const totalRevenue = client.invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0)

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/clients" className="text-gray-400 hover:text-gray-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            {client.tags && (
              <div className="flex gap-1 mt-1">
                {client.tags.split(',').map(tag => (
                  <span key={tag} className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{tag.trim()}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditing(!editing)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button onClick={handleDelete} className="px-3 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            Delete
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Jobs</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{client.jobs.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Invoices</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{client.invoices.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Contact Info</h2>
          {editing ? (
            <div className="space-y-3">
              {(['name', 'email', 'phone', 'address', 'city', 'state', 'zip', 'notes'] as const).map(field => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-500 mb-1 capitalize">{field}</label>
                  {field === 'notes' ? (
                    <textarea
                      value={(editData[field] as string) || ''}
                      onChange={e => setEditData(d => ({ ...d, [field]: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  ) : (
                    <input
                      value={(editData[field] as string) || ''}
                      onChange={e => setEditData(d => ({ ...d, [field]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
              <button onClick={handleSave} className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {client.email && (
                <div className="flex items-center gap-2 text-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">{client.email}</a>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.1 2 2 0 0 1 3.59 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.09 6.09l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <span className="text-gray-700">{client.phone}</span>
                </div>
              )}
              {(client.address || client.city) && (
                <div className="flex items-start gap-2 text-sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" className="mt-0.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span className="text-gray-700">{[client.address, client.city, client.state, client.zip].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {client.notes && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-600">{client.notes}</p>
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">Client since {formatDate(client.createdAt)}</p>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="mt-5 pt-5 border-t border-gray-100 space-y-2">
            <Link href={`/quotes/new?clientId=${client.id}`} className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Create Quote
            </Link>
            <Link href={`/jobs/new?clientId=${client.id}`} className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              Schedule Job
            </Link>
            <Link href={`/invoices/new?clientId=${client.id}`} className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
              Create Invoice
            </Link>
          </div>
        </div>

        {/* History Tabs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
            {(['jobs', 'quotes', 'invoices'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                  activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab} ({tab === 'jobs' ? client.jobs.length : tab === 'quotes' ? client.quotes.length : client.invoices.length})
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {activeTab === 'jobs' && (
              <div className="divide-y divide-gray-50">
                {client.jobs.length === 0 ? (
                  <p className="p-6 text-center text-gray-400 text-sm">No jobs yet</p>
                ) : client.jobs.map(job => (
                  <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{job.title}</p>
                      <p className="text-xs text-gray-400">{job.number} {job.scheduledAt ? `• ${formatDate(job.scheduledAt)}` : ''}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[job.status]}`}>
                      {STATUS_LABELS[job.status]}
                    </span>
                  </Link>
                ))}
              </div>
            )}
            {activeTab === 'quotes' && (
              <div className="divide-y divide-gray-50">
                {client.quotes.length === 0 ? (
                  <p className="p-6 text-center text-gray-400 text-sm">No quotes yet</p>
                ) : client.quotes.map(quote => (
                  <Link key={quote.id} href={`/quotes/${quote.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{quote.title}</p>
                      <p className="text-xs text-gray-400">{quote.number} • {formatDate(quote.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{formatCurrency(quote.total)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[quote.status]}`}>
                        {STATUS_LABELS[quote.status]}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {activeTab === 'invoices' && (
              <div className="divide-y divide-gray-50">
                {client.invoices.length === 0 ? (
                  <p className="p-6 text-center text-gray-400 text-sm">No invoices yet</p>
                ) : client.invoices.map(inv => (
                  <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{inv.title}</p>
                      <p className="text-xs text-gray-400">{inv.number} {inv.dueDate ? `• Due ${formatDate(inv.dueDate)}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{formatCurrency(inv.total)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[inv.status]}`}>
                        {STATUS_LABELS[inv.status]}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
