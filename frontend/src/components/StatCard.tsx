import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  iconColor?: string;
  highlight?: boolean;
  subtext?: string;
}

export default function StatCard({ label, value, icon: Icon, iconColor, highlight, subtext }: StatCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl p-4 ${
        highlight
          ? 'bg-gradient-to-br from-[oklch(0.82_0.18_85/0.15)] to-[oklch(0.72_0.18_75/0.08)] border border-[oklch(0.82_0.18_85/0.5)]'
          : 'card-navy'
      }`}
    >
      {highlight && (
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.82_0.18_85/0.05)] to-transparent pointer-events-none" />
      )}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 truncate">
            {label}
          </p>
          <p className={`text-xl font-bold truncate ${highlight ? 'gold-text' : 'text-foreground'}`}>
            {value}
          </p>
          {subtext && (
            <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
          )}
        </div>
        {Icon && (
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-2"
            style={{ background: `${iconColor || 'oklch(0.82 0.18 85)'}22` }}
          >
            <Icon size={20} style={{ color: iconColor || 'oklch(0.82 0.18 85)' }} />
          </div>
        )}
      </div>
    </div>
  );
}
