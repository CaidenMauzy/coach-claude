'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2, CreditCard, Send, CheckCircle } from 'lucide-react'
import { formatCurrency, formatDate, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'

interface Invoice {
  id: string
  number: string
  title: string
  status: string
  notes: string | null
  subtotal: number
  tax: number
  total: number
  dueDate: string | null
  paidAt: string | null
  createdAt: string
  client: { id: string; name: string; email: string | null; phone: string | null }
  lineItems: Array<{ id: string; description: string; quantity: number; unitPrice: number; discount: number; total: number }>
  payments: Array<{ id: string; amount: number; method: string; paidAt: string; notes: string | null }>
  job: { id: string; number: string } | null
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [payModal, setPayModal] = useState(false)
  const [payForm, setPayForm] = useState({ amount: '', method: 'card', notes: '', paidAt: new Date().toISOString().split('T')[0] })

  useEffect(() => {
    fetch(`/api/invoices/${id}`).then(r => r.json()).then(d => {
      setInvoice(d.invoice)
      if (d.invoice) setPayForm(f => ({ ...f, amount: String(d.invoice.total) }))
    }).finally(() => setLoading(false))
  }, [id])

  async function updateStatus(status: string) {
    setActionLoading(status)
    const res = await fetch(`/api/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const data = await res.json()
    if (res.ok) setInvoice(data.invoice)
    setActionLoading('')
  }

  async function recordPayment(e: React.FormEvent) {
    e.preventDefault()
    setActionLoading('pay')
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId: id, ...payForm, paidAt: new Date(payForm.paidAt).toISOString() }),
    })
    if (res.ok) {
      const updatedRes = await fetch(`/api/invoices/${id}`)
      const data = await updatedRes.json()
      setInvoice(data.invoice)
      setPayModal(false)
    }
    setActionLoading('')
  }

  async function deleteInvoice() {
    if (!confirm('Delete this invoice?')) return
    await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
    router.push('/invoices')
  }

  if (loading) return <div className="p-6 animate-pulse"><div className="h-8 bg-gray-200 rounded w-64 mb-4" /></div>
  if (!invoice) return <div className="p-6 text-gray-500">Invoice not found.</div>

  const totalPaid = invoice.payments.reduce((s, p) => s + p.amount, 0)
  const balance = invoice.total - totalPaid

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/invoices" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><ArrowLeft size={18} /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{invoice.title}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[invoice.status] || ''}`}>
              {STATUS_LABELS[invoice.status] || invoice.status}
            </span>
          </div>
          <p className="text-gray-500 text-sm">{invoice.number} · Due {formatDate(invoice.dueDate)}</p>
        </div>
        <div className="flex gap-2">
          {invoice.status === 'draft' && (
            <Button variant="secondary" size="sm" loading={actionLoading === 'sent'} onClick={() => updateStatus('sent')}>
              <Send size={14} /> Send
            </Button>
          )}
          {['sent', 'viewed', 'overdue'].includes(invoice.status) && (
            <Button size="sm" onClick={() => setPayModal(true)}>
              <CreditCard size={14} /> Record Payment
            </Button>
          )}
          {invoice.status !== 'paid' && (
            <Button variant="outline" size="sm" loading={actionLoading === 'paid'} onClick={() => updateStatus('paid')}>
              <CheckCircle size={14} /> Mark Paid
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={deleteInvoice}><Trash2 size={14} /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Line Items</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">Description</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Qty</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Unit Price</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoice.lineItems.map(item => (
                  <tr key={item.id}>
                    <td className="py-3">{item.description}</td>
                    <td className="py-3 text-right text-gray-600">{item.quantity}</td>
                    <td className="py-3 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-3 text-right font-medium">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Tax (8.25%)</span><span>{formatCurrency(invoice.tax)}</span></div>
              <div className="flex justify-between font-semibold text-gray-900 text-base pt-1 border-t border-gray-100">
                <span>Total</span><span>{formatCurrency(invoice.total)}</span>
              </div>
              {totalPaid > 0 && (
                <>
                  <div className="flex justify-between text-green-600"><span>Paid</span><span>-{formatCurrency(totalPaid)}</span></div>
                  <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1">
                    <span>Balance Due</span><span>{formatCurrency(balance)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {invoice.payments.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Payment History</h2>
              <div className="space-y-2">
                {invoice.payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(p.amount)}</span>
                      <span className="text-xs text-gray-500 ml-2 capitalize">{p.method}</span>
                      {p.notes && <span className="text-xs text-gray-400 ml-2">{p.notes}</span>}
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(p.paidAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Client</h3>
            <Link href={`/clients/${invoice.client.id}`} className="font-medium text-blue-600 hover:underline">
              {invoice.client.name}
            </Link>
            {invoice.client.email && <p className="text-sm text-gray-500 mt-1">{invoice.client.email}</p>}
            {invoice.client.phone && <p className="text-sm text-gray-500">{invoice.client.phone}</p>}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Created</span>
              <span className="font-medium">{formatDate(invoice.createdAt)}</span>
            </div>
            {invoice.paidAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Paid</span>
                <span className="font-medium text-green-600">{formatDate(invoice.paidAt)}</span>
              </div>
            )}
            {invoice.job && (
              <div className="flex justify-between">
                <span className="text-gray-500">Linked Job</span>
                <Link href={`/jobs/${invoice.job.id}`} className="font-medium text-blue-600 hover:underline">
                  {invoice.job.number}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={payModal} onClose={() => setPayModal(false)} title="Record Payment">
        <form onSubmit={recordPayment} className="p-6 space-y-4">
          <Input label="Amount" type="number" step="0.01" min="0.01" value={payForm.amount}
            onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} required />
          <Select label="Payment Method" value={payForm.method} onChange={e => setPayForm(f => ({ ...f, method: e.target.value }))}>
            <option value="card">Credit Card</option>
            <option value="cash">Cash</option>
            <option value="check">Check</option>
            <option value="bank_transfer">Bank Transfer</option>
          </Select>
          <Input label="Payment Date" type="date" value={payForm.paidAt}
            onChange={e => setPayForm(f => ({ ...f, paidAt: e.target.value }))} />
          <Input label="Notes (optional)" value={payForm.notes}
            onChange={e => setPayForm(f => ({ ...f, notes: e.target.value }))} placeholder="Check number, etc." />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setPayModal(false)}>Cancel</Button>
            <Button type="submit" loading={actionLoading === 'pay'}><CreditCard size={14} /> Record Payment</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
