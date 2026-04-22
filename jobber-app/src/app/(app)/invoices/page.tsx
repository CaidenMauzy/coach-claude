'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Receipt } from 'lucide-react'
import { formatCurrency, formatDate, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface Invoice {
  id: string
  number: string
  title: string
  status: string
  total: number
  dueDate: string | null
  paidAt: string | null
  createdAt: string
  client: { id: string; name: string }
}

const STATUS_FILTERS = ['all', 'draft', 'sent', 'viewed', 'paid', 'overdue']

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = filter !== 'all' ? `?status=${filter}` : ''
    fetch(`/api/invoices${params}`)
      .then(r => r.json())
      .then(d => setInvoices(d.invoices || []))
      .finally(() => setLoading(false))
  }, [filter])

  const totalOutstanding = invoices
    .filter(i => ['sent', 'viewed', 'overdue'].includes(i.status))
    .reduce((s, i) => s + i.total, 0)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500 text-sm mt-1">{invoices.length} invoices · {formatCurrency(totalOutstanding)} outstanding</p>
        </div>
        <Link href="/invoices/new"><Button><Plus size={16} /> New Invoice</Button></Link>
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-4 w-fit flex-wrap">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
              filter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {s === 'all' ? 'All' : STATUS_LABELS[s] || s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <Receipt size={32} className="text-gray-300 mb-3" />
            <p className="font-medium text-gray-900">No invoices found</p>
            <p className="text-sm text-gray-500 mt-1 mb-4">Create an invoice to bill your clients.</p>
            <Link href="/invoices/new"><Button size="sm"><Plus size={14} /> New Invoice</Button></Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Invoice</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Due Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/invoices/${inv.id}`} className="font-medium text-gray-900 hover:underline">{inv.title}</Link>
                    <div className="text-xs text-gray-400">{inv.number}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/clients/${inv.client.id}`} className="text-gray-600 hover:underline">{inv.client.name}</Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[inv.status] || ''}`}>
                      {STATUS_LABELS[inv.status] || inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(inv.total)}</td>
                  <td className="px-6 py-4 text-gray-500">
                    <span className={inv.status === 'overdue' ? 'text-red-600 font-medium' : ''}>
                      {formatDate(inv.dueDate)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(inv.paidAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
