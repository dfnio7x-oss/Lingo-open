import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'motion/react';

export interface FloatingBurst {
  id: number;
  text: string;
  subtext?: string;
  color: string;
}

export function triggerConfettiBurst(
  intensity: 'small' | 'celebration' | 'stars' = 'celebration'
) {
  if (typeof window === 'undefined') return;
  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  if (intensity === 'stars') {
    void confetti({
      particleCount: 36,
      spread: 75,
      startVelocity: 28,
      scalar: 0.9,
      origin: { y: 0.55 },
      colors: ['#FACC15', '#58CC02', '#1CB0F6', '#8B5CF6'],
      disableForReducedMotion: true,
    });
    return;
  }

  if (intensity === 'small') {
    void confetti({
      particleCount: 28,
      spread: 58,
      origin: { y: 0.7 },
      colors: ['#58CC02', '#1CB0F6', '#FF9600', '#FACC15'],
      disableForReducedMotion: true,
    });
    return;
  }

  // Dual-cannon celebration burst
  void confetti({
    particleCount: 65,
    angle: 60,
    spread: 62,
    origin: { x: 0.08, y: 0.7 },
    colors: ['#58CC02', '#1CB0F6', '#FF9600', '#EC4899', '#FACC15'],
    disableForReducedMotion: true,
  });
  void confetti({
    particleCount: 65,
    angle: 120,
    spread: 62,
    origin: { x: 0.92, y: 0.7 },
    colors: ['#58CC02', '#1CB0F6', '#FF9600', '#EC4899', '#FACC15'],
    disableForReducedMotion: true,
  });
}

const SPARKLE_ANGLES = [
  { x: -56, y: -32, symbol: '✦' },
  { x: 56, y: -34, symbol: '★' },
  { x: -38, y: -62, symbol: '✧' },
  { x: 40, y: -60, symbol: '✦' },
  { x: 0, y: -74, symbol: '★' },
];

interface VfxOverlayProps {
  bursts: FloatingBurst[];
  onExpire: (id: number) => void;
}

export function VfxOverlay({ bursts, onExpire }: VfxOverlayProps) {
  useEffect(() => {
    if (bursts.length === 0) return;
    const timers = bursts.map((b) => setTimeout(() => onExpire(b.id), 1350));
    return () => timers.forEach(clearTimeout);
  }, [bursts, onExpire]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
    >
      <AnimatePresence>
        {bursts.map((burst) => (
          <motion.div
            key={burst.id}
            initial={{ opacity: 0, scale: 0.5, y: 24 }}
            animate={{ opacity: 1, scale: 1.08, y: -48 }}
            exit={{ opacity: 0, scale: 0.9, y: -96 }}
            transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
            className="absolute flex flex-col items-center"
          >
            {/* Primary radial shockwave ring */}
            <motion.div
              initial={{ scale: 0.35, opacity: 0.75 }}
              animate={{ scale: 2.6, opacity: 0 }}
              transition={{ duration: 0.68, ease: 'easeOut' }}
              className="absolute w-20 h-20 rounded-full border-4"
              style={{ borderColor: burst.color }}
            />
            {/* Secondary inner shimmer ring */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0.55 }}
              animate={{ scale: 1.9, opacity: 0 }}
              transition={{ duration: 0.52, ease: 'easeOut', delay: 0.06 }}
              className="absolute w-16 h-16 rounded-full border-2"
              style={{ borderColor: '#FACC15' }}
            />

            {/* Floating golden/brand star sparkles */}
            {SPARKLE_ANGLES.map((sp, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.4, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.35, 0.7],
                  x: sp.x,
                  y: sp.y,
                  rotate: i % 2 === 0 ? 45 : -45,
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute text-base font-bold"
                style={{ color: i % 2 === 0 ? '#FACC15' : burst.color }}
              >
                {sp.symbol}
              </motion.span>
            ))}

            <div
              className="px-4 py-1.5 rounded-2xl font-display font-black text-xl shadow-lg text-white whitespace-nowrap"
              style={{ backgroundColor: burst.color }}
            >
              {burst.text}
            </div>
            {burst.subtext && (
              <span className="mt-1 text-xs font-extrabold tracking-wide text-[var(--accent-warm)] bg-[var(--bg-surface)]/95 px-2.5 py-0.5 rounded-xl shadow">
                {burst.subtext}
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
