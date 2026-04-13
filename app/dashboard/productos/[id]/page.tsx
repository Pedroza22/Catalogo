'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { getProductById, updateProduct, deleteProduct, getAllCategories } from '@/lib/actions/products'
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Product, Category } from '@/lib/types/database'

export default function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const [prod, cats] = await Promise.all([
        getProductById(id),
        getAllCategories()
      ])
      
      if (!prod) {
        toast.error('Producto no encontrado')
        router.push('/dashboard/productos')
        return
      }

      setProduct(prod)
      setCategories(cats)
      setSelectedCategories(prod.categories?.map(c => c.id) || [])
      setLoading(false)
    }

    fetchData()
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    // Añadir categorías seleccionadas
    selectedCategories.forEach(catId => {
      formData.append('category_ids', catId)
    })

    const result = await updateProduct(id, formData)

    if (result.error) {
      setError(result.error)
      setSubmitting(false)
      toast.error(result.error)
      return
    }

    toast.success('Producto actualizado correctamente')
    router.push('/dashboard/productos')
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres desactivar este producto?')) return

    setDeleting(true)
    const result = await deleteProduct(id)

    if (result.error) {
      toast.error(result.error)
      setDeleting(false)
      return
    }

    toast.success('Producto desactivado correctamente')
    router.push('/dashboard/productos')
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/productos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar Producto</h1>
            <p className="text-muted-foreground">{product.name}</p>
          </div>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
          {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
          Desactivar Producto
        </Button>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Información del Producto</CardTitle>
          <CardDescription>Modifica los datos del producto</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input id="name" name="name" defaultValue={product.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input id="sku" name="sku" defaultValue={product.sku || ''} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" name="description" defaultValue={product.description || ''} rows={3} />
            </div>

            <div className="space-y-3">
              <Label>Categorías *</Label>
              <div className="grid grid-cols-2 gap-4 border rounded-md p-4 bg-muted/20">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`cat-${cat.id}`} 
                      checked={selectedCategories.includes(cat.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCategories(prev => [...prev, cat.id])
                        } else {
                          setSelectedCategories(prev => prev.filter(id => id !== cat.id))
                        }
                      }}
                    />
                    <label 
                      htmlFor={`cat-${cat.id}`}
                      className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {cat.name}
                    </label>
                  </div>
                ))}
              </div>
              {selectedCategories.length === 0 && (
                <p className="text-xs text-destructive">Debes seleccionar al menos una categoría</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Precio *</Label>
                <Input id="price" name="price" type="number" min="0" step="100" defaultValue={product.price} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock *</Label>
                <Input id="stock" name="stock" type="number" min="0" defaultValue={product.stock} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_stock">Stock Mínimo</Label>
                <Input id="min_stock" name="min_stock" type="number" min="0" defaultValue={product.min_stock} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image_file">Subir Nueva Imagen</Label>
                <Input 
                  id="image_file" 
                  name="image_file" 
                  type="file" 
                  accept="image/*" 
                  className="cursor-pointer"
                />
                {product.image_url && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Imagen actual: <a href={product.image_url} target="_blank" rel="noopener noreferrer" className="underline">Ver actual</a>
                  </p>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">o cambiar URL</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">URL de Imagen</Label>
                <Input id="image_url" name="image_url" type="url" defaultValue={product.image_url || ''} placeholder="https://..." />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="is_active" name="is_active" defaultChecked={product.is_active} value="true" />
              <Label htmlFor="is_active">Producto Activo</Label>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
              <Link href="/dashboard/productos">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
