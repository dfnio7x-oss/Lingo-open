import { Home, Settings, Target, User } from 'lucide-react';
import { motion } from 'motion/react';
import { NavTab, UiLanguage } from '../types/learning';
import { getUi } from '../lib/i18n';
import { soundEngine } from '../lib/sound';

interface BottomNavProps {
  activeTab: NavTab;
  onSelect: (tab: NavTab) => void;
  soundEnabled: boolean;
  uiLanguage: UiLanguage;
}

export function BottomNav({
  activeTab,
  onSelect,
  soundEnabled,
  uiLanguage,
}: BottomNavProps) {
  const t = getUi(uiLanguage).nav;

  const navItems: {
    id: NavTab;
    label: string;
    icon: typeof Home;
    activeColor: string;
    activeBg: string;
  }[] = [
    {
      id: 'home',
      label: t.home,
      icon: Home,
      activeColor: 'text-[#58CC02]',
      activeBg: 'bg-[#58CC02]/14 dark:bg-[#58CC02]/20',
    },
    {
      id: 'daily',
      label: t.daily,
      icon: Target,
      activeColor: 'text-[#EC4899]',
      activeBg: 'bg-[#EC4899]/14 dark:bg-[#EC4899]/20',
    },
    {
      id: 'you',
      label: t.you,
      icon: User,
      activeColor: 'text-[#1CB0F6]',
      activeBg: 'bg-[#1CB0F6]/14 dark:bg-[#1CB0F6]/20',
    },
    {
      id: 'setting',
      label: t.setting,
      icon: Settings,
      activeColor: 'text-[#FF9600]',
      activeBg: 'bg-[#FF9600]/14 dark:bg-[#FF9600]/20',
    },
  ];

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-3 pointer-events-none">
      <nav
        aria-label={t.ariaLabel}
        className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-[24px] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl shadow-[0_12px_32px_rgba(15,23,42,0.12)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.45)] max-w-full overflow-x-auto"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                soundEngine.playClick(soundEnabled);
                onSelect(item.id);
              }}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex items-center justify-center gap-1.5 sm:gap-2 min-h-[46px] px-3.5 sm:px-6 py-2 rounded-[19px] font-display font-extrabold text-xs sm:text-sm whitespace-nowrap shrink-0 cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1CB0F6] ${
                isActive
                  ? item.activeColor
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:-translate-y-0.5'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-active-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  className={`absolute inset-0 rounded-[19px] ${item.activeBg}`}
                />
              )}
              <Icon
                className={`relative z-10 w-5 h-5 transition-transform duration-200 ${
                  isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[2]'
                }`}
              />
              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
