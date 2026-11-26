import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Compass,
  Flame,
  GraduationCap,
  Lock,
  Play,
  Settings,
  Star,
  Unlock,
  Zap,
} from 'lucide-react';
import {
  CefrLevel,
  GrammarTopicKey,
  GrammarUnit,
  HomeMode,
  LessonUnit,
  NavTab,
  UserProfileData,
} from '../types/learning';
import {
  ALL_LESSONS,
  CEFR_ORDER,
  getMergedLevelLessons,
  LEVEL_META,
} from '../data/curriculum';
import { ALL_GRAMMAR_UNITS, getGrammarUnitsByLevel } from '../data/grammarCurriculum';
import { getUi } from '../lib/i18n';
import { soundEngine } from '../lib/sound';
import { AVATAR_OPTIONS } from './avatarOptions';
import { LessonNodeArt } from './LessonNodeArt';
import { LevelBadgeArt } from './LevelBadgeArt';

interface HomeViewProps {
  profile: UserProfileData;
  onNavigateTab: (tab: NavTab) => void;
  onStartLesson: (lesson: LessonUnit) => void;
  onStartGrammarUnit: (unit: GrammarUnit) => void;
  onUnlockLevel: (level: CefrLevel) => void;
  onOpenVault: (level?: CefrLevel | 'ALL') => void;
}

const WINDING_OFFSETS = [0, 56, 0, -56];
const BATCH_SIZE = 24;
const JUMP_CHUNK = 50;

export function HomeView({
  profile,
  onNavigateTab,
  onStartLesson,
  onStartGrammarUnit,
  onUnlockLevel,
  onOpenVault,
}: HomeViewProps) {
  const t = getUi(profile.uiLanguage);
  const isRtl = profile.uiLanguage === 'ar';

  const [homeMode, setHomeMode] = useState<HomeMode>('vocabulary');
  const [selectedLevel, setSelectedLevel] = useState<CefrLevel>(profile.difficulty || 'A1');
  const [rangeStart, setRangeStart] = useState(0);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [grammarTopicFilter, setGrammarTopicFilter] = useState<GrammarTopicKey | 'ALL'>('ALL');
  const [pendingScrollLessonId, setPendingScrollLessonId] = useState<string | null>(null);
  const [pendingScrollGrammarId, setPendingScrollGrammarId] = useState<string | null>(null);

  const lessonNodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const grammarCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const levelMeta = LEVEL_META[selectedLevel];
  const localizedLevel = t.levels[selectedLevel];

  const levelLessons = useMemo(
    () => getMergedLevelLessons(selectedLevel),
    [selectedLevel]
  );

  const visiblePathLessons = useMemo(
    () => levelLessons.slice(rangeStart, rangeStart + visibleCount),
    [levelLessons, rangeStart, visibleCount]
  );

  const isLevelUnlocked = profile.unlockedLevels.includes(selectedLevel);

  const selectedAvatar =
    AVATAR_OPTIONS.find((a) => a.id === profile.avatarId) || AVATAR_OPTIONS[1];
  const avatarImageSrc = profile.customAvatarUrl || selectedAvatar.image;

  const levelWordsSet = useMemo(() => {
    const ids = new Set<string>();
    levelLessons.forEach((l) => l.words.forEach((w) => ids.add(w.id)));
    return ids;
  }, [levelLessons]);

  const learnedInLevelCount = useMemo(() => {
    let count = 0;
    levelWordsSet.forEach((id) => {
      if (profile.masteredWords.includes(id)) count += 1;
    });
    return count;
  }, [levelWordsSet, profile.masteredWords]);

  const totalWordsInLevel = levelWordsSet.size;
  const completedInLevelCount = levelLessons.filter((l) =>
    profile.completedLessons.includes(l.id)
  ).length;
  const remainingLessonsCount = Math.max(0, levelLessons.length - completedInLevelCount);
  const levelPercent =
    levelLessons.length > 0
      ? Math.round((completedInLevelCount / levelLessons.length) * 100)
      : 0;

  const nextLesson = useMemo(() => {
    const inSelected = levelLessons.find((l) => !profile.completedLessons.includes(l.id));
    if (isLevelUnlocked && inSelected) return inSelected;
    const unlockedLessons = ALL_LESSONS.filter((l) =>
      profile.unlockedLevels.includes(l.level)
    );
    return (
      unlockedLessons.find((l) => !profile.completedLessons.includes(l.id)) ||
      unlockedLessons[0] ||
      ALL_LESSONS[0]
    );
  }, [levelLessons, isLevelUnlocked, profile.unlockedLevels, profile.completedLessons]);

  // Grammar level units
  const levelGrammarUnits = useMemo(
    () => getGrammarUnitsByLevel(selectedLevel),
    [selectedLevel]
  );
  const availableTopicsInLevel = useMemo(
    () => Array.from(new Set(levelGrammarUnits.map((u) => u.topic))),
    [levelGrammarUnits]
  );
  const filteredGrammarUnits = useMemo(
    () =>
      grammarTopicFilter === 'ALL'
        ? levelGrammarUnits
        : levelGrammarUnits.filter((u) => u.topic === grammarTopicFilter),
    [levelGrammarUnits, grammarTopicFilter]
  );
  const completedGrammarInLevel = levelGrammarUnits.filter((u) =>
    profile.completedLessons.includes(u.id)
  ).length;
  const grammarPercent =
    levelGrammarUnits.length > 0
      ? Math.round((completedGrammarInLevel / levelGrammarUnits.length) * 100)
      : 0;

  const nextGrammarUnit = useMemo(() => {
    const inSelected = levelGrammarUnits.find(
      (u) => !profile.completedLessons.includes(u.id)
    );
    if (isLevelUnlocked && inSelected) return inSelected;
    const unlockedUnits = ALL_GRAMMAR_UNITS.filter((u) =>
      profile.unlockedLevels.includes(u.level)
    );
    return (
      unlockedUnits.find((u) => !profile.completedLessons.includes(u.id)) ||
      unlockedUnits[0] ||
      ALL_GRAMMAR_UNITS[0]
    );
  }, [levelGrammarUnits, isLevelUnlocked, profile.unlockedLevels, profile.completedLessons]);

  // Smooth scroll effects after jumping to current lesson/unit
  useEffect(() => {
    if (!pendingScrollLessonId) return;
    const timer = window.setTimeout(() => {
      const el = lessonNodeRefs.current[pendingScrollLessonId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setPendingScrollLessonId(null);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [pendingScrollLessonId, selectedLevel, rangeStart, visibleCount]);

  useEffect(() => {
    if (!pendingScrollGrammarId) return;
    const timer = window.setTimeout(() => {
      const el = grammarCardRefs.current[pendingScrollGrammarId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setPendingScrollGrammarId(null);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [pendingScrollGrammarId, selectedLevel, grammarTopicFilter]);

  const handleJumpToCurrentLesson = () => {
    soundEngine.playClick(profile.soundEnabled);
    const target = nextLesson;
    const targetList = getMergedLevelLessons(target.level);
    const targetIndex = Math.max(
      0,
      targetList.findIndex((l) => l.id === target.id)
    );
    const chunkStart = Math.floor(targetIndex / BATCH_SIZE) * BATCH_SIZE;
    setSelectedLevel(target.level);
    setRangeStart(chunkStart);
    setVisibleCount(BATCH_SIZE);
    setPendingScrollLessonId(target.id);
  };

  const handleJumpToCurrentGrammarUnit = () => {
    soundEngine.playClick(profile.soundEnabled);
    const target = nextGrammarUnit;
    setSelectedLevel(target.level);
    setGrammarTopicFilter('ALL');
    setPendingScrollGrammarId(target.id);
  };

  const getLocalizedLessonText = (lesson: LessonUnit) => {
    const core = t.coreLessons[lesson.id];
    if (core) return core;
    return { title: lesson.title, subtitle: lesson.subtitle };
  };

  const isLessonUnlocked = (lesson: LessonUnit, globalIndex: number) => {
    if (!isLevelUnlocked) return false;
    if (globalIndex === 0) return true;
    if (lesson.id.startsWith('ox-deck-')) return true;
    const prevLesson = levelLessons[globalIndex - 1];
    return (
      profile.completedLessons.includes(lesson.id) ||
      profile.completedLessons.includes(prevLesson.id)
    );
  };

  const jumpSections = useMemo(() => {
    if (levelLessons.length <= 48) return [];
    const sections: { start: number; label: string }[] = [];
    for (let s = 0; s < levelLessons.length; s += JUMP_CHUNK) {
      const end = Math.min(levelLessons.length, s + JUMP_CHUNK);
      sections.push({
        start: s,
        label: t.home.lessonsRangeLabel(s + 1, end),
      });
    }
    return sections;
  }, [levelLessons.length, t.home]);

  const activeBannerPct = homeMode === 'vocabulary' ? levelPercent : grammarPercent;
  const ringRadius = 28;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - activeBannerPct / 100);
  const remainingBelowCount = Math.max(
    0,
    levelLessons.length - (rangeStart + visiblePathLessons.length)
  );
  const nextLessonText = getLocalizedLessonText(nextLesson);

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div
          aria-label={`${profile.streak} ${t.home.dayUnit} · ${profile.xp} XP`}
          className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm"
        >
          <div className="flex items-center gap-1.5">
            <Flame className="w-5 h-5 text-[#FF9600] fill-[#FF9600]" />
            <span className="font-mono-num font-black text-base text-[var(--text-primary)]">
              {profile.streak}
            </span>
            <span className="text-xs font-bold text-[var(--text-secondary)]">
              {t.home.dayUnit}
            </span>
          </div>
          <span className="h-4 w-px bg-[var(--border-subtle)]" aria-hidden="true" />
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#1CB0F6] fill-[#1CB0F6]" />
            <span className="font-mono-num font-extrabold text-sm text-[var(--text-primary)]">
              {profile.xp}
            </span>
            <span className="text-xs font-bold text-[var(--text-secondary)]">XP</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick(profile.soundEnabled);
              onOpenVault(selectedLevel);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[#1CB0F6] text-xs font-bold text-[var(--text-primary)] shadow-sm cursor-pointer transition-colors whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-4 h-4 text-[#1CB0F6]" />
            <span>{t.home.vocabBankBtn}</span>
          </button>

          <div className="inline-flex items-center p-1 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick(profile.soundEnabled);
                onNavigateTab('you');
              }}
              aria-label={t.home.myAccountBtn}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[var(--bg-surface-muted)] text-xs font-bold text-[var(--text-primary)] cursor-pointer transition-colors whitespace-nowrap shrink-0"
            >
              {avatarImageSrc ? (
                <img
                  src={avatarImageSrc}
                  alt={profile.displayName}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover border border-[#58CC02]"
                />
              ) : (
                <span className="text-base leading-none">{selectedAvatar.emoji}</span>
              )}
              <span>{t.home.myAccountBtn}</span>
              {isRtl ? (
                <ChevronLeft className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              )}
            </button>

            <span className="h-4 w-px bg-[var(--border-subtle)] mx-0.5" aria-hidden="true" />

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick(profile.soundEnabled);
                onNavigateTab('setting');
              }}
              aria-label={t.home.settingsBtn}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[var(--bg-surface-muted)] text-xs font-bold text-[var(--text-primary)] cursor-pointer transition-colors whitespace-nowrap shrink-0"
            >
              <Settings className="w-4 h-4 text-[#FF9600]" />
              <span>{t.home.settingsBtn}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Home Mode Switcher: Vocabulary vs Grammar */}
      <div className="flex justify-center">
        <div
          role="tablist"
          aria-label={`${t.home.vocabTab} / ${t.home.grammarTab}`}
          className="inline-flex items-center p-1.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm gap-1.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={homeMode === 'vocabulary'}
            onClick={() => {
              soundEngine.playClick(profile.soundEnabled);
              setHomeMode('vocabulary');
            }}
            className={`px-5 sm:px-7 py-2.5 rounded-xl font-display font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              homeMode === 'vocabulary'
                ? 'bg-[#58CC02] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-muted)]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t.home.vocabTab}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={homeMode === 'grammar'}
            onClick={() => {
              soundEngine.playClick(profile.soundEnabled);
              setHomeMode('grammar');
              setGrammarTopicFilter('ALL');
            }}
            className={`px-5 sm:px-7 py-2.5 rounded-xl font-display font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              homeMode === 'grammar'
                ? 'bg-[#8B5CF6] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-muted)]'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>{t.home.grammarTab}</span>
          </button>
        </div>
      </div>

      {/* CEFR Level Selector Bar (A1 - C2) */}
      <nav
        role="tablist"
        aria-label={t.home.levelLabel(selectedLevel)}
        className="w-full p-1.5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm grid grid-cols-3 sm:grid-cols-6 gap-1.5"
      >
        {CEFR_ORDER.map((lvl) => {
          const meta = LEVEL_META[lvl];
          const lvlLoc = t.levels[lvl];
          const isSelected = selectedLevel === lvl;
          const unlocked = profile.unlockedLevels.includes(lvl);

          return (
            <button
              key={lvl}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => {
                soundEngine.playClick(profile.soundEnabled);
                setSelectedLevel(lvl);
                setRangeStart(0);
                setVisibleCount(BATCH_SIZE);
                setGrammarTopicFilter('ALL');
              }}
              className={`relative py-2 px-2.5 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isSelected
                  ? 'text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-muted)]'
              }`}
              style={isSelected ? { backgroundColor: meta.accentColor } : undefined}
            >
              <div className="shrink-0 hidden sm:block">
                <LevelBadgeArt level={lvl} size="sm" />
              </div>
              <div className={`${isRtl ? 'text-right' : 'text-left'} min-w-0`}>
                <div className="font-display font-black text-xs sm:text-sm flex items-center gap-1 leading-none">
                  <span dir="ltr">{lvl}</span>
                  {!unlocked && (
                    <Lock className="w-3 h-3 opacity-80 shrink-0" aria-label={t.home.lockedLabel} />
                  )}
                </div>
                <div
                  className={`text-[10px] font-bold truncate mt-0.5 ${
                    isSelected ? 'text-white/90' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {lvlLoc.title}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Level Banner Card */}
      <section
        aria-label={t.home.levelLabel(selectedLevel)}
        className={`rounded-[28px] border border-[var(--border-subtle)] bg-gradient-to-br ${levelMeta.gradientBg} p-5 sm:p-7 shadow-sm`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="shrink-0 drop-shadow-sm">
              <LevelBadgeArt level={selectedLevel} size="lg" />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <h1
                  dir="ltr"
                  className="font-display font-black text-3xl sm:text-4xl tracking-tight"
                  style={{ color: levelMeta.accentColor }}
                >
                  {selectedLevel}
                </h1>
                <span className="font-display font-black text-lg sm:text-xl text-[var(--text-primary)]">
                  {localizedLevel.title}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl leading-relaxed">
                {homeMode === 'vocabulary'
                  ? localizedLevel.description
                  : t.grammar.headerSubtitle}
              </p>

              {/* Level Stats */}
              {homeMode === 'vocabulary' ? (
                <div className="flex items-center gap-3 flex-wrap pt-0.5 text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                  <span className="inline-flex items-center gap-1.5 font-mono-num">
                    <span aria-hidden="true">📚</span>
                    <span>
                      {t.home.learnedWordsStats(
                        learnedInLevelCount.toLocaleString(),
                        totalWordsInLevel.toLocaleString()
                      )}
                    </span>
                  </span>
                  <span className="text-[var(--text-secondary)]" aria-hidden="true">
                    ·
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono-num">
                    <span aria-hidden="true">🎯</span>
                    <span>
                      {t.home.remainingLessonsStats(
                        remainingLessonsCount.toLocaleString(),
                        completedInLevelCount,
                        levelLessons.length
                      )}
                    </span>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3 flex-wrap pt-0.5 text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                  <span className="inline-flex items-center gap-1.5 font-mono-num">
                    <span aria-hidden="true">📘</span>
                    <span>
                      {t.grammar.completedCount(
                        completedGrammarInLevel,
                        levelGrammarUnits.length
                      )}
                    </span>
                  </span>
                </div>
              )}

              {/* Primary Action Buttons */}
              <div className="pt-1 flex items-center gap-2.5 flex-wrap">
                {isLevelUnlocked ? (
                  homeMode === 'vocabulary' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playClick(profile.soundEnabled);
                          onStartLesson(nextLesson);
                        }}
                        className="btn-3d-green px-6 py-3 rounded-2xl font-display font-black text-sm inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>
                          {t.home.continueLesson(nextLesson.order, nextLessonText.title)}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleJumpToCurrentLesson}
                        className="btn-3d-blue px-4 py-3 rounded-2xl font-display font-black text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Compass className="w-4 h-4" />
                        <span>{t.home.jumpToCurrentBtn}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playClick(profile.soundEnabled);
                          onStartGrammarUnit(nextGrammarUnit);
                        }}
                        className="btn-3d-green px-6 py-3 rounded-2xl font-display font-black text-sm inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>
                          {t.grammar.startUnit}: {nextGrammarUnit.title[profile.uiLanguage]}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleJumpToCurrentGrammarUnit}
                        className="btn-3d-blue px-4 py-3 rounded-2xl font-display font-black text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Compass className="w-4 h-4" />
                        <span>{t.grammar.jumpToCurrentUnit}</span>
                      </button>
                    </>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => onUnlockLevel(selectedLevel)}
                    className="btn-3d-blue px-6 py-3 rounded-2xl font-display font-black text-sm inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>{t.home.unlockLevel(selectedLevel, localizedLevel.title)}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Animated Completion Ring */}
          <div className="flex items-center gap-4 self-start sm:self-center shrink-0">
            <div className="relative w-20 h-20 rounded-full bg-white/90 dark:bg-slate-900/90 shadow-md flex items-center justify-center">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
                <circle
                  cx="36"
                  cy="36"
                  r={ringRadius}
                  fill="none"
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-700"
                  strokeWidth="6"
                />
                <motion.circle
                  cx="36"
                  cy="36"
                  r={ringRadius}
                  fill="none"
                  stroke={levelMeta.accentColor}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  initial={{ strokeDashoffset: ringCircumference }}
                  animate={{ strokeDashoffset: ringOffset }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
              <span className="absolute font-mono-num font-black text-sm text-[var(--text-primary)]">
                {activeBannerPct}%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Centered Learning Area (Vocabulary Path OR Grammar Units) */}
      {homeMode === 'vocabulary' ? (
        <section
          aria-label={t.home.pathHeading(selectedLevel, localizedLevel.title)}
          className="max-w-4xl mx-auto rounded-[32px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] py-8 px-4 sm:px-8 shadow-sm"
        >
          <div className="text-center mb-6 space-y-2.5">
            <h2 className="font-display font-black text-lg sm:text-xl text-[var(--text-primary)]">
              {t.home.pathHeading(selectedLevel, localizedLevel.title)}
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">{t.home.pathSubtitle}</p>

            {/* Quick Jump Bar + Direct Jump to Current Lesson */}
            <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleJumpToCurrentLesson}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1CB0F6]/12 hover:bg-[#1CB0F6]/20 text-xs font-extrabold text-[#1CB0F6] cursor-pointer transition-colors"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{t.home.jumpToCurrentBtn}</span>
              </button>

              {jumpSections.length > 0 && (
                <>
                  <label
                    htmlFor="lesson-range-jump"
                    className="text-xs font-bold text-[var(--text-secondary)]"
                  >
                    {t.home.quickJumpLabel}
                  </label>
                  <select
                    id="lesson-range-jump"
                    value={Math.floor(rangeStart / JUMP_CHUNK) * JUMP_CHUNK}
                    onChange={(e) => {
                      soundEngine.playClick(profile.soundEnabled);
                      setRangeStart(Number(e.target.value));
                      setVisibleCount(BATCH_SIZE);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1CB0F6]"
                  >
                    {jumpSections.map((sec) => (
                      <option key={sec.start} value={sec.start}>
                        {sec.label}
                      </option>
                    ))}
                  </select>
                  {rangeStart > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick(profile.soundEnabled);
                        setRangeStart(0);
                        setVisibleCount(BATCH_SIZE);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface-muted)] hover:bg-[var(--border-subtle)] text-xs font-bold text-[#1CB0F6] cursor-pointer"
                    >
                      {t.home.backToFirstBtn}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="relative flex flex-col items-center space-y-8">
            {visiblePathLessons.map((lesson, idx) => {
              const globalIndex = rangeStart + idx;
              const completed = (profile.completedLessons || []).includes(lesson.id);
              const unlocked = isLessonUnlocked(lesson, globalIndex);
              const starsEarned = profile.lessonStars?.[lesson.id] || (completed ? 3 : 0);
              const offsetX = WINDING_OFFSETS[globalIndex % WINDING_OFFSETS.length];
              const isNextUp = unlocked && !completed && nextLesson.id === lesson.id;
              const lessonText = getLocalizedLessonText(lesson);

              return (
                <div
                  key={lesson.id}
                  ref={(el) => {
                    lessonNodeRefs.current[lesson.id] = el;
                  }}
                  className="relative flex flex-col items-center"
                  style={{ transform: `translateX(${offsetX}px)` }}
                >
                  {idx < visiblePathLessons.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="absolute top-[118px] w-0.5 h-10 border-l-2 border-dashed border-slate-300 dark:border-slate-600 pointer-events-none"
                    />
                  )}

                  {/* 3 Stars above Node */}
                  <div
                    className="flex items-center gap-1 mb-2"
                    aria-label={`${starsEarned}/3`}
                  >
                    {[1, 2, 3].map((s) => {
                      const filled = starsEarned >= s;
                      return (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            filled
                              ? 'text-[#FACC15] fill-[#FACC15] drop-shadow-sm'
                              : 'text-slate-300 dark:text-slate-600 fill-slate-200/70 dark:fill-slate-700/70'
                          }`}
                        />
                      );
                    })}
                  </div>

                  {/* Circular Lesson Node */}
                  <motion.button
                    type="button"
                    disabled={!unlocked}
                    whileHover={unlocked ? { scale: 1.07, y: -3 } : undefined}
                    whileTap={unlocked ? { scale: 0.94 } : undefined}
                    onClick={() => {
                      if (!unlocked) return;
                      soundEngine.playClick(profile.soundEnabled);
                      onStartLesson(lesson);
                    }}
                    aria-label={t.home.lessonLabel(lesson.order, lessonText.title)}
                    className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all border-4 ${
                      !unlocked
                        ? 'bg-[var(--bg-surface-muted)] border-slate-300 dark:border-slate-700 opacity-65 cursor-not-allowed'
                        : completed
                        ? 'bg-gradient-to-b from-[#ECFDF5] to-[#D1FAE5] dark:from-[#123829] dark:to-[#0F291E] border-[#58CC02] shadow-[0_6px_0_#46A302] cursor-pointer'
                        : isNextUp
                        ? 'bg-gradient-to-b from-[#E0F2FE] to-[#BAE6FD] dark:from-[#10324E] dark:to-[#0C253B] border-[#1CB0F6] shadow-[0_6px_0_#1899D6] cursor-pointer ring-4 ring-[#1CB0F6]/25'
                        : 'bg-[var(--bg-surface-muted)] border-[#1CB0F6]/70 shadow-[0_5px_0_var(--border-subtle)] cursor-pointer'
                    }`}
                  >
                    <LessonNodeArt lesson={lesson} locked={!unlocked} />

                    {isNextUp && (
                      <span className="absolute -top-3 px-2.5 py-0.5 rounded-lg bg-[#1CB0F6] text-white font-display font-black text-[10px] tracking-wide shadow whitespace-nowrap">
                        {t.home.startNowBadge}
                      </span>
                    )}
                  </motion.button>

                  {/* Lesson Title + Level */}
                  <div className="mt-3 text-center max-w-[240px]">
                    <h3 className="font-display font-black text-sm sm:text-base text-[var(--text-primary)] leading-snug">
                      {t.home.lessonLabel(lesson.order, lessonText.title)}
                    </h3>
                    <div
                      className="text-xs font-extrabold mt-0.5"
                      style={{ color: levelMeta.accentColor }}
                    >
                      {t.home.levelLabel(lesson.level)}
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-1">
                      {lessonText.subtitle}
                    </p>
                    <div className="text-[10px] font-mono-num font-bold text-[var(--text-secondary)] mt-0.5">
                      {t.home.wordsAndXp(lesson.words.length, lesson.xpReward)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {(remainingBelowCount > 0 || visibleCount > BATCH_SIZE) && (
            <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
              {remainingBelowCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick(profile.soundEnabled);
                    setVisibleCount((v) => v + BATCH_SIZE);
                  }}
                  className="btn-3d-blue px-6 py-3 rounded-2xl text-xs font-extrabold cursor-pointer"
                >
                  {t.home.showMoreLessons(
                    Math.min(BATCH_SIZE, remainingBelowCount),
                    remainingBelowCount.toLocaleString()
                  )}
                </button>
              )}
              {visibleCount > BATCH_SIZE && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick(profile.soundEnabled);
                    setVisibleCount(BATCH_SIZE);
                  }}
                  className="btn-3d-neutral px-5 py-3 rounded-2xl text-xs font-extrabold cursor-pointer"
                >
                  {t.home.collapseListBtn}
                </button>
              )}
            </div>
          )}
        </section>
      ) : (
        <section
          aria-label={t.grammar.headerTitle(selectedLevel, localizedLevel.title)}
          className="max-w-4xl mx-auto rounded-[32px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 sm:p-8 shadow-sm space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display font-black text-lg sm:text-xl text-[var(--text-primary)]">
                {t.grammar.headerTitle(selectedLevel, localizedLevel.title)}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {t.grammar.headerSubtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={handleJumpToCurrentGrammarUnit}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#8B5CF6]/12 hover:bg-[#8B5CF6]/20 text-xs font-extrabold text-[#6D28D9] dark:text-[#C4B5FD] cursor-pointer transition-colors self-start shrink-0"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{t.grammar.jumpToCurrentUnit}</span>
            </button>
          </div>

          {/* Topic Filter Chips */}
          {availableTopicsInLevel.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick(profile.soundEnabled);
                  setGrammarTopicFilter('ALL');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-colors ${
                  grammarTopicFilter === 'ALL'
                    ? 'bg-[#8B5CF6] text-white'
                    : 'bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {t.grammar.allTopics}
              </button>
              {availableTopicsInLevel.map((topic) => {
                const active = grammarTopicFilter === topic;
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick(profile.soundEnabled);
                      setGrammarTopicFilter(topic);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-colors ${
                      active
                        ? 'bg-[#8B5CF6] text-white'
                        : 'bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {t.grammar.topics[topic] || topic}
                  </button>
                );
              })}
            </div>
          )}

          {/* Grammar Unit Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredGrammarUnits.map((unit) => {
              const completed = profile.completedLessons.includes(unit.id);
              const starsEarned = profile.lessonStars?.[unit.id] || (completed ? 3 : 0);
              const isNext = isLevelUnlocked && !completed && nextGrammarUnit.id === unit.id;

              return (
                <div
                  key={unit.id}
                  ref={(el) => {
                    grammarCardRefs.current[unit.id] = el;
                  }}
                  className={`rounded-3xl border-2 p-5 flex flex-col justify-between gap-4 transition-all ${
                    !isLevelUnlocked
                      ? 'bg-[var(--bg-surface-muted)]/60 border-[var(--border-subtle)] opacity-70'
                      : completed
                      ? 'bg-[#ECFDF5]/60 dark:bg-[#123829]/40 border-[#58CC02]/60'
                      : isNext
                      ? 'bg-[#F5F3FF]/80 dark:bg-[#26164A]/50 border-[#8B5CF6] ring-2 ring-[#8B5CF6]/20'
                      : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[#8B5CF6]/70'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/15 text-2xl flex items-center justify-center shrink-0">
                          {unit.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-mono-num font-extrabold text-[#8B5CF6]">
                            {unit.level} · {t.grammar.unitBadge(unit.unitRange)}
                          </div>
                          <h3 className="font-display font-black text-base text-[var(--text-primary)] leading-snug">
                            {unit.title[profile.uiLanguage]}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              starsEarned >= s
                                ? 'text-[#FACC15] fill-[#FACC15]'
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {unit.subtitle[profile.uiLanguage]}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold text-[var(--text-secondary)]">
                      <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface-muted)]">
                        {t.grammar.rulesCount(unit.rules.length)}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface-muted)]">
                        {t.grammar.questionsCount(unit.questions.length)}
                      </span>
                      <span dir="ltr" className="px-2.5 py-1 rounded-lg bg-[#FF9600]/12 text-[#FF9600] font-mono-num">
                        +{unit.xpReward} XP
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!isLevelUnlocked}
                    onClick={() => {
                      if (!isLevelUnlocked) return;
                      soundEngine.playClick(profile.soundEnabled);
                      onStartGrammarUnit(unit);
                    }}
                    className={`w-full py-3 rounded-2xl font-display font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                      !isLevelUnlocked
                        ? 'bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] cursor-not-allowed'
                        : completed
                        ? 'btn-3d-neutral cursor-pointer'
                        : 'btn-3d-green cursor-pointer'
                    }`}
                  >
                    {!isLevelUnlocked ? (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>{t.home.lockedLabel}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>
                          {completed ? t.grammar.reviewUnit : t.grammar.startUnit}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
