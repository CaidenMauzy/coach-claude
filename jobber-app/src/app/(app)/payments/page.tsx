'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CreditCard } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Payment {
  id: string
  amount: number
  method: string
  notes: string | null
  paidAt: string
  invoice: {
    id: string
    number: string
    title: string
    client: { id: string; name: string }
  }
}

const METHOD_LABELS: Record<string, string> = {
  card: 'Credit Card',
  cash: 'Cash',
  check: 'Check',
  bank_transfer: 'Bank Transfer',
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/payments')
      .then(r => r.json())
      .then(d => setPayments(d.payments || []))
      .finally(() => setLoading(false))
  }, [])

  const total = payments.reduce((s, p) => s + p.amount, 0)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500 text-sm mt-1">{payments.length} payments · {formatCurrency(total)} received</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <CreditCard size={32} className="text-gray-300 mb-3" />
            <p className="font-medium text-gray-900">No payments recorded</p>
            <p className="text-sm text-gray-500 mt-1">Payments are recorded from invoice detail pages.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Invoice</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Method</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-600">{formatDate(p.paidAt)}</td>
                  <td className="px-6 py-4">
                    <Link href={`/clients/${p.invoice.client.id}`} className="text-gray-900 hover:underline font-medium">
                      {p.invoice.client.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/invoices/${p.invoice.id}`} className="text-blue-600 hover:underline text-sm">
                      {p.invoice.number}
                    </Link>
                    <div className="text-xs text-gray-400">{p.invoice.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-gray-600">
                      <CreditCard size={13} className="text-gray-400" />
                      {METHOD_LABELS[p.method] || p.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{p.notes || '—'}</td>
                  <td className="px-6 py-4 text-right font-semibold text-green-700">{formatCurrency(p.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-gray-200 bg-gray-50">
              <tr>
                <td colSpan={5} className="px-6 py-3 text-sm font-semibold text-gray-700">Total Received</td>
                <td className="px-6 py-3 text-right font-bold text-gray-900">{formatCurrency(total)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  )
}
