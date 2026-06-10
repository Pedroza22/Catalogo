import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const databaseUrl = process.env.DATABASE_URL
const sql = postgres(databaseUrl!)

async function checkDb() {
  try {
    const productsCount = await sql`SELECT count(*) FROM public.products`
    console.log('Total productos en DB:', productsCount[0].count)

    const categories = await sql`SELECT name, id, parent_id FROM public.categories`
    console.log('Categorías encontradas:', categories.length)
    categories.forEach(c => {
      console.log(`- ${c.name} (Parent: ${c.parent_id || 'NULL'})`)
    })

    const sampleProducts = await sql`SELECT name, is_active, category_id FROM public.products LIMIT 5`
    console.log('Muestra de productos:', sampleProducts)

  } catch (e) {
    console.error(e)
  } finally {
    await sql.end()
  }
}

checkDb()
