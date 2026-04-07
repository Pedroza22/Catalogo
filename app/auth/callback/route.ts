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
      // Usar NEXT_PUBLIC_SITE_URL si existe, si no, usar origin
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin
      return NextResponse.redirect(`${siteUrl}${next}`)
    }
    
    console.error('Auth callback exchange error:', error)
  } else {
    console.warn('Auth callback: No code provided in URL')
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
