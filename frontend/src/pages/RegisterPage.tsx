import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile, useCreateReferralId, useAddBalanceToReferral } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { ArrowLeft, UserPlus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getUrlParameter } from '../utils/urlParams';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const { actor } = useActor();
  const { data: existingProfile } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const createReferralId = useCreateReferralId();
  const addBalance = useAddBalanceToReferral();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const refFromUrl = getUrlParameter('ref');
    if (refFromUrl) setReferralCode(refFromUrl);
  }, []);

  useEffect(() => {
    if (existingProfile) {
      toast.info('You already have an account. Redirecting...');
      if (existingProfile.mobileNumber === '9422018674') {
        navigate({ to: '/admin' });
      } else {
        navigate({ to: '/dashboard' });
      }
    }
  }, [existingProfile, navigate]);

  const handleRegister = async () => {
    if (!name.trim()) { toast.error('Please enter your name'); return; }
    if (!mobile.trim() || mobile.length < 10) { toast.error('Please enter a valid 10-digit mobile number'); return; }
    if (!identity) { toast.error('Please login first to register'); return; }

    setIsSubmitting(true);
    try {
      // Generate a unique referral code
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

      // Initialize wallet for this referral code
      await addBalance.mutateAsync({ ref: newReferralCode, amount: BigInt(0) });

      toast.success('Registration successful! Welcome to Smart Chain Earnings!');
      setTimeout(() => {
        if (mobile.trim() === '9422018674') {
          navigate({ to: '/admin' });
        } else {
          navigate({ to: '/dashboard' });
        }
      }, 1500);
    } catch (error: any) {
      toast.error(error?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginFirst = () => {
    login();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[oklch(0.28_0.05_240)]">
        <button
          onClick={() => navigate({ to: '/' })}
          className="w-9 h-9 rounded-lg card-navy flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-gold" />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">Create Account</h1>
          <p className="text-xs text-muted-foreground">Join Smart Chain Earnings</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 py-4">
          <div className="w-14 h-14 rounded-xl gold-gradient flex items-center justify-center">
            <TrendingUp size={28} className="text-[oklch(0.13_0.025_240)]" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold gold-text">Smart Chain</h2>
            <p className="text-xs text-muted-foreground">Registration Fee: ₹100 Only</p>
          </div>
        </div>

        {/* Auth Status */}
        {!identity ? (
          <div className="card-navy p-4 space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              You need to be logged in to register
            </p>
            <Button
              onClick={handleLoginFirst}
              disabled={loginStatus === 'logging-in'}
              className="w-full btn-gold"
            >
              {loginStatus === 'logging-in' ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </span>
              ) : 'Login First'}
            </Button>
          </div>
        ) : null}

        {/* Registration Form */}
        <div className="card-navy p-5 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Full Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="input-navy h-11"
              disabled={!identity}
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
              disabled={!identity}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground">Referral Code (Optional)</Label>
            <Input
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="Enter referral code"
              className="input-navy h-11"
              disabled={!identity}
            />
            <p className="text-xs text-muted-foreground">Enter your sponsor's referral code to join their team</p>
          </div>

          <Button
            onClick={handleRegister}
            disabled={isSubmitting || !identity}
            className="w-full btn-gold h-12 text-base font-bold mt-2"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Registering...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus size={18} />
                Register Now (₹100)
              </span>
            )}
          </Button>
        </div>

        {/* Plan Highlights */}
        <div className="card-navy p-4 space-y-2">
          <h3 className="font-semibold text-gold text-sm">Key Highlights</h3>
          {[
            '✅ Low Joining Fee – ₹100 Only',
            '✅ Unlimited Level Income Opportunity',
            '✅ Performance-Based Rewards & Tours',
            '✅ Work From Anywhere',
            '✅ Training & Support Available',
          ].map((item) => (
            <p key={item} className="text-xs text-muted-foreground">{item}</p>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <button onClick={() => navigate({ to: '/' })} className="text-gold font-semibold hover:underline">
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}
