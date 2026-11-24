import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Flame,
  Gauge,
  Sparkles,
  Star,
  Volume2,
  X,
  XCircle,
} from 'lucide-react';
import { CefrLevel, GrammarUnit, UiLanguage } from '../types/learning';
import { getUi } from '../lib/i18n';
import { soundEngine, VOICE_SPEED_OPTIONS } from '../lib/sound';
import { triggerConfettiBurst } from './VfxOverlay';

interface GrammarLessonPlayerProps {
  unit: GrammarUnit;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  voiceSpeed: number;
  uiLanguage: UiLanguage;
  onChangeVoiceSpeed: (speed: number) => void;
  onTriggerBurst: (text: string, color: string, subtext?: string) => void;
  onComplete: (result: {
    lessonId: string;
    level: CefrLevel;
    xpEarned: number;
    correctCount: number;
    totalCount: number;
    stars: number;
    masteredWordIds: string[];
  }) => void;
  onClose: () => void;
}

export function GrammarLessonPlayer({
  unit,
  soundEnabled,
  voiceEnabled,
  voiceSpeed,
  uiLanguage,
  onChangeVoiceSpeed,
  onTriggerBurst,
  onComplete,
  onClose,
}: GrammarLessonPlayerProps) {
  const t = getUi(uiLanguage);
  const isRtl = uiLanguage === 'ar';

  const [stage, setStage] = useState<'learn' | 'practice'>('learn');
  const [ruleIdx, setRuleIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [checkedState, setCheckedState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [combo, setCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const totalSteps = unit.rules.length + unit.questions.length;
  const completedSteps =
    stage === 'learn'
      ? ruleIdx
      : unit.rules.length + questionIdx + (checkedState !== 'idle' ? 0.6 : 0);
  const progressPct = finished
    ? 100
    : Math.min(100, Math.round((completedSteps / Math.max(totalSteps, 1)) * 100));

  const currentRule = unit.rules[ruleIdx];
  const currentQuestion = unit.questions[questionIdx];

  const handleCheckAnswer = () => {
    if (!currentQuestion || !selectedOption || checkedState !== 'idle') return;
    const isRight = selectedOption === currentQuestion.correctAnswer;

    if (isRight) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setCorrectCount((c) => c + 1);
      setCheckedState('correct');
      soundEngine.playCorrect(soundEnabled, nextCombo);
      onTriggerBurst(
        nextCombo >= 2 ? `+10 XP · ${nextCombo}x!` : '+10 XP',
        '#58CC02'
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

  const handleNextQuestion = () => {
    soundEngine.playClick(soundEnabled);
    setSelectedOption(null);
    setCheckedState('idle');

    if (questionIdx + 1 >= unit.questions.length) {
      setFinished(true);
      soundEngine.playLessonComplete(soundEnabled);
      triggerConfettiBurst('celebration');
      const bonus = combo >= 2 ? 10 : 0;
      const totalQ = Math.max(unit.questions.length, 1);
      const acc = Math.round((correctCount / totalQ) * 100);
      const stars = acc >= 85 ? 3 : acc >= 60 ? 2 : 1;
      onComplete({
        lessonId: unit.id,
        level: unit.level,
        xpEarned: unit.xpReward + bonus,
        correctCount,
        totalCount: totalQ,
        stars,
        masteredWordIds: [],
      });
    } else {
      setQuestionIdx((idx) => idx + 1);
    }
  };

  const accuracyPct =
    unit.questions.length > 0
      ? Math.round((correctCount / unit.questions.length) * 100)
      : 100;
  const earnedStars = accuracyPct >= 85 ? 3 : accuracyPct >= 60 ? 2 : 1;

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      role="dialog"
      aria-modal="true"
      aria-label={unit.title[uiLanguage]}
      className="fixed inset-0 z-50 bg-[var(--bg-canvas)] flex flex-col overflow-y-auto"
    >
      {/* Top Bar */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-3 flex items-center gap-3 flex-wrap sm:flex-nowrap">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick(soundEnabled);
            onClose();
          }}
          aria-label={t.lessonPlayer.exitAria}
          className="w-11 h-11 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors shrink-0"
        >
          <X className="w-5 h-5" />
        </button>

        <div
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          className="flex-1 min-w-[140px] h-4 rounded-full bg-[var(--bg-surface-muted)] overflow-hidden border border-[var(--border-subtle)]"
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#1CB0F6]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          />
        </div>

        {/* Speed Selector */}
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

      {/* Main Arena */}
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

            <div className="inline-flex items-center gap-2 text-[#8B5CF6] font-display font-black text-sm mb-2">
              <Sparkles className="w-4 h-4" />
              <span>{t.grammar.unitCompletedTitle}</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[var(--text-primary)] mb-2">
              {unit.title[uiLanguage]}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-8">
              {t.grammar.unitCompletedDesc(unit.level)}
            </p>

            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="rounded-2xl bg-[var(--bg-surface-muted)] p-4">
                <div className="text-xs font-bold text-[var(--text-secondary)] mb-1">
                  {t.lessonPlayer.xpEarnedLabel}
                </div>
                <div dir="ltr" className="font-mono-num text-2xl font-extrabold text-[#FF9600]">
                  +{unit.xpReward + (combo >= 2 ? 10 : 0)}
                </div>
              </div>
              <div className="rounded-2xl bg-[var(--bg-surface-muted)] p-4">
                <div className="text-xs font-bold text-[var(--text-secondary)] mb-1">
                  {t.lessonPlayer.accuracyLabel}
                </div>
                <div dir="ltr" className="font-mono-num text-2xl font-extrabold text-[#58CC02]">
                  {accuracyPct}%
                </div>
              </div>
              <div className="rounded-2xl bg-[var(--bg-surface-muted)] p-4">
                <div className="text-xs font-bold text-[var(--text-secondary)] mb-1">
                  {t.grammar.questionsCount(unit.questions.length)}
                </div>
                <div dir="ltr" className="font-mono-num text-2xl font-extrabold text-[#8B5CF6]">
                  {correctCount}/{unit.questions.length}
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
              {t.grammar.backToGrammarPath}
            </button>
          </motion.div>
        ) : (
          <>
            <div className="space-y-4">
              {/* Stage Switcher Pill + Unit Info */}
              <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg leading-none">{unit.icon}</span>
                  <div className="min-w-0">
                    <div className="font-display font-extrabold text-xs sm:text-sm text-[var(--text-primary)] truncate">
                      {unit.title[uiLanguage]}
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)] font-mono-num">
                      {unit.level} · {t.grammar.unitBadge(unit.unitRange)}
                    </div>
                  </div>
                </div>

                <div className="inline-flex items-center p-1 rounded-xl bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick(soundEnabled);
                      setStage('learn');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition-colors ${
                      stage === 'learn'
                        ? 'bg-[#8B5CF6] text-white'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {t.grammar.learnTab}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick(soundEnabled);
                      setStage('practice');
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition-colors ${
                      stage === 'practice'
                        ? 'bg-[#1CB0F6] text-white'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {t.grammar.practiceTab}
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {stage === 'learn' && currentRule ? (
                  <motion.div
                    key={`rule-${ruleIdx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22 }}
                    className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-8 shadow-sm space-y-5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#8B5CF6]">
                        <BookOpen className="w-4 h-4" />
                        <span>{t.grammar.ruleHeader(ruleIdx + 1, unit.rules.length)}</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        {unit.rules.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setRuleIdx(idx)}
                            aria-label={t.grammar.ruleHeader(idx + 1, unit.rules.length)}
                            className={`h-2 rounded-full transition-all cursor-pointer ${
                              idx === ruleIdx
                                ? 'w-6 bg-[#8B5CF6]'
                                : 'w-2 bg-[var(--border-subtle)]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Rule Formula */}
                    <div
                      dir="ltr"
                      className="rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 px-4 py-3 font-mono-num font-bold text-sm sm:text-base text-[#6D28D9] dark:text-[#C4B5FD] text-left"
                    >
                      {currentRule.formula}
                    </div>

                    {/* Explanation */}
                    <p className="text-sm sm:text-base font-semibold text-[var(--text-primary)] leading-relaxed">
                      {currentRule.explanation[uiLanguage]}
                    </p>

                    {/* Examples */}
                    <div className="space-y-2.5">
                      <div className="text-xs font-extrabold text-[var(--text-secondary)]">
                        {t.grammar.examplesLabel}
                      </div>
                      {currentRule.examples.map((ex, i) => (
                        <div
                          key={i}
                          className="rounded-2xl bg-[var(--bg-surface-muted)] p-4 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0 space-y-1">
                            <p
                              dir="ltr"
                              className="font-latin font-bold text-sm sm:text-base text-[var(--text-primary)] text-left"
                            >
                              {ex.en}
                            </p>
                            {ex.note && (
                              <p className="text-xs font-semibold text-[#F97316]">
                                {ex.note[uiLanguage]}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              soundEngine.speakWord(ex.en, voiceEnabled || true, voiceSpeed)
                            }
                            aria-label={t.grammar.listenExample}
                            className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] hover:bg-[#1CB0F6]/15 text-[#1CB0F6] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  currentQuestion && (
                    <motion.div
                      key={`q-${currentQuestion.id}`}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.22 }}
                      className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-8 shadow-sm space-y-5"
                    >
                      <div className="flex items-center justify-between text-xs font-extrabold text-[#1CB0F6]">
                        <span>{t.grammar.practiceTab}</span>
                        <span dir="ltr" className="font-mono-num text-[var(--text-secondary)]">
                          {questionIdx + 1}/{unit.questions.length}
                        </span>
                      </div>

                      <h2 className="font-display font-extrabold text-lg sm:text-xl text-[var(--text-primary)]">
                        {currentQuestion.prompt[uiLanguage]}
                      </h2>

                      <div className="rounded-2xl bg-[var(--bg-surface-muted)] p-5 flex items-center justify-between gap-3">
                        <p
                          dir="ltr"
                          className="font-latin font-bold text-base sm:text-lg text-[var(--text-primary)] leading-relaxed text-left"
                        >
                          {currentQuestion.sentence}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            soundEngine.speakWord(
                              currentQuestion.sentence.replace('___', currentQuestion.correctAnswer),
                              true,
                              voiceSpeed
                            )
                          }
                          aria-label={t.grammar.listenExample}
                          className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] text-[#1CB0F6] flex items-center justify-center shrink-0 cursor-pointer"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {currentQuestion.options.map((opt) => {
                          const isSelected = selectedOption === opt;
                          const isCorrectOption = opt === currentQuestion.correctAnswer;

                          let style =
                            'bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] hover:border-[#1CB0F6]';
                          if (checkedState === 'idle' && isSelected) {
                            style =
                              'bg-[#1CB0F6]/12 border-2 border-[#1CB0F6] shadow-[0_3px_0_#1CB0F6]';
                          } else if (checkedState !== 'idle' && isCorrectOption) {
                            style =
                              'bg-[#58CC02]/15 border-2 border-[#58CC02] text-[#3a8b00] dark:text-[#7CE826]';
                          } else if (checkedState === 'wrong' && isSelected) {
                            style =
                              'bg-[#FF4B4B]/12 border-2 border-[#FF4B4B] text-[#dc2626] dark:text-[#FF7878]';
                          }

                          return (
                            <button
                              key={opt}
                              type="button"
                              dir="ltr"
                              disabled={checkedState !== 'idle'}
                              onClick={() => {
                                soundEngine.playClick(soundEnabled);
                                setSelectedOption(opt);
                              }}
                              className={`font-latin text-left rounded-2xl p-4 font-bold text-sm sm:text-base transition-all cursor-pointer min-h-[54px] ${style}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {checkedState !== 'idle' && (
                        <div
                          className={`rounded-2xl p-4 text-xs sm:text-sm font-bold leading-relaxed ${
                            checkedState === 'correct'
                              ? 'bg-[#58CC02]/10 text-[#3a8b00] dark:text-[#7CE826]'
                              : 'bg-[#FF9600]/12 text-[#b45309] dark:text-[#FCD34D]'
                          }`}
                        >
                          {currentQuestion.explanation[uiLanguage]}
                        </div>
                      )}
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Controls */}
            <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4">
              {stage === 'learn' ? (
                <>
                  <div className="text-xs font-bold text-[var(--text-secondary)]">
                    {t.grammar.ruleHeader(ruleIdx + 1, unit.rules.length)}
                  </div>
                  <div className="flex items-center gap-2.5 w-full sm:w-auto sm:ms-auto">
                    {ruleIdx + 1 < unit.rules.length ? (
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playClick(soundEnabled);
                          setRuleIdx((r) => r + 1);
                        }}
                        className="btn-3d-blue w-full sm:w-auto px-7 py-3.5 rounded-2xl font-display font-black text-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>{t.grammar.nextRuleBtn}</span>
                        {isRtl ? (
                          <ArrowLeft className="w-4 h-4" />
                        ) : (
                          <ArrowRight className="w-4 h-4" />
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playClick(soundEnabled);
                          setStage('practice');
                        }}
                        className="btn-3d-green w-full sm:w-auto px-8 py-3.5 rounded-2xl font-display font-black text-sm cursor-pointer"
                      >
                        {t.grammar.startPracticeBtn}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {checkedState === 'correct' && (
                    <div className="flex items-center gap-2 text-[#46A302] dark:text-[#7CE826] font-display font-extrabold text-sm">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span>{t.grammar.correctFeedback}</span>
                    </div>
                  )}
                  {checkedState === 'wrong' && (
                    <div className="flex items-center gap-2 text-[#dc2626] dark:text-[#FF7878] font-bold text-sm">
                      <XCircle className="w-5 h-5 shrink-0" />
                      <span>{t.grammar.wrongFeedback}</span>
                    </div>
                  )}
                  {checkedState === 'idle' && (
                    <div className="text-xs font-bold text-[var(--text-secondary)]">
                      {t.lessonPlayer.selectAnswerHint}
                    </div>
                  )}

                  <div className="w-full sm:w-auto sm:ms-auto">
                    {checkedState !== 'idle' ? (
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-display font-black text-sm cursor-pointer ${
                          checkedState === 'correct' ? 'btn-3d-green' : 'btn-3d-blue'
                        }`}
                      >
                        {questionIdx + 1 >= unit.questions.length
                          ? t.grammar.finishUnitBtn
                          : t.grammar.nextQuestionBtn}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!selectedOption}
                        onClick={handleCheckAnswer}
                        className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-display font-black text-sm transition-all ${
                          selectedOption
                            ? 'btn-3d-green cursor-pointer'
                            : 'bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] cursor-not-allowed'
                        }`}
                      >
                        {t.grammar.checkAnswerBtn}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
