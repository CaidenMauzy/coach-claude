'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  city: string | null
  state: string | null
  tags: string | null
  createdAt: string
  _count: { jobs: number; quotes: number; invoices: number }
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/clients?search=${encodeURIComponent(search)}`)
      .then(r => r.json())
      .then(data => setClients(data.clients || []))
      .finally(() => setLoading(false))
  }, [search])

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 text-sm mt-0.5">{clients.length} total clients</p>
        </div>
        <Link href="/clients/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Client
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : clients.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            </div>
            <p className="text-gray-500 font-medium">No clients found</p>
            <p className="text-gray-400 text-sm mt-1">
              {search ? 'Try a different search term' : 'Add your first client to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Location</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jobs</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Invoices</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clients.map(client => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-700 text-xs font-medium">{client.name.charAt(0)}</span>
                        </div>
                        <div>
                          <Link href={`/clients/${client.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                            {client.name}
                          </Link>
                          {client.tags && (
                            <div className="flex gap-1 mt-0.5">
                              {client.tags.split(',').slice(0,2).map(tag => (
                                <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{tag.trim()}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="text-sm text-gray-600">{client.email || '—'}</div>
                      <div className="text-xs text-gray-400">{client.phone || ''}</div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 hidden lg:table-cell">
                      {client.city && client.state ? `${client.city}, ${client.state}` : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="text-sm font-medium text-gray-900">{client._count.jobs}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                      <span className="text-sm font-medium text-gray-900">{client._count.invoices}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link href={`/clients/${client.id}`} className="text-blue-600 hover:text-blue-700 text-sm">
                        View
                      </Link>
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
