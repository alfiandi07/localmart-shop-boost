import { createFileRoute } from '@tanstack/react-router';
import { AboutSection, FAQSection, FeatureSection, Footer, Hero, MobileWhatsApp, Navbar, OrderForm, Products } from '@/components/storefront/sections';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'LocalMart — Sepatu Futsal & Minisoccer Jakarta' },
    { name: 'description', content: 'Sepatu futsal, minisoccer, kaos kaki dan dekker pilihan LocalMart. Lentur, ringan, dan nyaman. Pesan via WhatsApp di Jakarta.' },
    { property: 'og:title', content: 'LocalMart — Gesit Terus, Main Makin Puas!' },
    { property: 'og:description', content: 'Temukan sepatu futsal dan minisoccer pilihan LocalMart serta aksesoris olahraga di Jakarta.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Index,
});

function Index() {
  return <><Navbar /><main><Hero /><Products /><FeatureSection /><AboutSection /><FAQSection /><OrderForm /></main><Footer /><MobileWhatsApp /></>;
}
