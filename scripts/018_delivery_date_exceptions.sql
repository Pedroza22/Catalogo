-- Create delivery_date_exceptions table
CREATE TABLE IF NOT EXISTS delivery_date_exceptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  is_available BOOLEAN DEFAULT false NOT NULL,
  custom_name TEXT,
  delivery_cost NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE delivery_date_exceptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access"
  ON delivery_date_exceptions
  FOR SELECT
  USING (true);

CREATE POLICY "Allow admin write access"
  ON delivery_date_exceptions
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Create index for date
CREATE INDEX IF NOT EXISTS idx_delivery_date_exceptions_date
  ON delivery_date_exceptions(date);
