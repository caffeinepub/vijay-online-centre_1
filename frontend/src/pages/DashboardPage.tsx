import React, { useState, useEffect } from 'react';
import { useGetApplication } from '../hooks/useQueries';
import { useSubmitPayment } from '../hooks/useQueries';
import { ApplicationStatus } from '../backend';
import type { Application } from '../backend';
import ProgressTracker from '../components/ProgressTracker';
import {
  Search,
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface DashboardPageProps {
  onBack: () => void;
  initialAppId?: string;
}

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Application Received',
  feeSet: 'Fee Set – Payment Required',
  paymentPending: 'Payment Under Review',
  paymentVerifying: 'Verifying Payment',
  completed: 'Completed',
  rejected: 'Rejected',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  submitted: <Clock size={20} className="text-blue-500" />,
  feeSet: <CreditCard size={20} className="text-yellow-500" />,
  paymentPending: <Clock size={20} className="text-orange-500" />,
  paymentVerifying: <Clock size={20} className="text-purple-500" />,
  completed: <CheckCircle size={20} className="text-green-500" />,
  rejected: <XCircle size={20} className="text-red-500" />,
};

function getStatusKey(status: ApplicationStatus): string {
  return String(status);
}

export default function DashboardPage({ onBack, initialAppId }: DashboardPageProps) {
  const [searchId, setSearchId] = useState(initialAppId ?? '');
  const [activeAppId, setActiveAppId] = useState<string | null>(initialAppId ?? null);
  const [txnId, setTxnId] = useState('');
  const [paymentMsg, setPaymentMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    data: application,
    isLoading,
    isFetching,
    refetch,
  } = useGetApplication(activeAppId);

  const submitPaymentMutation = useSubmitPayment();

  // Refetch whenever activeAppId changes
  useEffect(() => {
    if (activeAppId) {
      refetch();
    }
  }, [activeAppId, refetch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchId.trim();
    if (!trimmed) return;
    setActiveAppId(trimmed);
    setPaymentMsg(null);
    setTxnId('');
  };

  const handleSubmitPayment = async (app: Application) => {
    if (!txnId.trim()) {
      setPaymentMsg({ type: 'error', text: 'Please enter your transaction ID.' });
      return;
    }
    try {
      const result = await submitPaymentMutation.mutateAsync({
        appId: app.id,
        transactionId: txnId.trim(),
      });
      if (result) {
        setPaymentMsg({ type: 'success', text: 'Payment submitted! Admin will verify shortly.' });
        setTxnId('');
        // Refetch to show updated status
        await refetch();
      } else {
        setPaymentMsg({ type: 'error', text: 'Could not submit payment. Please try again.' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setPaymentMsg({ type: 'error', text: `Error: ${msg}` });
    }
  };

  const renderPaymentSection = (app: Application) => {
    const fee = app.price !== undefined && app.price !== null ? Number(app.price) : null;
    const upiId = '8173064549@okicici';
    const upiLink = fee
      ? `upi://pay?pa=${upiId}&pn=Vijay%20Online%20Centre&am=${fee}&cu=INR`
      : `upi://pay?pa=${upiId}&pn=Vijay%20Online%20Centre&cu=INR`;

    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard size={18} className="text-yellow-600" />
          <h3 className="font-semibold text-yellow-800">Payment Required</h3>
        </div>

        {fee !== null && (
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">₹{fee}</p>
            <p className="text-sm text-gray-500">Application Fee</p>
          </div>
        )}

        {/* QR Code */}
        <div className="flex justify-center">
          <img
            src="/assets/generated/icici-qr.dim_400x400.png"
            alt="ICICI Bank UPI QR Code"
            className="w-48 h-48 object-contain rounded-lg border border-gray-200"
          />
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-gray-700">
            UPI ID: <span className="font-mono" style={{ color: "#002147" }}>{upiId}</span>
          </p>
          <p className="text-xs text-gray-500">Account Name: Vijay Online Centre</p>
        </div>

        {/* UPI Pay Button */}
        <a
          href={upiLink}
          className="flex items-center justify-center gap-2 w-full text-white text-center py-3 rounded-lg font-semibold text-sm transition-colors"
          style={{ backgroundColor: "#002147" }}
        >
          <ExternalLink size={14} />
          Pay Now via UPI
        </a>

        {/* Transaction ID input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Enter Transaction / UTR ID after payment:
          </label>
          <input
            type="text"
            value={txnId}
            onChange={(e) => setTxnId(e.target.value)}
            placeholder="e.g. 123456789012"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
          />
          <button
            onClick={() => handleSubmitPayment(app)}
            disabled={submitPaymentMutation.isPending}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {submitPaymentMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCircle size={16} />
            )}
            Submit Payment Proof
          </button>
        </div>

        {paymentMsg && (
          <div
            className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
              paymentMsg.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{paymentMsg.text}</span>
          </div>
        )}
      </div>
    );
  };

  const renderApplication = (app: Application) => {
    const statusKey = getStatusKey(app.status);

    return (
      <div className="space-y-4">
        {/* Status card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            {STATUS_ICONS[statusKey]}
            <div>
              <h2 className="font-semibold text-gray-900">{app.applicantName}</h2>
              <p className="text-sm text-gray-500">{app.service}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                statusKey === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : statusKey === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : statusKey === 'feeSet'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {STATUS_LABELS[statusKey] ?? statusKey}
            </span>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>Application ID: <span className="font-mono">{app.id}</span></p>
            <p>Phone: {app.phoneNumber}</p>
            {app.price !== undefined && app.price !== null && (
              <p>Fee: <span className="font-semibold text-green-700">₹{Number(app.price)}</span></p>
            )}
          </div>
        </div>

        {/* Progress tracker — uses currentStage prop */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-4 text-sm">Application Progress</h3>
          <ProgressTracker currentStage={Number(app.stage ?? 0)} />
        </div>

        {/* Payment section */}
        {statusKey === 'feeSet' && renderPaymentSection(app)}

        {/* Rejection info */}
        {statusKey === 'rejected' && app.rejection && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle size={18} className="text-red-600" />
              <h3 className="font-semibold text-red-800">Application Rejected</h3>
            </div>
            <p className="text-sm text-red-700">{app.rejection.reason}</p>
          </div>
        )}

        {/* Completed */}
        {statusKey === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <CheckCircle size={32} className="mx-auto text-green-600 mb-2" />
            <h3 className="font-semibold text-green-800">Service Completed!</h3>
            <p className="text-sm text-green-700 mt-1">Your application has been processed successfully.</p>
          </div>
        )}

        {/* Refresh button */}
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm transition-colors"
          style={{ color: "#002147" }}
        >
          <Loader2 size={14} className={isFetching ? 'animate-spin' : 'opacity-0'} />
          {isFetching ? 'Refreshing…' : 'Refresh Status'}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-md"
        style={{ backgroundColor: "#002147" }}
      >
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-base font-bold">Track Application</h1>
          <p className="text-blue-200 text-xs">Vijay Online Centre</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5">
        {/* Search form */}
        <form onSubmit={handleSearch} className="mb-5">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter your Application ID"
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 bg-white"
            />
            <button
              type="submit"
              className="text-white px-4 py-3 rounded-xl hover:opacity-90 transition-colors flex items-center gap-1"
              style={{ backgroundColor: "#002147" }}
            >
              <Search size={18} />
            </button>
          </div>
        </form>

        {/* Loading */}
        {isLoading && activeAppId && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Loader2 size={32} className="animate-spin mb-3" />
            <p className="text-sm">Looking up application…</p>
          </div>
        )}

        {/* Not found */}
        {!isLoading && activeAppId && application === null && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <AlertCircle size={40} className="mb-3 opacity-40" />
            <p className="text-sm">No application found with this ID.</p>
            <p className="text-xs mt-1">Please check the ID and try again.</p>
          </div>
        )}

        {/* Application */}
        {!isLoading && application && renderApplication(application)}

        {/* Empty state */}
        {!activeAppId && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Search size={40} className="mb-3 opacity-40" />
            <p className="text-sm">Enter your Application ID above to track status.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-400 mt-8">
        <p>
          Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            caffeine.ai
          </a>
        </p>
        <p className="mt-1">© {new Date().getFullYear()} Vijay Online Centre</p>
      </footer>
    </div>
  );
}
