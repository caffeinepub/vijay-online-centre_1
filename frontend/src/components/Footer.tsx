import React from "react";
import { Phone, Clock, MapPin, Heart } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname = typeof window !== "undefined" ? window.location.hostname : "vijay-online-centre";
  const utmUrl = `https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer style={{ backgroundColor: "#0a2463" }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="font-black text-lg" style={{ color: "#0a2463" }}>V</span>
              </div>
              <div>
                <div className="font-bold text-lg">Vijay Online Centre</div>
                <div className="text-blue-300 text-xs">Government Services Portal</div>
              </div>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              Your trusted partner for all government document services. Fast, reliable, and professional.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-blue-100">Contact Us</h3>
            <div className="space-y-3">
              <a
                href="https://wa.me/918173064549"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors text-sm"
              >
                <SiWhatsapp className="w-4 h-4 text-green-400" />
                +91 8173064549 (WhatsApp)
              </a>
              <div className="flex items-center gap-2 text-blue-200 text-sm">
                <Phone className="w-4 h-4" />
                +91 8173064549
              </div>
              <div className="flex items-center gap-2 text-blue-200 text-sm">
                <Clock className="w-4 h-4" />
                Mon–Sat: 9 AM – 6 PM
              </div>
              <div className="flex items-center gap-2 text-blue-200 text-sm">
                <MapPin className="w-4 h-4" />
                Local Service Centre
              </div>
            </div>
          </div>

          {/* Payment */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-blue-100">Payment Info</h3>
            <div className="bg-blue-900 rounded-lg p-4 space-y-2">
              <p className="text-blue-200 text-sm">UPI Payment ID:</p>
              <p className="text-white font-mono font-semibold text-sm">8173064549@okicici</p>
              <p className="text-blue-300 text-xs mt-2">
                Payment QR is shown after Manager approves your application.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-blue-300 text-sm">
            © {year} Vijay Online Centre. All rights reserved.
          </p>
          <p className="text-blue-300 text-sm flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> using{" "}
            <a
              href={utmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-200 hover:text-white underline underline-offset-2"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
