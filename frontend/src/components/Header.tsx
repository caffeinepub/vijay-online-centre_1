import React, { useState } from "react";
import { Menu, X, User, LogOut, Shield } from "lucide-react";
import { useCustomerAuth } from "../hooks/useCustomerAuth";
import CustomerAuthModal from "./CustomerAuthModal";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated, name, logout } = useCustomerAuth();

  const navLinks = [
    { label: "Home", page: "home" },
    { label: "Services", page: "payment" },
    { label: "Track Application", page: "dashboard" },
  ];

  const handleNavClick = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 shadow-lg" style={{ backgroundColor: "#0a2463" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => handleNavClick("home")}
              className="flex items-center gap-3 group shrink-0"
            >
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                <span className="font-black text-lg" style={{ color: "#0a2463" }}>V</span>
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-white font-bold text-base leading-tight">
                  Vijay Online Centre
                </div>
                <div className="text-blue-200 text-xs leading-tight">
                  Government Services Portal
                </div>
              </div>
              <div className="text-left sm:hidden">
                <div className="text-white font-bold text-sm leading-tight">
                  Vijay Online Centre
                </div>
              </div>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.page}
                  onClick={() => handleNavClick(link.page)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === link.page
                      ? "bg-white font-semibold"
                      : "text-blue-100 hover:bg-blue-800 hover:text-white"
                  }`}
                  style={currentPage === link.page ? { color: "#0a2463" } : {}}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Right Actions — Desktop */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-blue-800 rounded-full px-3 py-1.5">
                    <User className="w-4 h-4 text-blue-200" />
                    <span className="text-white text-sm font-medium max-w-[120px] truncate">{name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 text-blue-200 hover:text-white text-sm px-3 py-1.5 rounded-md hover:bg-blue-800 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 bg-white font-semibold text-sm px-4 py-2 rounded-md hover:bg-blue-50 transition-colors"
                  style={{ color: "#0a2463" }}
                >
                  <User className="w-4 h-4" />
                  Customer Login
                </button>
              )}
              <button
                onClick={() => handleNavClick("admin")}
                className="flex items-center gap-1.5 text-blue-300 hover:text-white text-xs px-2 py-1.5 rounded-md hover:bg-blue-800 transition-colors border border-blue-700"
              >
                <Shield className="w-3.5 h-3.5" />
                Manager
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2 rounded-md hover:bg-blue-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu — rendered inline below header, not overlapping */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-blue-800" style={{ backgroundColor: "#061840" }}>
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.page}
                  onClick={() => handleNavClick(link.page)}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    currentPage === link.page
                      ? "bg-white font-semibold"
                      : "text-blue-100 hover:bg-blue-800 hover:text-white"
                  }`}
                  style={currentPage === link.page ? { color: "#0a2463" } : {}}
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-2 border-t border-blue-800 space-y-1">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-2 px-3 py-2 text-blue-200 text-sm">
                      <User className="w-4 h-4 shrink-0" />
                      <span className="truncate">{name}</span>
                    </div>
                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-blue-200 hover:text-white text-sm rounded-md hover:bg-blue-800"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }}
                    className="w-full text-left flex items-center gap-2 px-3 py-2.5 bg-white rounded-md text-sm font-semibold"
                    style={{ color: "#0a2463" }}
                  >
                    <User className="w-4 h-4" />
                    Customer Login
                  </button>
                )}
                <button
                  onClick={() => handleNavClick("admin")}
                  className="w-full text-left flex items-center gap-2 px-3 py-2.5 text-blue-300 hover:text-white text-sm rounded-md hover:bg-blue-800"
                >
                  <Shield className="w-4 h-4" />
                  Manager Panel
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <CustomerAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthenticated={() => setShowAuthModal(false)}
      />
    </>
  );
}
