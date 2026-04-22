'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, formatDate, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'

interface Quote {
  id: string
  number: string
  title: string
  status: string
  notes: string | null
  subtotal: number
  tax: number
  total: number
  validUntil: string | null
  createdAt: string
  client: { id: string; name: string; email: string | null; phone: string | null; address: string | null; city: string | null; state: string | null }
  lineItems: Array<{ id: string; description: string; quantity: number; unitPrice: number; discount: number; total: number }>
  job: { id: string; number: string; status: string } | null
}

export default function QuoteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetch(`/api/quotes/${params.id}`)
      .then(r => r.json())
      .then(data => setQuote(data.quote))
      .finally(() => setLoading(false))
  }, [params.id])

  async function updateStatus(status: string) {
    setUpdating(true)
    const res = await fetch(`/api/quotes/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const data = await res.json()
    if (res.ok) setQuote(data.quote)
    setUpdating(false)
  }

  async function convertToJob() {
    setUpdating(true)
    try {
      // Create a job from this quote
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: quote!.client.id,
          quoteId: quote!.id,
          title: quote!.title,
          description: quote!.notes,
          status: 'scheduled',
          lineItems: quote!.lineItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
          })),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        await updateStatus('converted')
        router.push(`/jobs/${data.job.id}`)
      }
    } catch {
      // Handle error
    }
    setUpdating(false)
  }

  async function handleDelete() {
    if (!confirm('Delete this quote?')) return
    await fetch(`/api/quotes/${params.id}`, { method: 'DELETE' })
    router.push('/quotes')
  }

  if (loading) return <div className="p-6 text-center text-gray-400">Loading...</div>
  if (!quote) return <div className="p-6 text-center text-red-500">Quote not found</div>

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/quotes" className="text-gray-400 hover:text-gray-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{quote.number}</h1>
              <span className={`text-sm px-2.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[quote.status]}`}>
                {STATUS_LABELS[quote.status]}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">{quote.title}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {quote.status === 'draft' && (
            <button onClick={() => updateStatus('sent')} disabled={updating} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              Mark Sent
            </button>
          )}
          {quote.status === 'sent' && (
            <>
              <button onClick={() => updateStatus('approved')} disabled={updating} className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                Approve
              </button>
              <button onClick={() => updateStatus('declined')} disabled={updating} className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                Decline
              </button>
            </>
          )}
          {quote.status === 'approved' && !quote.job && (
            <button onClick={convertToJob} disabled={updating} className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50">
              Convert to Job
            </button>
          )}
          {quote.job && (
            <Link href={`/jobs/${quote.job.id}`} className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              View Job {quote.job.number}
            </Link>
          )}
          <button onClick={handleDelete} className="px-3 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quote Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Line Items */}
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
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Disc%</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {quote.lineItems.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.discount > 0 ? `${item.discount}%` : '—'}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax (8.25%)</span>
                <span>{formatCurrency(quote.tax)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatCurrency(quote.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-2">Notes</h2>
              <p className="text-sm text-gray-600">{quote.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Quote Info</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Number</span>
                <span className="font-medium text-gray-900">{quote.number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-700">{formatDate(quote.createdAt)}</span>
              </div>
              {quote.validUntil && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Valid Until</span>
                  <span className="text-gray-700">{formatDate(quote.validUntil)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-semibold text-gray-900">{formatCurrency(quote.total)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Client</h2>
            <Link href={`/clients/${quote.client.id}`} className="block hover:bg-gray-50 rounded-lg -mx-2 px-2 py-1 transition-colors">
              <p className="text-sm font-medium text-blue-600">{quote.client.name}</p>
              {quote.client.email && <p className="text-xs text-gray-500">{quote.client.email}</p>}
              {quote.client.phone && <p className="text-xs text-gray-500">{quote.client.phone}</p>}
            </Link>
          </div>

          {quote.job && (
            <div className="bg-green-50 rounded-xl border border-green-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-2">Converted to Job</h2>
              <Link href={`/jobs/${quote.job.id}`} className="text-green-700 text-sm font-medium hover:underline">
                {quote.job.number}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
