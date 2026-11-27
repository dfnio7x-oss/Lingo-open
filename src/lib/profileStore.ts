import { CefrLevel, UserProfileData, WeeklyXpMap } from '../types/learning';
import { getRandomAvatarId } from '../components/avatarOptions';

const LOCAL_STORAGE_KEY = 'lingofox_learner_profile_v2';
export const STREAK_FREEZE_COST = 50;

export function getTodayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getTodayWeekdayKey(): keyof WeeklyXpMap {
  const map: (keyof WeeklyXpMap)[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return map[new Date().getDay()];
}

function parseIsoDayUtc(iso: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function getIsoDaysDiff(fromIso: string, toIso: string): number {
  const fromMs = parseIsoDayUtc(fromIso);
  const toMs = parseIsoDayUtc(toIso);
  if (fromMs === null || toMs === null) return 0;
  return Math.round((toMs - fromMs) / 86_400_000);
}

export function shiftIsoDate(iso: string, deltaDays: number): string {
  const ms = parseIsoDayUtc(iso);
  if (ms === null) return getTodayIso();
  return new Date(ms + deltaDays * 86_400_000).toISOString().slice(0, 10);
}

export function evaluateDailyStreakTransition(profile: UserProfileData): {
  profile: UserProfileData;
  status: 'unchanged' | 'new-day' | 'freeze-used' | 'streak-lost';
} {
  const today = getTodayIso();
  const lastDate = profile.lastActiveDate || today;
  const diff = getIsoDaysDiff(lastDate, today);

  if (diff <= 0) {
    return { profile, status: 'unchanged' };
  }

  if (diff === 1) {
    if (profile.dailyXp === 0 && profile.dailyLessons === 0) {
      return { profile, status: 'unchanged' };
    }
    return {
      profile: {
        ...profile,
        dailyXp: 0,
        dailyLessons: 0,
      },
      status: 'new-day',
    };
  }

  // Missed at least one full day (diff >= 2)
  if (diff === 2 && profile.streakFreezeActive && profile.streak > 0) {
    const yesterday = shiftIsoDate(today, -1);
    return {
      profile: {
        ...profile,
        dailyXp: 0,
        dailyLessons: 0,
        lastActiveDate: yesterday,
        streakFreezeActive: false,
        streakFreezeProtectedDate: yesterday,
      },
      status: 'freeze-used',
    };
  }

  if (profile.streak > 0 || profile.dailyXp > 0 || profile.dailyLessons > 0) {
    return {
      profile: {
        ...profile,
        streak: 0,
        dailyXp: 0,
        dailyLessons: 0,
        lastActiveDate: today,
      },
      status: profile.streak > 0 ? 'streak-lost' : 'new-day',
    };
  }

  return {
    profile: {
      ...profile,
      lastActiveDate: today,
    },
    status: 'unchanged',
  };
}

export function createDefaultProfile(
  uid = 'guest',
  username = 'learner',
  displayName = 'Learner',
  options?: { randomizeAvatar?: boolean }
): UserProfileData {
  return {
    uid,
    username: username.slice(0, 20) || 'learner',
    displayName: displayName.slice(0, 80) || 'Learner',
    email: '',
    avatarId: options?.randomizeAvatar === false ? 'scholar-owl' : getRandomAvatarId(),
    customAvatarUrl: undefined,
    xp: 0,
    streak: 0,
    streakFreezeActive: false,
    streakFreezeProtectedDate: '',
    lessonsCompleted: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    dailyXp: 0,
    dailyLessons: 0,
    lastActiveDate: getTodayIso(),
    dailyGoal: 50,
    difficulty: 'A1',
    soundEnabled: true,
    voiceEnabled: true,
    voiceSpeed: 0.9,
    notificationsEnabled: true,
    darkMode: false,
    uiLanguage: 'ar',
    unlockedLevels: ['A1'],
    completedLessons: [],
    lessonStars: {},
    masteredWords: [],
    weeklyXp: {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    },
  };
}

export function loadLocalProfile(): UserProfileData {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return createDefaultProfile();
    const parsed = JSON.parse(raw) as Partial<UserProfileData>;
    const base = createDefaultProfile();
    return {
      ...base,
      ...parsed,
      streakFreezeActive: Boolean(parsed.streakFreezeActive),
      streakFreezeProtectedDate:
        typeof parsed.streakFreezeProtectedDate === 'string'
          ? parsed.streakFreezeProtectedDate.slice(0, 20)
          : '',
      avatarId:
        parsed.avatarId === 'pip-fox' || !parsed.avatarId
          ? getRandomAvatarId()
          : parsed.avatarId,
      voiceSpeed:
        typeof parsed.voiceSpeed === 'number'
          ? Math.max(0.5, Math.min(1.5, parsed.voiceSpeed))
          : 0.9,
      weeklyXp: {
        ...base.weeklyXp,
        ...(parsed.weeklyXp || {}),
      },
      unlockedLevels:
        Array.isArray(parsed.unlockedLevels) && parsed.unlockedLevels.length > 0
          ? (parsed.unlockedLevels.slice(0, 6) as CefrLevel[])
          : ['A1'],
      completedLessons: Array.isArray(parsed.completedLessons)
        ? parsed.completedLessons.slice(0, 2000)
        : [],
      lessonStars:
        parsed.lessonStars && typeof parsed.lessonStars === 'object'
          ? parsed.lessonStars
          : {},
      masteredWords: Array.isArray(parsed.masteredWords)
        ? parsed.masteredWords.slice(0, 15000)
        : [],
    };
  } catch {
    return createDefaultProfile();
  }
}

export function saveLocalProfile(profile: UserProfileData): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage quota issues
  }
}
