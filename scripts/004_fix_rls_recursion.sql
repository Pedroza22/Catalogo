-- Fix infinite recursion in RLS policies
-- The issue is that policies reference profiles which has its own policies

-- First, drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuarios pueden insertar su propio perfil" ON profiles;
DROP POLICY IF EXISTS "Admins pueden ver todos los perfiles" ON profiles;
DROP POLICY IF EXISTS "allow_select_own_profile" ON profiles;
DROP POLICY IF EXISTS "allow_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "allow_update_own_profile" ON profiles;

DROP POLICY IF EXISTS "categories_public_read" ON categories;
DROP POLICY IF EXISTS "categories_admin_all" ON categories;
DROP POLICY IF EXISTS "Todos pueden ver categorías activas" ON categories;
DROP POLICY IF EXISTS "Admins pueden gestionar categorías" ON categories;

DROP POLICY IF EXISTS "products_public_read" ON products;
DROP POLICY IF EXISTS "products_admin_all" ON products;
DROP POLICY IF EXISTS "Todos pueden ver productos activos" ON products;
DROP POLICY IF EXISTS "Admins pueden gestionar productos" ON products;

DROP POLICY IF EXISTS "orders_select_own" ON orders;
DROP POLICY IF EXISTS "orders_insert_own" ON orders;
DROP POLICY IF EXISTS "orders_update_own" ON orders;
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios pedidos" ON orders;
DROP POLICY IF EXISTS "Usuarios pueden crear pedidos" ON orders;
DROP POLICY IF EXISTS "Admins pueden ver todos los pedidos" ON orders;
DROP POLICY IF EXISTS "Admins pueden actualizar pedidos" ON orders;

DROP POLICY IF EXISTS "order_items_select_own" ON order_items;
DROP POLICY IF EXISTS "order_items_insert_own" ON order_items;
DROP POLICY IF EXISTS "Usuarios pueden ver items de sus pedidos" ON order_items;
DROP POLICY IF EXISTS "Usuarios pueden crear items de pedidos" ON order_items;

DROP POLICY IF EXISTS "inventory_movements_admin" ON inventory_movements;
DROP POLICY IF EXISTS "Admins pueden gestionar movimientos de inventario" ON inventory_movements;

DROP POLICY IF EXISTS "credit_movements_select_own" ON credit_movements;
DROP POLICY IF EXISTS "credit_movements_admin" ON credit_movements;
DROP POLICY IF EXISTS "Usuarios pueden ver sus movimientos de crédito" ON credit_movements;
DROP POLICY IF EXISTS "Admins pueden gestionar movimientos de crédito" ON credit_movements;

-- Now create simple, non-recursive policies

-- PROFILES: Simple policies that only check auth.uid() directly
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- CATEGORIES: Public read access (no auth needed for viewing)
CREATE POLICY "categories_select_public" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_insert" ON categories FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "categories_admin_update" ON categories FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "categories_admin_delete" ON categories FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- PRODUCTS: Public read access (no auth needed for viewing)
CREATE POLICY "products_select_public" ON products FOR SELECT USING (true);
CREATE POLICY "products_admin_insert" ON products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "products_admin_update" ON products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "products_admin_delete" ON products FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ORDERS: Users can see their own, admins can see all
CREATE POLICY "orders_select" ON orders FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "orders_update" ON orders FOR UPDATE USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ORDER_ITEMS: Users can see items from their orders
CREATE POLICY "order_items_select" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')))
);
CREATE POLICY "order_items_insert" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- INVENTORY_MOVEMENTS: Admin only
CREATE POLICY "inventory_movements_admin_select" ON inventory_movements FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "inventory_movements_admin_insert" ON inventory_movements FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- CREDIT_MOVEMENTS: Users can see their own, admins can manage all
CREATE POLICY "credit_movements_select" ON credit_movements FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "credit_movements_admin_insert" ON credit_movements FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
