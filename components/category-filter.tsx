'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Category } from '@/lib/types/database'

import { ChevronRight, Filter, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory?: string
}

export function CategoryFilter({ categories, selectedCategory }: CategoryFilterProps) {
  const searchParams = useSearchParams()
  const [openCategories, setOpenCategories] = useState<string[]>([])

  // Sincronizar categorías abiertas con la selección actual
  useEffect(() => {
    // Mantener siempre abiertas las categorías principales que tengan subcategorías
    const mainWithSubs = categories
      .filter(c => !c.parent_id && categories.some(sub => sub.parent_id === c.id))
      .map(c => c.id)
    
    setOpenCategories(mainWithSubs)
  }, [categories])

  const toggleCategory = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // No hacer nada si ya está en el estado de "siempre abierta" o permitir cerrar si el usuario quiere
    setOpenCategories(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const mainCategories = categories.filter(c => !c.parent_id)
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Filter className="h-4 w-4 text-primary" />
        <h3 className="font-bold text-foreground text-sm lg:text-base">Filtrar por Categoría</h3>
      </div>
      
      <nav className="flex flex-wrap gap-2 lg:flex-col lg:gap-1.5">
        <Link
          href="/catalogo"
          className={cn(
            "px-3 py-2 rounded-xl lg:rounded-lg text-xs lg:text-sm transition-all whitespace-nowrap border w-full text-left",
            !selectedCategory
              ? "bg-primary border-primary text-primary-foreground font-bold shadow-md shadow-primary/20"
              : "bg-white border-muted-foreground/10 text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5"
          )}
        >
          Todas las categorías
        </Link>

        {mainCategories.map((category) => {
          const isSelected = selectedCategory === category.id
          const hasSelectedSub = categories.some(sub => sub.parent_id === category.id && sub.id === selectedCategory)
          const subcategories = categories.filter(sub => sub.parent_id === category.id)
          const isExpanded = openCategories.includes(category.id)

          return (
            <div key={category.id} className="w-full space-y-1">
              <div className="flex items-center gap-1">
                <Link
                  href={`/catalogo?categoria=${category.id}`}
                  className={cn(
                    "flex-1 flex items-center justify-between px-3 py-2 rounded-xl lg:rounded-lg text-xs lg:text-sm transition-all border",
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground font-bold shadow-md shadow-primary/20"
                      : hasSelectedSub
                        ? "bg-primary/5 border-primary/20 text-primary font-bold"
                        : "bg-white border-muted-foreground/10 text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5"
                  )}
                >
                  <span>{category.name}</span>
                </Link>
                {subcategories.length > 0 && (
                  <button
                    onClick={(e) => toggleCategory(category.id, e)}
                    className={cn(
                      "p-2 rounded-lg border transition-all hover:bg-primary/5",
                      isExpanded ? "bg-primary/5 border-primary/20 text-primary" : "bg-white border-muted-foreground/10 text-muted-foreground"
                    )}
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                )}
              </div>

              {isExpanded && subcategories.length > 0 && (
                <div className="ml-4 pl-2 border-l-2 border-primary/10 flex flex-col gap-1 mt-1 pb-2 animate-in slide-in-from-top-2 duration-200">
                  {subcategories.map(sub => (
                    <Link
                      key={sub.id}
                      href={`/catalogo?categoria=${sub.id}`}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs transition-all",
                        selectedCategory === sub.id
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                      )}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}
