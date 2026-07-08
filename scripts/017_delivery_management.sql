-- =============================================
-- Módulo de Gestión de Entregas y Domicilios
-- =============================================

-- Tabla de configuración general de entregas
CREATE TABLE IF NOT EXISTS delivery_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  city_name TEXT NOT NULL DEFAULT 'Tu Ciudad',
  out_of_city_message TEXT NOT NULL DEFAULT 'Los pedidos para fuera de la ciudad deben coordinarse directamente con nosotros.',
  contact_email TEXT,
  contact_phone TEXT,
  whatsapp_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar valores predeterminados
INSERT INTO delivery_settings (city_name, out_of_city_message, contact_email, contact_phone)
VALUES ('Tu Ciudad', 'Los pedidos para fuera de la ciudad deben coordinarse directamente con nosotros.', 'contacto@tudominio.com', '+57 123 456 7890')
ON CONFLICT DO NOTHING;

-- Tabla de días de entrega
CREATE TABLE IF NOT EXISTS delivery_days (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  custom_name TEXT,
  delivery_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(day_of_week)
);

-- Insertar días predeterminados
INSERT INTO delivery_days (day_of_week, custom_name, delivery_cost, is_active)
VALUES
  (1, 'Lunes', 5000, TRUE),
  (2, 'Martes', 5000, TRUE),
  (3, 'Miércoles', 5000, TRUE),
  (4, 'Jueves', 5000, TRUE),
  (5, 'Viernes', 5000, TRUE),
  (6, 'Sábado', 8000, TRUE),
  (0, 'Domingo', 10000, FALSE)
ON CONFLICT (day_of_week) DO NOTHING;

-- Tabla de políticas de entrega por categoría
CREATE TABLE IF NOT EXISTS category_delivery_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  min_purchase_for_delivery NUMERIC(10, 2) NOT NULL DEFAULT 0,
  min_purchase_for_free_delivery NUMERIC(10, 2) NOT NULL DEFAULT 500000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id)
);

-- Agregar columnas a la tabla de órdenes para almacenar la entrega
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_date DATE,
ADD COLUMN IF NOT EXISTS delivery_cost NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_free_delivery BOOLEAN DEFAULT FALSE;

-- Agregar columna a perfiles para verificar si la dirección es de la ciudad
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_in_city BOOLEAN DEFAULT TRUE;
