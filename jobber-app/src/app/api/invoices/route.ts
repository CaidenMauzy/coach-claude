import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRequestToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  if (!verifyRequestToken(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const clientId = searchParams.get('clientId')

  const invoices = await prisma.invoice.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(clientId ? { clientId } : {}),
    },
    include: {
      client: { select: { id: true, name: true, email: true } },
      job: { select: { id: true, number: true } },
      payments: { select: { id: true, amount: true, paidAt: true, method: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ invoices })
}

export async function POST(request: NextRequest) {
  if (!verifyRequestToken(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { lineItems, ...data } = await request.json()

  const count = await prisma.invoice.count()
  const number = `INV-${String(count + 1).padStart(4, '0')}`

  const subtotal = lineItems?.reduce((sum: number, item: { quantity: number; unitPrice: number; discount: number }) => {
    return sum + item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100)
  }, 0) || 0
  const tax = subtotal * 0.0825
  const total = subtotal + tax

  const invoice = await prisma.invoice.create({
    data: {
      ...data,
      number,
      subtotal,
      tax,
      total,
      lineItems: lineItems ? {
        create: lineItems.map((item: { description: string; quantity: number; unitPrice: number; discount: number }) => ({
          ...item,
          total: item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100),
        })),
      } : undefined,
    },
    include: { client: true, lineItems: true },
  })

  return NextResponse.json({ invoice }, { status: 201 })
}
