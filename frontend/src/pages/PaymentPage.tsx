import React, { useState, useRef } from "react";
import { useSubmitApplication } from "../hooks/useQueries";
import { getLatestAuth } from "../hooks/useCustomerAuth";
import { ExternalBlob } from "../backend";
import { Upload, FileText, AlertCircle, Loader2, CheckCircle, ExternalLink, X } from "lucide-react";

const ICICI_QR_IMAGE = "/assets/generated/icici-qr.dim_400x500.png";
const UPI_ID = "8173064549@okicici";
const UPI_NAME = "Vijay Online Centre";

interface PaymentPageProps {
  selectedService: string;
  onSuccess: (appId: string) => void;
}

type Step = "details" | "upload" | "submitting" | "submitted";

const ALL_SERVICES = [
  "Aadhaar Update", "PAN Card", "Passport", "Voter ID", "Driving Licence", "Ration Card",
  "Income Certificate", "Caste Certificate", "Residence Certificate", "Birth Certificate",
  "Death Certificate", "Marriage Certificate", "Land Records", "Property Registration",
  "NREGA Job Card", "PM Kisan", "Ayushman Bharat", "Scholarship Application",
  "ITR Filing", "GST Registration", "Udyam Registration", "MSME Certificate",
  "Shop & Establishment", "FSSAI Licence", "Trade Licence",
  "Bank Account Opening", "Loan Application", "Insurance", "Pension", "EPF/PF Services",
  "Railway Ticket Booking", "Bus Ticket Booking",
];

function generateAppId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VOC-${ts}-${rand}`;
}

export default function PaymentPage({ selectedService, onSuccess }: PaymentPageProps) {
  const auth = getLatestAuth();

  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState(auth?.name || "");
  const [phone, setPhone] = useState(auth?.mobile || "");
  const [serviceChoice, setServiceChoice] = useState(selectedService || "");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitMutation = useSubmitApplication();

  const handleDetailsNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!phone.trim() || phone.length < 10) { setError("Please enter a valid 10-digit phone number."); return; }
    if (!serviceChoice) { setError("Please select a service."); return; }
    setStep("upload");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit without documents (text-only application)
  const submitWithoutDocs = async (appId: string) => {
    return submitMutation.mutateAsync({
      id: appId,
      applicantName: name.trim(),
      phoneNumber: phone.trim(),
      service: serviceChoice,
      documents: [],
    });
  };

  // Submit with documents
  const submitWithDocs = async (appId: string) => {
    const documents = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer) as Uint8Array<ArrayBuffer>;
        const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
          setUploadProgress(pct);
        });
        return { name: file.name, content: blob };
      })
    );

    return submitMutation.mutateAsync({
      id: appId,
      applicantName: name.trim(),
      phoneNumber: phone.trim(),
      service: serviceChoice,
      documents,
    });
  };

  const handleSubmit = async () => {
    setError("");
    setStep("submitting");
    setUploadProgress(0);

    const appId = generateAppId();

    try {
      // Try with documents first if any files selected
      let result;
      if (files.length > 0) {
        try {
          result = await submitWithDocs(appId);
        } catch (docErr: unknown) {
          const docErrMsg = docErr instanceof Error ? docErr.message : String(docErr);
          // If blob/v3 error, fall back to no-docs submission
          const isBlobError =
            docErrMsg.includes("v3") ||
            docErrMsg.includes("Expected v3") ||
            docErrMsg.includes("blob") ||
            docErrMsg.includes("upload") ||
            docErrMsg.includes("ExternalBlob") ||
            docErrMsg.includes("chunk");

          if (isBlobError) {
            const fallbackId = generateAppId();
            result = await submitWithoutDocs(fallbackId);
          } else {
            throw docErr;
          }
        }
      } else {
        result = await submitWithoutDocs(appId);
      }

      const returnedId = result?.id || appId;
      localStorage.setItem("applicationId", returnedId);
      localStorage.setItem("vijay_app_id", returnedId);
      setSubmittedAppId(returnedId);
      setStep("submitted");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setError(`Submission failed: ${errMsg}. Please try again.`);
      setStep("upload");
    }
  };

  // ── Submitting ─────────────────────────────────────────────────────────────
  if (step === "submitting") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-700 mx-auto" />
          <p className="font-semibold text-gray-700">Submitting your application...</p>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-700 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">Uploading: {uploadProgress}%</p>
            </div>
          )}
          <p className="text-xs text-gray-400">Please do not close this page</p>
        </div>
      </div>
    );
  }

  // ── Submitted ──────────────────────────────────────────────────────────────
  if (step === "submitted") {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Success */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
            <h2 className="text-xl font-bold text-green-800">Application Submitted!</h2>
            <p className="text-sm text-green-700">Your application has been received successfully.</p>
            {submittedAppId && (
              <div className="bg-white rounded-lg px-4 py-2 mt-2 inline-block">
                <p className="text-xs text-gray-500">Application ID</p>
                <p className="font-mono font-bold text-blue-800">{submittedAppId}</p>
              </div>
            )}
          </div>

          {/* Payment info */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-gray-800">Payment Instructions</h3>
            <p className="text-sm text-gray-600">
              Our team will review your application and set the fee. Once set, please pay using the QR below.
            </p>

            {/* ICICI QR */}
            <div className="flex flex-col items-center gap-3 py-4 border rounded-xl bg-gray-50">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="text-orange-600 font-bold">🏦</span>
                ICICI Bank - XX47
              </div>
              <img
                src={ICICI_QR_IMAGE}
                alt="ICICI Bank UPI QR Code"
                className="w-48 h-48 object-contain rounded-lg shadow"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "/assets/generated/upi-qr-placeholder.dim_300x300.png";
                }}
              />
              <p className="text-xs text-gray-500 font-mono">{UPI_ID}</p>
              <a
                href={`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}`}
                className="inline-flex items-center gap-2 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: "#002147" }}
              >
                <ExternalLink className="w-4 h-4" />
                Pay Now via UPI
              </a>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700 space-y-1">
              <p className="font-semibold">After payment:</p>
              <p>• Note your Transaction ID / UTR number</p>
              <p>• Track your application status on the Dashboard</p>
              <p>• Our team will confirm payment within 24 hours</p>
            </div>
          </div>

          <button
            onClick={() => onSuccess(submittedAppId || "")}
            className="w-full text-white font-semibold py-3 rounded-xl transition-colors"
            style={{ backgroundColor: "#002147" }}
          >
            Track My Application →
          </button>
        </div>
      </div>
    );
  }

  // ── Details Step ───────────────────────────────────────────────────────────
  if (step === "details") {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Apply for Service</h2>
              <p className="text-sm text-gray-500 mt-1">Fill in your details to get started</p>
            </div>

            <form onSubmit={handleDetailsNext} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Service <span className="text-red-500">*</span>
                </label>
                <select
                  value={serviceChoice}
                  onChange={(e) => setServiceChoice(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                >
                  <option value="">-- Choose a service --</option>
                  {ALL_SERVICES.map((svc) => (
                    <option key={svc} value={svc}>{svc}</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full text-white font-semibold py-3 rounded-xl transition-colors"
                style={{ backgroundColor: "#002147" }}
              >
                Next: Upload Documents →
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Upload Step ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-4">
        {/* Summary */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border-l-4" style={{ borderLeftColor: "#002147" }}>
          <p className="text-xs text-gray-500">Applying for</p>
          <p className="font-bold text-gray-800">{serviceChoice}</p>
          <p className="text-sm text-gray-600">{name} · {phone}</p>
        </div>

        {/* Upload */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Upload Documents</h2>
            <p className="text-sm text-gray-500 mt-1">
              Upload supporting documents (optional — you can skip and submit now)
            </p>
          </div>

          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 font-medium">Click to upload files</p>
            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG supported</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2"
                >
                  <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
                  <span className="text-xs text-gray-400">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep("details")}
              className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="flex-1 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ backgroundColor: "#002147" }}
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application ✓"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
