'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { CheckCircle } from 'lucide-react'

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    businessName: 'FieldPro Services',
    email: 'admin@fieldpro.com',
    phone: '(555) 100-2000',
    address: '1234 Main Street',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    taxRate: '8.25',
    invoiceTerms: 'Payment due within 30 days.',
    quoteTerms: 'Quote valid for 30 days.',
  })

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your business information and preferences</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Business Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                <input value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Tax & Terms */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Billing Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Tax Rate (%)</label>
              <input type="number" step="0.01" min="0" max="100" value={form.taxRate}
                onChange={e => setForm(f => ({ ...f, taxRate: e.target.value }))}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2" />
              <p className="text-xs text-gray-400 mt-1">Applied to quotes and invoices</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Invoice Terms</label>
              <textarea value={form.invoiceTerms} onChange={e => setForm(f => ({ ...f, invoiceTerms: e.target.value }))}
                rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Quote Terms</label>
              <textarea value={form.quoteTerms} onChange={e => setForm(f => ({ ...f, quoteTerms: e.target.value }))}
                rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 resize-none" />
            </div>
          </div>
        </div>

        {/* Demo Data */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h2 className="font-semibold text-amber-900 mb-2">Demo Data</h2>
          <p className="text-sm text-amber-700 mb-3">Reset the database with fresh demo data (clients, jobs, quotes, invoices).</p>
          <button
            type="button"
            onClick={async () => {
              if (!confirm('This will delete all current data and reload demo data. Continue?')) return
              await fetch('/api/seed', { method: 'POST' })
              alert('Demo data reloaded! Refresh the page to see changes.')
            }}
            className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
          >
            Reload Demo Data
          </button>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="submit">
            {saved ? <><CheckCircle size={16} /> Saved!</> : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  )
}
