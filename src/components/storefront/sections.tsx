import { useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, CheckCircle2, ChevronDown, Feather, Instagram, Loader2, MapPin, Menu, MessageCircle, Minimize, Phone, ShieldCheck, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { submitOrderToSheets } from '@/lib/google-sheets';
import { submitOrderToSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { faqs, products, WHATSAPP_URL } from '@/lib/storefront';
import { generateChatbotResponse, type ChatMessage } from '@/lib/chatbot-engine';
import minisoccer from '@/assets/minisoccer.jpg';
import futsal from '@/assets/futsal.jpg';
import accessories from '@/assets/accessories.jpg';
import logo from '@/assets/logo.png';

const links = [
  ['Produk', '#produk'],
  ['Keunggulan', '#keunggulan'],
  ['Tentang Kami', '#tentang'],
  ['FAQ', '#faq'],
  ['Tanya AI 🤖', '#tanya-ai'],
  ['Halaman Chatbot', '/chatbot'],
] as const;
const photos = [minisoccer, futsal, accessories];

export function WhatsAppButton({ children = 'Pesan via WhatsApp' }: { children?: React.ReactNode }) {
  return <Button variant="whatsapp" asChild><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><MessageCircle size={22} />{children}</a></Button>;
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  return <header className="navbar"><div className="container nav-inner"><a href="#" className="brand"><img src={logo} alt="LocalMart" className="brand-logo" /><span>LocalMart</span></a><nav aria-label="Navigasi utama" id="mobile-menu" className={`nav-links${open ? ' is-open' : ''}`}>{links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}</nav><Button variant="ghost" size="icon" className="menu-toggle" aria-label={open ? 'Tutup menu' : 'Buka menu'} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button></div></header>;
}

export function Hero() {
  return <section className="hero"><div className="container"><h1>Temukan sepatu futsal dan minisoccer anda hanya di LocalMart</h1><p>Pilih sepatu futsal dan minisoccer terbaik dari LocalMart. Elastis, ringan, dan super nyaman di kaki Kakak. Terimakasih!</p><div className="hero-actions"><WhatsAppButton /><Button variant="collection" asChild><a href="#produk">Lihat Koleksi</a></Button></div></div></section>;
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return <div className="section-heading"><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>;
}

function ProductCard({ product, photo }: { product: typeof products[number]; photo: string }) {
  return <article className="product-card"><img src={photo} alt={product.name} loading="lazy" width={960} height={720} /><div className="product-body"><h3>{product.name}</h3><p>{product.description}</p><div className="product-bottom"><span className={`product-price${product.price === null ? ' is-inquiry' : ''}`}>{product.price === null ? 'Tanya via WA' : `Rp ${product.price.toLocaleString('id-ID')}`}</span><Button variant="link" asChild className="product-order"><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">{product.action}<ArrowRight aria-hidden="true" /></a></Button></div></div></article>;
}

export function Products() {
  return <section className="section" id="produk"><div className="container"><SectionHeading title="Pilihan Favorit Kakak" subtitle="Sepatu dan aksesoris andalan untuk menemani aksi Kakak di lapangan. Terimakasih!" /><div className="product-grid">{products.map((product, index) => <ProductCard key={product.name} product={product} photo={photos[index] ?? minisoccer} />)}</div></div></section>;
}

const features = [
  { icon: Minimize, title: 'Sangat Lentur', description: 'Material fleksibel yang mengikuti bentuk kaki Kakak. Main jadi lebih bebas. Terimakasih!' },
  { icon: Feather, title: 'Terasa Ringan', description: 'Desain enteng bikin lari Kakak makin gesit. Nggak bikin kaki cepat lelah. Terimakasih!' },
  { icon: ShieldCheck, title: 'Anti Lecet', description: 'Bagian dalam super lembut untuk menjaga kaki Kakak tetap nyaman seharian. Terimakasih!' },
];

export function FeatureSection() {
  return <section className="section section-muted" id="keunggulan"><div className="container"><SectionHeading title="Keunggulan Kami" subtitle="Alasan Kakak harus mencoba produk dari LocalMart. Terimakasih!" /><div className="feature-grid">{features.map(({ icon: Icon, title, description }) => <div className="feature" key={title}><div className="feature-icon"><Icon size={30} strokeWidth={1.7} /></div><h3>{title}</h3><p>{description}</p></div>)}</div></div></section>;
}

export function AboutSection() {
  return <section className="section about" id="tentang"><div className="container"><h2>Tentang LocalMart</h2><blockquote>“LocalMart siap menemani aksi olahraga Kakak dengan sepatu berkualitas terbaik. Kami ingin Kakak main maksimal tanpa khawatir soal alas kaki. Terimakasih!”</blockquote></div></section>;
}

function AccordionItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  return <div className="faq-item"><Button variant="ghost" className="faq-trigger" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={`faq-answer-${index}`}><span>{question}</span><ChevronDown /></Button><p className="faq-answer" id={`faq-answer-${index}`} hidden={!open}>{answer}</p></div>;
}

export function FAQSection() {
  return <section className="section section-muted" id="faq"><div className="container"><SectionHeading title="Pertanyaan yang Sering Diajukan" /><div className="faq-list">{faqs.map(([question, answer], index) => <AccordionItem key={question} question={question} answer={answer} index={index} />)}</div></div></section>;
}

export function AIChatbotSection() {
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('Ukuran 42 ready Kak?');
  const [response, setResponse] = useState<ChatMessage | null>(() =>
    generateChatbotResponse('ukuran 42 ready')
  );
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    'Ukuran 42 ready Kak?',
    'Sepatu apa yang cocok untuk rumput sintetis?',
    'Rekomendasi sepatu futsal lantai vinyl/semen',
    'Tips panduan ukuran untuk kaki lebar',
    'Pengiriman instan ke Jakarta bisa hari ini?',
  ];

  const handleAsk = (q: string) => {
    const text = q.trim();
    if (!text || loading) return;
    setLoading(true);
    setActiveQuery(text);
    setQuery(text);

    setTimeout(() => {
      const res = generateChatbotResponse(text);
      setResponse(res);
      setLoading(false);
    }, 350);
  };

  return (
    <section className="section section-ai" id="tanya-ai">
      <div className="container">
        <SectionHeading
          title="Tanya Asisten AI LocalMart"
          subtitle="Punya pertanyaan seputar ukuran, ketersediaan stok, rekomendasi jenis sepatu, atau pengiriman Jakarta? Tanyakan ke Amelia Mutya dan dapatkan jawaban instan."
        />

        <div className="ai-widget-card">
          <div className="ai-widget-header">
            <div className="ai-widget-persona">
              <div className="ai-widget-avatar">
                <img src={logo} alt="Amelia Mutya" />
                <span className="chatbot-status-dot" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 className="ai-widget-name">Amelia Mutya</h3>
                  <span className="chatbot-badge">AI Assistant</span>
                </div>
                <p className="ai-widget-desc">Siap menjawab pertanyaan seputar produk & stok 24/7</p>
              </div>
            </div>

            <Link to="/chatbot" className="ai-widget-fullscreen-btn">
              Buka Layar Penuh <ArrowRight size={15} />
            </Link>
          </div>

          <div className="ai-widget-pills">
            <span className="ai-pills-label">Pilih Pertanyaan Cepat:</span>
            <div className="ai-pills-list">
              {sampleQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  className={`ai-pill-btn${activeQuery === q ? ' is-active' : ''}`}
                  onClick={() => handleAsk(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <form
            className="ai-widget-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk(query);
            }}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ketik pertanyaan Kakak di sini (contoh: ukuran 42 ready Kak?)..."
              className="ai-widget-input"
            />
            <Button type="submit" disabled={!query.trim() || loading} className="ai-widget-send-btn">
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
              <span>{loading ? 'Menjawab...' : 'Tanya AI'}</span>
            </Button>
          </form>

          {response && (
            <div className="ai-widget-response-box">
              <div className="ai-response-meta">
                <span className="ai-response-badge">Jawaban Amelia Mutya:</span>
                <span className="ai-response-time">{response.timestamp}</span>
              </div>
              <div className="ai-response-text">
                {response.text.split('\n\n').map((para, i) => (
                  <p key={i}>
                    {para.split('\n').map((line, j) => (
                      <span key={j}>
                        {line}
                        {j < para.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                ))}
              </div>

              {response.actions && response.actions.length > 0 && (
                <div className="ai-response-actions">
                  {response.actions.map((act, i) => (
                    <a
                      key={i}
                      href={act.value}
                      target={act.type === 'wa' ? '_blank' : undefined}
                      rel={act.type === 'wa' ? 'noopener noreferrer' : undefined}
                      className={`chatbot-action-btn ${act.type === 'wa' ? 'wa-btn' : 'link-btn'}`}
                    >
                      <MessageCircle size={15} />
                      {act.label}
                    </a>
                  ))}
                  <Link to="/chatbot" className="chatbot-action-btn link-btn">
                    Lanjut Ngobrol di Halaman Chatbot →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function OrderForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderData, setOrderData] = useState<{
    orderId: string;
    customerName: string;
    productName: string;
    phone: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const customerName = String(formData.get('name') ?? '').trim();
    const customerPhone = String(formData.get('phone') ?? '').trim();
    const productName = String(formData.get('product') ?? '');
    const size = String(formData.get('size') ?? '').trim();
    const quantity = Number(formData.get('quantity')) || 1;
    const notes = String(formData.get('notes') ?? '').trim();

    setLoading(true);
    setErrorMessage(null);

    try {
      let orderId = '';
      let isSuccess = false;

      // 1. Coba simpan ke Supabase terlebih dahulu
      if (isSupabaseConfigured()) {
        const supaRes = await submitOrderToSupabase({
          customerName,
          customerPhone,
          productName,
          size: size || undefined,
          quantity,
          notes: notes || undefined,
        });

        if (supaRes.success && supaRes.data) {
          orderId = supaRes.data.orderId;
          isSuccess = true;
          // Sync backup ke Google Sheets di background
          submitOrderToSheets({
            customerName,
            customerPhone,
            productName,
            size: size || undefined,
            quantity,
            notes: notes || undefined,
          }).catch(() => {});
        }
      }

      // 2. Jika Supabase belum di-setup tabelnya atau gagal, gunakan Google Sheets
      if (!isSuccess) {
        const sheetsRes = await submitOrderToSheets({
          customerName,
          customerPhone,
          productName,
          size: size || undefined,
          quantity,
          notes: notes || undefined,
        });

        if (sheetsRes.success) {
          orderId = sheetsRes.data.orderId;
          isSuccess = true;
        } else {
          setSubmitted(true);
          setErrorMessage(sheetsRes.error || 'Gagal menyimpan pesanan.');
          return;
        }
      }

      if (isSuccess && orderId) {
        setSubmitted(true);
        setOrderData({
          orderId,
          customerName,
          productName,
          phone: customerPhone,
        });
        form.reset();
      }
    } catch (err) {
      setSubmitted(true);
      setErrorMessage(err instanceof Error ? err.message : 'Terjadi kendala saat memproses pesanan.');
    } finally {
      setLoading(false);
    }
  }

  const successWaUrl = orderData
    ? `https://wa.me/6289652914048?text=${encodeURIComponent(
        `Halo LocalMart, saya ${orderData.customerName} sudah memesan ${orderData.productName} via website dengan No. Pesanan ${orderData.orderId}. Mohon diproses ya Kak. Terimakasih!`
      )}`
    : WHATSAPP_URL;

  return (
    <section className="section" id="pesanan">
      <div className="container">
        <SectionHeading
          title="Formulir Pesanan"
          subtitle="Isi data di bawah ini, Kak. Pesanan akan otomatis tercatat ke sistem dan dapat langsung dikonfirmasi via WhatsApp. Terimakasih!"
        />
        <form className="order-form" onSubmit={onSubmit}>
          <div className="form-field">
            <label htmlFor="name">Nama Lengkap Kakak</label>
            <input
              id="name"
              name="name"
              placeholder="Misal: Budi Santoso"
              autoComplete="name"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="phone">Nomor WhatsApp Kakak</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Misal: 0896-5291-4049"
              autoComplete="tel"
              required
            />
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="product">Pilih Produk</label>
              <select id="product" name="product" required defaultValue="">
                <option value="" disabled>-- Pilih Sepatu --</option>
                {products
                  .filter((product) => product.price !== null)
                  .map((product) => (
                    <option key={product.name} value={product.name}>
                      {product.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="size">Ukuran (Size)</label>
              <input id="size" name="size" placeholder="Misal: 42" />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="quantity">Jumlah</label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              placeholder="1"
              defaultValue={1}
              min={1}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="notes">Catatan Tambahan (opsional)</label>
            <textarea
              id="notes"
              name="notes"
              placeholder="Alamat pengiriman / catatan lainnya..."
            />
          </div>

          <Button type="submit" variant="order" className="form-submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Menyimpan Pesanan...
              </>
            ) : (
              <>
                <MessageCircle />
                Kirim Pesanan
              </>
            )}
          </Button>

          {submitted && orderData && (
            <div role="status" className="form-notice is-success">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                <CheckCircle2 size={20} />
                <span>Pesanan Berhasil Dicatat ke Sistem!</span>
              </div>
              <p style={{ margin: 0 }}>
                Nomor Pesanan: <strong>{orderData.orderId}</strong>. Data Kakak telah tersimpan di Google Sheets. Silakan konfirmasi pesanan ke admin melalui tautan di bawah ini:
              </p>
              <Button variant="whatsapp" asChild style={{ marginTop: '4px' }}>
                <a href={successWaUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={18} />
                  Konfirmasi via WhatsApp Sekarang
                </a>
              </Button>
            </div>
          )}

          {submitted && errorMessage && (
            <div role="status" className="form-notice is-error">
              <p style={{ margin: '0 0 10px 0' }}>
                Pesanan belum tercatat otomatis ({errorMessage}), Kak. Silakan hubungi kami langsung via WhatsApp untuk pemesanan manual. Terimakasih!
              </p>
              <Button variant="whatsapp" asChild>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={18} />
                  Hubungi via WhatsApp
                </a>
              </Button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

export function Footer() {
  return <footer className="footer"><div className="container"><div className="footer-grid"><div><a className="brand" href="#"><img src={logo} alt="LocalMart" className="brand-logo" /><span>LocalMart</span></a><p>Penyedia sepatu futsal dan minisoccer pilihan untuk performa terbaik di lapangan. Lentur, ringan, dan nyaman dipakai.</p></div><div><h3>Kontak Kami</h3><div className="contact-list"><span className="contact-line"><MapPin size={18} /><span>Jl, Kemayoran Ketapang, Jakarta Pusat, Jakarta</span></span><a className="contact-line" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><Phone size={18} /><span>0896-5291-4049</span></a><span className="contact-line"><Instagram size={18} /><span>@Sportevo</span></span></div></div><div><h3>LocalMart</h3><nav className="footer-links" aria-label="Navigasi footer">{links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav></div></div><div className="footer-bottom"><span>© 2026 LocalMart</span><span>Terimakasih Kak, ditunggu orderannya!</span></div></div></footer>;
}

export function MobileWhatsApp() {
  return <div className="mobile-wa"><WhatsAppButton /></div>;
}

export function FloatingAIChatbot() {
  return (
    <Link to="/chatbot" className="floating-ai-launcher" aria-label="Tanya Chatbot AI Amelia Mutya">
      <span className="floating-ai-icon-pulse">
        <Sparkles size={18} />
      </span>
      <span>Tanya AI Amelia Mutya</span>
    </Link>
  );
}

