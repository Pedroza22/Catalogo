import postgres from 'postgres'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('Error: DATABASE_URL no encontrada en .env.local')
  process.exit(1)
}

const sql = postgres(databaseUrl)

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function processSqlFile() {
  try {
    console.log('Leyendo el archivo SQL original...')
    const filePath = path.join(process.cwd(), 'scripts', 'INSERTSQLInventarioLicoresBebidas.sql')
    console.log(`Ruta absoluta: ${filePath}`)
    
    if (!fs.existsSync(filePath)) {
      console.error('El archivo no existe en la ruta especificada.')
      return
    }

    const buffer = fs.readFileSync(filePath)
    console.log(`Tamaño del buffer: ${buffer.length} bytes`)
    
    let content = ''
    if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
      console.log('Codificación detectada: UTF-16LE')
      content = buffer.toString('utf16le')
    } else if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
      console.log('Codificación detectada: UTF-8 con BOM')
      content = buffer.toString('utf8')
    } else {
      console.log('Asumiendo codificación: UTF-8 o similar')
      content = buffer.toString('utf8')
    }

    if (content.length < 10) {
      console.warn('El contenido leído es muy corto. Primeros bytes:', buffer.slice(0, 20))
    }

    // Extraer las líneas de valores del INSERT
    const lines = content.split(/\r?\n/)
    // Usar regex para detectar líneas que contienen el patrón ('sku', 'nombre', ...
    const valueLines = lines.filter(line => /^\s*\(\s*'[^']*'\s*,\s*'[^']*'/.test(line))
    
    if (valueLines.length === 0) {
      console.log('Intentando leer archivo sin BOM o con otra codificación...')
      const altContent = fs.readFileSync(filePath, 'utf8')
      const altLines = altContent.split(/\r?\n/)
      const altValueLines = altLines.filter(line => /^\s*\(\s*'[^']*'\s*,\s*'[^']*'/.test(line))
      
      if (altValueLines.length > 0) {
        console.log('Éxito con lectura UTF-8 estándar.')
        content = altContent
      } else {
        console.log('Contenido de las primeras 20 líneas del archivo para depuración:')
        lines.slice(0, 20).forEach((l, i) => console.log(`${i + 1}: [${l}] (length: ${l.length})`))
        console.error('No se pudieron encontrar líneas de valores con el formato esperado.')
        return
      }
    }

    const finalLines = content.split(/\r?\n/).filter(line => /^\s*\(\s*'[^']*'\s*,\s*'[^']*'/.test(line))
    const rows = finalLines.map(r => r.trim().replace(/^\(|\),?$|;$/g, ''))

    console.log(`Procesando ${rows.length} líneas detectadas...`)

    const productsToInsert = []
    const categoriesSet = new Set<string>()

    for (const row of rows) {
      if (!row) continue
      
      // Intentar parsear la fila. Esto es delicado por las comas dentro de strings.
      // Un regex para manejar comillas simples, números y NULL
      const parts = row.match(/'(?:''|[^'])*'|NULL|-?\d+(?:\.\d+)?/g)
      
      if (!parts || parts.length < 9) {
        console.warn('Fila mal formateada (partes:', parts?.length, '):', row)
        continue
      }

      const sku = parts[0].replace(/^'|'$/g, '').replace(/''/g, "'")
      const name = parts[1].replace(/^'|'$/g, '').replace(/''/g, "'")
      const categoryName = parts[3].replace(/^'|'$/g, '').replace(/''/g, "'")
      const costPrice = parts[4] === 'NULL' ? 0 : parseFloat(parts[4])
      const price = parts[5] === 'NULL' ? 0 : parseFloat(parts[5])
      const stock = parts[6] === 'NULL' ? 0 : parseInt(parts[6])
      const minStock = parts[7] === 'NULL' ? 5 : parseInt(parts[7])

      if (categoryName && categoryName !== 'NULL') {
        categoriesSet.add(categoryName)
      }
      
      productsToInsert.push({
        sku,
        name,
        slug: generateSlug(name) + '-' + Math.random().toString(36).substring(2, 5),
        categoryName: categoryName === 'NULL' ? 'OTROS' : categoryName,
        cost_price: costPrice,
        price: price,
        stock: stock,
        min_stock: minStock,
        is_active: true
      })
    }

    console.log(`Insertando/Asegurando ${categoriesSet.size} categorías...`)
    for (const catName of categoriesSet) {
      const slug = generateSlug(catName)
      await sql`
        INSERT INTO public.categories (name, slug, is_active)
        VALUES (${catName}, ${slug}, true)
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      `
    }

    // Obtener mapa de categorías
    const categories = await sql`SELECT id, name FROM public.categories`
    const categoryMap = new Map(categories.map(c => [c.name, c.id]))

    // 2. Definir qué categorías son subcategorías y de quién
    const hierarchy = [
      { sub: 'Aguardiente', parent: 'Licor' },
      { sub: 'Vodka', parent: 'Licor' },
      { sub: 'Ron', parent: 'Licor' },
      { sub: 'whikies', parent: 'Licor' },
      { sub: 'Brandy', parent: 'Licor' },
      { sub: 'Vinos', parent: 'Licor' },
      { sub: 'Tequila', parent: 'Licor' },
      { sub: 'Espumosos', parent: 'Licor' },
      { sub: 'Cerveza', parent: 'Licor' },
      { sub: 'Bebidas sin Alcohol', parent: 'OTROS' }
    ]

    console.log('Organizando jerarquía de nuevas categorías...')
    for (const rel of hierarchy) {
      await sql`
        UPDATE public.categories 
        SET parent_id = (SELECT id FROM public.categories WHERE name ILIKE ${rel.parent} LIMIT 1)
        WHERE (name ILIKE ${rel.sub} OR name ILIKE ${rel.sub.toLowerCase()}) AND parent_id IS NULL;
      `
    }

    // Caso especial para asegurar que se vinculen aunque ya tengan un parent_id erróneo o nulo
    await sql`
      UPDATE public.categories 
      SET parent_id = (SELECT id FROM public.categories WHERE name ILIKE 'Licor' LIMIT 1)
      WHERE name IN ('Aguardiente', 'Vodka', 'Ron', 'whikies', 'Brandy', 'Vinos', 'Tequila', 'Espumosos', 'Cerveza');
    `

    console.log('Insertando productos...')
    let inserted = 0
    for (const p of productsToInsert) {
      try {
        const categoryId = categoryMap.get(p.categoryName)
        
        // 1. Insertar o actualizar el producto
        const { data: product, error: prodError } = await sql`
          INSERT INTO public.products 
            (sku, name, slug, cost_price, price, stock, min_stock, is_active)
          VALUES 
            (${p.sku}, ${p.name}, ${p.slug}, ${p.cost_price}, ${p.price}, ${p.stock}, ${p.min_stock}, ${p.is_active})
          ON CONFLICT (slug) DO UPDATE SET
            sku = EXCLUDED.sku,
            name = EXCLUDED.name,
            cost_price = EXCLUDED.cost_price,
            price = EXCLUDED.price,
            stock = EXCLUDED.stock,
            is_active = EXCLUDED.is_active
          RETURNING id
        `
        
        if (categoryId && product && product[0]) {
          // 2. Vincular el producto con su categoría en la tabla intermedia
          await sql`
            INSERT INTO public.product_categories (product_id, category_id)
            VALUES (${product[0].id}, ${categoryId})
            ON CONFLICT DO NOTHING
          `
        }
        
        inserted++
      } catch (e) {
        console.error(`Error insertando producto ${p.name}:`, e)
      }
    }

    console.log(`✅ Proceso completado. ${inserted} productos procesados.`)
  } catch (error) {
    console.error('❌ Error general:', error)
  } finally {
    await sql.end()
  }
}

processSqlFile()
