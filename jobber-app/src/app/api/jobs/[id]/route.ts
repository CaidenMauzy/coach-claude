import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRequestToken } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyRequestToken(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      client: true,
      assignedTo: { select: { id: true, name: true, email: true, role: true } },
      lineItems: true,
      quote: { select: { id: true, number: true, status: true } },
      invoice: { select: { id: true, number: true, status: true, total: true } },
    },
  })

  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ job })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyRequestToken(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const { lineItems, ...data } = await request.json()

  if (lineItems) {
    await prisma.lineItem.deleteMany({ where: { jobId: id } })
  }

  const job = await prisma.job.update({
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
    include: { client: true, assignedTo: true, lineItems: true },
  })

  return NextResponse.json({ job })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyRequestToken(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await prisma.lineItem.deleteMany({ where: { jobId: id } })
  await prisma.job.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
