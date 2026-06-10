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

async function runSqlFile(filePath: string) {
  try {
    console.log(`Ejecutando script: ${filePath}...`)
    const fullPath = path.resolve(filePath)
    const sqlContent = fs.readFileSync(fullPath, 'utf8')
    
    // Ejecutar el SQL. Nota: postgres-js puede tener problemas con múltiples sentencias en una sola llamada si no se maneja bien,
    // pero usualmente permite ejecutar un bloque de SQL.
    await sql.unsafe(sqlContent)

    console.log('✅ Script ejecutado exitosamente.')
  } catch (error) {
    console.error('❌ Error ejecutando el script:', error)
  } finally {
    await sql.end()
  }
}

const fileToRun = process.argv[2] || 'scripts/014_banners_and_subcategories.sql'
runSqlFile(fileToRun)
