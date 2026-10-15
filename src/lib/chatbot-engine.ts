import minisoccerImg from '@/assets/minisoccer.jpg';
import futsalImg from '@/assets/futsal.jpg';
import accessoriesImg from '@/assets/accessories.jpg';
import { WHATSAPP_URL } from '@/lib/storefront';

export interface ChatProduct {
  id: string;
  name: string;
  category: string;
  price: number | null;
  image: string;
  description: string;
  features: string[];
  waUrl: string;
}

export interface QuickAction {
  label: string;
  type: 'link' | 'action' | 'wa';
  value: string;
  variant?: 'default' | 'whatsapp' | 'outline';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  products?: ChatProduct[];
  quickReplies?: string[];
  actions?: QuickAction[];
  tableData?: {
    headers: string[];
    rows: string[][];
  };
}

export const CATALOG_PRODUCTS: Record<'minisoccer' | 'futsal' | 'accessories', ChatProduct> = {
  minisoccer: {
    id: 'PRD-001',
    name: 'Sepatu Minisoccer Aerion',
    category: 'Sepatu Minisoccer',
    price: 210000,
    image: minisoccerImg,
    description: 'Sepatu andalan dengan sol bergerigi (Turf / TF), lentur, dan ringan. Bikin manuver makin lincah di rumput sintetis!',
    features: ['Sol gerigi TF anti-selip', 'Upper sintetis lentur & empuk', 'Sablon timbul premium & awet'],
    waUrl: `https://wa.me/6289652914048?text=${encodeURIComponent('Halo LocalMart, saya tertarik memesan Sepatu Minisoccer Aerion (Rp 210.000). Apakah ukuran saya masih tersedia?')}`,
  },
  futsal: {
    id: 'PRD-002',
    name: 'Sepatu Futsal Aerion',
    category: 'Sepatu Futsal',
    price: 190000,
    image: futsalImg,
    description: 'Sol karet datar (flat non-marking) berdaya cengkeram kuat. Sangat ringan dan empuk di lantai vinyl, semen, atau interlock.',
    features: ['Sol karet datar non-marking', 'Bantalan empuk anti-pegal', 'Upper lentur anti-lecet'],
    waUrl: `https://wa.me/6289652914048?text=${encodeURIComponent('Halo LocalMart, saya tertarik memesan Sepatu Futsal Aerion (Rp 190.000). Boleh info stok ukuran?')}`,
  },
  accessories: {
    id: 'PRD-003',
    name: 'Kaos Kaki & Dekker',
    category: 'Aksesoris Olahraga',
    price: null,
    image: accessoriesImg,
    description: 'Pelindung tulang kering (shin guard) kokoh dan kaos kaki tebal elastis. Melindungi kaki Kakak agar main makin percaya diri.',
    features: ['Dekker kokoh bantalan EVA', 'Kaos kaki tebal & serap keringat', 'Bisa beli satuan atau paket'],
    waUrl: `https://wa.me/6289652914048?text=${encodeURIComponent('Halo LocalMart, saya ingin menanyakan harga & ketersediaan Kaos Kaki & Dekker.')}`,
  },
};

export const INITIAL_SUGGESTIONS = [
  '⚽ Rekomendasi sepatu minisoccer',
  '⚡ Rekomendasi sepatu futsal',
  '📏 Panduan ukuran & tips kaki lebar',
  '🚚 Ongkir & pengiriman Jakarta',
  '💳 Cara pesan & pembayaran',
  '🔍 Cek status pesanan',
];

export const SIZE_CHART = {
  headers: ['Size (EU)', 'Panjang Kaki (cm)', 'Karakteristik & Saran'],
  rows: [
    ['38', '24.0 cm', 'Pas untuk kaki ramping/standar'],
    ['39', '24.5 cm', 'Nyaman & lentur'],
    ['40', '25.0 cm', 'Ukuran paling populer'],
    ['41', '26.0 cm', 'Disarankan untuk panjang 25.5 - 26 cm'],
    ['42', '26.5 cm', 'Pas di kaki, bantalan empuk'],
    ['43', '27.5 cm', 'Cocok untuk kaki agak panjang'],
    ['44', '28.0 cm', 'Ekstra lega & fleksibel'],
  ],
};

function formatCurrentTime(): string {
  const now = new Date();
  return now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
}

export function getWelcomeMessage(): ChatMessage {
  return {
    id: 'welcome-msg',
    sender: 'bot',
    text: `Halo Kak! Selamat datang di **LocalMart** ⚽👟\n\nSaya **Marty**, asisten AI resmi LocalMart. Saya siap membantu Kakak memilih sepatu futsal & minisoccer terbaik, mengecek ukuran kaki, info pengiriman Jakarta, hingga status pesanan.\n\nAda yang bisa Marty bantu hari ini Kak?`,
    timestamp: formatCurrentTime(),
    quickReplies: [
      'Rekomendasi Minisoccer',
      'Rekomendasi Futsal',
      'Tabel Ukuran Sepatu',
      'Info Pengiriman Jakarta',
    ],
  };
}

/**
 * Intelligent context-aware response generator for LocalMart
 */
export function generateChatbotResponse(rawInput: string): ChatMessage {
  const query = rawInput.toLowerCase().trim();
  const timeStr = formatCurrentTime();
  const id = `bot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // 1. CEK STATUS PESANAN / KODE ORD-
  const orderCodeMatch = rawInput.match(/ORD-\d{8}-\d{3,4}/i);
  if (orderCodeMatch || query.includes('cek pesanan') || query.includes('status pesanan') || query.includes('resi') || query.includes('tracking')) {
    if (orderCodeMatch) {
      const code = orderCodeMatch[0].toUpperCase();
      return {
        id,
        sender: 'bot',
        text: `🔍 **Pengecekan Kode Pesanan: ${code}**\n\nTerima kasih Kak! Pesanan dengan kode **${code}** telah tercatat dalam sistem LocalMart.\n\nUntuk konfirmasi status pengiriman terkini, resi kurir, atau update pembayaran, Kakak dapat langsung klik tombol WhatsApp admin di bawah ini:`,
        timestamp: timeStr,
        actions: [
          {
            label: `Konfirmasi Status ${code} di WA`,
            type: 'wa',
            value: `https://wa.me/6289652914048?text=${encodeURIComponent(`Halo LocalMart, saya ingin mengecek status pesanan saya dengan nomor: ${code}`)}`,
            variant: 'whatsapp',
          },
        ],
        quickReplies: ['Pesan Sepatu Lain', 'Lihat Koleksi Lengkap', 'Tanya Ongkir'],
      };
    } else {
      return {
        id,
        sender: 'bot',
        text: `📦 **Cara Cek Status Pesanan Kakak:**\n\n1. Jika Kakak sudah checkout melalui formulir web, masukkan kode pesanan Kakak di sini (format: \`ORD-YYYYMMDD-XXXX\`, contoh: \`ORD-20261013-1042\`).\n2. Atau Kakak bisa langsung kirim pesan ke WhatsApp Admin kami dengan menyebutkan nama pemesan.\n\nKetik kode pesanan Kakak di kolom chat ini ya!`,
        timestamp: timeStr,
        actions: [
          {
            label: 'Hubungi WhatsApp Admin',
            type: 'wa',
            value: WHATSAPP_URL,
            variant: 'whatsapp',
          },
        ],
        quickReplies: ['Rekomendasi Sepatu', 'Cara Memesan', 'Kembali ke Menu'],
      };
    }
  }

  // 2. REKOMENDASI MINISOCCER / RUMPUT SINTETIS
  if (
    query.includes('minisoccer') ||
    query.includes('mini soccer') ||
    query.includes('rumput') ||
    query.includes('sintetis') ||
    query.includes('turf') ||
    query.includes('gerigi')
  ) {
    return {
      id,
      sender: 'bot',
      text: `⚽ **Rekomendasi Lapangan Rumput Sintetis: Sepatu Minisoccer Aerion**\n\nUntuk lapangan rumput sintetis (minisoccer), Kakak wajib menggunakan sepatu dengan **sol bergerigi (Turf / TF)** agar traksi maksimal dan tidak mudah selip saat sprint atau putar badan.\n\n✨ **Keunggulan Sepatu Minisoccer Aerion:**\n• **Sol Bergerigi Lentur:** Karet elastis berkualitas, cengkeraman mantap di rumput basah maupun kering.\n• **Ringan & Nyaman:** Mengurangi beban kaki sehingga lari terasa enteng.\n• **Upper Lembut:** Bahan lentur yang tidak membuat kaki lecet dan ramah untuk kaki lebar.\n\n💰 **Harga:** Rp 210.000\n📏 **Pilihan Size:** 39, 40, 41, 42, 43, 44`,
      timestamp: timeStr,
      products: [CATALOG_PRODUCTS.minisoccer],
      quickReplies: ['Tabel Ukuran Sepatu', 'Bisa Kirim Instan?', 'Perbedaan Futsal vs Minisoccer'],
      actions: [
        {
          label: 'Pesan Minisoccer via WA',
          type: 'wa',
          value: CATALOG_PRODUCTS.minisoccer.waUrl,
          variant: 'whatsapp',
        },
      ],
    };
  }

  // 3. REKOMENDASI FUTSAL / LAPANGAN INDOOR / VINYL / SEMEN
  if (
    query.includes('futsal') ||
    query.includes('semen') ||
    query.includes('vinyl') ||
    query.includes('interlock') ||
    query.includes('indoor') ||
    query.includes('taraflex') ||
    query.includes('lapangan semen')
  ) {
    return {
      id,
      sender: 'bot',
      text: `⚡ **Rekomendasi Lapangan Indoor / Vinyl: Sepatu Futsal Aerion**\n\nUntuk lapangan futsal indoor (lantai vinyl, semen halus, atau interlock), pilihan terbaik adalah sol datar non-marking (**Flat IC**).\n\n✨ **Keunggulan Sepatu Futsal Aerion:**\n• **Sol Karet Non-Marking:** Daya gigit kuat di lantai indoor tanpa meninggalkan bekas hitam.\n• **Bantalan Empuk:** Meredam hentakan pada tumit saat berlari di lantai keras.\n• **Super Lentur & Fleksibel:** Manuver bola dan kontrol sentuhan makin presisi.\n\n💰 **Harga:** Rp 190.000\n📏 **Pilihan Size:** 39, 40, 41, 42, 43, 44`,
      timestamp: timeStr,
      products: [CATALOG_PRODUCTS.futsal],
      quickReplies: ['Panduan Ukuran Kaki', 'Cara Pesan Sekarang', 'Bandingkan dengan Minisoccer'],
      actions: [
        {
          label: 'Pesan Sepatu Futsal via WA',
          type: 'wa',
          value: CATALOG_PRODUCTS.futsal.waUrl,
          variant: 'whatsapp',
        },
      ],
    };
  }

  // 4. SIZE GUIDE & KAKI LEBAR
  if (
    query.includes('ukuran') ||
    query.includes('size') ||
    query.includes('cm') ||
    query.includes('panjang') ||
    query.includes('lebar') ||
    query.includes('kaki lebar') ||
    query.includes('sempit') ||
    query.includes('sesak') ||
    query.includes('nomor')
  ) {
    return {
      id,
      sender: 'bot',
      text: `📏 **Panduan Ukuran Sepatu & Tips Kaki Lebar (Wide Foot)**\n\nSepatu LocalMart dirancang dengan bahan upper sintetis elastis yang fleksibel mengikuti lekuk kaki Kakak.\n\n💡 **Tips Memilih Ukuran:**\n1. **Kaki Standar / Ramping:** Pilih ukuran yang biasa Kakak kenakan (*true to size*).\n2. **Kaki Lebar (Wide Foot):** Karena material kami sangat lentur, sepatu tetap nyaman dipakai. Namun jika Kakak terbiasa memakai kaos kaki futsal yang tebal, Marty merekomendasikan **naik 1 nomor (upsize 1 size)** agar jempol lebih leluasa.\n3. **Konsultasi Langsung:** Masih ragu? Kakak bisa ukur panjang telapak kaki dari tumit ke jempol lalu chat kami.`,
      timestamp: timeStr,
      tableData: SIZE_CHART,
      quickReplies: ['Pilih Minisoccer (Rp 210k)', 'Pilih Futsal (Rp 190k)', 'Tanya via WhatsApp'],
      actions: [
        {
          label: 'Konsultasi Ukuran via WA',
          type: 'wa',
          value: `https://wa.me/6289652914048?text=${encodeURIComponent('Halo LocalMart, saya mau konsultasi ukuran sepatu. Panjang kaki saya sekitar ... cm dan kaki saya agak lebar.')}`,
          variant: 'whatsapp',
        },
      ],
    };
  }

  // 5. ONGKIR & PENGIRIMAN
  if (
    query.includes('kirim') ||
    query.includes('ongkir') ||
    query.includes('pengiriman') ||
    query.includes('kurir') ||
    query.includes('sameday') ||
    query.includes('instan') ||
    query.includes('instant') ||
    query.includes('gosend') ||
    query.includes('grab') ||
    query.includes('jakarta') ||
    query.includes('jne') ||
    query.includes('jnt') ||
    query.includes('sicepat')
  ) {
    return {
      id,
      sender: 'bot',
      text: `🚚 **Informasi Pengiriman & Ekspedisi LocalMart**\n\nLocalMart berbasis di **Kemayoran, Jakarta Pusat** dan melayani pengiriman ke seluruh penjuru Jakarta & sekitarnya:\n\n🚀 **1. Pengiriman Instan & Sameday (GoSend / GrabExpress):**\n• Tersedia untuk area Jakarta Pusat, Barat, Timur, Selatan, dan Utara.\n• Sangat cocok jika Kakak butuh sepatu cepat untuk jadwal tanding sore/malam ini!\n\n📦 **2. Pengiriman Reguler (JNE, J&T, SiCepat):**\n• Estimasi 1 - 2 hari kerja sampai ke alamat tujuan.\n• Paket dikemas rapi dan aman dengan pelindung box.\n\nUntuk estimasi ongkos kirim pasti ke kecamatan tempat Kakak tinggal, cukup share lokasi di WhatsApp kami ya Kak!`,
      timestamp: timeStr,
      quickReplies: ['Berapa Harga Sepatu?', 'Mau Pesan Sekarang', 'Lokasi Toko Dimana?'],
      actions: [
        {
          label: 'Cek Ongkir via WhatsApp',
          type: 'wa',
          value: `https://wa.me/6289652914048?text=${encodeURIComponent('Halo LocalMart, mau tanya estimasi ongkir ke daerah ... untuk pesanan sepatu.')}`,
          variant: 'whatsapp',
        },
      ],
    };
  }

  // 6. HARGA & KATALOG PRODUK
  if (
    query.includes('harga') ||
    query.includes('berapa') ||
    query.includes('katalog') ||
    query.includes('daftar harga') ||
    query.includes('promo') ||
    query.includes('diskon') ||
    query.includes('produk')
  ) {
    return {
      id,
      sender: 'bot',
      text: `💰 **Daftar Harga & Katalog Resmi LocalMart:**\n\n1. **Sepatu Minisoccer Aerion** ⚽\n   • **Rp 210.000**\n   • Sol gerigi rumput sintetis, lentur, ringan & anti-selip.\n\n2. **Sepatu Futsal Aerion** ⚡\n   • **Rp 190.000**\n   • Sol karet datar non-marking, empuk di lantai vinyl & semen.\n\n3. **Kaos Kaki & Dekker Pelindung** 🛡️\n   • *Hubungi Admin / Tanya via WA* (Tersedia paket bundling hemat!)\n\nSemua produk kami jamin 100% original, anti-lecet, dan dibuat dengan standar kenyamanan pemain futsal Jakarta. Terimakasih!`,
      timestamp: timeStr,
      products: [CATALOG_PRODUCTS.minisoccer, CATALOG_PRODUCTS.futsal, CATALOG_PRODUCTS.accessories],
      quickReplies: ['Pesan Minisoccer', 'Pesan Futsal', 'Tanya Kaos Kaki & Dekker'],
    };
  }

  // 7. CARA PESAN & PEMBAYARAN
  if (
    query.includes('pesan') ||
    query.includes('beli') ||
    query.includes('order') ||
    query.includes('bayar') ||
    query.includes('pembayaran') ||
    query.includes('rekening') ||
    query.includes('transfer') ||
    query.includes('qris') ||
    query.includes('cod') ||
    query.includes('cara')
  ) {
    return {
      id,
      sender: 'bot',
      text: `💳 **Cara Memesan & Metode Pembayaran di LocalMart:**\n\nKakak bisa memesan dengan 2 cara mudah:\n\n**Opsi A — Formulir Pemesanan Web:**\nIsi formulir pesanan di halaman utama website kami. Kode pesanan unik (\`ORD-...\`) akan dibuat otomatis dan dapat langsung dikonfirmasi.\n\n**Opsi B — WhatsApp Langsung:**\nChat langsung admin WhatsApp kami untuk pemesanan cepat atau tanya stok size secara instan.\n\n🏦 **Metode Pembayaran yang Tersedia:**\n• **Transfer Bank:** BCA, Mandiri, BRI\n• **QRIS:** GoPay, OVO, ShopeePay, Dana, seluruh m-Banking\n• **Konfirmasi WA / COD:** Untuk area tertentu sesuai kesepakatan dengan admin.`,
      timestamp: timeStr,
      quickReplies: ['Isi Form Pemesanan', 'Chat WhatsApp Admin', 'Panduan Ukuran'],
      actions: [
        {
          label: 'Ke Form Pemesanan Web',
          type: 'link',
          value: '/#pesanan',
          variant: 'default',
        },
        {
          label: 'Pesan Cepat via WhatsApp',
          type: 'wa',
          value: WHATSAPP_URL,
          variant: 'whatsapp',
        },
      ],
    };
  }

  // 8. TENTANG TOKO & LOKASI
  if (
    query.includes('toko') ||
    query.includes('alamat') ||
    query.includes('lokasi') ||
    query.includes('kemayoran') ||
    query.includes('buka') ||
    query.includes('jam') ||
    query.includes('offline')
  ) {
    return {
      id,
      sender: 'bot',
      text: `📍 **Tentang & Lokasi LocalMart:**\n\n• **Nama Toko:** LocalMart (Sepatu Futsal & Minisoccer Jakarta)\n• **Slogan:** *"Gesit Terus, Main Makin Puas!"*\n• **Alamat:** Jl. Kemayoran Ketapang, Jakarta Pusat, DKI Jakarta\n• **Jam Operasional Online:** Setiap Hari 08.00 - 21.00 WIB\n• **WhatsApp:** 0896-5291-4048\n• **Instagram:** @Sportevo\n\nKami melayani pengiriman setiap hari kerja dengan opsi kurir instan untuk jadwal bermain yang mendesak!`,
      timestamp: timeStr,
      quickReplies: ['Lihat Koleksi Sepatu', 'Tanya Stok via WA', 'Berapa Ongkir ke Rumah?'],
      actions: [
        {
          label: 'Buka WhatsApp Toko',
          type: 'wa',
          value: WHATSAPP_URL,
          variant: 'whatsapp',
        },
      ],
    };
  }

  // 9. SALAM / SAPAAN
  if (
    query.includes('halo') ||
    query.includes('hai') ||
    query.includes('hello') ||
    query.includes('pagi') ||
    query.includes('siang') ||
    query.includes('malam') ||
    query.includes('assalam') ||
    query.includes('tes') ||
    query.includes('test')
  ) {
    return {
      id,
      sender: 'bot',
      text: `Halo Kak! Senang bisa menyapa Kakak. Selamat datang di **LocalMart**! ⚽\n\nMarty siap membantu Kakak menemukan sepatu futsal & minisoccer terbaik yang enteng, lentur, dan anti-lecet di kaki.\n\nApa yang sedang Kakak cari hari ini?`,
      timestamp: timeStr,
      quickReplies: [
        'Sepatu Minisoccer (Rumput)',
        'Sepatu Futsal (Vinyl/Semen)',
        'Cek Ukuran Kaki',
        'Ongkir ke Jakarta',
      ],
    };
  }

  // 10. KAOS KAKI & DEKKER
  if (
    query.includes('kaos kaki') ||
    query.includes('dekker') ||
    query.includes('deker') ||
    query.includes('pelindung') ||
    query.includes('aksesoris') ||
    query.includes('shin guard')
  ) {
    return {
      id,
      sender: 'bot',
      text: `🛡️ **Kaos Kaki & Dekker Pelindung LocalMart**\n\nLengkapi keselamatan dan kenyamanan bermain bola Kakak dengan perlengkapan terbaik:\n• **Dekker (Shin Guard):** Dilapisi foam empuk EVA untuk meredam benturan tulang kering.\n• **Kaos Kaki Tebal:** Material katun rajut elastis dengan sirkulasi udara baik, tidak mudah melar setelah dicuci.\n\n💰 Untuk harga paket hemat dan pilihan warna, Kakak bisa langsung tanya admin via WhatsApp:`,
      timestamp: timeStr,
      products: [CATALOG_PRODUCTS.accessories],
      quickReplies: ['Pesan Paket Dekker', 'Lihat Sepatu Futsal', 'Lihat Minisoccer'],
      actions: [
        {
          label: 'Tanya Aksesoris via WA',
          type: 'wa',
          value: CATALOG_PRODUCTS.accessories.waUrl,
          variant: 'whatsapp',
        },
      ],
    };
  }

  // 11. BAHAN / MATERIAL / KEUNGGULAN
  if (
    query.includes('bahan') ||
    query.includes('kualitas') ||
    query.includes('keunggulan') ||
    query.includes('awet') ||
    query.includes('lecet') ||
    query.includes('sablon') ||
    query.includes('sol')
  ) {
    return {
      id,
      sender: 'bot',
      text: `✨ **Keunggulan Material Sepatu LocalMart:**\n\n1. **Sangat Lentur:** Menggunakan bahan upper sintetis terpilih yang fleksibel mengikuti lekuk gerak kaki, membuat manuver sprint dan passing makin leluasa.\n2. **Terasa Ringan:** Bobot didesain seimbang agar stamina tetap prima hingga peluit akhir.\n3. **Anti Lecet:** Lapisan kerah tumit dalam super lembut dan empuk, aman dari gesekan keras.\n4. **Sablon Timbul Premium:** Desain sablon tidak mudah terkelupas walau sering terkena air atau gesekan bola.\n\nDijamin bikin main Kakak makin percaya diri di lapangan!`,
      timestamp: timeStr,
      quickReplies: ['Lihat Minisoccer Aerion', 'Lihat Futsal Aerion', 'Tanya Ukuran'],
    };
  }

  // 12. FALLBACK / GENERAL HELPFUL AI RESPONSE
  return {
    id,
    sender: 'bot',
    text: `Terima kasih atas pertanyaannya Kak! 😊\n\nTerkait: *" ${rawInput} "*\n\nMarty bisa bantu memberikan rekomendasi sepatu futsal atau minisoccer yang tepat, info ukuran yang pas untuk kaki Kakak, estimasi ongkir ke wilayah Jakarta, atau mencatat pesanan.\n\nSilakan pilih topik cepat di bawah ini atau hubungi admin WhatsApp kami secara langsung:`,
    timestamp: timeStr,
    quickReplies: [
      'Rekomendasi Sepatu Minisoccer',
      'Rekomendasi Sepatu Futsal',
      'Panduan Ukuran & Kaki Lebar',
      'Info Pengiriman Jakarta',
      'Hubungi Admin via WA',
    ],
    actions: [
      {
        label: 'Tanya Admin di WhatsApp',
        type: 'wa',
        value: `https://wa.me/6289652914048?text=${encodeURIComponent(`Halo LocalMart, saya ingin bertanya: ${rawInput}`)}`,
        variant: 'whatsapp',
      },
    ],
  };
}
