import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PaymentPage from './pages/PaymentPage';
import AdminPage from './pages/AdminPage';
import ReceiptPage from './pages/ReceiptPage';
import AdminLoginModal from './components/AdminLoginModal';
import { useAdminAuth } from './hooks/useAdminAuth';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 0,
    },
  },
});

type Page = 'home' | 'payment' | 'admin' | 'receipt';

interface PageData {
  customerId?: number;
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [pageData, setPageData] = useState<PageData>({});
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const { isAdminAuthenticated } = useAdminAuth();

  const handleNavigate = (page: string, data?: any) => {
    if (page === 'admin') {
      if (isAdminAuthenticated()) {
        setCurrentPage('admin');
      } else {
        setShowAdminLogin(true);
      }
      return;
    }
    if (page === 'payment') {
      setCurrentPage('payment');
      setPageData({});
      return;
    }
    if (page === 'receipt') {
      setCurrentPage('receipt');
      setPageData(data || {});
      return;
    }
    if (page === 'home') {
      setCurrentPage('home');
      setPageData({});
      return;
    }
    setCurrentPage(page as Page);
    setPageData(data || {});
  };

  const handleAdminLoginSuccess = () => {
    setShowAdminLogin(false);
    setCurrentPage('admin');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'admin':
        if (!isAdminAuthenticated()) {
          if (!showAdminLogin) setShowAdminLogin(true);
          return <HomePage onNavigate={handleNavigate} />;
        }
        return <AdminPage />;
      case 'payment':
        return <PaymentPage onNavigate={handleNavigate} />;
      case 'receipt':
        return (
          <ReceiptPage
            onNavigate={handleNavigate}
            initialCustomerId={pageData.customerId ?? null}
          />
        );
      case 'home':
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  const showHeaderFooter = currentPage !== 'admin';

  return (
    <div className="flex flex-col min-h-screen bg-navy-900">
      {showHeaderFooter && (
        <Header
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onAdminLoginClick={() => setShowAdminLogin(true)}
        />
      )}

      <main className="flex-1">
        {renderPage()}
      </main>

      {showHeaderFooter && <Footer />}

      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onSuccess={handleAdminLoginSuccess}
      />
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
