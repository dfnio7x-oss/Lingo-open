import { LessonUnit } from '../types/learning';

interface LessonNodeArtProps {
  lesson: LessonUnit;
  locked?: boolean;
}

export function LessonNodeArt({ lesson, locked = false }: LessonNodeArtProps) {
  if (locked) {
    return (
      <svg viewBox="0 0 64 64" className="w-12 h-12" aria-hidden="true">
        <rect x="16" y="28" width="32" height="24" rx="7" fill="#94A3B8" />
        <path
          d="M22 28v-6a10 10 0 0 1 20 0v6"
          fill="none"
          stroke="#94A3B8"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="32" cy="39" r="3.5" fill="#E2E8F0" />
        <rect x="30.5" y="41" width="3" height="6" rx="1.5" fill="#E2E8F0" />
      </svg>
    );
  }

  const key = lesson.illustration || inferIllustration(lesson);

  switch (key) {
    case 'numbers':
      return (
        <svg viewBox="0 0 64 64" className="w-13 h-13" aria-hidden="true">
          <rect x="7" y="16" width="22" height="22" rx="6" fill="#1CB0F6" />
          <text x="18" y="32" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="900">1</text>
          <rect x="34" y="10" width="22" height="22" rx="6" fill="#FF9600" />
          <text x="45" y="26" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="900">2</text>
          <rect x="21" y="34" width="24" height="22" rx="6" fill="#58CC02" />
          <text x="33" y="50" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="900">3</text>
        </svg>
      );

    case 'home':
      return (
        <svg viewBox="0 0 64 64" className="w-13 h-13" aria-hidden="true">
          <path d="M10 30L32 12l22 18v22a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V30z" fill="#FEF3C7" />
          <path d="M7 31L32 10l25 21" fill="none" stroke="#EA580C" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="26" y="36" width="12" height="20" rx="3" fill="#B45309" />
          <rect x="15" y="34" width="8" height="8" rx="2" fill="#38BDF8" />
          <rect x="41" y="34" width="8" height="8" rx="2" fill="#38BDF8" />
        </svg>
      );

    case 'family':
      return (
        <svg viewBox="0 0 64 64" className="w-13 h-13" aria-hidden="true">
          <circle cx="22" cy="21" r="7" fill="#FDBA74" />
          <path d="M11 47c0-7 5-12 11-12s11 5 11 12" fill="#1CB0F6" />
          <circle cx="42" cy="22" r="6.5" fill="#FED7AA" />
          <path d="M32 47c0-6.5 4.5-11 10-11s10 4.5 10 11" fill="#F97316" />
          <circle cx="32" cy="34" r="5.5" fill="#FDE68A" />
          <path d="M23 53c0-5 4-9 9-9s9 4 9 9" fill="#58CC02" />
        </svg>
      );

    case 'objects':
      return (
        <svg viewBox="0 0 64 64" className="w-13 h-13" aria-hidden="true">
          <rect x="15" y="18" width="34" height="36" rx="10" fill="#EF4444" />
          <path d="M24 18v-4a8 8 0 0 1 16 0v4" fill="none" stroke="#991B1B" strokeWidth="4" />
          <rect x="20" y="32" width="24" height="15" rx="5" fill="#FCA5A5" />
          <rect x="27" y="25" width="10" height="4" rx="2" fill="#FDE047" />
        </svg>
      );

    case 'food':
      return (
        <svg viewBox="0 0 64 64" className="w-13 h-13" aria-hidden="true">
          <circle cx="32" cy="35" r="19" fill="#FDE68A" />
          <circle cx="32" cy="35" r="13" fill="#FFFBEB" />
          <path d="M23 21c0-3 3-5 3-8M32 20c0-3 3-5 3-8M41 21c0-3 3-5 3-8" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="32" cy="35" r="7" fill="#D97706" />
        </svg>
      );

    case 'oxford':
      return (
        <svg viewBox="0 0 64 64" className="w-13 h-13" aria-hidden="true">
          <rect x="13" y="12" width="38" height="40" rx="6" fill="#0284C7" />
          <rect x="18" y="12" width="33" height="40" rx="5" fill="#38BDF8" />
          <rect x="23" y="20" width="22" height="5" rx="2.5" fill="#FFFFFF" />
          <rect x="23" y="29" width="16" height="4" rx="2" fill="#E0F2FE" />
          <circle cx="44" cy="43" r="7" fill="#FACC15" />
          <path d="M41 43l2 2 4-4" stroke="#713F12" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );

    case 'c2deck':
      return (
        <svg viewBox="0 0 64 64" className="w-13 h-13" aria-hidden="true">
          <polygon points="32,10 52,24 44,52 20,52 12,24" fill="#EC4899" />
          <polygon points="32,10 44,24 32,52 20,24" fill="#F472B6" />
          <polygon points="12,24 52,24 32,52" fill="none" stroke="#FDF2F8" strokeWidth="2.2" />
          <circle cx="48" cy="14" r="3" fill="#FACC15" />
        </svg>
      );

    default:
      return (
        <span className="text-4xl select-none drop-shadow-sm" aria-hidden="true">
          {lesson.topicIcon}
        </span>
      );
  }
}

function inferIllustration(lesson: LessonUnit): LessonUnit['illustration'] {
  const id = lesson.id.toLowerCase();
  if (id.startsWith('ox-deck-c2')) return 'c2deck';
  if (id.startsWith('ox-deck')) return 'oxford';
  if (id.includes('numbers')) return 'numbers';
  if (id === 'a1-1') return 'home';
  if (id === 'a1-2') return 'objects';
  if (id === 'a1-3') return 'food';
  if (id === 'a1-4') return 'family';
  return undefined;
}
