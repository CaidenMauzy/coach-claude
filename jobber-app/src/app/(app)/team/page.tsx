'use client'

import { useEffect, useState } from 'react'
import { UserCheck, Plus, Mail, Briefcase } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  _count: { jobs: number }
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  manager: 'Manager',
  field_worker: 'Field Worker',
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  manager: 'bg-blue-100 text-blue-700',
  field_worker: 'bg-green-100 text-green-700',
}

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: 'demo123', role: 'field_worker' })
  const [error, setError] = useState('')

  function loadTeam() {
    fetch('/api/team').then(r => r.json()).then(d => setTeam(d.team || [])).finally(() => setLoading(false))
  }

  useEffect(() => { loadTeam() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add member')
      setTeam(t => [...t, data.user])
      setModal(false)
      setForm({ name: '', email: '', password: 'demo123', role: 'field_worker' })
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-500 text-sm mt-1">{team.length} members</p>
        </div>
        <Button onClick={() => setModal(true)}><Plus size={16} /> Add Member</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-36" />
          ))
        ) : team.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center py-16">
            <UserCheck size={32} className="text-gray-300 mb-3" />
            <p className="font-medium text-gray-900">No team members yet</p>
            <p className="text-sm text-gray-500 mt-1 mb-4">Add team members to assign them to jobs.</p>
            <Button size="sm" onClick={() => setModal(true)}><Plus size={14} /> Add Member</Button>
          </div>
        ) : (
          team.map(member => (
            <div key={member.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                  style={{ backgroundColor: '#1a2e44' }}>
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[member.role] || 'bg-gray-100 text-gray-700'}`}>
                  {ROLE_LABELS[member.role] || member.role}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900">{member.name}</h3>
              <div className="mt-1 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Mail size={12} className="text-gray-400" />{member.email}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Briefcase size={12} className="text-gray-400" />{member._count.jobs} jobs assigned
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">Joined {formatDate(member.createdAt)}</p>
            </div>
          ))
        )}
      </div>

      <Modal open={modal} onClose={() => { setModal(false); setError('') }} title="Add Team Member">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2" placeholder="Jane Smith" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2" placeholder="jane@company.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2">
              <option value="field_worker">Field Worker</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Add Member</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
