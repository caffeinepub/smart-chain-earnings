import { useNavigate, useLocation } from '@tanstack/react-router';
import { Home, ArrowDownCircle, ArrowUpCircle, Users } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/deposit', label: 'Deposit', icon: ArrowDownCircle },
  { path: '/withdrawal', label: 'Withdraw', icon: ArrowUpCircle },
  { path: '/team', label: 'Team', icon: Users },
];

export default function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="nav-bottom fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2 safe-area-pb">
      {navItems.map(({ path, label, icon: Icon }) => {
        const isActive = location.pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate({ to: path })}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
              isActive
                ? 'text-gold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon
              size={22}
              className={isActive ? 'drop-shadow-[0_0_6px_oklch(0.82_0.18_85)]' : ''}
            />
            <span className={`text-xs font-semibold ${isActive ? 'text-gold' : ''}`}>
              {label}
            </span>
            {isActive && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-gold" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
