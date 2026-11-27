import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Flame, Sparkles, Trophy, X } from 'lucide-react';
import { UiLanguage } from '../types/learning';
import { getUi } from '../lib/i18n';
import { soundEngine } from '../lib/sound';
import { triggerConfettiBurst } from './VfxOverlay';

export const STREAK_MILESTONES = [3, 5, 10, 15, 25, 50, 100];

export function isStreakMilestone(streak: number): boolean {
  return STREAK_MILESTONES.includes(streak);
}

interface StreakCelebrationModalProps {
  streak: number;
  soundEnabled: boolean;
  uiLanguage: UiLanguage;
  onClose: () => void;
}

export function StreakCelebrationModal({
  streak,
  soundEnabled,
  uiLanguage,
  onClose,
}: StreakCelebrationModalProps) {
  const t = getUi(uiLanguage);
  const sc = t.streakCelebration;
  const isRtl = uiLanguage === 'ar';
  const milestone = isStreakMilestone(streak);

  const nextMilestone = STREAK_MILESTONES.find((m) => m > streak);
  const displayMilestones = [3, 5, 10, 15, 25];

  useEffect(() => {
    if (milestone) {
      soundEngine.playLevelUp(soundEnabled);
      triggerConfettiBurst('celebration');
    } else {
      soundEngine.playStreak(soundEnabled);
      triggerConfettiBurst('stars');
    }
  }, [milestone, soundEnabled, streak]);

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        dir={isRtl ? 'rtl' : 'ltr'}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.84, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 16 }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          className="relative w-full max-w-md rounded-[32px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-8 shadow-2xl text-center overflow-hidden"
        >
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick(soundEnabled);
              onClose();
            }}
            aria-label={t.lessonPlayer.exitAria}
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Animated Flame Emblem + Shockwave Rings */}
          <div className="relative mx-auto mt-2 mb-6 w-32 h-32 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0.7 }}
              animate={{ scale: [0.85, 1.55], opacity: [0.55, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
              className={`absolute inset-0 rounded-full border-4 ${
                milestone ? 'border-[#FACC15]' : 'border-[#FF9600]'
              }`}
            />
            <motion.div
              initial={{ scale: 0.6, opacity: 0.6 }}
              animate={{ scale: [0.9, 1.35], opacity: [0.45, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut', delay: 0.45 }}
              className="absolute inset-2 rounded-full border-2 border-[#FB923C]"
            />

            <motion.div
              initial={{ scale: 0.4, rotate: -14 }}
              animate={{
                scale: [0.8, 1.12, 1],
                rotate: [0, -5, 5, 0],
              }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className={`relative w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg ${
                milestone
                  ? 'bg-gradient-to-br from-[#FACC15] via-[#FF9600] to-[#F97316]'
                  : 'bg-gradient-to-br from-[#FF9600] to-[#F97316]'
              }`}
            >
              <motion.div
                animate={{ scale: [1, 1.09, 1], y: [0, -2, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Flame className="w-12 h-12 text-white fill-white drop-shadow" />
              </motion.div>

              {milestone && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.25, type: 'spring', stiffness: 380 }}
                  className="absolute -top-2.5 -right-2.5 w-9 h-9 rounded-2xl bg-[#58CC02] border-2 border-white dark:border-slate-900 text-white flex items-center justify-center shadow-md"
                >
                  <Trophy className="w-4 h-4" />
                </motion.span>
              )}
            </motion.div>
          </div>

          {/* Rolling Streak Count */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-2"
          >
            <div className="inline-flex items-baseline justify-center gap-2">
              <motion.span
                dir="ltr"
                initial={{ scale: 0.6 }}
                animate={{ scale: [0.6, 1.18, 1] }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="font-mono-num font-black text-5xl text-[#FF9600] tracking-tight"
              >
                {streak}
              </motion.span>
              <span className="font-display font-black text-lg text-[var(--text-secondary)]">
                {sc.daysUnit}
              </span>
            </div>

            <h2 className="font-display font-black text-xl sm:text-2xl text-[var(--text-primary)]">
              {milestone ? sc.milestoneTitle(streak) : sc.newStreakTitle(streak)}
            </h2>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-sm mx-auto">
              {milestone ? sc.milestoneSub(streak) : sc.newStreakSub}
            </p>
          </motion.div>

          {/* Milestone Track: 3 · 5 · 10 · 15 · 25 */}
          <div className="mt-6 rounded-2xl bg-[var(--bg-surface-muted)] p-3.5 space-y-2">
            <div className="grid grid-cols-5 gap-1.5">
              {displayMilestones.map((m) => {
                const reached = streak >= m;
                const isCurrent = streak === m;
                return (
                  <motion.div
                    key={m}
                    initial={isCurrent ? { scale: 0.8 } : false}
                    animate={isCurrent ? { scale: [0.9, 1.12, 1] } : undefined}
                    transition={{ duration: 0.45, delay: 0.25 }}
                    className={`py-2 rounded-xl font-mono-num font-black text-xs flex flex-col items-center justify-center gap-0.5 border ${
                      isCurrent
                        ? 'bg-[#FF9600] border-[#FF9600] text-white shadow-sm'
                        : reached
                        ? 'bg-[#FF9600]/15 border-[#FF9600]/40 text-[#FF9600]'
                        : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <span>{m}</span>
                    {isCurrent && <Sparkles className="w-3 h-3" />}
                  </motion.div>
                );
              })}
            </div>

            <p className="text-[11px] font-bold text-[var(--text-secondary)]">
              {nextMilestone
                ? sc.nextMilestone(nextMilestone, nextMilestone - streak)
                : sc.maxMilestone}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick(soundEnabled);
              onClose();
            }}
            className="btn-3d-green w-full mt-6 py-3.5 px-6 rounded-2xl font-display font-black text-sm cursor-pointer"
          >
            {sc.continueBtn}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
