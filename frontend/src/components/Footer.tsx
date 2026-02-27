import { Phone, MapPin, Clock, Heart } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';

export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || 'vijay-online-centre');

  return (
    <footer style={{ background: 'oklch(0.10 0.05 250)' }} className="text-white/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-heading font-bold text-xl text-white mb-2">Vijay Online Centre</h3>
            <p className="text-sm text-white/60 mb-1">विजय ऑनलाइन सेंटर</p>
            <p className="text-sm text-white/60 mt-3">
              Your trusted government service center for all official document and certificate needs.
            </p>
            <p className="text-sm text-white/50 mt-1">
              सभी सरकारी दस्तावेज और प्रमाण पत्र सेवाओं के लिए आपका विश्वसनीय केंद्र।
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact / संपर्क</h4>
            <div className="space-y-3">
              <a href="tel:+918173064549" className="flex items-center gap-3 text-sm hover:text-white transition-colors group">
                <Phone size={16} className="text-electric-blue-light flex-shrink-0" />
                <span>+91 81730 64549</span>
              </a>
              <a href="https://wa.me/918173064549" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:text-white transition-colors">
                <SiWhatsapp size={16} className="text-success flex-shrink-0" />
                <span>WhatsApp Chat</span>
              </a>
              <div className="flex items-start gap-3 text-sm">
                <Clock size={16} className="text-gold flex-shrink-0 mt-0.5" />
                <span>Mon–Sat: 9 AM – 7 PM<br /><span className="text-white/50">सोम–शनि: सुबह 9 – शाम 7</span></span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div>
            <h4 className="font-semibold text-white mb-4">Payment / भुगतान</h4>
            <div className="space-y-2 text-sm">
              <p className="text-white/60">UPI ID:</p>
              <p className="font-mono text-white bg-white/10 px-3 py-2 rounded-lg text-sm">
                8173064549@okicici
              </p>
              <p className="text-white/50 text-xs mt-2">ICICI Bank • Vijay Online Centre</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {year} Vijay Online Centre. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart size={12} className="text-red-400 fill-red-400 mx-0.5" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors underline underline-offset-2"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
