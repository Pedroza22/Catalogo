'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Calendar as CalendarIcon, MessageSquare, DollarSign, Trash2, Edit, Save } from 'lucide-react'
import { toast } from 'sonner'
import {
  getDeliverySettings,
  updateDeliverySettings,
  getDeliveryDays,
  createOrUpdateDeliveryDay,
  toggleDeliveryDayStatus,
  getCategoryDeliveryPolicies,
  createOrUpdateCategoryDeliveryPolicy,
  deleteCategoryDeliveryPolicy,
  getDeliveryDateExceptions,
  createOrUpdateDeliveryDateException,
  deleteDeliveryDateException,
} from '@/lib/actions/deliveries'
import { getAllCategories } from '@/lib/actions/categories'
import type { DeliverySettings, DeliveryDay, CategoryDeliveryPolicy, DeliveryDateException } from '@/lib/domain/entities'
import type { Category as DbCategory } from '@/lib/types/database'

const dayNames = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
]

export default function DeliveryManagementPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Settings
  const [settings, setSettings] = useState<DeliverySettings | null>(null)
  const [settingsForm, setSettingsForm] = useState<Partial<DeliverySettings>>({})

  // Delivery Days
  const [deliveryDays, setDeliveryDays] = useState<DeliveryDay[]>([])
  const [editingDay, setEditingDay] = useState<{ dayOfWeek: number; isActive: boolean; customName?: string; deliveryCost: number } | null>(null)

  // Policies
  const [categories, setCategories] = useState<any[]>([])
  const [policies, setPolicies] = useState<CategoryDeliveryPolicy[]>([])
  const [editingPolicy, setEditingPolicy] = useState<{ categoryId: string; minPurchaseForDelivery: number; minPurchaseForFreeDelivery: number } | null>(null)

  // Delivery Date Exceptions
  const [exceptions, setExceptions] = useState<DeliveryDateException[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [editingException, setEditingException] = useState<{ date: Date; isAvailable: boolean; customName?: string | null; deliveryCost?: number | null } | null>(null)
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date())

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('📡 Fetching delivery data...')
        setError(null)
        
        // Get date from calendarMonth
        const startDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
        const endDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0)
        
        const [settingsData, daysData, categoriesData, policiesData, exceptionsData] = await Promise.all([
          getDeliverySettings(),
          getDeliveryDays(true),
          getAllCategories(),
          getCategoryDeliveryPolicies(),
          getDeliveryDateExceptions(startDate, endDate),
        ])

        console.log('✅ Data loaded:', { settingsData, daysData, categoriesData, policiesData, exceptionsData })
        
        setSettings(settingsData)
        setSettingsForm(settingsData || {})
        setDeliveryDays(daysData)
        setCategories(categoriesData)
        setPolicies(policiesData)
        setExceptions(exceptionsData)
      } catch (err) {
        console.error('❌ Error loading data:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [calendarMonth])

  const handleSaveSettings = async () => {
    console.log('💾 Saving settings:', settingsForm)
    setSaving(true)
    const result = await updateDeliverySettings(settingsForm)
    if (result.success) {
      toast.success('Configuración guardada exitosamente')
      const updatedSettings = await getDeliverySettings()
      setSettings(updatedSettings)
      router.refresh()
    } else {
      console.error('❌ Error saving settings:', result.error)
      toast.error(result.error || 'Error guardando la configuración')
    }
    setSaving(false)
  }

  const handleSaveDay = async () => {
    if (!editingDay) return
    console.log('💾 Saving delivery day:', editingDay)
    setSaving(true)
    const result = await createOrUpdateDeliveryDay(editingDay)
    if (result.success) {
      toast.success('Día de entrega guardado exitosamente')
      const updatedDays = await getDeliveryDays(true)
      setDeliveryDays(updatedDays)
      setEditingDay(null)
      router.refresh()
    } else {
      console.error('❌ Error saving day:', result.error)
      toast.error(result.error || 'Error guardando el día de entrega')
    }
    setSaving(false)
  }

  const handleToggleDayStatus = async (id: string, currentStatus: boolean) => {
    console.log('🔄 Toggling day status:', id, !currentStatus)
    const result = await toggleDeliveryDayStatus(id, !currentStatus)
    if (result.success) {
      toast.success('Estado actualizado exitosamente')
      const updatedDays = await getDeliveryDays(true)
      setDeliveryDays(updatedDays)
      router.refresh()
    } else {
      console.error('❌ Error toggling status:', result.error)
      toast.error(result.error || 'Error actualizando el estado')
    }
  }

  const handleSavePolicy = async () => {
    if (!editingPolicy) return
    console.log('💾 Saving policy:', editingPolicy)
    setSaving(true)
    const result = await createOrUpdateCategoryDeliveryPolicy(editingPolicy)
    if (result.success) {
      toast.success('Política de entrega guardada exitosamente')
      const updatedPolicies = await getCategoryDeliveryPolicies()
      setPolicies(updatedPolicies)
      setEditingPolicy(null)
      router.refresh()
    } else {
      console.error('❌ Error saving policy:', result.error)
      toast.error(result.error || 'Error guardando la política de entrega')
    }
    setSaving(false)
  }

  const handleDeletePolicy = async (id: string) => {
    console.log('🗑️ Deleting policy:', id)
    const result = await deleteCategoryDeliveryPolicy(id)
    if (result.success) {
      toast.success('Política eliminada exitosamente')
      const updatedPolicies = await getCategoryDeliveryPolicies()
      setPolicies(updatedPolicies)
      router.refresh()
    } else {
      console.error('❌ Error deleting policy:', result.error)
      toast.error(result.error || 'Error eliminando la política')
    }
  }

  // Delivery Date Exceptions handlers
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      const existingException = exceptions.find(
        (e) => e.date.toDateString() === date.toDateString()
      )
      if (existingException) {
        setEditingException({
          date: existingException.date,
          isAvailable: existingException.isAvailable,
          customName: existingException.customName,
          deliveryCost: existingException.deliveryCost,
        })
      } else {
        // Default to not available, custom name null, delivery cost null
        setEditingException({
          date: date,
          isAvailable: false,
          customName: null,
          deliveryCost: null,
        })
      }
    } else {
      setEditingException(null)
    }
  }

  const handleSaveException = async () => {
    if (!editingException) return
    console.log('💾 Saving delivery date exception:', editingException)
    setSaving(true)
    const result = await createOrUpdateDeliveryDateException(editingException)
    if (result.success) {
      toast.success('Excepción de fecha guardada exitosamente')
      const updatedExceptions = await getDeliveryDateExceptions(
        new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1),
        new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0)
      )
      setExceptions(updatedExceptions)
      setEditingException(null)
      setSelectedDate(undefined)
      router.refresh()
    } else {
      console.error('❌ Error saving exception:', result.error)
      toast.error(result.error || 'Error guardando la excepción')
    }
    setSaving(false)
  }

  const handleDeleteException = async () => {
    if (!editingException) return
    const existingException = exceptions.find(
      (e) => e.date.toDateString() === editingException.date.toDateString()
    )
    if (!existingException) return

    console.log('🗑️ Deleting delivery date exception:', existingException.id)
    const result = await deleteDeliveryDateException(existingException.id)
    if (result.success) {
      toast.success('Excepción de fecha eliminada exitosamente')
      const updatedExceptions = await getDeliveryDateExceptions(
        new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1),
        new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0)
      )
      setExceptions(updatedExceptions)
      setEditingException(null)
      setSelectedDate(undefined)
      router.refresh()
    } else {
      console.error('❌ Error deleting exception:', result.error)
      toast.error(result.error || 'Error eliminando la excepción')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-lg font-semibold">Cargando...</div>
          <div className="animate-pulse text-sm text-muted-foreground">Obteniendo datos de entregas...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="p-6 border border-red-200 bg-red-50 rounded-lg max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-red-800 mb-4">Error al cargar</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Intentar de nuevo</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gestión de Entregas y Domicilios</h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-2">Configura los días, precios y políticas de entrega</p>
      </div>

      <div className="h-4"></div>
      
      <Tabs defaultValue="settings" className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex w-max grid-cols-1 lg:grid-cols-4 gap-2 p-1">
            <TabsTrigger value="settings" className="text-xs sm:text-sm py-3 px-3 whitespace-nowrap">
              <MessageSquare className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Configuración General</span>
              <span className="sm:hidden">General</span>
            </TabsTrigger>
            <TabsTrigger value="days" className="text-xs sm:text-sm py-3 px-3 whitespace-nowrap">
              <CalendarIcon className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Días de Entrega</span>
              <span className="sm:hidden">Días</span>
            </TabsTrigger>
            <TabsTrigger value="exceptions" className="text-xs sm:text-sm py-3 px-3 whitespace-nowrap">
              <CalendarIcon className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Fechas Especiales</span>
              <span className="sm:hidden">Especiales</span>
            </TabsTrigger>
            <TabsTrigger value="policies" className="text-xs sm:text-sm py-3 px-3 whitespace-nowrap">
              <DollarSign className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Políticas por Categoría</span>
              <span className="sm:hidden">Políticas</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Entregas</CardTitle>
              <CardDescription>Configura los mensajes y datos de contacto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cityName">Nombre de la Ciudad</Label>
                  <Input
                    id="cityName"
                    value={settingsForm.cityName || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, cityName: e.target.value })}
                    placeholder="Ej: Medellín"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email de Contacto</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settingsForm.contactEmail || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                    placeholder="contacto@tudominio.com"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Teléfono de Contacto</Label>
                  <Input
                    id="contactPhone"
                    value={settingsForm.contactPhone || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                    placeholder="+57 123 456 7890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsappLink">Enlace de WhatsApp (opcional)</Label>
                  <Input
                    id="whatsappLink"
                    value={settingsForm.whatsappLink || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappLink: e.target.value })}
                    placeholder="https://wa.me/1234567890"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="outOfCityMessage">Mensaje para Fuera de la Ciudad</Label>
                <textarea
                  id="outOfCityMessage"
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                  value={settingsForm.outOfCityMessage || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, outOfCityMessage: e.target.value })}
                  placeholder="Mensaje que se muestra cuando la dirección es fuera de la ciudad"
                />
              </div>

              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Configuración
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Days Tab */}
        <TabsContent value="days" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Días de Entrega</CardTitle>
              <CardDescription>Configura los días y precios de entrega</CardDescription>
            </CardHeader>
            <CardContent>
              {deliveryDays.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No hay días de entrega configurados.
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden lg:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Día</TableHead>
                          <TableHead>Precio de Domicilio</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deliveryDays.map((day) => (
                          <TableRow key={day.id}>
                            <TableCell>
                              {editingDay?.dayOfWeek === day.dayOfWeek ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={editingDay.customName || ''}
                                    onChange={(e) => setEditingDay({ ...editingDay, customName: e.target.value })}
                                    placeholder={dayNames[day.dayOfWeek]}
                                    className="w-40"
                                  />
                                </div>
                              ) : (
                                <span className="font-medium">
                                  {day.customName || dayNames[day.dayOfWeek]}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {editingDay?.dayOfWeek === day.dayOfWeek ? (
                                <Input
                                  type="number"
                                  value={editingDay.deliveryCost}
                                  onChange={(e) => {
                                    const num = Number(e.target.value)
                                    setEditingDay({ ...editingDay, deliveryCost: isNaN(num) ? 0 : num })
                                  }}
                                  className="w-32"
                                />
                              ) : (
                                <span>{formatPrice(day.deliveryCost)}</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {editingDay?.dayOfWeek === day.dayOfWeek ? (
                                <Switch
                                  checked={editingDay.isActive}
                                  onCheckedChange={(checked) => setEditingDay({ ...editingDay, isActive: checked })}
                                />
                              ) : (
                                <Badge variant={day.isActive ? 'default' : 'secondary'}>
                                  {day.isActive ? 'Activo' : 'Inactivo'}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {editingDay?.dayOfWeek === day.dayOfWeek ? (
                                <div className="flex justify-end gap-2">
                                  <Button size="sm" onClick={handleSaveDay} disabled={saving}>
                                    <Save className="w-4 h-4 mr-1" />
                                    Guardar
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => setEditingDay(null)}>
                                    Cancelar
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      console.log('✏️ Starting edit for day:', day)
                                      setEditingDay({
                                        dayOfWeek: day.dayOfWeek,
                                        isActive: day.isActive,
                                        customName: day.customName || '',
                                        deliveryCost: Number(day.deliveryCost),
                                      })
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleToggleDayStatus(day.id, day.isActive)}
                                  >
                                    {day.isActive ? 'Desactivar' : 'Activar'}
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Mobile Cards */}
                  <div className="lg:hidden space-y-4">
                    {deliveryDays.map((day) => (
                      <div key={day.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            {editingDay?.dayOfWeek === day.dayOfWeek ? (
                              <Input
                                value={editingDay.customName || ''}
                                onChange={(e) => setEditingDay({ ...editingDay, customName: e.target.value })}
                                placeholder={dayNames[day.dayOfWeek]}
                              />
                            ) : (
                              <span className="font-medium text-lg">
                                {day.customName || dayNames[day.dayOfWeek]}
                              </span>
                            )}
                          </div>
                          {editingDay?.dayOfWeek === day.dayOfWeek ? (
                            <Switch
                              checked={editingDay.isActive}
                              onCheckedChange={(checked) => setEditingDay({ ...editingDay, isActive: checked })}
                            />
                          ) : (
                            <Badge variant={day.isActive ? 'default' : 'secondary'}>
                              {day.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                          )}
                        </div>
                        
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Precio de Domicilio</div>
                          {editingDay?.dayOfWeek === day.dayOfWeek ? (
                            <Input
                              type="number"
                              value={editingDay.deliveryCost}
                              onChange={(e) => {
                                const num = Number(e.target.value)
                                setEditingDay({ ...editingDay, deliveryCost: isNaN(num) ? 0 : num })
                              }}
                            />
                          ) : (
                            <span className="font-medium">{formatPrice(day.deliveryCost)}</span>
                          )}
                        </div>
                        
                        <div className="flex gap-2 justify-end pt-2 border-t">
                          {editingDay?.dayOfWeek === day.dayOfWeek ? (
                            <>
                              <Button size="sm" onClick={handleSaveDay} disabled={saving}>
                                <Save className="w-4 h-4 mr-1" />
                                Guardar
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingDay(null)}>
                                Cancelar
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  console.log('✏️ Starting edit for day:', day)
                                  setEditingDay({
                                    dayOfWeek: day.dayOfWeek,
                                    isActive: day.isActive,
                                    customName: day.customName || '',
                                    deliveryCost: Number(day.deliveryCost),
                                  })
                                }}
                              >
                                <Edit className="w-4 h-4" />
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleToggleDayStatus(day.id, day.isActive)}
                              >
                                {day.isActive ? 'Desactivar' : 'Activar'}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Date Exceptions Tab */}
        <TabsContent value="exceptions" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Calendario</CardTitle>
                <CardDescription>Selecciona una fecha para configurarla</CardDescription>
              </CardHeader>
              <CardContent className="p-2 sm:p-6">
                <div className="overflow-x-auto">
                  <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          month={calendarMonth}
                          onMonthChange={setCalendarMonth}
                          modifiers={{
                            available: (date: Date) => {
                              const exception = exceptions.find(
                                (e) => e.date.toDateString() === date.toDateString()
                              )
                              return exception ? exception.isAvailable : false
                            },
                            unavailable: (date: Date) => {
                              const exception = exceptions.find(
                                (e) => e.date.toDateString() === date.toDateString()
                              )
                              return exception ? !exception.isAvailable : false
                            },
                          }}
                          modifiersClassNames={{
                            available: "bg-green-100 text-green-900",
                            unavailable: "bg-red-100 text-red-900",
                          }}
                          className="rounded-md border w-full"
                        />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedDate 
                    ? selectedDate.toLocaleDateString('es-CO', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) 
                    : 'Selecciona una fecha'}
                </CardTitle>
                <CardDescription>
                  {selectedDate ? 'Configura los detalles para esta fecha' : 'Elige una fecha del calendario'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingException && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isAvailable"
                        checked={editingException.isAvailable}
                        onCheckedChange={(checked) => 
                          setEditingException({ ...editingException, isAvailable: checked })
                        }
                      />
                      <Label htmlFor="isAvailable" className="text-sm">
                        {editingException.isAvailable ? 'Disponible para entrega' : 'No disponible para entrega'}
                      </Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customName" className="text-sm">Nombre Personalizado (opcional)</Label>
                      <Input
                        id="customName"
                        value={editingException.customName || ''}
                        onChange={(e) => 
                          setEditingException({ 
                            ...editingException, 
                            customName: e.target.value || null 
                          })
                        }
                        placeholder="Ej: Día Especial"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deliveryCost" className="text-sm">
                        Precio de Domicilio (opcional, deja vacío para usar el precio del día)
                      </Label>
                      <Input
                        id="deliveryCost"
                        type="number"
                        value={editingException.deliveryCost ?? ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : Number(e.target.value)
                          setEditingException({ 
                            ...editingException, 
                            deliveryCost: isNaN(val as number) ? null : val 
                          })
                        }}
                        placeholder="5000"
                      />
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button onClick={handleSaveException} disabled={saving} className="flex-1">
                        {saving ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Guardar
                          </>
                        )}
                      </Button>
                      {exceptions.some(
                        (e) => e.date.toDateString() === editingException.date.toDateString()
                      ) && (
                        <Button 
                          variant="destructive" 
                          onClick={handleDeleteException}
                          disabled={saving}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Políticas de Entrega por Categoría</CardTitle>
              <CardDescription>Configura valores mínimos para envío gratis y domicilio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                {categories.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                    <div className="space-y-2">
                      <Label>Categoría</Label>
                      <Select
                        onValueChange={(value) => {
                          console.log('📋 Selected category:', value)
                          const existingPolicy = policies.find(p => p.categoryId === value)
                          if (existingPolicy) {
                            setEditingPolicy({
                              categoryId: value,
                              minPurchaseForDelivery: Number(existingPolicy.minPurchaseForDelivery),
                              minPurchaseForFreeDelivery: Number(existingPolicy.minPurchaseForFreeDelivery),
                            })
                          } else {
                            setEditingPolicy({
                              categoryId: value,
                              minPurchaseForDelivery: 0,
                              minPurchaseForFreeDelivery: 500000,
                            })
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.filter((c: any) => !c.parent_id).map((category: any) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {editingPolicy && (
                      <>
                        <div className="space-y-2">
                          <Label>Valor Mínimo para Domicilio</Label>
                          <Input
                            type="number"
                            value={editingPolicy.minPurchaseForDelivery}
                            onChange={(e) => {
                              const num = Number(e.target.value)
                              setEditingPolicy({ ...editingPolicy, minPurchaseForDelivery: isNaN(num) ? 0 : num })
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Valor Mínimo para Envío Gratis</Label>
                          <Input
                            type="number"
                            value={editingPolicy.minPurchaseForFreeDelivery}
                            onChange={(e) => {
                              const num = Number(e.target.value)
                              setEditingPolicy({ ...editingPolicy, minPurchaseForFreeDelivery: isNaN(num) ? 0 : num })
                            }}
                          />
                        </div>
                        <div className="flex items-end md:col-span-3 lg:col-span-1">
                          <Button onClick={handleSavePolicy} disabled={saving} className="w-full md:w-auto">
                            {saving ? 'Guardando...' : 'Guardar'}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="text-lg font-semibold mb-4">Políticas Existentes</h3>
                {policies.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No hay políticas configuradas
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Mínimo para Domicilio</TableHead>
                            <TableHead>Mínimo para Envío Gratis</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {policies.map((policy) => {
                            const category = categories.find((c: any) => c.id === policy.categoryId)
                            return (
                              <TableRow key={policy.id}>
                                <TableCell className="font-medium">{category?.name || 'Categoría Eliminada'}</TableCell>
                                <TableCell>{formatPrice(Number(policy.minPurchaseForDelivery))}</TableCell>
                                <TableCell>{formatPrice(Number(policy.minPurchaseForFreeDelivery))}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        console.log('✏️ Starting edit for policy:', policy)
                                        setEditingPolicy({
                                          categoryId: policy.categoryId,
                                          minPurchaseForDelivery: Number(policy.minPurchaseForDelivery),
                                          minPurchaseForFreeDelivery: Number(policy.minPurchaseForFreeDelivery),
                                        })
                                      }}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-destructive"
                                      onClick={() => handleDeletePolicy(policy.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {/* Mobile Cards */}
                    <div className="lg:hidden space-y-4">
                      {policies.map((policy) => {
                        const category = categories.find((c: any) => c.id === policy.categoryId)
                        return (
                          <div key={policy.id} className="border rounded-lg p-4 space-y-3">
                            <div className="font-medium text-lg">
                              {category?.name || 'Categoría Eliminada'}
                            </div>
                            <div className="space-y-2">
                              <div>
                                <span className="text-sm text-muted-foreground">Mínimo para Domicilio: </span>
                                <span className="font-medium">{formatPrice(Number(policy.minPurchaseForDelivery))}</span>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Mínimo para Envío Gratis: </span>
                                <span className="font-medium">{formatPrice(Number(policy.minPurchaseForFreeDelivery))}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 justify-end pt-2 border-t">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  console.log('✏️ Starting edit for policy:', policy)
                                  setEditingPolicy({
                                    categoryId: policy.categoryId,
                                    minPurchaseForDelivery: Number(policy.minPurchaseForDelivery),
                                    minPurchaseForFreeDelivery: Number(policy.minPurchaseForFreeDelivery),
                                  })
                                }}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => handleDeletePolicy(policy.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
