import { Phone } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';

export default function FloatingSupport() {
  return (
    <div className="fixed bottom-6 right-4 z-40 flex flex-col gap-3 animate-bounce-in">
      {/* WhatsApp */}
      <a
        href="https://wa.me/918173064549"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-3 rounded-full text-white text-sm font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
        style={{ background: 'oklch(0.55 0.18 145)' }}
        title="WhatsApp Chat"
      >
        <SiWhatsapp size={20} />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>

      {/* Call */}
      <a
        href="tel:+918173064549"
        className="flex items-center gap-2 px-4 py-3 rounded-full text-white text-sm font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
        style={{ background: 'oklch(0.45 0.18 250)' }}
        title="Call Us"
      >
        <Phone size={20} />
        <span className="hidden sm:inline">Call Us</span>
      </a>
    </div>
  );
}
