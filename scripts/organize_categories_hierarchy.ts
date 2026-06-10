import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('Error: DATABASE_URL no encontrada en .env.local')
  process.exit(1)
}

const sql = postgres(databaseUrl)

async function organizeCategories() {
  try {
    console.log('Organizando jerarquía de categorías...')

    // 1. Asegurar que las categorías principales existan y no tengan padre
    const mainCategories = [
      { name: 'ASEO', slug: 'aseo' },
      { name: 'DESECHABLES', slug: 'desechables' },
      { name: 'Hot Brothes', slug: 'hot-brothes' },
      { name: 'Licor', slug: 'licor' },
      { name: 'OTROS', slug: 'otros' },
      { name: 'Marcas Exclusivas Ofertas', slug: 'marcas-exclusivas-ofertas' },
      { name: 'Especial para Restaurante', slug: 'especial-para-restaurante' }
    ]

    for (const main of mainCategories) {
      await sql`
        INSERT INTO public.categories (name, slug, parent_id, is_active)
        VALUES (${main.name}, ${main.slug}, NULL, true)
        ON CONFLICT (slug) DO UPDATE 
        SET parent_id = NULL, name = EXCLUDED.name;
      `
    }

    // 2. Definir qué categorías son subcategorías y de quién
    const relationships = [
      // Subcategorías de DESECHABLES
      { sub: 'Bolsas de Papel', parentSlug: 'desechables' },
      { sub: 'Bolsas de Plástico', parentSlug: 'desechables' },
      { sub: 'Contenedores', parentSlug: 'desechables' },
      { sub: 'Cubiertos', parentSlug: 'desechables' },
      { sub: 'Otros Desechables', parentSlug: 'desechables' },
      { sub: 'Platos', parentSlug: 'desechables' },
      { sub: 'Servilletas y Toallas', parentSlug: 'desechables' },
      { sub: 'Vasos', parentSlug: 'desechables' },
      
      // Subcategorías de ASEO
      { sub: 'Limpieza y Aseo', parentSlug: 'aseo' }
    ]

    for (const rel of relationships) {
      await sql`
        UPDATE public.categories 
        SET parent_id = (SELECT id FROM public.categories WHERE slug = ${rel.parentSlug})
        WHERE name ILIKE ${rel.sub} OR slug = ${rel.sub.toLowerCase().replace(/ /g, '-')};
      `
    }

    console.log('✅ Jerarquía de categorías organizada exitosamente.')
  } catch (error) {
    console.error('❌ Error organizando categorías:', error)
  } finally {
    await sql.end()
  }
}

organizeCategories()
