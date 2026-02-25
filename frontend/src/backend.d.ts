import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface UserProfile {
    referralCode: string;
    name: string;
    totalIncome: bigint;
    levelIncome: bigint;
    mobileNumber: string;
    withdrawalTotal: bigint;
    registrationTimestamp: Time;
    uplineReferralCode: string;
    depositTotal: bigint;
}
export interface Transaction {
    to: string;
    transactionType: TransactionType;
    from: string;
    timestamp: Time;
    amount: bigint;
}
export enum TransactionType {
    deposit = "deposit",
    withdrawal = "withdrawal",
    transfer = "transfer"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBalanceToReferral(ref: string, amount: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createReferralId(): Promise<string>;
    getAllBalances(): Promise<Array<[string, bigint]>>;
    getAllTransactions(): Promise<Array<Transaction>>;
    getBalance(ref: string): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getTransactionsByReferral(ref: string): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setBalance(ref: string, amount: bigint): Promise<void>;
    transfer(from: string, to: string, amount: bigint): Promise<void>;
    withdraw(ref: string, amount: bigint): Promise<void>;
}
