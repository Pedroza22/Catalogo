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
import { Switch } from '@/components/ui/switch'
import { createProduct, getAllCategories } from '@/lib/actions/products'
import type { ProductVariant } from '@/lib/types/database'
import { ArrowLeft, Loader2, X, Plus, RefreshCw, Trash2 } from 'lucide-react'

export default function NuevoProductoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useVariants, setUseVariants] = useState(false)
  interface Category {
    id: string;
    name: string;
  }
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [newColor, setNewColor] = useState('')
  const [sizes, setSizes] = useState<string[]>([])
  const [newSize, setNewSize] = useState('')
  const [sku, setSku] = useState('')
  const [variants, setVariants] = useState<Array<Partial<ProductVariant>>>([
    { size: '', color: '', price: 0, cost_price: 0, stock: 0, sku: '', is_active: true }
  ])

  useEffect(() => {
    getAllCategories().then(setCategories)
  }, [])

  const generateSKU = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    setSku(`PROD-${timestamp}${random}`)
  }

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

  const addVariant = () => {
    setVariants([...variants, { size: '', color: '', price: 0, cost_price: 0, stock: 0, sku: '', is_active: true }])
  }

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index))
    }
  }

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setVariants(newVariants)
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

    // Añadir variantes si usamos variantes
    if (useVariants) {
      formData.append('variants', JSON.stringify(variants))
    }

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

      <Card className="w-full">
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
                <div className="flex gap-2">
                  <Input 
                    id="sku" 
                    name="sku" 
                    value={sku} 
                    onChange={(e) => setSku(e.target.value.toUpperCase())} 
                    required 
                    placeholder="Código único" 
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    onClick={generateSKU}
                    title="Generar automáticamente"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
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

            <div className="flex items-center space-x-2">
              <Switch 
                id="useVariants" 
                checked={useVariants}
                onCheckedChange={setUseVariants}
              />
              <Label htmlFor="useVariants">Usar variantes (tallas/colores con precios diferentes)</Label>
            </div>

            {!useVariants ? (
              <>
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

                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost_price">Precio de Costo</Label>
                    <Input id="cost_price" name="cost_price" type="number" min="0" step="any" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio de Venta *</Label>
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
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Variantes del Producto</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                    <Plus className="h-4 w-4 mr-2" /> Agregar Variante
                  </Button>
                </div>
                <div className="border rounded-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium">Talla</th>
                          <th className="px-4 py-2 text-left text-sm font-medium">Color</th>
                          <th className="px-4 py-2 text-left text-sm font-medium">SKU</th>
                          <th className="px-4 py-2 text-left text-sm font-medium">Precio Costo</th>
                          <th className="px-4 py-2 text-left text-sm font-medium">Precio Venta *</th>
                          <th className="px-4 py-2 text-left text-sm font-medium">Stock *</th>
                          <th className="px-4 py-2 text-left text-sm font-medium">Activo</th>
                          <th className="px-4 py-2 text-left text-sm font-medium w-16"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map((variant, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">
                              <Input 
                                value={variant.size || ''} 
                                onChange={(e) => updateVariant(index, 'size', e.target.value)}
                                placeholder="T-19, T-20..."
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input 
                                value={variant.color || ''} 
                                onChange={(e) => updateVariant(index, 'color', e.target.value)}
                                placeholder="Rojo, Azul..."
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input 
                                value={variant.sku || ''} 
                                onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                placeholder="SKU"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input 
                                type="number" 
                                min="0" 
                                step="any"
                                value={variant.cost_price || ''} 
                                onChange={(e) => updateVariant(index, 'cost_price', parseFloat(e.target.value) || 0)}
                                placeholder="0"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input 
                                type="number" 
                                min="0" 
                                step="any"
                                value={variant.price || ''} 
                                onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                                placeholder="0"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Input 
                                type="number" 
                                min="0" 
                                step="any"
                                value={variant.stock || ''} 
                                onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                                placeholder="0"
                              />
                            </td>
                            <td className="px-4 py-2 text-center">
                              <Checkbox 
                                checked={variant.is_active !== false}
                                onCheckedChange={(checked) => updateVariant(index, 'is_active', checked)}
                              />
                            </td>
                            <td className="px-4 py-2">
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removeVariant(index)}
                                disabled={variants.length === 1}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

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
