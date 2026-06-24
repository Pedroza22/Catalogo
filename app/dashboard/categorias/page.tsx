'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '@/lib/actions/products'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Tags, Loader2, Pencil, Trash2, FolderTree, ImageIcon, ChevronDown, ChevronRight } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { toast } from 'sonner'
import type { Category } from '@/lib/types/database'
import Image from 'next/image'

export default function CategoriasPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  
  // Estado para controlar qué categorías principales están expandidas
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }
  
  // Estados para controlar si es subcategoría en los diálogos
  const [isSubcategoryNew, setIsSubcategoryNew] = useState(false)
  const [isSubcategoryEdit, setIsSubcategoryEdit] = useState(false)

  useEffect(() => {
    getAllCategories().then((cats) => {
      setCategories(cats)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      setIsSubcategoryEdit(!!selectedCategory.parent_id)
    }
  }, [selectedCategory])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createCategory(formData)

    if (result.error) {
      setError(result.error)
      setCreating(false)
      toast.error(result.error)
      return
    }

    setDialogOpen(false)
    setCreating(false)
    toast.success('Categoría creada correctamente')
    const updated = await getAllCategories()
    setCategories(updated)
    router.refresh()
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedCategory) return

    setEditing(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await updateCategory(selectedCategory.id, formData)

    if (result.error) {
      setError(result.error)
      setEditing(false)
      toast.error(result.error)
      return
    }

    setEditDialogOpen(false)
    setEditing(false)
    toast.success('Categoría actualizada correctamente')
    const updated = await getAllCategories()
    setCategories(updated)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres desactivar esta categoría?')) return

    setDeleting(true)
    const result = await deleteCategory(id)

    if (result.error) {
      toast.error(result.error)
      setDeleting(false)
      return
    }

    toast.success('Categoría desactivada correctamente')
    const updated = await getAllCategories()
    setCategories(updated)
    setDeleting(false)
    router.refresh()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Categorías</h1>
          <p className="text-muted-foreground">Organiza tus productos por categorías</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Categoría</DialogTitle>
              <DialogDescription>Crea una nueva categoría para organizar tus productos</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input id="name" name="name" required placeholder="Nombre de la categoría" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea id="description" name="description" placeholder="Descripción opcional" rows={3} />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="image_file">Subir Imagen</Label>
                    <Input id="image_file" name="image_file" type="file" accept="image/*" className="cursor-pointer" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                  <div className="space-y-0.5">
                    <Label>¿Es una subcategoría?</Label>
                    <p className="text-xs text-muted-foreground">Activa para asociarla a una principal</p>
                  </div>
                  <Switch 
                    checked={isSubcategoryNew} 
                    onCheckedChange={setIsSubcategoryNew}
                  />
                </div>

                {isSubcategoryNew && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Label htmlFor="parent_id">Seleccionar Categoría Principal</Label>
                    <Select name="parent_id" defaultValue="">
                      <SelectTrigger>
                        <SelectValue placeholder="Elegir principal..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter(c => !c.parent_id)
                          .map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <input type="hidden" name="is_sub" value={isSubcategoryNew ? "true" : "false"} />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Categoría</DialogTitle>
              <DialogDescription>Modifica los datos de la categoría</DialogDescription>
            </DialogHeader>
            {selectedCategory && (
              <form onSubmit={handleUpdate}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nombre *</Label>
                    <Input id="edit-name" name="name" defaultValue={selectedCategory.name} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Descripción</Label>
                    <Textarea id="edit-description" name="description" defaultValue={selectedCategory.description || ''} rows={3} />
                  </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-image_file">Subir Imagen</Label>
                    <Input id="edit-image_file" name="image_file" type="file" accept="image/*" className="cursor-pointer" />
                  </div>
                </div>

                {selectedCategory.image_url && (
                  <div className="space-y-2">
                    <Label>Imagen Actual</Label>
                    <div className="relative h-32 w-full rounded-lg overflow-hidden border">
                      <Image src={selectedCategory.image_url} alt="Preview" fill className="object-cover" />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                  <div className="space-y-0.5">
                    <Label>¿Es una subcategoría?</Label>
                    <p className="text-xs text-muted-foreground">Activa para asociarla a una principal</p>
                  </div>
                  <Switch 
                    checked={isSubcategoryEdit} 
                    onCheckedChange={setIsSubcategoryEdit}
                  />
                </div>

                {isSubcategoryEdit && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Label htmlFor="edit-parent_id">Seleccionar Categoría Principal</Label>
                    <Select name="parent_id" defaultValue={selectedCategory.parent_id || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="Elegir principal..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter(c => c.id !== selectedCategory.id && !c.parent_id)
                          .map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <input type="hidden" name="is_sub" value={isSubcategoryEdit ? "true" : "false"} />

                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="edit-is_active" name="is_active" defaultChecked={selectedCategory.is_active} value="true" className="rounded border-gray-300" />
                  <Label htmlFor="edit-is_active">Categoría Activa</Label>
                </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={editing}>
                    {editing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Cambios
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorías</CardTitle>
          <CardDescription>{categories.length} categorías en total</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <Tags className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay categorías</h3>
              <p className="text-muted-foreground mb-4">Crea tu primera categoría para organizar productos</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead className="w-[80px]">Imagen</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden md:table-cell">Descripción</TableHead>
                  <TableHead className="hidden md:table-cell">Estado</TableHead>
                  <TableHead className="hidden sm:table-cell">Creada</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories
                  .filter(c => !c.parent_id) // Primero las principales
                  .map(parent => {
                    const subcats = categories.filter(sub => sub.parent_id === parent.id)
                    const isExpanded = expandedCategories.includes(parent.id)
                    
                    return (
                      <React.Fragment key={parent.id}>
                        <TableRow className="bg-muted/10 hover:bg-muted/20 transition-colors">
                          <TableCell>
                            {subcats.length > 0 && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={() => toggleCategory(parent.id)}
                              >
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="relative h-10 w-10 rounded-lg overflow-hidden border bg-white flex-shrink-0">
                              {parent.image_url ? (
                                <Image src={parent.image_url} alt={parent.name} fill className="object-cover" />
                              ) : (
                                <div className="flex h-full items-center justify-center bg-muted">
                                  <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-bold">
                            <div className="flex items-center gap-2">
                              <Tags className="h-4 w-4 text-primary" />
                              {parent.name}
                              {subcats.length > 0 && (
                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                                  {subcats.length} sub
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <p className="text-xs text-muted-foreground font-normal line-clamp-1">
                              {parent.description || 'Sin descripción'}
                            </p>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${parent.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {parent.is_active ? 'Activa' : 'Inactiva'}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs hidden sm:table-cell">
                            {new Date(parent.created_at).toLocaleDateString('es-CO')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => {
                                  setSelectedCategory(parent)
                                  setEditDialogOpen(true)
                                }}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(parent.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        {/* Subcategorías desplegables */}
                        {isExpanded && subcats.map(sub => (
                          <TableRow key={sub.id} className="bg-white hover:bg-primary/5 transition-colors">
                            <TableCell>
                              {/* Espacio para alinear con las categorías principales */}
                            </TableCell>
                            <TableCell>
                              <div className="relative h-8 w-8 rounded-lg overflow-hidden border bg-white flex-shrink-0">
                                {sub.image_url ? (
                                  <Image src={sub.image_url} alt={sub.name} fill className="object-cover" />
                                ) : (
                                  <div className="flex h-full items-center justify-center bg-muted">
                                    <ImageIcon className="h-4 w-4 text-muted-foreground/30" />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 pl-6">
                                <FolderTree className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="font-medium text-sm">{sub.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <p className="text-xs text-muted-foreground italic line-clamp-1">
                                {sub.description || 'Sin descripción'}
                              </p>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sub.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {sub.is_active ? 'Activa' : 'Inactiva'}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs hidden sm:table-cell">
                              {new Date(sub.created_at).toLocaleDateString('es-CO')}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setSelectedCategory(sub)
                                    setEditDialogOpen(true)
                                  }}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDelete(sub.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </React.Fragment>
                    )
                  })
                }
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
