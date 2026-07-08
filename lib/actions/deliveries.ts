'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/application/services/auth-service'
import type { DeliverySettings, DeliveryDay, CategoryDeliveryPolicy, DeliveryDateException } from '@/lib/domain/entities'

// =============================================
// Delivery Settings
// =============================================

export async function getDeliverySettings(): Promise<DeliverySettings | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('delivery_settings')
      .select('*')
      .limit(1)
      .single()

    if (error || !data) {
      return null
    }

    return {
      id: data.id,
      cityName: data.city_name,
      outOfCityMessage: data.out_of_city_message,
      contactEmail: data.contact_email,
      contactPhone: data.contact_phone,
      whatsappLink: data.whatsapp_link,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  } catch (error) {
    console.error('Error fetching delivery settings:', error)
    return null
  }
}

export async function updateDeliverySettings(
  settings: Partial<Omit<DeliverySettings, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const dbData = {
      city_name: settings.cityName,
      out_of_city_message: settings.outOfCityMessage,
      contact_email: settings.contactEmail,
      contact_phone: settings.contactPhone,
      whatsapp_link: settings.whatsappLink,
      updated_at: new Date().toISOString(),
    }

    // First check if settings exist
    const existing = await getDeliverySettings()
    
    let result
    if (existing) {
      result = await supabase
        .from('delivery_settings')
        .update(dbData)
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('delivery_settings')
        .insert([dbData])
        .select()
        .single()
    }

    if (result.error) {
      return { success: false, error: result.error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Error updating delivery settings' }
  }
}

// =============================================
// Delivery Days
// =============================================

export async function getDeliveryDays(includeInactive: boolean = false): Promise<DeliveryDay[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('delivery_days')
      .select('*')
      .order('day_of_week', { ascending: true })

    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error || !data) {
      return []
    }

    return data.map((d: any) => ({
      id: d.id,
      dayOfWeek: d.day_of_week,
      customName: d.custom_name,
      deliveryCost: Number(d.delivery_cost),
      isActive: d.is_active,
      createdAt: new Date(d.created_at),
      updatedAt: new Date(d.updated_at),
    }))
  } catch (error) {
    console.error('Error fetching delivery days:', error)
    return []
  }
}

export async function createOrUpdateDeliveryDay(
  day: Partial<DeliveryDay> & { dayOfWeek: number }
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const dbData = {
      day_of_week: day.dayOfWeek,
      custom_name: day.customName,
      delivery_cost: day.deliveryCost,
      is_active: day.isActive ?? true,
      updated_at: new Date().toISOString(),
    }

    // Check if day exists
    const existingDays = await getDeliveryDays(true)
    const existingDay = existingDays.find((d) => d.dayOfWeek === day.dayOfWeek)

    let result
    if (existingDay) {
      result = await supabase
        .from('delivery_days')
        .update(dbData)
        .eq('id', existingDay.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('delivery_days')
        .insert([{ ...dbData, created_at: new Date().toISOString() }])
        .select()
        .single()
    }

    if (result.error) {
      return { success: false, error: result.error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Error saving delivery day' }
  }
}

export async function toggleDeliveryDayStatus(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from('delivery_days')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Error updating day status' }
  }
}

// =============================================
// Category Delivery Policies
// =============================================

export async function getCategoryDeliveryPolicies(): Promise<CategoryDeliveryPolicy[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('category_delivery_policies')
      .select('*')
      .order('created_at', { ascending: true })

    if (error || !data) {
      return []
    }

    return data.map((d: any) => ({
      id: d.id,
      categoryId: d.category_id,
      minPurchaseForDelivery: Number(d.min_purchase_for_delivery),
      minPurchaseForFreeDelivery: Number(d.min_purchase_for_free_delivery),
      createdAt: new Date(d.created_at),
      updatedAt: new Date(d.updated_at),
    }))
  } catch (error) {
    console.error('Error fetching delivery policies:', error)
    return []
  }
}

export async function getCategoryDeliveryPolicy(categoryId: string): Promise<CategoryDeliveryPolicy | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('category_delivery_policies')
      .select('*')
      .eq('category_id', categoryId)
      .single()

    if (error || !data) {
      return null
    }

    return {
      id: data.id,
      categoryId: data.category_id,
      minPurchaseForDelivery: Number(data.min_purchase_for_delivery),
      minPurchaseForFreeDelivery: Number(data.min_purchase_for_free_delivery),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  } catch (error) {
    console.error('Error fetching category policy:', error)
    return null
  }
}

export async function createOrUpdateCategoryDeliveryPolicy(
  policy: Partial<CategoryDeliveryPolicy> & { categoryId: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const dbData = {
      category_id: policy.categoryId,
      min_purchase_for_delivery: policy.minPurchaseForDelivery,
      min_purchase_for_free_delivery: policy.minPurchaseForFreeDelivery,
      updated_at: new Date().toISOString(),
    }

    const existingPolicy = await getCategoryDeliveryPolicy(policy.categoryId)

    let result
    if (existingPolicy) {
      result = await supabase
        .from('category_delivery_policies')
        .update(dbData)
        .eq('id', existingPolicy.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('category_delivery_policies')
        .insert([{ ...dbData, created_at: new Date().toISOString() }])
        .select()
        .single()
    }

    if (result.error) {
      return { success: false, error: result.error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Error saving delivery policy' }
  }
}

export async function deleteCategoryDeliveryPolicy(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from('category_delivery_policies')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Error deleting policy' }
  }
}

// =============================================
// Delivery Validation (for checkout)
// =============================================

export async function validateCartDelivery(
  cartTotal: number,
  categoryIds: string[]
): Promise<{
  isValid: boolean
  message?: string
  minRequired?: number
  canBeFree?: boolean
  minForFree?: number
}> {
  const policies = await getCategoryDeliveryPolicies()
  
  // Find all relevant policies for the cart categories
  const relevantPolicies = policies.filter(p => categoryIds.includes(p.categoryId))
  
  if (relevantPolicies.length === 0) {
    // No policies found, default to valid
    return { isValid: true }
  }

  // Get the highest minimum purchase required
  const highestMinPurchase = Math.max(...relevantPolicies.map(p => p.minPurchaseForDelivery))
  
  if (cartTotal < highestMinPurchase) {
    return {
      isValid: false,
      message: `El pedido no cumple con el valor mínimo de compra de $${highestMinPurchase.toLocaleString('es-CO')} para domicilio. Por favor, acércate a nuestros puntos físicos y completa tu dirección para recoger tu pedido.`,
      minRequired: highestMinPurchase,
    }
  }

  // Check for free delivery eligibility
  const highestMinForFree = Math.max(...relevantPolicies.map(p => p.minPurchaseForFreeDelivery))
  const canBeFree = cartTotal >= highestMinForFree

  return {
    isValid: true,
    canBeFree,
    minForFree: canBeFree ? highestMinForFree : undefined,
  }
}

// =============================================
// Delivery Date Exceptions
// =============================================

export async function getDeliveryDateExceptions(startDate?: Date, endDate?: Date): Promise<DeliveryDateException[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('delivery_date_exceptions')
      .select('*')
      .order('date', { ascending: true })

    if (startDate) {
      query = query.gte('date', startDate.toISOString().split('T')[0])
    }
    if (endDate) {
      query = query.lte('date', endDate.toISOString().split('T')[0])
    }

    const { data, error } = await query

    if (error || !data) {
      return []
    }

    return data.map((d: any) => ({
      id: d.id,
      date: new Date(d.date),
      isAvailable: d.is_available,
      customName: d.custom_name,
      deliveryCost: d.delivery_cost !== null ? Number(d.delivery_cost) : null,
      createdAt: new Date(d.created_at),
      updatedAt: new Date(d.updated_at),
    }))
  } catch (error) {
    console.error('Error fetching delivery date exceptions:', error)
    return []
  }
}

export async function createOrUpdateDeliveryDateException(
  exception: Partial<DeliveryDateException> & { date: Date }
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const dbData = {
      date: exception.date.toISOString().split('T')[0],
      is_available: exception.isAvailable ?? false,
      custom_name: exception.customName,
      delivery_cost: exception.deliveryCost,
      updated_at: new Date().toISOString(),
    }

    // Check if exception exists
    const existingExceptions = await getDeliveryDateExceptions(exception.date, exception.date)
    const existingException = existingExceptions[0]

    let result
    if (existingException) {
      result = await supabase
        .from('delivery_date_exceptions')
        .update(dbData)
        .eq('id', existingException.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('delivery_date_exceptions')
        .insert([{ ...dbData, created_at: new Date().toISOString() }])
        .select()
        .single()
    }

    if (result.error) {
      return { success: false, error: result.error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error saving delivery date exception:', error)
    return { success: false, error: 'Error saving delivery date exception' }
  }
}

export async function deleteDeliveryDateException(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from('delivery_date_exceptions')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting delivery date exception:', error)
    return { success: false, error: 'Error deleting delivery date exception' }
  }
}
