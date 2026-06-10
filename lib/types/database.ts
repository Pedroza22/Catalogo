export type UserRole = 'admin' | 'bodeguero' | 'cliente'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  address: string | null
  role: UserRole
  credit_limit: number
  credit_used: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  is_active: boolean
  colors: string[]
  created_at: string
  subcategories?: Category[]
}

export interface Banner {
  id: string
  title: string
  subtitle: string | null
  image_url: string | null
  background_color: string | null
  button_text: string | null
  button_link: string | null
  is_active: boolean
  order: number
  created_at: string
}

export interface Product {
  id: string
  category_id: string | null
  name: string
  slug: string
  description: string | null
  sku: string | null
  price: number
  cost_price: number
  stock: number
  min_stock: number
  image_url: string | null
  is_active: boolean
  colors?: string[]
  sizes?: string[]
  created_at: string
  updated_at: string
  category?: Category
  categories?: Category[]
}

export type OrderStatus = 'pendiente' | 'preparando' | 'despachado' | 'entregado' | 'cancelado'
export type PaymentMethod = 'efectivo' | 'credito'

export interface Order {
  id: string
  user_id: string
  status: OrderStatus
  payment_method: PaymentMethod
  total: number
  notes: string | null
  shipping_address: string | null
  created_at: string
  updated_at: string
  client?: Profile
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
  selected_color: string | null
  selected_size: string | null
  product?: Product
}

export type MovementType = 'entrada' | 'salida' | 'ajuste'

export interface InventoryMovement {
  id: string
  product_id: string
  user_id: string
  type: MovementType
  quantity: number
  reason: string | null
  created_at: string
  product?: Product
  user?: Profile
}

export type CreditMovementType = 'uso' | 'pago' | 'ajuste'

export interface CreditMovement {
  id: string
  user_id: string
  order_id: string | null
  type: CreditMovementType
  amount: number
  description: string | null
  created_at: string
  order?: Order
}

export interface CartItem {
  product: Product
  quantity: number
  selected_color?: string | null
  selected_size?: string | null
}
