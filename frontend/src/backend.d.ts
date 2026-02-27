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
    documents: Array<Document>;
    name: string;
    phoneNumber: string;
    price?: bigint;
}
export interface Document {
    content: ExternalBlob;
    name: string;
}
export interface UserProfile {
    name: string;
}
export enum ApplicationStatus {
    awaitingPrice = "awaitingPrice",
    completed = "completed",
    paymentPendingVerification = "paymentPendingVerification",
    documentsUploaded = "documentsUploaded",
    priceSet = "priceSet"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / Submit application with documents (documentsUploaded state)
     */
    addApplication(id: string, name: string, phoneNumber: string, service: string, documents: Array<Document>): Promise<boolean>;
    /**
     * / Admin login using static credentials — returns session token on success
     */
    adminLogin(username: string, password: string): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Check if user can proceed to payment (status must be priceSet)
     */
    canUserPay(appId: string): Promise<boolean>;
    /**
     * / Confirm payment — admin only (moves from paymentPendingVerification to completed)
     */
    confirmPayment(appId: string, adminToken: string): Promise<boolean>;
    /**
     * / Get a single application by ID — accessible to users (own) or admins
     */
    getApplication(appId: string): Promise<Application | null>;
    /**
     * / Get applications filtered by status — admin only
     */
    getApplicationsByStatus(status: ApplicationStatus, adminToken: string): Promise<Array<Application>>;
    /**
     * / User profile functions required by frontend
     */
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Get rejection message — open to anyone
     */
    getRejectionMessage(appId: string): Promise<string | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / "I Have Paid" — moves status to paymentPendingVerification
     */
    markPaymentPendingVerification(appId: string): Promise<boolean>;
    /**
     * / Reject application and provide rejection message — admin only
     */
    rejectApplication(appId: string, adminToken: string): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    /**
     * / Set application fee (moves to priceSet) — admin only
     */
    setApplicationFee(appId: string, fee: bigint, adminToken: string): Promise<boolean>;
    /**
     * / Update application status — admin only
     */
    updateApplicationStatus(appId: string, status: ApplicationStatus, adminToken: string): Promise<boolean>;
}
