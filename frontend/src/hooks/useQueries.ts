import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type UserProfile, type Transaction } from '../backend';

// ─── OTP Store (simulated, client-side) ──────────────────────────────────────
// Maps mobile number -> { otp, expiry }
const otpStore = new Map<string, { otp: string; expiry: number }>();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useCreateReferralId() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.createReferralId();
    },
  });
}

// ─── OTP Mutations ────────────────────────────────────────────────────────────

export function useSendOtp() {
  return useMutation({
    mutationFn: async (mobile: string) => {
      if (!mobile || mobile.trim().length < 10) {
        throw new Error('Please enter a valid 10-digit mobile number');
      }
      const otp = generateOtp();
      const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes
      otpStore.set(mobile.trim(), { otp, expiry });
      // In production this would send an SMS; here we log for demo purposes
      console.info(`[OTP Demo] Mobile: ${mobile} → OTP: ${otp}`);
      return { success: true, mobile: mobile.trim() };
    },
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: async ({ mobile, otp }: { mobile: string; otp: string }) => {
      const entry = otpStore.get(mobile.trim());
      if (!entry) {
        throw new Error('OTP not found. Please request a new OTP.');
      }
      if (Date.now() > entry.expiry) {
        otpStore.delete(mobile.trim());
        throw new Error('OTP has expired. Please request a new OTP.');
      }
      if (entry.otp !== otp.trim()) {
        throw new Error('Invalid OTP. Please try again.');
      }
      otpStore.delete(mobile.trim());
      return { success: true, mobile: mobile.trim() };
    },
  });
}

// ─── Balance ─────────────────────────────────────────────────────────────────

export function useGetBalance(referralCode: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['balance', referralCode],
    queryFn: async () => {
      if (!actor || !referralCode) return BigInt(0);
      return actor.getBalance(referralCode);
    },
    enabled: !!actor && !actorFetching && !!referralCode,
  });
}

export function useGetAllBalances() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[string, bigint]>>({
    queryKey: ['allBalances'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBalances();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export function useGetTransactionsByReferral(referralCode: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['transactions', referralCode],
    queryFn: async () => {
      if (!actor || !referralCode) return [];
      return actor.getTransactionsByReferral(referralCode);
    },
    enabled: !!actor && !actorFetching && !!referralCode,
  });
}

export function useGetAllTransactions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['allTransactions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTransactions();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ─── Admin Mutations ──────────────────────────────────────────────────────────

export function useAddBalanceToReferral() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ref, amount }: { ref: string; amount: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addBalanceToReferral(ref, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['allBalances'] });
      queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
    },
  });
}

export function useWithdraw() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ref, amount }: { ref: string; amount: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.withdraw(ref, amount);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['balance', variables.ref] });
      queryClient.invalidateQueries({ queryKey: ['allBalances'] });
      queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.ref] });
    },
  });
}

export function useSetBalance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ref, amount }: { ref: string; amount: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setBalance(ref, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['allBalances'] });
    },
  });
}

export function useTransfer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ from, to, amount }: { from: string; to: string; amount: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.transfer(from, to, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['allBalances'] });
      queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
    },
  });
}

// ─── Admin Role ───────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}
