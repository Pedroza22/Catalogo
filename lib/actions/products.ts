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
      console.error('Error fetching categories detail:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      return []
    }

    return data || []
  } catch (err) {
    console.error('Unexpected error in getCategories:', err)
    return []
  }
}

export async function getProducts(categoryId?: string): Promise<Product[]> {
  try {
    const supabase = await createClient()
    
    let query = supabase
      .from('products')
      .select('*, product_categories(categories(*))')
      .eq('is_active', true)
      .gt('stock', 0) // Ocultar productos sin stock en el catálogo público
      .order('name')

    if (categoryId) {
      // Filtrar por categoría en la tabla intermedia
      const { data: productIds, error: filterError } = await supabase
        .from('product_categories')
        .select('product_id')
        .eq('category_id', categoryId)
      
      if (filterError) {
        console.error('Error filtering by category:', filterError)
        return []
      }

      if (productIds) {
        query = query.in('id', productIds.map(p => p.product_id))
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching products detail:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return []
    }

    // Transformar la respuesta para que sea compatible con la interfaz Product
    const transformedProducts = (data || []).map((p: any) => ({
      ...p,
      categories: p.product_categories?.map((pc: any) => pc.categories).filter(Boolean) || []
    }))

    return transformedProducts
  } catch (err) {
    console.error('Unexpected error in getProducts:', err)
    return []
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('*, product_categories(categories(*))')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product:', {
      message: error.message,
      details: error.details,
      code: error.code
    })
    return null
  }

  // Transformar para incluir la lista plana de categorías
  return {
    ...data,
    categories: data.product_categories?.map((pc: any) => pc.categories).filter(Boolean) || []
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('*, product_categories(categories(*))')
    .order('name')

  if (error) {
    console.error('Error fetching all products:', {
      message: error.message,
      details: error.details,
      code: error.code
    })
    return []
  }

  return (data || []).map((p: any) => ({
    ...p,
    categories: p.product_categories?.map((pc: any) => pc.categories).filter(Boolean) || []
  }))
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
    image_url: imageUrl,
    is_active: true,
  }

  const { data: newProduct, error } = await supabase
    .from('products')
    .insert(product)
    .select('id')
    .single()

  if (error) {
    return { error: error.message }
  }

  // Manejar múltiples categorías
  const categoryIds = formData.getAll('category_ids') as string[]
  if (categoryIds.length > 0) {
    const productCategories = categoryIds.map(catId => ({
      product_id: newProduct.id,
      category_id: catId
    }))
    await supabase.from('product_categories').insert(productCategories)
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

  // Actualizar categorías (borrar y volver a insertar)
  const categoryIds = formData.getAll('category_ids') as string[]
  
  // Siempre intentamos limpiar las categorías actuales
  const { error: deleteError } = await supabase.from('product_categories').delete().eq('product_id', id)
  
  if (deleteError) {
    console.error('Error deleting old categories:', deleteError)
  }

  // Si hay nuevas categorías, las insertamos
  if (categoryIds.length > 0) {
    const productCategories = categoryIds.map(catId => ({
      product_id: id,
      category_id: catId
    }))
    const { error: insertError } = await supabase.from('product_categories').insert(productCategories)
    if (insertError) {
      console.error('Error inserting new categories:', insertError)
    }
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
