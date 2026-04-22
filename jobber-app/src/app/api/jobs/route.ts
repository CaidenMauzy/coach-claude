import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRequestToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  if (!verifyRequestToken(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const clientId = searchParams.get('clientId')
  const assignedToId = searchParams.get('assignedToId')

  const jobs = await prisma.job.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(clientId ? { clientId } : {}),
      ...(assignedToId ? { assignedToId } : {}),
    },
    include: {
      client: { select: { id: true, name: true, phone: true, address: true, city: true, state: true } },
      assignedTo: { select: { id: true, name: true } },
      invoice: { select: { id: true, status: true } },
    },
    orderBy: { scheduledAt: 'asc' },
  })

  return NextResponse.json({ jobs })
}

export async function POST(request: NextRequest) {
  if (!verifyRequestToken(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { lineItems, ...data } = await request.json()

  const count = await prisma.job.count()
  const number = `J-${String(count + 1).padStart(4, '0')}`

  const job = await prisma.job.create({
    data: {
      ...data,
      number,
      lineItems: lineItems ? {
        create: lineItems.map((item: { description: string; quantity: number; unitPrice: number; discount: number }) => ({
          ...item,
          total: item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100),
        })),
      } : undefined,
    },
    include: { client: true, assignedTo: true, lineItems: true },
  })

  return NextResponse.json({ job }, { status: 201 })
}
