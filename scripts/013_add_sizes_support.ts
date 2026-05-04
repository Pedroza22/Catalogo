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
    console.log('Añadiendo columna sizes a products...')
    await sql`
      ALTER TABLE public.products 
      ADD COLUMN IF NOT EXISTS sizes TEXT[] DEFAULT '{}';
    `

    console.log('Añadiendo columna selected_size a shopping_cart...')
    await sql`
      ALTER TABLE public.shopping_cart 
      ADD COLUMN IF NOT EXISTS selected_size TEXT;
    `

    console.log('Actualizando restricción UNIQUE en shopping_cart para incluir tallas...')
    // Eliminamos la restricción anterior que incluía colores
    await sql`
      ALTER TABLE public.shopping_cart 
      DROP CONSTRAINT IF EXISTS shopping_cart_user_id_product_id_color_key;
    `
    
    // Intentamos aplicar la nueva restricción que incluye color y talla
    try {
      await sql`
        ALTER TABLE public.shopping_cart 
        ADD CONSTRAINT shopping_cart_user_id_product_id_variant_key 
        UNIQUE NULLS NOT DISTINCT (user_id, product_id, selected_color, selected_size);
      `
      console.log('✅ Restricción UNIQUE con NULLS NOT DISTINCT aplicada.')
    } catch (e) {
      console.log('Postgres version < 15, eliminando índices antiguos y creando nuevos para variantes...')
      // Limpieza de índices previos si existen
      await sql`DROP INDEX IF EXISTS shopping_cart_user_id_product_id_color_null_idx;`
      await sql`DROP INDEX IF EXISTS shopping_cart_user_id_product_id_color_not_null_idx;`
      
      // Creamos un índice único que cubra todas las combinaciones posibles de NULL en color/talla
      // Para simplicidad en versiones antiguas, usamos una función de coalesce
      await sql`
        CREATE UNIQUE INDEX IF NOT EXISTS shopping_cart_variants_idx 
        ON public.shopping_cart (user_id, product_id, COALESCE(selected_color, ''), COALESCE(selected_size, ''));
      `
      console.log('✅ Índice de variantes aplicado.')
    }

    console.log('Añadiendo columna selected_size a order_items...')
    await sql`
      ALTER TABLE public.order_items 
      ADD COLUMN IF NOT EXISTS selected_size TEXT;
    `

    console.log('✅ Migración de tallas completada exitosamente.')
  } catch (error) {
    console.error('❌ Error ejecutando la migración:', error)
  } finally {
    await sql.end()
  }
}

runMigration()
