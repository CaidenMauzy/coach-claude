import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRequestToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  if (!verifyRequestToken(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  const [
    totalClients,
    activeJobs,
    pendingQuotes,
    paidInvoices,
    overdueInvoices,
    sentInvoices,
    todayJobs,
    recentActivity,
    monthlyRevenue,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.job.count({ where: { status: { in: ['scheduled', 'in_progress'] } } }),
    prisma.quote.count({ where: { status: { in: ['draft', 'sent'] } } }),
    prisma.invoice.findMany({
      where: { status: 'paid' },
      select: { total: true, paidAt: true },
    }),
    prisma.invoice.findMany({
      where: { status: 'overdue' },
      select: { total: true },
    }),
    prisma.invoice.findMany({
      where: { status: { in: ['sent', 'viewed'] } },
      select: { total: true },
    }),
    prisma.job.findMany({
      where: {
        scheduledAt: { gte: todayStart, lt: todayEnd },
      },
      include: {
        client: { select: { name: true } },
        assignedTo: { select: { name: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    }),
    prisma.job.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      include: { client: { select: { name: true } } },
    }),
    // Monthly revenue for last 6 months
    prisma.invoice.findMany({
      where: {
        status: 'paid',
        paidAt: { gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
      },
      select: { total: true, paidAt: true },
    }),
  ])

  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0)
  const outstandingAmount = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0) +
    sentInvoices.reduce((sum, inv) => sum + inv.total, 0)

  // Build monthly revenue chart data
  const monthData: { month: string; revenue: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
    const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' })
    const revenue = monthlyRevenue
      .filter(inv => inv.paidAt && new Date(inv.paidAt) >= monthStart && new Date(inv.paidAt) <= monthEnd)
      .reduce((sum, inv) => sum + inv.total, 0)
    monthData.push({ month: monthName, revenue })
  }

  return NextResponse.json({
    kpis: {
      totalRevenue,
      activeJobs,
      pendingQuotes,
      outstandingAmount,
      totalClients,
    },
    todayJobs,
    recentActivity,
    monthlyRevenue: monthData,
  })
}
