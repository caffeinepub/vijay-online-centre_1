import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ApplicationStatus } from '../backend';
import type { Application, ApplicationFormData, UserProfile } from '../backend';

// ─── Chatbot ──────────────────────────────────────────────────────────────────

export interface ChatMessage {
  text: string;
  time: string;
  isUser: boolean;
}

const FAQ_RESPONSES: Record<string, string> = {
  aadhaar: "For Aadhaar Update, you need your existing Aadhaar card and supporting documents. Visit our centre or apply online.",
  pan: "PAN Card application requires identity proof, address proof, and a passport-size photo.",
  passport: "Passport requires birth certificate, address proof, and identity proof. Processing takes 7-30 days.",
  status: "You can track your application status on the Dashboard page using your Application ID.",
  fee: "Service fees vary by application type. The admin will set the fee after reviewing your application.",
  payment: "We accept UPI payments via 8173064549@okicici (ICICI Bank - XX47).",
  time: "Processing time varies: 3-7 days for certificates, 7-30 days for passports and licences.",
  document: "Required documents depend on the service. Generally: ID proof, address proof, and relevant certificates.",
  help: "I can help with service information, application status, fees, and document requirements. What do you need?",
};

function getBotResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  for (const [key, response] of Object.entries(FAQ_RESPONSES)) {
    if (lower.includes(key)) return response;
  }
  return "Thank you for your query. For specific assistance, please visit our centre or call us. You can also track your application on the Dashboard.";
}

export function useChatbot() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      text: "Hello! I am the Vijay Online Centre assistant. How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isUser: false,
    },
  ]);

  const sendMessage = (text: string) => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = { text, time: now, isUser: true };
    const botMsg: ChatMessage = { text: getBotResponse(text), time: now, isUser: false };
    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  return { messages, sendMessage };
}

// ─── User Profile ────────────────────────────────────────────────────────────

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
    staleTime: 0,
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

// ─── Applications ─────────────────────────────────────────────────────────────

export function useGetAllApplications() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Application[]>({
    queryKey: ['allApplications'],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllApplications();
      return result;
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useGetApplication(appId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Application | null>({
    queryKey: ['application', appId],
    queryFn: async () => {
      if (!actor || !appId) return null;
      return actor.getApplication(appId);
    },
    enabled: !!actor && !actorFetching && !!appId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useSubmitApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (app: ApplicationFormData) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitApplication(app);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allApplications'] });
    },
  });
}

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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allApplications'] });
      queryClient.invalidateQueries({ queryKey: ['application', variables.appId] });
    },
  });
}

export function useConfirmPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appId, adminToken }: { appId: string; adminToken: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.confirmPayment(appId, adminToken);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allApplications'] });
      queryClient.invalidateQueries({ queryKey: ['application', variables.appId] });
    },
  });
}

export function useRejectApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appId,
      reason,
      adminToken,
    }: {
      appId: string;
      reason: string;
      adminToken: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectApplication(appId, reason, adminToken);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allApplications'] });
      queryClient.invalidateQueries({ queryKey: ['application', variables.appId] });
    },
  });
}

export function useUpdateApplicationStage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appId,
      stage,
      adminToken,
    }: {
      appId: string;
      stage: bigint;
      adminToken: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateApplicationStage(appId, stage, adminToken);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allApplications'] });
      queryClient.invalidateQueries({ queryKey: ['application', variables.appId] });
    },
  });
}

export function useSubmitPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appId, transactionId }: { appId: string; transactionId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitPayment(appId, transactionId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['application', variables.appId] });
    },
  });
}

// ─── Payment Details ──────────────────────────────────────────────────────────

export function useGetPaymentDetails() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['paymentDetails'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPaymentDetails();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
    gcTime: 0,
  });
}

export function useGetActivePaymentPrice() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['activePaymentPrice'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getActivePaymentPrice();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
    gcTime: 0,
  });
}

export function useSetActivePrice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setActivePrice(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentDetails'] });
      queryClient.invalidateQueries({ queryKey: ['activePaymentPrice'] });
      queryClient.invalidateQueries({ queryKey: ['allApplications'] });
    },
  });
}

// ─── Notifications ────────────────────────────────────────────────────────────

export function useGetAllNotifications() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['allNotifications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllNotifications();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
    gcTime: 0,
  });
}

export function useClearNotification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.clearNotification(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allNotifications'] });
    },
  });
}

// ─── Services ─────────────────────────────────────────────────────────────────

export function useGetAllServices() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['allServices'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllServices();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
  });
}

export function useSetServicePrice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serviceId,
      name,
      price,
      adminToken,
    }: {
      serviceId: bigint;
      name: string;
      price: bigint;
      adminToken: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setServicePrice(serviceId, name, price, adminToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allServices'] });
    },
  });
}

// ─── Application Fee ──────────────────────────────────────────────────────────

export function useGetApplicationFee(appId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint | null>({
    queryKey: ['applicationFee', appId],
    queryFn: async () => {
      if (!actor || !appId) return null;
      return actor.getApplicationFee(appId);
    },
    enabled: !!actor && !actorFetching && !!appId,
    staleTime: 0,
    gcTime: 0,
  });
}
