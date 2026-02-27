import { useState } from 'react';
import { Upload, FileText, Clock, CheckCircle, XCircle, AlertCircle, Download, Trash2, FolderOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useApplications, useDocuments, useUploadDocument, type Application, type Service } from '../hooks/useQueries';
import { type Page } from '../App';

interface DashboardPageProps {
  userId: string;
  navigate: (page: Page, service?: Service) => void;
}

const STATUS_CONFIG = {
  Pending: { label: 'Pending', labelHindi: 'लंबित', icon: Clock, color: 'oklch(0.75 0.15 60)', bg: 'oklch(0.75 0.15 60 / 0.1)' },
  InProgress: { label: 'In Progress', labelHindi: 'प्रक्रिया में', icon: AlertCircle, color: 'oklch(0.45 0.18 250)', bg: 'oklch(0.45 0.18 250 / 0.1)' },
  Completed: { label: 'Completed', labelHindi: 'पूर्ण', icon: CheckCircle, color: 'oklch(0.55 0.18 145)', bg: 'oklch(0.55 0.18 145 / 0.1)' },
  Rejected: { label: 'Rejected', labelHindi: 'अस्वीकृत', icon: XCircle, color: 'oklch(0.577 0.245 27.325)', bg: 'oklch(0.577 0.245 27.325 / 0.1)' },
};

export default function DashboardPage({ userId, navigate }: DashboardPageProps) {
  const { data: applications = [], isLoading: appsLoading } = useApplications(userId);
  const { data: documents = [], isLoading: docsLoading } = useDocuments(userId);
  const uploadDocument = useUploadDocument();
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const handleFileUpload = async (file: File, applicationId?: string) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      try {
        await uploadDocument.mutateAsync({
          userId,
          applicationId,
          fileName: file.name,
          fileData: base64,
          fileType: file.type,
        });
        toast.success(`${file.name} uploaded successfully!`);
      } catch {
        toast.error('Upload failed. Please try again.');
      }
    };
    reader.readAsDataURL(file);
  };

  const downloadDocument = (doc: { fileName: string; fileData: string; fileType: string }) => {
    const blob = new Blob([Uint8Array.from(atob(doc.fileData), c => c.charCodeAt(0))], { type: doc.fileType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'Pending').length,
    inProgress: applications.filter(a => a.status === 'InProgress').length,
    completed: applications.filter(a => a.status === 'Completed').length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl md:text-3xl mb-1">My Dashboard</h1>
        <p className="text-muted-foreground text-sm">मेरा डैशबोर्ड • Track your applications and documents</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', labelHindi: 'कुल', value: stats.total, color: 'oklch(0.45 0.18 250)' },
          { label: 'Pending', labelHindi: 'लंबित', value: stats.pending, color: 'oklch(0.75 0.15 60)' },
          { label: 'In Progress', labelHindi: 'प्रक्रिया में', value: stats.inProgress, color: 'oklch(0.45 0.18 250)' },
          { label: 'Completed', labelHindi: 'पूर्ण', value: stats.completed, color: 'oklch(0.55 0.18 145)' },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className="font-heading font-bold text-3xl" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-sm font-medium">{stat.label}</p>
            <p className="text-xs text-muted-foreground">{stat.labelHindi}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="applications">
        <TabsList className="mb-6 w-full sm:w-auto">
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <FileText size={15} />
            My Applications
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FolderOpen size={15} />
            Document Vault
          </TabsTrigger>
        </TabsList>

        {/* Applications Tab */}
        <TabsContent value="applications">
          {appsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-muted rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-xl">
              <FileText size={48} className="mx-auto mb-4 text-muted-foreground/40" />
              <h3 className="font-semibold text-lg mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground text-sm mb-6">अभी तक कोई आवेदन नहीं है।</p>
              <button
                onClick={() => navigate('home')}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'oklch(0.45 0.18 250)' }}
              >
                Browse Services
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map(app => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  onUpload={(file) => handleFileUpload(file, app.id)}
                  isUploading={uploadingFor === app.id && uploadDocument.isPending}
                  setUploadingFor={setUploadingFor}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <div className="mb-4">
            <label className="flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-primary"
              style={{ borderColor: 'oklch(0.45 0.18 250 / 0.4)' }}>
              <Upload size={20} style={{ color: 'oklch(0.45 0.18 250)' }} />
              <div>
                <p className="font-medium text-sm">Upload Document to Vault</p>
                <p className="text-xs text-muted-foreground">PDF, JPG, PNG up to 5MB • दस्तावेज़ अपलोड करें</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                  e.target.value = '';
                }}
              />
            </label>
          </div>

          {docsLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-16 bg-card border border-border rounded-xl animate-pulse" />)}
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <FolderOpen size={40} className="mx-auto mb-3 text-muted-foreground/40" />
              <p className="font-medium">Document Vault is Empty</p>
              <p className="text-sm text-muted-foreground">Upload your documents above / ऊपर दस्तावेज़ अपलोड करें</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map(doc => (
                <div key={doc.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'oklch(0.45 0.18 250 / 0.1)' }}>
                    <FileText size={18} style={{ color: 'oklch(0.45 0.18 250)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{doc.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}
                      {doc.applicationId && ` • ${doc.applicationId}`}
                    </p>
                  </div>
                  <button
                    onClick={() => downloadDocument(doc)}
                    className="p-2 rounded-lg transition-colors hover:bg-muted"
                    title="Download"
                  >
                    <Download size={16} className="text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ApplicationCard({
  app,
  onUpload,
  isUploading,
  setUploadingFor,
}: {
  app: Application;
  onUpload: (file: File) => void;
  isUploading: boolean;
  setUploadingFor: (id: string | null) => void;
}) {
  const config = STATUS_CONFIG[app.status];
  const StatusIcon = config.icon;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-semibold text-base">{app.serviceName}</h3>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{app.id}</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: config.bg, color: config.color }}>
              <StatusIcon size={12} />
              {config.label}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Applicant</p>
              <p className="font-medium">{app.applicantName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-medium">{app.phone}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fee Paid</p>
              <p className="font-bold" style={{ color: 'oklch(0.55 0.18 145)' }}>₹{app.fee}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Submitted</p>
              <p className="font-medium">{new Date(app.submittedAt).toLocaleDateString('en-IN')}</p>
            </div>
            {app.adminNotes && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Admin Notes</p>
                <p className="text-sm">{app.adminNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload documents for this application */}
      <div className="mt-4 pt-4 border-t border-border">
        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
          <Upload size={14} />
          {isUploading ? 'Uploading...' : 'Upload documents for this application'}
          <input
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            disabled={isUploading}
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                setUploadingFor(app.id);
                onUpload(file);
              }
              e.target.value = '';
            }}
          />
        </label>
      </div>
    </div>
  );
}
