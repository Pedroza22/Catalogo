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
    console.log('Limpiando duplicados existentes en shopping_cart...')
    // Eliminar duplicados manteniendo solo el registro más reciente
    await sql`
      DELETE FROM public.shopping_cart a
      USING public.shopping_cart b
      WHERE a.id < b.id
        AND a.user_id = b.user_id
        AND a.product_id = b.product_id
        AND (a.selected_color = b.selected_color OR (a.selected_color IS NULL AND b.selected_color IS NULL));
    `

    console.log('Actualizando restricción UNIQUE para manejar NULLs correctamente...')
    await sql`
      ALTER TABLE public.shopping_cart 
      DROP CONSTRAINT IF EXISTS shopping_cart_user_id_product_id_color_key;
    `

    // Intentamos usar NULLS NOT DISTINCT (disponible en Postgres 15+)
    // Si falla, usamos un método alternativo con índices parciales
    try {
      await sql`
        ALTER TABLE public.shopping_cart 
        ADD CONSTRAINT shopping_cart_user_id_product_id_color_key 
        UNIQUE NULLS NOT DISTINCT (user_id, product_id, selected_color);
      `
      console.log('✅ Restricción NULLS NOT DISTINCT aplicada.')
    } catch (e) {
      console.log('Postgres version < 15, usando índices parciales...')
      await sql`
        CREATE UNIQUE INDEX IF NOT EXISTS shopping_cart_user_id_product_id_color_null_idx 
        ON public.shopping_cart (user_id, product_id) 
        WHERE selected_color IS NULL;
      `
      await sql`
        CREATE UNIQUE INDEX IF NOT EXISTS shopping_cart_user_id_product_id_color_not_null_idx 
        ON public.shopping_cart (user_id, product_id, selected_color) 
        WHERE selected_color IS NOT NULL;
      `
      console.log('✅ Índices parciales aplicados.')
    }

    console.log('✅ Migración de unicidad completada.')
  } catch (error) {
    console.error('❌ Error ejecutando la migración:', error)
  } finally {
    await sql.end()
  }
}

runMigration()
