import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRequestToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  if (!verifyRequestToken(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const team = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { jobs: true } },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ team })
}

export async function POST(request: NextRequest) {
  if (!verifyRequestToken(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, email, password, role } = await request.json()

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password || 'demo123', 10)

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role: role || 'field_worker' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  return NextResponse.json({ user }, { status: 201 })
}
