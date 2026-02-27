import { useState } from 'react';
import { Menu, X, Home, LayoutGrid, ClipboardList, Phone, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Page } from '../App';

interface HeaderProps {
  currentPage: Page;
  navigate: (page: Page) => void;
}

export default function Header({ currentPage, navigate }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'home' as Page, label: 'Home', labelHindi: 'होम', icon: Home },
    { id: 'dashboard' as Page, label: 'My Dashboard', labelHindi: 'डैशबोर्ड', icon: ClipboardList },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-navy" style={{ background: 'oklch(0.12 0.06 250)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-3 group"
          >
            <img
              src="/assets/generated/vijay-logo.dim_200x80.png"
              alt="Vijay Online Centre"
              className="h-10 md:h-12 w-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <div className="flex flex-col">
              <span className="text-white font-heading font-bold text-lg md:text-xl leading-tight">
                Vijay Online Centre
              </span>
              <span className="text-xs md:text-sm leading-tight" style={{ color: 'oklch(0.75 0.15 60)' }}>
                विजय ऑनलाइन सेंटर
              </span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === item.id
                    ? 'text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                style={currentPage === item.id ? { background: 'oklch(0.45 0.18 250)' } : {}}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
            <a
              href="tel:+918173064549"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <Phone size={16} />
              Contact
            </a>
            <button
              onClick={() => navigate('admin')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/5 transition-all duration-200 ml-2"
            >
              <Shield size={14} />
              <span className="text-xs">Admin</span>
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 py-3 space-y-1 animate-float-up">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { navigate(item.id); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  currentPage === item.id
                    ? 'text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                style={currentPage === item.id ? { background: 'oklch(0.45 0.18 250)' } : {}}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                <span className="text-xs text-white/40 ml-auto">{item.labelHindi}</span>
              </button>
            ))}
            <a
              href="tel:+918173064549"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
              onClick={() => setMobileOpen(false)}
            >
              <Phone size={18} />
              Contact / संपर्क
            </a>
            <button
              onClick={() => { navigate('admin'); setMobileOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
            >
              <Shield size={16} />
              Admin Panel
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
