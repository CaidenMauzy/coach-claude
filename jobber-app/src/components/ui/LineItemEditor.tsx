'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Button } from './Button'
import { formatCurrency } from '@/lib/utils'

export interface LineItem {
  description: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

interface LineItemEditorProps {
  items: LineItem[]
  onChange: (items: LineItem[]) => void
}

function calcTotal(item: LineItem): number {
  return item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100)
}

export function LineItemEditor({ items, onChange }: LineItemEditorProps) {
  function addItem() {
    onChange([...items, { description: '', quantity: 1, unitPrice: 0, discount: 0, total: 0 }])
  }

  function updateItem(i: number, field: keyof LineItem, value: string | number) {
    const updated = items.map((item, idx) => {
      if (idx !== i) return item
      const next = { ...item, [field]: value }
      next.total = calcTotal(next)
      return next
    })
    onChange(updated)
  }

  function removeItem(i: number) {
    onChange(items.filter((_, idx) => idx !== i))
  }

  const subtotal = items.reduce((s, i) => s + calcTotal(i), 0)
  const tax = subtotal * 0.0825
  const total = subtotal + tax

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 font-medium text-gray-600 w-full">Description</th>
              <th className="text-right py-2 px-3 font-medium text-gray-600 w-20">Qty</th>
              <th className="text-right py-2 px-3 font-medium text-gray-600 w-28">Unit Price</th>
              <th className="text-right py-2 px-3 font-medium text-gray-600 w-20">Disc %</th>
              <th className="text-right py-2 px-3 font-medium text-gray-600 w-28">Total</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-2 px-2">
                  <input
                    value={item.description}
                    onChange={(e) => updateItem(i, 'description', e.target.value)}
                    placeholder="Service description"
                    className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-1"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number" min="0.01" step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number" min="0" step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number" min="0" max="100" step="0.1"
                    value={item.discount}
                    onChange={(e) => updateItem(i, 'discount', parseFloat(e.target.value) || 0)}
                    className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1"
                  />
                </td>
                <td className="py-2 px-3 text-right font-medium text-gray-900">{formatCurrency(calcTotal(item))}</td>
                <td className="py-2 px-2">
                  <button
                    onClick={() => removeItem(i)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 px-3">
        <Button variant="ghost" size="sm" onClick={addItem} type="button">
          <Plus size={14} />
          Add Line Item
        </Button>
      </div>

      <div className="mt-4 border-t border-gray-200 pt-4 px-3 space-y-1.5">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Tax (8.25%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold text-gray-900 pt-1 border-t border-gray-200">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  )
}
