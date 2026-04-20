import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartContent } from '@/components/cart-content'
import { getProfile } from '@/lib/actions/auth'

export default async function CarritoPage() {
  const profile = await getProfile()
  const user = profile ? { email: profile.email, role: profile.role } : null

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />
      <main className="flex-1">
        <section className="py-8 bg-muted/30 border-b">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6">
            <h1 className="text-3xl font-bold text-foreground">Carrito de Compras</h1>
            <p className="text-muted-foreground mt-2">
              Revisa y confirma tu pedido
            </p>
          </div>
        </section>
        <CartContent user={user} creditLimit={profile?.credit_limit || 0} currentCredit={profile?.credit_used || 0} />
      </main>
      <Footer />
    </div>
  )
}
