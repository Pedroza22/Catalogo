'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '@/lib/actions/products'
import { Plus, Tags, Loader2, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Category } from '@/lib/types/database'

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

  useEffect(() => {
    getAllCategories().then((cats) => {
      setCategories(cats)
      setLoading(false)
    })
  }, [])

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
                  <div className="space-y-2">
                    <Label htmlFor="edit-image_url">URL de Imagen</Label>
                    <Input id="edit-image_url" name="image_url" type="url" defaultValue={selectedCategory.image_url || ''} />
                  </div>
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
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creada</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-muted-foreground line-clamp-1 max-w-[300px]">{cat.description || '-'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cat.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {cat.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(cat.created_at).toLocaleDateString('es-CO')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setSelectedCategory(cat)
                            setEditDialogOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive"
                          onClick={() => handleDelete(cat.id)}
                          disabled={deleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
