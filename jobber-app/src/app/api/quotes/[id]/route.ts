import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRequestToken } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyRequestToken(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { client: true, lineItems: true, job: true },
  })

  if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ quote })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyRequestToken(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { lineItems, ...data } = await request.json()

  await prisma.lineItem.deleteMany({ where: { quoteId: id } })

  const subtotal = lineItems?.reduce((sum: number, item: { quantity: number; unitPrice: number; discount: number }) => {
    return sum + item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100)
  }, 0) || data.subtotal || 0
  const tax = subtotal * 0.0825
  const total = subtotal + tax

  const quote = await prisma.quote.update({
    where: { id },
    data: {
      ...data,
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

  return NextResponse.json({ quote })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyRequestToken(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.lineItem.deleteMany({ where: { quoteId: id } })
  await prisma.quote.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
