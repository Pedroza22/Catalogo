import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { HeroSection } from '@/components/hero-section'
import { FeaturedProducts } from '@/components/featured-products'
import { CategoriesSection } from '@/components/categories-section'
import { getProfile } from '@/lib/actions/auth'
import { getProducts, getCategories } from '@/lib/actions/products'

export default async function HomePage() {
  const [profile, products, categories] = await Promise.all([
    getProfile(),
    getProducts(),
    getCategories()
  ])

  const user = profile ? { email: profile.email, role: profile.role } : null

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />
      <main className="flex-1">
        <HeroSection />
        <CategoriesSection categories={categories} />
        <FeaturedProducts products={products.slice(0, 8)} userRole={user?.role} />
      </main>
      <Footer />
    </div>
  )
}
