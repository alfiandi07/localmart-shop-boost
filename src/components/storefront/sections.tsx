import { useState, type FormEvent } from 'react';
import { ArrowRight, ChevronDown, Feather, Instagram, MapPin, Menu, MessageCircle, Minimize, Phone, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { faqs, products, WHATSAPP_URL } from '@/lib/storefront';
import minisoccer from '@/assets/minisoccer.jpg';
import futsal from '@/assets/futsal.jpg';
import accessories from '@/assets/accessories.jpg';

const links = [['Produk', '#produk'], ['Keunggulan', '#keunggulan'], ['Tentang Kami', '#tentang'], ['FAQ', '#faq']] as const;
const photos = [minisoccer, futsal, accessories];

export function WhatsAppButton({ children = 'Pesan via WhatsApp' }: { children?: React.ReactNode }) {
  return <Button variant="whatsapp" asChild><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><MessageCircle size={22} />{children}</a></Button>;
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  return <header className="navbar"><div className="container nav-inner"><a href="#" className="brand">LocalMart</a><nav aria-label="Navigasi utama" id="mobile-menu" className={`nav-links${open ? ' is-open' : ''}`}>{links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}</nav><Button variant="ghost" size="icon" className="menu-toggle" aria-label={open ? 'Tutup menu' : 'Buka menu'} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button></div></header>;
}

export function Hero() {
  return <section className="hero"><div className="container"><h1>Gesit Terus, Main Makin Puas!</h1><p>Pilih sepatu futsal dan minisoccer terbaik dari LocalMart. Elastis, ringan, dan super nyaman di kaki Kakak. Terimakasih!</p><div className="hero-actions"><WhatsAppButton /><Button variant="collection" asChild><a href="#produk">Lihat Koleksi</a></Button></div></div></section>;
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

export function OrderForm() {
  const [submitted, setSubmitted] = useState(false);
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: Connect to webhook later
    setSubmitted(true);
  }
  return <section className="section" id="pesanan"><div className="container"><SectionHeading title="Formulir Pesanan" subtitle="Isi data di bawah ini, Kak. Nanti admin kami akan memproses pesanan Kakak. Terimakasih!" /><form className="order-form" onSubmit={onSubmit}><div className="form-field"><label htmlFor="name">Nama Lengkap Kakak</label><input id="name" name="name" placeholder="Misal: Budi Santoso" autoComplete="name" required /></div><div className="form-grid"><div className="form-field"><label htmlFor="product">Pilih Produk</label><select id="product" name="product" required defaultValue=""><option value="" disabled>-- Pilih Sepatu --</option>{products.filter(product => product.price !== null).map(product => <option key={product.name} value={product.name}>{product.name}</option>)}</select></div><div className="form-field"><label htmlFor="quantity">Jumlah</label><input id="quantity" name="quantity" type="number" placeholder="1" defaultValue={1} min={1} required /></div></div><div className="form-field"><label htmlFor="notes">Catatan Tambahan (opsional)</label><textarea id="notes" name="notes" /></div><Button type="submit" variant="order" className="form-submit"><MessageCircle />Kirim ke WhatsApp</Button>{submitted && <p role="status" className="form-notice">Pesanan belum terkirim, Kak. Silakan hubungi kami langsung via WhatsApp. Terimakasih!</p>}</form></div></section>;
}

export function Footer() {
  return <footer className="footer"><div className="container"><div className="footer-grid"><div><a className="brand" href="#">LocalMart</a><p>Penyedia sepatu futsal dan minisoccer pilihan untuk performa terbaik di lapangan. Lentur, ringan, dan nyaman dipakai.</p></div><div><h3>Kontak Kami</h3><div className="contact-list"><span className="contact-line"><MapPin size={18} /><span>Jl, Kemayoran Ketapang, Jakarta Pusat, Jakarta</span></span><a className="contact-line" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><Phone size={18} /><span>0896-5291-4049</span></a><span className="contact-line"><Instagram size={18} /><span>@Sportevo</span></span></div></div><div><h3>LocalMart</h3><nav className="footer-links" aria-label="Navigasi footer">{links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav></div></div><div className="footer-bottom"><span>© 2026 LocalMart</span><span>Terimakasih Kak, ditunggu orderannya!</span></div></div></footer>;
}

export function MobileWhatsApp() {
  return <div className="mobile-wa"><WhatsAppButton /></div>;
}
