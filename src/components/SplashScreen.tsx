import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { UiLanguage } from '../types/learning';
import { getUi } from '../lib/i18n';

interface SplashScreenProps {
  uiLanguage: UiLanguage;
  onFinish: () => void;
}

const SPLASH_AUTO_DISMISS_MS = 1600;

export function SplashScreen({ uiLanguage, onFinish }: SplashScreenProps) {
  const t = getUi(uiLanguage);
  const isRtl = uiLanguage === 'ar';
  const finishedRef = useRef(false);

  const handleComplete = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish();
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      handleComplete();
    }, SPLASH_AUTO_DISMISS_MS);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      role="dialog"
      aria-modal="true"
      aria-label={t.appName}
      onClick={handleComplete}
      className="fixed inset-0 z-[100] bg-[var(--bg-canvas)] flex flex-col items-center justify-center p-6 overflow-hidden cursor-pointer"
    >
      {/* Subtle ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-45 dark:opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 20%, rgba(88,204,2,0.18), transparent 45%), radial-gradient(circle at 75% 80%, rgba(28,176,246,0.18), transparent 45%)',
        }}
      />

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
      </motion.div>
    </div>
  );
}
