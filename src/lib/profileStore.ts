import { CefrLevel, UserProfileData, WeeklyXpMap } from '../types/learning';
import { getRandomAvatarId } from '../components/avatarOptions';

const LOCAL_STORAGE_KEY = 'lingofox_learner_profile_v2';

export function getTodayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getTodayWeekdayKey(): keyof WeeklyXpMap {
  const map: (keyof WeeklyXpMap)[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return map[new Date().getDay()];
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
    avatarId: options?.randomizeAvatar ? getRandomAvatarId() : 'app-crest',
    customAvatarUrl: undefined,
    xp: 0,
    streak: 1,
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
