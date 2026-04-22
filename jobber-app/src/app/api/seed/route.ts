import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Clear existing data
    await prisma.payment.deleteMany()
    await prisma.lineItem.deleteMany()
    await prisma.invoice.deleteMany()
    await prisma.job.deleteMany()
    await prisma.quote.deleteMany()
    await prisma.client.deleteMany()
    await prisma.user.deleteMany()

    const hash = await bcrypt.hash('demo123', 10)

    const admin = await prisma.user.create({
      data: { email: 'admin@demo.com', password: hash, name: 'Alex Johnson', role: 'admin' },
    })
    const worker1 = await prisma.user.create({
      data: { email: 'maria@demo.com', password: hash, name: 'Maria Garcia', role: 'field_worker' },
    })
    const worker2 = await prisma.user.create({
      data: { email: 'james@demo.com', password: hash, name: 'James Wilson', role: 'field_worker' },
    })

    const clients = await Promise.all([
      prisma.client.create({ data: { name: 'Sarah Mitchell', email: 'sarah@example.com', phone: '(555) 234-5678', address: '123 Oak Street', city: 'Austin', state: 'TX', zip: '78701', tags: 'residential,premium' } }),
      prisma.client.create({ data: { name: 'TechCorp Solutions', email: 'facilities@techcorp.com', phone: '(555) 345-6789', address: '456 Business Blvd', city: 'Austin', state: 'TX', zip: '78702', tags: 'commercial' } }),
      prisma.client.create({ data: { name: 'Robert & Linda Chen', email: 'rchen@email.com', phone: '(555) 456-7890', address: '789 Maple Ave', city: 'Round Rock', state: 'TX', zip: '78664', tags: 'residential' } }),
      prisma.client.create({ data: { name: 'Green Valley HOA', email: 'manager@greenvalley.com', phone: '(555) 567-8901', address: '100 Community Dr', city: 'Cedar Park', state: 'TX', zip: '78613', tags: 'commercial,recurring' } }),
      prisma.client.create({ data: { name: 'David Thompson', email: 'dthompson@gmail.com', phone: '(555) 678-9012', address: '321 Pine Road', city: 'Pflugerville', state: 'TX', zip: '78660', tags: 'residential' } }),
    ])

    const now = new Date()
    const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000)
    const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000)

    // Quotes
    const q1 = await prisma.quote.create({
      data: {
        number: 'Q-0001', clientId: clients[0].id, status: 'approved', title: 'Full House Cleaning',
        notes: 'Deep clean entire 3-bedroom house', validUntil: daysFromNow(14),
        subtotal: 350, tax: 28.88, total: 378.88,
        lineItems: { create: [
          { description: 'Deep cleaning service', quantity: 1, unitPrice: 250, discount: 0, total: 250 },
          { description: 'Window cleaning (interior)', quantity: 10, unitPrice: 10, discount: 0, total: 100 },
        ]},
      },
    })
    const q2 = await prisma.quote.create({
      data: {
        number: 'Q-0002', clientId: clients[1].id, status: 'sent', title: 'Office Maintenance Package',
        notes: 'Monthly commercial cleaning contract', validUntil: daysFromNow(30),
        subtotal: 1200, tax: 99, total: 1299,
        lineItems: { create: [
          { description: 'Office cleaning (2x/week)', quantity: 8, unitPrice: 150, discount: 0, total: 1200 },
        ]},
      },
    })
    await prisma.quote.create({
      data: {
        number: 'Q-0003', clientId: clients[2].id, status: 'draft', title: 'Lawn Care Service',
        subtotal: 180, tax: 14.85, total: 194.85,
        lineItems: { create: [
          { description: 'Lawn mowing & edging', quantity: 1, unitPrice: 120, discount: 0, total: 120 },
          { description: 'Weed removal', quantity: 1, unitPrice: 60, discount: 0, total: 60 },
        ]},
      },
    })

    // Jobs
    const job1 = await prisma.job.create({
      data: {
        number: 'J-0001', clientId: clients[0].id, quoteId: q1.id,
        assignedToId: worker1.id, status: 'completed',
        title: 'Full House Cleaning', scheduledAt: daysAgo(7), completedAt: daysAgo(7),
        notes: 'Client was very happy with the service',
        lineItems: { create: [
          { description: 'Deep cleaning service', quantity: 1, unitPrice: 250, discount: 0, total: 250 },
          { description: 'Window cleaning (interior)', quantity: 10, unitPrice: 10, discount: 0, total: 100 },
        ]},
      },
    })
    const job2 = await prisma.job.create({
      data: {
        number: 'J-0002', clientId: clients[3].id,
        assignedToId: worker2.id, status: 'scheduled',
        title: 'Community Garden Cleanup', scheduledAt: daysFromNow(2),
        notes: 'Access code for gate: 4421',
        lineItems: { create: [
          { description: 'Grounds maintenance', quantity: 4, unitPrice: 120, discount: 0, total: 480 },
        ]},
      },
    })
    const job3 = await prisma.job.create({
      data: {
        number: 'J-0003', clientId: clients[1].id, quoteId: q2.id,
        assignedToId: worker1.id, status: 'in_progress',
        title: 'Office Cleaning — Week 1', scheduledAt: now,
        lineItems: { create: [
          { description: 'Office cleaning session', quantity: 1, unitPrice: 150, discount: 0, total: 150 },
        ]},
      },
    })
    await prisma.job.create({
      data: {
        number: 'J-0004', clientId: clients[4].id,
        assignedToId: worker2.id, status: 'scheduled',
        title: 'Exterior House Wash', scheduledAt: daysFromNow(5),
        lineItems: { create: [
          { description: 'Pressure washing - exterior', quantity: 1, unitPrice: 220, discount: 0, total: 220 },
        ]},
      },
    })

    // Invoices
    const inv1 = await prisma.invoice.create({
      data: {
        number: 'INV-0001', clientId: clients[0].id, jobId: job1.id,
        status: 'paid', title: 'Full House Cleaning',
        subtotal: 350, tax: 28.88, total: 378.88,
        dueDate: daysAgo(0), paidAt: daysAgo(5),
        lineItems: { create: [
          { description: 'Deep cleaning service', quantity: 1, unitPrice: 250, discount: 0, total: 250 },
          { description: 'Window cleaning (interior)', quantity: 10, unitPrice: 10, discount: 0, total: 100 },
        ]},
      },
    })
    const inv2 = await prisma.invoice.create({
      data: {
        number: 'INV-0002', clientId: clients[1].id,
        status: 'sent', title: 'IT Equipment Setup',
        subtotal: 850, tax: 70.13, total: 920.13,
        dueDate: daysFromNow(15),
        lineItems: { create: [
          { description: 'Network configuration', quantity: 1, unitPrice: 550, discount: 0, total: 550 },
          { description: 'Workstation setup (x6)', quantity: 6, unitPrice: 50, discount: 0, total: 300 },
        ]},
      },
    })
    await prisma.invoice.create({
      data: {
        number: 'INV-0003', clientId: clients[2].id,
        status: 'overdue', title: 'Lawn Care — March',
        subtotal: 180, tax: 14.85, total: 194.85,
        dueDate: daysAgo(10),
        lineItems: { create: [
          { description: 'Lawn mowing & edging', quantity: 1, unitPrice: 120, discount: 0, total: 120 },
          { description: 'Weed removal', quantity: 1, unitPrice: 60, discount: 0, total: 60 },
        ]},
      },
    })
    await prisma.invoice.create({
      data: {
        number: 'INV-0004', clientId: clients[3].id,
        status: 'draft', title: 'Community Grounds — April',
        subtotal: 480, tax: 39.6, total: 519.6,
        dueDate: daysFromNow(30),
        lineItems: { create: [
          { description: 'Monthly grounds maintenance', quantity: 4, unitPrice: 120, discount: 0, total: 480 },
        ]},
      },
    })

    // Payments
    await prisma.payment.create({
      data: { invoiceId: inv1.id, amount: 378.88, method: 'card', paidAt: daysAgo(5) },
    })
    await prisma.payment.create({
      data: { invoiceId: inv2.id, amount: 400, method: 'check', notes: 'Partial payment', paidAt: daysAgo(2) },
    })

    // Update quote status to converted for job1's quote
    await prisma.quote.update({ where: { id: q1.id }, data: { status: 'converted' } })

    return NextResponse.json({ success: true, message: 'Database seeded successfully' })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Seed failed', details: String(error) }, { status: 500 })
  }
}
