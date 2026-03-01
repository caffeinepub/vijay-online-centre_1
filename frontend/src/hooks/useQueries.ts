import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Customer } from '../backend';

// ── Customer hooks ────────────────────────────────────────────────────────────

export function useAllCustomers() {
  const { actor, isFetching } = useActor();

  return useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCustomers();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    staleTime: 0,
    gcTime: 0,
  });
}

export function useGetAllCustomers() {
  const { actor, isFetching } = useActor();

  return useQuery<Customer[]>({
    queryKey: ['customers-public'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCustomers();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
    staleTime: 0,
  });
}

export function useSubmitCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      service,
      mobile,
    }: {
      name: string;
      service: string;
      mobile: string;
      amount?: number; // kept for API compatibility but not sent to backend
    }) => {
      if (!actor) throw new Error('Backend not available');
      // Backend addCustomer(name, mobile, service) — amount defaults to 0.0 on backend
      const id = await actor.addCustomer(name, mobile, service);
      return Number(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers-public'] });
    },
  });
}

export function useUpdateCustomerStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: string;
      adminToken?: string; // kept for call-site compatibility
    }) => {
      if (!actor) throw new Error('Backend not available');
      // Backend: updateCustomerStatus(id: bigint, status: string)
      return actor.updateCustomerStatus(BigInt(id), status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers-public'] });
    },
  });
}

export function useUpdateCustomerAmount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      amount,
    }: {
      id: number;
      amount: number;
      adminToken?: string; // kept for call-site compatibility
    }) => {
      if (!actor) throw new Error('Backend not available');
      // Backend: updateCustomerAmount(id: bigint, amount: number) — Float
      return actor.updateCustomerAmount(BigInt(id), amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers-public'] });
    },
  });
}

export function useUpdateCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      service,
      mobile,
      amount,
      status,
    }: {
      id: number;
      name: string;
      service: string;
      mobile: string;
      amount: number;
      status: string;
      adminToken?: string; // kept for call-site compatibility
    }) => {
      if (!actor) throw new Error('Backend not available');
      // Backend: updateCustomer(customer: Customer)
      const customer: Customer = {
        id: BigInt(id),
        name,
        service,
        mobile,
        amount,
        status,
        createdAt: BigInt(0), // will be preserved by backend
        paymentStatus: 'pending',
      };
      return actor.updateCustomer(customer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers-public'] });
    },
  });
}

export function useMarkPaymentSuccess() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId: number) => {
      if (!actor) throw new Error('Backend not available');
      return actor.markPaymentSuccess(BigInt(customerId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers-public'] });
    },
  });
}
