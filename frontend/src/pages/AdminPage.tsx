import React, { useState } from 'react';
import { ApplicationStatus } from '../backend';
import type { Application } from '../backend';
import { ExternalBlob } from '../backend';
import {
  useAuthenticate,
  useGetApplicationsByStatus,
  useGetAllApplications,
  useSetApplicationFee,
  useRejectApplication,
  useConfirmPayment,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, LogIn, LogOut, Eye, FileText, CheckCircle, XCircle, DollarSign } from 'lucide-react';

// ─── Document Preview ─────────────────────────────────────────────────────────

function DocumentPreview({ doc }: { doc: { name: string; content: ExternalBlob } }) {
  const isImage =
    doc.name.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i) !== null;
  const url = doc.content.getDirectURL();

  if (isImage) {
    return (
      <div className="flex flex-col items-center gap-1">
        <a href={url} target="_blank" rel="noopener noreferrer">
          <img
            src={url}
            alt={doc.name}
            className="w-24 h-24 object-cover rounded border border-border cursor-pointer hover:opacity-80 transition-opacity"
          />
        </a>
        <span className="text-xs text-muted-foreground truncate max-w-[96px]">{doc.name}</span>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 text-primary hover:underline text-sm"
    >
      <FileText className="w-4 h-4" />
      <span className="truncate max-w-[120px]">{doc.name}</span>
    </a>
  );
}

// ─── Active Request Row ───────────────────────────────────────────────────────

function ActiveRequestRow({
  app,
  adminToken,
  onActionDone,
}: {
  app: Application;
  adminToken: string;
  onActionDone: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [fee, setFee] = useState('');
  const [feeError, setFeeError] = useState('');

  const rejectMutation = useRejectApplication();
  const setFeeMutation = useSetApplicationFee();

  const handleReject = async () => {
    if (!window.confirm(`Reject application for ${app.name}?`)) return;
    try {
      await rejectMutation.mutateAsync({ appId: app.id, adminToken });
      onActionDone();
    } catch (e: any) {
      alert('Failed to reject: ' + (e?.message ?? 'Unknown error'));
    }
  };

  const handleConfirm = () => {
    setConfirmed(true);
  };

  const handleSetFee = async () => {
    const feeNum = parseInt(fee, 10);
    if (isNaN(feeNum) || feeNum <= 0) {
      setFeeError('Please enter a valid fee amount');
      return;
    }
    setFeeError('');
    try {
      await setFeeMutation.mutateAsync({ appId: app.id, fee: BigInt(feeNum), adminToken });
      onActionDone();
    } catch (e: any) {
      alert('Failed to set fee: ' + (e?.message ?? 'Unknown error'));
    }
  };

  return (
    <Card className="mb-4 border border-border">
      <CardContent className="pt-4 pb-4">
        <div className="flex flex-col gap-3">
          {/* Header row */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-foreground">{app.name}</p>
              <p className="text-sm text-muted-foreground">{app.phoneNumber}</p>
              <p className="text-sm text-muted-foreground">{app.service}</p>
              <p className="text-xs text-muted-foreground font-mono">ID: {app.id}</p>
            </div>
            <div className="flex gap-2">
              {!confirmed && (
                <>
                  <Button
                    size="sm"
                    variant="default"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleConfirm}
                    disabled={rejectMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    CONFIRM
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleReject}
                    disabled={rejectMutation.isPending}
                  >
                    {rejectMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-1" />
                    )}
                    REJECT
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Documents */}
          {app.documents && app.documents.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <Eye className="w-3 h-3" /> Uploaded Documents ({app.documents.length})
              </p>
              <div className="flex flex-wrap gap-3">
                {app.documents.map((doc, idx) => (
                  <DocumentPreview key={idx} doc={doc} />
                ))}
              </div>
            </div>
          )}

          {/* Fee setting (shown after CONFIRM) */}
          {confirmed && (
            <div className="border-t border-border pt-3">
              <p className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Application Confirmed — Set Service Fee
              </p>
              <div className="flex gap-2 items-center flex-wrap">
                <Input
                  type="number"
                  placeholder="Fee in ₹"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="w-36"
                  min={1}
                />
                <Button
                  size="sm"
                  onClick={handleSetFee}
                  disabled={setFeeMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {setFeeMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : null}
                  Set Price & Generate QR
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmed(false)}
                  disabled={setFeeMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
              {feeError && <p className="text-destructive text-xs mt-1">{feeError}</p>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const map: Record<ApplicationStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    [ApplicationStatus.documentsUploaded]: { label: 'Docs Uploaded', variant: 'secondary' },
    [ApplicationStatus.awaitingPrice]: { label: 'Awaiting Price', variant: 'outline' },
    [ApplicationStatus.priceSet]: { label: 'Price Set', variant: 'default' },
    [ApplicationStatus.paymentPendingVerification]: { label: 'Payment Pending', variant: 'outline' },
    [ApplicationStatus.completed]: { label: 'Completed', variant: 'default' },
  };
  const { label, variant } = map[status] ?? { label: status, variant: 'outline' };
  return <Badge variant={variant}>{label}</Badge>;
}

// ─── Login Form ───────────────────────────────────────────────────────────────

function LoginForm({ onLogin }: { onLogin: (token: string) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const authMutation = useAuthenticate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const token = await authMutation.mutateAsync({ username, password });
      onLogin(token);
    } catch (err: any) {
      setError(err?.message ?? 'Login failed. Use vijay@123 / vijay@123456');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Admin Login</CardTitle>
          <p className="text-center text-muted-foreground text-sm">Vijay Online Centre</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Username</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="vijay@123"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="text-destructive text-sm bg-destructive/10 rounded p-2">{error}</p>
            )}
            <Button type="submit" disabled={authMutation.isPending} className="w-full">
              {authMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <LogIn className="w-4 h-4 mr-2" />
              )}
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const [adminToken, setAdminToken] = useState<string | null>(() =>
    sessionStorage.getItem('adminToken')
  );

  const handleLogin = (token: string) => {
    sessionStorage.setItem('adminToken', token);
    setAdminToken(token);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    setAdminToken(null);
  };

  if (!adminToken) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <AdminDashboard adminToken={adminToken} onLogout={handleLogout} />;
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

function AdminDashboard({ adminToken, onLogout }: { adminToken: string; onLogout: () => void }) {
  const activeQuery = useGetApplicationsByStatus(ApplicationStatus.documentsUploaded, adminToken);
  const paymentQuery = useGetApplicationsByStatus(
    ApplicationStatus.paymentPendingVerification,
    adminToken
  );
  const allQuery = useGetAllApplications(adminToken);
  const confirmPaymentMutation = useConfirmPayment();

  const handleDone = async (appId: string) => {
    try {
      await confirmPaymentMutation.mutateAsync({ appId, adminToken });
    } catch (e: any) {
      alert('Failed to confirm payment: ' + (e?.message ?? 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-xs text-muted-foreground">Vijay Online Centre</p>
        </div>
        <Button variant="outline" size="sm" onClick={onLogout}>
          <LogOut className="w-4 h-4 mr-1" />
          Logout
        </Button>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="active">
          <TabsList className="mb-6">
            <TabsTrigger value="active">
              Active Requests
              {activeQuery.data && activeQuery.data.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                  {activeQuery.data.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="payments">
              Payments to Verify
              {paymentQuery.data && paymentQuery.data.length > 0 && (
                <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-2 py-0.5">
                  {paymentQuery.data.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All Applications</TabsTrigger>
          </TabsList>

          {/* ── Active Requests Tab ── */}
          <TabsContent value="active">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Active Requests</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => activeQuery.refetch()}
                disabled={activeQuery.isFetching}
              >
                {activeQuery.isFetching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>

            {activeQuery.isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {activeQuery.isError && (
              <div className="text-destructive bg-destructive/10 rounded p-4">
                Error loading applications. Please check your session and try again.
              </div>
            )}

            {!activeQuery.isLoading && activeQuery.data?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No active requests at the moment.
              </div>
            )}

            {activeQuery.data?.map((app) => (
              <ActiveRequestRow
                key={app.id}
                app={app}
                adminToken={adminToken}
                onActionDone={() => activeQuery.refetch()}
              />
            ))}
          </TabsContent>

          {/* ── Payments to Verify Tab ── */}
          <TabsContent value="payments">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Payments to Verify</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => paymentQuery.refetch()}
                disabled={paymentQuery.isFetching}
              >
                {paymentQuery.isFetching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>

            {paymentQuery.isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {paymentQuery.isError && (
              <div className="text-destructive bg-destructive/10 rounded p-4">
                Error loading payment verifications.
              </div>
            )}

            {!paymentQuery.isLoading && paymentQuery.data?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No payments pending verification.
              </div>
            )}

            {paymentQuery.data?.map((app) => (
              <Card key={app.id} className="mb-4 border border-border">
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{app.name}</p>
                      <p className="text-sm text-muted-foreground">{app.phoneNumber}</p>
                      <p className="text-sm text-muted-foreground">{app.service}</p>
                      <p className="text-xs text-muted-foreground font-mono">ID: {app.id}</p>
                      {app.price !== undefined && app.price !== null && (
                        <p className="text-sm font-semibold text-green-700 mt-1">
                          Amount: ₹{app.price.toString()}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <StatusBadge status={app.status} />
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleDone(app.id)}
                        disabled={confirmPaymentMutation.isPending}
                      >
                        {confirmPaymentMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        )}
                        DONE
                      </Button>
                    </div>
                  </div>

                  {/* Documents for payment verification */}
                  {app.documents && app.documents.length > 0 && (
                    <div className="mt-3 border-t border-border pt-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">
                        Documents
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {app.documents.map((doc, idx) => (
                          <DocumentPreview key={idx} doc={doc} />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ── All Applications Tab ── */}
          <TabsContent value="all">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">All Applications</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => allQuery.refetch()}
                disabled={allQuery.isFetching}
              >
                {allQuery.isFetching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>

            {allQuery.isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {allQuery.isError && (
              <div className="text-destructive bg-destructive/10 rounded p-4">
                Error loading all applications.
              </div>
            )}

            {!allQuery.isLoading && allQuery.data?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No applications found.
              </div>
            )}

            {allQuery.data && allQuery.data.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Fee (₹)</TableHead>
                      <TableHead>Docs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allQuery.data.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-mono text-xs">{app.id.slice(0, 8)}…</TableCell>
                        <TableCell>{app.name}</TableCell>
                        <TableCell>{app.phoneNumber}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{app.service}</TableCell>
                        <TableCell>
                          <StatusBadge status={app.status} />
                        </TableCell>
                        <TableCell>
                          {app.price !== undefined && app.price !== null
                            ? `₹${app.price.toString()}`
                            : '—'}
                        </TableCell>
                        <TableCell>{app.documents?.length ?? 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
