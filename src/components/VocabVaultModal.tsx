import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Gauge, Search, Sparkles, Turtle, Volume2, X } from 'lucide-react';
import { CefrLevel, UiLanguage } from '../types/learning';
import { ALL_WORDS, CEFR_ORDER, LEVEL_META } from '../data/curriculum';
import { OXFORD_ALL_WORDS, posArabicName } from '../data/oxford3000';
import { soundEngine, VOICE_SPEED_OPTIONS } from '../lib/sound';

interface VocabVaultModalProps {
  initialLevel?: CefrLevel | 'ALL';
  masteredWords: string[];
  uiLanguage: UiLanguage;
  soundEnabled: boolean;
  voiceSpeed: number;
  onChangeVoiceSpeed: (speed: number) => void;
  onClose: () => void;
}

type SourceFilter = 'all' | 'curated';

interface UnifiedWordItem {
  id: string;
  word: string;
  ipa: string;
  pos: string;
  level: CefrLevel;
  source: 'curated' | 'catalog';
  lessonTitle: string;
  definition: string;
  example?: string;
  translation?: string;
}

export function VocabVaultModal({
  initialLevel = 'ALL',
  masteredWords,
  uiLanguage,
  soundEnabled,
  voiceSpeed,
  onChangeVoiceSpeed,
  onClose,
}: VocabVaultModalProps) {
  const [selectedLevel, setSelectedLevel] = useState<CefrLevel | 'ALL'>(initialLevel);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [query, setQuery] = useState('');
  const [visibleLimit, setVisibleLimit] = useState(80);

  const combinedCatalog = useMemo<UnifiedWordItem[]>(() => {
    const curated: UnifiedWordItem[] = ALL_WORDS.map((w) => ({
      id: w.id,
      word: w.word,
      ipa: w.ipa,
      pos: w.pos,
      level: w.level,
      source: 'curated',
      lessonTitle: w.lessonTitle,
      definition: w.definition,
      example: w.example,
      translation: uiLanguage !== 'en' ? w.translations[uiLanguage] : w.translations.ar,
    }));

    const extendedWords: UnifiedWordItem[] = OXFORD_ALL_WORDS.map((w) => {
      const posAr = posArabicName(w.pos);
      const lvlName = LEVEL_META[w.level].title;
      return {
        id: w.id,
        word: w.word,
        ipa: `${w.level} · ${posAr}`,
        pos: posAr,
        level: w.level,
        source: 'catalog',
        lessonTitle: `${lvlName}`,
        definition: `مفردة إنجليزية (${posAr}) ضمن مسار المستوى ${w.level}.`,
      };
    });

    return [...curated, ...extendedWords];
  }, [uiLanguage]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return combinedCatalog.filter((item) => {
      if (sourceFilter === 'curated' && item.source !== 'curated') return false;
      if (selectedLevel !== 'ALL' && item.level !== selectedLevel) return false;
      if (!q) return true;
      return (
        item.word.toLowerCase().includes(q) ||
        item.pos.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q) ||
        item.lessonTitle.toLowerCase().includes(q) ||
        (item.translation ? item.translation.toLowerCase().includes(q) : false)
      );
    });
  }, [combinedCatalog, sourceFilter, selectedLevel, query]);

  const visibleItems = filtered.slice(0, visibleLimit);
  const hasMore = filtered.length > visibleLimit;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="بنك المفردات الشامل"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl max-h-[88vh] rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* الرأس */}
        <div className="p-5 sm:p-6 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-black text-xl sm:text-2xl text-[var(--text-primary)]">
              بنك المفردات الشامل
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              {combinedCatalog.length.toLocaleString()} كلمة من المستوى A1 حتى C2 ·{' '}
              {masteredWords.length.toLocaleString()} كلمة متقنة
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <div className="flex items-center gap-1 px-2 py-1 rounded-2xl bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)]">
              <Gauge className="w-3.5 h-3.5 text-[#1CB0F6] ml-1" />
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

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick(soundEnabled);
                onClose();
              }}
              aria-label="إغلاق بنك المفردات"
              className="w-11 h-11 rounded-2xl bg-[var(--bg-surface-muted)] hover:bg-[var(--border-subtle)] flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* شريط البحث والفلترة: فقط الكل والدروس + مستويات اللغة */}
        <div className="px-5 sm:px-6 py-4 border-b border-[var(--border-subtle)] space-y-3 bg-[var(--bg-canvas)]/60">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[var(--text-secondary)] absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setVisibleLimit(80);
                }}
                placeholder="ابحث عن كلمة إنجليزية أو معنى أو موضوع..."
                aria-label="البحث في المفردات"
                className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1CB0F6]"
              />
            </div>

            {/* زر الكل والدروس فقط */}
            <div className="inline-flex items-center p-1 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shrink-0">
              {(
                [
                  { id: 'all', label: 'الكل (All)', icon: null },
                  { id: 'curated', label: 'الدروس (Lessons)', icon: Sparkles },
                ] as const
              ).map((src) => {
                const Icon = src.icon;
                const active = sourceFilter === src.id;
                return (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick(soundEnabled);
                      setSourceFilter(src.id);
                      setVisibleLimit(80);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                      active
                        ? 'bg-[#58CC02] text-white'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{src.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick(soundEnabled);
                setSelectedLevel('ALL');
                setVisibleLimit(80);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                selectedLevel === 'ALL'
                  ? 'bg-[#1CB0F6] text-white'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
              }`}
            >
              الكل ({combinedCatalog.length.toLocaleString()})
            </button>
            {CEFR_ORDER.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  soundEngine.playClick(soundEnabled);
                  setSelectedLevel(lvl);
                  setVisibleLimit(80);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  selectedLevel === lvl
                    ? 'text-white'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
                }`}
                style={
                  selectedLevel === lvl
                    ? { backgroundColor: LEVEL_META[lvl].accentColor }
                    : undefined
                }
              >
                {lvl} · {LEVEL_META[lvl].title}
              </button>
            ))}
          </div>
        </div>

        {/* شبكة الكلمات */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)] mb-3">
            <span>
              عرض {visibleItems.length.toLocaleString()} من {filtered.length.toLocaleString()} كلمة مطابقة
            </span>
            <span>السرعة: {voiceSpeed}x</span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-[var(--text-secondary)]">
              لم يتم العثور على كلمات مطابقة لـ «{query}». جرّب كلمة أو مستوى آخر.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {visibleItems.map((item) => {
                  const isMastered = masteredWords.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 flex flex-col justify-between gap-2.5 hover:border-[#1CB0F6]/60 transition-colors"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <h3
                                dir="ltr"
                                className="font-latin font-black text-lg text-[var(--text-primary)]"
                              >
                                {item.word}
                              </h3>
                              <span
                                dir="ltr"
                                className="font-mono-num text-xs text-[var(--text-secondary)]"
                              >
                                {item.ipa}
                              </span>
                            </div>
                            <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                              <span
                                className="font-bold"
                                style={{ color: LEVEL_META[item.level].accentColor }}
                              >
                                المستوى {item.level}
                              </span>{' '}
                              · {item.pos} · {item.lessonTitle}
                              {isMastered && ' · متقنة'}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => soundEngine.speakWord(item.word, true, voiceSpeed)}
                              aria-label={`نطق ${item.word}`}
                              className="w-9 h-9 rounded-xl bg-[#1CB0F6]/12 hover:bg-[#1CB0F6]/22 text-[#1CB0F6] flex items-center justify-center cursor-pointer transition-colors"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => soundEngine.speakWord(item.word, true, 0.6)}
                              aria-label={`نطق ${item.word} ببطء`}
                              className="w-9 h-9 rounded-xl bg-[var(--bg-surface-muted)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] flex items-center justify-center cursor-pointer transition-colors"
                            >
                              <Turtle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <p className="mt-2 text-sm text-[var(--text-primary)] leading-snug">
                          {item.definition}
                        </p>
                        {item.translation && (
                          <p className="mt-1 text-xs font-bold text-[#F97316]">
                            {item.translation}
                          </p>
                        )}
                      </div>

                      {item.example && (
                        <p
                          dir="ltr"
                          className="font-latin text-xs italic text-[var(--text-secondary)] border-t border-[var(--border-subtle)] pt-2 text-left"
                        >
                          “{item.example}”
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {hasMore && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick(soundEnabled);
                      setVisibleLimit((prev) => prev + 100);
                    }}
                    className="btn-3d-blue px-6 py-2.5 rounded-2xl text-xs font-extrabold cursor-pointer"
                  >
                    عرض ١٠٠ كلمة إضافية (متبقي {(filtered.length - visibleLimit).toLocaleString()})
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
