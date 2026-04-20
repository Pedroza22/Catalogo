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
    console.log('Creando tabla shopping_cart...')
    
    await sql`
      CREATE TABLE IF NOT EXISTS public.shopping_cart (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, product_id)
      );
    `

    console.log('Habilitando RLS...')
    await sql`ALTER TABLE public.shopping_cart ENABLE ROW LEVEL SECURITY;`

    console.log('Creando políticas RLS...')
    
    await sql`DROP POLICY IF EXISTS "shopping_cart_select_own" ON public.shopping_cart;`
    await sql`CREATE POLICY "shopping_cart_select_own" ON public.shopping_cart FOR SELECT USING (user_id = auth.uid());`
    
    await sql`DROP POLICY IF EXISTS "shopping_cart_insert_own" ON public.shopping_cart;`
    await sql`CREATE POLICY "shopping_cart_insert_own" ON public.shopping_cart FOR INSERT WITH CHECK (user_id = auth.uid());`
    
    await sql`DROP POLICY IF EXISTS "shopping_cart_update_own" ON public.shopping_cart;`
    await sql`CREATE POLICY "shopping_cart_update_own" ON public.shopping_cart FOR UPDATE USING (user_id = auth.uid());`
    
    await sql`DROP POLICY IF EXISTS "shopping_cart_delete_own" ON public.shopping_cart;`
    await sql`CREATE POLICY "shopping_cart_delete_own" ON public.shopping_cart FOR DELETE USING (user_id = auth.uid());`

    console.log('✅ Migración completada exitosamente.')
  } catch (error) {
    console.error('❌ Error ejecutando la migración:', error)
  } finally {
    await sql.end()
  }
}

runMigration()
