import { CefrLevel } from '../types/learning';

interface LevelBadgeArtProps {
  level: CefrLevel;
  size?: 'sm' | 'lg';
}

export function LevelBadgeArt({ level, size = 'lg' }: LevelBadgeArtProps) {
  const cls = size === 'sm' ? 'w-11 h-11' : 'w-16 h-16 sm:w-20 sm:h-20';

  switch (level) {
    case 'A1':
      // Sunrise Seed & ABC blocks — First Steps
      return (
        <svg viewBox="0 0 80 80" className={cls} aria-hidden="true">
          <circle cx="40" cy="40" r="36" fill="#E0F2FE" />
          <path d="M22 52h36" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" />
          <rect x="20" y="28" width="18" height="18" rx="5" fill="#1CB0F6" />
          <text x="29" y="41" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="900">A</text>
          <rect x="42" y="22" width="18" height="18" rx="5" fill="#58CC02" />
          <text x="51" y="35" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="900">1</text>
          <path d="M40 52v-8m0 0c-4-1-6-4-6-7 3 0 6 2 6 7zm0 0c4-1 6-4 6-7-3 0-6 2-6 7z" fill="#58CC02" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'A2':
      // Compass & Passport — Everyday Explorer
      return (
        <svg viewBox="0 0 80 80" className={cls} aria-hidden="true">
          <circle cx="40" cy="40" r="36" fill="#DCFCE7" />
          <circle cx="40" cy="40" r="24" fill="#FFFFFF" stroke="#58CC02" strokeWidth="4" />
          <polygon points="40,21 46,40 40,36 34,40" fill="#FF9600" />
          <polygon points="40,59 46,40 40,44 34,40" fill="#1CB0F6" />
          <circle cx="40" cy="40" r="3.5" fill="#1E293B" />
        </svg>
      );

    case 'B1':
      // Speech Bubbles & Spark — Confident Speaker
      return (
        <svg viewBox="0 0 80 80" className={cls} aria-hidden="true">
          <circle cx="40" cy="40" r="36" fill="#FFEDD5" />
          <rect x="16" y="22" width="32" height="22" rx="9" fill="#FF9600" />
          <polygon points="24,44 20,52 32,44" fill="#FF9600" />
          <rect x="32" y="36" width="32" height="22" rx="9" fill="#1CB0F6" />
          <polygon points="54,58 58,64 46,58" fill="#1CB0F6" />
          <circle cx="42" cy="47" r="2.3" fill="#fff" />
          <circle cx="48" cy="47" r="2.3" fill="#fff" />
          <circle cx="54" cy="47" r="2.3" fill="#fff" />
        </svg>
      );

    case 'B2':
      // Mountain Peak Flag — Fluent Strategist
      return (
        <svg viewBox="0 0 80 80" className={cls} aria-hidden="true">
          <circle cx="40" cy="40" r="36" fill="#FEE2E2" />
          <polygon points="15,58 36,24 54,58" fill="#F97316" />
          <polygon points="34,58 49,33 65,58" fill="#EA580C" />
          <polygon points="36,24 41,33 36,31 31,33" fill="#FFF7ED" />
          <line x1="36" y1="24" x2="36" y2="12" stroke="#7C2D12" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="36,12 49,16 36,20" fill="#58CC02" />
        </svg>
      );

    case 'C1':
      // Academic Laurel & Scroll — Executive & Academic
      return (
        <svg viewBox="0 0 80 80" className={cls} aria-hidden="true">
          <circle cx="40" cy="40" r="36" fill="#EDE9FE" />
          <polygon points="40,18 62,28 40,38 18,28" fill="#7C3AED" />
          <path d="M26 33v13c0 5 6 9 14 9s14-4 14-9V33" fill="#8B5CF6" />
          <line x1="58" y1="30" x2="58" y2="48" stroke="#FACC15" strokeWidth="3" strokeLinecap="round" />
          <circle cx="58" cy="50" r="3.5" fill="#FACC15" />
        </svg>
      );

    case 'C2':
      // Royal Crown & Diamond — Grand Mastery
      return (
        <svg viewBox="0 0 80 80" className={cls} aria-hidden="true">
          <circle cx="40" cy="40" r="36" fill="#FCE7F3" />
          <path
            d="M18 52L22 28L33 38L40 22L47 38L58 28L62 52H18Z"
            fill="#EC4899"
            stroke="#BE185D"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <rect x="18" y="52" width="44" height="7" rx="3.5" fill="#BE185D" />
          <circle cx="40" cy="19" r="3.5" fill="#FACC15" />
          <circle cx="22" cy="25" r="3" fill="#38BDF8" />
          <circle cx="58" cy="25" r="3" fill="#38BDF8" />
        </svg>
      );
  }
}
