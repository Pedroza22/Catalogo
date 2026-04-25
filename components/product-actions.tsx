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
        <DialogContent className="sm:max-w-[350px] p-4">
          <DialogHeader>
            <DialogTitle className="truncate pr-6 text-base">{productName}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-lg border bg-muted shadow-inner">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={productName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground italic text-xs p-4 text-center">
                  Sin imagen disponible
                </div>
              )}
            </div>
            {!imageUrl && (
              <p className="mt-3 text-[11px] text-muted-foreground text-center leading-tight">
                Este producto no tiene una imagen asignada.
              </p>
            )}
          </div>
          <DialogFooter className="flex flex-row gap-2 mt-2">
            <Button 
              variant="outline" 
              onClick={() => setIsPreviewOpen(false)}
              className="flex-1 h-8 text-xs"
            >
              Cerrar
            </Button>
            <Link href={`/dashboard/productos/${productId}`} className="flex-1">
              <Button className="w-full h-8 text-xs px-2">
                {imageUrl ? 'Cambiar' : 'Agregar'}
              </Button>
            </Link>
          </DialogFooter>
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
