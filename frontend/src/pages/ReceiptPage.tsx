import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Printer, Download, ArrowLeft, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAllCustomers } from '../hooks/useQueries';
import type { Customer } from '../backend';

const UPI_ID = '8173064549@okicici';
const RECEIVER_NAME = 'Vijay Online Centre';

interface ReceiptPageProps {
  onNavigate?: (page: string) => void;
  initialCustomerId?: number | null;
}

function formatReceiptDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  if (ms <= 0) return '—';
  return new Date(ms).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function ReceiptContent({ customer }: { customer: Customer }) {
  const paymentDate = customer.paymentDate ? formatReceiptDate(customer.paymentDate) : '—';
  const receiptId = customer.receiptId ?? '—';

  return (
    <div
      id="receipt-content"
      className="bg-white text-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a2744 0%, #0f1a35 100%)', padding: '28px 24px 20px' }}>
        <div style={{ textAlign: 'center' }}>
          <img
            src="/assets/generated/logo-vijay.dim_256x256.png"
            alt="Vijay Online Centre"
            style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 12px', display: 'block', border: '3px solid rgba(255,165,0,0.5)' }}
          />
          <h1 style={{ color: '#ffffff', fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: 0.5 }}>
            Vijay Online Centre
          </h1>
          <p style={{ color: '#f97316', fontSize: 13, margin: '4px 0 0', fontWeight: 600, letterSpacing: 1 }}>
            PAYMENT RECEIPT
          </p>
        </div>
      </div>

      {/* Success Badge */}
      <div style={{ background: '#f0fdf4', borderBottom: '2px solid #bbf7d0', padding: '16px 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff', borderRadius: 50, padding: '8px 20px', fontSize: 15, fontWeight: 700 }}>
          <span style={{ fontSize: 18 }}>✅</span>
          <span>PAYMENT SUCCESSFUL</span>
        </div>
      </div>

      {/* Receipt ID */}
      <div style={{ background: '#fffbeb', borderBottom: '1px solid #fde68a', padding: '10px 24px', textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: '#92400e', fontWeight: 600, letterSpacing: 1 }}>RECEIPT NO: </span>
        <span style={{ fontSize: 14, color: '#78350f', fontWeight: 800, fontFamily: 'monospace' }}>{receiptId}</span>
      </div>

      {/* Customer Details */}
      <div style={{ padding: '20px 24px 0' }}>
        <h3 style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 12px', borderBottom: '1px solid #e5e7eb', paddingBottom: 6 }}>
          Customer Details
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '5px 0', fontSize: 13, color: '#6b7280', width: '45%' }}>Customer Name</td>
              <td style={{ padding: '5px 0', fontSize: 13, fontWeight: 700, color: '#111827' }}>{customer.name}</td>
            </tr>
            <tr>
              <td style={{ padding: '5px 0', fontSize: 13, color: '#6b7280' }}>Mobile Number</td>
              <td style={{ padding: '5px 0', fontSize: 13, fontWeight: 700, color: '#111827' }}>{customer.mobile}</td>
            </tr>
            <tr>
              <td style={{ padding: '5px 0', fontSize: 13, color: '#6b7280' }}>Service</td>
              <td style={{ padding: '5px 0', fontSize: 13, fontWeight: 700, color: '#111827' }}>{customer.service}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment Details */}
      <div style={{ padding: '16px 24px 0' }}>
        <h3 style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 12px', borderBottom: '1px solid #e5e7eb', paddingBottom: 6 }}>
          Payment Details
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '5px 0', fontSize: 13, color: '#6b7280', width: '45%' }}>Payment Status</td>
              <td style={{ padding: '5px 0', fontSize: 13, fontWeight: 700, color: '#16a34a' }}>SUCCESSFUL ✅</td>
            </tr>
            <tr>
              <td style={{ padding: '5px 0', fontSize: 13, color: '#6b7280' }}>Amount Paid</td>
              <td style={{ padding: '5px 0', fontSize: 18, fontWeight: 800, color: '#1a2744' }}>₹{Number(customer.amount).toFixed(2)}</td>
            </tr>
            <tr>
              <td style={{ padding: '5px 0', fontSize: 13, color: '#6b7280' }}>Payment Method</td>
              <td style={{ padding: '5px 0', fontSize: 13, fontWeight: 700, color: '#111827' }}>UPI QR</td>
            </tr>
            <tr>
              <td style={{ padding: '5px 0', fontSize: 13, color: '#6b7280' }}>Paid To (UPI ID)</td>
              <td style={{ padding: '5px 0', fontSize: 13, fontWeight: 700, color: '#111827', fontFamily: 'monospace' }}>{UPI_ID}</td>
            </tr>
            <tr>
              <td style={{ padding: '5px 0', fontSize: 13, color: '#6b7280' }}>Receiver Name</td>
              <td style={{ padding: '5px 0', fontSize: 13, fontWeight: 700, color: '#111827' }}>{RECEIVER_NAME}</td>
            </tr>
            <tr>
              <td style={{ padding: '5px 0', fontSize: 13, color: '#6b7280' }}>Transaction Date</td>
              <td style={{ padding: '5px 0', fontSize: 12, fontWeight: 600, color: '#374151' }}>{paymentDate}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ margin: '20px 24px 0', background: '#f9fafb', borderRadius: 8, padding: '12px 16px', textAlign: 'center', borderTop: '2px dashed #e5e7eb' }}>
        <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
          This is a computer-generated receipt and does not require a signature.
        </p>
        <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0' }}>
          For queries, contact Vijay Online Centre
        </p>
      </div>

      <div style={{ padding: '12px 24px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 10, color: '#d1d5db', margin: 0 }}>
          Vijay Online Centre • UPI: {UPI_ID}
        </p>
      </div>
    </div>
  );
}

export default function ReceiptPage({ onNavigate, initialCustomerId }: ReceiptPageProps) {
  const [searchMobile, setSearchMobile] = useState('');
  const [submittedMobile, setSubmittedMobile] = useState('');
  const [activeCustomerId, setActiveCustomerId] = useState<number | null>(initialCustomerId ?? null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const {
    data: customers = [],
    isLoading,
    refetch,
  } = useAllCustomers();

  // Auto-refresh polling when payment is pending
  const foundCustomer: Customer | null = activeCustomerId != null
    ? (customers.find((c) => Number(c.id) === activeCustomerId) ?? null)
    : null;

  const isPending = foundCustomer ? foundCustomer.paymentStatus !== 'success' : false;

  // Poll every 5 seconds when payment is pending
  useEffect(() => {
    if (!isPending || !foundCustomer) return;
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPending, foundCustomer, refetch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    const mobile = searchMobile.trim();
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      setSearchError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setSubmittedMobile(mobile);
    const match = customers.find((c) => c.mobile === mobile);
    if (!match) {
      setSearchError('No record found for this mobile number.');
      setActiveCustomerId(null);
      return;
    }
    setActiveCustomerId(Number(match.id));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Use browser print-to-PDF approach
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('home');
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <RefreshCw size={32} className="animate-spin text-saffron" />
          <p className="text-navy-300">Loading receipt data...</p>
        </div>
      );
    }

    if (foundCustomer) {
      if (foundCustomer.paymentStatus === 'success') {
        return (
          <>
            <ReceiptContent customer={foundCustomer} />
            {/* Action Buttons */}
            <div className="no-print flex gap-3 justify-center mt-6 flex-wrap">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-3 bg-navy-700 hover:bg-navy-600 text-white rounded-xl font-semibold transition-colors shadow-lg"
              >
                <Printer size={18} />
                Print Receipt
              </button>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2 px-6 py-3 bg-saffron hover:bg-saffron-dark text-white rounded-xl font-semibold transition-colors shadow-lg disabled:opacity-60"
              >
                {isDownloading ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Download size={18} />
                )}
                Download Slip
              </button>
            </div>
            <div className="no-print mt-4 text-center">
              <p className="text-navy-400 text-xs">
                To save as PDF: Click "Download Slip" → In print dialog, choose "Save as PDF"
              </p>
            </div>
          </>
        );
      } else {
        // Payment pending — show waiting state
        return (
          <div className="bg-navy-800 rounded-2xl p-8 max-w-md w-full mx-auto text-center border border-navy-700 shadow-xl">
            <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={40} className="text-amber-400" />
            </div>
            <h2 className="text-white text-xl font-bold font-display mb-2">Payment Pending</h2>
            <p className="text-navy-300 mb-2">
              Your payment for <span className="text-saffron font-semibold">{foundCustomer.service}</span> is being verified.
            </p>
            <p className="text-navy-400 text-sm mb-6">
              This page will automatically update once your payment is confirmed by the admin.
            </p>
            <div className="flex items-center justify-center gap-2 text-amber-400 text-sm">
              <RefreshCw size={14} className="animate-spin" />
              <span>Checking payment status every 5 seconds...</span>
            </div>
            <div className="mt-4 bg-navy-900/60 rounded-xl p-3 border border-navy-700 text-left">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-navy-400">Name</span>
                <span className="text-white">{foundCustomer.name}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-navy-400">Service</span>
                <span className="text-white">{foundCustomer.service}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-navy-400">Amount</span>
                <span className="text-saffron font-bold">₹{Number(foundCustomer.amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        );
      }
    }

    // No customer selected — show search form
    return (
      <div className="bg-navy-800 rounded-2xl p-8 max-w-md w-full mx-auto border border-navy-700 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-saffron/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search size={28} className="text-saffron" />
          </div>
          <h2 className="text-white text-xl font-bold font-display">Find Your Receipt</h2>
          <p className="text-navy-300 text-sm mt-1">
            Enter your mobile number to view your payment receipt
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-navy-200 text-sm font-medium mb-1.5">
              Mobile Number
            </label>
            <input
              type="tel"
              value={searchMobile}
              onChange={(e) => setSearchMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter 10-digit mobile number"
              className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-saffron transition-colors"
            />
          </div>

          {searchError && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg p-3">
              <AlertCircle size={14} />
              {searchError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-saffron text-white rounded-xl font-bold hover:bg-saffron-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search size={16} />
                Search Receipt
              </>
            )}
          </button>
        </form>

        {submittedMobile && !searchError && !foundCustomer && !isLoading && (
          <div className="mt-4 text-center text-navy-400 text-sm">
            No paid receipt found for <span className="text-white font-mono">{submittedMobile}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          #receipt-content {
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-navy-900 py-8 px-4">
        {/* Page Header */}
        <div className="no-print max-w-lg mx-auto mb-6 flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 bg-navy-800 hover:bg-navy-700 text-navy-300 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold font-display">Payment Receipt</h1>
            <p className="text-navy-400 text-sm">Vijay Online Centre — Official Payment Slip</p>
          </div>
        </div>

        {/* Search bar when no customer is loaded yet */}
        {!activeCustomerId && (
          <div className="no-print max-w-lg mx-auto mb-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="tel"
                value={searchMobile}
                onChange={(e) => setSearchMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Search by mobile number..."
                className="flex-1 px-4 py-2.5 bg-navy-800 border border-navy-700 rounded-xl text-white placeholder-navy-400 text-sm focus:outline-none focus:border-saffron"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-saffron text-white rounded-xl text-sm font-semibold hover:bg-saffron-dark transition-colors"
              >
                <Search size={16} />
              </button>
            </form>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-lg mx-auto">
          {renderContent()}

          {/* Search again button */}
          {activeCustomerId && (
            <div className="no-print mt-4 text-center">
              <button
                onClick={() => {
                  setActiveCustomerId(null);
                  setSearchMobile('');
                  setSubmittedMobile('');
                  setSearchError(null);
                }}
                className="text-navy-400 hover:text-saffron text-sm underline transition-colors"
              >
                Search for a different receipt
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
