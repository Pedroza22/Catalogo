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
import { ArrowLeft, Loader2, X, Plus } from 'lucide-react'
import type { Category } from '@/lib/types/database'

export default function NuevoProductoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [newColor, setNewColor] = useState('')
  const [sizes, setSizes] = useState<string[]>([])
  const [newSize, setNewSize] = useState('')

  useEffect(() => {
    getAllCategories().then(setCategories)
  }, [])

  const addColor = () => {
    if (newColor && !colors.includes(newColor)) {
      setColors([...colors, newColor])
      setNewColor('')
    }
  }

  const removeColor = (color: string) => {
    setColors(colors.filter(c => c !== color))
  }

  const addSize = () => {
    if (newSize && !sizes.includes(newSize)) {
      setSizes([...sizes, newSize])
      setNewSize('')
    }
  }

  const removeSize = (size: string) => {
    setSizes(sizes.filter(s => s !== size))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    // Añadir categorías seleccionadas
    selectedCategories.forEach(catId => {
      formData.append('category_ids', catId)
    })

    // Añadir colores
    formData.append('colors', colors.join(','))
    
    // Añadir tallas
    formData.append('sizes', sizes.join(','))

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

            <div className="space-y-3">
              <Label>Colores Disponibles</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {colors.map((color) => (
                  <div key={color} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    {color}
                    <button type="button" onClick={() => removeColor(color)} className="hover:text-primary/70">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input 
                  value={newColor} 
                  onChange={(e) => setNewColor(e.target.value)} 
                  placeholder="Ej: Rojo, Verde, Azul..." 
                  className="max-w-[200px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addColor()
                    }
                  }}
                />
                <Button type="button" variant="outline" size="icon" onClick={addColor}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Agrega los colores disponibles para este producto.</p>
            </div>

            <div className="space-y-3">
              <Label>Tallas Disponibles</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {sizes.map((size) => (
                  <div key={size} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    {size}
                    <button type="button" onClick={() => removeSize(size)} className="hover:text-primary/70">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input 
                  value={newSize} 
                  onChange={(e) => setNewSize(e.target.value)} 
                  placeholder="Ej: S, M, L, XL..." 
                  className="max-w-[200px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSize()
                    }
                  }}
                />
                <Button type="button" variant="outline" size="icon" onClick={addSize}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Agrega las tallas disponibles (ej: S, M, L o 38, 40, 42).</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Precio *</Label>
                <Input id="price" name="price" type="number" min="0" step="any" required placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Inicial *</Label>
                <Input id="stock" name="stock" type="number" min="0" step="any" required placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_stock">Stock Mínimo</Label>
                <Input id="min_stock" name="min_stock" type="number" min="0" step="any" defaultValue="5" />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="image_file">Imagen del Producto</Label>
                <Input 
                  id="image_file" 
                  name="image_file" 
                  type="file" 
                  accept="image/*" 
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Sube una imagen desde tu dispositivo para el catálogo.
                </p>
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
