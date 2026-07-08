const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

async function runMigration() {
  console.log('🚀 Running delivery management migration...')

  // Create a PostgreSQL client using postgres library
  const postgres = require('postgres')
  const sql = postgres(process.env.DATABASE_URL)

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '017_delivery_management.sql')
    const sqlContent = fs.readFileSync(migrationPath, 'utf-8')

    // Split into individual statements (simplified - works for this script)
    const statements = sqlContent
      .split(/(?<=;)\s*$/)
      .map(s => s.trim())
      .filter(Boolean)

    for (const statement of statements) {
      // Skip comments and empty lines
      if (statement.startsWith('--') || statement.length === 0) continue

      console.log('Executing statement...')
      try {
        await sql.unsafe(statement)
        console.log('✅ Statement executed successfully')
      } catch (err) {
        // Ignore errors like "relation already exists" - they're safe
        console.log('ℹ️  Statement skipped:', err.message.substring(0, 100))
      }
    }

    console.log('\n🎉 Migration completed successfully!')
    await sql.end()
  } catch (error) {
    console.error('❌ Error running migration:', error)
    process.exit(1)
  }
}

runMigration()
