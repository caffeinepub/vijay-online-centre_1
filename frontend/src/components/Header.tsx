import React, { useState } from 'react';
import { Menu, X, LayoutDashboard, LogIn, LogOut } from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';

interface HeaderProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
  onAdminLoginClick?: () => void;
}

export default function Header({ currentPage, onNavigate, onAdminLoginClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAdminAuth();

  const navLinks = [
    { label: 'Home', page: 'home' },
    { label: 'Apply Now', page: 'payment' },
  ];

  const handleNav = (page: string) => {
    setMobileMenuOpen(false);
    if (onNavigate) onNavigate(page);
  };

  const handleAdminAction = () => {
    setMobileMenuOpen(false);
    if (isAuthenticated) {
      if (onNavigate) onNavigate('admin');
    } else {
      if (onAdminLoginClick) onAdminLoginClick();
    }
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    if (onNavigate) onNavigate('home');
  };

  return (
    <header className="bg-navy-900 border-b border-navy-700 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            <img
              src="/assets/generated/logo-vijay.dim_256x256.png"
              alt="Vijay Online Centre"
              className="h-10 w-10 rounded-full object-cover border-2 border-saffron/30"
            />
            <div className="hidden sm:block">
              <p className="text-white font-bold text-base leading-tight">Vijay Online Centre</p>
              <p className="text-saffron text-xs">CSC Service Centre</p>
            </div>
            <div className="sm:hidden">
              <p className="text-white font-bold text-sm leading-tight">Vijay Online</p>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => handleNav(link.page)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === link.page
                    ? 'bg-saffron text-white'
                    : 'text-navy-200 hover:text-white hover:bg-navy-800'
                }`}
              >
                {link.label}
              </button>
            ))}
            {isAuthenticated ? (
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => handleNav('admin')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 'admin'
                      ? 'bg-saffron text-white'
                      : 'text-navy-200 hover:text-white hover:bg-navy-800'
                  }`}
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-navy-400 hover:text-white hover:bg-navy-800 transition-colors"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onAdminLoginClick}
                className="flex items-center gap-1.5 ml-2 px-4 py-2 bg-saffron/10 hover:bg-saffron/20 text-saffron border border-saffron/30 rounded-lg text-sm font-medium transition-colors"
              >
                <LogIn size={15} />
                Admin Login
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-navy-300 hover:text-white hover:bg-navy-800 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-navy-700 py-3 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => handleNav(link.page)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === link.page
                    ? 'bg-saffron text-white'
                    : 'text-navy-200 hover:text-white hover:bg-navy-800'
                }`}
              >
                {link.label}
              </button>
            ))}
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNav('admin')}
                  className="w-full text-left flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-navy-200 hover:text-white hover:bg-navy-800 transition-colors"
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-navy-400 hover:text-white hover:bg-navy-800 transition-colors"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onAdminLoginClick) onAdminLoginClick();
                }}
                className="w-full text-left flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-saffron hover:bg-saffron/10 transition-colors"
              >
                <LogIn size={15} />
                Admin Login
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
