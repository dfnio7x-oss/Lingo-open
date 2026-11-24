import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  ChevronLeft,
  Flame,
  Lock,
  Play,
  Settings,
  Star,
  Target,
  Unlock,
  Volume2,
  Zap,
} from 'lucide-react';
import {
  CefrLevel,
  LessonUnit,
  NavTab,
  UserProfileData,
} from '../types/learning';
import {
  ALL_LESSONS,
  ALL_WORDS,
  CEFR_ORDER,
  getMergedLevelLessons,
  LEVEL_META,
} from '../data/curriculum';
import { OXFORD_ALL_WORDS } from '../data/oxford3000';
import { soundEngine } from '../lib/sound';
import { AVATAR_OPTIONS } from './avatarOptions';
import { LessonNodeArt } from './LessonNodeArt';
import { LevelBadgeArt } from './LevelBadgeArt';

interface HomeViewProps {
  profile: UserProfileData;
  onNavigateTab: (tab: NavTab) => void;
  onStartLesson: (lesson: LessonUnit) => void;
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
  onUnlockLevel,
  onOpenVault,
}: HomeViewProps) {
  const [selectedLevel, setSelectedLevel] = useState<CefrLevel>(profile.difficulty || 'A1');
  const [wordIndex, setWordIndex] = useState(0);
  const [rangeStart, setRangeStart] = useState(0);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  const levelMeta = LEVEL_META[selectedLevel];
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
    AVATAR_OPTIONS.find((a) => a.id === profile.avatarId) || AVATAR_OPTIONS[0];
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

  const levelCoreWords = useMemo(
    () => ALL_WORDS.filter((w) => w.level === selectedLevel),
    [selectedLevel]
  );
  const spotlightWord = levelCoreWords[wordIndex % levelCoreWords.length] || ALL_WORDS[0];

  const totalCatalogWords = ALL_WORDS.length + OXFORD_ALL_WORDS.length;
  const dailyPct = Math.min(100, Math.round((profile.dailyXp / Math.max(profile.dailyGoal, 1)) * 100));

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
        label: `الدروس ${s + 1} – ${end}`,
      });
    }
    return sections;
  }, [levelLessons.length]);

  const ringRadius = 28;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - levelPercent / 100);
  const remainingBelowCount = Math.max(0, levelLessons.length - (rangeStart + visiblePathLessons.length));

  return (
    <div className="space-y-5">
      {/* الشريط العلوي: السلسلة والنقاط في مستطيل مقوس | الحساب والإعدادات في مستطيل مقوس */}
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div
          aria-label={`سلسلة ${profile.streak} أيام و ${profile.xp} نقطة خبرة`}
          className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm"
        >
          <div className="flex items-center gap-1.5">
            <Flame className="w-5 h-5 text-[#FF9600] fill-[#FF9600]" />
            <span className="font-mono-num font-black text-base text-[var(--text-primary)]">
              {profile.streak}
            </span>
            <span className="text-xs font-bold text-[var(--text-secondary)]">يوم</span>
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
            <span>بنك الكلمات</span>
          </button>

          <div className="inline-flex items-center p-1 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick(profile.soundEnabled);
                onNavigateTab('you');
              }}
              aria-label="فتح الحساب الشخصي"
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
              <span>حسابي</span>
              <ChevronLeft className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            </button>

            <span className="h-4 w-px bg-[var(--border-subtle)] mx-0.5" aria-hidden="true" />

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick(profile.soundEnabled);
                onNavigateTab('setting');
              }}
              aria-label="فتح الإعدادات"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[var(--bg-surface-muted)] text-xs font-bold text-[var(--text-primary)] cursor-pointer transition-colors whitespace-nowrap shrink-0"
            >
              <Settings className="w-4 h-4 text-[#FF9600]" />
              <span>الإعدادات</span>
            </button>
          </div>
        </div>
      </header>

      {/* شريط اختيار مستويات اللغة (A1 حتى C2) */}
      <nav
        role="tablist"
        aria-label="اختر مستوى اللغة الإنجليزية"
        className="w-full p-1.5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm grid grid-cols-3 sm:grid-cols-6 gap-1.5"
      >
        {CEFR_ORDER.map((lvl) => {
          const meta = LEVEL_META[lvl];
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
              <div className="text-right min-w-0">
                <div className="font-display font-black text-xs sm:text-sm flex items-center gap-1 leading-none">
                  <span dir="ltr">{lvl}</span>
                  {!unlocked && (
                    <Lock className="w-3 h-3 opacity-80 shrink-0" aria-label="مغلق" />
                  )}
                </div>
                <div
                  className={`text-[10px] font-bold truncate mt-0.5 ${
                    isSelected ? 'text-white/90' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {meta.title}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* بطاقة المستوى الرئيسية */}
      <section
        aria-label={`تقدم المستوى ${selectedLevel}`}
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
                  {levelMeta.title}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl leading-relaxed">
                {levelMeta.description}
              </p>

              {/* إحصائيات واضحة تحت اسم المستوى: الكلمات المتعلمة والدروس المتبقية */}
              <div className="flex items-center gap-3 flex-wrap pt-0.5 text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                <span className="inline-flex items-center gap-1.5 font-mono-num">
                  <span aria-hidden="true">📚</span>
                  <span>
                    تعلّمت {learnedInLevelCount.toLocaleString()} من {totalWordsInLevel.toLocaleString()} كلمة
                  </span>
                </span>
                <span className="text-[var(--text-secondary)]" aria-hidden="true">
                  ·
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono-num">
                  <span aria-hidden="true">🎯</span>
                  <span>
                    متبقي {remainingLessonsCount.toLocaleString()} درس ({completedInLevelCount}/{levelLessons.length})
                  </span>
                </span>
              </div>

              <div className="pt-1 flex items-center gap-3 flex-wrap">
                {isLevelUnlocked ? (
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
                      متابعة: الدرس {nextLesson.order} · {nextLesson.title}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onUnlockLevel(selectedLevel)}
                    className="btn-3d-blue px-6 py-3 rounded-2xl font-display font-black text-sm inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>
                      فتح المستوى {selectedLevel} · {levelMeta.title}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* حلقة النسبة المئوية المتحركة */}
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
                {levelPercent}%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* المحتوى الرئيسي: مسار الدروس المتعرج + العمود الجانبي */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section
          aria-label="مسار الدروس"
          className="lg:col-span-8 rounded-[32px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] py-8 px-4 sm:px-8 shadow-sm"
        >
          <div className="text-center mb-6 space-y-2">
            <h2 className="font-display font-black text-lg sm:text-xl text-[var(--text-primary)]">
              مسار المستوى {selectedLevel} · {levelMeta.title}
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              اسحب للأسفل واضغط على أي درس مفتوح للتدرب مع ألعاب مصغرة عشوائية
            </p>

            {/* انتقال سريع لمجموعات الدروس عند وجود عدد كبير من الدروس (مثل C2) */}
            {jumpSections.length > 0 && (
              <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
                <label
                  htmlFor="lesson-range-jump"
                  className="text-xs font-bold text-[var(--text-secondary)]"
                >
                  انتقال سريع:
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
                    العودة للأول
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="relative flex flex-col items-center space-y-8">
            {visiblePathLessons.map((lesson, idx) => {
              const globalIndex = rangeStart + idx;
              const completed = (profile.completedLessons || []).includes(lesson.id);
              const unlocked = isLessonUnlocked(lesson, globalIndex);
              const starsEarned = profile.lessonStars?.[lesson.id] || (completed ? 3 : 0);
              const offsetX = WINDING_OFFSETS[globalIndex % WINDING_OFFSETS.length];
              const isNextUp = unlocked && !completed && nextLesson.id === lesson.id;

              return (
                <div
                  key={lesson.id}
                  className="relative flex flex-col items-center"
                  style={{ transform: `translateX(${offsetX}px)` }}
                >
                  {idx < visiblePathLessons.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="absolute top-[118px] w-0.5 h-10 border-l-2 border-dashed border-slate-300 dark:border-slate-600 pointer-events-none"
                    />
                  )}

                  {/* النجوم الثلاث فوق الدرس */}
                  <div
                    className="flex items-center gap-1 mb-2"
                    aria-label={`${starsEarned} من 3 نجوم`}
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

                  {/* أيقونة الدرس الدائرية */}
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
                    aria-label={`الدرس ${lesson.order}: ${lesson.title} — المستوى ${lesson.level}`}
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
                      <span className="absolute -top-3 px-2.5 py-0.5 rounded-lg bg-[#1CB0F6] text-white font-display font-black text-[10px] tracking-wide shadow">
                        ابدأ الآن
                      </span>
                    )}
                  </motion.button>

                  {/* رقم الدرس + اسم الموضوع، وتحته مباشرة رقم المستوى */}
                  <div className="mt-3 text-center max-w-[240px]">
                    <h3 className="font-display font-black text-sm sm:text-base text-[var(--text-primary)] leading-snug">
                      الدرس {lesson.order} · {lesson.title}
                    </h3>
                    <div
                      className="text-xs font-extrabold mt-0.5"
                      style={{ color: levelMeta.accentColor }}
                    >
                      المستوى <span dir="ltr">{lesson.level}</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-1">
                      {lesson.subtitle}
                    </p>
                    <div className="text-[10px] font-mono-num font-bold text-[var(--text-secondary)] mt-0.5">
                      {lesson.words.length} كلمة · +{lesson.xpReward} XP
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
                  عرض {Math.min(BATCH_SIZE, remainingBelowCount)} درساً إضافياً (متبقي{' '}
                  {remainingBelowCount.toLocaleString()})
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
                  تقليص القائمة
                </button>
              )}
            </div>
          )}
        </section>

        {/* العمود الجانبي: الهدف اليومي + كلمة مميزة */}
        <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-6">
          <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-[#58CC02]/15 text-[#58CC02] flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-[var(--text-primary)]">
                    الهدف اليومي
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    مرحباً {profile.displayName} · واصل الاستمرار
                  </p>
                </div>
              </div>
              <span dir="ltr" className="font-mono-num font-black text-sm text-[#58CC02]">
                {profile.dailyXp}/{profile.dailyGoal} XP
              </span>
            </div>

            <div className="h-3 rounded-full bg-[var(--bg-surface-muted)] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(dailyPct, 4)}%` }}
                transition={{ duration: 0.6 }}
                className="h-full rounded-full bg-gradient-to-r from-[#58CC02] to-[#7CE826]"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>{profile.dailyLessons} دروس اليوم</span>
              <span>{dailyPct >= 100 ? 'اكتمل الهدف اليومي!' : `أنجزت ${dailyPct}%`}</span>
            </div>
          </div>

          {spotlightWord && (
            <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-[#1CB0F6]">
                  كلمة مميزة · المستوى {selectedLevel}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick(profile.soundEnabled);
                    setWordIndex((i) => i + 1);
                  }}
                  className="text-xs font-bold text-[var(--text-secondary)] hover:text-[#1CB0F6] cursor-pointer"
                >
                  الكلمة التالية ←
                </button>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3
                    dir="ltr"
                    className="font-latin font-black text-2xl text-[var(--text-primary)] text-left"
                  >
                    {spotlightWord.word}
                  </h3>
                  <div
                    dir="ltr"
                    className="text-xs font-mono-num text-[var(--text-secondary)] text-left"
                  >
                    {spotlightWord.ipa} · {spotlightWord.pos}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    soundEngine.speakWord(spotlightWord.word, true, profile.voiceSpeed)
                  }
                  aria-label={`نطق كلمة ${spotlightWord.word}`}
                  className="btn-3d-blue w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              <p dir="ltr" className="font-latin text-sm text-[var(--text-primary)] leading-snug text-left">
                {spotlightWord.definition}
              </p>
              <p className="text-xs font-bold text-[#F97316]">
                {spotlightWord.translations[profile.uiLanguage === 'en' ? 'ar' : profile.uiLanguage]}
              </p>
              <p
                dir="ltr"
                className="font-latin text-xs italic text-[var(--text-secondary)] bg-[var(--bg-surface-muted)] rounded-xl p-3 text-left"
              >
                “{spotlightWord.example}”
              </p>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick(profile.soundEnabled);
                  onOpenVault('ALL');
                }}
                className="btn-3d-neutral w-full py-2.5 rounded-2xl text-xs font-extrabold cursor-pointer"
              >
                استكشاف جميع الكلمات ({totalCatalogWords.toLocaleString()})
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
