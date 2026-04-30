'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { ShoppingCart, Package, Plus, Minus, Check, Eye } from 'lucide-react'
import { useCart } from '@/lib/hooks/use-cart'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Product } from '@/lib/types/database'

interface ProductCardProps {
  product: Product
  userRole?: string
}

export function ProductCard({ product, userRole }: ProductCardProps) {
  const { items, addItem, updateQuantity } = useCart()
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors && product.colors.length > 0 ? product.colors[0] : null
  )
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  
  const cartItem = items.find(item => 
    item.product.id === product.id && 
    item.selected_color === selectedColor
  )
  const quantityInCart = cartItem?.quantity || 0

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <>
      <Card className="group overflow-hidden transition-all hover:shadow-lg h-full flex flex-col">
        <div 
          className="relative aspect-square overflow-hidden bg-muted cursor-pointer"
          onClick={() => setIsDetailOpen(true)}
        >
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full shadow-lg">
              <Eye className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Solo mostrar etiqueta de "Pocas unidades" a administradores o bodegueros */}
          {(userRole === 'admin' || userRole === 'bodeguero') && product.stock <= product.min_stock && product.stock > 0 && (
            <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded shadow-sm">
              Pocas unidades
            </span>
          )}
        </div>
        <CardContent className="p-3 sm:p-4 flex-grow flex flex-col">
          <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
          {product.categories && product.categories.length > 0 
            ? product.categories.map(c => c.name).join(', ') 
            : product.category?.name || 'Sin categoría'}
        </p>
        <h3 className="font-semibold text-foreground line-clamp-2 min-h-[2.5rem] text-sm sm:text-base">{product.name}</h3>
        <p className="text-base sm:text-lg font-bold text-primary mt-2">{formatPrice(product.price)}</p>
        
        {/* Selector de Colores */}
        {product.colors && product.colors.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Color: <span className="text-foreground">{selectedColor}</span></p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color) => {
                // Mapeo básico de nombres a colores CSS para las bolitas
                const colorMap: Record<string, string> = {
                  'rojo': 'bg-red-500',
                  'roja': 'bg-red-500',
                  'verde': 'bg-green-500',
                  'azul': 'bg-blue-500',
                  'blanco': 'bg-white border',
                  'blanca': 'bg-white border',
                  'negro': 'bg-black',
                  'negra': 'bg-black',
                  'amarillo': 'bg-yellow-400',
                  'amarilla': 'bg-yellow-400',
                  'gris': 'bg-gray-400',
                  'naranja': 'bg-orange-500',
                  'café': 'bg-amber-800',
                  'cafe': 'bg-amber-800',
                  'morado': 'bg-purple-600',
                  'rosado': 'bg-pink-400',
                }
                const colorClass = colorMap[color.toLowerCase()] || 'bg-slate-200'
                
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "group relative flex h-6 w-6 items-center justify-center rounded-full transition-all hover:scale-110",
                      selectedColor === color ? "ring-2 ring-primary ring-offset-2" : "hover:ring-1 hover:ring-muted-foreground"
                    )}
                    title={color}
                  >
                    <span className={cn("h-full w-full rounded-full", colorClass)} />
                    {selectedColor === color && (
                      <Check className={cn("absolute h-3 w-3", color.toLowerCase() === 'blanco' || color.toLowerCase() === 'blanca' ? "text-black" : "text-white")} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Solo mostrar stock a administradores o bodegueros */}
        {(userRole === 'admin' || userRole === 'bodeguero') && (
          <p className="text-xs text-muted-foreground mt-auto pt-2">{product.stock} disponibles</p>
        )}
      </CardContent>
      <CardFooter className="p-3 sm:p-4 pt-0 mt-auto">
        {quantityInCart > 0 ? (
          <div className="flex items-center w-full justify-between border rounded-lg bg-muted/30 p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-white hover:shadow-sm"
              onClick={() => updateQuantity(product.id, quantityInCart - 1, selectedColor)}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="w-10 text-center font-bold text-sm">
              {quantityInCart}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-white hover:shadow-sm"
              onClick={() => updateQuantity(product.id, quantityInCart + 1, selectedColor)}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <Button 
            onClick={() => addItem(product, 1, selectedColor)}
            className="w-full text-xs sm:text-sm"
            size="sm"
          >
            <ShoppingCart className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Agregar al carrito</span>
            <span className="xs:hidden">Agregar</span>
          </Button>
        )}
      </CardFooter>
    </Card>

    <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-white gap-0">
        <div className="flex flex-col sm:flex-row h-full max-h-[90vh]">
          {/* Lado Izquierdo - Imagen Grande */}
          <div className="w-full sm:w-1/2 bg-muted/30 relative flex items-center justify-center p-6 border-r border-border/50">
            <div className="relative w-full aspect-square max-w-[350px]">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-contain drop-shadow-xl"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground/50">
                  <Package className="h-24 w-24 mb-4" />
                  <span className="text-sm font-medium">Sin imagen</span>
                </div>
              )}
            </div>
          </div>

          {/* Lado Derecho - Detalles */}
          <div className="w-full sm:w-1/2 p-6 sm:p-8 flex flex-col overflow-y-auto">
            <div className="mb-6">
              <p className="text-sm font-medium text-primary mb-2">
                {product.categories && product.categories.length > 0 
                  ? product.categories.map(c => c.name).join(', ') 
                  : product.category?.name || 'Sin categoría'}
              </p>
              <DialogTitle className="text-2xl sm:text-3xl font-bold leading-tight text-foreground mb-4">
                {product.name}
              </DialogTitle>
              <div className="flex items-end gap-3 mb-6 pb-6 border-b border-border/50">
                <span className="text-3xl font-black text-primary">{formatPrice(product.price)}</span>
                <span className="text-sm text-muted-foreground mb-1">/ unidad</span>
              </div>

              {product.description && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Descripción</h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}
              
              {/* Información adicional: SKU y Stock */}
              <div className="grid grid-cols-2 gap-4 mb-6 bg-muted/20 p-4 rounded-xl">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">SKU</h4>
                  <p className="text-sm font-medium">{product.sku}</p>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Disponibilidad</h4>
                  <p className="text-sm font-medium">
                    {product.stock > 0 
                      ? <span className="text-green-600">En stock</span> 
                      : <span className="text-red-500">Agotado</span>}
                  </p>
                </div>
              </div>

              {/* Selector de Colores en el Modal */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Color seleccionado: <span className="text-foreground capitalize">{selectedColor}</span>
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => {
                      const colorMap: Record<string, string> = {
                        'rojo': 'bg-red-500', 'roja': 'bg-red-500',
                        'verde': 'bg-green-500', 'azul': 'bg-blue-500',
                        'blanco': 'bg-white border-2 border-muted-foreground/20', 'blanca': 'bg-white border-2 border-muted-foreground/20',
                        'negro': 'bg-black', 'negra': 'bg-black',
                        'amarillo': 'bg-yellow-400', 'amarilla': 'bg-yellow-400',
                        'gris': 'bg-gray-400', 'naranja': 'bg-orange-500',
                        'café': 'bg-amber-800', 'cafe': 'bg-amber-800',
                        'morado': 'bg-purple-600', 'rosado': 'bg-pink-400',
                      }
                      const colorClass = colorMap[color.toLowerCase()] || 'bg-slate-200'
                      
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={cn(
                            "group relative flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-110 shadow-sm",
                            selectedColor === color ? "ring-2 ring-primary ring-offset-2 scale-110" : "hover:ring-2 hover:ring-muted-foreground/50 hover:ring-offset-1"
                          )}
                          title={color}
                        >
                          <span className={cn("h-full w-full rounded-full", colorClass)} />
                          {selectedColor === color && (
                            <Check className={cn("absolute h-5 w-5", color.toLowerCase() === 'blanco' || color.toLowerCase() === 'blanca' ? "text-black" : "text-white")} />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto pt-4">
              {quantityInCart > 0 ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center w-full justify-between border-2 border-primary/20 rounded-xl bg-primary/5 p-2 h-14">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 hover:bg-white hover:shadow-sm rounded-lg"
                      onClick={() => updateQuantity(product.id, quantityInCart - 1, selectedColor)}
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <span className="text-xl font-bold text-primary">
                      {quantityInCart} <span className="text-sm font-normal text-muted-foreground ml-1">en carrito</span>
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 hover:bg-white hover:shadow-sm rounded-lg"
                      onClick={() => updateQuantity(product.id, quantityInCart + 1, selectedColor)}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full h-12 text-sm font-bold uppercase tracking-wider"
                    onClick={() => setIsDetailOpen(false)}
                  >
                    Seguir comprando
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => addItem(product, 1, selectedColor)}
                  className="w-full h-14 text-base font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                  size="lg"
                >
                  <ShoppingCart className="mr-3 h-5 w-5" />
                  Agregar al carrito
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
