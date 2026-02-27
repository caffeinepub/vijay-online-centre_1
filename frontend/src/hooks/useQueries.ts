import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ApplicationStatus } from '../backend';
import type { Application as BackendApplication, UserProfile, Document as BackendDocument } from '../backend';
import { ExternalBlob } from '../backend';

// ─── Legacy local types (used by HomePage, DashboardPage, ChatbotWidget, App) ─

export interface Service {
  id: string;
  name: string;
  nameHindi: string;
  category: 'GovtID' | 'Certificate' | 'Welfare' | 'Finance' | 'Travel';
  icon: string;
  description: string;
  fee: number;
}

export interface Application {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  applicantName: string;
  phone: string;
  notes: string;
  status: 'Pending' | 'InProgress' | 'Completed' | 'Rejected';
  submittedAt: string;
  updatedAt: string;
  adminNotes?: string;
  fee: number;
}

export interface Document {
  id: string;
  userId: string;
  applicationId?: string;
  fileName: string;
  fileData: string; // base64
  fileType: string;
  uploadedAt: string;
}

// ─── Static service catalogue ─────────────────────────────────────────────────

export const ALL_SERVICES: Service[] = [
  // Govt IDs
  { id: 'aadhar-correction', name: 'Aadhar Correction/Link', nameHindi: 'आधार सुधार/लिंक', category: 'GovtID', icon: '🪪', description: 'Aadhar card correction and mobile linking', fee: 100 },
  { id: 'pan-card', name: 'PAN Card', nameHindi: 'पैन कार्ड', category: 'GovtID', icon: '💳', description: 'New PAN card application and correction', fee: 150 },
  { id: 'voter-id', name: 'Voter ID', nameHindi: 'वोटर आईडी', category: 'GovtID', icon: '🗳️', description: 'Voter ID card application and correction', fee: 100 },
  { id: 'ration-card', name: 'Ration Card', nameHindi: 'राशन कार्ड', category: 'GovtID', icon: '📋', description: 'New ration card and correction services', fee: 200 },
  { id: 'shramik-card', name: 'Shramik Card', nameHindi: 'श्रमिक कार्ड', category: 'GovtID', icon: '👷', description: 'Labour card registration and renewal', fee: 150 },
  // Certificates
  { id: 'income-certificate', name: 'Income Certificate', nameHindi: 'आय प्रमाण पत्र', category: 'Certificate', icon: '📄', description: 'Income/Aay certificate for government schemes', fee: 100 },
  { id: 'caste-certificate', name: 'Caste Certificate', nameHindi: 'जाति प्रमाण पत्र', category: 'Certificate', icon: '📜', description: 'Caste/Jati certificate application', fee: 100 },
  { id: 'niwas-certificate', name: 'Niwas Certificate', nameHindi: 'निवास प्रमाण पत्र', category: 'Certificate', icon: '🏠', description: 'Residence/Domicile certificate', fee: 100 },
  { id: 'character-certificate', name: 'Character Certificate', nameHindi: 'चरित्र प्रमाण पत्र', category: 'Certificate', icon: '✅', description: 'Character certificate from local authority', fee: 100 },
  { id: 'birth-death-certificate', name: 'Birth & Death Certificate', nameHindi: 'जन्म/मृत्यु प्रमाण पत्र', category: 'Certificate', icon: '📑', description: 'Birth and death certificate registration', fee: 150 },
  // Welfare
  { id: 'vridha-pension', name: 'Vridha Pension', nameHindi: 'वृद्धा पेंशन', category: 'Welfare', icon: '👴', description: 'Old age pension scheme registration', fee: 200 },
  { id: 'vidhwa-pension', name: 'Vidhwa Pension', nameHindi: 'विधवा पेंशन', category: 'Welfare', icon: '👩', description: 'Widow pension scheme registration', fee: 200 },
  { id: 'shadi-anudan', name: 'Shadi Anudan', nameHindi: 'शादी अनुदान', category: 'Welfare', icon: '💒', description: 'Marriage grant scheme application', fee: 250 },
  { id: 'scholarship', name: 'Scholarship', nameHindi: 'छात्रवृत्ति', category: 'Welfare', icon: '🎓', description: 'Government scholarship application', fee: 150 },
  { id: 'sumangala-yojana', name: 'Sumangala Yojana', nameHindi: 'सुमंगला योजना', category: 'Welfare', icon: '👧', description: 'Kanya Sumangala Yojana registration', fee: 200 },
  // Finance
  { id: 'itr-filing', name: 'ITR Filing', nameHindi: 'आईटीआर फाइलिंग', category: 'Finance', icon: '📊', description: 'Income tax return filing service', fee: 500 },
  { id: 'gst-registration', name: 'GST Registration/Return', nameHindi: 'जीएसटी पंजीकरण/रिटर्न', category: 'Finance', icon: '🧾', description: 'GST registration and return filing', fee: 500 },
  { id: 'pf-withdrawal', name: 'PF Withdrawal', nameHindi: 'पीएफ निकासी', category: 'Finance', icon: '💰', description: 'Provident fund withdrawal assistance', fee: 300 },
  { id: 'money-transfer', name: 'Money Transfer', nameHindi: 'मनी ट्रांसफर', category: 'Finance', icon: '💸', description: 'Domestic money transfer services', fee: 50 },
  // Travel & General
  { id: 'bijli-bill', name: 'Bijli Bill', nameHindi: 'बिजली बिल', category: 'Travel', icon: '⚡', description: 'Electricity bill payment and new connection', fee: 30 },
  { id: 'railway-tickets', name: 'Railway Tickets', nameHindi: 'रेलवे टिकट', category: 'Travel', icon: '🚂', description: 'Train ticket booking service', fee: 50 },
  { id: 'pvc-printing', name: 'PVC Printing', nameHindi: 'पीवीसी प्रिंटिंग', category: 'Travel', icon: '🖨️', description: 'PVC card printing services', fee: 100 },
];

// ─── localStorage helpers ─────────────────────────────────────────────────────

function getStoredApplications(): Application[] {
  try {
    const data = localStorage.getItem('vijay_applications');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function getStoredDocuments(): Document[] {
  try {
    const data = localStorage.getItem('vijay_documents');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveDocuments(docs: Document[]) {
  localStorage.setItem('vijay_documents', JSON.stringify(docs));
}

function getStoredFees(): Record<string, number> {
  try {
    const data = localStorage.getItem('vijay_fees');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

// ─── Legacy hooks (used by HomePage, DashboardPage, ChatbotWidget) ────────────

export function useServices() {
  return useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const storedFees = getStoredFees();
      return ALL_SERVICES.map((s) => ({
        ...s,
        fee: storedFees[s.id] !== undefined ? storedFees[s.id] : s.fee,
      }));
    },
    staleTime: 1000 * 60,
  });
}

export function useApplications(userId?: string) {
  return useQuery<Application[]>({
    queryKey: ['applications', userId],
    queryFn: async () => {
      const apps = getStoredApplications();
      if (userId) return apps.filter((a) => a.userId === userId);
      return apps;
    },
    staleTime: 0,
  });
}

export function useDocuments(userId?: string) {
  return useQuery<Document[]>({
    queryKey: ['documents', userId],
    queryFn: async () => {
      const docs = getStoredDocuments();
      if (userId) return docs.filter((d) => d.userId === userId);
      return docs;
    },
    staleTime: 0,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (doc: Omit<Document, 'id' | 'uploadedAt'>) => {
      const docs = getStoredDocuments();
      const newDoc: Document = {
        ...doc,
        id: `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        uploadedAt: new Date().toISOString(),
      };
      docs.push(newDoc);
      saveDocuments(docs);
      return newDoc;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useChatbot() {
  return useMutation({
    mutationFn: async (message: string): Promise<string> => {
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));
      return getChatbotResponse(message);
    },
  });
}

function getChatbotResponse(message: string): string {
  const msg = message.toLowerCase().trim();
  const isHindi = /[\u0900-\u097F]/.test(message);

  const appMatch = msg.match(/app-\d+-[a-z0-9]+/i);
  if (appMatch) {
    const apps = getStoredApplications();
    const app = apps.find((a) => a.id.toLowerCase() === appMatch[0].toLowerCase());
    if (app) {
      if (isHindi)
        return `आपका आवेदन ${app.id} की स्थिति: **${app.status}** है। सेवा: ${app.serviceName}। अंतिम अपडेट: ${new Date(app.updatedAt).toLocaleDateString('hi-IN')}`;
      return `Your application ${app.id} status is: **${app.status}**. Service: ${app.serviceName}. Last updated: ${new Date(app.updatedAt).toLocaleDateString()}`;
    }
    if (isHindi) return `आवेदन ${appMatch[0]} नहीं मिला। कृपया सही आवेदन ID दर्ज करें।`;
    return `Application ${appMatch[0]} not found. Please check your application ID.`;
  }

  if (msg.includes('aadhar') || msg.includes('आधार')) {
    if (isHindi)
      return '**आधार सुधार के लिए दस्तावेज:**\n• पुराना आधार कार्ड\n• मोबाइल नंबर\n• जन्म प्रमाण पत्र (यदि DOB सुधार हो)\n• पते का प्रमाण\n\nशुल्क: ₹100';
    return '**Documents for Aadhar Correction:**\n• Old Aadhar card\n• Mobile number\n• Birth certificate (if DOB correction)\n• Address proof\n\nFee: ₹100';
  }
  if (msg.includes('pan') || msg.includes('पैन')) {
    if (isHindi)
      return '**पैन कार्ड के लिए दस्तावेज:**\n• आधार कार्ड\n• पासपोर्ट साइज फोटो\n• जन्म प्रमाण पत्र\n• पते का प्रमाण\n\nशुल्क: ₹150';
    return '**Documents for PAN Card:**\n• Aadhar card\n• Passport size photo\n• Date of birth proof\n• Address proof\n\nFee: ₹150';
  }
  if (msg.includes('voter') || msg.includes('वोटर')) {
    if (isHindi)
      return '**वोटर आईडी के लिए दस्तावेज:**\n• आधार कार्ड\n• पासपोर्ट साइज फोटो\n• पते का प्रमाण\n• आयु प्रमाण (18+ वर्ष)\n\nशुल्क: ₹100';
    return '**Documents for Voter ID:**\n• Aadhar card\n• Passport size photo\n• Address proof\n• Age proof (18+ years)\n\nFee: ₹100';
  }
  if (msg.includes('income') || msg.includes('aay') || msg.includes('आय')) {
    if (isHindi)
      return '**आय प्रमाण पत्र के लिए दस्तावेज:**\n• आधार कार्ड\n• राशन कार्ड\n• स्व-घोषणा पत्र\n• पासपोर्ट साइज फोटो\n\nशुल्क: ₹100';
    return '**Documents for Income Certificate:**\n• Aadhar card\n• Ration card\n• Self-declaration form\n• Passport size photo\n\nFee: ₹100';
  }
  if (msg.includes('caste') || msg.includes('jati') || msg.includes('जाति')) {
    if (isHindi)
      return '**जाति प्रमाण पत्र के लिए दस्तावेज:**\n• आधार कार्ड\n• राशन कार्ड\n• पुराना जाति प्रमाण पत्र (यदि हो)\n• पासपोर्ट साइज फोटो\n\nशुल्क: ₹100';
    return '**Documents for Caste Certificate:**\n• Aadhar card\n• Ration card\n• Old caste certificate (if available)\n• Passport size photo\n\nFee: ₹100';
  }
  if (msg.includes('pension') || msg.includes('पेंशन')) {
    if (isHindi)
      return '**पेंशन योजना के लिए दस्तावेज:**\n• आधार कार्ड\n• बैंक पासबुक\n• आयु प्रमाण पत्र\n• आय प्रमाण पत्र\n• पासपोर्ट साइज फोटो\n\nशुल्क: ₹200';
    return '**Documents for Pension Scheme:**\n• Aadhar card\n• Bank passbook\n• Age certificate\n• Income certificate\n• Passport size photo\n\nFee: ₹200';
  }
  if (msg.includes('itr') || msg.includes('tax') || msg.includes('टैक्स')) {
    if (isHindi)
      return '**आईटीआर फाइलिंग के लिए दस्तावेज:**\n• पैन कार्ड\n• आधार कार्ड\n• फॉर्म 16\n• बैंक स्टेटमेंट\n• निवेश प्रमाण\n\nशुल्क: ₹500';
    return '**Documents for ITR Filing:**\n• PAN card\n• Aadhar card\n• Form 16\n• Bank statement\n• Investment proofs\n\nFee: ₹500';
  }
  if (
    msg.includes('contact') ||
    msg.includes('phone') ||
    msg.includes('संपर्क') ||
    msg.includes('फोन')
  ) {
    if (isHindi)
      return '📞 **संपर्क करें:**\nफोन: +91 81730 64549\nWhatsApp: wa.me/918173064549\n\nसोमवार-शनिवार: सुबह 9 बजे - शाम 7 बजे';
    return '📞 **Contact Us:**\nPhone: +91 81730 64549\nWhatsApp: wa.me/918173064549\n\nMon-Sat: 9 AM - 7 PM';
  }
  if (
    msg.includes('track') ||
    msg.includes('status') ||
    msg.includes('ट्रैक') ||
    msg.includes('स्थिति')
  ) {
    if (isHindi)
      return 'अपने आवेदन की स्थिति जानने के लिए अपना **Application ID** (जैसे APP-1234567-ABCDEF) यहाँ टाइप करें।\n\nया डैशबोर्ड में "My Applications" टैब देखें।';
    return 'To track your application, type your **Application ID** (e.g., APP-1234567-ABCDEF) here.\n\nOr check the "My Applications" tab in your Dashboard.';
  }
  if (
    msg.includes('service') ||
    msg.includes('सेवा') ||
    msg.includes('help') ||
    msg.includes('मदद')
  ) {
    if (isHindi)
      return '**हमारी सेवाएं:**\n🪪 सरकारी आईडी (आधार, पैन, वोटर)\n📄 प्रमाण पत्र (आय, जाति, निवास)\n👴 कल्याण योजनाएं (पेंशन, शादी अनुदान)\n💰 वित्त (ITR, GST, PF)\n⚡ यात्रा और सामान्य (बिजली, रेलवे)\n\nकिसी भी सेवा के बारे में पूछें!';
    return '**Our Services:**\n🪪 Govt IDs (Aadhar, PAN, Voter)\n📄 Certificates (Income, Caste, Residence)\n👴 Welfare (Pension, Shadi Anudan)\n💰 Finance (ITR, GST, PF)\n⚡ Travel & General (Electricity, Railway)\n\nAsk about any service!';
  }
  if (
    msg.includes('hello') ||
    msg.includes('hi') ||
    msg.includes('नमस्ते') ||
    msg.includes('हेलो') ||
    msg.length < 5
  ) {
    return 'नमस्ते! 🙏 Hello!\n\nWelcome to **Vijay Online Centre**. I can help you with:\n• Document requirements for any service\n• Application status tracking\n• Contact information\n\nआप हिंदी या English में पूछ सकते हैं।';
  }
  if (isHindi)
    return 'मुझे खेद है, मैं आपका प्रश्न नहीं समझ पाया। कृपया दोबारा पूछें या हमसे संपर्क करें:\n📞 +91 81730 64549';
  return "I'm sorry, I didn't understand your question. Please try asking about a specific service, or contact us:\n📞 +91 81730 64549";
}

// ─── Admin Auth ───────────────────────────────────────────────────────────────

export function useAuthenticate() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.adminLogin(username, password);
      if (result.startsWith('error:')) throw new Error(result.replace('error: ', ''));
      return result; // returns the session token
    },
  });
}

// ─── Backend-integrated Application hooks ────────────────────────────────────

/** Poll a single application by ID. */
export function useGetApplicationById(appId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<BackendApplication | null>({
    queryKey: ['application', appId],
    queryFn: async () => {
      if (!actor || !appId) return null;
      return actor.getApplication(appId);
    },
    enabled: !!actor && !actorFetching && !!appId,
    refetchInterval: 10000,
  });
}

/** Fetch applications filtered by status (admin). */
export function useGetApplicationsByStatus(
  status: ApplicationStatus,
  adminToken: string | null
) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<BackendApplication[]>({
    queryKey: ['applications', status, adminToken],
    queryFn: async () => {
      if (!actor || !adminToken) return [];
      return actor.getApplicationsByStatus(status, adminToken);
    },
    enabled: !!actor && !actorFetching && !!adminToken,
    refetchInterval: 15000,
  });
}

/** Fetch all applications across all statuses (admin). */
export function useGetAllApplications(adminToken: string | null) {
  const { actor, isFetching: actorFetching } = useActor();
  const statuses = [
    ApplicationStatus.documentsUploaded,
    ApplicationStatus.awaitingPrice,
    ApplicationStatus.priceSet,
    ApplicationStatus.paymentPendingVerification,
    ApplicationStatus.completed,
  ];

  return useQuery<BackendApplication[]>({
    queryKey: ['allApplications', adminToken],
    queryFn: async () => {
      if (!actor || !adminToken) return [];
      const results = await Promise.all(
        statuses.map((s) => actor.getApplicationsByStatus(s, adminToken))
      );
      return results.flat();
    },
    enabled: !!actor && !actorFetching && !!adminToken,
    refetchInterval: 15000,
  });
}

/** Submit a new application with documents. */
export function useAddApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: string;
      name: string;
      phoneNumber: string;
      service: string;
      documents: Array<{ name: string; content: ExternalBlob }>;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addApplication(
        params.id,
        params.name,
        params.phoneNumber,
        params.service,
        params.documents
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['allApplications'] });
    },
  });
}

/** Set application fee (admin). */
export function useSetApplicationFee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      appId,
      fee,
      adminToken,
    }: {
      appId: string;
      fee: bigint;
      adminToken: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setApplicationFee(appId, fee, adminToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['allApplications'] });
    },
  });
}

/** Reject an application (admin). */
export function useRejectApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      appId,
      adminToken,
    }: {
      appId: string;
      adminToken: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectApplication(appId, adminToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['allApplications'] });
    },
  });
}

/** Confirm payment (admin — moves to completed). */
export function useConfirmPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      appId,
      adminToken,
    }: {
      appId: string;
      adminToken: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.confirmPayment(appId, adminToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['allApplications'] });
    },
  });
}

/** Mark payment as pending verification (customer: "I have paid"). */
export function useMarkPaymentPendingVerification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (appId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markPaymentPendingVerification(appId);
    },
    onSuccess: (_data, appId) => {
      queryClient.invalidateQueries({ queryKey: ['application', appId] });
    },
  });
}

/** Get rejection message for a given application ID. */
export function useGetRejectionMessage(appId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ['rejectionMessage', appId],
    queryFn: async () => {
      if (!actor || !appId) return null;
      return actor.getRejectionMessage(appId);
    },
    enabled: !!actor && !actorFetching && !!appId,
  });
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
