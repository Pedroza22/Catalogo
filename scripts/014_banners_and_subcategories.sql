-- Añadir parent_id a la tabla de categorías
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Crear tabla de banners
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  background_color TEXT DEFAULT 'from-primary to-primary/70',
  button_text TEXT,
  button_link TEXT,
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS para banners
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Políticas para banners
CREATE POLICY "banners_select_all" ON public.banners FOR SELECT USING (is_active = true OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "banners_admin_all" ON public.banners FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Insertar algunos banners iniciales basados en los hardcodeados
INSERT INTO public.banners (title, subtitle, background_color, "order")
VALUES 
('¡Gran Promoción en Aseo!', 'Hasta 20% de descuento en productos seleccionados.', 'from-blue-600 to-cyan-500', 1),
('Nuevos Productos', 'Descubre la nueva línea de contenedores y empaques.', 'from-primary to-primary/70', 2),
('Ofertas Exclusivas', 'Aprovecha precios especiales para compras al por mayor.', 'from-orange-500 to-yellow-400', 3)
ON CONFLICT DO NOTHING;
