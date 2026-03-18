import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { getProfile } from '@/lib/actions/auth'
import { getProducts, getCategories } from '@/lib/actions/products'
import { CategoryFilter } from '@/components/category-filter'
import { Package, Search } from 'lucide-react'

interface CatalogoPageProps {
  searchParams: Promise<{ categoria?: string; buscar?: string }>
}

export default async function CatalogoPage({ searchParams }: CatalogoPageProps) {
  const params = await searchParams
  const [profile, products, categories] = await Promise.all([
    getProfile(),
    getProducts(params.categoria),
    getCategories()
  ])

  const user = profile ? { email: profile.email, role: profile.role } : null

  const filteredProducts = params.buscar
    ? products.filter(p => 
        p.name.toLowerCase().includes(params.buscar!.toLowerCase()) ||
        p.description?.toLowerCase().includes(params.buscar!.toLowerCase())
      )
    : products

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />
      <main className="flex-1">
        <section className="py-6 sm:py-8 bg-muted/30 border-b">
          <div className="container px-4 sm:px-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Catálogo de Productos</h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              Encuentra todo lo que necesitas para tu negocio
            </p>
          </div>
        </section>

        <section className="py-4 sm:py-8">
          <div className="container px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
              {/* Sidebar Filters */}
              <aside className="lg:w-64 shrink-0">
                <CategoryFilter 
                  categories={categories} 
                  selectedCategory={params.categoria}
                />
              </aside>

              {/* Products Grid */}
              <div className="flex-1">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed rounded-xl">
                    <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No hay productos disponibles
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {params.categoria 
                        ? 'No hay productos en esta categoría. Prueba seleccionando otra categoría.'
                        : 'Pronto agregaremos productos a nuestro catálogo.'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-sm text-muted-foreground">
                        {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="grid gap-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                      {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
