'use client'

import { useState } from 'react'
import { Pencil, Trash2, Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
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
import { hardDeleteProduct, toggleProductStatus } from '@/lib/actions/products'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ProductActionsProps {
  productId: string
  productName: string
  isActive: boolean
}

export function ProductActions({ productId, productName, isActive }: ProductActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
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
    <div className="flex items-center justify-end gap-2">
      <Button 
        variant="ghost" 
        size="icon" 
        title={isActive ? "Desactivar producto" : "Activar producto"}
        onClick={handleToggleStatus}
        disabled={isToggling}
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
        <Button variant="ghost" size="icon" title="Editar producto">
          <Pencil className="h-4 w-4" />
        </Button>
      </Link>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" title="Eliminar producto definitivamente">
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
