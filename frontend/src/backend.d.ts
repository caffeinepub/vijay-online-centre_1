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
export interface ApplicationFormData {
    id: string;
    service: string;
    applicantName: string;
    documents: Array<Document>;
    phoneNumber: string;
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
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    canUserPay(appId: string): Promise<boolean>;
    clearNotification(notificationId: bigint): Promise<boolean>;
    confirmPayment(appId: string, adminToken: string): Promise<boolean>;
    getActivePaymentPrice(): Promise<bigint>;
    getAllApplications(): Promise<Array<Application>>;
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
    rejectApplication(appId: string, reason: string, adminToken: string): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setActivePrice(amount: bigint): Promise<void>;
    setApplicationFee(appId: string, fee: bigint, adminToken: string): Promise<boolean>;
    setPaymentQR(blob: ExternalBlob): Promise<void>;
    setServicePrice(serviceId: bigint, name: string, price: bigint, adminToken: string): Promise<boolean>;
    submitApplication(app: ApplicationFormData): Promise<Application>;
    submitPayment(appId: string, transactionId: string): Promise<boolean>;
    updateApplicationStage(appId: string, stage: bigint, adminToken: string): Promise<boolean>;
}
