import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRequestToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  if (!verifyRequestToken(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const payments = await prisma.payment.findMany({
    include: {
      invoice: {
        select: {
          id: true,
          number: true,
          title: true,
          client: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { paidAt: 'desc' },
  })

  return NextResponse.json({ payments })
}

export async function POST(request: NextRequest) {
  if (!verifyRequestToken(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await request.json()
  const { invoiceId, amount, method, notes, paidAt } = data

  const payment = await prisma.payment.create({
    data: {
      invoiceId,
      amount: parseFloat(amount),
      method: method || 'card',
      notes,
      paidAt: paidAt ? new Date(paidAt) : new Date(),
    },
    include: {
      invoice: { select: { id: true, number: true, title: true, total: true } },
    },
  })

  // Check if invoice is fully paid
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  })

  if (invoice) {
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0)
    if (totalPaid >= invoice.total) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'paid', paidAt: new Date() },
      })
    }
  }

  return NextResponse.json({ payment }, { status: 201 })
}
