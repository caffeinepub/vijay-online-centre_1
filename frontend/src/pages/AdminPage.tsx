import React, { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetAllApplications,
  useSetApplicationFee,
  useConfirmPayment,
  useRejectApplication,
  useUpdateApplicationStage,
} from '../hooks/useQueries';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { ApplicationStatus } from '../backend';
import type { Application } from '../backend';
import {
  RefreshCw,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface AdminPageProps {
  onLogout: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  feeSet: 'Fee Set',
  paymentPending: 'Payment Pending',
  paymentVerifying: 'Payment Verifying',
  completed: 'Completed',
  rejected: 'Rejected',
};

const STATUS_COLORS: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-800',
  feeSet: 'bg-yellow-100 text-yellow-800',
  paymentPending: 'bg-orange-100 text-orange-800',
  paymentVerifying: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

function getStatusKey(status: ApplicationStatus): string {
  return String(status);
}

export default function AdminPage({ onLogout }: AdminPageProps) {
  const queryClient = useQueryClient();
  const { adminToken, getAdminToken } = useAdminAuth();

  const {
    data: applications,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllApplications();

  const setFeeMutation = useSetApplicationFee();
  const confirmPaymentMutation = useConfirmPayment();
  const rejectMutation = useRejectApplication();
  const updateStageMutation = useUpdateApplicationStage();

  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [feeInputs, setFeeInputs] = useState<Record<string, string>>({});
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [stageInputs, setStageInputs] = useState<Record<string, string>>({});
  const [actionMessages, setActionMessages] = useState<Record<string, { type: 'success' | 'error'; text: string }>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Computed stats ──────────────────────────────────────────────────────────
  const appList = applications ?? [];
  const totalCount = appList.length;
  const submittedCount = appList.filter(
    (a) => getStatusKey(a.status) === 'submitted'
  ).length;
  const completedCount = appList.filter(
    (a) => getStatusKey(a.status) === 'completed'
  ).length;
  const pendingPaymentCount = appList.filter(
    (a) => getStatusKey(a.status) === 'paymentPending' || getStatusKey(a.status) === 'feeSet'
  ).length;

  // ── Force refresh ───────────────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Remove all cached data for this query so the next fetch is always fresh
      await queryClient.invalidateQueries({ queryKey: ['allApplications'] });
      await queryClient.removeQueries({ queryKey: ['allApplications'] });
      // Force a network request regardless of cache
      await refetch({ cancelRefetch: true });
    } catch {
      // silently ignore
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, refetch]);

  // ── Set fee ─────────────────────────────────────────────────────────────────
  const handleSetFee = async (appId: string) => {
    const feeStr = feeInputs[appId];
    if (!feeStr || isNaN(Number(feeStr)) || Number(feeStr) <= 0) {
      setActionMessages((prev) => ({
        ...prev,
        [appId]: { type: 'error', text: 'Please enter a valid fee amount.' },
      }));
      return;
    }

    const token = getAdminToken() ?? adminToken ?? '';
    if (!token) {
      setActionMessages((prev) => ({
        ...prev,
        [appId]: { type: 'error', text: 'Admin session expired. Please log in again.' },
      }));
      return;
    }

    try {
      const result = await setFeeMutation.mutateAsync({
        appId,
        fee: BigInt(Math.round(Number(feeStr))),
        adminToken: token,
      });
      if (result) {
        setActionMessages((prev) => ({
          ...prev,
          [appId]: { type: 'success', text: `Fee of ₹${feeStr} set successfully!` },
        }));
        setFeeInputs((prev) => ({ ...prev, [appId]: '' }));
        // Immediately refresh the list
        await queryClient.invalidateQueries({ queryKey: ['allApplications'] });
        await refetch({ cancelRefetch: true });
      } else {
        setActionMessages((prev) => ({
          ...prev,
          [appId]: { type: 'error', text: 'Could not set fee. Application may not be in submitted status.' },
        }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const displayMsg = msg.includes('Unauthorized')
        ? 'Unauthorized: Admin session may have expired. Please log out and log in again.'
        : `Error: ${msg}`;
      setActionMessages((prev) => ({
        ...prev,
        [appId]: { type: 'error', text: displayMsg },
      }));
    }
  };

  // ── Confirm payment ─────────────────────────────────────────────────────────
  const handleConfirmPayment = async (appId: string) => {
    const token = getAdminToken() ?? adminToken ?? '';
    try {
      const result = await confirmPaymentMutation.mutateAsync({ appId, adminToken: token });
      setActionMessages((prev) => ({
        ...prev,
        [appId]: result
          ? { type: 'success', text: 'Payment confirmed!' }
          : { type: 'error', text: 'Could not confirm payment.' },
      }));
      if (result) {
        await queryClient.invalidateQueries({ queryKey: ['allApplications'] });
        await refetch({ cancelRefetch: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setActionMessages((prev) => ({
        ...prev,
        [appId]: { type: 'error', text: msg.includes('Unauthorized') ? 'Unauthorized: Please log in again.' : `Error: ${msg}` },
      }));
    }
  };

  // ── Reject application ──────────────────────────────────────────────────────
  const handleReject = async (appId: string) => {
    const reason = rejectReasons[appId]?.trim();
    if (!reason) {
      setActionMessages((prev) => ({
        ...prev,
        [appId]: { type: 'error', text: 'Please enter a rejection reason.' },
      }));
      return;
    }
    const token = getAdminToken() ?? adminToken ?? '';
    try {
      const result = await rejectMutation.mutateAsync({ appId, reason, adminToken: token });
      setActionMessages((prev) => ({
        ...prev,
        [appId]: result
          ? { type: 'success', text: 'Application rejected.' }
          : { type: 'error', text: 'Could not reject application.' },
      }));
      if (result) {
        setRejectReasons((prev) => ({ ...prev, [appId]: '' }));
        await queryClient.invalidateQueries({ queryKey: ['allApplications'] });
        await refetch({ cancelRefetch: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setActionMessages((prev) => ({
        ...prev,
        [appId]: { type: 'error', text: `Error: ${msg}` },
      }));
    }
  };

  // ── Update stage ────────────────────────────────────────────────────────────
  const handleUpdateStage = async (appId: string) => {
    const stageStr = stageInputs[appId];
    const stageNum = Number(stageStr);
    if (stageStr === undefined || stageStr === '' || isNaN(stageNum) || stageNum < 0 || stageNum > 4) {
      setActionMessages((prev) => ({
        ...prev,
        [appId]: { type: 'error', text: 'Stage must be between 0 and 4.' },
      }));
      return;
    }
    const token = getAdminToken() ?? adminToken ?? '';
    try {
      const result = await updateStageMutation.mutateAsync({
        appId,
        stage: BigInt(stageNum),
        adminToken: token,
      });
      setActionMessages((prev) => ({
        ...prev,
        [appId]: result
          ? { type: 'success', text: `Stage updated to ${stageNum}.` }
          : { type: 'error', text: 'Could not update stage.' },
      }));
      if (result) {
        await queryClient.invalidateQueries({ queryKey: ['allApplications'] });
        await refetch({ cancelRefetch: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setActionMessages((prev) => ({
        ...prev,
        [appId]: { type: 'error', text: `Error: ${msg}` },
      }));
    }
  };

  const toggleExpand = (appId: string) => {
    setExpandedApp((prev) => (prev === appId ? null : appId));
  };

  const renderStatusBadge = (status: ApplicationStatus) => {
    const key = getStatusKey(status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[key] ?? 'bg-gray-100 text-gray-800'}`}>
        {STATUS_LABELS[key] ?? key}
      </span>
    );
  };

  const renderAppCard = (app: Application) => {
    const isExpanded = expandedApp === app.id;
    const statusKey = getStatusKey(app.status);
    const msg = actionMessages[app.id];
    const isMutating =
      (setFeeMutation.isPending && setFeeMutation.variables?.appId === app.id) ||
      (confirmPaymentMutation.isPending && confirmPaymentMutation.variables?.appId === app.id) ||
      (rejectMutation.isPending && rejectMutation.variables?.appId === app.id) ||
      (updateStageMutation.isPending && updateStageMutation.variables?.appId === app.id);

    return (
      <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-3">
        {/* Card header */}
        <button
          className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          onClick={() => toggleExpand(app.id)}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm truncate">{app.applicantName}</span>
              {renderStatusBadge(app.status)}
            </div>
            <div className="text-xs text-gray-500 mt-0.5 truncate">
              {app.service} · {app.phoneNumber} · ID: {app.id.slice(0, 8)}…
            </div>
          </div>
          <div className="ml-2 flex-shrink-0">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {/* Expanded details */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
            {/* Info */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Full ID:</span>
                <p className="font-mono text-xs break-all">{app.id}</p>
              </div>
              <div>
                <span className="text-gray-500">Stage:</span>
                <p className="font-semibold">{Number(app.stage)}</p>
              </div>
              {app.price !== undefined && app.price !== null && (
                <div>
                  <span className="text-gray-500">Fee:</span>
                  <p className="font-semibold text-green-700">₹{Number(app.price)}</p>
                </div>
              )}
              {app.transactionId && (
                <div>
                  <span className="text-gray-500">Transaction ID:</span>
                  <p className="font-mono text-xs break-all">{app.transactionId}</p>
                </div>
              )}
              {app.rejection && (
                <div className="col-span-2">
                  <span className="text-gray-500">Rejection Reason:</span>
                  <p className="text-red-600 text-xs">{app.rejection.reason}</p>
                </div>
              )}
            </div>

            {/* Documents */}
            {app.documents.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Documents ({app.documents.length})</p>
                <div className="flex flex-wrap gap-2">
                  {app.documents.map((doc, i) => (
                    <a
                      key={i}
                      href={doc.content.getDirectURL()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                    >
                      {doc.name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Action message */}
            {msg && (
              <div
                className={`flex items-start gap-2 p-2 rounded text-xs ${
                  msg.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <span>{msg.text}</span>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              {/* Set Fee */}
              {statusKey === 'submitted' && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Fee amount (₹)"
                    value={feeInputs[app.id] ?? ''}
                    onChange={(e) =>
                      setFeeInputs((prev) => ({ ...prev, [app.id]: e.target.value }))
                    }
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                    min="1"
                  />
                  <button
                    onClick={() => handleSetFee(app.id)}
                    disabled={isMutating}
                    className="bg-navy-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-800 disabled:opacity-50 flex items-center gap-1 transition-colors"
                  >
                    {isMutating ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />}
                    Set Price
                  </button>
                </div>
              )}

              {/* Confirm Payment */}
              {(statusKey === 'paymentPending' || statusKey === 'paymentVerifying') && (
                <button
                  onClick={() => handleConfirmPayment(app.id)}
                  disabled={isMutating}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {isMutating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  Confirm Payment
                </button>
              )}

              {/* Update Stage */}
              {statusKey !== 'rejected' && statusKey !== 'completed' && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Stage (0–4)"
                    value={stageInputs[app.id] ?? ''}
                    onChange={(e) =>
                      setStageInputs((prev) => ({ ...prev, [app.id]: e.target.value }))
                    }
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                    min="0"
                    max="4"
                  />
                  <button
                    onClick={() => handleUpdateStage(app.id)}
                    disabled={isMutating}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1 transition-colors"
                  >
                    {isMutating ? <Loader2 size={14} className="animate-spin" /> : null}
                    Update Stage
                  </button>
                </div>
              )}

              {/* Reject */}
              {statusKey !== 'rejected' && statusKey !== 'completed' && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Rejection reason"
                    value={rejectReasons[app.id] ?? ''}
                    onChange={(e) =>
                      setRejectReasons((prev) => ({ ...prev, [app.id]: e.target.value }))
                    }
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <button
                    onClick={() => handleReject(app.id)}
                    disabled={isMutating}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-1 transition-colors"
                  >
                    {isMutating ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-navy-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-md">
        <div>
          <h1 className="text-lg font-bold">Admin Dashboard</h1>
          <p className="text-navy-200 text-xs">Vijay Online Centre</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isFetching}
            className="flex items-center gap-1.5 bg-navy-700 hover:bg-navy-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 active:scale-95"
            aria-label="Refresh applications"
          >
            <RefreshCw
              size={15}
              className={isRefreshing || isFetching ? 'animate-spin' : ''}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors active:scale-95"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 text-center">
            <Users size={20} className="mx-auto text-blue-600 mb-1" />
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Loader2 size={20} className="animate-spin mx-auto" /> : totalCount}
            </div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 text-center">
            <Clock size={20} className="mx-auto text-orange-500 mb-1" />
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Loader2 size={20} className="animate-spin mx-auto" /> : submittedCount}
            </div>
            <div className="text-xs text-gray-500">New</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 text-center">
            <DollarSign size={20} className="mx-auto text-yellow-500 mb-1" />
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Loader2 size={20} className="animate-spin mx-auto" /> : pendingPaymentCount}
            </div>
            <div className="text-xs text-gray-500">Payment</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 text-center">
            <CheckCircle size={20} className="mx-auto text-green-600 mb-1" />
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? <Loader2 size={20} className="animate-spin mx-auto" /> : completedCount}
            </div>
            <div className="text-xs text-gray-500">Done</div>
          </div>
        </div>

        {/* Applications list */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800">
            Applications
            {isFetching && !isLoading && (
              <Loader2 size={14} className="inline ml-2 animate-spin text-navy-600" />
            )}
          </h2>
          <span className="text-xs text-gray-500">{totalCount} total</span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Loader2 size={32} className="animate-spin mb-3" />
            <p className="text-sm">Loading applications…</p>
          </div>
        ) : appList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Users size={40} className="mb-3 opacity-40" />
            <p className="text-sm">No applications yet.</p>
            <button
              onClick={handleRefresh}
              className="mt-3 text-navy-600 text-sm underline"
            >
              Tap to refresh
            </button>
          </div>
        ) : (
          <div>{appList.map(renderAppCard)}</div>
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
