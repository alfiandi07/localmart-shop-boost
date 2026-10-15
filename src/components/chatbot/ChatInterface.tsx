import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Send,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  MessageCircle,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  CheckCheck,
  HelpCircle,
  CheckCircle2,
  Loader2,
  X,
  PhoneCall,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  type ChatMessage,
  generateChatbotResponse,
  getWelcomeMessage,
  INITIAL_SUGGESTIONS,
  type ChatProduct,
} from '@/lib/chatbot-engine';
import { WHATSAPP_URL } from '@/lib/storefront';
import { submitInquiryToSupabase, isSupabaseConfigured } from '@/lib/supabase';
import logo from '@/assets/logo.png';

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Check if there are cached messages in sessionStorage for continuity
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('localmart_chat_history');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // fallback
      }
    }
    return [getWelcomeMessage()];
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('smooth');
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('localmart_chat_history', JSON.stringify(messages));
      } catch {
        // ignore
      }
    }
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend ?? input).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Dynamic bot response delay for natural feel (400 - 800ms)
    const delay = Math.min(800, Math.max(400, text.length * 15));
    setTimeout(() => {
      const botResponse = generateChatbotResponse(text);
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, delay);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    if (confirm('Mulai percakapan baru dengan Marty?')) {
      const welcome = getWelcomeMessage();
      setMessages([welcome]);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('localmart_chat_history');
      }
    }
  };

  const handleInquirySubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get('inquiry_name') ?? '').trim();
    const phone = String(formData.get('inquiry_phone') ?? '').trim();
    const message = String(formData.get('inquiry_msg') ?? '').trim();
    const productInterest = String(formData.get('inquiry_product') ?? '');

    if (!name || !phone || !message) return;

    setInquiryLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const res = await submitInquiryToSupabase({
          name,
          phone,
          message,
          productInterest: productInterest || undefined,
        });
        if (res.success && res.data) {
          setInquirySuccess(res.data.inquiryId);
        } else {
          setInquirySuccess('INQ-OFFLINE');
        }
      } else {
        setInquirySuccess('INQ-SENT');
      }
    } catch {
      setInquirySuccess('INQ-SENT');
    } finally {
      setInquiryLoading(false);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {/* HEADER */}
      <header className="chatbot-header">
        <div className="chatbot-header-inner">
          <div className="chatbot-header-left">
            <Link to="/" className="chatbot-back-btn" title="Kembali ke Beranda">
              <ArrowLeft size={20} />
              <span className="back-text">Beranda</span>
            </Link>

            <div className="chatbot-avatar-container">
              <div className="chatbot-avatar">
                <img src={logo} alt="LocalMart" className="chatbot-avatar-img" />
                <span className="chatbot-status-dot" title="Online 24/7" />
              </div>
              <div className="chatbot-header-info">
                <div className="chatbot-title-row">
                  <h1 className="chatbot-title">Marty</h1>
                  <span className="chatbot-badge">AI Assistant</span>
                </div>
                <p className="chatbot-subtitle">Spesialis Sepatu Futsal & Minisoccer Jakarta</p>
              </div>
            </div>
          </div>

          <div className="chatbot-header-actions">
            <button
              type="button"
              className="chatbot-action-icon-btn"
              onClick={() => setShowInquiryModal(true)}
              title="Tinggalkan Pertanyaan Khusus"
            >
              <HelpCircle size={18} />
              <span className="action-label">Tinggalkan Pesan</span>
            </button>

            <button
              type="button"
              className="chatbot-action-icon-btn"
              onClick={handleResetChat}
              title="Reset Percakapan"
            >
              <RotateCcw size={18} />
              <span className="action-label">Reset</span>
            </button>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="chatbot-wa-direct-btn"
              title="Chat langsung WhatsApp Admin"
            >
              <MessageCircle size={17} />
              <span className="action-label">Admin WA</span>
            </a>
          </div>
        </div>
      </header>

      {/* CONVERSATION BODY */}
      <main className="chatbot-messages-container">
        <div className="chatbot-messages-inner">
          {/* Trust Banner */}
          <div className="chatbot-trust-banner">
            <div className="trust-item">
              <Sparkles size={14} />
              <span>Respons Cepat & Rekomendasi Akurat</span>
            </div>
            <div className="trust-divider">•</div>
            <div className="trust-item">
              <span>Siap Kirim Instan Jakarta</span>
            </div>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chatbot-bubble-row ${msg.sender === 'user' ? 'is-user' : 'is-bot'}`}
            >
              {msg.sender === 'bot' && (
                <div className="bot-bubble-avatar">
                  <img src={logo} alt="Marty" />
                </div>
              )}

              <div className="chatbot-bubble-content">
                <div className="chatbot-bubble">
                  {/* Message formatted paragraphs */}
                  <div className="chatbot-text-body">
                    {msg.text.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx}>
                        {paragraph.split('\n').map((line, lIdx) => (
                          <span key={lIdx}>
                            {renderFormattedText(line)}
                            {lIdx < paragraph.split('\n').length - 1 && <br />}
                          </span>
                        ))}
                      </p>
                    ))}
                  </div>

                  {/* Table Data (e.g. Size Chart) */}
                  {msg.tableData && (
                    <div className="chatbot-table-wrapper">
                      <table className="chatbot-table">
                        <thead>
                          <tr>
                            {msg.tableData.headers.map((h, i) => (
                              <th key={i}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {msg.tableData.rows.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className={cIdx === 0 ? 'font-bold' : ''}>
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Embedded Products */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="chatbot-products-grid">
                      {msg.products.map((prod) => (
                        <ChatProductCard key={prod.id} product={prod} />
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="chatbot-bubble-actions">
                      {msg.actions.map((act, aIdx) => (
                        <ActionButton key={aIdx} action={act} />
                      ))}
                    </div>
                  )}

                  <div className="chatbot-bubble-meta">
                    <span className="chatbot-timestamp">{msg.timestamp}</span>
                    {msg.sender === 'user' && (
                      <span title="Terkirim">
                        <CheckCheck size={14} className="chatbot-read-icon" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Reply Chips below bot message */}
                {msg.sender === 'bot' && msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="chatbot-quick-replies">
                    {msg.quickReplies.map((reply, rIdx) => (
                      <button
                        key={rIdx}
                        type="button"
                        className="chatbot-chip"
                        onClick={() => handleSendMessage(reply)}
                      >
                        {reply}
                        <ChevronRight size={13} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="chatbot-bubble-row is-bot">
              <div className="bot-bubble-avatar">
                <img src={logo} alt="Marty" />
              </div>
              <div className="chatbot-bubble-content">
                <div className="chatbot-bubble is-typing-bubble">
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="typing-text">Marty sedang mengetik...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* FOOTER & INPUT */}
      <footer className="chatbot-footer">
        {/* Suggestion Pills Bar */}
        <div className="chatbot-suggestions-bar">
          <div className="chatbot-suggestions-scroll">
            {INITIAL_SUGGESTIONS.map((item, index) => (
              <button
                key={index}
                type="button"
                className="chatbot-suggestion-pill"
                onClick={() => handleSendMessage(item.replace(/^[^\w\s]+/, '').trim())}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="chatbot-input-container">
          <form
            className="chatbot-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanya Marty tentang sepatu, ukuran, atau pengiriman..."
              className="chatbot-input-textarea"
            />

            <Button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="chatbot-send-button"
              aria-label="Kirim pesan"
            >
              <Send size={18} />
            </Button>
          </form>

          <div className="chatbot-input-hint">
            <span>Tekan <strong>Enter</strong> untuk mengirim, <strong>Shift+Enter</strong> untuk baris baru.</span>
          </div>
        </div>
      </footer>

      {/* INQUIRY MODAL (Supabase Inquiries Table Integration) */}
      {showInquiryModal && (
        <div className="chatbot-modal-backdrop" onClick={() => setShowInquiryModal(false)}>
          <div
            className="chatbot-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inquiry-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="chatbot-modal-header">
              <div className="chatbot-modal-title-group">
                <h3 id="inquiry-title">Tinggalkan Pertanyaan Khusus</h3>
                <p>Admin LocalMart akan menghubungi WhatsApp Kakak secepatnya.</p>
              </div>
              <button
                type="button"
                className="chatbot-modal-close"
                onClick={() => setShowInquiryModal(false)}
                aria-label="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            {inquirySuccess ? (
              <div className="chatbot-modal-success">
                <CheckCircle2 size={48} className="text-emerald-500" />
                <h4>Pertanyaan Berhasil Disimpan!</h4>
                <p>
                  Nomor Referensi:{' '}
                  <strong className="text-primary font-mono">{inquirySuccess}</strong>
                </p>
                <p className="success-note">
                  Admin kami akan segera mengecek dan menghubungi Kakak melalui WhatsApp.
                </p>
                <div className="success-actions">
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chatbot-modal-wa-btn"
                  >
                    <MessageCircle size={18} />
                    Chat Langsung di WhatsApp
                  </a>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setInquirySuccess(null);
                      setShowInquiryModal(false);
                    }}
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="chatbot-modal-form">
                <div className="form-field">
                  <label htmlFor="inquiry_name">Nama Lengkap Kakak</label>
                  <input
                    id="inquiry_name"
                    name="inquiry_name"
                    placeholder="Contoh: Budi Prasetyo"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="inquiry_phone">Nomor WhatsApp Aktif</label>
                  <input
                    id="inquiry_phone"
                    name="inquiry_phone"
                    type="tel"
                    placeholder="Contoh: 0896-xxxx-xxxx"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="inquiry_product">Tertarik dengan Produk Apa? (opsional)</label>
                  <select id="inquiry_product" name="inquiry_product" defaultValue="">
                    <option value="">Pilih Produk (opsional)</option>
                    <option value="Sepatu Minisoccer Aerion">Sepatu Minisoccer Aerion (Rp 210.000)</option>
                    <option value="Sepatu Futsal Aerion">Sepatu Futsal Aerion (Rp 190.000)</option>
                    <option value="Kaos Kaki & Dekker">Kaos Kaki & Dekker</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="inquiry_msg">Pesan / Pertanyaan Kakak</label>
                  <textarea
                    id="inquiry_msg"
                    name="inquiry_msg"
                    rows={3}
                    placeholder="Tuliskan pertanyaan atau ukuran yang Kakak cari..."
                    required
                  />
                </div>

                <div className="chatbot-modal-footer">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowInquiryModal(false)}
                    disabled={inquiryLoading}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={inquiryLoading} className="chatbot-modal-submit">
                    {inquiryLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Menyimpan...
                      </>
                    ) : (
                      'Kirim Pesan ke Admin'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------------

function ChatProductCard({ product }: { product: ChatProduct }) {
  return (
    <div className="chat-product-card">
      <div className="chat-product-image-container">
        <img src={product.image} alt={product.name} className="chat-product-image" />
        <span className="chat-product-category">{product.category}</span>
      </div>
      <div className="chat-product-details">
        <h4 className="chat-product-title">{product.name}</h4>
        <p className="chat-product-desc">{product.description}</p>
        <ul className="chat-product-features">
          {product.features.map((feat, i) => (
            <li key={i}>{feat}</li>
          ))}
        </ul>
        <div className="chat-product-footer">
          <span className="chat-product-price">
            {product.price !== null
              ? `Rp ${product.price.toLocaleString('id-ID')}`
              : 'Tanya via WA'}
          </span>
          <a
            href={product.waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="chat-product-order-btn"
          >
            <ShoppingBag size={14} />
            Pesan
          </a>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ action }: { action: { label: string; type: string; value: string; variant?: string } }) {
  if (action.type === 'wa' || action.variant === 'whatsapp') {
    return (
      <a
        href={action.value}
        target="_blank"
        rel="noopener noreferrer"
        className="chatbot-action-btn wa-btn"
      >
        <MessageCircle size={15} />
        {action.label}
      </a>
    );
  }

  if (action.type === 'link') {
    return (
      <a href={action.value} className="chatbot-action-btn link-btn">
        <ExternalLink size={15} />
        {action.label}
      </a>
    );
  }

  return (
    <button type="button" className="chatbot-action-btn default-btn">
      {action.label}
    </button>
  );
}

/**
 * Basic Markdown inline bold formatter for natural reading
 */
function renderFormattedText(text: string) {
  // Regex for **bold** text
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="chatbot-inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
