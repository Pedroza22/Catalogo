import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const databaseUrl = process.env.DATABASE_URL
const sql = postgres(databaseUrl!)

async function cleanupDuplicates() {
  try {
    console.log('Iniciando limpieza de productos duplicados...')

    // 1. Identificar productos duplicados por SKU
    // Priorizamos los que tienen relaciones en product_categories
    const duplicates = await sql`
      WITH product_stats AS (
        SELECT 
          sku, 
          id,
          (SELECT count(*) FROM public.product_categories WHERE product_id = p.id) as category_count,
          created_at
        FROM public.products p
        WHERE sku IS NOT NULL AND sku != '' AND sku IN (
          SELECT sku FROM public.products WHERE sku IS NOT NULL AND sku != '' GROUP BY sku HAVING count(*) > 1
        )
      )
      SELECT * FROM product_stats ORDER BY sku, category_count DESC, created_at DESC
    `

    console.log(`Se encontraron ${duplicates.length} entradas con SKUs duplicados.`)

    const toDelete = []
    const processedSkus = new Set()

    for (const p of duplicates) {
      if (!processedSkus.has(p.sku)) {
        // El primero de cada SKU es el que mantenemos (el que tiene más categorías o el más reciente)
        processedSkus.add(p.sku)
        console.log(`Manteniendo producto SKU: ${p.sku} (ID: ${p.id}, Categorías: ${p.category_count})`)
      } else {
        // Los demás se eliminan
        toDelete.push(p.id)
      }
    }

    // 1.1 También limpiar productos sin SKU que tengan nombres duplicados (opcional pero recomendado)
    const nameDuplicates = await sql`
      WITH name_stats AS (
        SELECT 
          name, 
          id,
          (SELECT count(*) FROM public.product_categories WHERE product_id = p.id) as category_count,
          created_at
        FROM public.products p
        WHERE (sku IS NULL OR sku = '') AND name IN (
          SELECT name FROM public.products GROUP BY name HAVING count(*) > 1
        )
      )
      SELECT * FROM name_stats ORDER BY name, category_count DESC, created_at DESC
    `
    
    if (nameDuplicates.length > 0) {
      console.log(`Se encontraron ${nameDuplicates.length} productos sin SKU con nombres duplicados.`)
      const processedNames = new Set()
      for (const p of nameDuplicates) {
        if (!processedNames.has(p.name)) {
          processedNames.add(p.name)
        } else {
          toDelete.push(p.id)
        }
      }
    }

    if (toDelete.length > 0) {
      console.log(`Eliminando un total de ${toDelete.length} productos duplicados...`)
      
      // Eliminar en lotes para evitar problemas de parámetros
      const batchSize = 100
      for (let i = 0; i < toDelete.length; i += batchSize) {
        const batch = toDelete.slice(i, i + batchSize)
        await sql`DELETE FROM public.product_categories WHERE product_id IN ${sql(batch)}`
        await sql`DELETE FROM public.products WHERE id IN ${sql(batch)}`
      }
      
      console.log('✅ Limpieza de duplicados completada.')
    } else {
      console.log('No se encontraron duplicados para eliminar.')
    }

    // 2. Aplicar restricción de unicidad para el futuro
    console.log('Aplicando restricción de unicidad UNIQUE(sku) en la base de datos...')
    
    // Primero, para productos que no tienen SKU, asignarles uno temporal o eliminarlos
    // El usuario dijo "elimina los que no tenga categoria", pero también es vital que tengan SKU para el UNIQUE
    
    // Eliminar productos que no tengan SKU Y no tengan categoría (limpieza profunda)
    const deepClean = await sql`
      DELETE FROM public.products 
      WHERE (sku IS NULL OR sku = '') 
      AND id NOT IN (SELECT product_id FROM public.product_categories)
    `
    console.log(`Eliminados productos sin SKU y sin categoría.`)

    // Si aún quedan duplicados de SKU (por ejemplo si el script falló a mitad), el ALTER TABLE fallará.
    // Asegurémonos de que el SKU sea realmente único antes de aplicar el constraint.
    
    try {
      // Intentar añadir el constraint UNIQUE
      // Usamos un nombre específico para poder identificarlo
      await sql`ALTER TABLE public.products ADD CONSTRAINT products_sku_unique UNIQUE (sku)`
      console.log('✅ Restricción UNIQUE(sku) aplicada con éxito.')
    } catch (err: any) {
      if (err.code === '42P16' || err.message.includes('already exists')) {
        console.log('ℹ️ La restricción UNIQUE(sku) ya existe o hay un conflicto de nombre.')
      } else if (err.code === '23505') {
        console.error('❌ Todavía existen duplicados de SKU. No se pudo aplicar UNIQUE.')
      } else {
        console.error('❌ Error al aplicar restricción:', err.message)
      }
    }

  } catch (e) {
    console.error('❌ Error durante la limpieza:', e)
  } finally {
    await sql.end()
  }
}

cleanupDuplicates()
