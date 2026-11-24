export interface AvatarOption {
  id: string;
  label: string;
  emoji?: string;
  image?: string;
  bg: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'app-crest',
    label: 'شعار LingoLearn',
    image: '/assets/aistudio/10263_zoomed-1_bee373d8.jpg',
    bg: 'bg-[#58CC02]/15',
  },
  {
    id: 'scholar-owl',
    label: 'بومة المعرفة',
    emoji: '🦉',
    bg: 'bg-emerald-100 dark:bg-emerald-900/40',
  },
  {
    id: 'rocket-explorer',
    label: 'رائد الفضاء',
    emoji: '🚀',
    bg: 'bg-sky-100 dark:bg-sky-900/40',
  },
  {
    id: 'sunny-star',
    label: 'النجمة الذهبية',
    emoji: '🌟',
    bg: 'bg-amber-100 dark:bg-amber-900/40',
  },
  {
    id: 'crown-lion',
    label: 'الأسد الملكي',
    emoji: '🦁',
    bg: 'bg-orange-100 dark:bg-orange-900/40',
  },
  {
    id: 'book-wizard',
    label: 'صديق الكتب',
    emoji: '📚',
    bg: 'bg-violet-100 dark:bg-violet-900/40',
  },
  {
    id: 'calm-panda',
    label: 'الباندا الهادئ',
    emoji: '🐼',
    bg: 'bg-teal-100 dark:bg-teal-900/40',
  },
  {
    id: 'clever-cat',
    label: 'القط الذكي',
    emoji: '🐱',
    bg: 'bg-pink-100 dark:bg-pink-900/40',
  },
  {
    id: 'trophy-champ',
    label: 'كأس البطولة',
    emoji: '🏆',
    bg: 'bg-yellow-100 dark:bg-yellow-900/40',
  },
];

export function getRandomAvatarId(): string {
  const pool = AVATAR_OPTIONS.filter((opt) => opt.id !== 'app-crest');
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  return chosen ? chosen.id : 'scholar-owl';
}
