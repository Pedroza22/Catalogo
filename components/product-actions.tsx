'use client'

import { useState } from 'react'
import { Pencil, Trash2, Loader2, Eye, EyeOff, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { hardDeleteProduct, toggleProductStatus } from '@/lib/actions/products'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ProductActionsProps {
  productId: string
  productName: string
  isActive: boolean
  imageUrl?: string | null
}

export function ProductActions({ productId, productName, isActive, imageUrl }: ProductActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const router = useRouter()

  const handleToggleStatus = async () => {
    try {
      setIsToggling(true)
      const result = await toggleProductStatus(productId, !isActive)
      
      if (result.success) {
        toast.success(`Producto ${isActive ? 'desactivado' : 'activado'} correctamente`)
        router.refresh()
      } else {
        toast.error(result.error || 'Error al cambiar el estado del producto')
      }
    } catch (err) {
      console.error('Error toggling product status:', err)
      toast.error('Ocurrió un error inesperado')
    } finally {
      setIsToggling(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const result = await hardDeleteProduct(productId)
      
      if (result.success) {
        toast.success(`Producto "${productName}" eliminado definitivamente`)
        router.refresh()
      } else {
        toast.error(result.error || 'Error al eliminar el producto. Asegúrate de que no esté en ningún pedido.')
      }
    } catch (err) {
      console.error('Error deleting product:', err)
      toast.error('Ocurrió un error inesperado al eliminar el producto')
    } finally {
      setIsDeleting(false)
      setIsOpen(false)
    }
  }

  return (
    <div className="flex items-center justify-end gap-1 sm:gap-2">
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            title="Ver imagen del producto"
            className="h-8 w-8 sm:h-9 sm:w-9"
          >
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary px-4 py-3 pr-10 min-h-[48px] flex items-center">
            <DialogTitle className="text-white text-sm font-bold uppercase tracking-wide leading-tight">
              {productName}
            </DialogTitle>
          </div>
          
          <div className="p-6 bg-white flex flex-col items-center">
            <div className="relative aspect-square w-full max-w-[240px] overflow-hidden rounded-xl border-2 border-muted bg-muted/30 shadow-sm group">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={productName}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground/60 italic text-xs p-6 text-center gap-2">
                  <ImageIcon className="h-10 w-10 opacity-20" />
                  Sin imagen disponible
                </div>
              )}
            </div>
            
            {!imageUrl && (
              <p className="mt-4 text-[11px] text-muted-foreground font-medium bg-muted/50 px-3 py-1.5 rounded-full">
                Este producto no tiene una imagen asignada
              </p>
            )}

            <div className="flex w-full gap-3 mt-8">
              <Button 
                variant="outline" 
                onClick={() => setIsPreviewOpen(false)}
                className="flex-1 h-10 text-xs font-bold uppercase tracking-wider border-2 hover:bg-muted"
              >
                Cerrar
              </Button>
              <Link href={`/dashboard/productos/${productId}`} className="flex-1">
                <Button className="w-full h-10 text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all">
                  {imageUrl ? 'Cambiar Foto' : 'Subir Foto'}
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Button 
        variant="ghost" 
        size="icon" 
        title={isActive ? "Desactivar producto" : "Activar producto"}
        onClick={handleToggleStatus}
        disabled={isToggling}
        className="h-8 w-8 sm:h-9 sm:w-9"
      >
        {isToggling ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isActive ? (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Eye className="h-4 w-4 text-primary" />
        )}
      </Button>

      <Link href={`/dashboard/productos/${productId}`}>
        <Button 
          variant="ghost" 
          size="icon" 
          title="Editar producto"
          className="h-8 w-8 sm:h-9 sm:w-9"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </Link>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 sm:h-9 sm:w-9 text-destructive hover:text-destructive hover:bg-destructive/10" 
            title="Eliminar producto definitivamente"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar definitivamente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el producto <strong>{productName}</strong> de la base de datos de forma permanente. 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar definitivamente'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
