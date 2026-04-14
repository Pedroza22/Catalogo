import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getAllProducts, getAllCategories } from '@/lib/actions/products'
import { Plus, Package, Search } from 'lucide-react'
import { ProductActions } from '@/components/product-actions'
import { ProductSearch } from '@/components/product-search'

interface ProductosPageProps {
  searchParams: Promise<{ buscar?: string }>
}

export default async function ProductosPage({ searchParams }: ProductosPageProps) {
  const params = await searchParams
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getAllCategories()
  ])

  const filteredProducts = params.buscar
    ? products.filter(p => 
        p.name.toLowerCase().includes(params.buscar!.toLowerCase()) ||
        p.sku?.toLowerCase().includes(params.buscar!.toLowerCase()) ||
        p.categories?.some(c => c.name.toLowerCase().includes(params.buscar!.toLowerCase()))
      )
    : products

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground">Administra tu catálogo de productos</p>
        </div>
        <Link href="/dashboard/productos/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Lista de Productos</CardTitle>
            <CardDescription>
              {params.buscar 
                ? `Mostrando ${filteredProducts.length} de ${products.length} productos`
                : `${products.length} productos en total`}
            </CardDescription>
          </div>
          <ProductSearch 
            placeholder="Buscar por nombre, SKU o categoría..." 
            className="w-full sm:w-72" 
          />
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {params.buscar ? 'No se encontraron resultados' : 'No hay productos'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {params.buscar 
                  ? 'Intenta con otro término de búsqueda'
                  : 'Comienza agregando tu primer producto'}
              </p>
              {!params.buscar && (
                <Link href="/dashboard/productos/nuevo">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Producto
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                    <TableCell>
                      {product.categories && product.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {product.categories.map((cat) => (
                            <Badge key={cat.id} variant="outline" className="text-[10px] px-1.5 py-0">
                              {cat.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right">{formatPrice(product.price)}</TableCell>
                    <TableCell className="text-right">
                      <span className={product.stock <= product.min_stock ? 'text-yellow-600 font-medium' : ''}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? 'default' : 'secondary'}>
                        {product.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <ProductActions productId={product.id} productName={product.name} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
