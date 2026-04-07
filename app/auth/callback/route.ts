import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Obtener el perfil del usuario para saber su rol
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .single()

      let redirectPath = '/dashboard' // Por defecto para admin y bodeguero
      
      if (profile?.role === 'cliente') {
        redirectPath = '/' // Redirigir clientes al catálogo principal
      }

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin
      return NextResponse.redirect(`${siteUrl}${redirectPath}`)
    }
    
    console.error('Auth callback exchange error:', error)
  } else {
    console.warn('Auth callback: No code provided in URL')
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
