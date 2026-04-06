import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getProfile } from '@/lib/actions/auth'
import { signOut } from '@/lib/actions/auth'
import { getClientOrders } from '@/lib/actions/orders'
import { ProfileForm } from '@/components/profile-form'
import { ShoppingCart, LayoutDashboard, Package, ChevronRight, LogOut, Clock, User } from 'lucide-react'

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

export default async function PerfilPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/auth/login')
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
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/5">
      <Header user={user} />
      <main className="flex-1">
        <section className="py-12 bg-white border-b shadow-sm">
          <div className="container">
            <div className="max-w-4xl mx-auto px-4">
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Mi Perfil</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Gestiona tu información personal y revisa tu actividad reciente
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Columna 1: Información Personal */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <User className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">Información Personal</h2>
                  </div>
                  <ProfileForm profile={profile} />
                </div>

                {/* Columna 2: Actividad Reciente (Pedidos) */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-bold">Pedidos Recientes</h2>
                    </div>
                    <Button asChild variant="link" size="sm" className="h-auto p-0 text-primary">
                      <Link href="/mis-pedidos">Ver todos</Link>
                    </Button>
                  </div>

                  {orders.length === 0 ? (
                    <Card className="border-dashed border-2 bg-muted/10">
                      <CardContent className="py-12 text-center">
                        <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/20 mb-3" />
                        <p className="text-muted-foreground text-sm font-medium">No hay pedidos aún</p>
                        <Button asChild variant="outline" size="sm" className="mt-4">
                          <Link href="/catalogo">Ir al Catálogo</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 4).map((order) => (
                        <Card key={order.id} className="hover:border-primary/30 transition-all group overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold text-muted-foreground">#{order.id.slice(0, 8).toUpperCase()}</span>
                              <Badge variant={statusColors[order.status]} className="text-[10px] uppercase font-bold px-2 py-0">
                                {statusLabels[order.status]}
                              </Badge>
                            </div>
                            <div className="flex items-end justify-between">
                              <div>
                                <p className="text-sm font-bold text-foreground">{formatPrice(order.total)}</p>
                                <p className="text-[10px] text-muted-foreground">{formatDate(order.created_at)}</p>
                              </div>
                              <div className="flex -space-x-2">
                                {order.items?.slice(0, 3).map((item, i) => (
                                  <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-bold">
                                    {item.quantity}
                                  </div>
                                ))}
                                {(order.items?.length || 0) > 3 && (
                                  <div className="w-6 h-6 rounded-full border-2 border-background bg-primary/10 text-primary flex items-center justify-center text-[8px] font-bold">
                                    +{(order.items?.length || 0) - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {orders.length > 4 && (
                        <Button asChild variant="ghost" className="w-full text-xs text-muted-foreground h-8">
                          <Link href="/mis-pedidos">
                            Y {orders.length - 4} pedidos más...
                          </Link>
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Columna 3: Gestión y Acciones */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">Acciones</h2>
                  </div>

                  <div className="grid gap-4">
                    {profile.role === 'admin' && (
                      <Card className="border-primary/20 bg-primary/5 shadow-sm">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base font-bold">Administración</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-1">
                          <Button asChild className="w-full justify-start h-9 text-sm" variant="ghost">
                            <Link href="/dashboard">
                              <LayoutDashboard className="mr-3 h-4 w-4" />
                              Panel de Control
                            </Link>
                          </Button>
                          <Button asChild className="w-full justify-start h-9 text-sm" variant="ghost">
                            <Link href="/dashboard/pedidos">
                              <ShoppingCart className="mr-3 h-4 w-4" />
                              Gestionar Pedidos
                            </Link>
                          </Button>
                          <Button asChild className="w-full justify-start h-9 text-sm" variant="ghost">
                            <Link href="/dashboard/productos">
                              <Package className="mr-3 h-4 w-4" />
                              Gestionar Productos
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                    <Card className="shadow-sm">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base font-bold">Atajos</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-1">
                        <Button asChild className="w-full justify-start h-9 text-sm" variant="ghost">
                          <Link href="/catalogo">
                            <Package className="mr-3 h-4 w-4" />
                            Explorar Catálogo
                          </Link>
                        </Button>
                        <Button asChild className="w-full justify-start h-9 text-sm" variant="ghost">
                          <Link href="/carrito">
                            <ShoppingCart className="mr-3 h-4 w-4" />
                            Ver mi Carrito
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>

                    <form action={signOut}>
                      <Button type="submit" variant="outline" className="w-full h-11 text-destructive hover:bg-destructive/5 hover:text-destructive border-destructive/20 gap-2 font-bold shadow-sm">
                        <LogOut className="h-5 w-5" />
                        Cerrar Sesión
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
