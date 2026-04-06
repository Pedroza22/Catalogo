import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getProfile } from '@/lib/actions/auth'
import { getClientOrders } from '@/lib/actions/orders'
import { ShoppingCart, Package } from 'lucide-react'

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pendiente: 'secondary',
  preparando: 'default',
  despachado: 'default',
  entregado: 'default',
  cancelado: 'destructive',
}

const statusLabels: Record<string, string> = {
  pendiente: 'Pendiente',
  preparando: 'Preparando',
  despachado: 'Despachado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

export default async function MisPedidosPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/auth/login?redirect=/mis-pedidos')
  }

  const orders = await getClientOrders()
  const user = { email: profile.email, role: profile.role }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/5">
      <Header user={user} />
      <main className="flex-1">
        <section className="py-12 bg-white border-b shadow-sm">
          <div className="container">
            <div className="max-w-5xl mx-auto px-4">
              <h1 className="text-3xl font-bold text-foreground">Mis Pedidos</h1>
              <p className="text-muted-foreground mt-1 font-medium">
                Historial completo y seguimiento de tus compras
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <div className="max-w-5xl mx-auto px-4">
              {orders.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-3xl bg-muted/20 max-w-2xl mx-auto">
                  <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-6" />
                  <h3 className="text-xl font-bold text-foreground mb-2">No tienes pedidos registrados</h3>
                  <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                    Cuando realices tu primera compra, aparecerá aquí para que puedas seguir su estado.
                  </p>
                  <Button asChild size="lg" className="px-8 h-12 font-bold rounded-xl shadow-md">
                    <Link href="/catalogo">Ver catálogo de productos</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <Card key={order.id} className="shadow-md border-primary/5 hover:border-primary/20 transition-all overflow-hidden rounded-2xl">
                      <CardHeader className="bg-muted/30 border-b pb-4 px-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-xl font-bold">Pedido #{order.id.slice(0, 8).toUpperCase()}</CardTitle>
                              <Badge variant={statusColors[order.status]} className="text-[11px] uppercase font-bold px-3 py-1 tracking-wider shadow-sm">
                                {statusLabels[order.status]}
                              </Badge>
                            </div>
                            <CardDescription className="text-sm font-medium flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground/60" />
                              Realizado el {formatDate(order.created_at)}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-0.5">Total Pagado</p>
                            <p className="text-2xl font-black text-primary leading-none">{formatPrice(order.total)}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid gap-6">
                          <div className="space-y-4">
                            {order.items?.map((item) => (
                              <div key={item.id} className="flex items-center gap-5 p-3 rounded-xl hover:bg-muted/30 transition-colors group">
                                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center shrink-0 border group-hover:bg-white group-hover:shadow-sm transition-all">
                                  <Package className="h-7 w-7 text-muted-foreground/30 group-hover:text-primary/40" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-foreground text-base truncate">{item.product?.name}</p>
                                  <p className="text-sm text-muted-foreground font-medium">
                                    {item.quantity} unidades x {formatPrice(item.unit_price)}
                                  </p>
                                </div>
                                <p className="font-extrabold text-foreground">{formatPrice(item.subtotal)}</p>
                              </div>
                            ))}
                          </div>
                          
                          {order.notes && (
                            <div className="mt-2 p-4 rounded-xl bg-primary/5 border border-primary/10">
                              <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-1">Notas del pedido</p>
                              <p className="text-sm text-foreground/80 italic">"{order.notes}"</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
