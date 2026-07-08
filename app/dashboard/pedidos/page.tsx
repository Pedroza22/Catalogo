'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OrderStatusSelect } from '@/components/order-status-select'
import { ShoppingCart, Search, Filter, MapPin, AlertCircle, Package } from 'lucide-react'

// Mock function to simulate fetching orders (we'll replace this with actual hook if needed)
const getAllOrdersFromServer = async () => {
  // Dynamic import
  const { getAllOrders } = await import('@/lib/actions/orders')
  return getAllOrders()
}

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

const paymentLabels: Record<string, string> = {
  efectivo: 'Efectivo',
  credito: 'Crédito',
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [filteredOrders, setFilteredOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Helper function to find out-of-stock products in an order
  const getOutOfStockItems = (order: any) => {
    if (!order.items) return []
    return order.items.filter((item: any) => item.product && item.product.stock < item.quantity).map((item: any) => ({
      name: item.product.name,
      requested: item.quantity,
      available: item.product.stock,
    }))
  }

  const fetchOrders = async () => {
    const data = await getAllOrdersFromServer()
    setOrders(data)
    setFilteredOrders(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // Filter orders based on search and filters
  useEffect(() => {
    let filtered = [...orders]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(query) ||
        (order.client?.full_name?.toLowerCase().includes(query) ||
        order.client?.email?.toLowerCase().includes(query) ||
        (order.delivery_address?.toLowerCase().includes(query)))
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.payment_method === paymentFilter)
    }

    setFilteredOrders(filtered)
  }, [searchQuery, statusFilter, paymentFilter, orders])

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
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/50 animate-pulse" />
          <p className="text-muted-foreground">Cargando pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Pedidos</h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-2">Gestiona los pedidos de tus clientes</p>
      </div>

      <div className="h-4"></div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Lista de Pedidos</CardTitle>
              <CardDescription>{filteredOrders.length} pedidos encontrados</CardDescription>
            </div>
          </div>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col gap-4 mt-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID, cliente o dirección..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Estado" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="preparando">Preparando</SelectItem>
                  <SelectItem value="despachado">Despachado</SelectItem>
                  <SelectItem value="entregado">Entregado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los pagos</SelectItem>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="credito">Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay pedidos</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || paymentFilter !== 'all'
                ? 'Intenta con otros términos de búsqueda o filtros'
                : 'Los pedidos de tus clientes aparecerán aquí'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="bg-muted/50">ID Pedido</TableHead>
                      <TableHead className="bg-muted/50">Cliente</TableHead>
                      <TableHead className="bg-muted/50">Dirección</TableHead>
                      <TableHead className="bg-muted/50">Fecha Pedido</TableHead>
                      <TableHead className="bg-muted/50">Fecha Entrega</TableHead>
                      <TableHead className="bg-muted/50">Pago</TableHead>
                      <TableHead className="bg-muted/50 text-right">Total</TableHead>
                      <TableHead className="bg-muted/50">Estado</TableHead>
                      <TableHead className="bg-muted/50 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const outOfStockItems = getOutOfStockItems(order)
                      const hasStockIssues = outOfStockItems.length > 0
                      
                      return (
                          <TableRow 
                            className={`hover:bg-muted/20 cursor-pointer ${hasStockIssues ? 'bg-red-50 hover:bg-red-100 border-l-4 border-l-red-500' : ''}`} 
                            onClick={() => {
                              setSelectedOrder({ ...order, outOfStockItems })
                              setDialogOpen(true)
                            }}
                            key={order.id}
                          >
                            <TableCell className="font-mono text-sm flex items-center gap-2">
                              {hasStockIssues && <AlertCircle className="h-4 w-4 text-red-500" />}
                              #{order.id.slice(0, 8)}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{order.client?.full_name || 'Cliente'}</p>
                                <p className="text-xs text-muted-foreground">{order.client?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-start gap-1 text-muted-foreground">
                                <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-2 max-w-[200px] text-sm">{order.delivery_address || 'No especificada'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{formatDate(order.created_at)}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {order.delivery_date ? (
                                  <div>
                                    <p>{formatDate(order.delivery_date)}</p>
                                    {order.is_free_delivery ? (
                                      <Badge variant="secondary" className="text-xs mt-1">
                                        Envío Gratis
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-xs mt-1">
                                        {formatPrice(order.delivery_cost || 0)}
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">No especificada</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{paymentLabels[order.payment_method]}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">{formatPrice(order.total)}</TableCell>
                            <TableCell>
                              <Badge variant={statusColors[order.status]}>
                                {statusLabels[order.status]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <OrderStatusSelect 
                                orderId={order.id} 
                                currentStatus={order.status} 
                                onStatusUpdated={fetchOrders}
                              />
                            </TableCell>
                          </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              
              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {filteredOrders.map((order) => {
                  const outOfStockItems = getOutOfStockItems(order)
                  const hasStockIssues = outOfStockItems.length > 0
                  
                  return (
                    <div 
                      key={order.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        hasStockIssues 
                          ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                          : 'bg-white hover:bg-muted/20'
                      }`}
                      onClick={() => {
                        setSelectedOrder({ ...order, outOfStockItems })
                        setDialogOpen(true)
                      }}
                    >
                      {/* ID Pedido */}
                      <div className="flex items-center gap-2 mb-3">
                        {hasStockIssues && <AlertCircle className="h-4 w-4 text-red-500" />}
                        <span className="font-mono text-sm font-medium">#{order.id.slice(0, 8)}</span>
                        <Badge variant={statusColors[order.status]} className="ml-auto">
                          {statusLabels[order.status]}
                        </Badge>
                      </div>
                      
                      {/* Cliente */}
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground mb-1">Cliente</p>
                        <p className="font-medium">{order.client?.full_name || 'Cliente'}</p>
                        <p className="text-xs text-muted-foreground">{order.client?.email}</p>
                      </div>
                      
                      {/* Dirección */}
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground mb-1">Dirección</p>
                        <div className="flex items-start gap-1">
                          <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground line-clamp-2">
                            {order.delivery_address || 'No especificada'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Fechas */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Pedido</p>
                          <p className="text-sm">{formatDate(order.created_at)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Entrega</p>
                          {order.delivery_date ? (
                            <div>
                              <p className="text-sm">{formatDate(order.delivery_date)}</p>
                              {order.is_free_delivery ? (
                                <Badge variant="secondary" className="text-xs mt-1">
                                  Envío Gratis
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs mt-1">
                                  {formatPrice(order.delivery_cost || 0)}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No especificada</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Total y Pago */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Pago</p>
                          <Badge variant="outline">{paymentLabels[order.payment_method]}</Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">Total</p>
                          <p className="font-bold text-lg">{formatPrice(order.total)}</p>
                        </div>
                      </div>
                      
                      {/* Acciones */}
                      <div className="mt-4">
                        <OrderStatusSelect 
                          orderId={order.id} 
                          currentStatus={order.status} 
                          onStatusUpdated={fetchOrders}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Pedido #{selectedOrder.id.slice(0, 8)}
                </DialogTitle>
                <DialogDescription>
                  {formatDate(selectedOrder.created_at)}
                </DialogDescription>
              </DialogHeader>

              {/* Stock Issues Alert */}
              {selectedOrder.outOfStockItems && selectedOrder.outOfStockItems.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Pedido sin stock suficiente</AlertTitle>
                  <AlertDescription className="mt-2">
                    <ul className="list-disc ml-4 space-y-1">
                      {selectedOrder.outOfStockItems.map((item: any, index: number) => (
                        <li key={index}>
                          <strong>{item.name}</strong>: Pediste {item.requested}, solo hay {item.available} disponibles
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="grid gap-6 py-4">
                {/* Client Information */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Datos del Cliente</h3>
                  <div className="grid gap-1">
                    <p className="text-sm">
                      <span className="font-medium">Nombre: </span>
                      {selectedOrder.client?.full_name || 'Cliente'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Email: </span>
                      {selectedOrder.client?.email}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Teléfono: </span>
                      {selectedOrder.client?.phone || 'No especificado'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Dirección: </span>
                      {selectedOrder.delivery_address || 'No especificada'}
                    </p>
                  </div>
                </div>

                {/* Order Information */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Información del Pedido</h3>
                  <div className="grid gap-1">
                    <p className="text-sm">
                      <span className="font-medium">Estado: </span>
                      <Badge variant={statusColors[selectedOrder.status]}>
                        {statusLabels[selectedOrder.status]}
                      </Badge>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Pago: </span>
                      <Badge variant="outline">{paymentLabels[selectedOrder.payment_method]}</Badge>
                    </p>
                    {selectedOrder.delivery_date && (
                      <p className="text-sm">
                        <span className="font-medium">Fecha de entrega: </span>
                        {formatDate(selectedOrder.delivery_date)}
                        {selectedOrder.is_free_delivery ? (
                          <Badge variant="secondary" className="ml-2">
                            Envío Gratis
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="ml-2">
                            {formatPrice(selectedOrder.delivery_cost || 0)}
                          </Badge>
                        )}
                      </p>
                    )}
                    {selectedOrder.notes && (
                      <p className="text-sm">
                        <span className="font-medium">Notas: </span>
                        {selectedOrder.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Productos</h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                        <div className="flex-shrink-0">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.product?.name}</p>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            {item.selected_color && (
                              <span>Color: {item.selected_color}</span>
                            )}
                            {item.selected_size && (
                              <span>Talla: {item.selected_size}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {item.quantity} x {formatPrice(item.unit_price)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="font-bold text-xl">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
