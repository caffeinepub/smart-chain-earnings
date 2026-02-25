import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile, useGetAllBalances } from '../hooks/useQueries';
import LevelMilestoneTable, { LEVEL_DATA } from '../components/LevelMilestoneTable';
import StatCard from '../components/StatCard';
import { ArrowLeft, Users, Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function TeamPage() {
  const navigate = useNavigate();
  const { data: profile } = useGetCallerUserProfile();
  const { data: allBalances = [] } = useGetAllBalances();
  const [copied, setCopied] = useState(false);

  // Since we don't have a direct team hierarchy query, we show what we can
  // The uplineReferralCode field links users, but we can't traverse the full tree from frontend alone
  // We show the total registered users as a proxy for team size
  const totalRegistered = allBalances.length;

  const handleCopyReferral = () => {
    if (!profile?.referralCode) return;
    const link = `${window.location.origin}/register?ref=${profile.referralCode}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

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
          <h1 className="font-display text-xl font-bold text-foreground">My Team</h1>
          <p className="text-xs text-muted-foreground">Your network & earnings</p>
        </div>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Team Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Total Network"
            value={totalRegistered.toString()}
            icon={Users}
            highlight
            subtext="Platform members"
          />
          <StatCard
            label="Level Income"
            value={`₹${Number(profile?.levelIncome || 0).toLocaleString('en-IN')}`}
            icon={Users}
            subtext="1% per level"
          />
        </div>

        {/* Referral Share */}
        <div className="card-navy p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Invite & Earn</h3>
            <Share2 size={16} className="text-gold" />
          </div>
          <p className="text-xs text-muted-foreground">
            Share your referral code and earn 1% commission on every deposit your team makes, up to 10 levels deep!
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[oklch(0.22_0.04_240)] rounded-lg px-3 py-2 font-mono text-sm font-bold text-gold border border-[oklch(0.82_0.18_85/0.3)] truncate">
              {profile?.referralCode || '—'}
            </div>
            <button
              onClick={handleCopyReferral}
              className="w-10 h-10 rounded-lg card-navy-dark flex items-center justify-center border border-[oklch(0.82_0.18_85/0.3)]"
            >
              {copied ? <Check size={16} className="text-success" /> : <Copy size={16} className="text-gold" />}
            </button>
          </div>
        </div>

        {/* Level Breakdown */}
        <div className="card-navy p-4 space-y-3">
          <h3 className="font-semibold text-foreground">Level Commission Structure</h3>
          <p className="text-xs text-muted-foreground">
            You earn <span className="text-gold font-bold">1% commission</span> on every deposit made by members in your downline, across all 10 levels.
          </p>
          <div className="space-y-2">
            {LEVEL_DATA.slice(0, 5).map((row) => (
              <div key={row.level} className="flex items-center justify-between py-2 border-b border-[oklch(0.28_0.05_240/0.5)] last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full gold-gradient flex items-center justify-center text-xs font-bold text-[oklch(0.13_0.025_240)]">
                    {row.level}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">Level {row.level}</p>
                    <p className="text-xs text-muted-foreground">Team: {row.teamSize.toLocaleString()}</p>
                  </div>
                </div>
                <span className="font-bold text-sm text-gold">{row.reward}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Full Level Table */}
        <LevelMilestoneTable totalTeam={totalRegistered} />

        {/* Key Highlights */}
        <div className="card-navy p-4 space-y-2">
          <h3 className="font-semibold text-gold text-sm">Key Highlights</h3>
          {[
            '✅ Low Joining Fee – ₹100 Only',
            '✅ Unlimited Level Income Opportunity',
            '✅ Performance-Based Rewards & Tours',
            '✅ Work From Anywhere',
            '✅ Training & Support Available',
            '📞 For More Details: 9422018674',
          ].map((item) => (
            <p key={item} className="text-xs text-muted-foreground">{item}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
