'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Category } from '@/lib/types/database'

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory?: string
}

export function CategoryFilter({ categories, selectedCategory }: CategoryFilterProps) {
  const searchParams = useSearchParams()

  return (
    <div className="space-y-3 lg:space-y-4">
      <h3 className="font-semibold text-foreground text-sm lg:text-base">Categorías</h3>
      <nav className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
        <Link
          href="/catalogo"
          className={cn(
            "px-3 py-1.5 lg:py-2 rounded-full lg:rounded-md text-xs lg:text-sm transition-colors whitespace-nowrap",
            !selectedCategory
              ? "bg-primary text-primary-foreground font-medium"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground lg:bg-transparent"
          )}
        >
          Todas
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/catalogo?categoria=${category.id}`}
            className={cn(
              "px-3 py-1.5 lg:py-2 rounded-full lg:rounded-md text-xs lg:text-sm transition-colors whitespace-nowrap",
              selectedCategory === category.id
                ? "bg-primary text-primary-foreground font-medium"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground lg:bg-transparent"
            )}
          >
            {category.name}
          </Link>
        ))}
      </nav>
    </div>
  )
}
