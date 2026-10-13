/**
 * ============================================================================
 * LOCALMART - GOOGLE APPS SCRIPT DATABASE HANDLER
 * ============================================================================
 * Script ini berfungsi sebagai backend API & pengelola database untuk LocalMart.
 * Menggunakan Google Sheets sebagai basis data tabel:
 *   1. Orders     - Menyimpan semua transaksi / formulir pesanan
 *   2. Products   - Master katalog produk, harga, dan stok
 *   3. Customers  - Database pelanggan tetap & leads (otomatis ter-update)
 *   4. Inquiries  - Pertanyaan / konsultasi pelanggan
 * 
 * PANDUAN PEMASANGAN:
 * 1. Buka spreadsheet Google Sheets Anda (misal: "Database LocalMart").
 * 2. Klik menu 'Extensions' (Ekstensi) > 'Apps Script'.
 * 3. Hapus kode lama, lalu salin dan tempelkan seluruh isi file ini.
 * 4. Jalankan fungsi 'setupDatabase' (atau 'setupCustomersTable') dari dropdown fungsi
 *    untuk membuat semua tabel, header, dan data awal secara otomatis.
 * 5. Klik 'Deploy' (Terapkan) > 'Manage deployments' > Edit > New version > Deploy.
 * ============================================================================
 */

// Konstanta Nama Sheet
var SHEET_ORDERS = "Orders";
var SHEET_PRODUCTS = "Products";
var SHEET_CUSTOMERS = "Customers";
var SHEET_INQUIRIES = "Inquiries";

/**
 * Inisialisasi struktur sheet, header kolom, dan data database awal.
 * Jalankan fungsi ini di Apps Script editor untuk membuat semua tabel.
 */
function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Setup Sheet: Orders
  var orderHeaders = [
    "Order ID",
    "Timestamp",
    "Nama Pelanggan",
    "No WhatsApp",
    "Produk",
    "Ukuran",
    "Jumlah",
    "Harga Satuan",
    "Total Harga",
    "Alamat / Kota",
    "Catatan",
    "Metode Bayar",
    "Status Bayar",
    "Status Pesanan",
    "No Resi"
  ];
  setupSheet(ss, SHEET_ORDERS, orderHeaders);

  // 2. Setup Sheet: Products
  var productHeaders = [
    "Product ID",
    "Nama Produk",
    "Kategori",
    "Harga (IDR)",
    "Stok",
    "Ukuran Tersedia",
    "Deskripsi",
    "URL Gambar",
    "Status"
  ];
  var productSheet = setupSheet(ss, SHEET_PRODUCTS, productHeaders);
  
  // Isi data katalog produk awal jika masih kosong
  if (productSheet.getLastRow() === 1) {
    productSheet.appendRow([
      "PRD-001",
      "Sepatu Minisoccer Aerion",
      "Sepatu Minisoccer",
      210000,
      25,
      "39, 40, 41, 42, 43",
      "Sepatu andalan dengan sol bergerigi, lentur, dan ringan. Bikin manuver makin lincah di lapangan.",
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06",
      "AKTIF"
    ]);
    productSheet.appendRow([
      "PRD-002",
      "Sepatu Futsal Aerion",
      "Sepatu Futsal",
      190000,
      30,
      "39, 40, 41, 42, 43",
      "Pilihan tepat untuk futsal yang ringan dan nyaman. Main puas tanpa khawatir kaki pegal.",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
      "AKTIF"
    ]);
    productSheet.appendRow([
      "PRD-003",
      "Kaos Kaki & Dekker",
      "Aksesoris Olahraga",
      "",
      50,
      "All Size",
      "Lengkapi aksi main dengan aksesoris pelindung berkualitas. Nyaman dipakai dan melindungi dengan baik.",
      "https://images.unsplash.com/photo-1579298245158-33e8f568f7d3",
      "AKTIF"
    ]);
  }

  // 3. Setup Sheet: Customers (dengan data master awal)
  setupCustomersTable();

  // 4. Setup Sheet: Inquiries
  var inquiryHeaders = [
    "Inquiry ID",
    "Timestamp",
    "Nama",
    "No WhatsApp",
    "Produk Ditanyakan",
    "Pesan / Catatan",
    "Status"
  ];
  setupSheet(ss, SHEET_INQUIRIES, inquiryHeaders);

  Logger.log("Berhasil menginisialisasi database LocalMart.");
}

/**
 * Khusus untuk membuat tabel Customers dan mengisi data awal pelanggan.
 * Dapat dijalankan langsung dari dropdown fungsi di Apps Script.
 */
function setupCustomersTable() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var customerHeaders = [
    "Customer ID",
    "Nama",
    "No WhatsApp",
    "Kota",
    "Alamat",
    "Total Pesanan",
    "Total Belanja (IDR)",
    "Transaksi Terakhir",
    "Terdaftar Sejak"
  ];
  var customerSheet = setupSheet(ss, SHEET_CUSTOMERS, customerHeaders);

  // Jika tabel Customers masih kosong (hanya ada baris header)
  if (customerSheet.getLastRow() === 1) {
    var now = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");

    customerSheet.appendRow([
      "CUST-0001",
      "Budi Santoso",
      "6289652914049",
      "Jakarta Pusat",
      "Jl. Kemayoran Ketapang No. 12, Jakarta Pusat",
      2,
      400000,
      now,
      now
    ]);
    customerSheet.appendRow([
      "CUST-0002",
      "Dimas Pratama",
      "6281234567890",
      "Jakarta Selatan",
      "Jl. Fatmawati No. 45, Jakarta Selatan",
      1,
      210000,
      now,
      now
    ]);
    customerSheet.appendRow([
      "CUST-0003",
      "Rizky Ramadhan",
      "6285712345678",
      "Jakarta Barat",
      "Jl. Tanjung Duren Raya No. 8, Jakarta Barat",
      3,
      590000,
      now,
      now
    ]);

    Logger.log("Tabel Customers berhasil dibuat dan diisi data awal.");
  } else {
    Logger.log("Tabel Customers sudah memiliki data (" + (customerSheet.getLastRow() - 1) + " baris).");
  }

  return customerSheet;
}

/**
 * Helper untuk membuat sheet baru jika belum ada dan memformat header
 */
function setupSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  // Tulis header jika baris pertama belum terisi
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  // Styling header: background gelap, teks putih tebal, freeze baris 1
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#1E293B"); // Slate dark
  headerRange.setFontColor("#FFFFFF");
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);

  return sheet;
}

/**
 * Handler HTTP POST (Menerima data dari formulir website)
 */
function doPost(e) {
  try {
    var requestData = parseRequestBody(e);
    var action = requestData.action || "CREATE_ORDER";
    var payload = requestData.payload || requestData;

    var result;
    if (action === "CREATE_ORDER") {
      result = handleCreateOrder(payload);
    } else if (action === "CREATE_INQUIRY") {
      result = handleCreateInquiry(payload);
    } else if (action === "CREATE_CUSTOMER") {
      result = handleCreateCustomer(payload);
    } else if (action === "SETUP_DATABASE") {
      setupDatabase();
      result = { message: "Database setup completed successfully." };
    } else if (action === "SETUP_CUSTOMERS") {
      setupCustomersTable();
      result = { message: "Customers table setup completed successfully." };
    } else {
      throw new Error("Action tidak dikenali: " + action);
    }

    return createJsonResponse({
      success: true,
      data: result
    });
  } catch (error) {
    return createJsonResponse({
      success: false,
      error: error.message || error.toString()
    });
  }
}

/**
 * Handler HTTP GET (Mengambil data produk, customer, atau status pesanan)
 */
function doGet(e) {
  try {
    var params = e ? e.parameter : {};
    var action = params.action || "GET_PRODUCTS";

    var result;
    if (action === "GET_PRODUCTS") {
      result = handleGetProducts();
    } else if (action === "GET_CUSTOMERS") {
      result = handleGetCustomers();
    } else if (action === "GET_CUSTOMER_BY_PHONE") {
      result = handleGetCustomerByPhone(params.phone);
    } else if (action === "GET_ORDER_STATUS") {
      result = handleGetOrderStatus(params.orderId || params.id);
    } else {
      result = {
        name: "LocalMart Google Sheets API",
        version: "1.1.0",
        status: "ONLINE",
        timestamp: new Date().toISOString()
      };
    }

    return createJsonResponse({
      success: true,
      data: result
    });
  } catch (error) {
    return createJsonResponse({
      success: false,
      error: error.message || error.toString()
    });
  }
}

/**
 * Proses pembuatan pesanan baru (Orders & Customers auto-update)
 */
function handleCreateOrder(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var orderSheet = ss.getSheetByName(SHEET_ORDERS);
  var productSheet = ss.getSheetByName(SHEET_PRODUCTS);
  if (!orderSheet) {
    setupDatabase();
    orderSheet = ss.getSheetByName(SHEET_ORDERS);
    productSheet = ss.getSheetByName(SHEET_PRODUCTS);
  }

  // 1. Generate Order ID: ORD-YYYYMMDD-XXXX
  var dateStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyyMMdd");
  var randomSuffix = ("0000" + Math.floor(Math.random() * 10000)).slice(-4);
  var orderId = "ORD-" + dateStr + "-" + randomSuffix;
  var timestamp = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");

  var customerName = (payload.customerName || payload.name || "").trim();
  var customerPhone = normalizePhoneNumber(payload.customerPhone || payload.phone || "");
  var productName = payload.productName || payload.product || "";
  var size = payload.size || "-";
  var quantity = Number(payload.quantity) || 1;
  var notes = payload.notes || "-";
  var shippingAddress = payload.shippingAddress || payload.address || "Jakarta";
  var paymentMethod = payload.paymentMethod || "WHATSAPP_CONFIRM";

  if (!customerName || !productName) {
    throw new Error("Nama dan Produk wajib diisi.");
  }

  // 2. Lookup harga jika tidak diberikan
  var pricePerUnit = Number(payload.pricePerUnit) || 0;
  if (pricePerUnit === 0 && productSheet) {
    pricePerUnit = findProductPrice(productSheet, productName);
  }
  var totalPrice = pricePerUnit > 0 ? pricePerUnit * quantity : 0;

  // 3. Tambahkan ke sheet Orders
  var newRow = [
    orderId,
    timestamp,
    customerName,
    customerPhone,
    productName,
    size,
    quantity,
    pricePerUnit,
    totalPrice,
    shippingAddress,
    notes,
    paymentMethod,
    "UNPAID",
    "PENDING",
    "" // No resi kosong
  ];
  orderSheet.appendRow(newRow);

  // 4. Update / Buat data customer di sheet Customers
  if (customerPhone) {
    upsertCustomer(ss, {
      name: customerName,
      phone: customerPhone,
      city: shippingAddress,
      totalSpent: totalPrice,
      timestamp: timestamp
    });
  }

  return {
    orderId: orderId,
    timestamp: timestamp,
    customerName: customerName,
    productName: productName,
    quantity: quantity,
    totalPrice: totalPrice,
    status: "PENDING"
  };
}

/**
 * Mengambil seluruh data pelanggan dari sheet Customers
 */
function handleGetCustomers() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_CUSTOMERS);
  if (!sheet) {
    sheet = setupCustomersTable();
  }

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var customers = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    customers.push({
      customerId: row[0],
      name: row[1],
      phone: String(row[2]),
      city: row[3] || "-",
      address: row[4] || "-",
      totalOrders: Number(row[5]) || 0,
      totalSpent: Number(row[6]) || 0,
      lastOrderDate: row[7],
      firstRegistered: row[8]
    });
  }

  return customers;
}

/**
 * Mencari data pelanggan berdasarkan nomor WhatsApp
 */
function handleGetCustomerByPhone(phone) {
  if (!phone) throw new Error("Parameter nomor telepon / WhatsApp wajib diisi.");

  var normalized = normalizePhoneNumber(phone);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_CUSTOMERS);
  if (!sheet) throw new Error("Tabel Customers tidak ditemukan.");

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (normalizePhoneNumber(row[2]) === normalized) {
      return {
        customerId: row[0],
        name: row[1],
        phone: String(row[2]),
        city: row[3],
        address: row[4],
        totalOrders: Number(row[5]) || 0,
        totalSpent: Number(row[6]) || 0,
        lastOrderDate: row[7],
        firstRegistered: row[8]
      };
    }
  }

  return null;
}

/**
 * Membuat data pelanggan baru secara manual via API
 */
function handleCreateCustomer(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var name = (payload.name || "").trim();
  var phone = normalizePhoneNumber(payload.phone || "");
  var city = payload.city || "-";
  var address = payload.address || "-";

  if (!name || !phone) {
    throw new Error("Nama dan nomor WhatsApp wajib diisi.");
  }

  var now = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
  return upsertCustomer(ss, {
    name: name,
    phone: phone,
    city: city,
    address: address,
    totalSpent: Number(payload.totalSpent) || 0,
    timestamp: now
  });
}

/**
 * Proses penyimpanan formulir konsultasi / pesan (Inquiries)
 */
function handleCreateInquiry(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var inquirySheet = ss.getSheetByName(SHEET_INQUIRIES);
  if (!inquirySheet) {
    setupDatabase();
    inquirySheet = ss.getSheetByName(SHEET_INQUIRIES);
  }

  var dateStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyyMMdd");
  var randomSuffix = ("0000" + Math.floor(Math.random() * 10000)).slice(-4);
  var inquiryId = "INQ-" + dateStr + "-" + randomSuffix;
  var timestamp = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");

  var name = (payload.name || "").trim();
  var phone = normalizePhoneNumber(payload.phone || "");
  var productInterest = payload.productInterest || payload.product || "-";
  var message = payload.message || "-";

  inquirySheet.appendRow([
    inquiryId,
    timestamp,
    name,
    phone,
    productInterest,
    message,
    "NEW"
  ]);

  return {
    inquiryId: inquiryId,
    timestamp: timestamp,
    name: name,
    status: "NEW"
  };
}

/**
 * Mengambil daftar produk aktif dari sheet Products
 */
function handleGetProducts() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_PRODUCTS);
  if (!sheet) {
    setupDatabase();
    sheet = ss.getSheetByName(SHEET_PRODUCTS);
  }

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var products = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var status = String(row[8] || "").toUpperCase();
    if (status === "AKTIF" || status === "ACTIVE" || status === "TRUE") {
      products.push({
        id: row[0],
        name: row[1],
        category: row[2],
        price: row[3] !== "" && !isNaN(row[3]) ? Number(row[3]) : null,
        stock: Number(row[4]) || 0,
        availableSizes: String(row[5] || "").split(",").map(function(s) { return s.trim(); }).filter(Boolean),
        description: row[6] || "",
        imageUrl: row[7] || "",
        status: status
      });
    }
  }

  return products;
}

/**
 * Mengecek status pesanan berdasarkan Order ID
 */
function handleGetOrderStatus(orderId) {
  if (!orderId) throw new Error("Parameter orderId wajib diisi.");

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_ORDERS);
  if (!sheet) throw new Error("Tabel Orders tidak ditemukan.");

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(row[0]).trim().toUpperCase() === String(orderId).trim().toUpperCase()) {
      return {
        orderId: row[0],
        timestamp: row[1],
        customerName: row[2],
        productName: row[4],
        quantity: row[6],
        totalPrice: row[8],
        paymentStatus: row[12],
        orderStatus: row[13],
        trackingNumber: row[14] || null
      };
    }
  }

  throw new Error("Pesanan dengan ID " + orderId + " tidak ditemukan.");
}

/**
 * Helper mencari harga produk dari sheet Products
 */
function findProductPrice(productSheet, productName) {
  var data = productSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var name = String(data[i][1]).toLowerCase();
    if (name.indexOf(productName.toLowerCase()) !== -1 || productName.toLowerCase().indexOf(name) !== -1) {
      var price = Number(data[i][3]);
      return isNaN(price) ? 0 : price;
    }
  }
  return 0;
}

/**
 * Helper update atau insert customer baru di sheet Customers
 */
function upsertCustomer(ss, custData) {
  var sheet = ss.getSheetByName(SHEET_CUSTOMERS);
  if (!sheet) {
    sheet = setupCustomersTable();
  }

  var data = sheet.getDataRange().getValues();
  var foundRow = -1;

  for (var i = 1; i < data.length; i++) {
    if (normalizePhoneNumber(data[i][2]) === normalizePhoneNumber(custData.phone)) {
      foundRow = i + 1; // 1-based index untuk getRange
      break;
    }
  }

  if (foundRow > 0) {
    // Customer lama: perbarui total pesanan, total belanja, dan tanggal terakhir
    var currentOrders = Number(sheet.getRange(foundRow, 6).getValue()) || 0;
    var currentSpent = Number(sheet.getRange(foundRow, 7).getValue()) || 0;

    sheet.getRange(foundRow, 6).setValue(currentOrders + 1);
    sheet.getRange(foundRow, 7).setValue(currentSpent + custData.totalSpent);
    sheet.getRange(foundRow, 8).setValue(custData.timestamp);

    return {
      customerId: sheet.getRange(foundRow, 1).getValue(),
      name: sheet.getRange(foundRow, 2).getValue(),
      phone: custData.phone,
      totalOrders: currentOrders + 1,
      totalSpent: currentSpent + custData.totalSpent
    };
  } else {
    // Customer baru: generate ID CUST-XXXX dan tambahkan baris baru
    var custId = "CUST-" + ("0000" + sheet.getLastRow()).slice(-4);
    var newRow = [
      custId,
      custData.name,
      custData.phone,
      custData.city || "-",
      custData.address || "-",
      1,
      custData.totalSpent || 0,
      custData.timestamp,
      custData.timestamp
    ];
    sheet.appendRow(newRow);

    return {
      customerId: custId,
      name: custData.name,
      phone: custData.phone,
      totalOrders: 1,
      totalSpent: custData.totalSpent || 0
    };
  }
}

/**
 * Normalisasi format nomor telepon (08xx -> 628xx)
 */
function normalizePhoneNumber(phone) {
  var cleaned = String(phone).replace(/[^0-9]/g, "");
  if (cleaned.indexOf("08") === 0) {
    cleaned = "628" + cleaned.slice(2);
  }
  return cleaned;
}

/**
 * Parser payload request (mendukung format JSON & POST form data)
 */
function parseRequestBody(e) {
  if (!e) return {};
  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (err) {
      return e.parameter || {};
    }
  }
  return e.parameter || {};
}

/**
 * Menghasilkan HTTP Response JSON dengan header MIME JSON
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
