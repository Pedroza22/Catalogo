import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const databaseUrl = process.env.DATABASE_URL
const sql = postgres(databaseUrl!)

async function fixRelations() {
  try {
    console.log('Iniciando migración de relaciones de categorías...')

    // 1. Obtener todos los productos que tienen category_id en la tabla products
    const productsWithCategory = await sql`
      SELECT id, category_id FROM public.products 
      WHERE category_id IS NOT NULL
    `
    console.log(`Encontrados ${productsWithCategory.length} productos con categoría directa.`)

    // 2. Insertar esas relaciones en la tabla product_categories
    let inserted = 0
    for (const p of productsWithCategory) {
      await sql`
        INSERT INTO public.product_categories (product_id, category_id)
        VALUES (${p.id}, ${p.category_id})
        ON CONFLICT DO NOTHING
      `
      inserted++
    }
    console.log(`✅ Migradas ${inserted} relaciones a product_categories.`)

    // 3. Asegurar que los licores tengan también la categoría principal 'Licor'
    console.log('Vinculando subcategorías de licores a la categoría principal Licor...')
    const licorCategory = await sql`SELECT id FROM public.categories WHERE name ILIKE 'Licor' LIMIT 1`
    
    if (licorCategory.length > 0) {
      const licorId = licorCategory[0].id
      
      // Obtener todos los productos que pertenecen a subcategorías de Licor
      const productsInSubLicor = await sql`
        SELECT pc.product_id 
        FROM public.product_categories pc
        JOIN public.categories c ON pc.category_id = c.id
        WHERE c.parent_id = ${licorId}
      `
      
      console.log(`Vinculando ${productsInSubLicor.length} productos a la categoría principal Licor...`)
      for (const p of productsInSubLicor) {
        await sql`
          INSERT INTO public.product_categories (product_id, category_id)
          VALUES (${p.product_id}, ${licorId})
          ON CONFLICT DO NOTHING
        `
      }
    }

    console.log('✅ Proceso de relación completado exitosamente.')
  } catch (e) {
    console.error('❌ Error en la migración:', e)
  } finally {
    await sql.end()
  }
}

fixRelations()
