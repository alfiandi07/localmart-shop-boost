import {
  type AppsScriptResponse,
  type CreateOrderInput,
  CreateOrderInputSchema,
  type CreateInquiryInput,
  CreateInquiryInputSchema,
  type Order,
  type Product,
  type Customer,
} from '@/types/database';

/**
 * URL Google Apps Script Web App.
 * Dapat di-override melalui file .env: VITE_GOOGLE_APPS_SCRIPT_URL
 */
const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzTAeSx_AbO37PLeM0rxQ1oeSWro7O-9IvUe5faI64iQtQWHtJXMoZUWgC-bgK6PDbn/exec';

const APPS_SCRIPT_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_APPS_SCRIPT_URL) ||
  DEFAULT_APPS_SCRIPT_URL;

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
      '[GoogleSheets] URL belum diset. Pesanan tidak terkirim ke Sheets.'
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

    const text = await response.text();
    let result: AppsScriptResponse<{ orderId: string; totalPrice: number }>;
    try {
      result = JSON.parse(text);
    } catch {
      // Jika Google mengembalikan halaman login HTML
      if (text.includes('ServiceLogin') || text.includes('accounts.google.com')) {
        return {
          success: false,
          error:
            'Akses Google Apps Script terkunci (harus diatur ke "Anyone / Siapa saja" di menu Deploy).',
        };
      }
      return {
        success: false,
        error: 'Respons Google Apps Script tidak valid.',
      };
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal menghubungi Google Apps Script.',
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

/**
 * Mengambil daftar seluruh pelanggan dari Google Sheets
 */
export async function fetchCustomersFromSheets(): Promise<AppsScriptResponse<Customer[]>> {
  if (!isGoogleSheetsConfigured()) {
    return {
      success: false,
      error: 'Google Sheets Web App URL belum dikonfigurasi di environment.',
    };
  }

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?action=GET_CUSTOMERS`, {
      method: 'GET',
    });

    return (await response.json()) as AppsScriptResponse<Customer[]>;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal mengambil data pelanggan dari Google Sheets.',
    };
  }
}

/**
 * Mencari data pelanggan berdasarkan nomor WhatsApp
 */
export async function fetchCustomerByPhoneFromSheets(
  phone: string
): Promise<AppsScriptResponse<Customer | null>> {
  if (!isGoogleSheetsConfigured()) {
    return {
      success: false,
      error: 'Google Sheets Web App URL belum dikonfigurasi di environment.',
    };
  }

  try {
    const response = await fetch(
      `${APPS_SCRIPT_URL}?action=GET_CUSTOMER_BY_PHONE&phone=${encodeURIComponent(phone)}`,
      { method: 'GET' }
    );

    return (await response.json()) as AppsScriptResponse<Customer | null>;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal mencari pelanggan di Google Sheets.',
    };
  }
}
