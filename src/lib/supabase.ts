import { createClient } from '@supabase/supabase-js';
import {
  type CreateOrderInput,
  CreateOrderInputSchema,
  type CreateInquiryInput,
  CreateInquiryInputSchema,
  type Order,
  type Product,
  type Customer,
} from '@/types/database';

/**
 * Konfigurasi Supabase Client
 * Domain: https://omxadxkqlvptlvruvhco.supabase.co
 */
const DEFAULT_SUPABASE_URL = 'https://omxadxkqlvptlvruvhco.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9teGFkeGtxbHZwdGx2cnV2aGNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4Njk3MDcsImV4cCI6MjEwNzQ0NTcwN30.G1iiJInj5qMF2D-f4GNoxeiAEpXiKqpqWlHUcc-zAks';

const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  DEFAULT_SUPABASE_URL;

const SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Memeriksa apakah kredensial Supabase sudah aktif
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * Helper: Mengirim pesanan baru ke Supabase Database
 */
export async function submitOrderToSupabase(input: CreateOrderInput) {
  const validation = CreateOrderInputSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false as const,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  try {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const orderCode = `ORD-${dateStr}-${randomSuffix}`;

    const { data: productData } = await supabase
      .from('products')
      .select('price')
      .ilike('name', `%${validation.data.productName}%`)
      .maybeSingle();

    const pricePerUnit = Number(productData?.price) || 0;
    const totalPrice = pricePerUnit > 0 ? pricePerUnit * (validation.data.quantity || 1) : 0;

    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          order_code: orderCode,
          customer_name: validation.data.customerName,
          customer_phone: validation.data.customerPhone,
          product_name: validation.data.productName,
          size: validation.data.size || null,
          quantity: validation.data.quantity || 1,
          price_per_unit: pricePerUnit,
          total_price: totalPrice,
          shipping_address: validation.data.shippingAddress || null,
          notes: validation.data.notes || null,
          payment_method: validation.data.paymentMethod || 'WHATSAPP_CONFIRM',
          payment_status: 'UNPAID',
          order_status: 'PENDING',
        },
      ])
      .select('id, order_code, total_price')
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true as const,
      data: {
        orderId: data.order_code,
        totalPrice: Number(data.total_price),
      },
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Gagal menyimpan pesanan ke Supabase.',
    };
  }
}

/**
 * Helper: Mengambil daftar produk dari tabel products Supabase
 */
export async function fetchProductsFromSupabase(): Promise<{
  success: boolean;
  data?: Product[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('id', { ascending: true });

    if (error) throw error;

    const products: Product[] = (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      price: row.price !== null ? Number(row.price) : null,
      stock: Number(row.stock) || 0,
      availableSizes: row.available_sizes || [],
      description: row.description || '',
      imageUrl: row.image_url || '',
      actionText: row.action_text || 'Pesan',
      isActive: row.is_active,
    }));

    return { success: true, data: products };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal mengambil data produk dari Supabase.',
    };
  }
}

/**
 * Helper: Mengambil daftar pelanggan dari tabel customers Supabase
 */
export async function fetchCustomersFromSupabase(): Promise<{
  success: boolean;
  data?: Customer[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('total_orders', { ascending: false });

    if (error) throw error;

    const customers: Customer[] = (data || []).map((row) => ({
      customerId: row.customer_code || row.id,
      name: row.name,
      phone: row.phone,
      city: row.city || '',
      shippingAddress: row.shipping_address || '',
      totalOrders: Number(row.total_orders) || 0,
      totalSpent: Number(row.total_spent) || 0,
      lastOrderDate: row.last_order_date || row.created_at,
      firstRegistered: row.created_at,
    }));

    return { success: true, data: customers };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal mengambil data pelanggan dari Supabase.',
    };
  }
}

/**
 * Helper: Mengirim pesan konsultasi / pertanyaan ke tabel inquiries Supabase
 */
export async function submitInquiryToSupabase(input: CreateInquiryInput) {
  const validation = CreateInquiryInputSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false as const,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  try {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const inquiryCode = `INQ-${dateStr}-${randomSuffix}`;

    const { data, error } = await supabase
      .from('inquiries')
      .insert([
        {
          inquiry_code: inquiryCode,
          name: validation.data.name,
          phone: validation.data.phone,
          product_interest: validation.data.productInterest || null,
          message: validation.data.message,
          status: 'NEW',
        },
      ])
      .select('id, inquiry_code')
      .single();

    if (error) throw error;

    return {
      success: true as const,
      data: { inquiryId: data.inquiry_code },
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : 'Gagal mengirim konsultasi ke Supabase.',
    };
  }
}
