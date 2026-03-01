import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Loader2, AlertCircle, QrCode, Copy, Check, Receipt } from 'lucide-react';
import { useSubmitCustomer } from '../hooks/useQueries';

const SERVICES = [
  'PAN Card', 'Aadhar Update', 'Income Certificate', 'Caste Certificate',
  'Domicile', 'Voter ID', 'Birth Certificate', 'Death Certificate',
  'Electricity Bill', 'FASTag', 'Ayushman Card', 'Passport Apply',
  'Rail Ticket', 'Flight Ticket', 'Insurance', 'Bank Account',
  'Photo Print', 'Lamination', 'Online Form', 'Scholarship',
  'PM Kisan', 'Labour Card', 'E Shram', 'Ration Card',
  'Driving Licence', 'Vehicle Transfer', 'GST Registration',
  'IT Return', 'Exam Form', 'Job Form', 'Recharge', 'Other Service',
];

const UPI_ID = '8173064549@okicici';
const PAYEE_NAME = 'Vijay Online Centre';

function generateQRUrl(upiString: string, size: number = 250): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(upiString)}&bgcolor=ffffff&color=000000&margin=10`;
}

interface FormData {
  name: string;
  mobile: string;
  service: string;
  amount: string;
}

interface FormErrors {
  name?: string;
  mobile?: string;
  service?: string;
  amount?: string;
  submit?: string;
}

type PageStep = 'form' | 'payment' | 'success';

interface PaymentPageProps {
  onNavigate?: (page: string, data?: any) => void;
}

export default function PaymentPage({ onNavigate }: PaymentPageProps) {
  const submitCustomer = useSubmitCustomer();
  const [step, setStep] = useState<PageStep>('form');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    mobile: '',
    service: '',
    amount: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  // Auto-redirect to receipt page after success
  useEffect(() => {
    if (step !== 'success' || submittedId === null) return;
    if (redirectCountdown <= 0) {
      if (onNavigate) {
        onNavigate('receipt', { customerId: submittedId });
      }
      return;
    }
    const timer = setTimeout(() => setRedirectCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, submittedId, redirectCountdown, onNavigate]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile.trim())) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }
    if (!formData.service) newErrors.service = 'Please select a service';
    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) < 0) {
      newErrors.amount = 'Enter a valid amount';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const id = await submitCustomer.mutateAsync({
        name: formData.name.trim(),
        service: formData.service,
        mobile: formData.mobile.trim(),
        amount: parseFloat(formData.amount) || 0,
      });
      setSubmittedId(id);
      setStep('payment');
    } catch (err: any) {
      setErrors({ submit: err?.message || 'Submission failed. Please try again.' });
    }
  };

  const upiString = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${formData.amount}&cu=INR`;
  const qrUrl = generateQRUrl(upiString, 250);

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePaymentDone = () => {
    setStep('success');
    setRedirectCountdown(3);
  };

  const handleGoHome = () => {
    if (onNavigate) {
      onNavigate('home');
    } else {
      resetForm();
    }
  };

  const handleViewReceipt = () => {
    if (onNavigate && submittedId !== null) {
      onNavigate('receipt', { customerId: submittedId });
    }
  };

  const resetForm = () => {
    setStep('form');
    setFormData({ name: '', mobile: '', service: '', amount: '' });
    setErrors({});
    setSubmittedId(null);
    setRedirectCountdown(3);
  };

  // ── Success Screen ────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4">
        <div className="bg-navy-800 rounded-2xl p-8 max-w-md w-full text-center border border-navy-700 shadow-xl fade-in">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-green-400" />
          </div>
          <h2 className="text-white text-2xl font-bold font-display mb-2">Request Submitted!</h2>
          <p className="text-navy-300 mb-4">
            Your service request has been submitted successfully.
          </p>
          <div className="bg-navy-900/60 rounded-xl p-4 mb-4 border border-navy-700 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-navy-400">Service</span>
              <span className="text-saffron font-medium">{formData.service}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-navy-400">Amount</span>
              <span className="text-saffron font-medium">₹{formData.amount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-navy-400">Reference ID</span>
              <span className="text-white font-mono">#{submittedId}</span>
            </div>
          </div>

          {/* Auto-redirect notice */}
          <div className="bg-emerald-900/30 border border-emerald-700 rounded-xl p-3 mb-5 text-sm text-emerald-300 flex items-center gap-2">
            <Receipt size={16} />
            <span>
              Redirecting to receipt page in <strong>{redirectCountdown}s</strong>...
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleViewReceipt}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2"
            >
              <Receipt size={18} />
              View Receipt Now
            </button>
            <button
              onClick={resetForm}
              className="w-full py-3 bg-saffron text-white rounded-xl font-semibold hover:bg-saffron-dark transition-colors"
            >
              Submit Another Request
            </button>
            <button
              onClick={handleGoHome}
              className="w-full py-3 bg-navy-700 text-navy-200 rounded-xl font-medium hover:bg-navy-600 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Payment Screen ────────────────────────────────────────────────────────
  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4 py-8">
        <div className="bg-navy-800 rounded-2xl p-6 max-w-sm w-full border border-navy-700 shadow-xl fade-in">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="w-12 h-12 bg-saffron/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <QrCode size={24} className="text-saffron" />
            </div>
            <h2 className="text-white text-xl font-bold font-display">Pay via UPI</h2>
            <p className="text-navy-300 text-sm mt-1">Scan QR code to complete payment</p>
          </div>

          {/* Service & Amount Summary */}
          <div className="bg-navy-900/60 rounded-xl p-4 mb-5 border border-navy-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-navy-400 text-sm">Service</span>
              <span className="text-white font-medium text-sm">{formData.service}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-navy-400 text-sm">Amount</span>
              <span className="text-saffron font-bold text-xl">₹{formData.amount}</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center mb-5">
            <div className="bg-white p-3 rounded-xl shadow-lg border-2 border-saffron/20">
              <img
                src={qrUrl}
                alt="UPI QR Code"
                width={220}
                height={220}
                className="block"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    '/assets/generated/upi-qr-placeholder.dim_300x300.png';
                }}
              />
            </div>
            <p className="text-navy-400 text-xs mt-2">Scan with any UPI app (PhonePe, GPay, Paytm)</p>
          </div>

          {/* UPI ID */}
          <div className="bg-navy-900/60 rounded-xl p-3 mb-4 border border-navy-700">
            <p className="text-navy-400 text-xs mb-1">UPI ID</p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-white font-mono text-sm font-semibold">{UPI_ID}</span>
              <button
                onClick={handleCopyUPI}
                className="flex items-center gap-1 px-2 py-1 bg-navy-700 hover:bg-navy-600 rounded-lg transition-colors text-xs"
                title="Copy UPI ID"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} className="text-navy-300" />
                    <span className="text-navy-300">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Open UPI App */}
          <a
            href={upiString}
            className="block w-full text-center py-2.5 bg-navy-700 text-navy-200 rounded-xl text-sm font-medium hover:bg-navy-600 transition-colors mb-3"
          >
            Open UPI App Directly
          </a>

          {/* Payment Done */}
          <button
            onClick={handlePaymentDone}
            className="w-full py-3 bg-saffron text-white rounded-xl font-bold text-base hover:bg-saffron-dark transition-colors shadow-lg"
          >
            ✓ Payment Done
          </button>

          <p className="text-navy-500 text-xs text-center mt-3">
            After payment, click "Payment Done" to confirm your request
          </p>
        </div>
      </div>
    );
  }

  // ── Form Screen ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-navy-900 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleGoHome}
            className="p-2 bg-navy-800 hover:bg-navy-700 text-navy-300 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold font-display">New Service Request</h1>
            <p className="text-navy-400 text-sm">Fill in your details to get started</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-navy-800 rounded-2xl p-6 border border-navy-700 shadow-xl space-y-5"
        >
          {/* Name */}
          <div>
            <label className="block text-navy-200 text-sm font-medium mb-1.5">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              placeholder="Enter your full name"
              className={`w-full px-4 py-3 bg-navy-900 border rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-saffron transition-colors ${
                errors.name ? 'border-red-500' : 'border-navy-700'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-red-400 text-xs flex items-center gap-1">
                <AlertCircle size={12} /> {errors.name}
              </p>
            )}
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-navy-200 text-sm font-medium mb-1.5">
              Mobile Number <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  mobile: e.target.value.replace(/\D/g, '').slice(0, 10),
                }))
              }
              placeholder="10-digit mobile number"
              className={`w-full px-4 py-3 bg-navy-900 border rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-saffron transition-colors ${
                errors.mobile ? 'border-red-500' : 'border-navy-700'
              }`}
            />
            {errors.mobile && (
              <p className="mt-1 text-red-400 text-xs flex items-center gap-1">
                <AlertCircle size={12} /> {errors.mobile}
              </p>
            )}
          </div>

          {/* Service */}
          <div>
            <label className="block text-navy-200 text-sm font-medium mb-1.5">
              Service <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.service}
              onChange={(e) => setFormData((p) => ({ ...p, service: e.target.value }))}
              required
              className={`w-full px-4 py-3 bg-navy-900 border rounded-xl focus:outline-none focus:border-saffron transition-colors appearance-none ${
                errors.service ? 'border-red-500' : 'border-navy-700'
              } ${!formData.service ? 'text-navy-500' : 'text-white'}`}
            >
              <option value="" disabled>
                Select a service
              </option>
              {SERVICES.map((s) => (
                <option key={s} value={s} className="bg-navy-900 text-white">
                  {s}
                </option>
              ))}
            </select>
            {errors.service && (
              <p className="mt-1 text-red-400 text-xs flex items-center gap-1">
                <AlertCircle size={12} /> {errors.service}
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-navy-200 text-sm font-medium mb-1.5">
              Amount (₹) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
              placeholder="Enter amount in rupees"
              min="0"
              step="1"
              className={`w-full px-4 py-3 bg-navy-900 border rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-saffron transition-colors ${
                errors.amount ? 'border-red-500' : 'border-navy-700'
              }`}
            />
            {errors.amount && (
              <p className="mt-1 text-red-400 text-xs flex items-center gap-1">
                <AlertCircle size={12} /> {errors.amount}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle size={14} /> {errors.submit}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitCustomer.isPending}
            className="w-full py-3.5 bg-saffron text-white rounded-xl font-bold text-base hover:bg-saffron-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg mt-2"
          >
            {submitCustomer.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit & Pay'
            )}
          </button>
        </form>

        <p className="text-navy-500 text-xs text-center mt-4">
          Your data is securely stored on the Internet Computer blockchain
        </p>
      </div>
    </div>
  );
}
