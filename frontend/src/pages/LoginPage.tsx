import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useSendOtp, useVerifyOtp, useGetCallerUserProfile } from '../hooks/useQueries';
import { Smartphone, Shield, TrendingUp, Heart, ArrowRight, KeyRound, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const ADMIN_MOBILE = '9422018674';

export default function LoginPage() {
  const { login, loginStatus, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();

  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [pendingMobile, setPendingMobile] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  const handleSendOtp = async () => {
    setErrorMsg('');
    const trimmed = mobile.trim();
    if (!/^\d{10}$/.test(trimmed)) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    try {
      await sendOtp.mutateAsync(trimmed);
      setPendingMobile(trimmed);
      setStep('otp');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMsg('');
    if (otp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit OTP.');
      return;
    }
    try {
      setIsAuthenticating(true);
      await verifyOtp.mutateAsync({ mobile: pendingMobile, otp });

      // Authenticate with Internet Identity silently
      try {
        await login();
      } catch (err: any) {
        // If already authenticated, proceed
        if (err?.message !== 'User is already authenticated') {
          throw err;
        }
      }

      // Redirect based on mobile number
      if (pendingMobile === ADMIN_MOBILE) {
        navigate({ to: '/admin' });
      } else {
        navigate({ to: '/dashboard' });
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMsg('');
    setOtp('');
    try {
      await sendOtp.mutateAsync(pendingMobile);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to resend OTP.');
    }
  };

  const handleBackToMobile = () => {
    setStep('mobile');
    setOtp('');
    setErrorMsg('');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Banner */}
      <div className="relative overflow-hidden">
        <img
          src="/assets/generated/hero-banner.dim_1200x400.png"
          alt="Smart Chain Earnings"
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      </div>

      {/* Logo & Title */}
      <div className="flex flex-col items-center -mt-8 px-6 z-10">
        <div className="w-20 h-20 rounded-2xl gold-gradient flex items-center justify-center shadow-gold mb-3">
          <TrendingUp size={36} className="text-[oklch(0.13_0.025_240)]" />
        </div>
        <h1 className="font-display text-3xl font-bold gold-text text-center">Smart Chain Earnings</h1>
        <p className="text-muted-foreground text-sm text-center mt-1">Your Gateway to Financial Freedom</p>
      </div>

      {/* Login Card */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-md mx-auto w-full">
        <div className="card-navy p-6 space-y-6">
          {step === 'mobile' ? (
            <>
              <div className="text-center">
                <h2 className="font-display text-2xl font-bold text-foreground">Welcome Back</h2>
                <p className="text-muted-foreground text-sm mt-1">Enter your mobile number to continue</p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: '💰', label: 'Level Income' },
                  { icon: '👥', label: 'Team Rewards' },
                  { icon: '🌍', label: 'Tour Rewards' },
                ].map((f) => (
                  <div key={f.label} className="card-navy-dark p-3 text-center rounded-xl">
                    <div className="text-2xl mb-1">{f.icon}</div>
                    <p className="text-xs text-muted-foreground font-medium">{f.label}</p>
                  </div>
                ))}
              </div>

              {/* Mobile Input */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="mobile" className="text-foreground font-medium">
                    Mobile Number
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                      +91
                    </span>
                    <Input
                      id="mobile"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="Enter 10-digit number"
                      value={mobile}
                      onChange={(e) => {
                        setMobile(e.target.value.replace(/\D/g, '').slice(0, 10));
                        setErrorMsg('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                      className="pl-12 input-navy h-12 text-base"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-destructive text-sm flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-destructive/20 flex items-center justify-center text-xs">!</span>
                    {errorMsg}
                  </p>
                )}

                <Button
                  onClick={handleSendOtp}
                  disabled={sendOtp.isPending || mobile.length !== 10}
                  className="w-full btn-gold h-12 text-base font-bold"
                >
                  {sendOtp.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Sending OTP...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Smartphone size={18} />
                      Send OTP
                      <ArrowRight size={16} />
                    </span>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  New user?{' '}
                  <button
                    onClick={() => navigate({ to: '/register' })}
                    className="text-gold font-semibold hover:underline"
                  >
                    Register here
                  </button>
                </p>
              </div>

              {/* Info */}
              <div className="bg-[oklch(0.82_0.18_85/0.08)] border border-[oklch(0.82_0.18_85/0.2)] rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Shield size={16} className="text-gold mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Secure OTP authentication. Your account is protected with advanced security.
                    Registration fee: <span className="text-gold font-semibold">₹100 only</span>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-3">
                  <KeyRound size={28} className="text-[oklch(0.13_0.025_240)]" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">Verify OTP</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Enter the 6-digit OTP sent to{' '}
                  <span className="text-gold font-semibold">+91 {pendingMobile}</span>
                </p>
              </div>

              {/* OTP Input */}
              <div className="space-y-4">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(val) => {
                      setOtp(val);
                      setErrorMsg('');
                    }}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {errorMsg && (
                  <p className="text-destructive text-sm text-center flex items-center justify-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-destructive/20 flex items-center justify-center text-xs">!</span>
                    {errorMsg}
                  </p>
                )}

                <Button
                  onClick={handleVerifyOtp}
                  disabled={verifyOtp.isPending || isAuthenticating || otp.length !== 6}
                  className="w-full btn-gold h-12 text-base font-bold"
                >
                  {verifyOtp.isPending || isAuthenticating ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Shield size={18} />
                      Verify & Login
                    </span>
                  )}
                </Button>

                <div className="flex items-center justify-between">
                  <button
                    onClick={handleBackToMobile}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Change number
                  </button>
                  <button
                    onClick={handleResendOtp}
                    disabled={sendOtp.isPending}
                    className="text-xs text-gold hover:underline flex items-center gap-1 disabled:opacity-50"
                  >
                    {sendOtp.isPending ? (
                      <span className="w-3 h-3 border border-gold border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <RefreshCw size={12} />
                    )}
                    Resend OTP
                  </button>
                </div>
              </div>

              {/* Demo hint */}
              <div className="bg-[oklch(0.82_0.18_85/0.08)] border border-[oklch(0.82_0.18_85/0.2)] rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Shield size={16} className="text-gold mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    OTP is valid for <span className="text-gold font-semibold">5 minutes</span>.
                    Check the browser console for the demo OTP code.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 px-6">
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
