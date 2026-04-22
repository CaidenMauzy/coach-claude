import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRequestToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  if (!verifyRequestToken(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''

  const clients = await prisma.client.findMany({
    where: search ? {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ],
    } : undefined,
    include: {
      _count: { select: { jobs: true, quotes: true, invoices: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ clients })
}

export async function POST(request: NextRequest) {
  if (!verifyRequestToken(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await request.json()
  const client = await prisma.client.create({ data })
  return NextResponse.json({ client }, { status: 201 })
}
