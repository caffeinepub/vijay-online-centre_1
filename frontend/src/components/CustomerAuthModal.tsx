import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Phone, Shield, CheckCircle, Loader2, X, KeyRound } from "lucide-react";
import { useCustomerAuth, generateRandomOTP } from "../hooks/useCustomerAuth";

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export default function CustomerAuthModal({
  isOpen,
  onClose,
  onAuthenticated,
}: CustomerAuthModalProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginWithMobile } = useCustomerAuth();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSendOtp = async () => {
    if (!phone.match(/^[6-9]\d{9}$/)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    // Generate a fresh random OTP every time
    const newOtp = generateRandomOTP();
    setGeneratedOtp(newOtp);
    setLoading(false);
    setStep("otp");
  };

  const handleVerifyOtp = async () => {
    if (otp !== generatedOtp) {
      setError("Invalid OTP. Please check the OTP shown below and try again.");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    loginWithMobile(phone, name.trim());
    setLoading(false);
    onAuthenticated();
    resetForm();
  };

  const resetForm = () => {
    setStep("phone");
    setPhone("");
    setName("");
    setOtp("");
    setGeneratedOtp("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Submit button is only enabled when OTP matches exactly
  const isOtpCorrect = otp.length === 6 && otp === generatedOtp;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: "#002147" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" style={{ color: "#002147" }} />
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-tight">Customer Login</h2>
              <p className="text-blue-200 text-xs leading-tight">Vijay Online Centre – Secure Access</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-blue-200 hover:text-white transition-colors p-1 rounded-md shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {step === "phone" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modal-name" className="text-sm font-semibold" style={{ color: "#002147" }}>
                  Full Name
                </Label>
                <Input
                  id="modal-name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-gray-300 focus-visible:ring-2"
                  style={{ "--tw-ring-color": "#002147" } as React.CSSProperties}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-phone" className="text-sm font-semibold" style={{ color: "#002147" }}>
                  Mobile Number
                </Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-600 font-medium shrink-0">
                    +91
                  </div>
                  <Input
                    id="modal-phone"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    maxLength={10}
                    className="border-gray-300"
                  />
                </div>
              </div>
              {error && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <Button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full font-bold py-3 text-base rounded-xl text-white"
                style={{ backgroundColor: "#002147" }}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating OTP...</>
                ) : (
                  "Get OTP"
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                <p className="text-sm text-blue-700">
                  OTP generated for <strong>+91 {phone}</strong>
                </p>
              </div>

              {/* Display the generated OTP for demo purposes */}
              <div className="flex items-center gap-3 p-4 rounded-xl border-2" style={{ backgroundColor: "#f0f4ff", borderColor: "#002147" }}>
                <KeyRound className="w-5 h-5 shrink-0" style={{ color: "#002147" }} />
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-0.5">Your One-Time Password (OTP)</p>
                  <p className="text-3xl font-black tracking-[0.3em] font-mono" style={{ color: "#002147" }}>
                    {generatedOtp}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Valid for this session only</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="modal-otp" className="text-sm font-semibold" style={{ color: "#002147" }}>
                  Enter 6-digit OTP
                </Label>
                <Input
                  id="modal-otp"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="text-center text-2xl tracking-[0.5em] font-mono border-gray-300"
                  maxLength={6}
                />
              </div>
              {error && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <Button
                onClick={handleVerifyOtp}
                disabled={loading || !isOtpCorrect}
                className="w-full font-bold py-3 text-base rounded-xl text-white"
                style={{ backgroundColor: isOtpCorrect ? "#002147" : "#6b7280" }}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</>
                ) : (
                  <><CheckCircle className="w-4 h-4 mr-2" /> Verify &amp; Login</>
                )}
              </Button>
              <button
                onClick={() => { setStep("phone"); setError(""); setOtp(""); setGeneratedOtp(""); }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Change mobile number
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
