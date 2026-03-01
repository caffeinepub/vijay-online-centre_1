import React, { useState } from 'react';
import { X, LogIn, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const { login, isLoading } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    const result = await login(username.trim(), password.trim());
    if (result.success) {
      setUsername('');
      setPassword('');
      setError(null);
      onSuccess();
    } else {
      setError(result.error || 'Invalid username or password');
    }
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-navy-800 rounded-2xl p-6 w-full max-w-sm border border-navy-700 shadow-2xl fade-in">
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-navy-400 hover:text-white hover:bg-navy-700 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-saffron/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <LogIn size={26} className="text-saffron" />
          </div>
          <h2 className="text-white text-xl font-bold font-display">Admin Login</h2>
          <p className="text-navy-400 text-sm mt-1">Vijay Online Centre</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-navy-200 text-sm font-medium mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
              className="w-full px-4 py-3 bg-navy-900 border border-navy-700 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-saffron transition-colors"
            />
          </div>

          <div>
            <label className="block text-navy-200 text-sm font-medium mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-11 bg-navy-900 border border-navy-700 rounded-xl text-white placeholder-navy-500 focus:outline-none focus:border-saffron transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-navy-400 hover:text-navy-200 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-700/50 rounded-xl text-red-300 text-sm">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-saffron text-white rounded-xl font-bold hover:bg-saffron-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                <LogIn size={16} />
                Login
              </>
            )}
          </button>
        </form>

        <p className="text-navy-500 text-xs text-center mt-4">
          Admin access only — Vijay Online Centre
        </p>
      </div>
    </div>
  );
}
