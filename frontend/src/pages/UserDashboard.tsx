import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetBalance, useGetTransactionsByReferral } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import StatCard from '../components/StatCard';
import LevelMilestoneTable from '../components/LevelMilestoneTable';
import {
  Wallet, TrendingUp, ArrowDownCircle, ArrowUpCircle,
  Users, Copy, Check, LogOut, Share2, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: balance = BigInt(0) } = useGetBalance(profile?.referralCode);
  const { data: transactions = [] } = useGetTransactionsByReferral(profile?.referralCode);
  const [copied, setCopied] = useState(false);

  const formatAmount = (val: bigint) => `₹${Number(val).toLocaleString('en-IN')}`;

  const handleCopyReferral = () => {
    if (!profile?.referralCode) return;
    const referralLink = `${window.location.origin}/?ref=${profile.referralCode}`;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopyCode = () => {
    if (!profile?.referralCode) return;
    navigator.clipboard.writeText(profile.referralCode).then(() => {
      setCopied(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const recentTxns = [...transactions]
    .sort((a, b) => Number(b.timestamp - a.timestamp))
    .slice(0, 5);

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[oklch(0.15_0.03_240)] border-b border-[oklch(0.82_0.18_85/0.2)] px-4 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center">
              <TrendingUp size={20} className="text-[oklch(0.13_0.025_240)]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Welcome back</p>
              <h2 className="font-display text-lg font-bold text-foreground">{profile.name}</h2>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-lg card-navy flex items-center justify-center"
          >
            <LogOut size={16} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Wallet Balance - Hero Card */}
        <div className="relative overflow-hidden rounded-2xl p-5 gold-gradient">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <div className="relative">
            <p className="text-sm font-semibold text-[oklch(0.13_0.025_240/0.8)] uppercase tracking-wider">Wallet Balance</p>
            <p className="text-4xl font-bold text-[oklch(0.13_0.025_240)] mt-1 font-display">
              {formatAmount(balance)}
            </p>
            <p className="text-xs text-[oklch(0.13_0.025_240/0.7)] mt-1">Available for withdrawal</p>
          </div>
          <Wallet size={48} className="absolute right-4 top-4 text-[oklch(0.13_0.025_240/0.2)]" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Total Income"
            value={formatAmount(profile.totalIncome)}
            icon={TrendingUp}
            highlight
          />
          <StatCard
            label="Level Income"
            value={formatAmount(profile.levelIncome)}
            icon={Users}
          />
          <StatCard
            label="Total Deposits"
            value={formatAmount(profile.depositTotal)}
            icon={ArrowDownCircle}
          />
          <StatCard
            label="Total Withdrawals"
            value={formatAmount(profile.withdrawalTotal)}
            icon={ArrowUpCircle}
          />
        </div>

        {/* Referral Code Card */}
        <div className="card-navy p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Your Referral Code</h3>
            <Share2 size={16} className="text-gold" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[oklch(0.22_0.04_240)] rounded-lg px-4 py-3 font-mono text-lg font-bold text-gold tracking-widest text-center border border-[oklch(0.82_0.18_85/0.3)]">
              {profile.referralCode}
            </div>
            <button
              onClick={handleCopyCode}
              className="w-11 h-11 rounded-lg card-navy-dark flex items-center justify-center border border-[oklch(0.82_0.18_85/0.3)] hover:border-gold transition-colors"
            >
              {copied ? <Check size={18} className="text-success" /> : <Copy size={18} className="text-gold" />}
            </button>
          </div>
          <Button
            onClick={handleCopyReferral}
            variant="outline"
            className="w-full border-[oklch(0.82_0.18_85/0.4)] text-gold hover:bg-[oklch(0.82_0.18_85/0.1)] text-sm"
          >
            <Share2 size={14} className="mr-2" />
            Share Referral Link
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => navigate({ to: '/deposit' })}
            className="btn-gold h-12 font-bold"
          >
            <ArrowDownCircle size={18} className="mr-2" />
            Deposit
          </Button>
          <Button
            onClick={() => navigate({ to: '/withdrawal' })}
            variant="outline"
            className="h-12 font-bold border-[oklch(0.82_0.18_85/0.4)] text-gold hover:bg-[oklch(0.82_0.18_85/0.1)]"
          >
            <ArrowUpCircle size={18} className="mr-2" />
            Withdraw
          </Button>
        </div>

        {/* Recent Transactions */}
        {recentTxns.length > 0 && (
          <div className="card-navy p-4 space-y-3">
            <h3 className="font-semibold text-foreground">Recent Transactions</h3>
            <div className="space-y-2">
              {recentTxns.map((txn, idx) => {
                const isCredit = txn.to === profile.referralCode;
                const date = new Date(Number(txn.timestamp) / 1_000_000);
                return (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-[oklch(0.28_0.05_240/0.5)] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCredit ? 'bg-[oklch(0.72_0.18_145/0.2)]' : 'bg-[oklch(0.62_0.22_25/0.2)]'}`}>
                        {isCredit
                          ? <ArrowDownCircle size={16} className="text-success" />
                          : <ArrowUpCircle size={16} className="text-destructive" />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground capitalize">{String(txn.transactionType)}</p>
                        <p className="text-xs text-muted-foreground">{date.toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                    <span className={`font-bold text-sm ${isCredit ? 'text-success' : 'text-destructive'}`}>
                      {isCredit ? '+' : '-'}₹{Number(txn.amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Level Milestone Table */}
        <LevelMilestoneTable />

        {/* Footer */}
        <footer className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Smart Chain Earnings. Built with{' '}
            <Heart size={10} className="inline text-gold" />{' '}using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'smart-chain-earnings')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
