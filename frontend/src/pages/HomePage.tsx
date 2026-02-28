import React, { useState } from "react";
import {
  FileText, CreditCard, Globe, Users, Home, Briefcase,
  Building, ShoppingBag, Heart, GraduationCap,
  Landmark, Leaf, Shield, Star, Search, Train, Bus,
} from "lucide-react";
import { useCustomerAuth } from "../hooks/useCustomerAuth";
import CustomerAuthModal from "../components/CustomerAuthModal";

interface HomePageProps {
  onNavigate: (page: string, service?: string) => void;
}

const ALL_SERVICES = [
  // Government ID
  { id: 1, name: "Aadhaar Update", icon: Shield, category: "Government ID" },
  { id: 2, name: "PAN Card", icon: CreditCard, category: "Government ID" },
  { id: 3, name: "Passport", icon: Globe, category: "Government ID" },
  { id: 4, name: "Voter ID", icon: Users, category: "Government ID" },
  { id: 5, name: "Driving Licence", icon: FileText, category: "Government ID" },
  { id: 6, name: "Ration Card", icon: Home, category: "Government ID" },
  // Certificates
  { id: 7, name: "Income Certificate", icon: FileText, category: "Certificates" },
  { id: 8, name: "Caste Certificate", icon: FileText, category: "Certificates" },
  { id: 9, name: "Residence Certificate", icon: Home, category: "Certificates" },
  { id: 10, name: "Birth Certificate", icon: Star, category: "Certificates" },
  { id: 11, name: "Death Certificate", icon: FileText, category: "Certificates" },
  { id: 12, name: "Marriage Certificate", icon: Heart, category: "Certificates" },
  // Land & Property
  { id: 13, name: "Land Records", icon: Landmark, category: "Land & Property" },
  { id: 14, name: "Property Registration", icon: Building, category: "Land & Property" },
  // Government Schemes
  { id: 15, name: "NREGA Job Card", icon: Leaf, category: "Government Schemes" },
  { id: 16, name: "PM Kisan", icon: Leaf, category: "Government Schemes" },
  { id: 17, name: "Ayushman Bharat", icon: Heart, category: "Government Schemes" },
  { id: 18, name: "Scholarship Application", icon: GraduationCap, category: "Government Schemes" },
  // Tax & Business
  { id: 19, name: "ITR Filing", icon: FileText, category: "Tax & Business" },
  { id: 20, name: "GST Registration", icon: Briefcase, category: "Tax & Business" },
  { id: 21, name: "Udyam Registration", icon: Briefcase, category: "Tax & Business" },
  { id: 22, name: "MSME Certificate", icon: Building, category: "Tax & Business" },
  { id: 23, name: "Shop & Establishment", icon: ShoppingBag, category: "Tax & Business" },
  { id: 24, name: "FSSAI Licence", icon: Shield, category: "Tax & Business" },
  { id: 25, name: "Trade Licence", icon: Briefcase, category: "Tax & Business" },
  // Banking & Financial
  { id: 26, name: "Bank Account Opening", icon: Landmark, category: "Banking & Financial" },
  { id: 27, name: "Loan Application", icon: CreditCard, category: "Banking & Financial" },
  { id: 28, name: "Insurance", icon: Shield, category: "Banking & Financial" },
  { id: 29, name: "Pension", icon: Star, category: "Banking & Financial" },
  { id: 30, name: "EPF/PF Services", icon: Briefcase, category: "Banking & Financial" },
  // Travel
  { id: 31, name: "Railway Ticket Booking", icon: Train, category: "Travel" },
  { id: 32, name: "Bus Ticket Booking", icon: Bus, category: "Travel" },
];

const CATEGORIES = ["All", ...Array.from(new Set(ALL_SERVICES.map((s) => s.category)))];

const CATEGORY_COLORS: Record<string, string> = {
  "Government ID": "bg-blue-50 border-blue-200",
  "Certificates": "bg-green-50 border-green-200",
  "Land & Property": "bg-amber-50 border-amber-200",
  "Government Schemes": "bg-purple-50 border-purple-200",
  "Tax & Business": "bg-orange-50 border-orange-200",
  "Banking & Financial": "bg-teal-50 border-teal-200",
  "Travel": "bg-rose-50 border-rose-200",
};

const ICON_COLORS: Record<string, string> = {
  "Government ID": "text-blue-600",
  "Certificates": "text-green-600",
  "Land & Property": "text-amber-600",
  "Government Schemes": "text-purple-600",
  "Tax & Business": "text-orange-600",
  "Banking & Financial": "text-teal-600",
  "Travel": "text-rose-600",
};

export default function HomePage({ onNavigate }: HomePageProps) {
  const { isAuthenticated, name } = useCustomerAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingService, setPendingService] = useState<string | null>(null);

  const filteredServices = ALL_SERVICES.filter((service) => {
    const matchesCategory =
      selectedCategory === "All" || service.category === selectedCategory;
    const matchesSearch = service.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleServiceClick = (serviceName: string) => {
    if (!isAuthenticated) {
      setPendingService(serviceName);
      setShowAuthModal(true);
    } else {
      onNavigate("payment", serviceName);
    }
  };

  const handleAuthenticated = () => {
    setShowAuthModal(false);
    if (pendingService) {
      onNavigate("payment", pendingService);
      setPendingService(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="py-8 px-4 text-white" style={{ backgroundColor: "#002147" }}>
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Vijay Online Centre
          </h1>
          <p className="text-blue-200 text-sm md:text-base mb-4">
            Your trusted partner for all government &amp; banking services
          </p>
          {isAuthenticated && name && (
            <p className="text-yellow-300 text-sm font-medium">
              Welcome back, {name}! 👋
            </p>
          )}
          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={() =>
                isAuthenticated ? onNavigate("payment") : setShowAuthModal(true)
              }
              className="bg-white font-bold px-5 py-2.5 rounded-lg hover:bg-blue-50 transition-colors text-sm"
              style={{ color: "#002147" }}
            >
              Apply Now →
            </button>
            <button
              onClick={() => onNavigate("dashboard")}
              className="border-2 border-white text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-800 transition-colors text-sm"
            >
              Track Application
            </button>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  selectedCategory === cat
                    ? "text-white border-transparent"
                    : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                }`}
                style={
                  selectedCategory === cat
                    ? { backgroundColor: "#002147", borderColor: "#002147" }
                    : {}
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            {selectedCategory === "All" ? "All Services" : selectedCategory}
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredServices.length})
            </span>
          </h2>
        </div>

        {filteredServices.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No services found for &quot;{searchQuery}&quot;</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {filteredServices.map((service) => {
              const Icon = service.icon;
              const colorClass = ICON_COLORS[service.category] || "text-blue-600";
              const cardClass =
                CATEGORY_COLORS[service.category] ||
                "bg-gray-50 border-gray-200";
              return (
                <button
                  key={service.id}
                  onClick={() => handleServiceClick(service.name)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all hover:shadow-md hover:scale-105 active:scale-95 text-center ${cardClass}`}
                >
                  <Icon className={`w-6 h-6 ${colorClass}`} />
                  <span className="text-xs font-medium leading-tight text-gray-700">
                    {service.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-6 text-center text-xs text-gray-400">
          Showing {filteredServices.length} of {ALL_SERVICES.length} services
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 mt-8 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Vijay Online Centre · Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
            window.location.hostname || "vijay-online-centre"
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          caffeine.ai
        </a>
      </footer>

      {showAuthModal && (
        <CustomerAuthModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            setPendingService(null);
          }}
          onAuthenticated={handleAuthenticated}
        />
      )}
    </div>
  );
}
