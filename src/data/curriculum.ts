import {
  AchievementBadge,
  CefrLevel,
  ExerciseType,
  LessonExercise,
  LessonUnit,
  LevelInfo,
  VocabWord,
} from '../types/learning';
import { BASIC_LESSONS } from './vocabBasic';
import { ADVANCED_LESSONS } from './vocabAdvanced';
import { getOxfordPracticeDecks } from './oxford3000';

export const CEFR_ORDER: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const LEVEL_META: Record<CefrLevel, LevelInfo> = {
  A1: {
    level: 'A1',
    title: 'الخطوات الأولى',
    tagline: 'التحيات والأرقام ١–١٠ والبيت والعائلة',
    accentColor: '#1CB0F6',
    badgeBg: 'bg-[#1CB0F6]/15 dark:bg-[#1CB0F6]/20',
    badgeText: 'text-[#0c87c4] dark:text-[#57C9FF]',
    description:
      'ابدأ رحلتك بتعلم الأرقام من ١ إلى ١٠ وأساسيات المنزل والطعام والعائلة والمفردات التأسيسية للمستوى A1.',
    gradientBg:
      'from-[#E6F4FE] via-[#EDF7FF] to-[#F5FAFF] dark:from-[#0F2740] dark:via-[#112B47] dark:to-[#13293D]',
  },
  A2: {
    level: 'A2',
    title: 'مستكشف الحياة اليومية',
    tagline: 'السفر والطقس والتسوق والصحة',
    accentColor: '#58CC02',
    badgeBg: 'bg-[#58CC02]/15 dark:bg-[#58CC02]/20',
    badgeText: 'text-[#3f9400] dark:text-[#7CE826]',
    description:
      'تحدث بثقة في الرحلات والمطارات وتوقعات الطقس والتسوق والعادات الصحية بمفردات المستوى A2.',
    gradientBg:
      'from-[#ECFDF3] via-[#F2FEF6] to-[#F7FFF9] dark:from-[#0F331E] dark:via-[#123B22] dark:to-[#112D1C]',
  },
  B1: {
    level: 'B1',
    title: 'متحدث واثق',
    tagline: 'العمل والمشاعر والتقنية والسرد',
    accentColor: '#FF9600',
    badgeBg: 'bg-[#FF9600]/15 dark:bg-[#FF9600]/20',
    badgeText: 'text-[#cc7700] dark:text-[#FFB347]',
    description:
      'عبّر عن مشاعرك وأفكارك بوضوح وتعاون في بيئة العمل وناقش التقنية والقصص بمستوى B1.',
    gradientBg:
      'from-[#FFF7ED] via-[#FFFBF2] to-[#FFFDF8] dark:from-[#3A2208] dark:via-[#43280B] dark:to-[#2F1D0A]',
  },
  B2: {
    level: 'B2',
    title: 'استراتيجي طليق',
    tagline: 'القيادة والعلوم والتعابير والمناظرة',
    accentColor: '#F97316',
    badgeBg: 'bg-[#F97316]/15 dark:bg-[#F97316]/20',
    badgeText: 'text-[#c2510a] dark:text-[#FB923C]',
    description:
      'أتقن التعابير الاصطلاحية والمناظرات الفكرية واللغة العلمية والإدارية في المستوى B2.',
    gradientBg:
      'from-[#FFF1EB] via-[#FFF6F2] to-[#FFFBF9] dark:from-[#3B180E] dark:via-[#451E12] dark:to-[#2E150D]',
  },
  C1: {
    level: 'C1',
    title: 'الأكاديمي والقيادي',
    tagline: 'البلاغة الأكاديمية والدبلوماسية والدقة',
    accentColor: '#8B5CF6',
    badgeBg: 'bg-[#8B5CF6]/15 dark:bg-[#8B5CF6]/20',
    badgeText: 'text-[#6D28D9] dark:text-[#A78BFA]',
    description:
      'امتلك زمام الكتابة الاحترافية والخطاب الدبلوماسي والمفردات الأكاديمية المتقدمة في المستوى C1.',
    gradientBg:
      'from-[#F5F3FF] via-[#F8F6FF] to-[#FCFBFF] dark:from-[#26164A] dark:via-[#2E1B59] dark:to-[#1F143B]',
  },
  C2: {
    level: 'C2',
    title: 'الإتقان الأعلى',
    tagline: 'الأدب والفلسفة وكامل مفردات الإتقان',
    accentColor: '#EC4899',
    badgeBg: 'bg-[#EC4899]/15 dark:bg-[#EC4899]/20',
    badgeText: 'text-[#BE185D] dark:text-[#F472B6]',
    description:
      'تعمّق في النصوص الأدبية والفلسفية وتدرّب على كامل حصيلة مفردات المستوى C2 عبر مئات الدروس التفاعلية.',
    gradientBg:
      'from-[#FDF2F8] via-[#FEF6FA] to-[#FFFBFE] dark:from-[#3D122C] dark:via-[#471634] dark:to-[#2E0F22]',
  },
};

const CORE_LESSON_ARABIC: Record<string, { title: string; subtitle: string }> = {
  'a1-1': {
    title: 'البيت والتحيات',
    subtitle: 'عبارات الترحيب والكلمات المهذبة وغرف المنزل',
  },
  'a1-numbers': {
    title: 'العد من ١ إلى ١٠',
    subtitle: 'تعلم الأرقام من 1 إلى 10 والكميات اليومية',
  },
  'a1-2': {
    title: 'أغراض يومية',
    subtitle: 'الأشياء الشائعة في المنزل والمدرسة',
  },
  'a1-3': {
    title: 'الطعام والمقهى',
    subtitle: 'طلب الوجبات والمشروبات والنكهات',
  },
  'a1-4': {
    title: 'العائلة والناس',
    subtitle: 'أفراد الأسرة والأفعال اليومية الأساسية',
  },
  'a2-1': {
    title: 'السفر والاتجاهات',
    subtitle: 'التنقل في المطارات والمحطات والمدن',
  },
  'a2-2': {
    title: 'التسوق والاختيار الذكي',
    subtitle: 'مقارنة الأسعار والمقاسات والجودة',
  },
  'a2-3': {
    title: 'الطقس والطبيعة',
    subtitle: 'الفصول وتوقعات الطقس والمشاهد الطبيعية',
  },
  'a2-4': {
    title: 'الصحة والعادات',
    subtitle: 'العافية والنشاط والروتين اليومي',
  },
  'b1-1': {
    title: 'العمل والطموح',
    subtitle: 'المسيرة المهنية والعمل الجماعي والأهداف',
  },
  'b1-2': {
    title: 'المشاعر والتعاطف',
    subtitle: 'التعبير عن الأحاسيس وردود الفعل بدقة',
  },
  'b1-3': {
    title: 'التقنية والإعلام',
    subtitle: 'الحياة الرقمية والاتصال والأدوات الذكية',
  },
  'b1-4': {
    title: 'السرد والذكريات',
    subtitle: 'ربط الأحداث والوصف القصصي الحي',
  },
  'b2-1': {
    title: 'القيادة والمبادرة',
    subtitle: 'العمل التنفيذي وبناء التوافق واتخاذ القرار',
  },
  'b2-2': {
    title: 'العلوم والاستدامة',
    subtitle: 'الابتكار والمناخ ومفردات البحث العلمي',
  },
  'b2-3': {
    title: 'التعابير والأفعال المركبة',
    subtitle: 'تحدث بطلاقة وطبيعية في الإنجليزية اليومية',
  },
  'b2-4': {
    title: 'المناظرة والتفكير النقدي',
    subtitle: 'موازنة وجهات النظر والأدلة والحجج',
  },
  'c1-1': {
    title: 'البلاغة الأكاديمية',
    subtitle: 'مفردات رفيعة للمقالات والعروض التقديمية',
  },
  'c1-2': {
    title: 'الدبلوماسية والسياسة',
    subtitle: 'لغة المؤسسات والحوكمة واللباقة الرسمية',
  },
  'c1-3': {
    title: 'الصفات الدقيقة',
    subtitle: 'ارتقِ بالوصف إلى تعبيرات أعمق وأدق',
  },
  'c1-4': {
    title: 'الخطاب المركب',
    subtitle: 'أدوات الربط المتقدمة وأفعال الدقة التعبيرية',
  },
  'c2-1': {
    title: 'روائع الأدب والتعبير',
    subtitle: 'مفردات إيحائية من روائع النثر الكلاسيكي',
  },
  'c2-2': {
    title: 'الفلسفة والفكر المجرد',
    subtitle: 'الدقة الفكرية وإتقان المفاهيم العميقة',
  },
  'c2-3': {
    title: 'الفصاحة التنفيذية',
    subtitle: 'إنجليزية الإدارة العليا والتخطيط الاستراتيجي',
  },
  'c2-4': {
    title: 'إتقان التعابير الدقيقة',
    subtitle: 'تعابير راقية ولمسات بلاغية رفيعة',
  },
};

export const ALL_CORE_LESSONS: LessonUnit[] = [...BASIC_LESSONS, ...ADVANCED_LESSONS].map(
  (lesson) => {
    const localized = CORE_LESSON_ARABIC[lesson.id];
    if (!localized) return lesson;
    return {
      ...lesson,
      title: localized.title,
      subtitle: localized.subtitle,
    };
  }
);

export const ALL_LESSONS: LessonUnit[] = CEFR_ORDER.flatMap((lvl) => {
  const core = ALL_CORE_LESSONS.filter((l) => l.level === lvl).map((l, idx) => ({
    ...l,
    order: idx + 1,
    source: 'core' as const,
  }));
  const extraDecks = getOxfordPracticeDecks(lvl, core.length + 1);
  return [...core, ...extraDecks];
});

export function getMergedLevelLessons(level: CefrLevel): LessonUnit[] {
  return ALL_LESSONS.filter((l) => l.level === level);
}

export const ALL_WORDS: (VocabWord & {
  level: CefrLevel;
  lessonId: string;
  lessonTitle: string;
})[] = ALL_CORE_LESSONS.flatMap((lesson) =>
  lesson.words.map((w) => ({
    ...w,
    level: lesson.level,
    lessonId: lesson.id,
    lessonTitle: lesson.title,
  }))
);

function countLessonsForLevel(level: CefrLevel): number {
  return ALL_LESSONS.filter((l) => l.level === level).length;
}

export const ACHIEVEMENTS: AchievementBadge[] = [
  {
    id: 'first-spark',
    title: 'الشرارة الأولى',
    description: 'أكمل درسك الأول في رحلة تعلم الإنجليزية',
    icon: '🌟',
    color: 'from-[#58CC02] to-[#46A302]',
    target: 1,
    metric: 'lessons',
  },
  {
    id: 'streak-3',
    title: 'شعلة ٣ أيام',
    description: 'حافظ على سلسلة تعلم لمدة ٣ أيام متتالية',
    icon: '🔥',
    color: 'from-[#FF9600] to-[#F97316]',
    target: 3,
    metric: 'streak',
  },
  {
    id: 'a1-complete',
    title: 'بطل المستوى A1',
    description: 'أكمل جميع دروس المستوى التأسيسي A1',
    icon: '🌱',
    color: 'from-[#1CB0F6] to-[#0284C7]',
    target: countLessonsForLevel('A1'),
    metric: 'levelComplete',
    targetLevel: 'A1',
  },
  {
    id: 'a2-complete',
    title: 'مستكشف المستوى A2',
    description: 'أكمل جميع دروس المستوى التفاعلي A2',
    icon: '🧭',
    color: 'from-[#58CC02] to-[#3f9400]',
    target: countLessonsForLevel('A2'),
    metric: 'levelComplete',
    targetLevel: 'A2',
  },
  {
    id: 'b1-complete',
    title: 'متحدث المستوى B1',
    description: 'أكمل جميع دروس المستوى المتوسط B1',
    icon: '💬',
    color: 'from-[#FF9600] to-[#EA580C]',
    target: countLessonsForLevel('B1'),
    metric: 'levelComplete',
    targetLevel: 'B1',
  },
  {
    id: 'b2-complete',
    title: 'استراتيجي المستوى B2',
    description: 'أكمل جميع دروس المستوى المتقدم B2',
    icon: '🏔️',
    color: 'from-[#F97316] to-[#C2410C]',
    target: countLessonsForLevel('B2'),
    metric: 'levelComplete',
    targetLevel: 'B2',
  },
  {
    id: 'c1-complete',
    title: 'أكاديمي المستوى C1',
    description: 'أكمل جميع دروس المستوى الأكاديمي C1',
    icon: '🎓',
    color: 'from-[#8B5CF6] to-[#6D28D9]',
    target: countLessonsForLevel('C1'),
    metric: 'levelComplete',
    targetLevel: 'C1',
  },
  {
    id: 'c2-complete',
    title: 'أسطورة المستوى C2',
    description: 'أكمل جميع دروس الإتقان الأعلى C2',
    icon: '👑',
    color: 'from-[#EC4899] to-[#BE185D]',
    target: countLessonsForLevel('C2'),
    metric: 'levelComplete',
    targetLevel: 'C2',
  },
  {
    id: 'lessons-25',
    title: 'مثابر المسار',
    description: 'أكمل ٢٥ درساً عبر المستويات المختلفة',
    icon: '📘',
    color: 'from-[#0EA5E9] to-[#0369A1]',
    target: 25,
    metric: 'lessons',
  },
  {
    id: 'lessons-150',
    title: 'متحدي القمة',
    description: 'أكمل ١٥٠ درساً في مسارك التعليمي',
    icon: '🚀',
    color: 'from-[#10B981] to-[#059669]',
    target: 150,
    metric: 'lessons',
  },
  {
    id: 'lessons-500',
    title: 'ماراثون المعرفة',
    description: 'أكمل ٥٠٠ درس نحو الإتقان الشامل',
    icon: '🏛️',
    color: 'from-[#6366F1] to-[#4338CA]',
    target: 500,
    metric: 'lessons',
  },
  {
    id: 'words-500',
    title: 'جامع المفردات',
    description: 'أتقن ٥٠٠ كلمة إنجليزية في الدروس',
    icon: '📚',
    color: 'from-[#8B5CF6] to-[#6D28D9]',
    target: 500,
    metric: 'words',
  },
  {
    id: 'words-3000',
    title: 'موسوعة الكلمات',
    description: 'أتقن ٣,٠٠٠ كلمة إنجليزية عبر المستويات',
    icon: '🔮',
    color: 'from-[#06B6D4] to-[#0E7490]',
    target: 3000,
    metric: 'words',
  },
  {
    id: 'words-10000',
    title: 'حصيلة الأساطير',
    description: 'أتقن ١٠,٠٠٠ كلمة إنجليزية حتى مستوى C2',
    icon: '💎',
    color: 'from-[#EC4899] to-[#DB2777]',
    target: 10000,
    metric: 'words',
  },
  {
    id: 'sharp-90',
    title: 'دقة القناص',
    description: 'حافظ على دقة ٩٠٪ أو أكثر في الاختبارات',
    icon: '🎯',
    color: 'from-[#F97316] to-[#EA580C]',
    target: 90,
    metric: 'accuracy',
  },
  {
    id: 'xp-5000',
    title: 'نجم النقاط',
    description: 'اجمع ٥,٠٠٠ نقطة خبرة XP',
    icon: '⚡',
    color: 'from-[#1CB0F6] to-[#1899D6]',
    target: 5000,
    metric: 'xp',
  },
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const ALL_MINIGAME_POOL: ExerciseType[] = [
  'mystery-card',
  'scramble',
  'memory-flip',
  'word-wheel',
  'speed-blitz',
];

export function generateLessonExercises(lesson: LessonUnit): LessonExercise[] {
  const words = shuffle(lesson.words);
  const exercises: LessonExercise[] = [];
  const isDeck = lesson.id.startsWith('ox-deck-');

  // اختيار 3 ألعاب مصغرة عشوائية في كل درس
  const pickedMiniGames = shuffle(ALL_MINIGAME_POOL).slice(0, 3);

  // 1: بطاقات تقديم الكلمات
  words.slice(0, 2).forEach((w, idx) => {
    exercises.push({
      id: `${lesson.id}-intro-${idx}`,
      type: 'intro',
      prompt: 'اضغط للاستماع وتعلّم نطق هذه الكلمة',
      word: w,
    });
  });

  // 2: لعبة مصغرة عشوائية #1
  exercises.push(
    createMiniGameExercise(pickedMiniGames[0], lesson, words, `${lesson.id}-mg-0`)
  );

  if (isDeck) {
    words.slice(0, 2).forEach((w, idx) => {
      const distractors = shuffle(lesson.words.filter((other) => other.id !== w.id))
        .slice(0, 3)
        .map((d) => d.word);
      exercises.push({
        id: `${lesson.id}-ox-listen-${idx}`,
        type: 'listen',
        prompt: `استمع جيداً واختر كلمة المستوى ${lesson.level} الصحيحة`,
        word: w,
        options: shuffle([w.word, ...distractors]),
        correctAnswer: w.word,
      });
    });

    exercises.push(
      createMiniGameExercise(pickedMiniGames[1], lesson, words, `${lesson.id}-mg-1`)
    );

    exercises.push(
      createMiniGameExercise(pickedMiniGames[2], lesson, words, `${lesson.id}-mg-2`)
    );

    return exercises;
  }

  // 3: اختيار المعنى
  const choiceWord = words[0];
  const choiceDistractors = shuffle(lesson.words.filter((other) => other.id !== choiceWord.id))
    .slice(0, 3)
    .map((d) => d.definition);
  exercises.push({
    id: `${lesson.id}-choice-0`,
    type: 'choice',
    prompt: `ما معنى كلمة "${choiceWord.word}"؟`,
    word: choiceWord,
    options: shuffle([choiceWord.definition, ...choiceDistractors]),
    correctAnswer: choiceWord.definition,
  });

  // 4: لعبة مصغرة عشوائية #2
  exercises.push(
    createMiniGameExercise(pickedMiniGames[1], lesson, words, `${lesson.id}-mg-1`)
  );

  // 5: الاستماع والتمييز
  const listenWord = words[2] || words[0];
  const listenDistractors = shuffle(lesson.words.filter((other) => other.id !== listenWord.id))
    .slice(0, 3)
    .map((d) => d.word);
  exercises.push({
    id: `${lesson.id}-listen-0`,
    type: 'listen',
    prompt: 'استمع بتركيز واختر الكلمة التي سمعتها',
    word: listenWord,
    options: shuffle([listenWord.word, ...listenDistractors]),
    correctAnswer: listenWord.word,
  });

  // 6: إكمال الجملة من السياق
  const ctxWord = words[3] || words[1] || words[0];
  const escaped = ctxWord.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`, 'i');
  const hasMatch = regex.test(ctxWord.example);
  const blanked = hasMatch
    ? ctxWord.example.replace(regex, '______')
    : `${ctxWord.example} (______ )`;

  const ctxDistractors = shuffle(lesson.words.filter((other) => other.id !== ctxWord.id))
    .slice(0, 3)
    .map((d) => d.word);

  exercises.push({
    id: `${lesson.id}-context-0`,
    type: 'context',
    prompt: 'أكمل الجملة باختيار الكلمة الأنسب',
    word: ctxWord,
    sentenceWithBlank: blanked,
    options: shuffle([ctxWord.word, ...ctxDistractors]),
    correctAnswer: ctxWord.word,
  });

  // 7: لعبة مصغرة عشوائية #3
  exercises.push(
    createMiniGameExercise(pickedMiniGames[2], lesson, words, `${lesson.id}-mg-2`)
  );

  return exercises;
}

function createMiniGameExercise(
  type: ExerciseType,
  lesson: LessonUnit,
  shuffledWords: VocabWord[],
  id: string
): LessonExercise {
  const pool = shuffledWords.slice(0, Math.min(shuffledWords.length, 6));
  const scrambleWord =
    pool.find((w) => /^[a-zA-Z]{3,11}$/.test(w.word)) || pool[0];
  const targetWord = type === 'scramble' ? scrambleWord : pool[0];

  const prompts: Record<string, string> = {
    'mystery-card': 'لعبة البطاقة الغامضة: اختر بطاقة لتكشف كلمة مفاجئة!',
    scramble: 'لعبة ترتيب الحروف: رتّب الأحرف لتكوين الكلمة الصحيحة!',
    'memory-flip': 'لعبة الذاكرة: طابق كل كلمة مع دليلها المخفي!',
    'word-wheel': 'لعبة عجلة الحظ: أدر العجلة واكسب تحدياً إضافياً!',
    'speed-blitz': 'لعبة البرق السريع: أجب عن ٣ تحديات متتالية بسرعة!',
  };

  return {
    id,
    type,
    prompt: prompts[type] || 'تحدي الألعاب المصغرة',
    word: targetWord,
    miniGamePool: pool,
    options: shuffle(lesson.words).slice(0, 4).map((w) => w.word),
  };
}
