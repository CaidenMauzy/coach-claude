'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, FileText, Briefcase, Calendar,
  Receipt, CreditCard, UserCheck, BarChart2, Settings, LogOut, Wrench,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/clients', icon: Users, label: 'Clients' },
  { href: '/quotes', icon: FileText, label: 'Quotes' },
  { href: '/jobs', icon: Briefcase, label: 'Jobs' },
  { href: '/schedule', icon: Calendar, label: 'Schedule' },
  { href: '/invoices', icon: Receipt, label: 'Invoices' },
  { href: '/payments', icon: CreditCard, label: 'Payments' },
  { href: '/team', icon: UserCheck, label: 'Team' },
  { href: '/reports', icon: BarChart2, label: 'Reports' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside className="w-64 min-h-screen flex flex-col" style={{ backgroundColor: '#1a2e44' }}>
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#2eb844' }}>
            <Wrench size={16} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-none">FieldPro</div>
            <div className="text-white/50 text-xs">Field Service Manager</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              style={active ? { backgroundColor: '#2eb844' } : {}}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-4 border-t border-white/10 pt-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 w-full transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
