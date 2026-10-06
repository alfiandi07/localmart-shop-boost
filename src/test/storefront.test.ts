import { describe, expect, it } from 'vitest';
import { products, WHATSAPP_URL } from '../lib/storefront';

describe('LocalMart product rules', () => {
  it('prices minisoccer shoes at Rp 210.000', () => {
    expect(products.find(product => product.name === 'Sepatu Minisoccer Aerion')?.price).toBe(210000);
  });
  it('prices futsal shoes at Rp 190.000', () => {
    expect(products.find(product => product.name === 'Sepatu Futsal Aerion')?.price).toBe(190000);
  });
  it('requires a price inquiry for socks and shin guards', () => {
    expect(products.find(product => product.name === 'Kaos Kaki & Dekker')?.price).toBeNull();
  });
  it('uses the exact specified WhatsApp destination', () => {
    expect(WHATSAPP_URL).toBe('https://wa.me/6289652914048?text=Halo%20LocalMart,%20saya%20tertarik%20dengan%20produk%20Kakak.');
  });
});