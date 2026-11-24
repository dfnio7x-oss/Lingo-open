import { CefrLevel, LessonUnit, VocabWord } from '../types/learning';
import { OXFORD_PART_1 } from './oxfordPart1';
import { OXFORD_PART_2 } from './oxfordPart2';
import { OXFORD_5000_RAW } from './oxford5000';
import { C2_LINGVO_RAW } from './c2LingvoWords';

export interface OxfordEntry {
  id: string;
  word: string;
  pos: string;
  level: CefrLevel;
  rank?: number;
  source: 'oxford3000' | 'oxford5000' | 'c2lingvo';
}

function parseRawEntries(
  raw: string,
  source: 'oxford3000' | 'oxford5000',
  seen: Set<string>
): OxfordEntry[] {
  const entries: OxfordEntry[] = [];

  for (const rawLine of raw.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    const parts = line.split('|');
    if (parts.length < 3) continue;
    const word = parts[0].trim();
    const pos = parts[1].trim();
    const level = parts[2].trim() as CefrLevel;
    if (!word || !['A1', 'A2', 'B1', 'B2', 'C1'].includes(level)) continue;

    const dedupeKey = `${word.toLowerCase()}::${level}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const slug = word
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    entries.push({
      id: `ox-${level.toLowerCase()}-${slug}-${seen.size}`,
      word,
      pos,
      level,
      source,
    });
  }

  return entries;
}

function parseC2LingvoEntries(raw: string, seen: Set<string>): OxfordEntry[] {
  const entries: OxfordEntry[] = [];

  for (const rawLine of raw.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    const parts = line.split('|');
    if (parts.length < 2) continue;
    const rank = Number(parts[0].trim());
    const word = parts[1].trim();
    if (!word || Number.isNaN(rank)) continue;

    const dedupeKey = `${word.toLowerCase()}::C2`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const slug = word
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    entries.push({
      id: `c2-${rank}-${slug}`,
      word,
      pos: 'adv. term',
      level: 'C2',
      rank,
      source: 'c2lingvo',
    });
  }

  return entries;
}

function buildOxfordCatalog() {
  const seen = new Set<string>();
  const ox3000 = parseRawEntries(`${OXFORD_PART_1}\n${OXFORD_PART_2}`, 'oxford3000', seen);
  const ox5000 = parseRawEntries(OXFORD_5000_RAW, 'oxford5000', seen);
  const c2Words = parseC2LingvoEntries(C2_LINGVO_RAW, seen);

  return {
    ox3000: ox3000.sort((a, b) => a.word.localeCompare(b.word)),
    ox5000: ox5000.sort((a, b) => a.word.localeCompare(b.word)),
    c2Words,
    all: [...ox3000, ...ox5000, ...c2Words],
  };
}

const CATALOG = buildOxfordCatalog();

export const OXFORD_3000_WORDS: OxfordEntry[] = CATALOG.ox3000;
export const OXFORD_5000_WORDS: OxfordEntry[] = CATALOG.ox5000;
export const C2_LINGVO_WORDS: OxfordEntry[] = CATALOG.c2Words;
export const OXFORD_ALL_WORDS: OxfordEntry[] = CATALOG.all;

export const OXFORD_COUNTS_BY_LEVEL: Record<CefrLevel, number> = {
  A1: OXFORD_ALL_WORDS.filter((w) => w.level === 'A1').length,
  A2: OXFORD_ALL_WORDS.filter((w) => w.level === 'A2').length,
  B1: OXFORD_ALL_WORDS.filter((w) => w.level === 'B1').length,
  B2: OXFORD_ALL_WORDS.filter((w) => w.level === 'B2').length,
  C1: OXFORD_ALL_WORDS.filter((w) => w.level === 'C1').length,
  C2: OXFORD_ALL_WORDS.filter((w) => w.level === 'C2').length,
};

function mapPosTag(rawPos: string): VocabWord['pos'] {
  if (rawPos.includes('adj')) return 'adj';
  if (rawPos.includes('adv')) return 'adv';
  if (rawPos.includes('v.')) return 'verb';
  if (rawPos.includes('n.')) return 'noun';
  return 'phrase';
}

export function posArabicName(rawPos: string): string {
  if (rawPos.includes('adj')) return 'صفة';
  if (rawPos.includes('adv')) return 'ظرف';
  if (rawPos.includes('modal')) return 'فعل مساعد';
  if (rawPos.includes('prep')) return 'حرف جر';
  if (rawPos.includes('conj')) return 'أداة ربط';
  if (rawPos.includes('pron')) return 'ضمير';
  if (rawPos.includes('v.')) return 'فعل';
  if (rawPos.includes('n.')) return 'اسم';
  return 'مفردة متقدمة';
}

const TOPIC_TITLES_BY_LEVEL: Record<CefrLevel, string[]> = {
  A1: [
    'الأساسيات اليومية',
    'الكلمات الشائعة',
    'الأفعال الحركية',
    'الصفات الوصفية',
    'الحياة المنزلية',
    'الوقت والأماكن',
    'التواصل السريع',
    'المواقف اليومية',
  ],
  A2: [
    'التنقل والرحلات',
    'الحياة العملية',
    'المشاعر والآراء',
    'التسوق والخدمات',
    'الطبيعة والطقس',
    'الأنشطة اليومية',
    'الصحة واللياقة',
    'الروابط التعبيرية',
  ],
  B1: [
    'بيئة العمل',
    'التفكير والتحليل',
    'العلاقات الاجتماعية',
    'الإعلام والتقنية',
    'السفر والثقافة',
    'المناقشة والحوار',
    'تطوير الذات',
    'الوصف الدقيق',
  ],
  B2: [
    'القيادة والإدارة',
    'العلوم والابتكار',
    'التعبير البليغ',
    'الحوار النقدي',
    'الاقتصاد والمجتمع',
    'الإقناع والمنطق',
    'التحليل المتقدم',
    'المفاهيم المهنية',
  ],
  C1: [
    'الأسلوب الأكاديمي',
    'السياسة والدبلوماسية',
    'الدقة اللغوية',
    'الخطاب الرسمي',
    'البحث والتحليل',
    'صياغة الحجج',
    'الكتابة الاحترافية',
    'الفصاحة القيادية',
  ],
  C2: [
    'البلاغة الأدبية',
    'الفلسفة والمنطق',
    'الفصاحة التنفيذية',
    'التعابير الرفيعة',
    'الدقة التعبيرية',
    'المصطلحات النقدية',
    'الثقافة والفكر',
    'الأسلوب الكلاسيكي',
    'العمق اللغوي',
    'النصوص التخصصية',
    'المعاني الدقيقة',
    'البيان الرفيع',
  ],
};

const DECK_ICONS = ['📘', '📗', '📙', '📕', '🎯', '🧩', '⚡', '🌟'];
const C2_DECK_ICONS = ['💎', '👑', '🏛️', '📜', '🖋️', '🔮', '🎓', '✨'];

function buildWordClueDefinition(entry: OxfordEntry): string {
  const posLabel = posArabicName(entry.pos);
  const cleanChars = entry.word.replace(/[^a-zA-Z]/g, '');
  const prefix = cleanChars.slice(0, 2).toUpperCase();
  const suffix = cleanChars.slice(-1).toLowerCase();
  return `${posLabel} (${entry.level}) · ${cleanChars.length} أحرف · تبدأ بـ "${prefix}" وتنتهي بـ "${suffix}"`;
}

function chunkWithRemainder<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const slice = items.slice(i, i + chunkSize);
    if (slice.length < 4 && chunks.length > 0) {
      chunks[chunks.length - 1] = [...chunks[chunks.length - 1], ...slice];
    } else {
      chunks.push(slice);
    }
  }
  return chunks;
}

export function getOxfordPracticeDecks(level: CefrLevel, startingOrder = 5): LessonUnit[] {
  const topicBank = TOPIC_TITLES_BY_LEVEL[level];
  const DECK_SIZE = 14;

  if (level === 'C2') {
    const chunks = chunkWithRemainder(C2_LINGVO_WORDS, DECK_SIZE);
    return chunks.map((slice, d) => {
      const topicName = topicBank[d % topicBank.length];
      return {
        id: `ox-deck-c2-${d + 1}`,
        level: 'C2',
        order: startingOrder + d,
        title: topicName,
        subtitle: `${slice.length} كلمة متقدمة · ${slice.slice(0, 3).map((s) => s.word).join(' · ')}`,
        topicIcon: C2_DECK_ICONS[d % C2_DECK_ICONS.length],
        illustration: 'c2deck',
        source: 'c2lingvo',
        xpReward: 55,
        words: slice.map((entry) => ({
          id: entry.id,
          word: entry.word,
          ipa: `${entry.level} · ${posArabicName(entry.pos)}`,
          pos: 'phrase',
          definition: buildWordClueDefinition(entry),
          example: `Practice pronouncing "${entry.word}" and mastering its C2 nuance.`,
          translations: {
            ar: `${posArabicName(entry.pos)} · المستوى C2`,
            es: `Nivel C2 · Vocabulario avanzado`,
            fr: `Niveau C2 · Vocabulaire avancé`,
          },
        })),
      };
    });
  }

  const levelEntries = OXFORD_ALL_WORDS.filter((w) => w.level === level);
  const chunks = chunkWithRemainder(levelEntries, DECK_SIZE);

  return chunks.map((slice, idx) => {
    const deckNum = idx + 1;
    const hasOx5000 = slice.some((e) => e.source === 'oxford5000');
    const topicName = topicBank[idx % topicBank.length];

    return {
      id: `ox-deck-${level.toLowerCase()}-${deckNum}`,
      level,
      order: startingOrder + idx,
      title: topicName,
      subtitle: `${slice.length} كلمة أساسية · ${slice.slice(0, 3).map((s) => s.word).join(' · ')}`,
      topicIcon: DECK_ICONS[idx % DECK_ICONS.length],
      illustration: 'oxford',
      source: hasOx5000 ? 'oxford5000' : 'oxford3000',
      xpReward: level === 'C1' ? 45 : level === 'B2' ? 40 : 30,
      words: slice.map((entry) => ({
        id: entry.id,
        word: entry.word,
        ipa: `${entry.level} · ${posArabicName(entry.pos)}`,
        pos: mapPosTag(entry.pos),
        definition: buildWordClueDefinition(entry),
        example: `Practice pronouncing "${entry.word}" and using it in context.`,
        translations: {
          ar: `${posArabicName(entry.pos)} · المستوى ${entry.level}`,
          es: `Nivel ${entry.level} · ${entry.pos}`,
          fr: `Niveau ${entry.level} · ${entry.pos}`,
        },
      })),
    };
  });
}
