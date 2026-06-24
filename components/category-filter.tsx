'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Category } from '@/lib/types/database'

import { ChevronRight, Filter, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory?: string
}

export function CategoryFilter({ categories, selectedCategory }: CategoryFilterProps) {
  // Inicializar con todas las categorías principales que tienen subcategorías abiertas
  const mainCategoriesWithSubs = categories
    .filter(c => !c.parent_id && categories.some(sub => sub.parent_id === c.id))
    .map(c => c.id)
  
  const [openCategories, setOpenCategories] = useState<string[]>(mainCategoriesWithSubs)

  // Sincronizar categorías abiertas con la selección actual
  useEffect(() => {
    // Si hay una subcategoría seleccionada, abrir su categoría padre
    if (selectedCategory) {
      const selectedCat = categories.find(c => c.id === selectedCategory)
      if (selectedCat?.parent_id) {
        setOpenCategories(prev => 
          prev.includes(selectedCat.parent_id!) ? prev : [...prev, selectedCat.parent_id!]
        )
      }
    }
  }, [selectedCategory, categories])

  const toggleCategory = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setOpenCategories(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const mainCategories = categories.filter(c => !c.parent_id)
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Filter className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-foreground text-lg">Filtrar por Categoría</h3>
      </div>
      
      <nav className="flex flex-wrap gap-2 lg:flex-col lg:gap-2">
        <Link
          href="/catalogo"
          className={cn(
            "px-4 py-3 rounded-xl lg:rounded-lg text-sm lg:text-base transition-all whitespace-nowrap border w-full text-left font-medium",
            !selectedCategory
              ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20"
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
            <div key={category.id} className="w-full space-y-1.5">
              <div className="flex items-center gap-1">
                <Link
                  href={`/catalogo?categoria=${category.id}`}
                  className={cn(
                    "flex-1 flex items-center justify-between px-4 py-3 rounded-xl lg:rounded-lg text-sm lg:text-base transition-all border font-medium",
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20"
                      : hasSelectedSub
                        ? "bg-primary/5 border-primary/20 text-primary"
                        : "bg-white border-muted-foreground/10 text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5"
                  )}
                >
                  <span>{category.name}</span>
                </Link>
                {subcategories.length > 0 && (
                  <button
                    onClick={(e) => toggleCategory(category.id, e)}
                    className={cn(
                      "p-3 rounded-lg border transition-all hover:bg-primary/5 cursor-pointer",
                      isExpanded ? "bg-primary/5 border-primary/20 text-primary" : "bg-white border-muted-foreground/10 text-muted-foreground"
                    )}
                  >
                    {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </button>
                )}
              </div>

              {isExpanded && subcategories.length > 0 && (
                <div className="ml-6 pl-3 border-l-3 border-primary/20 flex flex-col gap-1.5 mt-1.5 pb-2">
                  {subcategories.map(sub => (
                    <Link
                      key={sub.id}
                      href={`/catalogo?categoria=${sub.id}`}
                      className={cn(
                        "px-4 py-2.5 rounded-lg text-sm transition-all border",
                        selectedCategory === sub.id
                          ? "bg-primary/10 text-primary font-bold border-primary/20"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/5 border-transparent hover:border-primary/10"
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
