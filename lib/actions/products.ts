'use server'

import { createClient } from '@/lib/supabase/server'
import { updateTag } from 'next/cache'
import type { Product, Category, ProductVariant } from '@/lib/types/database'

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
    // Importamos getAllCategories desde categories.ts para evitar duplicación
    const { getAllCategories } = await import('./categories')
    const categories = await getAllCategories()
    
    // Build hierarchy - categorías principales con sus subcategorías
    const mainCategories = categories.filter(c => !c.parent_id)
    
    return mainCategories.map(main => ({
      ...main,
      subcategories: categories.filter(sub => sub.parent_id === main.id)
    }))
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
      .order('name')

    if (categoryId) {
      // 1. Obtener todas las subcategorías si categoryId es una principal
      const { data: subcategories } = await supabase
        .from('categories')
        .select('id')
        .or(`id.eq.${categoryId},parent_id.eq.${categoryId}`)
      
      const categoryIds = subcategories?.map(c => c.id) || [categoryId]

      // 2. Filtrar por todas las categorías encontradas (principal + hijas)
      const { data: productIds, error: filterError } = await supabase
        .from('product_categories')
        .select('product_id')
        .in('category_id', categoryIds)
      
      if (filterError) {
        console.error('Error filtering by category:', filterError)
        return []
      }

      if (productIds) {
        query = query.in('id', productIds.map(p => p.product_id))
      } else {
        return [] // No hay productos en estas categorías
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
  console.log(`[uploadImage] Iniciando subida de archivo: ${file.name}, tamaño: ${file.size} bytes, tipo: ${file.type}`);
  const supabase = await createClient()
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `${path}/${fileName}`

  console.log(`[uploadImage] Ruta de destino en storage: ${filePath}`);

  const buffer = await file.arrayBuffer()

  // El nombre del bucket es "products" (inglés)
  const { error: uploadError } = await supabase.storage
    .from('products')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true
    })

  if (uploadError) {
    console.error('[uploadImage] Error al subir imagen a Supabase Storage (bucket: products):', uploadError)
    return null
  }

  const { data: { publicUrl } } = supabase.storage
    .from('products')
    .getPublicUrl(filePath)

  console.log(`[uploadImage] Subida exitosa al bucket "productos". URL pública: ${publicUrl}`);
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

  const price = parseFloat(formData.get('price') as string)
  const cost_price = parseFloat(formData.get('cost_price') as string) || 0
  const stock = parseInt(formData.get('stock') as string)
  const min_stock = parseInt(formData.get('min_stock') as string)

  const product = {
    name,
    slug: generateSlug(name),
    description: formData.get('description') as string,
    sku: formData.get('sku') as string,
    price: isNaN(price) ? 0 : price,
    cost_price: isNaN(cost_price) ? 0 : cost_price,
    stock: isNaN(stock) ? 0 : stock,
    min_stock: isNaN(min_stock) ? 5 : min_stock,
    image_url: imageUrl,
    colors: formData.get('colors') ? (formData.get('colors') as string).split(',').filter(Boolean) : [],
    sizes: formData.get('sizes') ? (formData.get('sizes') as string).split(',').filter(Boolean) : [],
    is_active: true,
  }

  const { data: newProduct, error } = await supabase
    .from('products')
    .insert(product)
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      if (error.message.includes('sku')) {
        return { error: 'Ya existe un producto con este SKU. Por favor usa uno diferente.' }
      }
      if (error.message.includes('slug')) {
        return { error: 'Ya existe un producto con un nombre muy similar. Por favor cámbialo ligeramente.' }
      }
    }
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

  // Handle product variants
  const variantsJson = formData.get('variants') as string
  if (variantsJson) {
    try {
      const variants = JSON.parse(variantsJson)
      await upsertProductVariants(newProduct.id, variants)
    } catch (e) {
      console.error('Error parsing variants JSON:', e)
    }
  }

  updateTag('products')
  return { success: true }
}

export async function updateProduct(id: string, formData: FormData) {
  console.log(`[updateProduct] Iniciando actualización para ID: ${id}`);
  const supabase = await createClient()
  
  const imageFile = formData.get('image_file') as File
  console.log(`[updateProduct] Archivo recibido: ${imageFile?.name || 'Ninguno'}, tamaño: ${imageFile?.size || 0} bytes`);

  // Obtenemos la URL actual de la base de datos antes de actualizar
  const { data: currentProduct } = await supabase
    .from('products')
    .select('image_url')
    .eq('id', id)
    .single()

  let imageUrl = currentProduct?.image_url || null
  console.log(`[updateProduct] URL de imagen actual en DB: ${imageUrl}`);

  // Si se subió un nuevo archivo, lo procesamos
  if (imageFile && imageFile.size > 0) {
    console.log('[updateProduct] Se detectó un nuevo archivo. Procediendo a subir...');
    const uploadedUrl = await uploadImage(imageFile, 'images')
    if (uploadedUrl) {
      imageUrl = uploadedUrl
      console.log(`[updateProduct] Nueva URL obtenida tras subida: ${imageUrl}`);
    } else {
      console.error('[updateProduct] No se pudo obtener la URL tras la subida');
    }
  } else {
    console.log('[updateProduct] No se subió un archivo nuevo. Manteniendo imagen actual.');
  }

  const price = parseFloat(formData.get('price') as string)
  const cost_price = parseFloat(formData.get('cost_price') as string) || 0
  const stock = parseInt(formData.get('stock') as string)
  const min_stock = parseInt(formData.get('min_stock') as string)

  const product = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    sku: formData.get('sku') as string,
    price: isNaN(price) ? 0 : price,
    cost_price: isNaN(cost_price) ? 0 : cost_price,
    stock: isNaN(stock) ? 0 : stock,
    min_stock: isNaN(min_stock) ? 5 : min_stock,
    image_url: imageUrl,
    colors: formData.get('colors') ? (formData.get('colors') as string).split(',').filter(Boolean) : [],
    sizes: formData.get('sizes') ? (formData.get('sizes') as string).split(',').filter(Boolean) : [],
    is_active: formData.get('is_active') === 'true',
  }

  console.log('[updateProduct] Datos finales a actualizar en DB:', { ...product, image_url: imageUrl });

  const { error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)

  if (error) {
    console.error('[updateProduct] Error al actualizar producto en base de datos:', error);
    if (error.code === '23505') {
      if (error.message.includes('sku')) {
        return { error: 'Ya existe otro producto con este SKU. Por favor usa uno diferente.' }
      }
      if (error.message.includes('slug')) {
        return { error: 'Ya existe otro producto con un nombre muy similar. Por favor cámbialo ligeramente.' }
      }
    }
    return { error: error.message }
  }

  console.log('[updateProduct] Actualización exitosa en la tabla products');

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

  // Handle product variants
  const variantsJson = formData.get('variants') as string
  if (variantsJson) {
    try {
      const variants = JSON.parse(variantsJson)
      await upsertProductVariants(id, variants)
    } catch (e) {
      console.error('Error parsing variants JSON:', e)
    }
  }

  updateTag('products')
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

  updateTag('products')
  return { success: true }
}

export async function hardDeleteProduct(id: string) {
  const supabase = await createClient()
  
  // Delete related categories first
  const { error: catError } = await supabase
    .from('product_categories')
    .delete()
    .eq('product_id', id)
    
  if (catError) {
    console.error('Error deleting product categories:', catError)
    return { error: catError.message }
  }
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error hard deleting product:', error)
    return { error: error.message }
  }

  updateTag('products')
  return { success: true }
}

export async function toggleProductStatus(id: string, isActive: boolean) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('products')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  updateTag('products')
  return { success: true }
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const imageFile = formData.get('image_file') as File
  const isSub = formData.get('is_sub') === 'true'
  const parentId = isSub ? (formData.get('parent_id') as string) : null
  
  let imageUrl = null

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
    parent_id: parentId || null,
    is_active: true,
  }

  const { error } = await supabase.from('categories').insert(category)

  if (error) {
    return { error: error.message }
  }

  updateTag('categories')
  updateTag('products') 
  return { success: true }
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const imageFile = formData.get('image_file') as File
  const isSub = formData.get('is_sub') === 'true'
  const parentId = isSub ? (formData.get('parent_id') as string) : null
  
  // Obtener la URL actual de la categoría
  const { data: currentCategory } = await supabase
    .from('categories')
    .select('image_url')
    .eq('id', id)
    .single()

  let imageUrl = currentCategory?.image_url || null

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
    parent_id: parentId || null,
    is_active: formData.get('is_active') === 'true',
  }

  const { error } = await supabase
    .from('categories')
    .update(category)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  updateTag('categories')
  updateTag('products')
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

  updateTag('categories')
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

// ========== PRODUCT VARIANTS FUNCTIONS ==========

export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .order('size')
    .order('color')

  if (error) {
    console.error('Error fetching product variants:', error)
    return []
  }

  return data || []
}

export async function getProductWithVariants(id: string): Promise<Product | null> {
  const supabase = await createClient()
  
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*, product_categories(categories(*))')
    .eq('id', id)
    .single()

  if (productError) {
    console.error('Error fetching product:', productError)
    return null
  }

  const variants = await getProductVariants(id)

  return {
    ...product,
    categories: product.product_categories?.map((pc: any) => pc.categories).filter(Boolean) || [],
    variants
  }
}

export async function createProductVariant(variant: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('product_variants')
    .insert(variant)
    .select('*')
    .single()

  if (error) {
    console.error('Error creating product variant:', error)
    return { error: error.message }
  }

  updateTag('products')
  return { success: true, variant: data }
}

export async function updateProductVariant(id: string, variant: Partial<Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>>) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('product_variants')
    .update(variant)
    .eq('id', id)

  if (error) {
    console.error('Error updating product variant:', error)
    return { error: error.message }
  }

  updateTag('products')
  return { success: true }
}

export async function deleteProductVariant(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('product_variants')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting product variant:', error)
    return { error: error.message }
  }

  updateTag('products')
  return { success: true }
}

export async function upsertProductVariants(productId: string, variants: Array<Partial<ProductVariant>>) {
  const supabase = await createClient()
  
  // Delete existing variants first
  const { error: deleteError } = await supabase
    .from('product_variants')
    .delete()
    .eq('product_id', productId)

  if (deleteError) {
    console.error('Error deleting existing variants:', deleteError)
    return { error: deleteError.message }
  }

  // Insert new variants if any
  if (variants.length > 0) {
    const variantsToInsert = variants.map(v => ({
      product_id: productId,
      size: v.size,
      color: v.color,
      fragrance: v.fragrance,
      price: v.price || 0,
      cost_price: v.cost_price || 0,
      stock: v.stock || 0,
      sku: v.sku,
      is_active: v.is_active !== false
    }))

    const { error: insertError } = await supabase
      .from('product_variants')
      .insert(variantsToInsert)

    if (insertError) {
      console.error('Error inserting variants:', insertError)
      return { error: insertError.message }
    }
  }

  updateTag('products')
  return { success: true }
}
