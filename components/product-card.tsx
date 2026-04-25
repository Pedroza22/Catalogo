'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { ShoppingCart, Package, Plus, Minus, Check } from 'lucide-react'
import { useCart } from '@/lib/hooks/use-cart'
import { cn } from '@/lib/utils'
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
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-muted">
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
        
        {/* Solo mostrar etiqueta de "Pocas unidades" a administradores o bodegueros */}
        {(userRole === 'admin' || userRole === 'bodeguero') && product.stock <= product.min_stock && product.stock > 0 && (
          <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
            Pocas unidades
          </span>
        )}
      </div>
      <CardContent className="p-3 sm:p-4">
        <p className="text-xs text-muted-foreground mb-1">
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
          <p className="text-xs text-muted-foreground mt-1">{product.stock} disponibles</p>
        )}
      </CardContent>
      <CardFooter className="p-3 sm:p-4 pt-0">
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
  )
}
