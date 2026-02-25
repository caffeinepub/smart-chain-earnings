import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile, useGetBalance, useAddBalanceToReferral, useSaveCallerUserProfile } from '../hooks/useQueries';
import { ArrowLeft, Copy, Check, ArrowDownCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ADMIN_UPI = '9422018674@kotak811';
const ADMIN_NAME = 'Santosh Ramabhau More';

export default function DepositPage() {
  const navigate = useNavigate();
  const { data: profile } = useGetCallerUserProfile();
  const { data: balance = BigInt(0), refetch: refetchBalance } = useGetBalance(profile?.referralCode);
  const addBalance = useAddBalanceToReferral();
  const saveProfile = useSaveCallerUserProfile();

  const [amount, setAmount] = useState('');
  const [upiCopied, setUpiCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(ADMIN_UPI).then(() => {
      setUpiCopied(true);
      toast.success('UPI ID copied!');
      setTimeout(() => setUpiCopied(false), 2000);
    });
  };

  const handleDeposit = async () => {
    const amt = parseInt(amount);
    if (!amt || amt <= 0) { toast.error('Please enter a valid amount'); return; }
    if (amt < 100) { toast.error('Minimum deposit amount is ₹100'); return; }
    if (!profile) { toast.error('Profile not found'); return; }

    setIsSubmitting(true);
    try {
      // Add balance to user's wallet
      await addBalance.mutateAsync({ ref: profile.referralCode, amount: BigInt(amt) });

      // Update profile deposit total
      const updatedProfile = {
        ...profile,
        depositTotal: profile.depositTotal + BigInt(amt),
        totalIncome: profile.totalIncome + BigInt(amt),
      };
      await saveProfile.mutateAsync(updatedProfile);

      // Distribute 1% level income to uplines (if upline exists)
      // This is handled by the admin/backend logic

      toast.success(`Deposit of ₹${amt.toLocaleString('en-IN')} submitted successfully!`);
      setAmount('');
      refetchBalance();
    } catch (error: any) {
      toast.error(error?.message || 'Deposit failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 5000];

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
          <h1 className="font-display text-xl font-bold text-foreground">Deposit Funds</h1>
          <p className="text-xs text-muted-foreground">Add money to your wallet</p>
        </div>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Current Balance */}
        <div className="card-navy p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Current Balance</p>
            <p className="text-2xl font-bold gold-text font-display">₹{Number(balance).toLocaleString('en-IN')}</p>
          </div>
          <ArrowDownCircle size={32} className="text-gold opacity-50" />
        </div>

        {/* UPI Payment Info */}
        <div className="card-navy p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Info size={16} className="text-gold" />
            <h3 className="font-semibold text-foreground">Payment Details</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Transfer the amount to the UPI ID below, then submit the deposit form.
          </p>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white rounded-xl p-3 w-48">
              <img
                src="/assets/generated/upi-qr-card.dim_400x500.png"
                alt="UPI QR Code"
                className="w-full rounded-lg"
              />
            </div>
          </div>

          {/* UPI ID */}
          <div className="bg-[oklch(0.22_0.04_240)] rounded-xl p-4 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Beneficiary Name</p>
            <p className="font-bold text-foreground">{ADMIN_NAME}</p>
            <p className="text-xs text-muted-foreground font-medium mt-2">UPI ID</p>
            <div className="flex items-center gap-2">
              <p className="font-mono font-bold text-gold flex-1">{ADMIN_UPI}</p>
              <button
                onClick={handleCopyUPI}
                className="w-8 h-8 rounded-lg bg-[oklch(0.28_0.05_240)] flex items-center justify-center"
              >
                {upiCopied ? <Check size={14} className="text-success" /> : <Copy size={14} className="text-gold" />}
              </button>
            </div>
          </div>
        </div>

        {/* Deposit Form */}
        <div className="card-navy p-4 space-y-4">
          <h3 className="font-semibold text-foreground">Enter Deposit Amount</h3>

          {/* Quick amounts */}
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((qa) => (
              <button
                key={qa}
                onClick={() => setAmount(String(qa))}
                className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                  amount === String(qa)
                    ? 'gold-gradient text-[oklch(0.13_0.025_240)]'
                    : 'card-navy-dark text-muted-foreground hover:text-foreground border border-[oklch(0.28_0.05_240)]'
                }`}
              >
                ₹{qa}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Amount (₹)</Label>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter amount (min ₹100)"
              type="number"
              min="100"
              className="input-navy h-12 text-lg font-bold"
            />
          </div>

          <Button
            onClick={handleDeposit}
            disabled={isSubmitting || !amount}
            className="w-full btn-gold h-12 text-base font-bold"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ArrowDownCircle size={18} />
                Confirm Deposit {amount ? `₹${parseInt(amount || '0').toLocaleString('en-IN')}` : ''}
              </span>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            ⚠️ Please complete the UPI payment before submitting. Minimum deposit: ₹100
          </p>
        </div>
      </div>
    </div>
  );
}
