import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import Header from "./components/Header";
import FloatingSupport from "./components/FloatingSupport";
import HomePage from "./pages/HomePage";
import PaymentPage from "./pages/PaymentPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import AdminLoginModal from "./components/AdminLoginModal";
import { useAdminAuth } from "./hooks/useAdminAuth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

type Page = "home" | "payment" | "dashboard" | "admin";

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedService, setSelectedService] = useState<string>("");
  const [activeAppId, setActiveAppId] = useState<string>("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const { isAdminAuthenticated, logout } = useAdminAuth();

  const handleNavigate = (page: string, service?: string) => {
    if (page === "admin") {
      if (!isAdminAuthenticated) {
        setShowAdminLogin(true);
        return;
      }
      setCurrentPage("admin");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setCurrentPage(page as Page);
    if (service) setSelectedService(service);
    else if (page !== "payment") setSelectedService("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePaymentSuccess = (appId: string) => {
    setActiveAppId(appId);
    setCurrentPage("dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAdminLoginSuccess = () => {
    setShowAdminLogin(false);
    setCurrentPage("admin");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAdminLogout = () => {
    logout();
    setCurrentPage("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // If on admin page but session expired, redirect to home
  useEffect(() => {
    if (currentPage === "admin" && !isAdminAuthenticated) {
      setCurrentPage("home");
    }
  }, [currentPage, isAdminAuthenticated]);

  const isAdminPage = currentPage === "admin";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isAdminPage && (
        <Header currentPage={currentPage} onNavigate={handleNavigate} />
      )}

      <div className="flex-1">
        {currentPage === "home" && (
          <HomePage onNavigate={handleNavigate} />
        )}
        {currentPage === "payment" && (
          <PaymentPage
            selectedService={selectedService || "General Service"}
            onSuccess={handlePaymentSuccess}
          />
        )}
        {currentPage === "dashboard" && (
          <DashboardPage
            onBack={() => handleNavigate("home")}
            initialAppId={activeAppId || undefined}
          />
        )}
        {currentPage === "admin" && (
          <AdminPage onLogout={handleAdminLogout} />
        )}
      </div>

      {!isAdminPage && <FloatingSupport />}

      {showAdminLogin && (
        <AdminLoginModal
          onSuccess={handleAdminLoginSuccess}
          onCancel={() => setShowAdminLogin(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}
