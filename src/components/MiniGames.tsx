import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CheckCircle2,
  Dices,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Star,
  Volume2,
  Zap,
} from 'lucide-react';
import { LessonExercise, UiLanguage, VocabWord } from '../types/learning';
import { soundEngine } from '../lib/sound';
import { triggerConfettiBurst } from './VfxOverlay';

interface MiniGameProps {
  exercise: LessonExercise;
  allLessonWords: VocabWord[];
  soundEnabled: boolean;
  voiceEnabled: boolean;
  voiceSpeed: number;
  uiLanguage: UiLanguage;
  onTriggerBurst: (text: string, color: string, subtext?: string) => void;
  onFinishMiniGame: (correctCount: number, totalCount: number) => void;
}

function shuffleArr<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function MiniGameStage(props: MiniGameProps) {
  switch (props.exercise.type) {
    case 'mystery-card':
      return <MysteryCardGame {...props} />;
    case 'scramble':
      return <WordScrambleGame {...props} />;
    case 'memory-flip':
      return <MemoryFlipGame {...props} />;
    case 'word-wheel':
      return <WordWheelGame {...props} />;
    case 'speed-blitz':
      return <SpeedBlitzGame {...props} />;
    default:
      return null;
  }
}

/* ============================================================================
   1. البطاقة الغامضة
   ============================================================================ */
function MysteryCardGame({
  exercise,
  allLessonWords,
  soundEnabled,
  voiceEnabled,
  voiceSpeed,
  uiLanguage,
  onTriggerBurst,
  onFinishMiniGame,
}: MiniGameProps) {
  const cardWords = useMemo(() => {
    const pool = exercise.miniGamePool?.length ? exercise.miniGamePool : allLessonWords;
    return shuffleArr(pool).slice(0, 4);
  }, [exercise, allLessonWords]);

  const [pickedIdx, setPickedIdx] = useState<number | null>(null);
  const [selectedWordGuess, setSelectedWordGuess] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);

  const chosenWord = pickedIdx !== null ? cardWords[pickedIdx] : null;

  const guessOptions = useMemo(() => {
    if (!chosenWord) return [];
    const others = shuffleArr(allLessonWords.filter((w) => w.id !== chosenWord.id)).slice(0, 3);
    return shuffleArr([chosenWord, ...others]);
  }, [chosenWord, allLessonWords]);

  const handlePickCard = (idx: number) => {
    if (pickedIdx !== null) return;
    setPickedIdx(idx);
    soundEngine.playCardFlip(soundEnabled);
    const revealed = cardWords[idx];
    soundEngine.speakWord(revealed.word, voiceEnabled, voiceSpeed);
    onTriggerBurst('كُشفت البطاقة!', '#FF9600', revealed.word);
  };

  const handleAnswer = (pickedId: string) => {
    if (!chosenWord || resolved) return;
    setSelectedWordGuess(pickedId);
    setResolved(true);
    const isCorrect = pickedId === chosenWord.id;
    if (isCorrect) {
      soundEngine.playCorrect(soundEnabled, 2);
      triggerConfettiBurst('stars');
      onTriggerBurst('+15 XP إضافية!', '#58CC02', 'اختيار موفق');
    } else {
      soundEngine.playWrong(soundEnabled);
    }
    setTimeout(() => {
      onFinishMiniGame(isCorrect ? 1 : 0, 1);
    }, 900);
  };

  const CARD_THEMES = [
    'from-[#1CB0F6] to-[#0284C7]',
    'from-[#58CC02] to-[#3f9400]',
    'from-[#FF9600] to-[#EA580C]',
    'from-[#8B5CF6] to-[#6D28D9]',
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-extrabold text-[#FF9600] flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          <span>لعبة البطاقة الغامضة</span>
        </span>
        <span className="text-xs font-bold text-[var(--text-secondary)]">
          {pickedIdx === null ? 'اختر أي بطاقة عشوائية!' : 'طابق الكلمة الظاهرة مع وصفها!'}
        </span>
      </div>

      {/* 4 بطاقات غامضة */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cardWords.map((card, idx) => {
          const isPicked = pickedIdx === idx;
          const isOtherLocked = pickedIdx !== null && !isPicked;

          return (
            <motion.button
              key={card.id}
              type="button"
              disabled={pickedIdx !== null}
              whileHover={pickedIdx === null ? { y: -4, scale: 1.03 } : undefined}
              whileTap={pickedIdx === null ? { scale: 0.96 } : undefined}
              animate={isPicked ? { rotateY: [90, 0], scale: [0.95, 1.03, 1] } : undefined}
              transition={{ duration: 0.35 }}
              onClick={() => handlePickCard(idx)}
              className={`min-h-[126px] rounded-2xl p-3 flex flex-col items-center justify-center text-center border-2 transition-all ${
                isPicked
                  ? 'bg-[var(--bg-surface-muted)] border-[#58CC02] shadow-md'
                  : isOtherLocked
                  ? 'bg-[var(--bg-surface-muted)]/50 border-[var(--border-subtle)] opacity-45'
                  : `bg-gradient-to-br ${CARD_THEMES[idx % 4]} border-white/25 text-white shadow-[0_5px_0_rgba(15,23,42,0.18)] cursor-pointer`
              }`}
            >
              {isPicked ? (
                <div className="space-y-1.5">
                  <div dir="ltr" className="font-latin font-black text-lg text-[var(--text-primary)]">
                    {card.word}
                  </div>
                  <div dir="ltr" className="font-mono-num text-[11px] text-[#1CB0F6] font-bold">
                    {card.ipa}
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <HelpCircle className="w-7 h-7 mx-auto opacity-90" />
                  <div className="font-display font-extrabold text-xs">
                    بطاقة #{idx + 1}
                  </div>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* تحدي الكلمة المكشوفة */}
      <AnimatePresence>
        {chosenWord && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-[var(--bg-surface-muted)] p-4 sm:p-5 space-y-3 border border-[var(--border-subtle)]"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-[var(--text-secondary)]">
                  أي وصف يطابق كلمة{' '}
                  <strong dir="ltr" className="font-latin text-[var(--text-primary)]">
                    {chosenWord.word}
                  </strong>
                  ؟
                </div>
                <div className="text-xs font-bold text-[#F97316] mt-0.5">
                  {chosenWord.translations[uiLanguage === 'en' ? 'ar' : uiLanguage]}
                </div>
              </div>
              <button
                type="button"
                onClick={() => soundEngine.speakWord(chosenWord.word, true, voiceSpeed)}
                className="btn-3d-blue w-10 h-10 rounded-xl flex items-center justify-center shrink-0 cursor-pointer"
                aria-label={`نطق ${chosenWord.word}`}
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {guessOptions.map((opt) => {
                const isSelected = selectedWordGuess === opt.id;
                const isRight = opt.id === chosenWord.id;
                let cls =
                  'bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] hover:border-[#1CB0F6]';
                if (resolved && isRight) {
                  cls = 'bg-[#58CC02]/15 border-2 border-[#58CC02] text-[#3a8b00] dark:text-[#7CE826]';
                } else if (resolved && isSelected && !isRight) {
                  cls = 'bg-[#FF4B4B]/12 border-2 border-[#FF4B4B] text-[#dc2626]';
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={resolved}
                    onClick={() => handleAnswer(opt.id)}
                    className={`rounded-xl p-3 text-right text-xs sm:text-sm font-bold transition-all cursor-pointer ${cls}`}
                  >
                    {opt.definition}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================================
   2. ترتيب الحروف
   ============================================================================ */
function WordScrambleGame({
  exercise,
  soundEnabled,
  voiceEnabled,
  voiceSpeed,
  uiLanguage,
  onTriggerBurst,
  onFinishMiniGame,
}: MiniGameProps) {
  const target = exercise.word;
  const letters = useMemo(() => {
    const clean = target.word.replace(/[^a-zA-Z]/g, '').toUpperCase().split('');
    return shuffleArr(clean.map((ch, idx) => ({ id: `${ch}-${idx}`, ch })));
  }, [target.word]);

  const cleanTargetStr = target.word.replace(/[^a-zA-Z]/g, '').toUpperCase();
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');

  const builtWord = pickedIds
    .map((id) => letters.find((l) => l.id === id)?.ch || '')
    .join('');

  const handleTileTap = (id: string) => {
    if (status !== 'playing' || pickedIds.includes(id)) return;
    soundEngine.playClick(soundEnabled);
    const next = [...pickedIds, id];
    setPickedIds(next);

    if (next.length === letters.length) {
      const attempt = next
        .map((pid) => letters.find((l) => l.id === pid)?.ch || '')
        .join('');
      const isMatch = attempt === cleanTargetStr;
      if (isMatch) {
        setStatus('correct');
        soundEngine.playCorrect(soundEnabled, 2);
        soundEngine.speakWord(target.word, voiceEnabled, voiceSpeed);
        triggerConfettiBurst('stars');
        onTriggerBurst('+15 XP!', '#58CC02', 'تهجئة صحيحة');
        setTimeout(() => onFinishMiniGame(1, 1), 900);
      } else {
        setStatus('wrong');
        soundEngine.playWrong(soundEnabled);
        setTimeout(() => {
          setPickedIds([]);
          setStatus('playing');
        }, 700);
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-[var(--bg-surface-muted)] p-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-extrabold text-[#1CB0F6] mb-1">
            تلميح ({target.pos})
          </div>
          <p className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
            {target.definition}
          </p>
          <p className="text-xs font-bold text-[#F97316] mt-0.5">
            {target.translations[uiLanguage === 'en' ? 'ar' : uiLanguage]}
          </p>
        </div>
        <button
          type="button"
          onClick={() => soundEngine.speakWord(target.word, true, voiceSpeed)}
          aria-label="سماع النطق كمساعدة"
          className="btn-3d-blue w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      {/* خانات الأحرف (اتجاه إنجليزي LTR دائماً) */}
      <div
        dir="ltr"
        className={`min-h-[64px] rounded-2xl border-2 border-dashed p-3 flex flex-wrap items-center justify-center gap-2 transition-colors ${
          status === 'correct'
            ? 'border-[#58CC02] bg-[#58CC02]/10'
            : status === 'wrong'
            ? 'border-[#FF4B4B] bg-[#FF4B4B]/10'
            : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
        }`}
      >
        {pickedIds.length === 0 ? (
          <span dir="rtl" className="text-xs font-bold text-[var(--text-secondary)]">
            اضغط على الأحرف بالترتيب لتكوين الكلمة ({cleanTargetStr.length} أحرف)
          </span>
        ) : (
          pickedIds.map((id) => {
            const tile = letters.find((l) => l.id === id);
            return (
              <motion.button
                key={`slot-${id}`}
                type="button"
                initial={{ scale: 0.7 }}
                animate={{ scale: 1 }}
                disabled={status !== 'playing'}
                onClick={() => {
                  soundEngine.playClick(soundEnabled);
                  setPickedIds((prev) => prev.filter((p) => p !== id));
                }}
                className="font-latin w-11 h-12 rounded-xl bg-[#1CB0F6] text-white font-black text-lg shadow-[0_3px_0_#1899D6] cursor-pointer"
              >
                {tile?.ch}
              </motion.button>
            );
          })
        )}
      </div>

      {/* بنك الأحرف المبعثرة */}
      <div dir="ltr" className="flex flex-wrap items-center justify-center gap-2.5">
        {letters.map((tile) => {
          const used = pickedIds.includes(tile.id);
          return (
            <button
              key={tile.id}
              type="button"
              disabled={used || status !== 'playing'}
              onClick={() => handleTileTap(tile.id)}
              className={`font-latin w-12 h-12 rounded-xl font-black text-lg transition-all ${
                used
                  ? 'bg-[var(--bg-surface-muted)] text-transparent border border-[var(--border-subtle)] cursor-default'
                  : 'btn-3d-neutral cursor-pointer hover:border-[#1CB0F6]'
              }`}
            >
              {tile.ch}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => setPickedIds([])}
          disabled={pickedIds.length === 0 || status !== 'playing'}
          className="inline-flex items-center gap-1 font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer disabled:opacity-40"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>مسح ({builtWord.length}/{cleanTargetStr.length})</span>
        </button>
        <button
          type="button"
          onClick={() => onFinishMiniGame(0, 1)}
          className="font-bold text-[var(--text-secondary)] hover:text-[#1CB0F6] cursor-pointer"
        >
          تخطي التحدي ←
        </button>
      </div>
    </div>
  );
}

/* ============================================================================
   3. لعبة الذاكرة (٦ بطاقات)
   ============================================================================ */
interface MemoryCardItem {
  uid: string;
  pairId: string;
  kind: 'word' | 'clue';
  label: string;
}

function MemoryFlipGame({
  exercise,
  allLessonWords,
  soundEnabled,
  voiceEnabled,
  voiceSpeed,
  onTriggerBurst,
  onFinishMiniGame,
}: MiniGameProps) {
  const cards = useMemo<MemoryCardItem[]>(() => {
    const source = shuffleArr(
      exercise.miniGamePool?.length ? exercise.miniGamePool : allLessonWords
    ).slice(0, 3);

    const flat: MemoryCardItem[] = [];
    source.forEach((w) => {
      flat.push({ uid: `w-${w.id}`, pairId: w.id, kind: 'word', label: w.word });
      flat.push({
        uid: `c-${w.id}`,
        pairId: w.id,
        kind: 'clue',
        label: w.definition.length > 56 ? `${w.definition.slice(0, 53)}...` : w.definition,
      });
    });
    return shuffleArr(flat);
  }, [exercise, allLessonWords]);

  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [locked, setLocked] = useState(false);

  const handleFlip = (card: MemoryCardItem) => {
    if (
      locked ||
      flippedUids.includes(card.uid) ||
      matchedPairIds.includes(card.pairId)
    ) {
      return;
    }

    soundEngine.playCardFlip(soundEnabled);
    if (card.kind === 'word') {
      soundEngine.speakWord(card.label, voiceEnabled, voiceSpeed);
    }

    const nextFlipped = [...flippedUids, card.uid];
    setFlippedUids(nextFlipped);

    if (nextFlipped.length === 2) {
      setLocked(true);
      const first = cards.find((c) => c.uid === nextFlipped[0]);
      const second = card;

      if (first && first.pairId === second.pairId) {
        const nextMatched = [...matchedPairIds, first.pairId];
        setMatchedPairIds(nextMatched);
        setFlippedUids([]);
        setLocked(false);
        soundEngine.playCorrect(soundEnabled, nextMatched.length);
        onTriggerBurst('+10 XP', '#58CC02', 'تمت المطابقة!');

        if (nextMatched.length === 3) {
          triggerConfettiBurst('stars');
          setTimeout(() => {
            onFinishMiniGame(mistakes === 0 ? 3 : 2, 3);
          }, 750);
        }
      } else {
        setMistakes((m) => m + 1);
        soundEngine.playWrong(soundEnabled);
        setTimeout(() => {
          setFlippedUids([]);
          setLocked(false);
        }, 700);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
        <span className="text-[#8B5CF6] font-extrabold">لعبة الذاكرة السريعة</span>
        <span className="font-mono-num">
          تطابق {matchedPairIds.length} / 3 أزواج
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {cards.map((card) => {
          const isMatched = matchedPairIds.includes(card.pairId);
          const isRevealed = isMatched || flippedUids.includes(card.uid);

          return (
            <motion.button
              key={card.uid}
              type="button"
              whileTap={!isRevealed ? { scale: 0.96 } : undefined}
              onClick={() => handleFlip(card)}
              className={`min-h-[104px] rounded-2xl p-3 text-center flex items-center justify-center border-2 transition-all ${
                isMatched
                  ? 'bg-[#58CC02]/14 border-[#58CC02] text-[#3a8b00] dark:text-[#7CE826]'
                  : isRevealed
                  ? 'bg-[var(--bg-surface)] border-[#1CB0F6] text-[var(--text-primary)] shadow-md'
                  : 'bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] border-white/20 text-white shadow-[0_4px_0_#4c1d95] cursor-pointer'
              }`}
            >
              {isRevealed ? (
                <span
                  dir={card.kind === 'word' ? 'ltr' : undefined}
                  className={
                    card.kind === 'word'
                      ? 'font-latin font-black text-base'
                      : 'text-xs font-bold leading-snug'
                  }
                >
                  {card.label}
                </span>
              ) : (
                <span className="font-display font-black text-2xl opacity-90">؟</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
   4. عجلة الحظ
   ============================================================================ */
function WordWheelGame({
  exercise,
  allLessonWords,
  soundEnabled,
  voiceEnabled,
  voiceSpeed,
  onTriggerBurst,
  onFinishMiniGame,
}: MiniGameProps) {
  const wheelWords = useMemo(() => {
    const pool = exercise.miniGamePool?.length ? exercise.miniGamePool : allLessonWords;
    return shuffleArr(pool).slice(0, 4);
  }, [exercise, allLessonWords]);

  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [landedWord, setLandedWord] = useState<VocabWord | null>(null);
  const [pickedOption, setPickedOption] = useState<string | null>(null);

  const options = useMemo(() => {
    if (!landedWord) return [];
    const others = shuffleArr(allLessonWords.filter((w) => w.id !== landedWord.id)).slice(0, 3);
    return shuffleArr([landedWord, ...others]);
  }, [landedWord, allLessonWords]);

  const handleSpin = () => {
    if (spinning || landedWord) return;
    soundEngine.playWheelTick(soundEnabled);
    setSpinning(true);
    const chosenIdx = Math.floor(Math.random() * wheelWords.length);
    const extraSpins = 720 + chosenIdx * 90 + 45;
    setRotation(extraSpins);

    setTimeout(() => {
      const winner = wheelWords[chosenIdx];
      setSpinning(false);
      setLandedWord(winner);
      soundEngine.playUnlock(soundEnabled);
      soundEngine.speakWord(winner.word, voiceEnabled, voiceSpeed);
      onTriggerBurst('تحدي العجلة!', '#1CB0F6', winner.word);
    }, 1000);
  };

  const handlePick = (id: string) => {
    if (!landedWord || pickedOption) return;
    setPickedOption(id);
    const ok = id === landedWord.id;
    if (ok) {
      soundEngine.playCorrect(soundEnabled, 2);
      triggerConfettiBurst('stars');
      onTriggerBurst('+15 XP إضافية!', '#58CC02');
    } else {
      soundEngine.playWrong(soundEnabled);
    }
    setTimeout(() => onFinishMiniGame(ok ? 1 : 0, 1), 850);
  };

  return (
    <div className="space-y-5">
      {!landedWord ? (
        <div className="flex flex-col items-center gap-4 py-2">
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
            className="w-44 h-44 rounded-full border-4 border-[#1CB0F6] shadow-xl relative overflow-hidden grid grid-cols-2 grid-rows-2"
          >
            {wheelWords.map((w, i) => {
              const colors = [
                'bg-[#58CC02] text-white',
                'bg-[#1CB0F6] text-white',
                'bg-[#FF9600] text-white',
                'bg-[#8B5CF6] text-white',
              ];
              return (
                <div
                  key={w.id}
                  dir="ltr"
                  className={`${colors[i % 4]} font-latin flex items-center justify-center p-2 text-center font-black text-xs`}
                >
                  {w.word}
                </div>
              );
            })}
            <div className="absolute inset-0 m-auto w-11 h-11 rounded-full bg-white border-2 border-slate-200 shadow flex items-center justify-center">
              <Star className="w-5 h-5 text-[#FF9600] fill-[#FF9600]" />
            </div>
          </motion.div>

          <button
            type="button"
            disabled={spinning}
            onClick={handleSpin}
            className="btn-3d-blue px-7 py-3 rounded-2xl font-display font-black text-sm flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <Dices className="w-4 h-4" />
            <span>{spinning ? 'جارٍ التدوير...' : 'أدر عجلة الحظ!'}</span>
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-3"
        >
          <div className="rounded-2xl bg-[var(--bg-surface-muted)] p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#1CB0F6]">الكلمة المختارة:</div>
              <div dir="ltr" className="font-latin font-black text-2xl text-[var(--text-primary)]">
                {landedWord.word}
              </div>
            </div>
            <button
              type="button"
              onClick={() => soundEngine.speakWord(landedWord.word, true, voiceSpeed)}
              className="btn-3d-blue w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer"
              aria-label={`نطق ${landedWord.word}`}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {options.map((opt) => {
              const isSelected = pickedOption === opt.id;
              const isRight = opt.id === landedWord.id;
              let cls =
                'bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] hover:border-[#1CB0F6]';
              if (pickedOption && isRight) {
                cls = 'bg-[#58CC02]/15 border-2 border-[#58CC02] text-[#3a8b00] dark:text-[#7CE826]';
              } else if (pickedOption && isSelected && !isRight) {
                cls = 'bg-[#FF4B4B]/12 border-2 border-[#FF4B4B] text-[#dc2626]';
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={Boolean(pickedOption)}
                  onClick={() => handlePick(opt.id)}
                  className={`rounded-xl p-3 text-right text-xs sm:text-sm font-bold cursor-pointer transition-all ${cls}`}
                >
                  {opt.definition}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ============================================================================
   5. تحدي البرق السريع
   ============================================================================ */
function SpeedBlitzGame({
  exercise,
  allLessonWords,
  soundEnabled,
  voiceEnabled,
  voiceSpeed,
  onTriggerBurst,
  onFinishMiniGame,
}: MiniGameProps) {
  const rounds = useMemo(() => {
    const pool = shuffleArr(
      exercise.miniGamePool?.length ? exercise.miniGamePool : allLessonWords
    ).slice(0, 3);
    return pool.map((target) => {
      const distractors = shuffleArr(
        allLessonWords.filter((w) => w.id !== target.id)
      ).slice(0, 2);
      return {
        target,
        choices: shuffleArr([target, ...distractors]),
      };
    });
  }, [exercise, allLessonWords]);

  const [roundIdx, setRoundIdx] = useState(0);
  const [hits, setHits] = useState(0);
  const [pickedId, setPickedId] = useState<string | null>(null);

  const current = rounds[roundIdx];

  const handleChoice = (id: string) => {
    if (!current || pickedId) return;
    setPickedId(id);
    const ok = id === current.target.id;
    const nextHits = hits + (ok ? 1 : 0);
    setHits(nextHits);

    if (ok) {
      soundEngine.playStreak(soundEnabled);
      onTriggerBurst('⚡ سريع!', '#FF9600');
    } else {
      soundEngine.playWrong(soundEnabled);
    }

    setTimeout(() => {
      setPickedId(null);
      if (roundIdx + 1 >= rounds.length) {
        triggerConfettiBurst('stars');
        onFinishMiniGame(nextHits, rounds.length);
      } else {
        const nextWord = rounds[roundIdx + 1].target.word;
        soundEngine.speakWord(nextWord, voiceEnabled, voiceSpeed);
        setRoundIdx((r) => r + 1);
      }
    }, 550);
  };

  if (!current) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-extrabold">
        <span className="text-[#FF9600] flex items-center gap-1">
          <Zap className="w-4 h-4 fill-[#FF9600]" />
          <span>البرق السريع · الجولة {roundIdx + 1}/{rounds.length}</span>
        </span>
        <span className="font-mono-num text-[#58CC02] flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{hits} إصابات</span>
        </span>
      </div>

      <div className="rounded-2xl bg-[var(--bg-surface-muted)] p-5 text-center space-y-2">
        <div className="text-xs font-bold text-[var(--text-secondary)]">
          اختر الكلمة الإنجليزية المطابقة لهذا الوصف:
        </div>
        <div className="font-display font-extrabold text-base sm:text-lg text-[var(--text-primary)]">
          «{current.target.definition}»
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {current.choices.map((c) => {
          const isSelected = pickedId === c.id;
          const isRight = c.id === current.target.id;
          let cls =
            'bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] hover:border-[#FF9600]';
          if (pickedId && isRight) {
            cls = 'bg-[#58CC02]/15 border-2 border-[#58CC02] text-[#3a8b00] dark:text-[#7CE826]';
          } else if (pickedId && isSelected && !isRight) {
            cls = 'bg-[#FF4B4B]/12 border-2 border-[#FF4B4B] text-[#dc2626]';
          }

          return (
            <button
              key={c.id}
              type="button"
              dir="ltr"
              disabled={Boolean(pickedId)}
              onClick={() => handleChoice(c.id)}
              className={`font-latin rounded-2xl py-4 px-3 font-black text-base text-center cursor-pointer transition-all ${cls}`}
            >
              {c.word}
            </button>
          );
        })}
      </div>
    </div>
  );
}
