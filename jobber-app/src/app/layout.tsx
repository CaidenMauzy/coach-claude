import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FieldPro — Field Service Management',
  description: 'Manage clients, jobs, quotes, invoices and your team.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased" style={{ backgroundColor: '#f8fafc' }}>
        {children}
      </body>
    </html>
  )
}
