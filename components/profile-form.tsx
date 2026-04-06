'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, Phone, MapPin, CreditCard, Save, X, Edit2 } from 'lucide-react'
import { updateProfile } from '@/lib/actions/auth'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/lib/types/database'

interface ProfileFormProps {
  profile: Profile
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await updateProfile(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setIsEditing(false)
      setLoading(false)
      router.refresh()
    }
  }

  if (isEditing) {
    return (
      <Card className="shadow-md border-primary/10">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Editar Perfil</CardTitle>
              <CardDescription>Actualiza tu información personal</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                Nombre Completo
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  name="fullName"
                  defaultValue={profile.full_name || ''}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                Correo Electrónico (No editable)
              </Label>
              <div className="relative opacity-70">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={profile.email}
                  className="pl-10 bg-muted cursor-not-allowed"
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                Teléfono
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={profile.phone || ''}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                Dirección de Entrega
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  name="address"
                  defaultValue={profile.address || ''}
                  className="pl-10"
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive font-medium">{error}</p>}

            <div className="flex gap-3 pt-4 border-t">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  'Guardando...'
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md border-primary/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Datos Personales</CardTitle>
            <CardDescription>Tu información de contacto y entrega</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="h-8 gap-2">
            <Edit2 className="h-3.5 w-3.5" />
            Editar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4 group">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Nombre</p>
            <p className="font-medium text-foreground truncate">{profile.full_name || 'No especificado'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 group">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Correo electrónico</p>
            <p className="font-medium text-foreground truncate">{profile.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 group">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Teléfono</p>
            <p className="font-medium text-foreground truncate">{profile.phone || 'No especificado'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 group">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Dirección de Entrega</p>
            <p className="font-medium text-foreground truncate">{profile.address || 'No especificada'}</p>
          </div>
        </div>

        {profile.credit_limit > 0 && (
          <div className="flex items-center gap-4 pt-4 border-t group">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 group-hover:bg-green-500/20 transition-colors">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Crédito Disponible</p>
              <div className="flex items-baseline gap-2">
                <p className="font-bold text-lg text-green-600">
                  {formatPrice(profile.credit_limit - profile.credit_used)}
                </p>
                <span className="text-[10px] text-muted-foreground">de {formatPrice(profile.credit_limit)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
