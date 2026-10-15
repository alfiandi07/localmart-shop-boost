import { describe, expect, it } from 'vitest';
import {
  generateChatbotResponse,
  getWelcomeMessage,
  CATALOG_PRODUCTS,
} from '../lib/chatbot-engine';

describe('LocalMart Chatbot Engine (Marty)', () => {
  it('generates a polite Indonesian welcome message', () => {
    const welcome = getWelcomeMessage();
    expect(welcome.sender).toBe('bot');
    expect(welcome.text).toContain('Marty');
    expect(welcome.text).toContain('LocalMart');
    expect(welcome.quickReplies).toBeDefined();
    expect(welcome.quickReplies!.length).toBeGreaterThan(0);
  });

  it('recommends Sepatu Minisoccer Aerion for turf/synthetic grass query', () => {
    const response = generateChatbotResponse('sepatu apa yang cocok untuk lapangan rumput sintetis?');
    expect(response.products).toBeDefined();
    expect(response.products![0]?.name).toBe(CATALOG_PRODUCTS.minisoccer.name);
    expect(response.text).toContain('Minisoccer Aerion');
  });

  it('recommends Sepatu Futsal Aerion for indoor/vinyl/semen query', () => {
    const response = generateChatbotResponse('rekomendasi sepatu untuk lapangan vinyl semen indoor');
    expect(response.products).toBeDefined();
    expect(response.products![0]?.name).toBe(CATALOG_PRODUCTS.futsal.name);
    expect(response.text).toContain('Futsal Aerion');
  });

  it('returns size chart and wide foot tips for sizing queries', () => {
    const response = generateChatbotResponse('bagaimana panduan ukuran sepatu untuk kaki lebar?');
    expect(response.tableData).toBeDefined();
    expect(response.tableData?.headers).toContain('Size (EU)');
    expect(response.text).toContain('Kaki Lebar');
  });

  it('provides shipping details for Jakarta delivery queries', () => {
    const response = generateChatbotResponse('berapa ongkir dan pengiriman ke jakarta pusat?');
    expect(response.text).toContain('Kemayoran');
    expect(response.text).toContain('Jakarta');
    expect(response.text).toContain('GoSend');
  });

  it('handles order code tracking when provided with an ORD code', () => {
    const response = generateChatbotResponse('halo tolong cek status pesanan ORD-20261013-1042');
    expect(response.text).toContain('ORD-20261013-1042');
    expect(response.actions).toBeDefined();
    expect(response.actions![0]?.variant).toBe('whatsapp');
  });

  it('provides helpful fallback with WhatsApp handoff for unclassified queries', () => {
    const response = generateChatbotResponse('bagaimana resep memasak nasi goreng spesial?');
    expect(response.text).toContain('Terima kasih');
    expect(response.actions).toBeDefined();
    expect(response.actions![0]?.label).toContain('WhatsApp');
  });
});
