import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  RefreshCw, LogOut, Users, CheckCircle, Clock, Edit2, Save, X,
  Search, AlertCircle, IndianRupee, Receipt, ExternalLink
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import {
  useAllCustomers,
  useUpdateCustomerStatus,
  useUpdateCustomerAmount,
  useMarkPaymentSuccess,
} from '../hooks/useQueries';
import type { Customer } from '../backend';

interface EditState {
  id: number;
  status: string;
  amount: string;
}

export default function AdminPage() {
  const { logout, isAdminAuthenticated } = useAdminAuth();
  const queryClient = useQueryClient();
  const {
    data: customers = [],
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useAllCustomers();
  const updateStatus = useUpdateCustomerStatus();
  const updateAmount = useUpdateCustomerAmount();
  const markPaid = useMarkPaymentSuccess();

  const [editState, setEditState] = useState<EditState | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [filterPayment, setFilterPayment] = useState<'all' | 'pending' | 'paid'>('all');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [markingPaidId, setMarkingPaidId] = useState<number | null>(null);

  const isAdmin = isAdminAuthenticated();

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === 'active').length;
  const completedCustomers = customers.filter((c) => c.status === 'completed').length;
  const paidCustomers = customers.filter((c) => c.paymentStatus === 'success').length;

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobile.includes(searchQuery) ||
      c.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || c.status === filterStatus;
    const matchesPayment =
      filterPayment === 'all' ||
      (filterPayment === 'paid' && c.paymentStatus === 'success') ||
      (filterPayment === 'pending' && c.paymentStatus !== 'success');
    return matchesSearch && matchesFilter && matchesPayment;
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['customers'] });
    await refetch();
  };

  const handleEdit = (customer: Customer) => {
    if (!isAdmin) return;
    setEditState({
      id: Number(customer.id),
      status: customer.status,
      amount: String(customer.amount),
    });
    setSaveError(null);
  };

  const handleCancelEdit = () => {
    setEditState(null);
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!editState || !isAdmin) return;
    setSaveError(null);
    try {
      await updateStatus.mutateAsync({ id: editState.id, status: editState.status });
      const amountValue = parseFloat(editState.amount) || 0;
      await updateAmount.mutateAsync({ id: editState.id, amount: amountValue });
      setEditState(null);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save changes. Please try again.');
    }
  };

  const handleMarkPaid = async (customerId: number) => {
    if (!isAdmin) return;
    setMarkingPaidId(customerId);
    try {
      await markPaid.mutateAsync(customerId);
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to mark payment as successful.');
    } finally {
      setMarkingPaidId(null);
    }
  };

  const isSaving = updateStatus.isPending || updateAmount.isPending;

  const formatDate = (ts: bigint) => {
    const ms = Number(ts) / 1_000_000;
    if (ms <= 0) return '—';
    return new Date(ms).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (ts: bigint) => {
    const ms = Number(ts) / 1_000_000;
    if (ms <= 0) return '—';
    return new Date(ms).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Header */}
      <header className="bg-navy-800 border-b border-navy-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/logo-vijay.dim_256x256.png"
              alt="Vijay Online Centre"
              className="h-10 w-10 rounded-full object-cover border-2 border-saffron/30"
            />
            <div>
              <h1 className="text-white font-bold text-lg leading-tight font-display">
                Vijay Online Centre
              </h1>
              <p className="text-navy-300 text-xs">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading || isRefetching}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-saffron text-white rounded-lg text-sm font-medium hover:bg-saffron-dark transition-colors disabled:opacity-60"
            >
              <RefreshCw size={14} className={isLoading || isRefetching ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">
                {isRefetching ? 'Refreshing...' : 'Refresh'}
              </span>
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-700 text-navy-200 rounded-lg text-sm hover:bg-navy-600 transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-navy-800 rounded-xl p-4 border border-navy-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-navy-300 text-xs">Total</p>
                <p className="text-white text-2xl font-bold font-display">
                  {isLoading ? '...' : totalCustomers}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-navy-800 rounded-xl p-4 border border-navy-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Clock size={20} className="text-amber-400" />
              </div>
              <div>
                <p className="text-navy-300 text-xs">Active</p>
                <p className="text-white text-2xl font-bold font-display">
                  {isLoading ? '...' : activeCustomers}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-navy-800 rounded-xl p-4 border border-navy-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle size={20} className="text-green-400" />
              </div>
              <div>
                <p className="text-navy-300 text-xs">Completed</p>
                <p className="text-white text-2xl font-bold font-display">
                  {isLoading ? '...' : completedCustomers}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-navy-800 rounded-xl p-4 border border-navy-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <IndianRupee size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-navy-300 text-xs">Paid</p>
                <p className="text-white text-2xl font-bold font-display">
                  {isLoading ? '...' : paidCustomers}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              type="text"
              placeholder="Search by name, mobile, service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-navy-400 text-sm focus:outline-none focus:border-saffron"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filterStatus === f
                    ? 'bg-saffron text-white'
                    : 'bg-navy-800 text-navy-300 border border-navy-700 hover:bg-navy-700'
                }`}
              >
                {f}
              </button>
            ))}
            <div className="w-px bg-navy-700 hidden sm:block" />
            {(['all', 'pending', 'paid'] as const).map((f) => (
              <button
                key={`pay-${f}`}
                onClick={() => setFilterPayment(f)}
                className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filterPayment === f
                    ? f === 'paid'
                      ? 'bg-emerald-600 text-white'
                      : f === 'pending'
                      ? 'bg-amber-600 text-white'
                      : 'bg-saffron text-white'
                    : 'bg-navy-800 text-navy-300 border border-navy-700 hover:bg-navy-700'
                }`}
              >
                {f === 'all' ? 'All Pay' : f === 'paid' ? '✅ Paid' : '⏳ Pending'}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {isError && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            Failed to load customers. Please click Refresh to try again.
          </div>
        )}

        {/* Save Error */}
        {saveError && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {saveError}
            <button onClick={() => setSaveError(null)} className="ml-auto">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-navy-800 rounded-xl border border-navy-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-700 bg-navy-900/50">
                  <th className="text-left px-4 py-3 text-navy-300 font-medium">#</th>
                  <th className="text-left px-4 py-3 text-navy-300 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-navy-300 font-medium">Mobile</th>
                  <th className="text-left px-4 py-3 text-navy-300 font-medium">Service</th>
                  <th className="text-left px-4 py-3 text-navy-300 font-medium">Amount (₹)</th>
                  <th className="text-left px-4 py-3 text-navy-300 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-navy-300 font-medium">Payment</th>
                  <th className="text-left px-4 py-3 text-navy-300 font-medium">Date</th>
                  {isAdmin && (
                    <th className="text-left px-4 py-3 text-navy-300 font-medium">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={isAdmin ? 9 : 8} className="text-center py-12 text-navy-400">
                      <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
                      Loading customers...
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 9 : 8} className="text-center py-12 text-navy-400">
                      {searchQuery || filterStatus !== 'all' || filterPayment !== 'all'
                        ? 'No customers match your search.'
                        : 'No customers yet. Share the form link to get started!'}
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer, idx) => {
                    const isEditing = editState?.id === Number(customer.id);
                    const isPaid = customer.paymentStatus === 'success';
                    const isMarkingThisOne = markingPaidId === Number(customer.id);

                    return (
                      <tr
                        key={Number(customer.id)}
                        className="border-b border-navy-700/50 hover:bg-navy-700/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-navy-400">{idx + 1}</td>
                        <td className="px-4 py-3 text-white font-medium">{customer.name}</td>
                        <td className="px-4 py-3 text-navy-200">{customer.mobile}</td>
                        <td className="px-4 py-3 text-navy-200 max-w-[120px] truncate">{customer.service}</td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editState.amount}
                              onChange={(e) =>
                                setEditState((prev) =>
                                  prev ? { ...prev, amount: e.target.value } : null
                                )
                              }
                              className="w-24 px-2 py-1 bg-navy-900 border border-saffron/50 rounded-lg text-white text-sm focus:outline-none focus:border-saffron"
                              min="0"
                              step="0.01"
                            />
                          ) : (
                            <span className="text-saffron font-semibold">
                              ₹{Number(customer.amount).toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <select
                              value={editState.status}
                              onChange={(e) =>
                                setEditState((prev) =>
                                  prev ? { ...prev, status: e.target.value } : null
                                )
                              }
                              className="px-2 py-1 bg-navy-900 border border-saffron/50 rounded-lg text-white text-sm focus:outline-none focus:border-saffron"
                            >
                              <option value="active">Active</option>
                              <option value="completed">Completed</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                customer.status === 'completed'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-amber-500/20 text-amber-400'
                              }`}
                            >
                              {customer.status === 'completed' ? 'Completed' : 'Active'}
                            </span>
                          )}
                        </td>
                        {/* Payment Status Column */}
                        <td className="px-4 py-3">
                          {isPaid ? (
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                                ✅ Paid
                              </span>
                              {customer.receiptId && (
                                <span className="text-xs text-navy-400 font-mono">
                                  {customer.receiptId}
                                </span>
                              )}
                              {customer.paymentDate && (
                                <span className="text-xs text-navy-500">
                                  {formatDateTime(customer.paymentDate)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                              ⏳ Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-navy-400 text-xs">
                          {formatDate(customer.createdAt)}
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={handleSave}
                                  disabled={isSaving}
                                  className="p-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors disabled:opacity-60"
                                  title="Save"
                                >
                                  {isSaving ? (
                                    <RefreshCw size={13} className="animate-spin" />
                                  ) : (
                                    <Save size={13} />
                                  )}
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  disabled={isSaving}
                                  className="p-1.5 bg-navy-700 hover:bg-navy-600 text-navy-300 rounded-lg transition-colors disabled:opacity-60"
                                  title="Cancel"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleEdit(customer)}
                                  className="p-1.5 bg-navy-700 hover:bg-saffron/20 text-navy-300 hover:text-saffron rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 size={13} />
                                </button>
                                {!isPaid && (
                                  <button
                                    onClick={() => handleMarkPaid(Number(customer.id))}
                                    disabled={isMarkingThisOne}
                                    className="flex items-center gap-1 px-2 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-60"
                                    title="Mark as Paid"
                                  >
                                    {isMarkingThisOne ? (
                                      <RefreshCw size={11} className="animate-spin" />
                                    ) : (
                                      <IndianRupee size={11} />
                                    )}
                                    <span className="hidden sm:inline">
                                      {isMarkingThisOne ? 'Marking...' : 'Mark Paid'}
                                    </span>
                                  </button>
                                )}
                                {isPaid && customer.receiptId && (
                                  <a
                                    href={`/receipt?customerId=${Number(customer.id)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-2 py-1 bg-navy-700 hover:bg-navy-600 text-navy-300 hover:text-white rounded-lg text-xs transition-colors"
                                    title="View Receipt"
                                  >
                                    <Receipt size={11} />
                                    <span className="hidden sm:inline">Receipt</span>
                                  </a>
                                )}
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {!isLoading && filteredCustomers.length > 0 && (
            <div className="px-4 py-3 border-t border-navy-700 text-navy-400 text-xs">
              Showing {filteredCustomers.length} of {totalCustomers} customers
              {isRefetching && (
                <span className="ml-2 text-saffron">
                  <RefreshCw size={10} className="inline animate-spin mr-1" />
                  Syncing...
                </span>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
