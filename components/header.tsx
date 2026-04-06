'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ShoppingCart, User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/lib/hooks/use-cart'

interface HeaderProps {
  user?: {
    email: string
    role?: string
  } | null
}

export function Header({ user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { items } = useCart()
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo.jpeg"
            alt="AS DE NARIÑO"
            width={48}
            height={48}
            className="rounded"
          />
          <div className="hidden sm:block">
            <p className="font-bold text-foreground leading-none">AS DE NARIÑO</p>
            <p className="text-xs text-muted-foreground">Comercializadora</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/catalogo" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Catálogo
          </Link>
          {user ? (
            <>
              <Link href="/mis-pedidos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Mis Pedidos
              </Link>
              {(user.role === 'admin' || user.role === 'bodeguero') && (
                <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Panel
                </Link>
              )}
            </>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/carrito">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>

          {user ? (
            <Link href="/perfil">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link href="/auth/login">
              <Button variant="default" size="sm">
                Iniciar Sesión
              </Button>
            </Link>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col gap-2">
            <Link 
              href="/catalogo" 
              className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Catálogo
            </Link>
            {user && (
              <>
                <Link 
                  href="/mis-pedidos" 
                  className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mis Pedidos
                </Link>
                {(user.role === 'admin' || user.role === 'bodeguero') && (
                  <Link 
                    href="/dashboard" 
                    className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Panel de Administración
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
