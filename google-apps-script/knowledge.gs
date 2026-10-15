/**
 * ============================================================================
 * LOCALMART - KNOWLEDGE BASE & AI GEMINI INTEGRATION (knowledge.gs)
 * ============================================================================
 * File ini mengelola basis pengetahuan (katalog produk, daftar harga resmi,
 * status ketersediaan ukuran, paket bundling hemat, dan SOP pelayanan pelanggan)
 * serta menyediakan integrasi dengan Google Gemini AI untuk asisten virtual LocalMart.
 *
 * FITUR:
 * 1. Master System Instruction & Katalog Produk Resmi LocalMart
 * 2. Integrasi Google Gemini API via UrlFetchApp (didukung Gemini 1.5 Flash / 2.5)
 * 3. Fallback cerdas berbasis aturan lokal jika API key belum diisi / offline
 * 4. Fungsi testing langsung dari Google Apps Script Editor: testUkuran42()
 * 5. Helper pengelolaan API Key: setGeminiApiKey('AIzaSy...')
 * 6. Pembuat lembar kerja tabel katalog di Google Sheets: setupKnowledgeSheet()
 *
 * CARA PEMASANGAN DI GOOGLE APPS SCRIPT:
 * 1. Buka spreadsheet Google Sheets Anda > Ekstensi (Extensions) > Apps Script.
 * 2. Klik tombol '+' di samping 'Files' > Pilih 'Script' > Beri nama 'knowledge'.
 * 3. Hapus kode default, lalu tempel seluruh isi file ini ke file 'knowledge.gs'.
 * 4. (Opsional) Jalankan fungsi 'setGeminiApiKey' dengan memasukkan Gemini API Key Anda,
 *    atau atur di Project Settings > Script Properties > GEMINI_API_KEY.
 * 5. Jalankan fungsi 'testUkuran42' untuk memverifikasi respon bot.
 * ============================================================================
 */

// Konstanta Nama Sheet Pengetahuan
var SHEET_KNOWLEDGE = "Katalog_Knowledge";

/**
 * System Instruction resmi untuk LLM / Gemini AI CS LocalMart.
 * Menggabungkan katalog produk, harga resmi, ketersediaan ukuran, dan panduan komunikasi.
 */
var SYSTEM_INSTRUCTION_LOCALMART = [
  "ROLE & IDENTITY:",
  "Kamu adalah Asisten Virtual & Customer Service resmi 'LocalMart' — toko perlengkapan olahraga lokal terpercaya di Jakarta.",
  "Slogan LocalMart: 'Gesit Terus, Main Makin Puas!'.",
  "",
  "GAYA KOMUNIKASI & TONE OF VOICE:",
  "- Ramah, energik, sopan, komunikatif, dan solutif.",
  "- Selalu gunakan sapaan akrab 'Kak' atau 'Kakak' kepada pelanggan.",
  "- Gunakan bahasa Indonesia yang baik, santun, dan bersahabat.",
  "- Berikan respon yang informatif, ringkas, terstruktur rapi, dan mudah dibaca di layar HP/WhatsApp.",
  "- Sertakan ajakan bertindak (Call-to-Action / CTA) yang jelas di akhir pesan (misal: panduan cara order, pilih ukuran, atau mengisi form pemesanan).",
  "",
  "STATUS KETERSEDIAAN UKURAN (SIZE AVAILABILITY):",
  "- Sepatu Olahraga Lokal: Tersedia ukuran READY STOCK dari 39, 40, 41, 42, hingga 43.",
  "- Khusus UKURAN 42: READY STOCK untuk semua lini sepatu (Sepatu Lari, Sepatu Futsal & Sepakbola, serta Sneaker Casual Sport).",
  "- Pakaian Olahraga (Jersey, Celana, Jaket): Tersedia ukuran M, L, XL, dan XXL.",
  "- Aksesoris (Kaos Kaki, Dekker, Matras, Botol Minum): Ready All Size / standar internasional.",
  "",
  "MENU HARGA & KATALOG PRODUK - LOCALMART",
  "1. Kategori Sepatu Olahraga Lokal",
  "   - Sepatu Lari Lokal (Running Shoes): Rp 250.000",
  "   - Sepatu Futsal & Sepakbola Lokal: Rp 220.000",
  "   - Sepatu Sneaker & Casual Sport: Rp 200.000",
  "   (Semua sepatu ready ukuran: 39, 40, 41, 42, 43 dengan sol fleksibel, empuk, dan anti-slip)",
  "",
  "2. Kategori Pakaian Olahraga (Athleisure & Apparel)",
  "   - Jersey Training / Dry-Fit Lokal: Rp 75.000",
  "   - Celana Pendek Sport / Running Shorts: Rp 60.000",
  "   - Jaket Windbreaker / Hoodie Sport: Rp 150.000",
  "   (Bahan adem, menyerap keringat, quick-dry, ready ukuran M sampai XXL)",
  "",
  "3. Kategori Aksesoris & Peralatan Fitness/Gym",
  "   - Matras Yoga & Gym (6mm / 8mm): Rp 85.000",
  "   - Resistance Band Set / Dumbbell Minimalis: Rp 45.000",
  "   - Kaos Kaki Olahraga Anti-Slip (Bundle 3 pasang): Rp 45.000",
  "   - Botol Minum Sport BPA-Free (1 Liter): Rp 50.000",
  "   - Tas Gym / Drawstring Bag Localmart: Rp 65.000",
  "",
  "4. Paket Bundling Hemat Peluncuran",
  "   - Paket Starter Lari (Sepatu Lari + Jersey Dry-Fit + Kaos Kaki Sport): Rp 349.000 (Hemat Rp 50.000 dari normal Rp 399.000)",
  "   - Paket Home Gym Basic (Matras Yoga + Resistance Band Set + Botol Minum Sport): Rp 169.000 (Hemat Rp 30.000 dari normal Rp 199.000)",
  "",
  "5. Ketentuan & Catatan Harga",
  "   - Harga di atas merupakan harga resmi terdaftar pada basis data aplikasi Localmart.",
  "   - Harga dapat berubah sewaktu-waktu selama periode promo diskon gajian atau promo peluncuran aplikasi.",
  "   - Pengiriman melayani wilayah Jakarta dan seluruh Indonesia (Bisa Instant/Sameday atau Reguler).",
  "   - Pembayaran dapat melalui Transfer Bank, QRIS, atau konfirmasi WhatsApp CS.",
  "",
  "INSTRUKSI KHUSUS PERTANYAAN UKURAN (Contoh: 'ukuran 42 ready '):",
  "1. Jawab langsung dengan tegas dan ramah bahwa ukuran 42 READY STOCK.",
  "2. Sebutkan model sepatu apa saja yang tersedia ukuran 42 beserta harganya (Sepatu Lari Rp 250rb, Futsal Rp 220rb, Sneaker Rp 200rb).",
  "3. Tanyakan kebutuhan Kakak untuk olahraga apa (apakah untuk jogging/lari, futsal, atau santai).",
  "4. Jika relevan, tawarkan paket hemat peluncuran (misal Paket Starter Lari Rp 349rb sudah lengkap sepatu + jersey + kaos kaki).",
  "5. Beritahukan cara pemesanannya: bisa langsung konfirmasi sekarang atau isi formulir pesanan di web LocalMart."
].join("\n");

/**
 * Data terstruktur katalog LocalMart untuk keperluan lookup kode & integrasi sheet
 */
var LOCALMART_KNOWLEDGE_BASE = {
  storeName: "LocalMart",
  city: "Jakarta",
  tagline: "Gesit Terus, Main Makin Puas!",
  currency: "IDR",
  shoesAvailableSizes: ["39", "40", "41", "42", "43"],
  apparelAvailableSizes: ["M", "L", "XL", "XXL"],
  categories: [
    {
      id: "CAT-01",
      name: "Sepatu Olahraga Lokal",
      items: [
        {
          id: "SHOE-001",
          name: "Sepatu Lari Lokal (Running Shoes)",
          price: 250000,
          sizes: ["39", "40", "41", "42", "43"],
          description: "Sepatu lari lokal ringan dengan cushion empuk dan breathable mesh, cocok untuk daily run.",
          isReadySize42: true
        },
        {
          id: "SHOE-002",
          name: "Sepatu Futsal & Sepakbola Lokal",
          price: 220000,
          sizes: ["39", "40", "41", "42", "43"],
          description: "Sepatu futsal grip kuat di lapangan indoor/rumput sintetis, sol fleksibel dan tahan lama.",
          isReadySize42: true
        },
        {
          id: "SHOE-003",
          name: "Sepatu Sneaker & Casual Sport",
          price: 200000,
          sizes: ["39", "40", "41", "42", "43"],
          description: "Sneaker casual sporty bergaya modern untuk nongkrong maupun aktivitas santai sehari-hari.",
          isReadySize42: true
        }
      ]
    },
    {
      id: "CAT-02",
      name: "Pakaian Olahraga (Athleisure & Apparel)",
      items: [
        {
          id: "APP-001",
          name: "Jersey Training / Dry-Fit Lokal",
          price: 75000,
          sizes: ["M", "L", "XL", "XXL"],
          description: "Bahan polyester dry-fit premium, cepat kering dan sejuk saat latihan berat."
        },
        {
          id: "APP-002",
          name: "Celana Pendek Sport / Running Shorts",
          price: 60000,
          sizes: ["M", "L", "XL", "XXL"],
          description: "Celana pendek olahraga dengan saku resleting dan tali pinggang elastis."
        },
        {
          id: "APP-003",
          name: "Jaket Windbreaker / Hoodie Sport",
          price: 150000,
          sizes: ["M", "L", "XL", "XXL"],
          description: "Jaket penahan angin ringan dengan penutup kepala, pas untuk lari pagi / malam."
        }
      ]
    },
    {
      id: "CAT-03",
      name: "Aksesoris & Peralatan Fitness/Gym",
      items: [
        {
          id: "ACC-001",
          name: "Matras Yoga & Gym (6mm / 8mm)",
          price: 85000,
          sizes: ["6mm", "8mm"],
          description: "Matras NBR/TPE anti-slip dengan ketebalan optimal untuk senam dan workout di rumah."
        },
        {
          id: "ACC-002",
          name: "Resistance Band Set / Dumbbell Minimalis",
          price: 45000,
          sizes: ["Set 5 Tingkat Beban"],
          description: "Tali resistensi elastis aneka tingkat beban untuk pembentukan otot tangan dan kaki."
        },
        {
          id: "ACC-003",
          name: "Kaos Kaki Olahraga Anti-Slip (Bundle 3 pasang)",
          price: 45000,
          sizes: ["All Size"],
          description: "Kaos kaki dengan bintik gel grip silikon di bawah telapak, mencegah cedera dan geseran."
        },
        {
          id: "ACC-004",
          name: "Botol Minum Sport BPA-Free (1 Liter)",
          price: 50000,
          sizes: ["1000 ml"],
          description: "Botol minum anti-bocor dengan penanda waktu minum dan tali jinjing praktis."
        },
        {
          id: "ACC-005",
          name: "Tas Gym / Drawstring Bag Localmart",
          price: 65000,
          sizes: ["Standar"],
          description: "Tas serut praktis anti-air untuk membawa sepatu, baju ganti, dan botol minum."
        }
      ]
    },
    {
      id: "CAT-04",
      name: "Paket Bundling Hemat Peluncuran",
      items: [
        {
          id: "BND-001",
          name: "Paket Starter Lari",
          bundleItems: "Sepatu Lari + Jersey Dry-Fit + Kaos Kaki Sport",
          price: 349000,
          originalPrice: 399000,
          discount: 50000,
          description: "Set lengkap siap lari! Hemat Rp 50.000 dibanding beli satuan."
        },
        {
          id: "BND-002",
          name: "Paket Home Gym Basic",
          bundleItems: "Matras Yoga + Resistance Band Set + Botol Minum Sport",
          price: 169000,
          originalPrice: 199000,
          discount: 30000,
          description: "Starter kit olahraga di rumah lengkap hemat Rp 30.000."
        }
      ]
    }
  ]
};

/**
 * Mengambil teks System Instruction lengkap untuk AI
 */
function getSystemInstruction() {
  return SYSTEM_INSTRUCTION_LOCALMART;
}

/**
 * Mengambil data terstruktur basis pengetahuan
 */
function getKnowledgeData() {
  return LOCALMART_KNOWLEDGE_BASE;
}

/**
 * Menyimpan Gemini API Key ke Script Properties
 * Jalankan fungsi ini satu kali di editor atau isi di Project Settings.
 *
 * Contoh penggunaan:
 * setGeminiApiKey("AIzaSyXXXXXXXXXXXXXXX");
 */
function setGeminiApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== "string") {
    throw new Error("API Key tidak valid.");
  }
  PropertiesService.getScriptProperties().setProperty("GEMINI_API_KEY", apiKey.trim());
  Logger.log("Gemini API Key berhasil disimpan ke Script Properties.");
  return "Berhasil menyimpan API Key.";
}

/**
 * Mengambil Gemini API Key dari Script Properties
 */
function getGeminiApiKey() {
  return PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY") || "";
}

/**
 * Memanggil Google Gemini REST API (gemini-1.5-flash) menggunakan UrlFetchApp.
 * Menggunakan format request standar Google GenAI REST v1beta.
 *
 * @param {string} prompt - Pertanyaan / input dari pengguna
 * @param {string} [customSystemInstruction] - Instruksi sistem kustom (opsional)
 * @param {Object} [options] - Pengaturan temperatur, model, dll.
 * @returns {string} Respon teks dari Gemini
 */
function callGeminiAPI(prompt, customSystemInstruction, options) {
  var apiKey = (options && options.apiKey) || getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY belum dikonfigurasi di Script Properties.");
  }

  var model = (options && options.model) || "gemini-1.5-flash";
  var endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + encodeURIComponent(apiKey);

  var systemPrompt = customSystemInstruction || SYSTEM_INSTRUCTION_LOCALMART;

  var requestBody = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt }
        ]
      }
    ],
    system_instruction: {
      parts: [
        { text: systemPrompt }
      ]
    },
    generationConfig: {
      temperature: (options && options.temperature !== undefined) ? options.temperature : 0.4,
      maxOutputTokens: (options && options.maxOutputTokens) || 800
    }
  };

  var fetchOptions = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(requestBody),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(endpoint, fetchOptions);
  var statusCode = response.getResponseCode();
  var responseText = response.getContentText();

  if (statusCode !== 200) {
    Logger.log("Gemini API Error [" + statusCode + "]: " + responseText);
    throw new Error("Gemini API Error HTTP " + statusCode + ": " + responseText);
  }

  var json = JSON.parse(responseText);
  if (json.candidates && json.candidates.length > 0) {
    var candidate = json.candidates[0];
    if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
      return candidate.content.parts[0].text;
    }
  }

  throw new Error("Format respon Gemini tidak mengandung teks balasan.");
}

/**
 * Fungsi utama untuk menghasilkan balasan asisten pelanggan LocalMart.
 * Mencoba memanggil Gemini API terlebih dahulu. Jika API Key belum diset atau ada kendala kuota,
 * secara otomatis beralih ke Fallback Engine Lokal berbasis aturan katalog agar layanan tetap online.
 *
 * @param {string} userQuery - Pertanyaan pelanggan (misal: "ukuran 42 ready ")
 * @returns {string} Jawaban ramah dan akurat sesuai katalog LocalMart
 */
function generateKnowledgeResponse(userQuery) {
  var query = (userQuery || "").toString().trim();
  if (!query) {
    return "Halo Kak! Ada yang bisa kami bantu seputar perlengkapan olahraga, sepatu, pakaian, atau promo bundling LocalMart hari ini? Gesit Terus, Main Makin Puas! ⚽🔥";
  }

  // 1. Coba gunakan Gemini API jika API Key tersedia
  var apiKey = getGeminiApiKey();
  if (apiKey) {
    try {
      var aiResponse = callGeminiAPI(query, SYSTEM_INSTRUCTION_LOCALMART);
      if (aiResponse && aiResponse.trim().length > 0) {
        return aiResponse.trim();
      }
    } catch (e) {
      Logger.log("Gagal memanggil Gemini API: " + e.message + ". Menggunakan Local Knowledge Fallback.");
    }
  }

  // 2. Fallback Lokal cerdas berdasarkan basis data katalog
  return localKnowledgeFallback(query);
}

/**
 * Fallback Engine Lokal: Menjawab pertanyaan umum seputar ukuran, katalog, bundling,
 * dan harga tanpa bergantung pada koneksi Gemini API eksternal.
 *
 * @param {string} query - Teks pertanyaan
 * @returns {string} Balasan Customer Service LocalMart
 */
function localKnowledgeFallback(query) {
  var q = query.toLowerCase();

  // Kasus 1: Pertanyaan seputar Ukuran 42 / Ketersediaan Size
  if (q.indexOf("42") !== -1 || q.indexOf("ukuran") !== -1 || q.indexOf("size") !== -1 || q.indexOf("ready") !== -1) {
    var is42 = q.indexOf("42") !== -1;
    var sizeLabel = is42 ? "Ukuran 42" : "Ukuran sepatu";

    return [
      "Halo Kak! Terima kasih sudah menghubungi LocalMart. 🙏⚽",
      "",
      "Kabar gembira, untuk " + sizeLabel + " saat ini **READY STOCK LENGKAP** ya Kak!",
      "Berikut pilihan model sepatu olahraga lokal unggulan yang ready ukuran 42:",
      "",
      "👟 **1. Sepatu Lari Lokal (Running Shoes)** — Rp 250.000",
      "   • Sangat ringan, sol empuk menyerap benturan, dan bahan mesh adem.",
      "",
      "⚽ **2. Sepatu Futsal & Sepakbola Lokal** — Rp 220.000",
      "   • Grip mantap untuk lapangan rumput sintetis/indoor, bermanuver lebih lincah.",
      "",
      "👟 **3. Sepatu Sneaker & Casual Sport** — Rp 200.000",
      "   • Desain kekinian, nyaman untuk jalan-jalan atau aktivitas harian.",
      "",
      "🔥 **TIPS HEMAT:**",
      "Kakak juga bisa ambil **Paket Starter Lari** cuma **Rp 349.000** (sudah dapat Sepatu Lari uk. 42 + Jersey Dry-Fit + Kaos Kaki Anti-Slip, lebih hemat Rp 50.000!).",
      "",
      "Boleh tahu Kakak berminat dengan model sepatu yang mana? Kami siap bantu proseskan pesanannya sekarang juga. *Gesit Terus, Main Makin Puas!* 🏃‍♂️✨"
    ].join("\n");
  }

  // Kasus 2: Paket Bundling / Promo Hemat
  if (q.indexOf("paket") !== -1 || q.indexOf("bundle") !== -1 || q.indexOf("hemat") !== -1 || q.indexOf("promo") !== -1) {
    return [
      "Halo Kak! Kami punya 2 Paket Bundling Hemat Peluncuran spesial buat Kakak:",
      "",
      "🏃‍♂️ **1. Paket Starter Lari — Rp 349.000** (Hemat Rp 50.000!)",
      "   • Isi: Sepatu Lari Lokal + Jersey Training Dry-Fit + Kaos Kaki Sport Anti-Slip",
      "",
      "🧘 **2. Paket Home Gym Basic — Rp 169.000** (Hemat Rp 30.000!)",
      "   • Isi: Matras Yoga & Gym + Resistance Band Set + Botol Minum Sport BPA-Free 1L",
      "",
      "Stok bundling ini terbatas ya Kak. Mau pesan paket yang mana Kak hari ini? 😊"
    ].join("\n");
  }

  // Kasus 3: Sepatu Futsal / Sepakbola
  if (q.indexOf("futsal") !== -1 || q.indexOf("bola") !== -1 || q.indexOf("soccer") !== -1) {
    return [
      "Halo Kak! Untuk **Sepatu Futsal & Sepakbola Lokal** harganya **Rp 220.000**.",
      "Tersedia lengkap dari ukuran 39, 40, 41, 42, hingga 43.",
      "Bahannya lentur, grip karet anti-slip, dan sol bergerigi nyaman dipakai bermanuver di lapangan.",
      "Mau ukuran berapa Kak? Kami siapkan pengirimannya segera!"
    ].join("\n");
  }

  // Kasus 4: Sepatu Lari / Running
  if (q.indexOf("lari") !== -1 || q.indexOf("running") !== -1 || q.indexOf("jogging") !== -1) {
    return [
      "Halo Kak! **Sepatu Lari Lokal (Running Shoes)** kami dibanderol **Rp 250.000**.",
      "Ready stock ukuran 39 sampai 43. Bobotnya super enteng dengan bantalan insole yang empuk.",
      "Tersedia juga opsi bundling **Paket Starter Lari** seharga **Rp 349.000** (sudah termasuk Jersey Dry-Fit & Kaos Kaki). Tertarik Kak?"
    ].join("\n");
  }

  // Kasus 5: Pakaian Olahraga (Jersey, Celana, Jaket)
  if (q.indexOf("jersey") !== -1 || q.indexOf("baju") !== -1 || q.indexOf("celana") !== -1 || q.indexOf("jaket") !== -1 || q.indexOf("apparel") !== -1) {
    return [
      "Halo Kak! Berikut katalog Pakaian Olahraga (Athleisure) Lokal kami:",
      "• **Jersey Training / Dry-Fit:** Rp 75.000 (Adem & quick-dry)",
      "• **Celana Pendek Sport / Running Shorts:** Rp 60.000",
      "• **Jaket Windbreaker / Hoodie Sport:** Rp 150.000",
      "Tersedia ukuran M, L, XL, hingga XXL. Silakan pilih yang pas untuk Kakak ya!"
    ].join("\n");
  }

  // Kasus 6: Pertanyaan umum / Katalog Lengkap
  return [
    "Halo Kak! Selamat datang di LocalMart Jakarta. ⚽🔥",
    "Berikut ringkasan katalog produk resmi kami:",
    "",
    "👟 **Sepatu Olahraga (Ready size 39 - 43):**",
    "• Sepatu Lari Lokal: Rp 250.000",
    "• Sepatu Futsal & Sepakbola: Rp 220.000",
    "• Sepatu Sneaker & Casual Sport: Rp 200.000",
    "",
    "👕 **Pakaian Olahraga (M - XXL):**",
    "• Jersey Dry-Fit: Rp 75.000 | Celana Pendek: Rp 60.000 | Jaket Windbreaker: Rp 150.000",
    "",
    "🧘 **Aksesoris & Gym:**",
    "• Matras Yoga: Rp 85.000 | Resistance Band: Rp 45.000 | Kaos Kaki 3 Pasang: Rp 45.000",
    "• Botol Minum 1L: Rp 50.000 | Tas Gym: Rp 65.000",
    "",
    "🎁 **Paket Bundling Hemat:**",
    "• Paket Starter Lari: Rp 349.000 (Hemat Rp 50rb)",
    "• Paket Home Gym Basic: Rp 169.000 (Hemat Rp 30rb)",
    "",
    "Ada produk atau ukuran tertentu yang ingin Kakak tanyakan? Kami siap melayani! ✨"
  ].join("\n");
}

/**
 * Handler pemrosesan permintaan tanya-jawab AI dari API doPost / webhook.
 * Dipanggil ketika action === "ASK_AI" atau "CHAT_AI".
 *
 * @param {Object} payload - Object payload request ({ query, message, input, ... })
 * @returns {Object} Data jawaban terstruktur
 */
function handleAiChat(payload) {
  var userQuery = (payload && (payload.query || payload.message || payload.input || payload.text || payload.prompt)) || "";
  var reply = generateKnowledgeResponse(userQuery);

  return {
    query: userQuery,
    reply: reply,
    source: getGeminiApiKey() ? "GEMINI_AI" : "LOCAL_KNOWLEDGE_BASE",
    timestamp: Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss")
  };
}

/**
 * Membuat sheet Katalog_Knowledge di Google Spreadsheet aktif
 * dan mengisinya dengan data katalog dan menu harga resmi.
 */
function setupKnowledgeSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_KNOWLEDGE);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_KNOWLEDGE);
  }

  sheet.clear();

  // Header
  var headers = ["Kategori", "ID Produk", "Nama Produk / Paket", "Harga Resmi (IDR)", "Ukuran Ready", "Keterangan"];
  sheet.appendRow(headers);

  var rows = [
    ["1. Sepatu Olahraga Lokal", "SHOE-001", "Sepatu Lari Lokal (Running Shoes)", 250000, "39, 40, 41, 42, 43", "Sol empuk, bantalan responsive, breathable mesh"],
    ["1. Sepatu Olahraga Lokal", "SHOE-002", "Sepatu Futsal & Sepakbola Lokal", 220000, "39, 40, 41, 42, 43", "Sol gerigi karet anti-slip, grip kuat di lapangan"],
    ["1. Sepatu Olahraga Lokal", "SHOE-003", "Sepatu Sneaker & Casual Sport", 200000, "39, 40, 41, 42, 43", "Model sporty casual harian"],
    ["2. Pakaian Olahraga", "APP-001", "Jersey Training / Dry-Fit Lokal", 75000, "M, L, XL, XXL", "Bahan dry-fit adem menyerap keringat"],
    ["2. Pakaian Olahraga", "APP-002", "Celana Pendek Sport / Running Shorts", 60000, "M, L, XL, XXL", "Pinggang karet elastis bertali"],
    ["2. Pakaian Olahraga", "APP-003", "Jaket Windbreaker / Hoodie Sport", 150000, "M, L, XL, XXL", "Tahan angin dan gerimis ringan"],
    ["3. Aksesoris & Gym", "ACC-001", "Matras Yoga & Gym (6mm / 8mm)", 85000, "6mm / 8mm", "Bahan NBR/TPE anti-slip"],
    ["3. Aksesoris & Gym", "ACC-002", "Resistance Band Set / Dumbbell Minimalis", 45000, "Set 5 Beban", "Latihan kekuatan otot di rumah"],
    ["3. Aksesoris & Gym", "ACC-003", "Kaos Kaki Olahraga Anti-Slip (Bundle 3 pasang)", 45000, "All Size", "Bintik silikon grip bawah"],
    ["3. Aksesoris & Gym", "ACC-004", "Botol Minum Sport BPA-Free (1 Liter)", 50000, "1 Liter", "Bahan tritan bebas BPA"],
    ["3. Aksesoris & Gym", "ACC-005", "Tas Gym / Drawstring Bag Localmart", 65000, "Standar", "Tas serut praktis muat sepatu"],
    ["4. Paket Bundling Hemat", "BND-001", "Paket Starter Lari", 349000, "Sesuai Pilihan", "Sepatu Lari + Jersey Dry-Fit + Kaos Kaki (Hemat Rp 50.000)"],
    ["4. Paket Bundling Hemat", "BND-002", "Paket Home Gym Basic", 169000, "Sesuai Pilihan", "Matras Yoga + Resistance Band + Botol Minum (Hemat Rp 30.000)"]
  ];

  for (var i = 0; i < rows.length; i++) {
    sheet.appendRow(rows[i]);
  }

  // Format Header
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#0F172A"); // Slate-900
  headerRange.setFontColor("#FFFFFF");
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);

  Logger.log("Tabel " + SHEET_KNOWLEDGE + " berhasil dibuat dan diisi " + rows.length + " data.");
  return { success: true, rowsInserted: rows.length };
}

/**
 * FUNGSI TESTING: Menjalankan skenario pengujian pertanyaan 'ukuran 42 ready '
 * sesuai kode pengujian yang diberikan.
 *
 * Jalankan fungsi ini dari dropdown fungsi di Google Apps Script Editor.
 */
function testUkuran42() {
  var testInput = "ukuran 42 ready ";
  Logger.log("=================================================");
  Logger.log("MENJALANKAN TEST KNOWLEDGE QUERY: '" + testInput + "'");
  Logger.log("=================================================");

  var response = generateKnowledgeResponse(testInput);

  Logger.log("HASIL RESPON ASISTEN LOCALMART:");
  Logger.log("-------------------------------------------------");
  Logger.log(response);
  Logger.log("=================================================");

  return response;
}
