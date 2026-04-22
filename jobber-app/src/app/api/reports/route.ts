import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRequestToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  if (!verifyRequestToken(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()

  const [invoices, jobs, clients] = await Promise.all([
    prisma.invoice.findMany({
      where: { status: 'paid' },
      select: { total: true, paidAt: true, clientId: true },
    }),
    prisma.job.findMany({
      select: { status: true, clientId: true },
    }),
    prisma.client.findMany({
      select: { id: true, name: true },
    }),
  ])

  // Revenue by month (last 12 months)
  const revenueByMonth: { month: string; revenue: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
    const monthName = monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    const revenue = invoices
      .filter(inv => inv.paidAt && new Date(inv.paidAt) >= monthStart && new Date(inv.paidAt) <= monthEnd)
      .reduce((sum, inv) => sum + inv.total, 0)
    revenueByMonth.push({ month: monthName, revenue })
  }

  // Jobs by status
  const jobsByStatus = {
    scheduled: jobs.filter(j => j.status === 'scheduled').length,
    in_progress: jobs.filter(j => j.status === 'in_progress').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    cancelled: jobs.filter(j => j.status === 'cancelled').length,
  }

  // Top clients by revenue
  const clientRevenue = new Map<string, number>()
  invoices.forEach(inv => {
    const current = clientRevenue.get(inv.clientId) || 0
    clientRevenue.set(inv.clientId, current + inv.total)
  })

  const topClients = clients
    .map(c => ({ ...c, revenue: clientRevenue.get(c.id) || 0 }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  // Outstanding receivables
  const outstandingInvoices = await prisma.invoice.findMany({
    where: { status: { in: ['sent', 'viewed', 'overdue'] } },
    include: { client: { select: { name: true } }, payments: { select: { amount: true } } },
    orderBy: { dueDate: 'asc' },
  })

  const outstandingReceivables = outstandingInvoices.map(inv => {
    const paid = inv.payments.reduce((sum, p) => sum + p.amount, 0)
    const outstanding = inv.total - paid
    const daysOverdue = inv.dueDate
      ? Math.max(0, Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / 86400000))
      : 0
    return {
      id: inv.id,
      number: inv.number,
      client: inv.client.name,
      total: inv.total,
      paid,
      outstanding,
      dueDate: inv.dueDate,
      status: inv.status,
      daysOverdue,
    }
  })

  return NextResponse.json({
    revenueByMonth,
    jobsByStatus,
    topClients,
    outstandingReceivables,
  })
}
