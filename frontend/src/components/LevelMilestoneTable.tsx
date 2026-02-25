import { CheckCircle2, Circle } from 'lucide-react';

export const LEVEL_DATA = [
  { level: 1, teamSize: 5, reward: '₹100', rewardNum: 100 },
  { level: 2, teamSize: 25, reward: '₹1,000', rewardNum: 1000 },
  { level: 3, teamSize: 125, reward: '₹3,000', rewardNum: 3000 },
  { level: 4, teamSize: 625, reward: '₹9,000', rewardNum: 9000 },
  { level: 5, teamSize: 3125, reward: '₹12,000', rewardNum: 12000 },
  { level: 6, teamSize: 15625, reward: '₹24,000', rewardNum: 24000 },
  { level: 7, teamSize: 78125, reward: '₹35,000', rewardNum: 35000 },
  { level: 8, teamSize: 390625, reward: 'Goa Tour (3 Days)', rewardNum: 0, special: true },
  { level: 9, teamSize: 1953125, reward: '₹80,000', rewardNum: 80000 },
  { level: 10, teamSize: 9765625, reward: '₹1,00,000 + Foreign Tour', rewardNum: 100000, special: true },
];

interface LevelMilestoneTableProps {
  teamCountByLevel?: Record<number, number>;
  totalTeam?: number;
}

export default function LevelMilestoneTable({ teamCountByLevel = {}, totalTeam = 0 }: LevelMilestoneTableProps) {
  return (
    <div className="card-navy overflow-hidden">
      <div className="px-4 py-3 border-b border-[oklch(0.82_0.18_85/0.3)] bg-gradient-to-r from-[oklch(0.82_0.18_85/0.15)] to-transparent">
        <h3 className="font-display text-lg font-bold gold-text">Level Income Plan</h3>
        <p className="text-xs text-muted-foreground">1% Commission per level • Registration ₹100</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[oklch(0.28_0.05_240)]">
              <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Level</th>
              <th className="text-center px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Team Size</th>
              <th className="text-right px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reward</th>
              <th className="text-center px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {LEVEL_DATA.map((row, idx) => {
              const currentCount = teamCountByLevel[row.level] || 0;
              const achieved = currentCount >= row.teamSize;
              const isHighlighted = row.level === 8 || row.level === 10;

              return (
                <tr
                  key={row.level}
                  className={`border-b border-[oklch(0.28_0.05_240/0.5)] transition-colors ${
                    isHighlighted
                      ? 'bg-[oklch(0.82_0.18_85/0.08)]'
                      : idx % 2 === 0
                      ? 'bg-[oklch(0.17_0.03_240)]'
                      : 'bg-[oklch(0.15_0.025_240)]'
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full gold-gradient flex items-center justify-center text-xs font-bold text-[oklch(0.13_0.025_240)]">
                        {row.level}
                      </span>
                      <span className="font-semibold text-foreground">Level {row.level}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-muted-foreground font-mono text-xs">
                      {currentCount.toLocaleString()}/{row.teamSize.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold text-sm ${row.special ? 'gold-text' : 'text-foreground'}`}>
                      {row.reward}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {achieved ? (
                      <CheckCircle2 size={18} className="text-success mx-auto" />
                    ) : (
                      <Circle size={18} className="text-muted-foreground mx-auto" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
