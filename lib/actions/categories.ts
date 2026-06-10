'use server'

import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/lib/types/database'

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
