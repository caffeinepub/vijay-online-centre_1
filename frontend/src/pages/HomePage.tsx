import { useState } from 'react';
import { Search, ChevronRight, Star, Users, FileCheck, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useServices, type Service } from '../hooks/useQueries';
import { type Page } from '../App';

interface HomePageProps {
  navigate: (page: Page, service?: Service) => void;
}

const CATEGORY_CONFIG = {
  GovtID: {
    label: 'Government IDs',
    labelHindi: 'सरकारी आईडी',
    borderClass: 'category-border-blue',
    badgeStyle: { background: 'oklch(0.45 0.18 250 / 0.1)', color: 'oklch(0.35 0.16 250)' },
    emoji: '🪪',
  },
  Certificate: {
    label: 'Certificates',
    labelHindi: 'प्रमाण पत्र',
    borderClass: 'category-border-gold',
    badgeStyle: { background: 'oklch(0.75 0.15 60 / 0.1)', color: 'oklch(0.55 0.18 55)' },
    emoji: '📄',
  },
  Welfare: {
    label: 'Welfare Schemes',
    labelHindi: 'कल्याण योजनाएं',
    borderClass: 'category-border-green',
    badgeStyle: { background: 'oklch(0.55 0.18 145 / 0.1)', color: 'oklch(0.4 0.18 145)' },
    emoji: '🤝',
  },
  Finance: {
    label: 'Finance Services',
    labelHindi: 'वित्त सेवाएं',
    borderClass: 'category-border-orange',
    badgeStyle: { background: 'oklch(0.65 0.2 30 / 0.1)', color: 'oklch(0.5 0.2 30)' },
    emoji: '💰',
  },
  Travel: {
    label: 'Travel & General',
    labelHindi: 'यात्रा और सामान्य',
    borderClass: 'category-border-purple',
    badgeStyle: { background: 'oklch(0.5 0.15 300 / 0.1)', color: 'oklch(0.4 0.15 300)' },
    emoji: '✈️',
  },
};

const STATS = [
  { icon: Users, value: '10,000+', label: 'Happy Customers', labelHindi: 'संतुष्ट ग्राहक' },
  { icon: FileCheck, value: '22+', label: 'Services', labelHindi: 'सेवाएं' },
  { icon: Star, value: '4.9★', label: 'Rating', labelHindi: 'रेटिंग' },
  { icon: Clock, value: '24/7', label: 'Support', labelHindi: 'सहायता' },
];

export default function HomePage({ navigate }: HomePageProps) {
  const { data: services = [], isLoading } = useServices();
  const [search, setSearch] = useState('');

  const filteredServices = search
    ? services.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.nameHindi.includes(search) ||
        s.description.toLowerCase().includes(search.toLowerCase())
      )
    : services;

  const categories = ['GovtID', 'Certificate', 'Welfare', 'Finance', 'Travel'] as const;

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden py-16 md:py-24"
        style={{ background: 'linear-gradient(135deg, oklch(0.10 0.06 250) 0%, oklch(0.18 0.08 250) 50%, oklch(0.12 0.05 260) 100%)' }}
      >
        {/* Background image overlay */}
        <div className="absolute inset-0 opacity-10">
          <img
            src="/assets/generated/hero-banner.dim_1200x400.png"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{ background: 'oklch(0.75 0.15 60 / 0.15)', color: 'oklch(0.75 0.15 60)' }}>
            <Star size={14} className="fill-current" />
            Trusted Government Service Center
          </div>

          <h1 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-white mb-3 leading-tight">
            Vijay Online Centre
          </h1>
          <p className="text-xl md:text-2xl font-medium mb-2" style={{ color: 'oklch(0.75 0.15 60)' }}>
            विजय ऑनलाइन सेंटर
          </p>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto mb-8">
            All government documents & certificates at your doorstep.
            <br />
            <span className="text-white/50 text-sm">सभी सरकारी दस्तावेज और प्रमाण पत्र एक ही जगह।</span>
          </p>

          {/* Search */}
          <div className="max-w-lg mx-auto relative mb-10">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search services... / सेवा खोजें..."
              className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all"
              style={{
                background: 'oklch(1 0 0 / 0.1)',
                border: '1px solid oklch(1 0 0 / 0.2)',
                color: 'white',
              }}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map(stat => (
              <div key={stat.label} className="text-center p-4 rounded-xl" style={{ background: 'oklch(1 0 0 / 0.08)' }}>
                <stat.icon size={20} className="mx-auto mb-2" style={{ color: 'oklch(0.75 0.15 60)' }} />
                <p className="font-heading font-bold text-xl text-white">{stat.value}</p>
                <p className="text-xs text-white/60">{stat.label}</p>
                <p className="text-xs text-white/40">{stat.labelHindi}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {search && (
          <div className="mb-8">
            <h2 className="font-heading font-bold text-xl mb-1">
              Search Results for "{search}"
            </h2>
            <p className="text-sm text-muted-foreground">{filteredServices.length} services found</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
              {filteredServices.map(service => (
                <ServiceCard key={service.id} service={service} onApply={() => navigate('payment', service)} />
              ))}
            </div>
          </div>
        )}

        {!search && categories.map(cat => {
          const catServices = services.filter(s => s.category === cat);
          const config = CATEGORY_CONFIG[cat];
          return (
            <div key={cat} className="mb-12">
              <div className={`flex items-center gap-3 mb-6 pl-4 py-2 rounded-r-lg ${config.borderClass}`}
                style={{ background: 'oklch(0.97 0.005 240)' }}>
                <span className="text-2xl">{config.emoji}</span>
                <div>
                  <h2 className="font-heading font-bold text-xl text-foreground">{config.label}</h2>
                  <p className="text-sm text-muted-foreground">{config.labelHindi}</p>
                </div>
                <span className="ml-auto text-sm font-medium px-3 py-1 rounded-full" style={config.badgeStyle}>
                  {catServices.length} services
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => <ServiceCardSkeleton key={i} />)
                  : catServices.map(service => (
                      <ServiceCard key={service.id} service={service} onApply={() => navigate('payment', service)} />
                    ))
                }
              </div>
            </div>
          );
        })}
      </section>

      {/* CTA Banner */}
      <section className="mx-4 sm:mx-6 mb-12 rounded-2xl overflow-hidden">
        <div
          className="p-8 md:p-12 text-center text-white"
          style={{ background: 'linear-gradient(135deg, oklch(0.35 0.16 250) 0%, oklch(0.45 0.18 250) 100%)' }}
        >
          <h2 className="font-heading font-bold text-2xl md:text-3xl mb-3">
            Need Help? We're Here 24/7
          </h2>
          <p className="text-white/80 mb-6">
            Call or WhatsApp us for instant assistance with any government service.
            <br />
            <span className="text-white/60 text-sm">किसी भी सरकारी सेवा के लिए तुरंत सहायता के लिए कॉल या WhatsApp करें।</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="tel:+918173064549"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
              style={{ background: 'oklch(0.75 0.15 60)', color: 'oklch(0.12 0.06 250)' }}
            >
              📞 +91 81730 64549
            </a>
            <a
              href="https://wa.me/918173064549"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-white/15 hover:bg-white/25 transition-all hover:scale-105"
            >
              💬 WhatsApp Chat
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ service, onApply }: { service: Service; onApply: () => void }) {
  return (
    <div
      className="bg-card rounded-xl p-4 border border-border card-hover cursor-pointer group"
      onClick={onApply}
    >
      <div className="text-3xl mb-3 text-center">{service.icon}</div>
      <h3 className="font-semibold text-sm text-center text-foreground leading-tight mb-1">
        {service.name}
      </h3>
      <p className="text-xs text-center text-muted-foreground mb-3">{service.nameHindi}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold" style={{ color: 'oklch(0.45 0.18 250)' }}>
          ₹{service.fee}
        </span>
        <span
          className="text-xs font-semibold px-2 py-1 rounded-lg flex items-center gap-1 text-white transition-all group-hover:gap-2"
          style={{ background: 'oklch(0.45 0.18 250)' }}
        >
          Apply <ChevronRight size={10} />
        </span>
      </div>
    </div>
  );
}

function ServiceCardSkeleton() {
  return (
    <div className="bg-card rounded-xl p-4 border border-border animate-pulse">
      <div className="w-10 h-10 rounded-full bg-muted mx-auto mb-3" />
      <div className="h-3 bg-muted rounded mx-auto w-3/4 mb-2" />
      <div className="h-2 bg-muted rounded mx-auto w-1/2 mb-3" />
      <div className="flex justify-between">
        <div className="h-3 bg-muted rounded w-10" />
        <div className="h-6 bg-muted rounded w-14" />
      </div>
    </div>
  );
}
