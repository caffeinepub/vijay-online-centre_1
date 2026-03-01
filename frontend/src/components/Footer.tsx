import React from 'react';
import { Heart, Phone, MapPin, Mail } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(window.location.hostname || 'vijay-online-centre');

  return (
    <footer className="bg-navy-900 border-t border-navy-700 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img
                src="/assets/generated/logo-vijay.dim_256x256.png"
                alt="Vijay Online Centre"
                className="h-8 w-8 rounded-full object-cover"
              />
              <span className="text-white font-bold">Vijay Online Centre</span>
            </div>
            <p className="text-navy-400 text-sm">
              Your trusted CSC service centre for all government and utility services.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-saffron font-semibold text-sm mb-3">Popular Services</h4>
            <ul className="space-y-1.5 text-navy-400 text-sm">
              <li>PAN Card</li>
              <li>Aadhar Update</li>
              <li>Income Certificate</li>
              <li>Passport Apply</li>
              <li>Rail / Flight Ticket</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-saffron font-semibold text-sm mb-3">Contact</h4>
            <ul className="space-y-2 text-navy-400 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={13} className="text-saffron flex-shrink-0" />
                <span>8173064549</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={13} className="text-saffron flex-shrink-0" />
                <span>Vijay Online Centre</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-saffron text-xs font-mono flex-shrink-0">UPI:</span>
                <span className="font-mono text-xs">8173064549@okicici</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-navy-500">
          <p>© {year} Vijay Online Centre. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart size={11} className="text-saffron fill-saffron" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-saffron hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
