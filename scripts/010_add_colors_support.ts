import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('Error: DATABASE_URL no encontrada en .env.local')
  process.exit(1)
}

const sql = postgres(databaseUrl)

async function runMigration() {
  try {
    console.log('Añadiendo columna colors a products...')
    await sql`
      ALTER TABLE public.products 
      ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT '{}';
    `

    console.log('Añadiendo columna selected_color a shopping_cart...')
    await sql`
      ALTER TABLE public.shopping_cart 
      ADD COLUMN IF NOT EXISTS selected_color TEXT;
    `

    console.log('Actualizando restricción UNIQUE en shopping_cart...')
    // Primero eliminamos la restricción antigua si existe
    await sql`
      ALTER TABLE public.shopping_cart 
      DROP CONSTRAINT IF EXISTS shopping_cart_user_id_product_id_key;
    `
    // Añadimos la nueva que incluye el color
    await sql`
      ALTER TABLE public.shopping_cart 
      ADD CONSTRAINT shopping_cart_user_id_product_id_color_key 
      UNIQUE(user_id, product_id, selected_color);
    `

    console.log('Añadiendo columna selected_color a order_items...')
    await sql`
      ALTER TABLE public.order_items 
      ADD COLUMN IF NOT EXISTS selected_color TEXT;
    `

    console.log('✅ Migración de colores completada exitosamente.')
  } catch (error) {
    console.error('❌ Error ejecutando la migración:', error)
  } finally {
    await sql.end()
  }
}

runMigration()
