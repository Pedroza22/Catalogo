-- 007_multi_category_support.sql
-- 1. Crear la tabla intermedia para productos y categorías
CREATE TABLE IF NOT EXISTS public.product_categories (
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- 2. Habilitar RLS en la nueva tabla
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- 3. Configurar políticas para product_categories
CREATE POLICY "product_categories_select_all" ON public.product_categories FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "product_categories_admin_all" ON public.product_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Migrar datos existentes de products.category_id a la nueva tabla
INSERT INTO public.product_categories (product_id, category_id)
SELECT id, category_id 
FROM public.products 
WHERE category_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 5. Insertar las nuevas categorías solicitadas
INSERT INTO public.categories (name, slug, description)
VALUES 
  ('Hot Brothes', 'hot-brothes', 'Categoría especial Hot Brothes'),
  ('Especial para Restaurante', 'especial-para-restaurante', 'Productos seleccionados para restaurantes'),
  ('Licor', 'licor', 'Variedad de licores'),
  ('Cerveza', 'cerveza', 'Cervezas nacionales e importadas'),
  ('Marcas Exclusivas Ofertas', 'marcas-exclusivas-ofertas', 'Ofertas en nuestras marcas exclusivas')
ON CONFLICT (slug) DO NOTHING;

-- Nota: No eliminamos products.category_id inmediatamente para evitar romper la app 
-- mientras actualizamos el código, pero ya no será la fuente de verdad principal.
