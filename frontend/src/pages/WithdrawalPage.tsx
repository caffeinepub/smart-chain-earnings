import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile, useGetBalance, useWithdraw, useSaveCallerUserProfile } from '../hooks/useQueries';
import { ArrowLeft, ArrowUpCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function WithdrawalPage() {
  const navigate = useNavigate();
  const { data: profile } = useGetCallerUserProfile();
  const { data: balance = BigInt(0), refetch: refetchBalance } = useGetBalance(profile?.referralCode);
  const withdraw = useWithdraw();
  const saveProfile = useSaveCallerUserProfile();

  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const balanceNum = Number(balance);

  const handleWithdraw = async () => {
    const amt = parseInt(amount);
    if (!amt || amt <= 0) { toast.error('Please enter a valid amount'); return; }
    if (amt < 100) { toast.error('Minimum withdrawal amount is ₹100'); return; }
    if (amt > balanceNum) { toast.error(`Insufficient balance. Available: ₹${balanceNum.toLocaleString('en-IN')}`); return; }
    if (!profile) { toast.error('Profile not found'); return; }

    setIsSubmitting(true);
    try {
      await withdraw.mutateAsync({ ref: profile.referralCode, amount: BigInt(amt) });

      // Update profile withdrawal total
      const updatedProfile = {
        ...profile,
        withdrawalTotal: profile.withdrawalTotal + BigInt(amt),
      };
      await saveProfile.mutateAsync(updatedProfile);

      toast.success(`Withdrawal request of ₹${amt.toLocaleString('en-IN')} submitted! Admin will process within 24 hours.`);
      setAmount('');
      refetchBalance();
    } catch (error: any) {
      toast.error(error?.message || 'Withdrawal failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const percentage = balanceNum > 0 ? Math.min((parseInt(amount || '0') / balanceNum) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[oklch(0.28_0.05_240)] bg-[oklch(0.15_0.03_240)]">
        <button
          onClick={() => navigate({ to: '/dashboard' })}
          className="w-9 h-9 rounded-lg card-navy flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-gold" />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">Withdraw Funds</h1>
          <p className="text-xs text-muted-foreground">Request a withdrawal</p>
        </div>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Balance Card */}
        <div className="relative overflow-hidden rounded-2xl p-5 gold-gradient">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <div className="relative">
            <p className="text-sm font-semibold text-[oklch(0.13_0.025_240/0.8)] uppercase tracking-wider">Available Balance</p>
            <p className="text-4xl font-bold text-[oklch(0.13_0.025_240)] mt-1 font-display">
              ₹{balanceNum.toLocaleString('en-IN')}
            </p>
          </div>
          <ArrowUpCircle size={48} className="absolute right-4 top-4 text-[oklch(0.13_0.025_240/0.2)]" />
        </div>

        {/* Withdrawal Form */}
        <div className="card-navy p-4 space-y-4">
          <h3 className="font-semibold text-foreground">Withdrawal Amount</h3>

          {/* Quick percentages */}
          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => setAmount(String(Math.floor(balanceNum * pct / 100)))}
                disabled={balanceNum === 0}
                className="py-2 rounded-lg text-sm font-semibold card-navy-dark text-muted-foreground hover:text-foreground border border-[oklch(0.28_0.05_240)] transition-all disabled:opacity-40"
              >
                {pct}%
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Amount (₹)</Label>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter withdrawal amount"
              type="number"
              min="100"
              max={balanceNum}
              className="input-navy h-12 text-lg font-bold"
            />
            {amount && parseInt(amount) > balanceNum && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle size={12} />
                Amount exceeds available balance
              </p>
            )}
          </div>

          {/* Progress bar */}
          {amount && parseInt(amount) > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Withdrawing</span>
                <span>{Math.min(percentage, 100).toFixed(0)}% of balance</span>
              </div>
              <div className="h-2 bg-[oklch(0.22_0.04_240)] rounded-full overflow-hidden">
                <div
                  className="h-full gold-gradient rounded-full transition-all"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleWithdraw}
            disabled={isSubmitting || !amount || parseInt(amount) > balanceNum || balanceNum === 0}
            className="w-full btn-gold h-12 text-base font-bold"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ArrowUpCircle size={18} />
                Request Withdrawal {amount ? `₹${parseInt(amount || '0').toLocaleString('en-IN')}` : ''}
              </span>
            )}
          </Button>
        </div>

        {/* Info */}
        <div className="card-navy p-4 space-y-2">
          <h3 className="font-semibold text-foreground text-sm">Withdrawal Info</h3>
          <div className="space-y-1">
            {[
              '• Minimum withdrawal: ₹100',
              '• Processing time: 24-48 hours',
              '• Contact admin for urgent withdrawals',
              '• Admin: 9422018674',
            ].map((info) => (
              <p key={info} className="text-xs text-muted-foreground">{info}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
