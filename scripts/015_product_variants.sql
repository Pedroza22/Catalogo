-- Product Variants Table - For products with different sizes, prices, and stock
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size TEXT,
    color TEXT,
    price NUMERIC(10,2) NOT NULL,
    cost_price NUMERIC(10,2) DEFAULT 0,
    stock INTEGER DEFAULT 0,
    sku TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);

-- Enable Row Level Security
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow authenticated users to read product variants"
    ON product_variants FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert product variants"
    ON product_variants FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update product variants"
    ON product_variants FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to delete product variants"
    ON product_variants FOR DELETE
    TO authenticated
    USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_product_variants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_product_variants_updated_at
    BEFORE UPDATE ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_product_variants_updated_at();
