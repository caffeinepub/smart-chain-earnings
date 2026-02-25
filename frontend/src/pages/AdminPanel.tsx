import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetCallerUserProfile,
  useGetAllTransactions,
  useGetAllBalances,
  useAddBalanceToReferral,
  useWithdraw,
  useSetBalance,
} from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import StatCard from '../components/StatCard';
import {
  Users, TrendingUp, ArrowDownCircle, ArrowUpCircle,
  LogOut, Search, Shield, RefreshCw, CheckCircle, XCircle,
  BarChart3, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { TransactionType } from '../backend';

const ADMIN_MOBILE = '9422018674';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: profile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: allTransactions = [], isLoading: txnLoading, refetch: refetchTxns } = useGetAllTransactions();
  const { data: allBalances = [], isLoading: balLoading, refetch: refetchBal } = useGetAllBalances();
  const addBalance = useAddBalanceToReferral();
  const withdraw = useWithdraw();
  const setBalance = useSetBalance();

  const [searchQuery, setSearchQuery] = useState('');
  const [txnFilter, setTxnFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'transfer'>('all');
  const [addBalRef, setAddBalRef] = useState('');
  const [addBalAmt, setAddBalAmt] = useState('');
  const [isAddingBal, setIsAddingBal] = useState(false);

  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const handleRefresh = () => {
    refetchTxns();
    refetchBal();
    toast.success('Data refreshed');
  };

  const handleAddBalance = async () => {
    if (!addBalRef.trim()) { toast.error('Enter referral code'); return; }
    const amt = parseInt(addBalAmt);
    if (!amt || amt <= 0) { toast.error('Enter valid amount'); return; }
    setIsAddingBal(true);
    try {
      await addBalance.mutateAsync({ ref: addBalRef.trim(), amount: BigInt(amt) });
      toast.success(`Added ₹${amt.toLocaleString('en-IN')} to ${addBalRef}`);
      setAddBalRef('');
      setAddBalAmt('');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add balance');
    } finally {
      setIsAddingBal(false);
    }
  };

  const handleApproveWithdrawal = async (ref: string, amount: bigint) => {
    try {
      await withdraw.mutateAsync({ ref, amount });
      toast.success(`Withdrawal of ₹${Number(amount).toLocaleString('en-IN')} approved for ${ref}`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to approve withdrawal');
    }
  };

  // ─── Access Control ───────────────────────────────────────────────────────

  // Show loading while profile is being fetched
  if (profileLoading || !isFetched) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated → redirect to login
  if (!isAuthenticated) {
    navigate({ to: '/' });
    return null;
  }

  // Authenticated but not admin mobile → redirect to dashboard
  if (profile?.mobileNumber !== ADMIN_MOBILE) {
    navigate({ to: '/dashboard' });
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center space-y-4">
        <Shield size={48} className="text-destructive" />
        <h2 className="font-display text-2xl font-bold text-foreground">Access Denied</h2>
        <p className="text-muted-foreground">You don't have admin privileges.</p>
        <Button onClick={() => navigate({ to: '/dashboard' })} className="btn-gold">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  // ─── Stats ────────────────────────────────────────────────────────────────

  const totalDeposits = allTransactions
    .filter(t => String(t.transactionType) === 'deposit')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalWithdrawals = allTransactions
    .filter(t => String(t.transactionType) === 'withdrawal')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalUsers = allBalances.length;

  // Filtered transactions
  const filteredTxns = allTransactions
    .filter(t => txnFilter === 'all' || String(t.transactionType) === txnFilter)
    .sort((a, b) => Number(b.timestamp - a.timestamp));

  // Filtered balances (users)
  const filteredBalances = allBalances.filter(([ref]) =>
    !searchQuery || ref.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[oklch(0.15_0.03_240)] border-b border-[oklch(0.82_0.18_85/0.3)] px-4 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center">
              <Shield size={20} className="text-[oklch(0.13_0.025_240)]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
              <h2 className="font-display text-lg font-bold text-foreground">{profile?.name || 'Admin'}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="w-9 h-9 rounded-lg card-navy flex items-center justify-center"
            >
              <RefreshCw size={16} className="text-gold" />
            </button>
            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-lg card-navy flex items-center justify-center"
            >
              <LogOut size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
        {/* Platform Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Users" value={totalUsers.toString()} icon={Users} highlight />
          <StatCard label="Total Deposits" value={`₹${totalDeposits.toLocaleString('en-IN')}`} icon={ArrowDownCircle} />
          <StatCard label="Total Withdrawals" value={`₹${totalWithdrawals.toLocaleString('en-IN')}`} icon={ArrowUpCircle} />
          <StatCard label="Net Balance" value={`₹${(totalDeposits - totalWithdrawals).toLocaleString('en-IN')}`} icon={BarChart3} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users">
          <TabsList className="w-full grid grid-cols-3 bg-[oklch(0.15_0.03_240)]">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-3 mt-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by referral code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 input-navy"
              />
            </div>
            {balLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredBalances.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No users found</div>
            ) : (
              <div className="space-y-2">
                {filteredBalances.map(([ref, bal]) => (
                  <div key={ref} className="card-navy p-3 flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm font-semibold text-foreground">{ref}</p>
                      <p className="text-xs text-muted-foreground">Referral Code</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gold">₹{Number(bal).toLocaleString('en-IN')}</p>
                      <p className="text-xs text-muted-foreground">Balance</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-3 mt-3">
            <div className="flex gap-2 flex-wrap">
              {(['all', 'deposit', 'withdrawal', 'transfer'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setTxnFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    txnFilter === f
                      ? 'gold-gradient text-[oklch(0.13_0.025_240)]'
                      : 'card-navy text-muted-foreground'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            {txnLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredTxns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No transactions found</div>
            ) : (
              <div className="space-y-2">
                {filteredTxns.map((txn, i) => {
                  const type = String(txn.transactionType);
                  const isDeposit = type === 'deposit';
                  const isWithdrawal = type === 'withdrawal';
                  return (
                    <div key={i} className="card-navy p-3">
                      <div className="flex items-center justify-between mb-1">
                        <Badge
                          variant={isDeposit ? 'default' : isWithdrawal ? 'destructive' : 'secondary'}
                          className="text-xs capitalize"
                        >
                          {type}
                        </Badge>
                        <span className={`font-bold text-sm ${isDeposit ? 'text-green-400' : isWithdrawal ? 'text-red-400' : 'text-gold'}`}>
                          {isDeposit ? '+' : isWithdrawal ? '-' : ''}₹{Number(txn.amount).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{txn.from} → {txn.to}</span>
                        <span>{new Date(Number(txn.timestamp) / 1_000_000).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Manage Tab */}
          <TabsContent value="manage" className="space-y-4 mt-3">
            {/* Add Balance */}
            <div className="card-navy p-4 space-y-3">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <ArrowDownCircle size={18} className="text-gold" />
                Add Balance
              </h3>
              <div className="space-y-2">
                <Input
                  placeholder="Referral code"
                  value={addBalRef}
                  onChange={(e) => setAddBalRef(e.target.value)}
                  className="input-navy"
                />
                <Input
                  type="number"
                  placeholder="Amount (₹)"
                  value={addBalAmt}
                  onChange={(e) => setAddBalAmt(e.target.value)}
                  className="input-navy"
                />
                <Button
                  onClick={handleAddBalance}
                  disabled={isAddingBal || addBalance.isPending}
                  className="w-full btn-gold"
                >
                  {isAddingBal ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Adding...
                    </span>
                  ) : 'Add Balance'}
                </Button>
              </div>
            </div>

            {/* Pending Withdrawals */}
            <div className="card-navy p-4 space-y-3">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <ArrowUpCircle size={18} className="text-gold" />
                Pending Withdrawals
              </h3>
              {txnLoading ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {allTransactions
                    .filter(t => String(t.transactionType) === 'withdrawal')
                    .slice(0, 10)
                    .map((txn, i) => (
                      <div key={i} className="card-navy-dark p-3 flex items-center justify-between rounded-xl">
                        <div>
                          <p className="font-mono text-sm font-semibold text-foreground">{txn.from}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(Number(txn.timestamp) / 1_000_000).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gold text-sm">
                            ₹{Number(txn.amount).toLocaleString('en-IN')}
                          </span>
                          <button
                            onClick={() => handleApproveWithdrawal(txn.from, txn.amount)}
                            className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center hover:bg-green-500/30 transition-colors"
                          >
                            <CheckCircle size={16} className="text-green-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  {allTransactions.filter(t => String(t.transactionType) === 'withdrawal').length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-4">No withdrawal requests</p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 px-6 mt-4">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Smart Chain Earnings. Built with{' '}
          <Heart size={10} className="inline text-gold" /> using{' '}
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
  );
}
