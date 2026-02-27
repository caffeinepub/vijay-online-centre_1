import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PaymentPage from './pages/PaymentPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import FloatingSupport from './components/FloatingSupport';
import ChatbotWidget from './components/ChatbotWidget';
import { type Service } from './hooks/useQueries';

export type Page = 'home' | 'payment' | 'dashboard' | 'admin';

export interface AppState {
  currentPage: Page;
  selectedService: Service | null;
  userId: string;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
  },
});

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    if (window.location.pathname === '/admin') return 'admin';
    return 'home';
  });
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const [userId] = useState(() => {
    const stored = localStorage.getItem('vijay_user_id');
    if (stored) return stored;
    const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;
    localStorage.setItem('vijay_user_id', id);
    return id;
  });

  const navigate = (page: Page, service?: Service) => {
    setCurrentPage(page);
    if (service) setSelectedService(service);
    if (page === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else if (page === 'home') {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header currentPage={currentPage} navigate={navigate} />
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage navigate={navigate} />
        )}
        {currentPage === 'payment' && (
          <PaymentPage
            service={selectedService?.name ?? ''}
            onBack={() => navigate('home')}
          />
        )}
        {currentPage === 'dashboard' && (
          <DashboardPage userId={userId} navigate={navigate} />
        )}
        {currentPage === 'admin' && (
          <AdminPage />
        )}
      </main>
      <Footer />
      <FloatingSupport />
      <ChatbotWidget />
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
