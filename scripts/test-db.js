const postgres = require('postgres');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function testDatabase() {
  console.log('🧪 Prueba de conexión y datos en la DB...\n');
  const sql = postgres(process.env.DATABASE_URL);

  try {
    // Check tables exist
    console.log('1️⃣  Verificando tablas...');
    const tables = await sql`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    console.log('✅ Tablas en la base de datos:');
    tables.forEach(t => console.log(`   - ${t.tablename}`));

    // Check delivery_settings
    console.log('\n2️⃣  Verificando delivery_settings...');
    const settings = await sql`SELECT * FROM delivery_settings LIMIT 1`;
    if (settings.length > 0) {
      console.log('✅ Datos encontrados:', settings[0]);
    } else {
      console.log('❌ No hay datos en delivery_settings');
    }

    // Check delivery_days
    console.log('\n3️⃣  Verificando delivery_days...');
    const days = await sql`SELECT * FROM delivery_days ORDER BY day_of_week`;
    if (days.length > 0) {
      console.log(`✅ ${days.length} días encontrados:`);
      days.forEach(d => console.log(`   - Día ${d.day_of_week}: ${d.custom_name || ''}, $${d.delivery_cost}, ${d.is_active ? 'Activo' : 'Inactivo'}`));
    } else {
      console.log('❌ No hay datos en delivery_days');
    }

    // Check categories
    console.log('\n4️⃣  Verificando categorías...');
    const categories = await sql`SELECT * FROM categories ORDER BY name`;
    console.log(`✅ ${categories.length} categorías encontradas:`);
    categories.forEach(c => console.log(`   - ${c.name} (ID: ${c.id.substring(0, 8)}...)`));

    await sql.end();
    console.log('\n✅ Prueba completada!');
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    await sql.end();
    process.exit(1);
  }
}

testDatabase();
