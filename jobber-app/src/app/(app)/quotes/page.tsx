'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'

interface Quote {
  id: string
  number: string
  title: string
  status: string
  total: number
  validUntil: string | null
  createdAt: string
  client: { id: string; name: string; email: string | null }
}

const statusFilters = ['all', 'draft', 'sent', 'approved', 'declined', 'converted']

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = statusFilter !== 'all' ? `?status=${statusFilter}` : ''
    fetch(`/api/quotes${params}`)
      .then(r => r.json())
      .then(data => setQuotes(data.quotes || []))
      .finally(() => setLoading(false))
  }, [statusFilter])

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="text-gray-500 text-sm mt-0.5">{quotes.length} quotes</p>
        </div>
        <Link href="/quotes/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Quote
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
        ) : quotes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <p className="text-gray-500 font-medium">No quotes found</p>
            <Link href="/quotes/new" className="text-blue-600 text-sm mt-1 hover:underline">Create your first quote</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quote</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Valid Until</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {quotes.map(quote => (
                  <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <Link href={`/quotes/${quote.id}`} className="block">
                        <p className="text-sm font-medium text-gray-900 hover:text-blue-600">{quote.title}</p>
                        <p className="text-xs text-gray-400">{quote.number} • {formatDate(quote.createdAt)}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 hidden sm:table-cell">
                      <Link href={`/clients/${quote.client.id}`} className="hover:text-blue-600">{quote.client.name}</Link>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-500 hidden md:table-cell">
                      {quote.validUntil ? formatDate(quote.validUntil) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right text-sm font-medium text-gray-900">
                      {formatCurrency(quote.total)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[quote.status]}`}>
                        {STATUS_LABELS[quote.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link href={`/quotes/${quote.id}`} className="text-blue-600 hover:text-blue-700 text-sm">View</Link>
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
