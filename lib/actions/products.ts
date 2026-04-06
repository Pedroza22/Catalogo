'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateTag } from 'next/cache'
import type { Product, Category } from '@/lib/types/database'

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    return data || []
  } catch {
    return []
  }
}

export async function getProducts(categoryId?: string): Promise<Product[]> {
  try {
    const supabase = await createClient()
    
    let query = supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_active', true)
      .gt('stock', 0)
      .order('name')

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching products:', error)
      return []
    }

    return data || []
  } catch {
    return []
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .order('name')

  if (error) {
    console.error('Error fetching all products:', error)
    return []
  }

  return data || []
}

export async function uploadImage(file: File, path: string): Promise<string | null> {
  const supabase = await createClient()
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `${path}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('products')
    .upload(filePath, file)

  if (uploadError) {
    console.error('Error uploading image:', uploadError)
    return null
  }

  const { data: { publicUrl } } = supabase.storage
    .from('products')
    .getPublicUrl(filePath)

  return publicUrl
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const imageFile = formData.get('image_file') as File
  let imageUrl = formData.get('image_url') as string || null

  if (imageFile && imageFile.size > 0) {
    const uploadedUrl = await uploadImage(imageFile, 'images')
    if (uploadedUrl) {
      imageUrl = uploadedUrl
    }
  }

  const product = {
    name,
    slug: generateSlug(name),
    description: formData.get('description') as string,
    sku: formData.get('sku') as string,
    price: parseFloat(formData.get('price') as string),
    stock: parseInt(formData.get('stock') as string),
    min_stock: parseInt(formData.get('min_stock') as string) || 5,
    category_id: formData.get('category_id') as string || null,
    image_url: imageUrl,
    is_active: true,
  }

  const { error } = await supabase.from('products').insert(product)

  if (error) {
    return { error: error.message }
  }

  revalidateTag('products', 'max')
  return { success: true }
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const imageFile = formData.get('image_file') as File
  let imageUrl = formData.get('image_url') as string || null

  if (imageFile && imageFile.size > 0) {
    const uploadedUrl = await uploadImage(imageFile, 'images')
    if (uploadedUrl) {
      imageUrl = uploadedUrl
    }
  }

  const product = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    sku: formData.get('sku') as string,
    price: parseFloat(formData.get('price') as string),
    stock: parseInt(formData.get('stock') as string),
    min_stock: parseInt(formData.get('min_stock') as string) || 5,
    category_id: formData.get('category_id') as string || null,
    image_url: imageUrl,
    is_active: formData.get('is_active') === 'true',
  }

  const { error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidateTag('products', 'max')
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidateTag('products', 'max')
  return { success: true }
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const imageFile = formData.get('image_file') as File
  let imageUrl = formData.get('image_url') as string || null

  if (imageFile && imageFile.size > 0) {
    const uploadedUrl = await uploadImage(imageFile, 'categories')
    if (uploadedUrl) {
      imageUrl = uploadedUrl
    }
  }

  const category = {
    name,
    slug: generateSlug(name),
    description: formData.get('description') as string || null,
    image_url: imageUrl,
    is_active: true,
  }

  const { error } = await supabase.from('categories').insert(category)

  if (error) {
    return { error: error.message }
  }

  revalidateTag('categories', 'max')
  return { success: true }
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const imageFile = formData.get('image_file') as File
  let imageUrl = formData.get('image_url') as string || null

  if (imageFile && imageFile.size > 0) {
    const uploadedUrl = await uploadImage(imageFile, 'categories')
    if (uploadedUrl) {
      imageUrl = uploadedUrl
    }
  }

  const category = {
    name: formData.get('name') as string,
    slug: generateSlug(formData.get('name') as string),
    description: formData.get('description') as string || null,
    image_url: imageUrl,
    is_active: formData.get('is_active') === 'true',
  }

  const { error } = await supabase
    .from('categories')
    .update(category)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidateTag('categories', 'max')
  return { success: true }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('categories')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidateTag('categories', 'max')
  return { success: true }
}

export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching all categories:', error)
    return []
  }

  return data || []
}
