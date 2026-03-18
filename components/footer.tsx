import Image from 'next/image'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-secondary text-secondary-foreground">
      <div className="container py-8 sm:py-12 px-4 sm:px-6">
        <div className="grid gap-8 grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-4 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.jpeg"
                alt="AS DE NARIÑO"
                width={40}
                height={40}
                className="rounded w-10 h-10 sm:w-12 sm:h-12"
              />
              <div>
                <p className="font-bold leading-none text-sm sm:text-base">AS DE NARIÑO</p>
                <p className="text-xs text-secondary-foreground/70">Comercializadora</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-secondary-foreground/70">
              Tu aliado comercial en Nariño. Productos de calidad al mejor precio.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/catalogo" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/mis-pedidos" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">
                  Mis Pedidos
                </Link>
              </li>
              <li>
                <Link href="/carrito" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">
                  Carrito
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Mi Cuenta</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/auth/login" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link href="/auth/registro" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">
                  Registrarse
                </Link>
              </li>
              <li>
                <Link href="/perfil" className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors">
                  Mi Perfil
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/70">
              <li>Nariño, Colombia</li>
              <li>contacto@asdenarino.com</li>
              <li>+57 300 000 0000</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-secondary-foreground/10 text-center text-sm text-secondary-foreground/70">
          <p>&copy; {new Date().getFullYear()} AS DE NARIÑO Comercializadora. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
