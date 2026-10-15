import { createFileRoute } from '@tanstack/react-router';
import { ChatInterface } from '@/components/chatbot/ChatInterface';

export const Route = createFileRoute('/chatbot')({
  head: () => ({
    meta: [
      { title: 'Chatbot AI LocalMart — Tanya Sepatu Futsal & Minisoccer Jakarta' },
      {
        name: 'description',
        content:
          'Konsultasi gratis dengan Marty, Asisten AI resmi LocalMart Jakarta. Dapatkan rekomendasi sepatu futsal, minisoccer, panduan ukuran, cek ongkir, dan status pesanan.',
      },
      { property: 'og:title', content: 'Chatbot AI LocalMart — Asisten Belanja Sepatu Olahraga' },
      {
        property: 'og:description',
        content:
          'Pilih sepatu futsal & minisoccer terbaik dengan bantuan asisten AI interaktif LocalMart Jakarta.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: ChatbotPage,
});

function ChatbotPage() {
  return <ChatInterface />;
}
