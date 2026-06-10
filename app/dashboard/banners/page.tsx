'use client'

import { useState, useEffect } from 'react'
import { getBanners, createBanner, updateBanner, deleteBanner } from '@/lib/actions/banners'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, Save, Image as ImageIcon } from 'lucide-react'
import type { Banner } from '@/lib/types/database'
import Image from 'next/image'
import { toast } from 'sonner'

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    setLoading(true)
    const data = await getBanners(true)
    setBanners(data)
    setLoading(false)
  }

  const handleCreate = async () => {
    const formData = new FormData()
    formData.append('title', 'Nuevo Banner')
    formData.append('order', (banners.length + 1).toString())
    
    const res = await createBanner(formData)
    if (res.success) {
      toast.success('Banner creado')
      loadBanners()
    } else {
      toast.error('Error al crear banner')
    }
  }

  const handleUpdate = async (id: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const res = await updateBanner(id, formData)
    if (res.success) {
      toast.success('Banner actualizado')
      loadBanners()
    } else {
      toast.error('Error al actualizar banner')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este banner?')) return
    const res = await deleteBanner(id)
    if (res.success) {
      toast.success('Banner eliminado')
      loadBanners()
    } else {
      toast.error('Error al eliminar banner')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Banners</h1>
          <p className="text-muted-foreground">Administra las promociones del carrusel principal</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Banner
        </Button>
      </div>

      <div className="grid gap-6">
        {banners.map((banner) => (
          <Card key={banner.id}>
            <form onSubmit={(e) => handleUpdate(banner.id, e)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Banner #{banner.order}
                </CardTitle>
                <Button variant="ghost" size="icon" type="button" onClick={() => handleDelete(banner.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input name="title" defaultValue={banner.title} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtítulo</Label>
                    <Input name="subtitle" defaultValue={banner.subtitle || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label>Color de Fondo (Gradient Tailwind)</Label>
                    <Input name="background_color" defaultValue={banner.background_color || ''} placeholder="from-blue-600 to-cyan-500" />
                  </div>
                  <div className="space-y-2">
                    <Label>Orden</Label>
                    <Input name="order" type="number" defaultValue={banner.order} />
                  </div>
                  <div className="space-y-2">
                    <Label>Imagen (Archivo)</Label>
                    <Input name="image_file" type="file" accept="image/*" />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Switch name="is_active" defaultChecked={banner.is_active} value="true" />
                    <Label>Activo</Label>
                  </div>
                </div>

                {banner.image_url && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                    <Image src={banner.image_url} alt="Preview" fill className="object-cover" />
                  </div>
                )}

                <Button type="submit" className="w-full">
                  <Save className="mr-2 h-4 w-4" /> Guardar Cambios
                </Button>
              </CardContent>
            </form>
          </Card>
        ))}
      </div>
    </div>
  )
}
