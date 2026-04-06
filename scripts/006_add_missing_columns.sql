-- Script para agregar columnas faltantes a la tabla de productos
-- Esto soluciona el error de "column cost_price does not exist"

-- 1. Agregar columnas si no existen
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='cost_price') THEN
        ALTER TABLE public.products ADD COLUMN cost_price DECIMAL(12,2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='sku') THEN
        ALTER TABLE public.products ADD COLUMN sku TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='slug') THEN
        ALTER TABLE public.products ADD COLUMN slug TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='min_stock') THEN
        ALTER TABLE public.products ADD COLUMN min_stock INTEGER NOT NULL DEFAULT 5;
    END IF;
END $$;

-- 2. Asegurarse de que slug sea único (si hay datos, esto podría fallar si hay nombres duplicados)
-- Primero poblamos los slugs vacíos basados en el nombre si es necesario
UPDATE public.products 
SET slug = LOWER(REPLACE(name, ' ', '-')) 
WHERE slug IS NULL;

-- Agregamos la restricción de unicidad si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_slug_key') THEN
        ALTER TABLE public.products ADD CONSTRAINT products_slug_key UNIQUE (slug);
    END IF;
END $$;
