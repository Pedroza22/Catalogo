'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Phone, Mail, MessageCircle, CheckCircle2 } from 'lucide-react'
import {
  getDeliverySettings,
  getDeliveryDays,
  validateCartDelivery,
} from '@/lib/actions/deliveries'
import type { DeliverySettings, DeliveryDay, Product } from '@/lib/domain/entities'

const dayNames = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
]

interface CheckoutDeliverySectionProps {
  cartTotal: number
  cartProducts: Product[]
  isInCity: boolean
  selectedDate: string | null
  onDateSelect: (date: string | null) => void
  deliveryCost: number
  isFreeDelivery: boolean
  onDeliveryCostChange: (cost: number, isFree: boolean) => void
  isValid: boolean
  validationMessage?: string
  onValidationChange: (valid: boolean, message?: string) => void
}

export function CheckoutDeliverySection({
  cartTotal,
  cartProducts,
  isInCity,
  selectedDate,
  onDateSelect,
  deliveryCost,
  isFreeDelivery,
  onDeliveryCostChange,
  isValid,
  validationMessage,
  onValidationChange,
}: CheckoutDeliverySectionProps) {
  const [loading, setLoading] = useState(true)
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings | null>(null)
  const [deliveryDays, setDeliveryDays] = useState<DeliveryDay[]>([])
  const [showOutOfCityModal, setShowOutOfCityModal] = useState(false)
  const [availableDates, setAvailableDates] = useState<{ date: Date; dayOfWeek: number; label: string }[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const [settings, days] = await Promise.all([
        getDeliverySettings(),
        getDeliveryDays(),
      ])
      setDeliverySettings(settings)
      setDeliveryDays(days)

      // Generate available dates based on delivery days
      const dates = []
      const today = new Date()
      const activeDayNumbers = new Set(days.filter(d => d.isActive).map(d => d.dayOfWeek))

      for (let i = 1; i <= 14; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        const dayOfWeek = date.getDay()
        if (activeDayNumbers.has(dayOfWeek)) {
          const dayData = days.find(d => d.dayOfWeek === dayOfWeek)
          dates.push({
            date,
            dayOfWeek,
            label: `${dayData?.customName || dayNames[dayOfWeek]}, ${date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}`,
          })
        }
      }
      setAvailableDates(dates)
      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    // Show modal if not in city
    if (!isInCity && deliverySettings) {
      setShowOutOfCityModal(true)
    }
  }, [isInCity, deliverySettings])

  useEffect(() => {
    const validate = async () => {
      const categoryIds = cartProducts
        .map(p => p.categoryId)
        .filter((id): id is string => id !== null && id !== undefined)

      const validation = await validateCartDelivery(cartTotal, categoryIds)

      onValidationChange(validation.isValid, validation.message)

      // Check for free delivery
      if (validation.canBeFree && selectedDate) {
        onDeliveryCostChange(0, true)
      } else if (selectedDate) {
        // Get cost from selected date
        const dateObj = new Date(selectedDate)
        const dayOfWeek = dateObj.getDay()
        const dayData = deliveryDays.find(d => d.dayOfWeek === dayOfWeek)
        if (dayData) {
          onDeliveryCostChange(dayData.deliveryCost, false)
        }
      }
    }
    if (deliveryDays.length > 0 && cartProducts.length > 0) {
      validate()
    }
  }, [selectedDate, cartTotal, cartProducts, deliveryDays])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleDateSelect = (dateStr: string) => {
    onDateSelect(dateStr)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Cargando opciones de entrega...
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Información de Entrega
          </CardTitle>
          <CardDescription>
            Selecciona la fecha de entrega para tu pedido
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isInCity && deliverySettings && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                {deliverySettings.outOfCityMessage}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setShowOutOfCityModal(true)}
              >
                Ver información de contacto
              </Button>
            </div>
          )}

          {!isValid && validationMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{validationMessage}</p>
            </div>
          )}

          {isInCity && (
            <>
              <div className="space-y-2">
                <Label>Fecha de Entrega</Label>
                <Select value={selectedDate || ''} onValueChange={handleDateSelect} disabled={!isValid}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una fecha" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDates.map(({ date, dayOfWeek, label }) => {
                      const dayData = deliveryDays.find(d => d.dayOfWeek === dayOfWeek)
                      return (
                        <SelectItem key={date.toISOString()} value={date.toISOString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{label}</span>
                            <Badge variant="outline" className="ml-2">
                              {dayData?.deliveryCost ? formatPrice(dayData.deliveryCost) : 'Gratis'}
                            </Badge>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedDate && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Costo de Domicilio:</span>
                    {isFreeDelivery ? (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Envío Gratis
                      </Badge>
                    ) : (
                      <span className="text-lg font-bold">{formatPrice(deliveryCost)}</span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Out of City Modal */}
      <Dialog open={showOutOfCityModal} onOpenChange={setShowOutOfCityModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Entrega Fuera de la Ciudad
            </DialogTitle>
            <DialogDescription>
              {deliverySettings?.outOfCityMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {deliverySettings?.contactPhone && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{deliverySettings.contactPhone}</p>
                </div>
              </div>
            )}
            {deliverySettings?.contactEmail && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{deliverySettings.contactEmail}</p>
                </div>
              </div>
            )}
            {deliverySettings?.whatsappLink && (
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                asChild
              >
                <a href={deliverySettings.whatsappLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contactar por WhatsApp
                </a>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
