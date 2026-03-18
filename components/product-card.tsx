'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { ShoppingCart, Package } from 'lucide-react'
import { useCart } from '@/lib/hooks/use-cart'
import type { Product } from '@/lib/types/database'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

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
        {product.stock <= product.min_stock && product.stock > 0 && (
          <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
            Pocas unidades
          </span>
        )}
      </div>
      <CardContent className="p-3 sm:p-4">
        <p className="text-xs text-muted-foreground mb-1">{product.category?.name || 'Sin categoría'}</p>
        <h3 className="font-semibold text-foreground line-clamp-2 min-h-[2.5rem] text-sm sm:text-base">{product.name}</h3>
        <p className="text-base sm:text-lg font-bold text-primary mt-2">{formatPrice(product.price)}</p>
        <p className="text-xs text-muted-foreground">{product.stock} disponibles</p>
      </CardContent>
      <CardFooter className="p-3 sm:p-4 pt-0">
        <Button 
          onClick={() => addItem(product)}
          className="w-full text-xs sm:text-sm"
          size="sm"
          disabled={product.stock === 0}
        >
          <ShoppingCart className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline">Agregar al carrito</span>
          <span className="xs:hidden">Agregar</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
