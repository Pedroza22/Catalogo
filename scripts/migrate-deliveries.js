const postgres = require('postgres');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function runMigration() {
  console.log('🚀 Iniciando migración de entregas...\n');

  const sql = postgres(process.env.DATABASE_URL);

  try {
    // Step 1: Create delivery_settings table
    console.log('📋 Creando tabla delivery_settings...');
    await sql`
      CREATE TABLE IF NOT EXISTS delivery_settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        city_name TEXT NOT NULL DEFAULT 'Tu Ciudad',
        out_of_city_message TEXT NOT NULL DEFAULT 'Los pedidos para fuera de la ciudad deben coordinarse directamente con nosotros.',
        contact_email TEXT,
        contact_phone TEXT,
        whatsapp_link TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Step 2: Insert default settings
    console.log('📝 Insertando configuración predeterminada...');
    await sql`
      INSERT INTO delivery_settings (city_name, out_of_city_message, contact_email, contact_phone)
      VALUES ('Tu Ciudad', 'Los pedidos para fuera de la ciudad deben coordinarse directamente con nosotros.', 'contacto@tudominio.com', '+57 123 456 7890')
      ON CONFLICT DO NOTHING
    `;

    // Step 3: Create delivery_days table
    console.log('📅 Creando tabla delivery_days...');
    await sql`
      CREATE TABLE IF NOT EXISTS delivery_days (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
        custom_name TEXT,
        delivery_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(day_of_week)
      )
    `;

    // Step 4: Insert default days
    console.log('📅 Insertando días de entrega predeterminados...');
    await sql`
      INSERT INTO delivery_days (day_of_week, custom_name, delivery_cost, is_active)
      VALUES
        (1, 'Lunes', 5000, TRUE),
        (2, 'Martes', 5000, TRUE),
        (3, 'Miércoles', 5000, TRUE),
        (4, 'Jueves', 5000, TRUE),
        (5, 'Viernes', 5000, TRUE),
        (6, 'Sábado', 8000, TRUE),
        (0, 'Domingo', 10000, FALSE)
      ON CONFLICT (day_of_week) DO NOTHING
    `;

    // Step 5: Create category_delivery_policies table
    console.log('📋 Creando tabla category_delivery_policies...');
    await sql`
      CREATE TABLE IF NOT EXISTS category_delivery_policies (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        min_purchase_for_delivery NUMERIC(10, 2) NOT NULL DEFAULT 0,
        min_purchase_for_free_delivery NUMERIC(10, 2) NOT NULL DEFAULT 500000,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(category_id)
      )
    `;

    // Step 6: Add delivery columns to orders
    console.log('📦 Actualizando tabla orders...');
    try {
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_date DATE`;
    } catch (e) {
      console.log('ℹ️ Columna delivery_date ya existe');
    }

    try {
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_cost NUMERIC(10, 2) DEFAULT 0`;
    } catch (e) {
      console.log('ℹ️ Columna delivery_cost ya existe');
    }

    try {
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_free_delivery BOOLEAN DEFAULT FALSE`;
    } catch (e) {
      console.log('ℹ️ Columna is_free_delivery ya existe');
    }

    // Step 7: Add is_in_city to profiles
    console.log('👤 Actualizando tabla profiles...');
    try {
      await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_in_city BOOLEAN DEFAULT TRUE`;
    } catch (e) {
      console.log('ℹ️ Columna is_in_city ya existe');
    }

    console.log('\n🎉 ¡MIGRACIÓN COMPLETA EXITOSAMENTE!');
    await sql.end();
  } catch (error) {
    console.error('\n❌ ERROR EN LA MIGRACIÓN:', error.message);
    await sql.end();
    process.exit(1);
  }
}

runMigration();
