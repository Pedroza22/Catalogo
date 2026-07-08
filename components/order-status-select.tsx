'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateOrderStatus } from '@/lib/actions/orders'
import type { OrderStatus } from '@/lib/types/database'

interface OrderStatusSelectProps {
  orderId: string
  currentStatus: OrderStatus
  onStatusUpdated?: () => void
}

const statuses: { value: OrderStatus; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'preparando', label: 'Preparando' },
  { value: 'despachado', label: 'Despachado' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' },
]

export function OrderStatusSelect({ orderId, currentStatus, onStatusUpdated }: OrderStatusSelectProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleChange = async (value: OrderStatus) => {
    setLoading(true)
    await updateOrderStatus(orderId, value)
    router.refresh()
    if (onStatusUpdated) {
      onStatusUpdated()
    }
    setLoading(false)
  }

  return (
    <Select value={currentStatus} onValueChange={handleChange} disabled={loading}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
