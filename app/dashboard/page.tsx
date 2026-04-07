import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getProfile } from '@/lib/actions/auth'
import { getAllOrders } from '@/lib/actions/orders'
import { getAllProducts } from '@/lib/actions/products'
import { createClient } from '@/lib/supabase/server'
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const profile = await getProfile()
  
  const [orders, products, { data: clients }] = await Promise.all([
    getAllOrders(),
    getAllProducts(),
    supabase.from('profiles').select('*').eq('role', 'cliente')
  ])

  const pendingOrders = orders.filter(o => o.status === 'pendiente').length
  const todayOrders = orders.filter(o => {
    const today = new Date()
    const orderDate = new Date(o.created_at)
    return orderDate.toDateString() === today.toDateString()
  })
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0)
  const lowStockProducts = products.filter(p => p.stock <= p.min_stock && p.is_active)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido, <span className="font-semibold text-foreground">{profile?.full_name || 'Usuario'}</span> ({profile?.role})
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/pedidos" className="block transition-transform hover:scale-[1.02] active:scale-[0.98]">
          <Card className="h-full hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                requieren atención <ArrowRight className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>
        </Link>

        {isAdmin && (
          <Link href="/dashboard/pedidos" className="block transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <Card className="h-full hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(todayRevenue)}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {todayOrders.length} pedidos hoy <ArrowRight className="h-3 w-3" />
                </p>
              </CardContent>
            </Card>
          </Link>
        )}

        <Link href="/dashboard/productos" className="block transition-transform hover:scale-[1.02] active:scale-[0.98]">
          <Card className="h-full hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Productos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.filter(p => p.is_active).length}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                activos en catálogo <ArrowRight className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>
        </Link>

        {isAdmin && (
          <Link href="/dashboard/clientes" className="block transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <Card className="h-full hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clients?.length || 0}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  registrados <ArrowRight className="h-3 w-3" />
                </p>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Low Stock Alert */}
        <Link href="/dashboard/productos" className="block transition-transform hover:scale-[1.01] active:scale-[0.99]">
          <Card className="h-full hover:border-yellow-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Stock Bajo
              </CardTitle>
              <CardDescription>
                Productos que necesitan reabastecimiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.slice(0, 5).map(product => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">SKU: {product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-yellow-600 text-sm">{product.stock} un.</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay productos con stock bajo
                  </p>
                )}
                <div className="pt-2 border-t flex justify-center">
                  <span className="text-xs text-primary font-medium flex items-center gap-1">
                    Ver todo el inventario <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Recent Orders */}
        <Link href="/dashboard/pedidos" className="block transition-transform hover:scale-[1.01] active:scale-[0.99]">
          <Card className="h-full hover:border-blue-500/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Pedidos Recientes
              </CardTitle>
              <CardDescription>
                Últimos movimientos del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.length > 0 ? (
                  orders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Pedido #{order.id.slice(0, 8)}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{formatPrice(order.total)}</p>
                        <p className={cn(
                          "text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full inline-block",
                          order.status === 'pendiente' ? "bg-yellow-100 text-yellow-700" : 
                          order.status === 'completado' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                          {order.status}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay pedidos recientes
                  </p>
                )}
                <div className="pt-2 border-t flex justify-center">
                  <span className="text-xs text-primary font-medium flex items-center gap-1">
                    Ver todos los pedidos <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
