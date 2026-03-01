import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Application {
    id: string;
    service: string;
    status: ApplicationStatus;
    applicantName: string;
    documents: Array<Document>;
    rejection?: RejectionInfo;
    stage: bigint;
    phoneNumber: string;
    price?: bigint;
    transactionId?: string;
}
export interface ManagerNotification {
    message: string;
    timestamp: bigint;
}
export interface ApplicationFormData {
    id: string;
    service: string;
    applicantName: string;
    documents: Array<Document>;
    phoneNumber: string;
}
export interface Service {
    name: string;
    serviceId: bigint;
    price: bigint;
}
export interface RejectionInfo {
    timestamp: bigint;
    reason: string;
}
export interface Document {
    content: ExternalBlob;
    name: string;
}
export interface Customer {
    id: bigint;
    service: string;
    status: string;
    paymentStatus: string;
    name: string;
    createdAt: bigint;
    paymentDate?: bigint;
    receiptId?: string;
    mobile: string;
    amount: number;
}
export interface AuthResult {
    token: string;
    role: string;
}
export interface UserProfile {
    name: string;
    role: string;
    phoneNumber?: string;
}
export enum ApplicationStatus {
    submitted = "submitted",
    feeSet = "feeSet",
    completed = "completed",
    rejected = "rejected",
    paymentVerifying = "paymentVerifying",
    paymentPending = "paymentPending"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCustomer(name: string, mobile: string, service: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    canUserPay(appId: string): Promise<boolean>;
    clearNotification(notificationId: bigint): Promise<boolean>;
    confirmPayment(appId: string, adminToken: string): Promise<boolean>;
    getActivePaymentPrice(): Promise<bigint>;
    getAllApplications(): Promise<Array<Application>>;
    getAllCustomers(): Promise<Array<Customer>>;
    getAllNotifications(): Promise<Array<ManagerNotification>>;
    getAllServices(): Promise<Array<Service>>;
    getApplication(appId: string): Promise<Application | null>;
    getApplicationFee(appId: string): Promise<bigint | null>;
    getApplicationsByStatus(status: ApplicationStatus, adminToken: string): Promise<Array<Application>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getManagerNotifications(): Promise<Array<ManagerNotification>>;
    getPaymentDetails(): Promise<{
        qr?: ExternalBlob;
        upiDetails: string;
        amount: bigint;
    }>;
    getPaymentIntentURL(): Promise<string>;
    getRejectionReason(appId: string): Promise<RejectionInfo | null>;
    getServicePrice(serviceId: bigint): Promise<bigint | null>;
    getUserApplications(user: string, adminToken: string): Promise<Array<Application>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isPaymentActive(): Promise<boolean>;
    login(username: string, password: string): Promise<AuthResult | null>;
    markPaymentSuccess(customerId: bigint): Promise<void>;
    rejectApplication(appId: string, reason: string, adminToken: string): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setActivePrice(amount: bigint, adminToken: string): Promise<void>;
    setApplicationFee(appId: string, fee: bigint, adminToken: string): Promise<boolean>;
    setPaymentQR(blob: ExternalBlob): Promise<void>;
    setServicePrice(serviceId: bigint, name: string, price: bigint, adminToken: string): Promise<boolean>;
    submitApplication(app: ApplicationFormData): Promise<Application>;
    submitPayment(appId: string, transactionId: string): Promise<boolean>;
    updateApplicationStage(appId: string, stage: bigint, adminToken: string): Promise<boolean>;
    updateCustomer(customer: Customer): Promise<void>;
    updateCustomerAmount(id: bigint, amount: number): Promise<void>;
    updateCustomerStatus(id: bigint, status: string): Promise<void>;
}
