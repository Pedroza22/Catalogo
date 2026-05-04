'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product, CartItem } from '@/lib/types/database'

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, quantity?: number, color?: string | null, size?: string | null) => void
  removeItem: (productId: string, color?: string | null, size?: string | null) => void
  updateQuantity: (productId: string, quantity: number, color?: string | null, size?: string | null) => void
  clearCart: () => void
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  // 1. Suscribirse a cambios de autenticación
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserId(session.user.id)
      } else {
        setUserId(null)
        setItems([]) // Limpiar carrito al cerrar sesión
      }
    })

    // Verificar sesión inicial
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // 2. Cargar carrito (desde DB si hay usuario, o localStorage)
  useEffect(() => {
    async function loadCart() {
      if (userId) {
        // Si hay usuario, cargar de la base de datos
        const { data, error } = await supabase
          .from('shopping_cart')
          .select('quantity, product_id, selected_color, selected_size, products(*, product_categories(categories(*)))')
          .eq('user_id', userId)

        if (!error && data) {
          const dbItems: CartItem[] = data.map((row: any) => ({
            quantity: row.quantity,
            selected_color: row.selected_color,
            selected_size: row.selected_size,
            product: {
              ...row.products,
              categories: row.products.product_categories?.map((pc: any) => pc.categories).filter(Boolean) || []
            }
          }))

          // Revisar si había items locales para fusionarlos
          const localCart = localStorage.getItem('shopping-cart')
          if (localCart) {
            try {
              const parsedLocal: CartItem[] = JSON.parse(localCart)
              if (parsedLocal.length > 0) {
                // Sincronizar items locales hacia la base de datos (simplificado)
                for (const localItem of parsedLocal) {
                  const existing = dbItems.find(i => 
                    i.product.id === localItem.product.id && 
                    i.selected_color === localItem.selected_color &&
                    i.selected_size === localItem.selected_size
                  )
                  if (!existing) {
                    await supabase.from('shopping_cart').insert({
                      user_id: userId,
                      product_id: localItem.product.id,
                      quantity: localItem.quantity,
                      selected_color: localItem.selected_color,
                      selected_size: localItem.selected_size
                    })
                    dbItems.push(localItem)
                  }
                }
              }
            } catch (e) {
              console.error('Error parseando carrito local', e)
            }
            // Limpiar localStorage después de fusionar
            localStorage.removeItem('shopping-cart')
          }
          
          // Deduplicar items por seguridad antes de setear el estado
          const uniqueItems = dbItems.reduce((acc: CartItem[], current) => {
            const x = acc.find(item => 
              item.product.id === current.product.id && 
              item.selected_color === current.selected_color &&
              item.selected_size === current.selected_size
            )
            if (!x) {
              return acc.concat([current])
            } else {
              x.quantity += current.quantity
              return acc
            }
          }, [])

          setItems(uniqueItems)
        }
      } else {
        // Si NO hay usuario, usar localStorage
        const savedCart = localStorage.getItem('shopping-cart')
        if (savedCart) {
          try {
            setItems(JSON.parse(savedCart))
          } catch (e) {
            console.error('Error parseando carrito desde localStorage', e)
          }
        }
      }
      setIsInitialized(true)
    }

    loadCart()
  }, [userId, supabase])

  // 3. Funciones modificadoras
  const addItem = useCallback(async (product: Product, quantity = 1, color: string | null = null, size: string | null = null) => {
    setItems(current => {
      const existing = current.find(item => 
        item.product.id === product.id && 
        item.selected_color === color &&
        item.selected_size === size
      )
      
      let newItems: CartItem[]
      if (existing) {
        newItems = current.map(item => 
          (item.product.id === product.id && item.selected_color === color && item.selected_size === size)
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        )
      } else {
        newItems = [...current, { product, quantity, selected_color: color, selected_size: size }]
      }
      
      // Guardar en DB si hay usuario, o localStorage si no
      if (userId) {
        if (existing) {
          const query = supabase.from('shopping_cart')
            .update({ quantity: existing.quantity + quantity })
            .eq('user_id', userId)
            .eq('product_id', product.id)
          
          if (color === null) {
            query.is('selected_color', null)
          } else {
            query.eq('selected_color', color)
          }

          if (size === null) {
            query.is('selected_size', null)
          } else {
            query.eq('selected_size', size)
          }

          query.then()
        } else {
          supabase.from('shopping_cart').insert({ 
            user_id: userId, 
            product_id: product.id, 
            quantity,
            selected_color: color,
            selected_size: size
          }).then()
        }
      } else {
        localStorage.setItem('shopping-cart', JSON.stringify(newItems))
      }
      return newItems
    })
  }, [userId, supabase])

  const removeItem = useCallback((productId: string, color: string | null = null, size: string | null = null) => {
    setItems(current => {
      const newItems = current.filter(item => 
        !(item.product.id === productId && item.selected_color === color && item.selected_size === size)
      )
      
      if (userId) {
        const query = supabase.from('shopping_cart').delete().eq('user_id', userId).eq('product_id', productId)
        if (color === null) {
          query.is('selected_color', null)
        } else {
          query.eq('selected_color', color)
        }

        if (size === null) {
          query.is('selected_size', null)
        } else {
          query.eq('selected_size', size)
        }

        query.then()
      } else {
        localStorage.setItem('shopping-cart', JSON.stringify(newItems))
      }
      return newItems
    })
  }, [userId, supabase])

  const updateQuantity = useCallback((productId: string, quantity: number, color: string | null = null, size: string | null = null) => {
    if (quantity <= 0) {
      removeItem(productId, color, size)
      return
    }
    
    setItems(current => {
      const newItems = current.map(item => 
        (item.product.id === productId && item.selected_color === color && item.selected_size === size)
          ? { ...item, quantity } 
          : item
      )
      
      if (userId) {
        const query = supabase.from('shopping_cart').update({ quantity }).eq('user_id', userId).eq('product_id', productId)
        if (color === null) {
          query.is('selected_color', null)
        } else {
          query.eq('selected_color', color)
        }

        if (size === null) {
          query.is('selected_size', null)
        } else {
          query.eq('selected_size', size)
        }

        query.then()
      } else {
        localStorage.setItem('shopping-cart', JSON.stringify(newItems))
      }
      return newItems
    })
  }, [removeItem, userId, supabase])

  const clearCart = useCallback(() => {
    setItems([])
    if (userId) {
      supabase.from('shopping_cart').delete().eq('user_id', userId).then()
    } else {
      localStorage.removeItem('shopping-cart')
    }
  }, [userId, supabase])

  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
