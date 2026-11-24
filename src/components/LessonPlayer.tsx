import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CheckCircle2,
  Flame,
  Gauge,
  Sparkles,
  Star,
  Turtle,
  Volume2,
  X,
  XCircle,
} from 'lucide-react';
import { LessonExercise, LessonUnit, UiLanguage } from '../types/learning';
import { generateLessonExercises } from '../data/curriculum';
import { getUi } from '../lib/i18n';
import { soundEngine, VOICE_SPEED_OPTIONS } from '../lib/sound';
import { MiniGameStage } from './MiniGames';
import { triggerConfettiBurst } from './VfxOverlay';

interface LessonPlayerProps {
  lesson: LessonUnit;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  voiceSpeed: number;
  uiLanguage: UiLanguage;
  onChangeVoiceSpeed: (speed: number) => void;
  onTriggerBurst: (text: string, color: string, subtext?: string) => void;
  onComplete: (result: {
    lessonId: string;
    level: LessonUnit['level'];
    xpEarned: number;
    correctCount: number;
    totalCount: number;
    stars: number;
    masteredWordIds: string[];
  }) => void;
  onClose: () => void;
}

export function LessonPlayer({
  lesson,
  soundEnabled,
  voiceEnabled,
  voiceSpeed,
  uiLanguage,
  onChangeVoiceSpeed,
  onTriggerBurst,
  onComplete,
  onClose,
}: LessonPlayerProps) {
  const t = getUi(uiLanguage);
  const lp = t.lessonPlayer;
  const isRtl = uiLanguage === 'ar';
  const lessonTitle = t.coreLessons[lesson.id]?.title || lesson.title;

  const exercises = useMemo(() => generateLessonExercises(lesson), [lesson]);
  const [step, setStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [checkedState, setCheckedState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [combo, setCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalGraded, setTotalGraded] = useState(0);
  const [finished, setFinished] = useState(false);

  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongPairFlash, setWrongPairFlash] = useState<string | null>(null);

  const currentExercise = exercises[step];
  const progressPercent = finished
    ? 100
    : Math.round(((step + (checkedState !== 'idle' ? 0.6 : 0)) / exercises.length) * 100);

  const shuffledMeanings = useMemo(() => {
    if (!currentExercise?.matchPairs) return [];
    const copy = [...currentExercise.matchPairs];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, [currentExercise]);

  useEffect(() => {
    if (!currentExercise || finished) return;
    if (currentExercise.type === 'intro' || currentExercise.type === 'listen') {
      const timer = setTimeout(() => {
        soundEngine.speakWord(currentExercise.word.word, voiceEnabled, voiceSpeed);
      }, 220);
      return () => clearTimeout(timer);
    }
  }, [currentExercise, finished, voiceEnabled, voiceSpeed]);

  const isMiniGame =
    currentExercise?.type === 'mystery-card' ||
    currentExercise?.type === 'scramble' ||
    currentExercise?.type === 'memory-flip' ||
    currentExercise?.type === 'word-wheel' ||
    currentExercise?.type === 'speed-blitz';

  const getLocalizedPrompt = (ex: LessonExercise) => {
    switch (ex.type) {
      case 'intro':
        return lp.introPrompt;
      case 'choice':
        return lp.choicePrompt(ex.word.word);
      case 'listen':
        return lesson.id.startsWith('ox-deck-')
          ? lp.deckListenPrompt(lesson.level)
          : lp.listenPrompt;
      case 'context':
        return lp.contextPrompt;
      case 'match':
        return lp.coachMatch;
      case 'mystery-card':
      case 'scramble':
      case 'memory-flip':
      case 'word-wheel':
      case 'speed-blitz':
        return lp.minigamePrompts[ex.type] || ex.prompt;
      default:
        return ex.prompt;
    }
  };

  const coachTip = useMemo(() => {
    if (checkedState === 'correct') {
      if (combo >= 3) return lp.coachCorrectCombo(combo);
      return lp.coachCorrect;
    }
    if (checkedState === 'wrong') {
      return lp.coachWrong;
    }
    if (isMiniGame) {
      return lp.coachMinigame;
    }
    if (currentExercise?.type === 'intro') {
      return lp.coachIntro;
    }
    if (currentExercise?.type === 'match') {
      return lp.coachMatch;
    }
    return lp.coachDefault;
  }, [checkedState, combo, currentExercise, isMiniGame, lp]);

  const handleCheck = () => {
    if (!currentExercise) return;

    if (currentExercise.type === 'intro') {
      soundEngine.playClick(soundEnabled);
      advanceStep();
      return;
    }

    if (!selectedOption || checkedState !== 'idle') return;

    const isRight = selectedOption === currentExercise.correctAnswer;
    setTotalGraded((n) => n + 1);

    if (isRight) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setCorrectCount((c) => c + 1);
      setCheckedState('correct');
      soundEngine.playCorrect(soundEnabled, nextCombo);
      onTriggerBurst(
        nextCombo >= 2 ? `+10 XP · ${nextCombo}x!` : '+10 XP',
        '#58CC02',
        nextCombo >= 3 ? lp.coachCorrectCombo(nextCombo) : undefined
      );
      if (nextCombo >= 3) {
        soundEngine.playStreak(soundEnabled);
        triggerConfettiBurst('stars');
      }
    } else {
      setCombo(0);
      setCheckedState('wrong');
      soundEngine.playWrong(soundEnabled);
    }
  };

  const handleMatchRightTap = (pairId: string) => {
    if (!selectedLeftId || matchedIds.includes(pairId)) return;
    setTotalGraded((n) => n + 1);

    if (selectedLeftId === pairId) {
      const nextMatched = [...matchedIds, pairId];
      const nextCombo = combo + 1;
      setMatchedIds(nextMatched);
      setSelectedLeftId(null);
      setCombo(nextCombo);
      setCorrectCount((c) => c + 1);
      soundEngine.playCorrect(soundEnabled, nextCombo);
      onTriggerBurst('+5 XP', '#1CB0F6');

      if (currentExercise.matchPairs && nextMatched.length === currentExercise.matchPairs.length) {
        setCheckedState('correct');
        triggerConfettiBurst('small');
      }
    } else {
      setCombo(0);
      setWrongPairFlash(pairId);
      soundEngine.playWrong(soundEnabled);
      setTimeout(() => {
        setWrongPairFlash(null);
        setSelectedLeftId(null);
      }, 450);
    }
  };

  const advanceStep = (extraCorrect = 0, extraTotal = 0) => {
    setSelectedOption(null);
    setCheckedState('idle');
    setSelectedLeftId(null);
    setMatchedIds([]);

    const finalCorrect = correctCount + extraCorrect;
    const finalTotal = Math.max(totalGraded + extraTotal, 1);

    if (step + 1 >= exercises.length) {
      setFinished(true);
      soundEngine.playLessonComplete(soundEnabled);
      triggerConfettiBurst('celebration');
      const bonus = combo >= 2 ? 10 : 0;
      const acc = Math.round((finalCorrect / finalTotal) * 100);
      const stars = acc >= 85 ? 3 : acc >= 60 ? 2 : 1;
      onComplete({
        lessonId: lesson.id,
        level: lesson.level,
        xpEarned: lesson.xpReward + bonus,
        correctCount: finalCorrect,
        totalCount: finalTotal,
        stars,
        masteredWordIds: lesson.words.map((w) => w.id),
      });
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleFinishMiniGame = (mgCorrect: number, mgTotal: number) => {
    setCorrectCount((c) => c + mgCorrect);
    setTotalGraded((t) => t + mgTotal);
    if (mgCorrect > 0) {
      setCombo((c) => c + 1);
    }
    advanceStep(mgCorrect, mgTotal);
  };

  const accuracyPct =
    totalGraded > 0 ? Math.round((correctCount / totalGraded) * 100) : 100;
  const earnedStars = accuracyPct >= 85 ? 3 : accuracyPct >= 60 ? 2 : 1;

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      role="dialog"
      aria-modal="true"
      aria-label={lp.lessonHeading(lesson.order, lessonTitle)}
      className="fixed inset-0 z-50 bg-[var(--bg-canvas)] flex flex-col overflow-y-auto"
    >
      {/* Top Progress Bar */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-3 flex items-center gap-3 flex-wrap sm:flex-nowrap">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick(soundEnabled);
            onClose();
          }}
          aria-label={lp.exitAria}
          className="w-11 h-11 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors shrink-0"
        >
          <X className="w-5 h-5" />
        </button>

        <div
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="flex-1 min-w-[140px] h-4 rounded-full bg-[var(--bg-surface-muted)] overflow-hidden border border-[var(--border-subtle)]"
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#58CC02] to-[#7CE826]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          />
        </div>

        <div className="flex items-center gap-1 px-2 py-1 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shrink-0">
          <Gauge className="w-3.5 h-3.5 text-[#1CB0F6] mx-1" />
          {VOICE_SPEED_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                soundEngine.playClick(soundEnabled);
                onChangeVoiceSpeed(opt.value);
              }}
              className={`px-2 py-1 rounded-xl text-[11px] font-mono-num font-bold cursor-pointer transition-colors ${
                Math.abs(voiceSpeed - opt.value) < 0.05
                  ? 'bg-[#1CB0F6] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-mono-num text-sm font-bold shrink-0">
          <Flame
            className={`w-4 h-4 ${
              combo >= 2 ? 'text-[#FF9600]' : 'text-[var(--text-secondary)]'
            }`}
          />
          <span dir="ltr">{combo}x</span>
        </div>
      </div>

      {/* Main Exercise Arena */}
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-4 flex flex-col justify-between">
        {finished ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="my-auto rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-10 text-center shadow-lg"
          >
            <div className="flex items-center justify-center gap-3 mb-5">
              {[1, 2, 3].map((s) => (
                <motion.div
                  key={s}
                  initial={{ scale: 0, rotate: -25 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 280,
                    damping: 18,
                    delay: s * 0.14,
                  }}
                >
                  <Star
                    className={`w-12 h-12 ${
                      earnedStars >= s
                        ? 'text-[#FACC15] fill-[#FACC15] drop-shadow-md'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </motion.div>
              ))}
            </div>

            <div className="inline-flex items-center gap-2 text-[#58CC02] font-display font-black text-sm mb-2">
              <Sparkles className="w-4 h-4" />
              <span>{lp.completedBadge}</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[var(--text-primary)] mb-2">
              {lp.lessonHeading(lesson.order, lessonTitle)}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-8">
              {lp.practicedSummary(lesson.words.length, lesson.level)}
            </p>

            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="rounded-2xl bg-[var(--bg-surface-muted)] p-4">
                <div className="text-xs font-bold text-[var(--text-secondary)] mb-1">
                  {lp.xpEarnedLabel}
                </div>
                <div dir="ltr" className="font-mono-num text-2xl font-extrabold text-[#FF9600]">
                  +{lesson.xpReward + (combo >= 2 ? 10 : 0)}
                </div>
              </div>
              <div className="rounded-2xl bg-[var(--bg-surface-muted)] p-4">
                <div className="text-xs font-bold text-[var(--text-secondary)] mb-1">
                  {lp.accuracyLabel}
                </div>
                <div dir="ltr" className="font-mono-num text-2xl font-extrabold text-[#58CC02]">
                  {accuracyPct}%
                </div>
              </div>
              <div className="rounded-2xl bg-[var(--bg-surface-muted)] p-4">
                <div className="text-xs font-bold text-[var(--text-secondary)] mb-1">
                  {lp.wordsLabel}
                </div>
                <div dir="ltr" className="font-mono-num text-2xl font-extrabold text-[#1CB0F6]">
                  {lesson.words.length}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick(soundEnabled);
                onClose();
              }}
              className="btn-3d-green w-full sm:w-auto px-10 py-4 rounded-2xl font-display font-black text-base cursor-pointer"
            >
              {lp.backToPathBtn}
            </button>
          </motion.div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-4 py-3 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[var(--text-secondary)]">
                  <Sparkles className="w-4 h-4 text-[#1CB0F6] shrink-0" />
                  <span>{coachTip}</span>
                </div>
                <span dir="ltr" className="font-mono-num text-xs font-bold text-[var(--text-secondary)] shrink-0">
                  {step + 1}/{exercises.length}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentExercise.id}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.22 }}
                  className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-8 shadow-sm"
                >
                  <div className="text-xs font-bold text-[#1CB0F6] mb-2">
                    {t.home.levelLabel(lesson.level)} · {lp.lessonHeading(lesson.order, lessonTitle)}
                  </div>
                  <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[var(--text-primary)] mb-5">
                    {getLocalizedPrompt(currentExercise)}
                  </h2>

                  {/* 1: Intro */}
                  {currentExercise.type === 'intro' && (
                    <div className="space-y-5">
                      <div className="rounded-2xl bg-[var(--bg-surface-muted)] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-3 flex-wrap">
                            <span
                              dir="ltr"
                              className="font-latin font-black text-3xl text-[var(--text-primary)]"
                            >
                              {currentExercise.word.word}
                            </span>
                            <span dir="ltr" className="font-mono-num text-sm text-[var(--text-secondary)]">
                              {currentExercise.word.ipa}
                            </span>
                            <span dir="ltr" className="text-xs font-bold text-[#1CB0F6] uppercase">
                              {currentExercise.word.pos}
                            </span>
                          </div>
                          <p dir="ltr" className="mt-2 text-base font-bold text-[var(--text-primary)] text-left">
                            {currentExercise.word.definition}
                          </p>
                          <p className="mt-1 text-sm font-bold text-[#F97316]">
                            {currentExercise.word.translations[uiLanguage === 'en' ? 'ar' : uiLanguage]}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              soundEngine.speakWord(currentExercise.word.word, true, voiceSpeed)
                            }
                            aria-label={t.daily.speakWordAria(currentExercise.word.word)}
                            className="btn-3d-blue px-4 py-3 rounded-2xl flex items-center gap-2 font-bold text-sm cursor-pointer"
                          >
                            <Volume2 className="w-5 h-5" />
                            <span>{lp.listenBtn}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              soundEngine.speakWord(currentExercise.word.word, true, 0.6)
                            }
                            aria-label={t.daily.speakSlowAria(currentExercise.word.word)}
                            className="btn-3d-neutral px-3 py-3 rounded-2xl flex items-center justify-center cursor-pointer"
                          >
                            <Turtle className="w-5 h-5 text-[#1CB0F6]" />
                          </button>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[var(--border-subtle)] p-4 flex items-center justify-between gap-3">
                        <p
                          dir="ltr"
                          className="font-latin text-sm sm:text-base italic text-[var(--text-secondary)] text-left"
                        >
                          “{currentExercise.word.example}”
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            soundEngine.speakWord(currentExercise.word.example, true, voiceSpeed)
                          }
                          aria-label={t.daily.speakWordAria(currentExercise.word.example)}
                          className="w-10 h-10 rounded-xl bg-[var(--bg-surface-muted)] hover:bg-[#1CB0F6]/15 text-[#1CB0F6] flex items-center justify-center shrink-0 cursor-pointer"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2 & 3: Choice / Listen */}
                  {(currentExercise.type === 'choice' || currentExercise.type === 'listen') && (
                    <div className="space-y-4">
                      {currentExercise.type === 'listen' ? (
                        <div className="flex items-center gap-3 mb-4">
                          <button
                            type="button"
                            onClick={() =>
                              soundEngine.speakWord(currentExercise.word.word, true, voiceSpeed)
                            }
                            className="btn-3d-blue px-6 py-4 rounded-2xl flex items-center gap-3 font-display font-extrabold text-base cursor-pointer"
                          >
                            <Volume2 className="w-6 h-6" />
                            <span>{lp.playAudioBtn(voiceSpeed)}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              soundEngine.speakWord(currentExercise.word.word, true, 0.6)
                            }
                            aria-label={t.daily.speakSlowAria(currentExercise.word.word)}
                            className="btn-3d-neutral px-4 py-4 rounded-2xl flex items-center gap-2 font-bold text-sm cursor-pointer"
                          >
                            <Turtle className="w-5 h-5 text-[#1CB0F6]" />
                            <span>{lp.slowBtn}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 mb-2">
                          <button
                            type="button"
                            onClick={() =>
                              soundEngine.speakWord(currentExercise.word.word, true, voiceSpeed)
                            }
                            className="w-11 h-11 rounded-2xl bg-[#1CB0F6]/12 text-[#1CB0F6] flex items-center justify-center cursor-pointer hover:bg-[#1CB0F6]/20 transition-colors"
                            aria-label={t.daily.speakWordAria(currentExercise.word.word)}
                          >
                            <Volume2 className="w-5 h-5" />
                          </button>
                          <span dir="ltr" className="font-mono-num text-sm text-[var(--text-secondary)]">
                            {currentExercise.word.ipa} · {currentExercise.word.pos}
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {currentExercise.options?.map((opt) => {
                          const isSelected = selectedOption === opt;
                          const isCorrectOption = opt === currentExercise.correctAnswer;
                          let cardStyle =
                            'bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] hover:border-[#1CB0F6]';
                          if (checkedState === 'idle' && isSelected) {
                            cardStyle =
                              'bg-[#1CB0F6]/10 border-2 border-[#1CB0F6] shadow-[0_3px_0_#1CB0F6]';
                          } else if (checkedState !== 'idle' && isCorrectOption) {
                            cardStyle =
                              'bg-[#58CC02]/15 border-2 border-[#58CC02] text-[#3a8b00] dark:text-[#7CE826]';
                          } else if (checkedState === 'wrong' && isSelected) {
                            cardStyle =
                              'bg-[#FF4B4B]/12 border-2 border-[#FF4B4B] text-[#dc2626] dark:text-[#FF7878]';
                          }

                          return (
                            <motion.button
                              key={opt}
                              type="button"
                              dir="ltr"
                              disabled={checkedState !== 'idle'}
                              whileTap={checkedState === 'idle' ? { scale: 0.98 } : undefined}
                              onClick={() => {
                                soundEngine.playClick(soundEnabled);
                                setSelectedOption(opt);
                                if (currentExercise.type === 'listen') {
                                  soundEngine.speakWord(opt, voiceEnabled, voiceSpeed);
                                }
                              }}
                              className={`font-latin text-left rounded-2xl p-4 font-bold text-sm sm:text-base transition-all cursor-pointer min-h-[56px] ${cardStyle}`}
                            >
                              {opt}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 4: Context */}
                  {currentExercise.type === 'context' && (
                    <div className="space-y-5">
                      <div
                        dir="ltr"
                        className="font-latin rounded-2xl bg-[var(--bg-surface-muted)] p-5 text-base sm:text-lg font-semibold leading-relaxed text-[var(--text-primary)] text-left"
                      >
                        {currentExercise.sentenceWithBlank}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {currentExercise.options?.map((opt) => {
                          const isSelected = selectedOption === opt;
                          const isCorrectOption = opt === currentExercise.correctAnswer;
                          let style =
                            'bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] hover:border-[#1CB0F6]';
                          if (checkedState === 'idle' && isSelected) {
                            style =
                              'bg-[#1CB0F6]/12 border-2 border-[#1CB0F6] shadow-[0_3px_0_#1CB0F6]';
                          } else if (checkedState !== 'idle' && isCorrectOption) {
                            style =
                              'bg-[#58CC02]/15 border-2 border-[#58CC02] text-[#3a8b00] dark:text-[#7CE826]';
                          } else if (checkedState === 'wrong' && isSelected) {
                            style = 'bg-[#FF4B4B]/12 border-2 border-[#FF4B4B] text-[#dc2626]';
                          }
                          return (
                            <button
                              key={opt}
                              type="button"
                              dir="ltr"
                              disabled={checkedState !== 'idle'}
                              onClick={() => {
                                soundEngine.playClick(soundEnabled);
                                soundEngine.speakWord(opt, voiceEnabled, voiceSpeed);
                                setSelectedOption(opt);
                              }}
                              className={`font-latin rounded-2xl p-4 font-extrabold text-base text-center transition-all cursor-pointer ${style}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 5: Match */}
                  {currentExercise.type === 'match' && currentExercise.matchPairs && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2.5">
                        {currentExercise.matchPairs.map((pair) => {
                          const isMatched = matchedIds.includes(pair.id);
                          const isSelected = selectedLeftId === pair.id;
                          return (
                            <button
                              key={pair.id}
                              type="button"
                              dir="ltr"
                              disabled={isMatched}
                              onClick={() => {
                                soundEngine.playClick(soundEnabled);
                                soundEngine.speakWord(pair.word, voiceEnabled, voiceSpeed);
                                setSelectedLeftId(pair.id);
                              }}
                              className={`font-latin w-full rounded-2xl p-3.5 font-extrabold text-left transition-all cursor-pointer border-2 ${
                                isMatched
                                  ? 'bg-[#58CC02]/12 border-[#58CC02]/50 text-[#46A302] dark:text-[#7CE826] opacity-70'
                                  : isSelected
                                  ? 'bg-[#1CB0F6]/14 border-[#1CB0F6] shadow-[0_3px_0_#1CB0F6]'
                                  : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[#1CB0F6]'
                              }`}
                            >
                              {pair.word}
                            </button>
                          );
                        })}
                      </div>

                      <div className="space-y-2.5">
                        {shuffledMeanings.map((pair) => {
                          const isMatched = matchedIds.includes(pair.id);
                          const isFlashing = wrongPairFlash === pair.id;
                          return (
                            <button
                              key={`m-${pair.id}`}
                              type="button"
                              dir="ltr"
                              disabled={isMatched || !selectedLeftId}
                              onClick={() => handleMatchRightTap(pair.id)}
                              className={`font-latin w-full rounded-2xl p-3.5 text-sm font-semibold text-left transition-all cursor-pointer border-2 ${
                                isMatched
                                  ? 'bg-[#58CC02]/12 border-[#58CC02]/50 text-[#46A302] dark:text-[#7CE826] opacity-70'
                                  : isFlashing
                                  ? 'bg-[#FF4B4B]/15 border-[#FF4B4B] text-[#dc2626]'
                                  : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[#1CB0F6]'
                              }`}
                            >
                              {pair.meaning}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Mini-Games */}
                  {isMiniGame && (
                    <MiniGameStage
                      exercise={currentExercise}
                      allLessonWords={lesson.words}
                      soundEnabled={soundEnabled}
                      voiceEnabled={voiceEnabled}
                      voiceSpeed={voiceSpeed}
                      uiLanguage={uiLanguage}
                      onTriggerBurst={onTriggerBurst}
                      onFinishMiniGame={handleFinishMiniGame}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Controls */}
            <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {checkedState === 'correct' && (
                  <div className="flex items-center gap-2.5 text-[#46A302] dark:text-[#7CE826] font-display font-extrabold text-base">
                    <CheckCircle2 className="w-6 h-6 shrink-0" />
                    <span>{lp.excellentFeedback}</span>
                  </div>
                )}
                {checkedState === 'wrong' && (
                  <div className="flex items-center gap-2.5 text-[#dc2626] dark:text-[#FF7878] font-bold text-sm">
                    <XCircle className="w-6 h-6 shrink-0" />
                    <span>
                      {lp.correctAnswerWas}{' '}
                      <strong dir="ltr" className="font-latin font-extrabold">
                        {currentExercise.correctAnswer}
                      </strong>
                    </span>
                  </div>
                )}
                {checkedState === 'idle' && (
                  <div className="text-xs font-bold text-[var(--text-secondary)]">
                    {isMiniGame
                      ? lp.minigamePromptHint
                      : currentExercise.type === 'intro'
                      ? lp.introHint
                      : currentExercise.type === 'match'
                      ? lp.matchedProgress(
                          matchedIds.length,
                          currentExercise.matchPairs?.length ?? 4
                        )
                      : lp.selectAnswerHint}
                  </div>
                )}

                <div className="w-full sm:w-auto sm:ms-auto">
                  {currentExercise.type === 'intro' ? (
                    <button
                      type="button"
                      onClick={handleCheck}
                      className="btn-3d-green w-full sm:w-auto px-8 py-3.5 rounded-2xl font-display font-black text-base cursor-pointer"
                    >
                      {lp.understoodNextBtn}
                    </button>
                  ) : checkedState !== 'idle' ? (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick(soundEnabled);
                        advanceStep();
                      }}
                      className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-display font-black text-base cursor-pointer ${
                        checkedState === 'correct' ? 'btn-3d-green' : 'btn-3d-blue'
                      }`}
                    >
                      {lp.continueBtn}
                    </button>
                  ) : !isMiniGame && currentExercise.type !== 'match' ? (
                    <button
                      type="button"
                      disabled={!selectedOption}
                      onClick={handleCheck}
                      className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-display font-black text-base transition-all ${
                        selectedOption
                          ? 'btn-3d-green cursor-pointer'
                          : 'bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] cursor-not-allowed'
                      }`}
                    >
                      {lp.checkBtn}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
