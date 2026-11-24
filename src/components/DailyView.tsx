import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Flame,
  Play,
  Sparkles,
  Target,
  Turtle,
  Volume2,
  Zap,
} from 'lucide-react';
import { CefrLevel, UserProfileData } from '../types/learning';
import { ALL_WORDS, CEFR_ORDER, LEVEL_META } from '../data/curriculum';
import { OXFORD_ALL_WORDS } from '../data/oxford3000';
import { getUi } from '../lib/i18n';
import { soundEngine } from '../lib/sound';

interface DailyViewProps {
  profile: UserProfileData;
  onStartCurrentLesson: () => void;
  onOpenVault: (level?: CefrLevel | 'ALL') => void;
}

export function DailyView({
  profile,
  onStartCurrentLesson,
  onOpenVault,
}: DailyViewProps) {
  const t = getUi(profile.uiLanguage);
  const [selectedLevel, setSelectedLevel] = useState<CefrLevel>(profile.difficulty || 'A1');
  const [wordIndex, setWordIndex] = useState(0);

  const levelWords = useMemo(
    () => ALL_WORDS.filter((w) => w.level === selectedLevel),
    [selectedLevel]
  );
  const spotlightWord = levelWords[wordIndex % Math.max(levelWords.length, 1)] || ALL_WORDS[0];
  const totalCatalogWords = ALL_WORDS.length + OXFORD_ALL_WORDS.length;

  const dailyPct = Math.min(
    100,
    Math.round((profile.dailyXp / Math.max(profile.dailyGoal, 1)) * 100)
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-[var(--text-primary)] tracking-tight">
            {t.daily.pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            {t.daily.pageSubtitle}
          </p>
        </div>
      </div>

      {/* Main Grid: Daily Goal + Featured Word */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Daily Goal Card */}
        <section
          aria-label={t.daily.dailyGoalTitle}
          className="lg:col-span-5 rounded-[28px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 shadow-sm space-y-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#58CC02]/15 text-[#58CC02] flex items-center justify-center shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-display font-black text-lg text-[var(--text-primary)]">
                  {t.daily.dailyGoalTitle}
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  {t.daily.dailyGoalGreeting(profile.displayName)}
                </p>
              </div>
            </div>

            <span dir="ltr" className="font-mono-num font-black text-sm text-[#58CC02]">
              {profile.dailyXp}/{profile.dailyGoal} XP
            </span>
          </div>

          <div className="space-y-2">
            <div className="h-3.5 rounded-full bg-[var(--bg-surface-muted)] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(dailyPct, 4)}%` }}
                transition={{ duration: 0.6 }}
                className="h-full rounded-full bg-gradient-to-r from-[#58CC02] to-[#7CE826]"
              />
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
              <span className="font-mono-num">{t.daily.lessonsToday(profile.dailyLessons)}</span>
              <span className={dailyPct >= 100 ? 'text-[#58CC02]' : undefined}>
                {dailyPct >= 100 ? t.daily.goalCompleted : t.daily.goalProgress(dailyPct)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[var(--bg-surface-muted)] p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF9600]/15 text-[#FF9600] flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 fill-[#FF9600]" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-[var(--text-secondary)]">
                  {t.daily.streakLabel}
                </div>
                <div className="font-mono-num font-black text-sm text-[var(--text-primary)]">
                  {t.daily.streakDays(profile.streak)}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[var(--bg-surface-muted)] p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1CB0F6]/15 text-[#1CB0F6] flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 fill-[#1CB0F6]" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-[var(--text-secondary)]">
                  XP
                </div>
                <div dir="ltr" className="font-mono-num font-black text-sm text-[var(--text-primary)]">
                  {profile.xp.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick(profile.soundEnabled);
              onStartCurrentLesson();
            }}
            className="btn-3d-green w-full py-3.5 px-5 rounded-2xl font-display font-black text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{t.daily.continueLearningBtn}</span>
          </button>
        </section>

        {/* Featured Word Card */}
        {spotlightWord && (
          <section
            aria-label={t.daily.featuredWordTitle(selectedLevel)}
            className="lg:col-span-7 rounded-[28px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 shadow-sm space-y-5"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#1CB0F6]">
                <Sparkles className="w-4 h-4" />
                <span>{t.daily.featuredWordTitle(selectedLevel)}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick(profile.soundEnabled);
                  setWordIndex((i) => i + 1);
                }}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface-muted)] hover:bg-[#1CB0F6]/12 text-xs font-extrabold text-[#1CB0F6] cursor-pointer transition-colors"
              >
                {t.daily.nextWordBtn}
              </button>
            </div>

            {/* Level Filter Chips */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-[var(--text-secondary)]">
                {t.daily.levelFilterLabel}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {CEFR_ORDER.map((lvl) => {
                  const active = selectedLevel === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        soundEngine.playClick(profile.soundEnabled);
                        setSelectedLevel(lvl);
                        setWordIndex(0);
                      }}
                      dir="ltr"
                      className={`px-3 py-1.5 rounded-xl font-display font-black text-xs transition-all cursor-pointer ${
                        active
                          ? 'text-white shadow-xs'
                          : 'bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                      style={active ? { backgroundColor: LEVEL_META[lvl].accentColor } : undefined}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Word Display + Pronunciation */}
            <div className="rounded-2xl bg-[var(--bg-surface-muted)] p-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3
                  dir="ltr"
                  className="font-latin font-black text-3xl text-[var(--text-primary)] text-left"
                >
                  {spotlightWord.word}
                </h3>
                <div
                  dir="ltr"
                  className="text-xs font-mono-num text-[var(--text-secondary)] mt-1 text-left"
                >
                  {spotlightWord.ipa} · {spotlightWord.pos}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    soundEngine.speakWord(spotlightWord.word, true, profile.voiceSpeed)
                  }
                  aria-label={t.daily.speakWordAria(spotlightWord.word)}
                  className="btn-3d-blue w-11 h-11 rounded-2xl flex items-center justify-center cursor-pointer"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => soundEngine.speakWord(spotlightWord.word, true, 0.6)}
                  aria-label={t.daily.speakSlowAria(spotlightWord.word)}
                  className="btn-3d-neutral w-11 h-11 rounded-2xl flex items-center justify-center cursor-pointer"
                >
                  <Turtle className="w-5 h-5 text-[#1CB0F6]" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p
                dir="ltr"
                className="font-latin text-base font-bold text-[var(--text-primary)] leading-snug text-left"
              >
                {spotlightWord.definition}
              </p>
              <p className="text-sm font-extrabold text-[#F97316]">
                {spotlightWord.translations[profile.uiLanguage === 'en' ? 'ar' : profile.uiLanguage]}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border-subtle)] p-4 flex items-center justify-between gap-3">
              <p
                dir="ltr"
                className="font-latin text-sm italic text-[var(--text-secondary)] text-left"
              >
                “{spotlightWord.example}”
              </p>
              <button
                type="button"
                onClick={() =>
                  soundEngine.speakWord(spotlightWord.example, true, profile.voiceSpeed)
                }
                aria-label={t.daily.speakWordAria(spotlightWord.example)}
                className="w-10 h-10 rounded-xl bg-[var(--bg-surface-muted)] hover:bg-[#1CB0F6]/15 text-[#1CB0F6] flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick(profile.soundEnabled);
                onOpenVault('ALL');
              }}
              className="btn-3d-neutral w-full py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#1CB0F6]" />
              <span>{t.daily.exploreAllWords(totalCatalogWords.toLocaleString())}</span>
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
