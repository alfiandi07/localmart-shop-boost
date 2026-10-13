import {
  type AppsScriptResponse,
  type CreateOrderInput,
  CreateOrderInputSchema,
  type CreateInquiryInput,
  CreateInquiryInputSchema,
  type Order,
  type Product,
} from '@/types/database';

/**
 * URL Google Apps Script Web App yang didapat setelah Deploy.
 * Konfigurasi di file .env: VITE_GOOGLE_APPS_SCRIPT_URL="https://script.google.com/macros/s/XXX/exec"
 */
const APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || '';

/**
 * Memeriksa apakah integrasi Google Sheets sudah dikonfigurasi
 */
export function isGoogleSheetsConfigured(): boolean {
  return Boolean(APPS_SCRIPT_URL && APPS_SCRIPT_URL.startsWith('https://script.google.com'));
}

/**
 * Mengirim pesanan baru ke Google Sheets
 */
export async function submitOrderToSheets(
  input: CreateOrderInput
): Promise<AppsScriptResponse<{ orderId: string; totalPrice: number }>> {
  if (!isGoogleSheetsConfigured()) {
    console.warn(
      '[GoogleSheets] VITE_GOOGLE_APPS_SCRIPT_URL belum diset di .env. Pesanan tidak terkirim ke Sheets.'
    );
    return {
      success: false,
      error: 'Google Sheets Web App URL belum dikonfigurasi di environment.',
    };
  }

  // Validasi data input
  const validation = CreateOrderInputSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Menghindari CORS preflight issue di Google Apps Script
      },
      body: JSON.stringify({
        action: 'CREATE_ORDER',
        payload: validation.data,
      }),
    });

    const result = (await response.json()) as AppsScriptResponse<{
      orderId: string;
      totalPrice: number;
    }>;
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal menghubungi Google Apps Script.',
    };
  }
}

/**
 * Mengirim formulir konsultasi / pertanyaan ke Google Sheets
 */
export async function submitInquiryToSheets(
  input: CreateInquiryInput
): Promise<AppsScriptResponse<{ inquiryId: string }>> {
  if (!isGoogleSheetsConfigured()) {
    return {
      success: false,
      error: 'Google Sheets Web App URL belum dikonfigurasi di environment.',
    };
  }

  const validation = CreateInquiryInputSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'CREATE_INQUIRY',
        payload: validation.data,
      }),
    });

    return (await response.json()) as AppsScriptResponse<{ inquiryId: string }>;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal mengirim konsultasi ke Google Sheets.',
    };
  }
}

/**
 * Mengambil daftar produk langsung dari Google Sheets
 */
export async function fetchProductsFromSheets(): Promise<AppsScriptResponse<Product[]>> {
  if (!isGoogleSheetsConfigured()) {
    return {
      success: false,
      error: 'Google Sheets Web App URL belum dikonfigurasi di environment.',
    };
  }

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?action=GET_PRODUCTS`, {
      method: 'GET',
    });

    return (await response.json()) as AppsScriptResponse<Product[]>;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal mengambil produk dari Google Sheets.',
    };
  }
}

/**
 * Mengecek status pesanan berdasarkan ID Pesanan
 */
export async function fetchOrderStatusFromSheets(
  orderId: string
): Promise<AppsScriptResponse<Partial<Order>>> {
  if (!isGoogleSheetsConfigured()) {
    return {
      success: false,
      error: 'Google Sheets Web App URL belum dikonfigurasi di environment.',
    };
  }

  try {
    const response = await fetch(
      `${APPS_SCRIPT_URL}?action=GET_ORDER_STATUS&orderId=${encodeURIComponent(orderId)}`,
      { method: 'GET' }
    );

    return (await response.json()) as AppsScriptResponse<Partial<Order>>;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal mengambil status pesanan.',
    };
  }
}
