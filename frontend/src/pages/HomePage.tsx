import React, { useState } from 'react';
import {
  FileText, CreditCard, Users, Home, Zap, Shield, Plane, Train,
  Printer, BookOpen, Leaf, Car, Building, Calculator, Search, ChevronRight
} from 'lucide-react';

const SERVICES = [
  { name: 'PAN Card', icon: CreditCard, category: 'Identity' },
  { name: 'Aadhar Update', icon: Shield, category: 'Identity' },
  { name: 'Income Certificate', icon: FileText, category: 'Certificates' },
  { name: 'Caste Certificate', icon: FileText, category: 'Certificates' },
  { name: 'Domicile', icon: Home, category: 'Certificates' },
  { name: 'Voter ID', icon: Users, category: 'Identity' },
  { name: 'Birth Certificate', icon: FileText, category: 'Certificates' },
  { name: 'Death Certificate', icon: FileText, category: 'Certificates' },
  { name: 'Electricity Bill', icon: Zap, category: 'Utility' },
  { name: 'FASTag', icon: Car, category: 'Transport' },
  { name: 'Ayushman Card', icon: Shield, category: 'Health' },
  { name: 'Passport Apply', icon: FileText, category: 'Travel' },
  { name: 'Rail Ticket', icon: Train, category: 'Travel' },
  { name: 'Flight Ticket', icon: Plane, category: 'Travel' },
  { name: 'Insurance', icon: Shield, category: 'Finance' },
  { name: 'Bank Account', icon: Building, category: 'Finance' },
  { name: 'Photo Print', icon: Printer, category: 'Print' },
  { name: 'Lamination', icon: Printer, category: 'Print' },
  { name: 'Online Form', icon: FileText, category: 'Forms' },
  { name: 'Scholarship', icon: BookOpen, category: 'Education' },
  { name: 'PM Kisan', icon: Leaf, category: 'Government' },
  { name: 'Labour Card', icon: Users, category: 'Government' },
  { name: 'E Shram', icon: Users, category: 'Government' },
  { name: 'Ration Card', icon: FileText, category: 'Government' },
  { name: 'Driving Licence', icon: Car, category: 'Transport' },
  { name: 'Vehicle Transfer', icon: Car, category: 'Transport' },
  { name: 'GST Registration', icon: Building, category: 'Finance' },
  { name: 'IT Return', icon: Calculator, category: 'Finance' },
  { name: 'Exam Form', icon: BookOpen, category: 'Education' },
  { name: 'Job Form', icon: FileText, category: 'Forms' },
  { name: 'Recharge', icon: Zap, category: 'Utility' },
  { name: 'Other Service', icon: ChevronRight, category: 'Other' },
];

interface HomePageProps {
  onNavigate?: (page: string, data?: any) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = SERVICES.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleServiceClick = (serviceName: string) => {
    if (onNavigate) {
      onNavigate('payment', { service: serviceName });
    }
  };

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-800 to-navy-900 border-b border-navy-700">
        <div className="absolute inset-0 opacity-10">
          <img
            src="/assets/generated/hero-banner.dim_1200x400.png"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Welcome to <span className="text-saffron">Vijay Online Centre</span>
          </h1>
          <p className="text-navy-300 text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Your trusted CSC service centre for all government and utility services
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-navy-800/80 border border-navy-600 rounded-xl text-white placeholder-navy-400 focus:outline-none focus:border-saffron transition-colors backdrop-blur-sm"
            />
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-bold">
            {searchQuery ? `Results for "${searchQuery}"` : 'All Services'}
          </h2>
          <span className="text-navy-400 text-sm">{filteredServices.length} services</span>
        </div>

        {filteredServices.length === 0 ? (
          <div className="text-center py-16 text-navy-400">
            <Search size={40} className="mx-auto mb-3 opacity-50" />
            <p>No services found for "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredServices.map((service) => {
              const Icon = service.icon;
              return (
                <button
                  key={service.name}
                  onClick={() => handleServiceClick(service.name)}
                  className="group bg-navy-800 hover:bg-navy-700 border border-navy-700 hover:border-saffron/50 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-lg hover:shadow-saffron/10 hover:-translate-y-0.5"
                >
                  <div className="w-10 h-10 bg-saffron/10 group-hover:bg-saffron/20 rounded-lg flex items-center justify-center mx-auto mb-2.5 transition-colors">
                    <Icon size={20} className="text-saffron" />
                  </div>
                  <p className="text-white text-xs font-medium leading-tight">{service.name}</p>
                  <p className="text-navy-500 text-xs mt-0.5">{service.category}</p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Quick Apply CTA */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <div className="bg-gradient-to-r from-saffron/20 to-amber-500/10 border border-saffron/30 rounded-2xl p-6 text-center">
          <h3 className="text-white text-lg font-bold mb-2">Ready to Apply?</h3>
          <p className="text-navy-300 text-sm mb-4">
            Submit your service request online and pay via UPI
          </p>
          <button
            onClick={() => handleServiceClick('')}
            className="px-6 py-3 bg-saffron text-white rounded-xl font-semibold hover:bg-saffron-dark transition-colors shadow-lg"
          >
            Apply Now
          </button>
        </div>
      </section>
    </div>
  );
}
