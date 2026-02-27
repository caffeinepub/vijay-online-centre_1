import React, { useState, useEffect, useRef } from 'react';
import { ExternalBlob } from '../backend';
import { ApplicationStatus } from '../backend';
import {
  useGetApplicationById,
  useAddApplication,
  useMarkPaymentPendingVerification,
  useGetRejectionMessage,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Phone,
  User,
  IndianRupee,
} from 'lucide-react';

interface PaymentPageProps {
  service: string;
  onBack?: () => void;
}

type Step = 'form' | 'waiting' | 'payment' | 'verifying' | 'success' | 'rejected';

interface FormData {
  name: string;
  phoneNumber: string;
  files: File[];
}

// ─── UPI QR Generator ─────────────────────────────────────────────────────────

function UpiQRCode({ amount, appId }: { amount: number; appId: string }) {
  const upiString = `upi://pay?pa=8173064549@okicici&pn=VijayOnlineCentre&am=${amount}&cu=INR&tn=AppID-${appId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiString)}`;

  return (
    <div className="flex flex-col items-center gap-3">
      <img
        src={qrUrl}
        alt="UPI QR Code"
        className="w-56 h-56 rounded-lg border-2 border-primary shadow-md"
      />
      <p className="text-xs text-muted-foreground text-center">
        Scan with any UPI app (PhonePe, GPay, Paytm, etc.)
      </p>
      <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
        <IndianRupee className="w-4 h-4" />
        {amount}
      </div>
      <p className="text-xs text-muted-foreground">UPI ID: 8173064549@okicici</p>
    </div>
  );
}

// ─── Step 1: Application Form ─────────────────────────────────────────────────

function ApplicationForm({
  service,
  onSubmit,
}: {
  service: string;
  onSubmit: (appId: string, data: FormData) => void;
}) {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const addApplicationMutation = useAddApplication();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!phoneNumber.trim()) errs.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(phoneNumber.replace(/\s/g, '')))
      errs.phone = 'Enter a valid 10-digit phone number';
    if (files.length === 0) errs.files = 'Please upload at least one document';
    return errs;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    const appId = `app-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    try {
      // Convert files to ExternalBlob
      const documents = await Promise.all(
        files.map(async (file) => {
          const arrayBuffer = await file.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
            setUploadProgress(pct);
          });
          return { name: file.name, content: blob };
        })
      );

      await addApplicationMutation.mutateAsync({
        id: appId,
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        service,
        documents,
      });

      onSubmit(appId, { name, phoneNumber, files });
    } catch (err: any) {
      setErrors({ submit: err?.message ?? 'Failed to submit application. Please try again.' });
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Apply for Service</CardTitle>
        <p className="text-muted-foreground text-sm">{service}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium mb-1 flex items-center gap-1">
              <User className="w-4 h-4" /> Full Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
            />
            {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 flex items-center gap-1">
              <Phone className="w-4 h-4" /> Phone Number
            </label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="10-digit mobile number"
              type="tel"
            />
            {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 flex items-center gap-1">
              <Upload className="w-4 h-4" /> Upload Documents
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
              accept="image/*,.pdf,.doc,.docx"
            />
            {files.length > 0 && (
              <ul className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FileText className="w-3 h-3" />
                    {f.name}
                  </li>
                ))}
              </ul>
            )}
            {errors.files && <p className="text-destructive text-xs mt-1">{errors.files}</p>}
          </div>

          {addApplicationMutation.isPending && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {errors.submit && (
            <p className="text-destructive text-sm bg-destructive/10 rounded p-2">
              {errors.submit}
            </p>
          )}

          <Button type="submit" disabled={addApplicationMutation.isPending} className="w-full">
            {addApplicationMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Submit Application
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Main Payment Page ────────────────────────────────────────────────────────

export default function PaymentPage({ service, onBack }: PaymentPageProps) {
  const [step, setStep] = useState<Step>('form');
  const [appId, setAppId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);
  const [paidClicked, setPaidClicked] = useState(false);

  const markPaymentMutation = useMarkPaymentPendingVerification();

  // Poll application status
  const { data: application, isLoading: appLoading } = useGetApplicationById(appId);

  // Fetch rejection message when needed
  const { data: fetchedRejectionMsg } = useGetRejectionMessage(
    step === 'rejected' ? appId : null
  );

  // Derive step from application status
  useEffect(() => {
    if (!application || step === 'form') return;

    const status = application.status;

    if (status === ApplicationStatus.priceSet && step === 'waiting') {
      setStep('payment');
    } else if (status === ApplicationStatus.paymentPendingVerification && step === 'payment') {
      setStep('verifying');
    } else if (status === ApplicationStatus.completed) {
      setStep('success');
    }
  }, [application, step]);

  // Check for rejection by polling getRejectionMessage when waiting
  const rejectionCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!appId || step !== 'waiting') {
      if (rejectionCheckRef.current) {
        clearInterval(rejectionCheckRef.current);
        rejectionCheckRef.current = null;
      }
      return;
    }

    // Poll for rejection message every 10 seconds
    rejectionCheckRef.current = setInterval(async () => {
      // The useGetApplicationById already polls; we check if application is null (deleted = rejected)
      // Also check via getRejectionMessage
    }, 10000);

    return () => {
      if (rejectionCheckRef.current) {
        clearInterval(rejectionCheckRef.current);
        rejectionCheckRef.current = null;
      }
    };
  }, [appId, step]);

  // When application becomes null while waiting (deleted = rejected), check rejection message
  useEffect(() => {
    if (step === 'waiting' && appId && !appLoading && application === null) {
      setStep('rejected');
    }
  }, [application, appLoading, appId, step]);

  // Set rejection message from fetched data
  useEffect(() => {
    if (fetchedRejectionMsg) {
      setRejectionMessage(fetchedRejectionMsg);
    }
  }, [fetchedRejectionMsg]);

  const handleFormSubmit = (id: string, data: FormData) => {
    setAppId(id);
    setCustomerName(data.name);
    setStep('waiting');
  };

  const handleIHavePaid = async () => {
    if (!appId) return;
    setPaidClicked(true);
    try {
      await markPaymentMutation.mutateAsync(appId);
      setStep('verifying');
    } catch (err: any) {
      setPaidClicked(false);
      alert('Error: ' + (err?.message ?? 'Could not update payment status'));
    }
  };

  // ── Step: Form ──
  if (step === 'form') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-8">
        {onBack && (
          <button
            onClick={onBack}
            className="self-start mb-4 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            ← Back to Services
          </button>
        )}
        <ApplicationForm service={service} onSubmit={handleFormSubmit} />
      </div>
    );
  }

  // ── Step: Waiting for Admin to Review ──
  if (step === 'waiting') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h2 className="text-xl font-bold">Application Submitted!</h2>
            <p className="text-muted-foreground text-sm">
              Your documents have been uploaded. Vijay Ji is reviewing your application.
            </p>
            <div className="bg-muted rounded-lg px-4 py-2 text-xs font-mono text-muted-foreground">
              Application ID: {appId}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Checking for updates every 10 seconds…
            </div>
            <p className="text-xs text-muted-foreground">
              Once Vijay Ji confirms and sets the fee, the payment QR code will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Step: Rejected ──
  if (step === 'rejected') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md text-center border-destructive">
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-destructive">Application Rejected</h2>
            <p className="text-foreground text-base font-medium">
              {rejectionMessage ??
                'Your request was rejected by Vijay Ji. Please contact for details.'}
            </p>
            <div className="bg-muted rounded-lg px-4 py-2 text-xs font-mono text-muted-foreground">
              Application ID: {appId}
            </div>
            <p className="text-sm text-muted-foreground">
              Please visit the centre or call for more information.
            </p>
            {onBack && (
              <Button variant="outline" onClick={onBack} className="mt-2">
                ← Back to Services
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Step: Payment (QR shown) ──
  if (step === 'payment') {
    const fee = application?.price ? Number(application.price) : 0;

    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-xl">Complete Payment</CardTitle>
            <p className="text-center text-muted-foreground text-sm">{service}</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-5">
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2 text-center">
              <p className="text-green-700 dark:text-green-300 text-sm font-medium">
                ✅ Application Confirmed by Vijay Ji
              </p>
              <p className="text-green-600 dark:text-green-400 text-xs mt-0.5">
                Service Fee: ₹{fee}
              </p>
            </div>

            <UpiQRCode amount={fee} appId={appId ?? ''} />

            {/* ICICI Reference QR */}
            <div className="flex flex-col items-center gap-1">
              <p className="text-xs text-muted-foreground font-medium">Reference QR (ICICI)</p>
              <img
                src="/assets/generated/icici-qr-reference.dim_400x400.png"
                alt="ICICI Reference QR"
                className="w-32 h-32 rounded border border-border"
              />
            </div>

            <div className="w-full bg-muted rounded-lg p-3 text-sm space-y-1">
              <p><span className="font-medium">Name:</span> {customerName}</p>
              <p><span className="font-medium">Service:</span> {service}</p>
              <p><span className="font-medium">Amount:</span> ₹{fee}</p>
              <p className="font-mono text-xs text-muted-foreground">ID: {appId}</p>
            </div>

            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={handleIHavePaid}
              disabled={markPaymentMutation.isPending || paidClicked}
            >
              {markPaymentMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing…
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  I Have Paid
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              After paying, click "I Have Paid" to notify Vijay Ji for verification.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Step: Verifying ──
  if (step === 'verifying') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
            </div>
            <h2 className="text-xl font-bold">Payment Received</h2>
            <p className="text-muted-foreground text-sm">
              Waiting for Vijay Ji to verify your payment…
            </p>
            <div className="bg-muted rounded-lg px-4 py-2 text-xs font-mono text-muted-foreground">
              Application ID: {appId}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Checking status every 10 seconds…
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Step: Success ──
  if (step === 'success') {
    const fee = application?.price ? Number(application.price) : 0;

    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md text-center border-green-300 dark:border-green-700">
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">
              Payment Successful ✅
            </h2>
            <p className="text-muted-foreground text-sm">
              Your payment has been verified by Vijay Ji. Thank you!
            </p>

            {/* Receipt */}
            <div className="w-full bg-muted rounded-xl p-4 text-left space-y-2 border border-border">
              <p className="text-center font-bold text-foreground mb-3">🧾 Receipt</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Customer Name</span>
                <span className="font-medium">{customerName || application?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium text-right max-w-[60%]">{service}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-bold text-green-700 dark:text-green-400">₹{fee}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Application ID</span>
                <span className="font-mono text-xs">{appId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Date</span>
                <span>{new Date().toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            <Badge variant="default" className="bg-green-600 text-white">
              Order Completed
            </Badge>

            {onBack && (
              <Button variant="outline" onClick={onBack} className="mt-2">
                ← Back to Services
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
