'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { useCart } from '@/lib/hooks/use-cart'
import { createOrder } from '@/lib/actions/orders'
import { ShoppingCart, Trash2, Plus, Minus, Package, CreditCard, Banknote, Building2 } from 'lucide-react'
import type { PaymentMethod } from '@/lib/types/database'

interface CartContentProps {
  user: { email: string; role?: string } | null
  creditLimit: number
  currentCredit: number
}

export function CartContent({ user, creditLimit, currentCredit }: CartContentProps) {
  const router = useRouter()
  const { items, removeItem, updateQuantity, clearCart, total } = useCart()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availableCredit = creditLimit - currentCredit

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleCheckout = async () => {
    if (!user) {
      router.push('/auth/login?redirect=/carrito')
      return
    }

    if (paymentMethod === 'credit' && total > availableCredit) {
      setError('No tienes suficiente crédito disponible')
      return
    }

    setLoading(true)
    setError(null)

    const result = await createOrder(items, paymentMethod, notes || undefined)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    clearCart()
    router.push(`/pedido-exitoso?id=${result.orderId}`)
  }

  if (items.length === 0) {
    return (
      <section className="py-16">
        <div className="container">
          <div className="text-center py-16 border-2 border-dashed rounded-xl max-w-lg mx-auto">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Tu carrito está vacío</h3>
            <p className="text-muted-foreground mb-6">
              Agrega productos del catálogo para comenzar tu pedido
            </p>
            <Link href="/catalogo">
              <Button>Ver Catálogo</Button>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-4 sm:py-8">
      <div className="container px-4 sm:px-6">
        <div className="grid gap-4 sm:gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {items.map((item) => (
              <Card key={item.product.id}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden bg-muted shrink-0">
                      {item.product.image_url ? (
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground text-sm sm:text-base line-clamp-1">{item.product.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{formatPrice(item.product.price)} c/u</p>
                      <div className="flex items-center gap-1 sm:gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="font-semibold text-foreground text-sm sm:text-base">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 text-destructive mt-1 sm:mt-2"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="font-medium text-green-600">Gratis</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-lg text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                {user && (
                  <>
                    <div className="border-t pt-4">
                      <Label className="text-sm font-medium">Método de pago</Label>
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                        className="mt-2 space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cash" id="cash" />
                          <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
                            <Banknote className="h-4 w-4" />
                            Efectivo
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="transfer" id="transfer" />
                          <Label htmlFor="transfer" className="flex items-center gap-2 cursor-pointer">
                            <Building2 className="h-4 w-4" />
                            Transferencia
                          </Label>
                        </div>
                        {creditLimit > 0 && (
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="credit" id="credit" disabled={availableCredit <= 0} />
                            <Label htmlFor="credit" className="flex items-center gap-2 cursor-pointer">
                              <CreditCard className="h-4 w-4" />
                              Crédito ({formatPrice(availableCredit)} disponible)
                            </Label>
                          </div>
                        )}
                      </RadioGroup>
                    </div>

                    <div>
                      <Label htmlFor="notes" className="text-sm font-medium">Notas (opcional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Instrucciones especiales para tu pedido..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-2"
                        rows={3}
                      />
                    </div>
                  </>
                )}

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? 'Procesando...' : user ? 'Confirmar Pedido' : 'Iniciar Sesión para Comprar'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
