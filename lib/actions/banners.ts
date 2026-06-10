'use server'

import { createClient } from '@/lib/supabase/server'
import type { Banner } from '@/lib/types/database'
import { revalidatePath } from 'next/cache'
import { uploadImage } from './products'

export async function getBanners(all = false): Promise<Banner[]> {
  try {
    const supabase = await createClient()
    
    let query = supabase
      .from('banners')
      .select('*')
      .order('order', { ascending: true })

    if (!all) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      if (error.code === 'PGRST205') {
        console.error('ERROR: La tabla "banners" no existe en la base de datos. Por favor, ejecuta el script SQL en scripts/014_banners_and_subcategories.sql')
      } else {
        console.error('Error fetching banners:', error)
      }
      return []
    }

    return data || []
  } catch (err) {
    console.error('Unexpected error in getBanners:', err)
    return []
  }
}

export async function createBanner(formData: FormData) {
  const supabase = await createClient()
  
  const imageFile = formData.get('image_file') as File
  let imageUrl = formData.get('image_url') as string || null

  if (imageFile && imageFile.size > 0) {
    const uploadedUrl = await uploadImage(imageFile, 'banners')
    if (uploadedUrl) {
      imageUrl = uploadedUrl
    }
  }

  const banner = {
    title: formData.get('title') as string,
    subtitle: formData.get('subtitle') as string,
    image_url: imageUrl,
    background_color: formData.get('background_color') as string || 'from-primary to-primary/70',
    button_text: formData.get('button_text') as string,
    button_link: formData.get('button_link') as string,
    order: parseInt(formData.get('order') as string) || 0,
    is_active: true,
  }

  const { error } = await supabase
    .from('banners')
    .insert(banner)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/dashboard/banners')
  return { success: true }
}

export async function updateBanner(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const imageFile = formData.get('image_file') as File
  let imageUrl = formData.get('image_url') as string || null

  if (imageFile && imageFile.size > 0) {
    const uploadedUrl = await uploadImage(imageFile, 'banners')
    if (uploadedUrl) {
      imageUrl = uploadedUrl
    }
  }

  const banner: any = {
    title: formData.get('title') as string,
    subtitle: formData.get('subtitle') as string,
    background_color: formData.get('background_color') as string,
    button_text: formData.get('button_text') as string,
    button_link: formData.get('button_link') as string,
    order: parseInt(formData.get('order') as string) || 0,
    is_active: formData.get('is_active') === 'true',
  }

  if (imageUrl) {
    banner.image_url = imageUrl
  }

  const { error } = await supabase
    .from('banners')
    .update(banner)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/dashboard/banners')
  return { success: true }
}

export async function deleteBanner(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('banners')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/dashboard/banners')
  return { success: true }
}

