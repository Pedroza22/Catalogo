import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { HeroSection } from '@/components/hero-section'
import { PromoCarousel } from '@/components/promo-carousel'
import { FeaturedProducts } from '@/components/featured-products'
import { CategoriesSection } from '@/components/categories-section'
import { getProfile } from '@/lib/actions/auth'
import { getProducts, getCategories } from '@/lib/actions/products'
import { getBanners } from '@/lib/actions/banners'

export default async function HomePage() {
  const [profile, products, categories, banners] = await Promise.all([
    getProfile(),
    getProducts(),
    getCategories(),
    getBanners()
  ])

  const user = profile ? { email: profile.email, role: profile.role } : null

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />
      <main className="flex-1">
        <HeroSection />
        <PromoCarousel banners={banners} />
        <CategoriesSection categories={categories} />
        <FeaturedProducts products={products.slice(0, 8)} userRole={user?.role} />
      </main>
      <Footer />
    </div>
  )
}
