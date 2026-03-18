import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, Truck, CreditCard, Shield } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-secondary to-secondary/90">
      <div className="container px-4 sm:px-6 py-10 sm:py-16 md:py-24">
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 md:gap-12 items-center">
          <div className="space-y-4 sm:space-y-6 text-center md:text-left">
            <div className="inline-block rounded-full bg-primary/10 px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-primary">
              Tu aliado comercial en Nariño
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-secondary-foreground text-balance">
              Productos de calidad al mejor precio
            </h1>
            <p className="text-base sm:text-lg text-secondary-foreground/80 max-w-lg mx-auto md:mx-0 text-pretty">
              Somos tu comercializadora de confianza. Encuentra todo lo que necesitas para tu negocio con precios competitivos y entrega rápida.
            </p>
            <div className="flex flex-col xs:flex-row flex-wrap gap-3 sm:gap-4 justify-center md:justify-start">
              <Link href="/catalogo" className="w-full xs:w-auto">
                <Button size="lg" className="font-semibold w-full xs:w-auto">
                  Ver Catálogo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/registro" className="w-full xs:w-auto">
                <Button size="lg" variant="outline" className="font-semibold w-full xs:w-auto bg-secondary-foreground/10 border-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground/20">
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative flex justify-center order-first md:order-last">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80">
              <Image
                src="/images/logo.jpeg"
                alt="AS DE NARIÑO"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-10 sm:mt-16 grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-3">
          <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl bg-secondary-foreground/5">
            <div className="p-2 sm:p-3 rounded-lg bg-primary/10">
              <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-foreground text-sm sm:text-base">Entrega Rápida</h3>
              <p className="text-xs sm:text-sm text-secondary-foreground/70">Recibe tus pedidos en tiempo récord</p>
            </div>
          </div>
          <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl bg-secondary-foreground/5">
            <div className="p-2 sm:p-3 rounded-lg bg-primary/10">
              <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-foreground text-sm sm:text-base">Crédito Disponible</h3>
              <p className="text-xs sm:text-sm text-secondary-foreground/70">Opciones de pago flexibles para tu negocio</p>
            </div>
          </div>
          <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl bg-secondary-foreground/5">
            <div className="p-2 sm:p-3 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-foreground text-sm sm:text-base">Productos Garantizados</h3>
              <p className="text-xs sm:text-sm text-secondary-foreground/70">Calidad asegurada en cada compra</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
