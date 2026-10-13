import { z } from 'zod';

/**
 * ============================================================================
 * ENTITAS DATABASE GOOGLE SHEETS - LOCALMART
 * ============================================================================
 * Struktur data ini dirancang untuk bekerja dengan Google Sheets sebagai basis data
 * melalui Google Apps Script (Web App endpoint).
 */

// ----------------------------------------------------------------------------
// 1. Entitas: Products (Katalog Produk)
// Sheet Tab: "Products"
// ----------------------------------------------------------------------------
export const ProductSchema = z.object({
  id: z.string().describe('ID unik produk, misal: PRD-001'),
  name: z.string().min(1, 'Nama produk wajib diisi'),
  category: z.enum(['Sepatu Minisoccer', 'Sepatu Futsal', 'Aksesoris Olahraga', 'Lainnya']),
  price: z.number().nullable().describe('Harga dalam IDR, null jika produk perlu konsultasi/inquiry'),
  stock: z.number().int().nonnegative().default(0),
  availableSizes: z.array(z.string()).default([]).describe('Pilihan ukuran sepatu, misal: ["39", "40", "41", "42"]'),
  description: z.string(),
  imageUrl: z.string().url().or(z.string()).optional(),
  actionText: z.string().default('Pesan'),
  isActive: z.boolean().default(true),
});

export type Product = z.infer<typeof ProductSchema>;

// ----------------------------------------------------------------------------
// 2. Entitas: Orders (Transaksi / Pesanan)
// Sheet Tab: "Orders"
// ----------------------------------------------------------------------------
export const OrderStatusSchema = z.enum([
  'PENDING',    // Pesanan baru masuk dari website
  'CONFIRMED',  // Dikonfirmasi oleh admin LocalMart via WhatsApp
  'PAID',       // Pembayaran diterima
  'SHIPPED',    // Barang dikirim
  'COMPLETED',  // Barang diterima pelanggan
  'CANCELLED',  // Pesanan dibatalkan
]);

export const PaymentMethodSchema = z.enum([
  'TRANSFER_BANK',
  'QRIS',
  'COD',
  'WHATSAPP_CONFIRM', // Konfirmasi langsung via chat WA
]);

export const PaymentStatusSchema = z.enum([
  'UNPAID',
  'PAID',
  'REFUNDED',
]);

export const OrderSchema = z.object({
  orderId: z.string().describe('Kode unik pesanan, misal: ORD-20261013-001'),
  createdAt: z.string().describe('Waktu pemesanan (ISO string atau format YYYY-MM-DD HH:mm:ss)'),
  customerName: z.string().min(2, 'Nama pelanggan minimal 2 karakter'),
  customerPhone: z.string().min(9, 'Nomor telepon / WhatsApp valid wajib diisi'),
  productName: z.string().min(1, 'Nama produk wajib dipilih'),
  size: z.string().optional().describe('Ukuran sepatu jika ada'),
  quantity: z.number().int().min(1, 'Jumlah pesanan minimal 1'),
  pricePerUnit: z.number().nonnegative().default(0),
  totalPrice: z.number().nonnegative().default(0),
  shippingAddress: z.string().optional().describe('Alamat pengiriman / kota pelanggan'),
  notes: z.string().optional().describe('Catatan khusus pelanggan'),
  paymentMethod: PaymentMethodSchema.default('WHATSAPP_CONFIRM'),
  paymentStatus: PaymentStatusSchema.default('UNPAID'),
  orderStatus: OrderStatusSchema.default('PENDING'),
  trackingNumber: z.string().optional().describe('Nomor resi pengiriman kurir'),
});

export type Order = z.infer<typeof OrderSchema>;

// Payload saat form submit di frontend
export const CreateOrderInputSchema = OrderSchema.pick({
  customerName: true,
  customerPhone: true,
  productName: true,
  size: true,
  quantity: true,
  notes: true,
  shippingAddress: true,
  paymentMethod: true,
}).partial({
  size: true,
  notes: true,
  shippingAddress: true,
  paymentMethod: true,
});

export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;

// ----------------------------------------------------------------------------
// 3. Entitas: Customers (Master Data Pelanggan / Leads)
// Sheet Tab: "Customers"
// ----------------------------------------------------------------------------
export const CustomerSchema = z.object({
  customerId: z.string().describe('ID Pelanggan, misal: CUST-001'),
  name: z.string(),
  phone: z.string().describe('Nomor WhatsApp yang digunakan untuk transaksi'),
  email: z.string().email().optional().or(z.literal('')),
  city: z.string().optional().describe('Kota / Domisili utama'),
  shippingAddress: z.string().optional(),
  totalOrders: z.number().int().default(1),
  totalSpent: z.number().default(0),
  lastOrderDate: z.string().describe('Tanggal transaksi terakhir'),
  firstRegistered: z.string().describe('Tanggal pertama kali pesan'),
});

export type Customer = z.infer<typeof CustomerSchema>;

// ----------------------------------------------------------------------------
// 4. Entitas: Inquiries (Pertanyaan / Konsultasi Produk)
// Sheet Tab: "Inquiries"
// ----------------------------------------------------------------------------
export const InquiryStatusSchema = z.enum([
  'NEW',
  'FOLLOWED_UP',
  'CLOSED',
]);

export const InquirySchema = z.object({
  inquiryId: z.string().describe('ID Konsultasi, misal: INQ-20261013-001'),
  createdAt: z.string(),
  name: z.string().min(1, 'Nama wajib diisi'),
  phone: z.string().min(9, 'Nomor telepon wajib diisi'),
  productInterest: z.string().optional().describe('Produk yang ditanyakan'),
  message: z.string().min(1, 'Isi pertanyaan atau konsultasi'),
  status: InquiryStatusSchema.default('NEW'),
});

export type Inquiry = z.infer<typeof InquirySchema>;

export const CreateInquiryInputSchema = InquirySchema.pick({
  name: true,
  phone: true,
  productInterest: true,
  message: true,
}).partial({
  productInterest: true,
});

export type CreateInquiryInput = z.infer<typeof CreateInquiryInputSchema>;

// ----------------------------------------------------------------------------
// 5. Format Komunikasi Google Apps Script (Request & Response)
// ----------------------------------------------------------------------------
export type AppsScriptAction =
  | 'SETUP_DATABASE'
  | 'GET_PRODUCTS'
  | 'CREATE_ORDER'
  | 'GET_ORDER_STATUS'
  | 'CREATE_INQUIRY';

export interface AppsScriptRequest<T = unknown> {
  action: AppsScriptAction;
  payload?: T;
}

export interface AppsScriptSuccessResponse<T = unknown> {
  success: true;
  message?: string;
  data: T;
}

export interface AppsScriptErrorResponse {
  success: false;
  error: string;
}

export type AppsScriptResponse<T = unknown> =
  | AppsScriptSuccessResponse<T>
  | AppsScriptErrorResponse;
