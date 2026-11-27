export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type UiLanguage = 'en' | 'ar' | 'es' | 'fr';

export type NavTab = 'home' | 'daily' | 'you' | 'setting';

export type HomeMode = 'vocabulary' | 'grammar';

export interface VocabWord {
  id: string;
  word: string;
  ipa: string;
  pos: 'noun' | 'verb' | 'adj' | 'adv' | 'phrase' | 'idiom';
  definition: string;
  example: string;
  translations: {
    ar: string;
    es: string;
    fr: string;
  };
}

export type LessonIllustration =
  | 'home'
  | 'numbers'
  | 'family'
  | 'food'
  | 'objects'
  | 'travel'
  | 'weather'
  | 'city'
  | 'health'
  | 'work'
  | 'emotions'
  | 'media'
  | 'nature'
  | 'leadership'
  | 'science'
  | 'idioms'
  | 'debate'
  | 'academic'
  | 'diplomacy'
  | 'literature'
  | 'philosophy'
  | 'oxford'
  | 'c2deck';

export interface LessonUnit {
  id: string;
  level: CefrLevel;
  order: number;
  title: string;
  subtitle: string;
  topicIcon: string;
  illustration?: LessonIllustration;
  source?: 'core' | 'oxford3000' | 'oxford5000' | 'c2lingvo';
  xpReward: number;
  words: VocabWord[];
}

export type GrammarTopicKey =
  | 'tenses'
  | 'perfect'
  | 'future'
  | 'modals'
  | 'conditionals'
  | 'passive'
  | 'reported'
  | 'questions'
  | 'ing-to'
  | 'articles'
  | 'pronouns'
  | 'relative'
  | 'adjectives'
  | 'conjunctions'
  | 'phrasal';

export interface GrammarRulePoint {
  formula: string;
  explanation: Record<UiLanguage, string>;
  examples: {
    en: string;
    note?: Record<UiLanguage, string>;
  }[];
}

export interface GrammarQuestion {
  id: string;
  kind: 'choice' | 'fill' | 'fix';
  prompt: Record<UiLanguage, string>;
  sentence: string;
  options: string[];
  correctAnswer: string;
  explanation: Record<UiLanguage, string>;
}

export interface GrammarUnit {
  id: string;
  unitRange: string;
  level: CefrLevel;
  order: number;
  topic: GrammarTopicKey;
  icon: string;
  title: Record<UiLanguage, string>;
  subtitle: Record<UiLanguage, string>;
  xpReward: number;
  rules: GrammarRulePoint[];
  questions: GrammarQuestion[];
}

export interface LevelInfo {
  level: CefrLevel;
  title: string;
  tagline: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  gradientBg: string;
}

export type WeeklyXpMap = {
  Mon: number;
  Tue: number;
  Wed: number;
  Thu: number;
  Fri: number;
  Sat: number;
  Sun: number;
};

export interface UserProfileData {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  avatarId: string;
  customAvatarUrl?: string;
  xp: number;
  streak: number;
  streakFreezeActive: boolean;
  streakFreezeProtectedDate?: string;
  lessonsCompleted: number;
  correctAnswers: number;
  totalAnswers: number;
  dailyXp: number;
  dailyLessons: number;
  lastActiveDate: string;
  dailyGoal: number;
  difficulty: CefrLevel;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  voiceSpeed: number;
  notificationsEnabled: boolean;
  darkMode: boolean;
  uiLanguage: UiLanguage;
  unlockedLevels: CefrLevel[];
  completedLessons: string[];
  lessonStars: Record<string, number>;
  masteredWords: string[];
  weeklyXp: WeeklyXpMap;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  target: number;
  metric: 'xp' | 'streak' | 'lessons' | 'words' | 'accuracy' | 'levels' | 'levelComplete';
  targetLevel?: CefrLevel;
}

export type ExerciseType =
  | 'intro'
  | 'choice'
  | 'listen'
  | 'context'
  | 'match'
  | 'mystery-card'
  | 'scramble'
  | 'memory-flip'
  | 'word-wheel'
  | 'speed-blitz';

export interface LessonExercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  word: VocabWord;
  options?: string[];
  correctAnswer?: string;
  sentenceWithBlank?: string;
  matchPairs?: { id: string; word: string; meaning: string }[];
  miniGamePool?: VocabWord[];
}
