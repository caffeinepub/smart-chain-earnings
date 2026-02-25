import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSaveCallerUserProfile, useCreateReferralId, useAddBalanceToReferral } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { TrendingUp, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const saveProfile = useSaveCallerUserProfile();
  const createReferralId = useCreateReferralId();
  const addBalance = useAddBalanceToReferral();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSetup = async () => {
    if (!name.trim()) { toast.error('Please enter your name'); return; }
    if (!mobile.trim() || mobile.length < 10) { toast.error('Please enter a valid 10-digit mobile number'); return; }

    setIsSubmitting(true);
    try {
      const newReferralCode = await createReferralId.mutateAsync();

      const profile = {
        name: name.trim(),
        mobileNumber: mobile.trim(),
        referralCode: newReferralCode,
        uplineReferralCode: referralCode.trim(),
        totalIncome: BigInt(0),
        levelIncome: BigInt(0),
        depositTotal: BigInt(0),
        withdrawalTotal: BigInt(0),
        registrationTimestamp: BigInt(Date.now()) * BigInt(1_000_000),
      };

      await saveProfile.mutateAsync(profile);

      // Initialize wallet
      try {
        await addBalance.mutateAsync({ ref: newReferralCode, amount: BigInt(0) });
      } catch {
        // Wallet may already exist
      }

      toast.success('Profile created successfully!');
      if (mobile.trim() === '9422018674') {
        navigate({ to: '/admin' });
      } else {
        navigate({ to: '/dashboard' });
      }
    } catch (error: any) {
      toast.error(error?.message || 'Setup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center mx-auto shadow-gold">
            <TrendingUp size={32} className="text-[oklch(0.13_0.025_240)]" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold gold-text">Complete Your Profile</h1>
            <p className="text-sm text-muted-foreground mt-1">Set up your Smart Chain Earnings account</p>
          </div>
        </div>

        {/* Form */}
        <div className="card-navy p-5 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Full Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="input-navy h-11"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Mobile Number *</Label>
            <Input
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit mobile number"
              type="tel"
              className="input-navy h-11"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Referral Code (Optional)</Label>
            <Input
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="Sponsor's referral code"
              className="input-navy h-11"
            />
          </div>

          <Button
            onClick={handleSetup}
            disabled={isSubmitting}
            className="w-full btn-gold h-12 text-base font-bold"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Setting up...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus size={18} />
                Create Account
              </span>
            )}
          </Button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Logout and go back
        </button>
      </div>
    </div>
  );
}
