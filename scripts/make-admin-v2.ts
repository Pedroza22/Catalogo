import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no encontradas en .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function makeAdmin() {
  const email = process.argv[2]
  const role = process.argv[3] || 'admin'

  if (!email) {
    console.error('Uso: npx tsx scripts/make-admin-v2.ts <email> [role]')
    process.exit(1)
  }

  console.log(`Buscando usuario con email: ${email}...`)

  try {
    // 1. Get user by email to get their ID
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) throw listError
    
    const user = users.find(u => u.email === email)
    
    if (!user) {
      console.error(`❌ No se encontró el usuario con email ${email} en auth.users.`)
      process.exit(1)
    }

    const userId = user.id
    console.log(`✅ Usuario encontrado con ID: ${userId}`)

    // 2. Update profiles table
    console.log(`Actualizando tabla profiles...`)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: role })
      .eq('id', userId)

    if (profileError) {
      console.warn(`⚠️ Error al actualizar tabla profiles: ${profileError.message}`)
      console.log('Intentando continuar con el metadata de autenticación...')
    } else {
      console.log(`✅ Tabla profiles actualizada correctamente.`)
    }

    // 3. Update auth metadata
    console.log(`Actualizando metadata de autenticación...`)
    const { error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      { user_metadata: { role: role } }
    )

    if (authError) {
      console.error(`❌ Error al actualizar metadata en auth.users: ${authError.message}`)
      process.exit(1)
    }

    console.log(`✅ Metadata actualizado en auth.users.`)
    console.log(`🚀 ¡Listo! ${email} ahora es ${role}.`)
    console.log(`⚠️ IMPORTANTE: El usuario DEBE cerrar sesión y volver a entrar para que el cambio surta efecto.`)

  } catch (error: any) {
    console.error('❌ Error ejecutando el script:', error.message || error)
  }
}

makeAdmin()
