import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product-card'
import { ArrowRight, Package } from 'lucide-react'
import type { Product } from '@/lib/types/database'

interface FeaturedProductsProps {
  products: Product[]
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) {
    return (
      <section className="py-10 sm:py-16">
        <div className="container px-4 sm:px-6">
          <div className="mb-6 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Productos Destacados</h2>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Los productos más populares de nuestro catálogo</p>
          </div>
          <div className="text-center py-10 sm:py-16 border-2 border-dashed rounded-xl">
            <Package className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">Próximamente</h3>
            <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base px-4">
              Estamos preparando nuestro catálogo de productos. Pronto podrás ver y comprar nuestros productos.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-10 sm:py-16">
      <div className="container px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-6 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Productos Destacados</h2>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Los productos más populares de nuestro catálogo</p>
          </div>
          <Link href="/catalogo" className="hidden md:block">
            <Button variant="outline">
              Ver todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid gap-3 sm:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-6 sm:mt-8 text-center md:hidden">
          <Link href="/catalogo">
            <Button variant="outline" size="sm" className="sm:text-base">
              Ver todos los productos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
