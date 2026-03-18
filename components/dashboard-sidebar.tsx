'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  CreditCard,
  Tags,
  LogOut,
  Home,
  Menu,
} from 'lucide-react'
import type { Profile } from '@/lib/types/database'

interface DashboardSidebarProps {
  profile: Profile
}

const adminLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/productos', label: 'Productos', icon: Package },
  { href: '/dashboard/categorias', label: 'Categorías', icon: Tags },
  { href: '/dashboard/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { href: '/dashboard/clientes', label: 'Clientes', icon: Users },
  { href: '/dashboard/inventario', label: 'Inventario', icon: Warehouse },
  { href: '/dashboard/creditos', label: 'Créditos', icon: CreditCard },
]

const warehouseLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { href: '/dashboard/inventario', label: 'Inventario', icon: Warehouse },
]

function SidebarContent({ profile, onLinkClick }: { profile: Profile; onLinkClick?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const links = profile.role === 'admin' ? adminLinks : warehouseLinks

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3" onClick={onLinkClick}>
          <Image
            src="/images/logo.jpeg"
            alt="AS DE NARIÑO"
            width={40}
            height={40}
            className="rounded"
          />
          <div>
            <p className="font-bold text-sm leading-none">AS DE NARIÑO</p>
            <p className="text-xs text-sidebar-foreground/70">Panel de Control</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        <div className="px-3 py-2">
          <p className="text-sm font-medium truncate">{profile.full_name || profile.email}</p>
          <p className="text-xs text-sidebar-foreground/70 capitalize">{profile.role}</p>
        </div>
        <Link href="/" onClick={onLinkClick}>
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent">
            <Home className="mr-2 h-4 w-4" />
            Ir al sitio
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </>
  )
}

export function DashboardSidebar({ profile }: DashboardSidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar text-sidebar-foreground border-b border-sidebar-border">
        <div className="flex items-center justify-between p-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logo.jpeg"
              alt="AS DE NARIÑO"
              width={32}
              height={32}
              className="rounded"
            />
            <span className="font-bold text-sm">AS DE NARIÑO</span>
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-sidebar-foreground">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar text-sidebar-foreground border-sidebar-border">
              <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
              <div className="flex flex-col h-full">
                <SidebarContent profile={profile} onLinkClick={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex-col fixed inset-y-0 left-0">
        <SidebarContent profile={profile} />
      </aside>
    </>
  )
}
