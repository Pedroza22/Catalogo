import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Layers, ChevronRight } from 'lucide-react'
import type { Category } from '@/lib/types/database'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CategoriesSectionProps {
  categories: Category[]
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (categories.length === 0) {
    return (
      <section className="py-10 sm:py-16 bg-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-6 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Categorías</h2>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Explora nuestras categorías de productos</p>
          </div>
          <div className="text-center py-8 sm:py-12">
            <Layers className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-sm sm:text-base">Próximamente agregaremos categorías</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Categorías</h2>
          <p className="text-muted-foreground mt-2 sm:mt-3 text-base sm:text-lg">Explora nuestras categorías de productos</p>
        </div>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {categories.map((category) => (
            <div key={category.id} className="relative group">
              {category.subcategories && category.subcategories.length > 0 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-muted/60 rounded-xl bg-card text-card-foreground flex flex-col gap-0 h-full p-0 w-full">
                      <div className="p-3 sm:p-5 text-center flex flex-col h-full w-full">
                        <div className="relative w-full aspect-square mb-3 sm:mb-4 rounded-xl overflow-hidden bg-muted/30 flex-shrink-0">
                          {category.image_url ? (
                            <Image
                              src={category.image_url}
                              alt={category.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Layers className="h-10 w-10 sm:h-16 sm:w-16 text-muted-foreground/30 transition-transform duration-500 group-hover:scale-110 group-hover:text-primary/50" />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow flex items-center justify-center gap-1">
                          <h3 className="font-bold text-foreground text-sm sm:text-base md:text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">{category.name}</h3>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-transform group-data-[state=open]:rotate-90" />
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-56">
                    <Link href={`/catalogo?categoria=${category.id}`}>
                      <DropdownMenuItem className="font-bold">
                        Ver todo en {category.name}
                      </DropdownMenuItem>
                    </Link>
                    {category.subcategories.map((sub) => (
                      <Link key={sub.id} href={`/catalogo?categoria=${sub.id}`}>
                        <DropdownMenuItem>
                          {sub.name}
                        </DropdownMenuItem>
                      </Link>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href={`/catalogo?categoria=${category.id}`}>
                  <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-muted/60 h-full">
                    <CardContent className="p-3 sm:p-5 text-center flex flex-col h-full">
                      <div className="relative w-full aspect-square mb-3 sm:mb-4 rounded-xl overflow-hidden bg-muted/30 flex-shrink-0">
                        {category.image_url ? (
                          <Image
                            src={category.image_url}
                            alt={category.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Layers className="h-10 w-10 sm:h-16 sm:w-16 text-muted-foreground/30 transition-transform duration-500 group-hover:scale-110 group-hover:text-primary/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow flex items-center justify-center">
                        <h3 className="font-bold text-foreground text-sm sm:text-base md:text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">{category.name}</h3>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
