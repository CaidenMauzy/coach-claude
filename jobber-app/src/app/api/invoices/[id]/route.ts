import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRequestToken } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyRequestToken(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      client: true,
      lineItems: true,
      job: { select: { id: true, number: true, status: true } },
      payments: { orderBy: { paidAt: 'desc' } },
    },
  })

  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ invoice })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyRequestToken(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { lineItems, ...data } = await request.json()

  if (lineItems) {
    await prisma.lineItem.deleteMany({ where: { invoiceId: id } })
    const subtotal = lineItems.reduce((sum: number, item: { quantity: number; unitPrice: number; discount: number }) => {
      return sum + item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100)
    }, 0)
    data.subtotal = subtotal
    data.tax = subtotal * 0.0825
    data.total = data.subtotal + data.tax
  }

  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      ...data,
      ...(lineItems ? {
        lineItems: {
          create: lineItems.map((item: { description: string; quantity: number; unitPrice: number; discount: number }) => ({
            ...item,
            total: item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100),
          })),
        },
      } : {}),
    },
    include: { client: true, lineItems: true, payments: true },
  })

  return NextResponse.json({ invoice })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyRequestToken(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.payment.deleteMany({ where: { invoiceId: id } })
  await prisma.lineItem.deleteMany({ where: { invoiceId: id } })
  await prisma.invoice.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
