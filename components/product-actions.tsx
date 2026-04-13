'use client'

import { useState } from 'react'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
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
import { deleteProduct } from '@/lib/actions/products'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ProductActionsProps {
  productId: string
  productName: string
}

export function ProductActions({ productId, productName }: ProductActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const result = await deleteProduct(productId)
      
      if (result.success) {
        toast.success(`Producto "${productName}" eliminado correctamente`)
        router.refresh()
      } else {
        toast.error(result.error || 'Error al eliminar el producto')
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
      <Link href={`/dashboard/productos/${productId}`}>
        <Button variant="ghost" size="icon" title="Editar producto">
          <Pencil className="h-4 w-4" />
        </Button>
      </Link>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" title="Eliminar producto">
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desactivará el producto <strong>{productName}</strong>. 
              No aparecerá más en el catálogo público pero se conservará en el historial.
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
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
