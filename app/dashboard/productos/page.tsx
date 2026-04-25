import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getAllProducts, getAllCategories } from '@/lib/actions/products'
import { Plus, Package, Search } from 'lucide-react'
import { ProductActions } from '@/components/product-actions'
import { ProductSearch } from '@/components/product-search'
import { CategorySelectFilter } from '@/components/category-select-filter'

interface ProductosPageProps {
  searchParams: Promise<{ buscar?: string; categoria?: string }>
}

export default async function ProductosPage({ searchParams }: ProductosPageProps) {
  const params = await searchParams
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getAllCategories()
  ])

  const filteredProducts = products.filter(p => {
    const matchesSearch = params.buscar
      ? p.name.toLowerCase().includes(params.buscar.toLowerCase()) ||
        p.sku?.toLowerCase().includes(params.buscar.toLowerCase()) ||
        p.categories?.some(c => c.name.toLowerCase().includes(params.buscar!.toLowerCase()))
      : true;

    const matchesCategory = params.categoria
      ? p.categories?.some(c => c.id === params.categoria)
      : true;

    return matchesSearch && matchesCategory;
  })

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
        <CardHeader className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <CardTitle>Lista de Productos</CardTitle>
            <CardDescription>
              {(params.buscar || params.categoria) 
                ? `Mostrando ${filteredProducts.length} de ${products.length} productos`
                : `${products.length} productos en total`}
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
            <CategorySelectFilter 
              categories={categories} 
              className="w-full sm:w-[200px]" 
            />
            <ProductSearch 
              placeholder="Buscar por nombre, SKU o categoría..." 
              className="w-full sm:w-[300px]" 
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {(params.buscar || params.categoria) ? 'No se encontraron resultados' : 'No hay productos'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {(params.buscar || params.categoria) 
                  ? 'Intenta con otro término de búsqueda o cambia la categoría'
                  : 'Comienza agregando tu primer producto'}
              </p>
              {!(params.buscar || params.categoria) && (
                <Link href="/dashboard/productos/nuevo">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Producto
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle sm:px-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b-2">
                      <TableHead className="w-[35%] min-w-[200px] py-4">Producto</TableHead>
                      <TableHead className="w-[15%] min-w-[100px] py-4">SKU</TableHead>
                      <TableHead className="w-[20%] min-w-[150px] py-4">Categoría</TableHead>
                      <TableHead className="text-right py-4 min-w-[100px]">Precio</TableHead>
                      <TableHead className="text-right py-4 min-w-[80px]">Stock</TableHead>
                      <TableHead className="py-4 min-w-[100px]">Estado</TableHead>
                      <TableHead className="text-right py-4 pr-6 min-w-[150px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-semibold py-4">
                          <div className="flex flex-col">
                            <span className="line-clamp-2">{product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground py-4">{product.sku}</TableCell>
                        <TableCell className="py-4">
                          {product.categories && product.categories.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {product.categories.map((cat) => (
                                <Badge key={cat.id} variant="outline" className="text-[10px] px-1.5 py-0 bg-background/50 whitespace-nowrap">
                                  {cat.name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right py-4 font-medium">{formatPrice(product.price)}</TableCell>
                        <TableCell className="text-right py-4">
                          <span className={product.stock <= product.min_stock ? 'text-yellow-600 font-bold' : 'font-medium'}>
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge variant={product.is_active ? 'default' : 'secondary'} className="font-semibold whitespace-nowrap">
                            {product.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right py-4 pr-4">
                          <ProductActions 
                            productId={product.id} 
                            productName={product.name} 
                            isActive={product.is_active} 
                            imageUrl={product.image_url}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
