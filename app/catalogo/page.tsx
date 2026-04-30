import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { getProfile } from '@/lib/actions/auth'
import { getProducts, getCategories } from '@/lib/actions/products'
import { CategoryFilter } from '@/components/category-filter'
import { ProductSearch } from '@/components/product-search'
import { Package } from 'lucide-react'

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
    <div className="min-h-screen flex flex-col bg-muted/5">
      <Header user={user} />
      <main className="flex-1">
        <section className="py-12 bg-white border-b shadow-sm">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Catálogo de Productos</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Encuentra todo lo que necesitas para tu negocio al mejor precio
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row gap-10">
              {/* Sidebar Filters */}
              <aside className="lg:w-72 shrink-0">
                <div className="lg:sticky lg:top-24 space-y-8 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto pr-2 custom-scrollbar">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/5">
                    <CategoryFilter 
                      categories={categories} 
                      selectedCategory={params.categoria}
                    />
                  </div>
                  
                  {/* Banner de ayuda opcional */}
                  <div className="bg-primary/10 p-6 rounded-2xl border border-primary/20">
                    <h4 className="font-bold text-primary mb-2">¿Necesitas ayuda?</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Si no encuentras lo que buscas, contáctanos y te ayudaremos con tu pedido.
                    </p>
                  </div>
                </div>
              </aside>

              {/* Products Grid */}
              <div className="flex-1 min-w-0">
                <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <ProductSearch 
                    placeholder="¿Qué estás buscando hoy?" 
                    className="w-full md:max-w-md"
                  />
                  <div className="hidden md:block">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                      <span className="text-primary">{filteredProducts.length}</span> productos encontrados
                    </p>
                  </div>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-24 border-2 border-dashed rounded-3xl bg-muted/20">
                    <Package className="h-20 w-20 mx-auto text-muted-foreground/20 mb-6" />
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      No encontramos productos
                    </h3>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto">
                      {params.buscar 
                        ? `No hay resultados para "${params.buscar}". Intenta con otro término.`
                        : params.categoria 
                          ? 'Parece que no hay existencias en esta categoría actualmente.'
                          : 'Estamos actualizando nuestro inventario. Vuelve pronto.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="grid gap-6 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                      {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} userRole={user?.role} />
                      ))}
                    </div>
                  </div>
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
