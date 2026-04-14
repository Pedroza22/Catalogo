'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function RegistroPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    address: '',
    acceptTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (!formData.acceptTerms) {
      setError('Debes aceptar el tratamiento de datos personales para registrarte')
      return
    }

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
      
      console.log('[v0] Attempting signup with email:', formData.email)
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || 
            `${window.location.origin}/auth/callback`,
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            address: formData.address,
          },
        },
      })

      console.log('[v0] Signup response:', { data, error: signUpError })

      if (signUpError) {
        console.log('[v0] Signup error:', signUpError.message)
        setError(signUpError.message)
        setLoading(false)
        return
      }

      console.log('[v0] Signup successful, redirecting to verification page')
      router.push('/auth/verificar')
    } catch (err) {
      console.error('[v0] Unexpected error during signup:', err)
      setError('Ocurrió un error inesperado. Por favor intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 py-8">
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
            <CardTitle className="text-3xl font-bold tracking-tight">Crear Cuenta</CardTitle>
            <CardDescription className="text-base">
              Regístrate para hacer pedidos y acceder a precios especiales
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-2">
            <div className="space-y-2.5">
              <Label htmlFor="fullName" className="text-sm font-medium leading-none">Nombre completo</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Tu nombre completo"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-medium leading-none">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="h-11"
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="phone" className="text-sm font-medium leading-none">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+57 300 000 0000"
                value={formData.phone}
                onChange={handleChange}
                className="h-11"
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="address" className="text-sm font-medium leading-none">Dirección</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Tu dirección de entrega"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                    required
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
              <div className="space-y-2.5">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>
            </div>
            <div className="flex flex-row items-start space-x-3 pt-2">
              <Checkbox 
                id="acceptTerms" 
                checked={formData.acceptTerms}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, acceptTerms: checked === true }))
                }
                className="mt-0.5 shrink-0"
              />
              <label
                htmlFor="acceptTerms"
                className="text-sm font-normal leading-tight cursor-pointer text-muted-foreground block"
              >
                Acepto el <Link href="/politicas" className="text-primary hover:underline font-medium">tratamiento de mis datos personales</Link> conforme a la Ley 1581 de 2012.
              </label>
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
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex flex-col space-y-4 pb-8">
          <div className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-primary font-semibold hover:underline underline-offset-4">
              Inicia sesión
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
