'use client'

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { Tag, Sparkles, Percent } from "lucide-react"

const promos = [
  {
    id: 1,
    title: "¡Gran Promoción en Aseo!",
    subtitle: "Hasta 20% de descuento en productos seleccionados.",
    icon: Sparkles,
    color: "from-blue-600 to-cyan-500",
  },
  {
    id: 2,
    title: "Nuevos Productos",
    subtitle: "Descubre la nueva línea de contenedores y empaques.",
    icon: Tag,
    color: "from-primary to-primary/70",
  },
  {
    id: 3,
    title: "Ofertas Exclusivas",
    subtitle: "Aprovecha precios especiales para compras al por mayor.",
    icon: Percent,
    color: "from-orange-500 to-yellow-400",
  },
]

export function PromoCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  )

  return (
    <section className="pt-10 sm:pt-16 pb-4 sm:pb-8 bg-white">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <Carousel
          plugins={[plugin.current]}
          className="w-full"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          opts={{
            loop: true,
          }}
        >
          <CarouselContent>
            {promos.map((promo) => (
              <CarouselItem key={promo.id}>
                <div className="p-1">
                  <Card className="border-0 overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm">
                    <CardContent className={`flex items-center justify-center p-8 sm:p-12 md:p-16 bg-gradient-to-r ${promo.color} text-white min-h-[180px] sm:min-h-[220px] md:min-h-[280px] relative overflow-hidden`}>
                      {/* Decorative background elements */}
                      <div className="absolute top-0 right-0 -mt-8 -mr-8 sm:-mt-12 sm:-mr-12 opacity-10">
                        <promo.icon className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80" />
                      </div>
                      
                      <div className="relative z-10 text-center max-w-2xl mx-auto space-y-3 sm:space-y-4">
                        <div className="inline-flex items-center justify-center p-2 bg-white/20 rounded-full mb-2 backdrop-blur-sm">
                          <promo.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance leading-tight">
                          {promo.title}
                        </h2>
                        <p className="text-sm sm:text-base md:text-lg text-white/90 text-balance font-medium">
                          {promo.subtitle}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden sm:block">
            <CarouselPrevious className="left-4 bg-white/50 hover:bg-white border-0 text-foreground" />
            <CarouselNext className="right-4 bg-white/50 hover:bg-white border-0 text-foreground" />
          </div>
        </Carousel>
      </div>
    </section>
  )
}
