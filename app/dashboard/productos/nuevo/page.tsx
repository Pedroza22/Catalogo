'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { createProduct, getAllCategories } from '@/lib/actions/products'
import { ArrowLeft, Loader2 } from 'lucide-react'
import type { Category } from '@/lib/types/database'

export default function NuevoProductoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  useEffect(() => {
    getAllCategories().then(setCategories)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    // Añadir categorías seleccionadas
    selectedCategories.forEach(catId => {
      formData.append('category_ids', catId)
    })

    const result = await createProduct(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/dashboard/productos')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/productos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nuevo Producto</h1>
          <p className="text-muted-foreground">Agrega un nuevo producto al catálogo</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Información del Producto</CardTitle>
          <CardDescription>Completa los datos del nuevo producto</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input id="name" name="name" required placeholder="Nombre del producto" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input id="sku" name="sku" required placeholder="Código único" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" name="description" placeholder="Descripción del producto" rows={3} />
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
                <p className="text-xs text-muted-foreground">Selecciona al menos una categoría</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Precio *</Label>
                <Input id="price" name="price" type="number" min="0" step="100" required placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Inicial *</Label>
                <Input id="stock" name="stock" type="number" min="0" required placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_stock">Stock Mínimo</Label>
                <Input id="min_stock" name="min_stock" type="number" min="0" defaultValue="5" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image_file">Subir Imagen desde el Dispositivo</Label>
                <Input 
                  id="image_file" 
                  name="image_file" 
                  type="file" 
                  accept="image/*" 
                  className="cursor-pointer"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">o usar URL</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">URL de Imagen</Label>
                <Input id="image_url" name="image_url" type="url" placeholder="https://..." />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Producto
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
