import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('Error: DATABASE_URL no encontrada en .env.local')
  process.exit(1)
}

const sql = postgres(databaseUrl)

const subcategories = [
  { name: 'Vasos', slug: 'vasos', description: 'Vasos desechables de diferentes materiales y tamaños' },
  { name: 'Platos', slug: 'platos', description: 'Platos y bandejas desechables' },
  { name: 'Cubiertos', slug: 'cubiertos', description: 'Cucharas, tenedores y cuchillos' },
  { name: 'Bolsas de Papel', slug: 'bolsas-papel', description: 'Bolsas y empaques de papel' },
  { name: 'Bolsas de Plástico', slug: 'bolsas-plastico', description: 'Bolsas de basura y de acarreo' },
  { name: 'Contenedores', slug: 'contenedores', description: 'Contenedores y recipientes para alimentos' },
  { name: 'Servilletas y Toallas', slug: 'servilletas-toallas', description: 'Servilletas, toallas de manos y papel higiénico' },
  { name: 'Limpieza y Aseo', slug: 'limpieza-aseo', description: 'Escobas, traperos, esponjas y químicos' },
  { name: 'Otros Desechables', slug: 'otros-desechables', description: 'Pitillos, mezcladores y otros accesorios' }
]

async function runMigration() {
  try {
    console.log('Insertando nuevas subcategorías...')
    
    for (const sub of subcategories) {
      await sql`
        INSERT INTO public.categories (name, slug, description)
        VALUES (${sub.name}, ${sub.slug}, ${sub.description})
        ON CONFLICT (slug) DO UPDATE 
        SET name = EXCLUDED.name, description = EXCLUDED.description;
      `
    }

    console.log('Asignando subcategorías a productos basados en su nombre...')

    const mappings = [
      { pattern: '%vaso%', catSlug: 'vasos' },
      { pattern: '%copa%', catSlug: 'vasos' },
      { pattern: '%plato%', catSlug: 'platos' },
      { pattern: '%bandeja%', catSlug: 'platos' },
      { pattern: '%cuchara%', catSlug: 'cubiertos' },
      { pattern: '%tenedor%', catSlug: 'cubiertos' },
      { pattern: '%cuchillo%', catSlug: 'cubiertos' },
      { pattern: '%bolsa%papel%', catSlug: 'bolsas-papel' },
      { pattern: '%bolsa%basura%', catSlug: 'bolsas-plastico' },
      { pattern: '%bolsa%manicure%', catSlug: 'bolsas-plastico' },
      { pattern: '%bolsa%pedicure%', catSlug: 'bolsas-plastico' },
      { pattern: '%contenedor%', catSlug: 'contenedores' },
      { pattern: '%copa%salsera%', catSlug: 'contenedores' },
      { pattern: '%copa%soufle%', catSlug: 'contenedores' },
      { pattern: '%servilleta%', catSlug: 'servilletas-toallas' },
      { pattern: '%toalla%', catSlug: 'servilletas-toallas' },
      { pattern: '%papel%higienico%', catSlug: 'servilletas-toallas' },
      { pattern: '%escoba%', catSlug: 'limpieza-aseo' },
      { pattern: '%esponja%', catSlug: 'limpieza-aseo' },
      { pattern: '%limpia%piso%', catSlug: 'limpieza-aseo' },
      { pattern: '%desengrasante%', catSlug: 'limpieza-aseo' },
      { pattern: '%pitillo%', catSlug: 'otros-desechables' },
      { pattern: '%vinipel%', catSlug: 'otros-desechables' }
    ]

    for (const mapping of mappings) {
      await sql`
        INSERT INTO public.product_categories (product_id, category_id)
        SELECT p.id, c.id
        FROM public.products p
        JOIN public.categories c ON c.slug = ${mapping.catSlug}
        WHERE p.name ILIKE ${mapping.pattern}
        ON CONFLICT DO NOTHING;
      `
    }

    console.log('✅ Migración de subcategorías completada exitosamente.')
  } catch (error) {
    console.error('❌ Error ejecutando la migración:', error)
  } finally {
    await sql.end()
  }
}

runMigration()
