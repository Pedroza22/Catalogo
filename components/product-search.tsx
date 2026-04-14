'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search, X, Loader2 } from 'lucide-react'
import { useDebounce } from '@/lib/hooks/use-debounce'

interface ProductSearchProps {
  placeholder?: string
  className?: string
  paramName?: string
}

export function ProductSearch({ 
  placeholder = "Buscar productos...", 
  className = "",
  paramName = "buscar"
}: ProductSearchProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const initialValue = searchParams.get(paramName) || ''
  const [value, setValue] = useState(initialValue)
  const debouncedValue = useDebounce(value, 400)

  useEffect(() => {
    // Solo actualizar si el valor debounced es diferente al parámetro actual
    if (debouncedValue !== (searchParams.get(paramName) || '')) {
      const params = new URLSearchParams(searchParams.toString())
      if (debouncedValue) {
        params.set(paramName, debouncedValue)
      } else {
        params.delete(paramName)
      }
      
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    }
  }, [debouncedValue, pathname, router, searchParams, paramName])

  // Sincronizar estado local si el parámetro cambia externamente
  useEffect(() => {
    setValue(searchParams.get(paramName) || '')
  }, [searchParams, paramName])

  const handleClear = () => {
    setValue('')
  }

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          type="button"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  )
}
