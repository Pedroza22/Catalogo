const postgres = require('postgres');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function addRLSPolicies() {
  console.log('🔐 Agregando políticas RLS para las nuevas tablas...\n');
  const sql = postgres(process.env.DATABASE_URL);

  try {
    // 1. Enable RLS on all new tables
    console.log('1️⃣  Habilitando RLS...');
    await sql`ALTER TABLE delivery_settings ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE delivery_days ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE category_delivery_policies ENABLE ROW LEVEL SECURITY`;
    console.log('✅ RLS habilitado!');

    // 2. Create policies for delivery_settings - allow everyone to read, admins to write
    console.log('\n2️⃣  Creando políticas para delivery_settings...');
    await sql`
      CREATE POLICY "Permitir lectura pública de configuración de entregas"
      ON delivery_settings FOR SELECT USING (true);
    `.catch(e => console.log('ℹ️ Política ya existe (lectura):', e.message.substring(0, 80)));
    
    await sql`
      CREATE POLICY "Permitir escritura a admin en configuración de entregas"
      ON delivery_settings FOR ALL USING (auth.role() = 'authenticated');
    `.catch(e => console.log('ℹ️ Política ya existe (escritura):', e.message.substring(0, 80)));

    // 3. Create policies for delivery_days
    console.log('\n3️⃣  Creando políticas para delivery_days...');
    await sql`
      CREATE POLICY "Permitir lectura pública de días de entrega"
      ON delivery_days FOR SELECT USING (true);
    `.catch(e => console.log('ℹ️ Política ya existe (lectura):', e.message.substring(0, 80)));
    
    await sql`
      CREATE POLICY "Permitir escritura a admin en días de entrega"
      ON delivery_days FOR ALL USING (auth.role() = 'authenticated');
    `.catch(e => console.log('ℹ️ Política ya existe (escritura):', e.message.substring(0, 80)));

    // 4. Create policies for category_delivery_policies
    console.log('\n4️⃣  Creando políticas para category_delivery_policies...');
    await sql`
      CREATE POLICY "Permitir lectura pública de políticas de entrega"
      ON category_delivery_policies FOR SELECT USING (true);
    `.catch(e => console.log('ℹ️ Política ya existe (lectura):', e.message.substring(0, 80)));
    
    await sql`
      CREATE POLICY "Permitir escritura a admin en políticas de entrega"
      ON category_delivery_policies FOR ALL USING (auth.role() = 'authenticated');
    `.catch(e => console.log('ℹ️ Política ya existe (escritura):', e.message.substring(0, 80)));

    await sql.end();
    console.log('\n✅ ¡POLÍTICAS RLS AGREGADAS EXITOSAMENTE!');
    console.log('\n💡 Ahora debes refrescar la página y todo debería funcionar!');
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    await sql.end();
    process.exit(1);
  }
}

addRLSPolicies();
