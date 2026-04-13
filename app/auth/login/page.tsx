'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let supabase
      try {
        supabase = createClient()
      } catch (configError: any) {
        console.error('[v0] Supabase configuration error:', configError.message)
        setError('Error de configuración: Faltan las credenciales de Supabase en .env.local')
        setLoading(false)
        return
      }
      
      console.log('[v0] Attempting login with email:', email)
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('[v0] Login response:', { data, error: signInError })

      if (signInError) {
        console.log('[v0] Login error:', signInError.message)
        setError(signInError.message === 'Invalid login credentials' 
          ? 'Credenciales inválidas. Verifica tu email y contraseña.'
          : signInError.message === 'Email not confirmed'
          ? 'Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.'
          : signInError.message)
        setLoading(false)
        return
      }

      if (data?.user) {
        console.log('[v0] Login successful, redirecting to dashboard')
        // Force a hard navigation to ensure session is properly set
        window.location.href = '/dashboard'
      }
    } catch (err) {
      console.error('[v0] Unexpected error during login:', err)
      setError('Ocurrió un error inesperado. Por favor intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <Link href="/" className="inline-flex justify-center">
            <Image
              src="/images/logo.jpeg"
              alt="AS DE NARIÑO"
              width={100}
              height={100}
              className="rounded-lg shadow-sm"
            />
          </Link>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold tracking-tight">Iniciar Sesión</CardTitle>
            <CardDescription className="text-base">
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-2">
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11"
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md text-center animate-in fade-in zoom-in duration-200">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.01]" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
            <div className="text-center">
              <Link href="/politicas" className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline">
                Tratamiento de Datos Personales
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pb-8">
            <div className="text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <Link href="/auth/registro" className="text-primary font-semibold hover:underline underline-offset-4">
                Regístrate
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
