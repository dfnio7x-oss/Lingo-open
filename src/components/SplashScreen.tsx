import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { UiLanguage } from '../types/learning';
import { getUi } from '../lib/i18n';

interface SplashScreenProps {
  uiLanguage: UiLanguage;
  onFinish: () => void;
}

const SPLASH_DURATION_MS = 5000;

export function SplashScreen({ uiLanguage, onFinish }: SplashScreenProps) {
  const t = getUi(uiLanguage);
  const isRtl = uiLanguage === 'ar';
  const [elapsedMs, setElapsedMs] = useState(0);
  const finishedRef = useRef(false);

  const handleComplete = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish();
  };

  useEffect(() => {
    const start = performance.now();
    const interval = window.setInterval(() => {
      const diff = performance.now() - start;
      if (diff >= SPLASH_DURATION_MS) {
        setElapsedMs(SPLASH_DURATION_MS);
        window.clearInterval(interval);
        handleComplete();
      } else {
        setElapsedMs(diff);
      }
    }, 60);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressPct = Math.min(100, (elapsedMs / SPLASH_DURATION_MS) * 100);
  const secondsLeft = Math.max(1, Math.ceil((SPLASH_DURATION_MS - elapsedMs) / 1000));

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      role="dialog"
      aria-modal="true"
      aria-label={t.appName}
      className="fixed inset-0 z-[100] bg-[var(--bg-canvas)] flex flex-col items-center justify-center p-6 overflow-hidden"
    >
      {/* Subtle animated ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-45 dark:opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 20%, rgba(88,204,2,0.18), transparent 45%), radial-gradient(circle at 75% 80%, rgba(28,176,246,0.18), transparent 45%)',
        }}
      />

      {/* Skip button at top */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-between mb-auto pt-2">
        <span
          dir="ltr"
          className="font-mono-num text-xs font-extrabold text-[var(--text-secondary)] px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
        >
          {secondsLeft}s
        </span>

        <button
          type="button"
          onClick={handleComplete}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] text-xs font-display font-extrabold text-[var(--text-primary)] shadow-xs cursor-pointer transition-colors"
        >
          <span>{t.splashSkip}</span>
          {isRtl ? (
            <ArrowLeft className="w-3.5 h-3.5" />
          ) : (
            <ArrowRight className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Center Brand Emblem */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center text-center my-auto max-w-sm w-full"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          <img
            src="/assets/aistudio/10263_zoomed-1_bee373d8.jpg"
            alt={t.appName}
            referrerPolicy="no-referrer"
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-[30px] object-cover shadow-xl border-4 border-white dark:border-slate-800"
          />
          <span className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-[#58CC02] text-white flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900">
            <Sparkles className="w-5 h-5" />
          </span>
        </motion.div>

        <h1 className="mt-6 font-display font-black text-3xl sm:text-4xl text-[var(--text-primary)] tracking-tight">
          {t.appName}
        </h1>
        <p className="mt-2 text-sm sm:text-base font-bold text-[var(--text-secondary)] leading-relaxed">
          {t.splashTagline}
        </p>

        {/* Progress Bar */}
        <div className="mt-8 w-full max-w-xs space-y-2.5">
          <div className="h-2.5 w-full rounded-full bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#58CC02] to-[#1CB0F6] transition-[width] duration-75"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="text-[11px] font-bold text-[var(--text-secondary)]">
            {t.splashStarting}
          </div>
        </div>
      </motion.div>

      <div className="mb-auto" />
    </div>
  );
}
