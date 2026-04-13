'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { getAllProducts } from '@/lib/actions/products'
import { createClient } from '@/lib/supabase/client'
import { Plus, Warehouse, Loader2, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react'
import type { Product, MovementType } from '@/lib/types/database'
import { cn } from '@/lib/utils'

export default function InventarioPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [movementType, setMovementType] = useState<MovementType>('entrada')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'low' | 'out'>('all')

  useEffect(() => {
    getAllProducts().then((prods) => {
      setProducts(prods)
      setLoading(false)
    })
  }, [])

  const filteredInventory = products.filter(p => {
    if (!p.is_active) return false
    if (filterType === 'low') return p.stock > 0 && p.stock <= p.min_stock
    if (filterType === 'out') return p.stock <= 0
    return true
  })

  const lowStockCount = products.filter(p => p.is_active && p.stock > 0 && p.stock <= p.min_stock).length
  const outOfStockCount = products.filter(p => p.is_active && p.stock <= 0).length

  const handleMovement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct || !quantity) return

    setSubmitting(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setError('No autenticado')
      setSubmitting(false)
      return
    }

    const product = products.find(p => p.id === selectedProduct)
    if (!product) {
      setError('Producto no encontrado')
      setSubmitting(false)
      return
    }

    const qty = parseInt(quantity)
    let newStock = product.stock

    if (movementType === 'entrada') {
      newStock += qty
    } else if (movementType === 'salida') {
      if (qty > product.stock) {
        setError('No hay suficiente stock')
        setSubmitting(false)
        return
      }
      newStock -= qty
    } else {
      newStock = qty
    }

    // Update product stock
    const { error: updateError } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', selectedProduct)

    if (updateError) {
      setError(updateError.message)
      setSubmitting(false)
      return
    }

    // Record movement
    const { error: movementError } = await supabase
      .from('inventory_movements')
      .insert({
        product_id: selectedProduct,
        user_id: user.id,
        type: movementType,
        quantity: movementType === 'ajuste' ? newStock : qty,
        reason: reason || null,
      })

    if (movementError) {
      setError(movementError.message)
      setSubmitting(false)
      return
    }

    setDialogOpen(false)
    setSelectedProduct('')
    setQuantity('')
    setReason('')
    setSubmitting(false)
    
    const updated = await getAllProducts()
    setProducts(updated)
    router.refresh()
  }

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return { label: 'Agotado', variant: 'destructive' as const }
    if (product.stock <= product.min_stock) return { label: 'Bajo', variant: 'secondary' as const }
    return { label: 'Normal', variant: 'default' as const }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventario</h1>
          <p className="text-muted-foreground">Gestiona el stock de tus productos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Movimiento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Movimiento</DialogTitle>
              <DialogDescription>Registra entrada, salida o ajuste de inventario</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleMovement}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Producto *</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.filter(p => p.is_active).map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} (Stock: {product.stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Movimiento *</Label>
                  <Select value={movementType} onValueChange={(v) => setMovementType(v as MovementType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">
                        <span className="flex items-center gap-2">
                          <ArrowUp className="h-4 w-4 text-green-500" />
                          Entrada
                        </span>
                      </SelectItem>
                      <SelectItem value="salida">
                        <span className="flex items-center gap-2">
                          <ArrowDown className="h-4 w-4 text-red-500" />
                          Salida
                        </span>
                      </SelectItem>
                      <SelectItem value="ajuste">
                        <span className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 text-blue-500" />
                          Ajuste
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">
                    {movementType === 'ajuste' ? 'Nuevo Stock *' : 'Cantidad *'}
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Razón</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Motivo del movimiento..."
                    rows={2}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting || !selectedProduct || !quantity}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Registrar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className={cn("cursor-pointer transition-colors", filterType === 'all' && "border-primary bg-primary/5")} onClick={() => setFilterType('all')}>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Todos los Productos</CardTitle>
            <div className="text-2xl font-bold">{products.filter(p => p.is_active).length}</div>
          </CardHeader>
        </Card>
        <Card className={`cursor-pointer transition-colors ${filterType === 'low' ? 'border-yellow-500 bg-yellow-50' : ''}`} onClick={() => setFilterType('low')}>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-yellow-600">Bajo Stock</CardTitle>
            <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
          </CardHeader>
        </Card>
        <Card className={cn("cursor-pointer transition-colors", filterType === 'out' && "border-destructive bg-destructive/5")} onClick={() => setFilterType('out')}>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-destructive">Sin Stock</CardTitle>
            <div className="text-2xl font-bold text-destructive">{outOfStockCount}</div>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Estado del Inventario</CardTitle>
              <CardDescription>
                {filterType === 'all' && "Mostrando todos los productos activos"}
                {filterType === 'low' && "Mostrando productos con bajo stock (≤ stock mínimo)"}
                {filterType === 'out' && "Mostrando productos agotados"}
              </CardDescription>
            </div>
            {filterType !== 'all' && (
              <Button variant="ghost" size="sm" onClick={() => setFilterType('all')}>
                Ver todos
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-12">
              <Warehouse className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No se encontraron productos</h3>
              <p className="text-muted-foreground">
                {filterType === 'all' ? 'Agrega productos primero para gestionar inventario' : 'No hay productos que coincidan con este filtro'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Stock Actual</TableHead>
                  <TableHead className="text-right">Stock Mínimo</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((product) => {
                  const status = getStockStatus(product)
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                      <TableCell className="text-right font-medium">{product.stock}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{product.min_stock}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
