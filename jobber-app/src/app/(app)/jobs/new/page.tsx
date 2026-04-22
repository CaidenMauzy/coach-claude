'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Client { id: string; name: string }
interface TeamMember { id: string; name: string; role: string }
interface LineItem { description: string; quantity: number; unitPrice: number; discount: number }

function NewJobForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [clients, setClients] = useState<Client[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: '', quantity: 1, unitPrice: 0, discount: 0 }])
  const [formData, setFormData] = useState({
    clientId: searchParams.get('clientId') || '',
    title: '',
    description: '',
    status: 'scheduled',
    scheduledAt: '',
    assignedToId: '',
    notes: '',
  })

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(d => setClients(d.clients || []))
    fetch('/api/team').then(r => r.json()).then(d => setTeam(d.team || []))
  }, [])

  function updateLineItem(idx: number, field: keyof LineItem, value: string | number) {
    setLineItems(items => items.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.clientId) { setError('Please select a client'); return }
    setSaving(true)
    setError('')
    try {
      const body: Record<string, unknown> = { ...formData }
      if (lineItems.some(li => li.description)) body.lineItems = lineItems.filter(li => li.description)
      if (!body.assignedToId) delete body.assignedToId
      if (body.scheduledAt) body.scheduledAt = new Date(formData.scheduledAt).toISOString()

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/jobs/${data.job.id}`)
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice * (1 - item.discount / 100), 0)

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/jobs" className="text-gray-400 hover:text-gray-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Job</h1>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Job Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
              <select value={formData.clientId} onChange={e => setFormData(d => ({ ...d, clientId: e.target.value }))} required className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select a client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
              <select value={formData.assignedToId} onChange={e => setFormData(d => ({ ...d, assignedToId: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Unassigned</option>
                {team.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
            <input value={formData.title} onChange={e => setFormData(d => ({ ...d, title: e.target.value }))} required className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Lawn Maintenance - April" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={e => setFormData(d => ({ ...d, description: e.target.value }))} rows={2} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Job description..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date & Time</label>
              <input type="datetime-local" value={formData.scheduledAt} onChange={e => setFormData(d => ({ ...d, scheduledAt: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData(d => ({ ...d, status: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={formData.notes} onChange={e => setFormData(d => ({ ...d, notes: e.target.value }))} rows={2} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Internal notes..." />
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Line Items (Optional)</h2>
          <div className="space-y-3">
            {lineItems.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <input value={item.description} onChange={e => updateLineItem(idx, 'description', e.target.value)} placeholder="Description" className="col-span-5 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="number" value={item.quantity} onChange={e => updateLineItem(idx, 'quantity', parseFloat(e.target.value) || 0)} placeholder="Qty" min="0" step="0.01" className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="number" value={item.unitPrice} onChange={e => updateLineItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} placeholder="Price" min="0" step="0.01" className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="number" value={item.discount} onChange={e => updateLineItem(idx, 'discount', parseFloat(e.target.value) || 0)} placeholder="Disc%" min="0" max="100" className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="button" onClick={() => setLineItems(items => items.filter((_, i) => i !== idx))} disabled={lineItems.length === 1} className="col-span-1 flex items-center justify-center text-gray-400 hover:text-red-500 disabled:opacity-30">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setLineItems(items => [...items, { description: '', quantity: 1, unitPrice: 0, discount: 0 }])} className="mt-3 flex items-center gap-2 text-blue-600 text-sm hover:text-blue-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add line item
          </button>
          {subtotal > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm font-medium text-gray-900">
              <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/jobs" className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</Link>
          <button type="submit" disabled={saving} className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-blue-400">
            {saving ? 'Creating...' : 'Create Job'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function NewJobPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-gray-400">Loading...</div>}>
      <NewJobForm />
    </Suspense>
  )
}
