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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo')
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

    if (paymentMethod === 'credito' && total > availableCredit) {
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
    <section className="py-8 sm:py-12 bg-muted/5">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Cart Items (8 columns) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border p-1">
              {items.map((item, index) => (
                <div 
                  key={`${item.product.id}-${item.selected_color}`}
                  className={`p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center ${
                    index !== items.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-muted shrink-0 shadow-inner">
                    {item.product.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-bold text-lg text-foreground line-clamp-2 leading-tight">
                      {item.product.name}
                    </h3>
                    {item.selected_color && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Color:</span>
                        <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {item.selected_color}
                        </div>
                      </div>
                    )}
                    <p className="text-sm font-medium text-muted-foreground">
                      Precio unitario: <span className="text-foreground">{formatPrice(item.product.price)}</span>
                    </p>
                    
                    <div className="flex items-center gap-3 mt-4">
                      <div className="flex items-center border rounded-lg bg-muted/30 p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-white hover:shadow-sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selected_color)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-10 text-center font-bold text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-white hover:shadow-sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selected_color)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 font-semibold text-xs gap-1.5"
                        onClick={() => removeItem(item.product.id, item.selected_color)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Eliminar
                      </Button>
                    </div>
                  </div>

                  <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-0">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Subtotal</p>
                    <p className="text-xl font-black text-primary">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary (4 columns) */}
          <div className="lg:col-span-4">
            <Card className="sticky top-24 shadow-lg border-primary/5 overflow-hidden rounded-2xl">
              <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Resumen de Compra
                </CardTitle>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground font-medium">Subtotal</span>
                    <span className="font-bold text-foreground">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground font-medium">Envío Estimado</span>
                    <span className="font-bold text-green-600">Gratis</span>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-dashed">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-lg">Total a Pagar</span>
                    <span className="font-black text-2xl text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                {user && (
                  <div className="space-y-6 pt-2">
                    <div className="space-y-3">
                      <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                        Método de pago
                      </Label>
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                        className="grid gap-3"
                      >
                        <div className="flex items-center">
                          <RadioGroupItem value="efectivo" id="efectivo" className="peer sr-only" />
                          <Label 
                            htmlFor="efectivo" 
                            className="flex flex-1 items-center gap-3 p-3 rounded-xl border-2 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50 transition-all"
                          >
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              <Banknote className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-foreground">Efectivo</p>
                              <p className="text-[10px] text-muted-foreground">Pago contra entrega</p>
                            </div>
                          </Label>
                        </div>
                        {creditLimit > 0 && (
                          <div className="flex items-center">
                            <RadioGroupItem value="credito" id="credito" className="peer sr-only" disabled={availableCredit <= 0} />
                            <Label 
                              htmlFor="credito" 
                              className={`flex flex-1 items-center gap-3 p-3 rounded-xl border-2 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50 transition-all ${availableCredit <= 0 ? 'opacity-50 grayscale' : ''}`}
                            >
                              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600 shrink-0">
                                <CreditCard className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-sm text-foreground">Crédito</p>
                                <p className="text-[10px] text-green-600 font-bold uppercase tracking-tighter">
                                  {formatPrice(availableCredit)} DISPONIBLE
                                </p>
                              </div>
                            </Label>
                          </div>
                        )}
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="notes" className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                        Notas del Pedido
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="¿Alguna instrucción especial para la entrega?"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-[100px] rounded-xl border-2 focus-visible:ring-primary resize-none"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive font-bold text-center">{error}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-6 bg-muted/30 border-t">
                <Button 
                  className="w-full h-14 text-lg font-black shadow-lg shadow-primary/20 rounded-xl" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                      Procesando...
                    </span>
                  ) : user ? (
                    'CONFIRMAR PEDIDO'
                  ) : (
                    'INICIAR SESIÓN PARA COMPRAR'
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <p className="text-center text-[10px] text-muted-foreground mt-4 font-medium px-4">
              Al confirmar el pedido, aceptas nuestros términos de servicio y políticas de entrega.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
