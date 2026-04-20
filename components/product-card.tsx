'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { ShoppingCart, Package, Plus, Minus } from 'lucide-react'
import { useCart } from '@/lib/hooks/use-cart'
import type { Product } from '@/lib/types/database'

interface ProductCardProps {
  product: Product
  userRole?: string
}

export function ProductCard({ product, userRole }: ProductCardProps) {
  const { items, addItem, updateQuantity } = useCart()
  
  const cartItem = items.find(item => item.product.id === product.id)
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
              onClick={() => updateQuantity(product.id, quantityInCart - 1)}
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
              onClick={() => updateQuantity(product.id, quantityInCart + 1)}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <Button 
            onClick={() => addItem(product)}
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
