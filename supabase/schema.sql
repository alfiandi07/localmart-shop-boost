-- ============================================================================
-- LOCALMART - SUPABASE DATABASE SCHEMA
-- Project URL: https://omxadxkqlvptlvruvhco.supabase.co
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Products Table (Master Katalog Produk)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    available_sizes TEXT[] DEFAULT '{}',
    description TEXT,
    image_url TEXT,
    action_text TEXT DEFAULT 'Pesan',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Customers Table (Master Data Pelanggan / Leads)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_code TEXT UNIQUE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    city TEXT,
    shipping_address TEXT,
    total_orders INTEGER NOT NULL DEFAULT 0,
    total_spent NUMERIC NOT NULL DEFAULT 0,
    last_order_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Orders Table (Transaksi & Formulir Pesanan)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_code TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    product_name TEXT NOT NULL,
    size TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_per_unit NUMERIC NOT NULL DEFAULT 0,
    total_price NUMERIC NOT NULL DEFAULT 0,
    shipping_address TEXT,
    notes TEXT,
    payment_method TEXT NOT NULL DEFAULT 'WHATSAPP_CONFIRM',
    payment_status TEXT NOT NULL DEFAULT 'UNPAID',
    order_status TEXT NOT NULL DEFAULT 'PENDING',
    tracking_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Inquiries Table (Konsultasi & Pertanyaan Pengunjung)
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inquiry_code TEXT UNIQUE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    product_interest TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'NEW',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Trigger: Otomatis Update / Insert ke Tabel Customers saat ada Pesanan Baru
CREATE OR REPLACE FUNCTION public.handle_new_order()
RETURNS TRIGGER AS $$
DECLARE
    v_customer_id UUID;
    v_clean_phone TEXT;
BEGIN
    -- Normalisasi nomor HP (08xx -> 628xx)
    v_clean_phone := REGEXP_REPLACE(NEW.customer_phone, '[^0-9]', '', 'g');
    IF v_clean_phone LIKE '08%' THEN
        v_clean_phone := '628' || SUBSTRING(v_clean_phone FROM 3);
    END IF;

    -- Upsert ke tabel Customers berdasarkan nomor HP
    INSERT INTO public.customers (
        name,
        phone,
        city,
        shipping_address,
        total_orders,
        total_spent,
        last_order_date
    ) VALUES (
        NEW.customer_name,
        v_clean_phone,
        COALESCE(NEW.shipping_address, 'Jakarta'),
        NEW.shipping_address,
        1,
        NEW.total_price,
        NEW.created_at
    )
    ON CONFLICT (phone) DO UPDATE SET
        name = EXCLUDED.name,
        total_orders = public.customers.total_orders + 1,
        total_spent = public.customers.total_spent + EXCLUDED.total_spent,
        last_order_date = EXCLUDED.last_order_date,
        updated_at = timezone('utc'::text, now())
    RETURNING id INTO v_customer_id;

    -- Pasang relasi customer_id ke pesanan
    NEW.customer_id := v_customer_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_created ON public.orders;
CREATE TRIGGER on_order_created
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_order();

-- 7. Row Level Security (RLS) Policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Produk: Publik dapat melihat produk yang aktif
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
CREATE POLICY "Public can view active products" 
    ON public.products FOR SELECT 
    USING (is_active = TRUE);

-- Pesanan: Publik dapat mengirim pesanan baru dan membaca status pesanan
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
CREATE POLICY "Public can insert orders" 
    ON public.orders FOR INSERT 
    WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public can view orders" ON public.orders;
CREATE POLICY "Public can view orders" 
    ON public.orders FOR SELECT 
    USING (TRUE);

-- Inquiries: Publik dapat mengirim pertanyaan
DROP POLICY IF EXISTS "Public can insert inquiries" ON public.inquiries;
CREATE POLICY "Public can insert inquiries" 
    ON public.inquiries FOR INSERT 
    WITH CHECK (TRUE);

-- Customers: Diizinkan dibaca dan di-update melalui trigger atau API
DROP POLICY IF EXISTS "Public can access customers" ON public.customers;
CREATE POLICY "Public can access customers" 
    ON public.customers FOR ALL 
    USING (TRUE) 
    WITH CHECK (TRUE);

-- 8. Data Awal (Seed Data)
INSERT INTO public.products (id, name, category, price, stock, available_sizes, description, image_url, is_active)
VALUES 
    ('PRD-001', 'Sepatu Minisoccer Aerion', 'Sepatu Minisoccer', 210000, 25, ARRAY['39','40','41','42','43'], 'Sepatu andalan dengan sol bergerigi, lentur, dan ringan. Bikin manuver makin lincah di lapangan.', 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06', TRUE),
    ('PRD-002', 'Sepatu Futsal Aerion', 'Sepatu Futsal', 190000, 30, ARRAY['39','40','41','42','43'], 'Pilihan tepat untuk futsal yang ringan dan nyaman. Main puas tanpa khawatir kaki pegal.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', TRUE),
    ('PRD-003', 'Kaos Kaki & Dekker', 'Aksesoris Olahraga', NULL, 50, ARRAY['All Size'], 'Lengkapi aksi main dengan aksesoris pelindung berkualitas. Nyaman dipakai dan melindungi dengan baik.', 'https://images.unsplash.com/photo-1579298245158-33e8f568f7d3', TRUE)
ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    is_active = EXCLUDED.is_active;

INSERT INTO public.customers (customer_code, name, phone, city, shipping_address, total_orders, total_spent, last_order_date)
VALUES 
    ('CUST-0001', 'Budi Santoso', '6289652914049', 'Jakarta Pusat', 'Jl. Kemayoran Ketapang No. 12, Jakarta Pusat', 2, 400000, now()),
    ('CUST-0002', 'Dimas Pratama', '6281234567890', 'Jakarta Selatan', 'Jl. Fatmawati No. 45, Jakarta Selatan', 1, 210000, now()),
    ('CUST-0003', 'Rizky Ramadhan', '6285712345678', 'Jakarta Barat', 'Jl. Tanjung Duren Raya No. 8, Jakarta Barat', 3, 590000, now())
ON CONFLICT (phone) DO NOTHING;
