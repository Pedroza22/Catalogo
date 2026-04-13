-- 008_fix_permissions_multi_category.sql

-- 1. Actualizar políticas de product_categories para permitir a bodegueros
DROP POLICY IF EXISTS "product_categories_admin_all" ON public.product_categories;

CREATE POLICY "product_categories_staff_all" ON public.product_categories 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'bodeguero')
  )
);

-- 2. Asegurar que las categorías puedan ser leídas por todos
DROP POLICY IF EXISTS "categories_select_all" ON public.categories;
CREATE POLICY "categories_select_all" ON public.categories FOR SELECT TO authenticated, anon USING (true);

-- 3. Asegurar que los productos puedan ser editados por bodegueros (ya debería estar, pero reforzamos)
DROP POLICY IF EXISTS "products_staff_update" ON public.products;
CREATE POLICY "products_staff_update" ON public.products 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'bodeguero')
  )
);

-- 4. Permitir que bodegueros también puedan insertar productos si es necesario
DROP POLICY IF EXISTS "products_staff_insert" ON public.products;
CREATE POLICY "products_staff_insert" ON public.products 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'bodeguero')
  )
);
