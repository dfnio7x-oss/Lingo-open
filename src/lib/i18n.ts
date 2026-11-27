import { CefrLevel, UiLanguage } from '../types/learning';

export interface UiStrings {
  appName: string;
  splashTagline: string;
  splashSkip: string;
  splashStarting: string;
  offlineBanner: string;
  nav: {
    home: string;
    daily: string;
    you: string;
    setting: string;
    ariaLabel: string;
  };
  auth: {
    loginSubtitle: string;
    signupSubtitle: string;
    googleContinue: string;
    googleSigningIn: string;
    orDivider: string;
    loginTab: string;
    signupTab: string;
    usernameLabel: string;
    usernamePlaceholder: string;
    usernameRuleHint: (min: number, max: number) => string;
    usernameCharsCount: (len: number, max: number) => string;
    passwordLabel: string;
    passwordPlaceholder: string;
    showPassword: string;
    hidePassword: string;
    submitting: string;
    loginSubmit: string;
    signupSubmit: string;
    noAccountPrompt: string;
    createOneLink: string;
    hasAccountPrompt: string;
    signInLink: string;
    errUsernameLength: (min: number, max: number) => string;
    errUsernameChars: string;
    errPasswordRequired: string;
    errPasswordLength: string;
    errWrongPassword: string;
    errAccountNotFound: string;
    errUsernameTaken: string;
    errEmailProviderDisabled: string;
    errGooglePopupClosed: string;
    errGoogleFailed: string;
    errUnexpected: string;
  };
  home: {
    vocabTab: string;
    grammarTab: string;
    vocabBankBtn: string;
    myAccountBtn: string;
    settingsBtn: string;
    dayUnit: string;
    learnedWordsStats: (learned: string, total: string) => string;
    remainingLessonsStats: (remaining: string, done: number, total: number) => string;
    continueLesson: (order: number, title: string) => string;
    unlockLevel: (level: string, title: string) => string;
    pathHeading: (level: string, title: string) => string;
    pathSubtitle: string;
    jumpToCurrentBtn: string;
    quickJumpLabel: string;
    lessonsRangeLabel: (start: number, end: number) => string;
    backToFirstBtn: string;
    startNowBadge: string;
    lessonLabel: (order: number, title: string) => string;
    levelLabel: (level: string) => string;
    wordsAndXp: (words: number, xp: number) => string;
    showMoreLessons: (count: number, remaining: string) => string;
    collapseListBtn: string;
    lockedLabel: string;
  };
  grammar: {
    headerTitle: (level: string, title: string) => string;
    headerSubtitle: string;
    completedCount: (done: number, total: number) => string;
    jumpToCurrentUnit: string;
    allTopics: string;
    rulesCount: (count: number) => string;
    questionsCount: (count: number) => string;
    startUnit: string;
    reviewUnit: string;
    unitBadge: (range: string) => string;
    learnTab: string;
    practiceTab: string;
    ruleHeader: (idx: number, total: number) => string;
    examplesLabel: string;
    listenExample: string;
    startPracticeBtn: string;
    nextRuleBtn: string;
    checkAnswerBtn: string;
    nextQuestionBtn: string;
    finishUnitBtn: string;
    correctFeedback: string;
    wrongFeedback: string;
    unitCompletedTitle: string;
    unitCompletedDesc: (level: string) => string;
    backToGrammarPath: string;
    topics: Record<string, string>;
  };
  daily: {
    pageTitle: string;
    pageSubtitle: string;
    dailyGoalTitle: string;
    dailyGoalGreeting: (name: string) => string;
    lessonsToday: (count: number) => string;
    goalCompleted: string;
    goalProgress: (pct: number) => string;
    continueLearningBtn: string;
    streakLabel: string;
    streakDays: (n: number) => string;
    featuredWordTitle: (level: string) => string;
    nextWordBtn: string;
    levelFilterLabel: string;
    exploreAllWords: (total: string) => string;
    speakWordAria: (word: string) => string;
    speakSlowAria: (word: string) => string;
  };
  you: {
    currentLevelLine: (lvl: string, title: string, unlocked: number) => string;
    levelProgress: (lvl: number) => string;
    changeAvatarBtn: string;
    vocabBtn: (count: string) => string;
    accountSectionTitle: string;
    accountSectionSub: string;
    cloudSynced: string;
    cloudSyncing: string;
    cloudLocalOnly: string;
    cloudSyncError: string;
    syncNowBtn: string;
    linkGoogleBtn: string;
    displayNameLabel: string;
    emailLabel: string;
    saveBtn: string;
    savedBtn: string;
    signOutBtn: string;
    resetBtn: string;
    deleteBtn: string;
    statStreak: string;
    statXp: string;
    statLessons: string;
    statAccuracy: string;
    weeklyTitle: string;
    weeklySub: string;
    thisWeek: string;
    days: Record<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun', string>;
    masteredTitle: string;
    masteredEmpty: string;
    exploreAllWords: (total: string) => string;
    achievementsTitle: string;
    achievementsSub: string;
    confirmDeleteTitle: string;
    confirmDeleteBody: string;
    confirmDeleteBtn: string;
    confirmResetTitle: string;
    confirmResetBody: string;
    confirmResetBtn: string;
    cancelBtn: string;
  };
  settings: {
    title: string;
    subtitle: string;
    audioStudioTitle: string;
    testChimeBtn: string;
    testVoiceBtn: (speed: number) => string;
    voiceSpeedLabel: string;
    calmSfxTitle: string;
    calmSfxDesc: string;
    autoSpeakTitle: string;
    autoSpeakDesc: string;
    studyPlanTitle: string;
    dailyGoalXpLabel: string;
    defaultLevelLabel: string;
    appearanceTitle: string;
    lightMode: string;
    darkMode: string;
    remindersTitle: string;
    remindersDesc: string;
    languageTitle: string;
    languageSub: string;
    speedTags: Record<string, string>;
    streakFreezeTitle: string;
    streakFreezeDesc: string;
    streakFreezeCost: (cost: number) => string;
    streakFreezeActiveBadge: string;
    streakFreezeBuyBtn: (cost: number) => string;
    streakFreezeNeedXp: (missing: number) => string;
    streakFreezeOnlyZeroXp: string;
    streakFreezeProtectedNote: (date: string) => string;
  };
  streakCelebration: {
    newStreakTitle: (days: number) => string;
    milestoneTitle: (days: number) => string;
    newStreakSub: string;
    milestoneSub: (days: number) => string;
    nextMilestone: (target: number, remaining: number) => string;
    maxMilestone: string;
    continueBtn: string;
    daysUnit: string;
  };
  lessonPlayer: {
    exitAria: string;
    completedBadge: string;
    lessonHeading: (order: number, title: string) => string;
    practicedSummary: (words: number, level: string) => string;
    xpEarnedLabel: string;
    accuracyLabel: string;
    wordsLabel: string;
    backToPathBtn: string;
    listenBtn: string;
    slowBtn: string;
    playAudioBtn: (speed: number) => string;
    understoodNextBtn: string;
    continueBtn: string;
    checkBtn: string;
    excellentFeedback: string;
    correctAnswerWas: string;
    matchedProgress: (done: number, total: number) => string;
    minigamePromptHint: string;
    introHint: string;
    selectAnswerHint: string;
    coachCorrectCombo: (combo: number) => string;
    coachCorrect: string;
    coachWrong: string;
    coachMinigame: string;
    coachIntro: string;
    coachMatch: string;
    coachDefault: string;
    introPrompt: string;
    choicePrompt: (word: string) => string;
    listenPrompt: string;
    contextPrompt: string;
    deckListenPrompt: (level: string) => string;
    minigamePrompts: Record<string, string>;
  };
  vault: {
    title: string;
    subtitle: (total: string, mastered: string) => string;
    searchPlaceholder: string;
    filterAll: string;
    filterCurated: string;
    allLevels: (total: string) => string;
    showingCount: (shown: string, total: string) => string;
    speedLabel: (speed: number) => string;
    emptyResult: (query: string) => string;
    masteredTag: string;
    loadMoreBtn: (remaining: string) => string;
    catalogDef: (pos: string, level: string) => string;
  };
  avatarModal: {
    title: string;
    subMenu: string;
    subGallery: string;
    subUrl: string;
    uploadTitle: string;
    uploadSub: string;
    galleryTitle: string;
    gallerySub: string;
    urlTitle: string;
    urlSub: string;
    backToMenu: string;
    urlLabel: string;
    livePreview: string;
    backBtn: string;
    applyBtn: string;
    errInvalidFile: string;
    errEmptyUrl: string;
    errInvalidUrl: string;
    errLoadUrl: string;
    labels: Record<string, string>;
  };
  minigames: {
    mysteryTitle: string;
    mysteryPickPrompt: string;
    mysteryMatchPrompt: string;
    cardLabel: (num: number) => string;
    whichDefinition: string;
    cardRevealed: string;
    bonusXp: string;
    goodChoice: string;
    scrambleHint: (pos: string) => string;
    scrambleEmpty: (len: number) => string;
    clearBtn: (cur: number, len: number) => string;
    skipBtn: string;
    correctSpelling: string;
    memoryTitle: string;
    memoryPairs: (done: number) => string;
    matchedBurst: string;
    wheelChallenge: string;
    spinningBtn: string;
    spinBtn: string;
    pickedWord: string;
    blitzTitle: (round: number, total: number) => string;
    blitzHits: (hits: number) => string;
    blitzPrompt: string;
    blitzFast: string;
  };
  levels: Record<CefrLevel, { title: string; tagline: string; description: string }>;
  achievements: Record<string, { title: string; description: string }>;
  coreLessons: Record<string, { title: string; subtitle: string }>;
  toast: {
    welcome: (name: string) => string;
    levelUnlocked: (level: string) => string;
    levelReadySub: string;
    progressReset: string;
    accountDeleted: string;
    cloudLinked: string;
    syncSuccess: string;
    streakFreezeBought: string;
    streakFreezeUsed: string;
  };
}

export const LANGUAGE_OPTIONS: {
  code: UiLanguage;
  label: string;
  subtitle: Record<UiLanguage, string>;
}[] = [
  {
    code: 'ar',
    label: 'العربية',
    subtitle: {
      ar: 'الواجهة والترجمة العربية',
      en: 'Arabic UI & translations',
      es: 'Interfaz y traducción al árabe',
      fr: 'Interface et traduction en arabe',
    },
  },
  {
    code: 'en',
    label: 'English',
    subtitle: {
      ar: 'واجهة إنجليزية بالكامل',
      en: 'Full English immersion',
      es: 'Inmersión total en inglés',
      fr: 'Immersion complète en anglais',
    },
  },
  {
    code: 'es',
    label: 'Español',
    subtitle: {
      ar: 'الواجهة والترجمة الإسبانية',
      en: 'Spanish UI & translations',
      es: 'Interfaz y traducción al español',
      fr: 'Interface et traduction en espagnol',
    },
  },
  {
    code: 'fr',
    label: 'Français',
    subtitle: {
      ar: 'الواجهة والترجمة الفرنسية',
      en: 'French UI & translations',
      es: 'Interfaz y traducción al francés',
      fr: 'Interface et traduction en français',
    },
  },
];

const AR_STRINGS: UiStrings = {
  appName: 'LingoLearn',
  splashTagline: 'تعلّم المفردات والقواعد الإنجليزية بذكاء ومتعة',
  splashSkip: 'تخطي',
  splashStarting: 'جارٍ تجهيز مسارك التعليمي...',
  offlineBanner: 'وضع عدم الاتصال — الدروس المحفوظة متاحة',
  nav: {
    home: 'الرئيسية',
    daily: 'أهدافي',
    you: 'حسابي',
    setting: 'الإعدادات',
    ariaLabel: 'التنقل الرئيسي',
  },
  auth: {
    loginSubtitle: 'سجّل دخولك لمزامنة تقدمك في السحابة',
    signupSubtitle: 'أنشئ حساباً جديداً لحفظ تقدمك ومفرداتك',
    googleContinue: 'المتابعة باستخدام Google',
    googleSigningIn: 'جارٍ الربط مع Google...',
    orDivider: 'أو عبر اسم المستخدم',
    loginTab: 'تسجيل الدخول',
    signupTab: 'حساب جديد',
    usernameLabel: 'اسم المستخدم',
    usernamePlaceholder: 'أدخل اسم المستخدم بالإنجليزية',
    usernameRuleHint: (min, max) => `من ${min} إلى ${max} حرفاً (أحرف إنجليزية، أرقام، _ . -)`,
    usernameCharsCount: (len, max) => `${len}/${max} حرفاً`,
    passwordLabel: 'كلمة المرور',
    passwordPlaceholder: 'أدخل كلمة المرور',
    showPassword: 'إظهار كلمة المرور',
    hidePassword: 'إخفاء كلمة المرور',
    submitting: 'جارٍ التحقق...',
    loginSubmit: 'دخول',
    signupSubmit: 'إنشاء الحساب',
    noAccountPrompt: 'ليس لديك حساب بعد؟',
    createOneLink: 'أنشئ حساباً',
    hasAccountPrompt: 'لديك حساب بالفعل؟',
    signInLink: 'سجّل الدخول',
    errUsernameLength: (min, max) => `يجب أن يكون اسم المستخدم بين ${min} و ${max} حرفاً.`,
    errUsernameChars: 'استخدم الأحرف الإنجليزية والأرقام و (_) أو (-) أو (.) فقط.',
    errPasswordRequired: 'الرجاء إدخال كلمة المرور.',
    errPasswordLength: 'يجب أن تتكون كلمة المرور من ٤ أحرف على الأقل.',
    errWrongPassword: 'اسم المستخدم أو كلمة المرور غير صحيحة.',
    errAccountNotFound: 'الحساب غير موجود. تأكد من اسم المستخدم أو سجّل بحساب جديد أو عبر Google.',
    errUsernameTaken: 'اسم المستخدم مسجل مسبقاً. جرّب تسجيل الدخول.',
    errEmailProviderDisabled: 'تسجيل الدخول بالبريد/اسم المستخدم غير مفعّل في Firebase Console على هذا الجهاز الجديد. استخدم زر Google أعلاه للمزامنة الفورية بين الأجهزة.',
    errGooglePopupClosed: 'تم إغلاق نافذة تسجيل الدخول بجوجل قبل إكمال العملية.',
    errGoogleFailed: 'تعذّر تسجيل الدخول عبر Google. تأكد من اتصالك بالإنترنت وحاول مجدداً.',
    errUnexpected: 'حدث خطأ أثناء المصادقة. حاول مرة أخرى.',
  },
  home: {
    vocabTab: 'المفردات',
    grammarTab: 'القواعد',
    vocabBankBtn: 'بنك الكلمات',
    myAccountBtn: 'حسابي',
    settingsBtn: 'الإعدادات',
    dayUnit: 'يوم',
    learnedWordsStats: (learned, total) => `تعلّمت ${learned} من ${total} كلمة`,
    remainingLessonsStats: (remaining, done, total) => `متبقي ${remaining} درس (${done}/${total})`,
    continueLesson: (order, title) => `متابعة: الدرس ${order} · ${title}`,
    unlockLevel: (level, title) => `فتح المستوى ${level} · ${title}`,
    pathHeading: (level, title) => `مسار المستوى ${level} · ${title}`,
    pathSubtitle: 'اسحب للأسفل واضغط على أي درس مفتوح للتدرب مع ألعاب مصغرة عشوائية',
    jumpToCurrentBtn: 'الانتقال إلى درسي الحالي',
    quickJumpLabel: 'انتقال سريع:',
    lessonsRangeLabel: (start, end) => `الدروس ${start} – ${end}`,
    backToFirstBtn: 'العودة للأول',
    startNowBadge: 'ابدأ الآن',
    lessonLabel: (order, title) => `الدرس ${order} · ${title}`,
    levelLabel: (level) => `المستوى ${level}`,
    wordsAndXp: (words, xp) => `${words} كلمة · +${xp} XP`,
    showMoreLessons: (count, remaining) => `عرض ${count} درساً إضافياً (متبقي ${remaining})`,
    collapseListBtn: 'تقليص القائمة',
    lockedLabel: 'مغلق',
  },
  grammar: {
    headerTitle: (level, title) => `قواعد اللغة الإنجليزية · ${level} · ${title}`,
    headerSubtitle: 'وحدات قواعد منظمة مستندة إلى منهج English Grammar in Use مع شرح مبسط وتمارين تفاعلية',
    completedCount: (done, total) => `أكملت ${done} من ${total} وحدة قواعد`,
    jumpToCurrentUnit: 'الانتقال لوحدتي الحالية',
    allTopics: 'كل الموضوعات',
    rulesCount: (count) => `${count} قواعد`,
    questionsCount: (count) => `${count} تمارين`,
    startUnit: 'ابدأ الوحدة',
    reviewUnit: 'مراجعة الوحدة',
    unitBadge: (range) => `مرجع ${range}`,
    learnTab: 'شرح القاعدة',
    practiceTab: 'التمارين التفاعلية',
    ruleHeader: (idx, total) => `القاعدة ${idx} من ${total}`,
    examplesLabel: 'أمثلة توضيحية',
    listenExample: 'نطق المثال',
    startPracticeBtn: 'ابدأ التمارين الآن',
    nextRuleBtn: 'القاعدة التالية',
    checkAnswerBtn: 'تحقق من الإجابة',
    nextQuestionBtn: 'السؤال التالي',
    finishUnitBtn: 'إنهاء الوحدة واستلام النقاط',
    correctFeedback: 'إجابة صحيحة! فهم ممتاز للقاعدة.',
    wrongFeedback: 'تأكد من القاعدة أعلاه — الإجابة الصحيحة موضحة بالأسفل.',
    unitCompletedTitle: 'أحسنت! أتممت وحدة القواعد بنجاح',
    unitCompletedDesc: (level) => `أنهيت شرح القاعدة وتطبيقاتها في المستوى ${level}.`,
    backToGrammarPath: 'العودة إلى وحدات القواعد',
    topics: {
      tenses: 'المضارع والماضي',
      perfect: 'المضارع والماضي التام',
      future: 'المستقبل',
      modals: 'الأفعال المساعدة',
      conditionals: 'الجمل الشرطية و Wish',
      passive: 'المبني للمجهول',
      reported: 'الكلام المنقول',
      questions: 'الأسئلة والأفعال المساعدة',
      'ing-to': 'صيغ -ing و to',
      articles: 'الأدوات والأسماء',
      pronouns: 'الضمائر والمحددات',
      relative: 'جمل الوصل',
      adjectives: 'الصفات والظروف والمقارنة',
      conjunctions: 'الروابط وحروف الجر',
      phrasal: 'الأفعال المركبة',
    },
  },
  daily: {
    pageTitle: 'أهدافي اليومية وكلمة اليوم',
    pageSubtitle: 'تابع تقدم هدفك اليومي واكتشف مفردات مميزة مع النطق والأمثلة',
    dailyGoalTitle: 'الهدف اليومي',
    dailyGoalGreeting: (name) => `مرحباً ${name} · واصل الاستمرار`,
    lessonsToday: (count) => `${count} دروس اليوم`,
    goalCompleted: 'اكتمل الهدف اليومي!',
    goalProgress: (pct) => `أنجزت ${pct}%`,
    continueLearningBtn: 'ابدأ التدرب الآن',
    streakLabel: 'سلسلة الحماس',
    streakDays: (n) => `${n} يوم متتالي`,
    featuredWordTitle: (level) => `كلمة مميزة · المستوى ${level}`,
    nextWordBtn: 'الكلمة التالية ←',
    levelFilterLabel: 'مستوى الكلمة المميزة',
    exploreAllWords: (total) => `استكشاف جميع الكلمات (${total})`,
    speakWordAria: (word) => `نطق كلمة ${word}`,
    speakSlowAria: (word) => `نطق ${word} ببطء`,
  },
  you: {
    currentLevelLine: (lvl, title, unlocked) => `المستوى الحالي: ${lvl} · ${title} · تم فتح ${unlocked} من ٦ مستويات`,
    levelProgress: (lvl) => `تقدم المستوى ${lvl}`,
    changeAvatarBtn: 'تغيير الصورة',
    vocabBtn: (count) => `المفردات (${count})`,
    accountSectionTitle: 'بيانات الحساب والمزامنة السحابية',
    accountSectionSub: 'عدّل اسم العرض أو البريد أو قم بمزامنة تقدمك مع السحابة',
    cloudSynced: 'متصل بالمزامنة السحابية',
    cloudSyncing: 'جارٍ المزامنة...',
    cloudLocalOnly: 'حفظ محلي — اربط بـ Google للمزامنة',
    cloudSyncError: 'تعذّر الحفظ السحابي — أعد المحاولة',
    syncNowBtn: 'مزامنة الآن',
    linkGoogleBtn: 'ربط الحساب بـ Google',
    displayNameLabel: 'اسم العرض',
    emailLabel: 'البريد الإلكتروني (اختياري)',
    saveBtn: 'حفظ',
    savedBtn: 'تم الحفظ!',
    signOutBtn: 'تسجيل الخروج',
    resetBtn: 'إعادة ضبط التقدم',
    deleteBtn: 'حذف الحساب',
    statStreak: 'أيام الحماس المتتالية',
    statXp: 'إجمالي نقاط الخبرة XP',
    statLessons: 'الدروس المكتملة',
    statAccuracy: 'نسبة الدقة',
    weeklyTitle: 'النشاط الأسبوعي',
    weeklySub: 'نقاط الخبرة المكتسبة خلال آخر ٧ أيام',
    thisWeek: 'هذا الأسبوع',
    days: {
      Mon: 'الإثنين',
      Tue: 'الثلاثاء',
      Wed: 'الأربعاء',
      Thu: 'الخميس',
      Fri: 'الجمعة',
      Sat: 'السبت',
      Sun: 'الأحد',
    },
    masteredTitle: 'المفردات المتقنة',
    masteredEmpty: 'أكمل درسك الأول لتبدأ ببناء حصيلتك من الكلمات المتقنة!',
    exploreAllWords: (total) => `استكشاف جميع الكلمات (${total})`,
    achievementsTitle: 'أوسمة الإنجازات',
    achievementsSub: 'إنجازات متدرجة توازي تقدمك في دروس ومستويات اللغة من A1 حتى C2',
    confirmDeleteTitle: 'هل تريد حذف حسابك نهائياً؟',
    confirmDeleteBody: 'سيؤدي هذا إلى حذف حسابك ومزامنتك السحابية ونقاط الخبرة والدروس المكتملة نهائياً.',
    confirmDeleteBtn: 'نعم، احذف الحساب',
    confirmResetTitle: 'هل تريد إعادة ضبط التقدم؟',
    confirmResetBody: 'سيتم تصفير نقاط الخبرة وسلسلة الأيام وإعادة الدروس إلى بداية المستوى A1.',
    confirmResetBtn: 'نعم، أعد الضبط',
    cancelBtn: 'إلغاء',
  },
  settings: {
    title: 'إعدادات التعلم والصوت واللغة',
    subtitle: 'اضبط هدفك اليومي والمستوى الافتراضي والمؤثرات الصوتية وسرعة النطق ولغة الواجهة',
    audioStudioTitle: 'استوديو الصوت والنطق',
    testChimeBtn: 'تجربة النغمة',
    testVoiceBtn: (speed) => `تجربة الصوت (${speed}x)`,
    voiceSpeedLabel: 'سرعة نطق الكلمات',
    calmSfxTitle: 'مؤثرات صوتية هادئة',
    calmSfxDesc: 'نغمات ناعمة ومريحة عند الإجابات وقلب البطاقات والمكافآت',
    autoSpeakTitle: 'النطق التلقائي للمفردات',
    autoSpeakDesc: 'تشغيل نطق الكلمة الإنجليزية تلقائياً عند ظهور بطاقات التعلم',
    studyPlanTitle: 'خطة الدراسة والمستوى',
    dailyGoalXpLabel: 'الهدف اليومي لنقاط الخبرة',
    defaultLevelLabel: 'المستوى الافتراضي',
    appearanceTitle: 'المظهر والتنبيهات',
    lightMode: 'الوضع النهاري',
    darkMode: 'الوضع الليلي',
    remindersTitle: 'تذكير الممارسة اليومية',
    remindersDesc: 'تنبيهات لطيفة للحفاظ على سلسلة أيام التعلم',
    languageTitle: 'لغة الواجهة والترجمة',
    languageSub: 'تغيّر لغة الأزرار والقوائم وترجمة معاني الكلمات وشرح القواعد',
    speedTags: { '0.65': 'بطيء', '0.85': 'واضح', '1': 'طبيعي', '1.2': 'سريع' },
    streakFreezeTitle: 'تجميد الستريك (Streak Freeze)',
    streakFreezeDesc: 'يحمي سلسلة أيامك ليوم واحد إذا فاتك التمرين عندما تكون نقاط اليوم 0 XP',
    streakFreezeCost: (cost) => `${cost} XP`,
    streakFreezeActiveBadge: 'مفعّل · محمي ليوم واحد',
    streakFreezeBuyBtn: (cost) => `شراء وتفعيل التجميد · ${cost} XP`,
    streakFreezeNeedXp: (missing) => `تحتاج ${missing} XP إضافية للشراء`,
    streakFreezeOnlyZeroXp: 'متاح للشراء والتفعيل فقط عندما تكون نقاطك اليوم 0 XP',
    streakFreezeProtectedNote: (date) => `تمت حماية سلسلتك تلقائياً بتاريخ ${date}`,
  },
  streakCelebration: {
    newStreakTitle: (days) => `سلسلة ${days} أيام متتالية!`,
    milestoneTitle: (days) => `إنجاز رائع · ${days} أيام متواصلة!`,
    newStreakSub: 'أضفت يوماً جديداً إلى سلسلتك — استمر على هذا الإيقاع الرائع!',
    milestoneSub: (days) => `لقد وصلت إلى محطة ${days} أيام من الالتزام المتواصل!`,
    nextMilestone: (target, remaining) => `المحطة القادمة: ${target} أيام (متبقي ${remaining})`,
    maxMilestone: 'إنجاز أسطوري في الاستمرارية!',
    continueBtn: 'متابعة التعلم',
    daysUnit: 'يوم',
  },
  lessonPlayer: {
    exitAria: 'الخروج من الدرس',
    completedBadge: 'اكتمل الدرس بنجاح!',
    lessonHeading: (order, title) => `الدرس ${order} · ${title}`,
    practicedSummary: (words, level) => `تدرّبت على ${words} كلمة في المستوى ${level}.`,
    xpEarnedLabel: 'النقاط المكتسبة',
    accuracyLabel: 'الدقة',
    wordsLabel: 'الكلمات',
    backToPathBtn: 'العودة إلى مسار التعلم',
    listenBtn: 'استمع',
    slowBtn: 'بطيء',
    playAudioBtn: (speed) => `تشغيل الصوت (${speed}x)`,
    understoodNextBtn: 'فهمت، التالي',
    continueBtn: 'متابعة',
    checkBtn: 'تحقق من الإجابة',
    excellentFeedback: 'ممتاز! واصل التقدم!',
    correctAnswerWas: 'الإجابة الصحيحة:',
    matchedProgress: (done, total) => `تمت مطابقة ${done} من ${total}`,
    minigamePromptHint: 'أكمل تحدي اللعبة المصغرة أعلاه للمتابعة',
    introHint: 'استمع للنطق وتأمل المثال ثم تابع',
    selectAnswerHint: 'اختر إجابة ثم اضغط تحقق',
    coachCorrectCombo: (combo) => `سلسلة رائعة ${combo}x! واصل هذا الإيقاع المتألق.`,
    coachCorrect: 'أحسنت! إجابة دقيقة ومميزة.',
    coachWrong: 'لاحظ الإجابة الصحيحة المظللة أدناه — التكرار يرسّخ الحفظ.',
    coachMinigame: 'تحدي لعبة مصغرة عشوائية لتثبيت الكلمات بمتعة!',
    coachIntro: 'استمع بهدوء إلى النطق الصحيح وتأمل الجملة التوضيحية.',
    coachMatch: 'اضغط على الكلمة ثم اختر معناها المطابق.',
    coachDefault: 'اختر الإجابة الأنسب من الخيارات التالية.',
    introPrompt: 'اضغط للاستماع وتعلّم نطق هذه الكلمة',
    choicePrompt: (word) => `ما معنى كلمة "${word}"؟`,
    listenPrompt: 'استمع بتركيز واختر الكلمة التي سمعتها',
    contextPrompt: 'أكمل الجملة باختيار الكلمة الأنسب',
    deckListenPrompt: (level) => `استمع جيداً واختر كلمة المستوى ${level} الصحيحة`,
    minigamePrompts: {
      'mystery-card': 'لعبة البطاقة الغامضة: اختر بطاقة لتكشف كلمة مفاجئة!',
      scramble: 'لعبة ترتيب الحروف: رتّب الأحرف لتكوين الكلمة الصحيحة!',
      'memory-flip': 'لعبة الذاكرة: طابق كل كلمة مع دليلها المخفي!',
      'word-wheel': 'لعبة عجلة الحظ: أدر العجلة واكسب تحدياً إضافياً!',
      'speed-blitz': 'لعبة البرق السريع: أجب عن ٣ تحديات متتالية بسرعة!',
    },
  },
  vault: {
    title: 'بنك المفردات الشامل',
    subtitle: (total, mastered) => `${total} كلمة من المستوى A1 حتى C2 · ${mastered} كلمة متقنة`,
    searchPlaceholder: 'ابحث عن كلمة إنجليزية أو معنى أو موضوع...',
    filterAll: 'الكل (All)',
    filterCurated: 'الدروس (Lessons)',
    allLevels: (total) => `الكل (${total})`,
    showingCount: (shown, total) => `عرض ${shown} من ${total} كلمة مطابقة`,
    speedLabel: (speed) => `السرعة: ${speed}x`,
    emptyResult: (query) => `لم يتم العثور على كلمات مطابقة لـ «${query}». جرّب كلمة أو مستوى آخر.`,
    masteredTag: 'متقنة',
    loadMoreBtn: (remaining) => `عرض ١٠٠ كلمة إضافية (متبقي ${remaining})`,
    catalogDef: (pos, level) => `مفردة إنجليزية (${pos}) ضمن مسار المستوى ${level}.`,
  },
  avatarModal: {
    title: 'تخصيص الصورة الشخصية',
    subMenu: 'اختر الطريقة المناسبة لتعيين صورتك',
    subGallery: 'اختر من معرض الصور الجاهزة',
    subUrl: 'ألصق رابط صورة مباشرة',
    uploadTitle: 'رفع ملف من الجهاز',
    uploadSub: 'اختر صورة مباشرة من جهازك',
    galleryTitle: 'الاختيار من المعرض',
    gallerySub: 'تصفح الأيقونات والشخصيات المصممة',
    urlTitle: 'صورة عبر رابط URL',
    urlSub: 'استخدم صورة من رابط إنترنت مباشر',
    backToMenu: 'العودة للخيارات',
    urlLabel: 'رابط الصورة',
    livePreview: 'معاينة مباشرة',
    backBtn: 'رجوع',
    applyBtn: 'اعتماد الصورة',
    errInvalidFile: 'يرجى اختيار ملف صورة صالح (PNG أو JPG أو WebP).',
    errEmptyUrl: 'يرجى إدخال رابط الصورة.',
    errInvalidUrl: 'يجب أن يبدأ الرابط بـ https:// أو http://',
    errLoadUrl: 'تعذّر تحميل الصورة من هذا الرابط.',
    labels: {
      'app-crest': 'شعار LingoLearn',
      'scholar-owl': 'بومة المعرفة',
      'rocket-explorer': 'رائد الفضاء',
      'sunny-star': 'النجمة الذهبية',
      'crown-lion': 'الأسد الملكي',
      'book-wizard': 'صديق الكتب',
      'calm-panda': 'الباندا الهادئ',
      'clever-cat': 'القط الذكي',
      'trophy-champ': 'كأس البطولة',
    },
  },
  minigames: {
    mysteryTitle: 'لعبة البطاقة الغامضة',
    mysteryPickPrompt: 'اختر أي بطاقة عشوائية!',
    mysteryMatchPrompt: 'طابق الكلمة الظاهرة مع وصفها!',
    cardLabel: (num) => `بطاقة #${num}`,
    whichDefinition: 'أي وصف يطابق كلمة',
    cardRevealed: 'كُشفت البطاقة!',
    bonusXp: '+15 XP إضافية!',
    goodChoice: 'اختيار موفق',
    scrambleHint: (pos) => `تلميح (${pos})`,
    scrambleEmpty: (len) => `اضغط على الأحرف بالترتيب لتكوين الكلمة (${len} أحرف)`,
    clearBtn: (cur, len) => `مسح (${cur}/${len})`,
    skipBtn: 'تخطي التحدي ←',
    correctSpelling: 'تهجئة صحيحة',
    memoryTitle: 'لعبة الذاكرة السريعة',
    memoryPairs: (done) => `تطابق ${done} / 3 أزواج`,
    matchedBurst: 'تمت المطابقة!',
    wheelChallenge: 'تحدي العجلة!',
    spinningBtn: 'جارٍ التدوير...',
    spinBtn: 'أدر عجلة الحظ!',
    pickedWord: 'الكلمة المختارة:',
    blitzTitle: (round, total) => `البرق السريع · الجولة ${round}/${total}`,
    blitzHits: (hits) => `${hits} إصابات`,
    blitzPrompt: 'اختر الكلمة الإنجليزية المطابقة لهذا الوصف:',
    blitzFast: '⚡ سريع!',
  },
  levels: {
    A1: { title: 'الخطوات الأولى', tagline: 'التحيات والأرقام ١–١٠ والبيت والعائلة', description: 'ابدأ رحلتك بتعلم الأرقام من ١ إلى ١٠ وأساسيات المنزل والطعام والعائلة والمفردات التأسيسية للمستوى A1.' },
    A2: { title: 'مستكشف الحياة اليومية', tagline: 'السفر والطقس والتسوق والصحة', description: 'تحدث بثقة في الرحلات والمطارات وتوقعات الطقس والتسوق والعادات الصحية بمفردات المستوى A2.' },
    B1: { title: 'متحدث واثق', tagline: 'العمل والمشاعر والتقنية والسرد', description: 'عبّر عن مشاعرك وأفكارك بوضوح وتعاون في بيئة العمل وناقش التقنية والقصص بمستوى B1.' },
    B2: { title: 'استراتيجي طليق', tagline: 'القيادة والعلوم والتعابير والمناظرة', description: 'أتقن التعابير الاصطلاحية والمناظرات الفكرية واللغة العلمية والإدارية في المستوى B2.' },
    C1: { title: 'الأكاديمي والقيادي', tagline: 'البلاغة الأكاديمية والدبلوماسية والدقة', description: 'امتلك زمام الكتابة الاحترافية والخطاب الدبلوماسي والمفردات الأكاديمية المتقدمة في المستوى C1.' },
    C2: { title: 'الإتقان الأعلى', tagline: 'الأدب والفلسفة وكامل مفردات الإتقان', description: 'تعمّق في النصوص الأدبية والفلسفية وتدرّب على كامل حصيلة مفردات المستوى C2 عبر مئات الدروس التفاعلية.' },
  },
  achievements: {
    'first-spark': { title: 'الشرارة الأولى', description: 'أكمل درسك الأول في رحلة تعلم الإنجليزية' },
    'streak-3': { title: 'شعلة ٣ أيام', description: 'حافظ على سلسلة تعلم لمدة ٣ أيام متتالية' },
    'a1-complete': { title: 'بطل المستوى A1', description: 'أكمل جميع دروس المستوى التأسيسي A1' },
    'a2-complete': { title: 'مستكشف المستوى A2', description: 'أكمل جميع دروس المستوى التفاعلي A2' },
    'b1-complete': { title: 'متحدث المستوى B1', description: 'أكمل جميع دروس المستوى المتوسط B1' },
    'b2-complete': { title: 'استراتيجي المستوى B2', description: 'أكمل جميع دروس المستوى المتقدم B2' },
    'c1-complete': { title: 'أكاديمي المستوى C1', description: 'أكمل جميع دروس المستوى الأكاديمي C1' },
    'c2-complete': { title: 'أسطورة المستوى C2', description: 'أكمل جميع دروس الإتقان الأعلى C2' },
    'lessons-25': { title: 'مثابر المسار', description: 'أكمل ٢٥ درساً عبر المستويات المختلفة' },
    'lessons-150': { title: 'متحدي القمة', description: 'أكمل ١٥٠ درساً في مسارك التعليمي' },
    'lessons-500': { title: 'ماراثون المعرفة', description: 'أكمل ٥٠٠ درس نحو الإتقان الشامل' },
    'words-500': { title: 'جامع المفردات', description: 'أتقن ٥٠٠ كلمة إنجليزية في الدروس' },
    'words-3000': { title: 'موسوعة الكلمات', description: 'أتقن ٣,٠٠٠ كلمة إنجليزية عبر المستويات' },
    'words-10000': { title: 'حصيلة الأساطير', description: 'أتقن ١٠,٠٠٠ كلمة إنجليزية حتى مستوى C2' },
    'sharp-90': { title: 'دقة القناص', description: 'حافظ على دقة ٩٠٪ أو أكثر في الاختبارات' },
    'xp-5000': { title: 'نجم النقاط', description: 'اجمع ٥,٠٠٠ نقطة خبرة XP' },
  },
  coreLessons: {
    'a1-1': { title: 'البيت والتحيات', subtitle: 'عبارات الترحيب والكلمات المهذبة وغرف المنزل' },
    'a1-numbers': { title: 'العد من ١ إلى ١٠', subtitle: 'تعلم الأرقام من 1 إلى 10 والكميات اليومية' },
    'a1-2': { title: 'أغراض يومية', subtitle: 'الأشياء الشائعة في المنزل والمدرسة' },
    'a1-3': { title: 'الطعام والمقهى', subtitle: 'طلب الوجبات والمشروبات والنكهات' },
    'a1-4': { title: 'العائلة والناس', subtitle: 'أفراد الأسرة والأفعال اليومية الأساسية' },
    'a2-1': { title: 'السفر والاتجاهات', subtitle: 'التنقل في المطارات والمحطات والمدن' },
    'a2-2': { title: 'التسوق والاختيار الذكي', subtitle: 'مقارنة الأسعار والمقاسات والجودة' },
    'a2-3': { title: 'الطقس والطبيعة', subtitle: 'الفصول وتوقعات الطقس والمشاهد الطبيعية' },
    'a2-4': { title: 'الصحة والعادات', subtitle: 'العافية والنشاط والروتين اليومي' },
    'b1-1': { title: 'العمل والطموح', subtitle: 'المسيرة المهنية والعمل الجماعي والأهداف' },
    'b1-2': { title: 'المشاعر والتعاطف', subtitle: 'التعبير عن الأحاسيس وردود الفعل بدقة' },
    'b1-3': { title: 'التقنية والإعلام', subtitle: 'الحياة الرقمية والاتصال والأدوات الذكية' },
    'b1-4': { title: 'السرد والذكريات', subtitle: 'ربط الأحداث والوصف القصصي الحي' },
    'b2-1': { title: 'القيادة والمبادرة', subtitle: 'العمل التنفيذي وبناء التوافق واتخاذ القرار' },
    'b2-2': { title: 'العلوم والاستدامة', subtitle: 'الابتكار والمناخ ومفردات البحث العلمي' },
    'b2-3': { title: 'التعابير والأفعال المركبة', subtitle: 'تحدث بطلاقة وطبيعية في الإنجليزية اليومية' },
    'b2-4': { title: 'المناظرة والتفكير النقدي', subtitle: 'موازنة وجهات النظر والأدلة والحجج' },
    'c1-1': { title: 'البلاغة الأكاديمية', subtitle: 'مفردات رفيعة للمقالات والعروض التقديمية' },
    'c1-2': { title: 'الدبلوماسية والسياسة', subtitle: 'لغة المؤسسات والحوكمة واللباقة الرسمية' },
    'c1-3': { title: 'الصفات الدقيقة', subtitle: 'ارتقِ بالوصف إلى تعبيرات أعمق وأدق' },
    'c1-4': { title: 'الخطاب المركب', subtitle: 'أدوات الربط المتقدمة وأفعال الدقة التعبيرية' },
    'c2-1': { title: 'روائع الأدب والتعبير', subtitle: 'مفردات إيحائية من روائع النثر الكلاسيكي' },
    'c2-2': { title: 'الفلسفة والفكر المجرد', subtitle: 'الدقة الفكرية وإتقان المفاهيم العميقة' },
    'c2-3': { title: 'الفصاحة التنفيذية', subtitle: 'إنجليزية الإدارة العليا والتخطيط الاستراتيجي' },
    'c2-4': { title: 'إتقان التعابير الدقيقة', subtitle: 'تعابير راقية ولمسات بلاغية رفيعة' },
  },
  toast: {
    welcome: (name) => `أهلاً بك، ${name}!`,
    levelUnlocked: (level) => `تم فتح المستوى ${level}!`,
    levelReadySub: 'مستوى جديد جاهز',
    progressReset: 'تمت إعادة تعيين التقدم',
    accountDeleted: 'تم حذف الحساب',
    cloudLinked: 'تم ربط الحساب بالمزامنة السحابية!',
    syncSuccess: 'تمت مزامنة بياناتك مع السحابة',
    streakFreezeBought: 'تم تفعيل تجميد الستريك ليوم واحد!',
    streakFreezeUsed: 'تمت حماية سلسلتك تلقائياً عبر تجميد الستريك!',
  },
};

const EN_STRINGS: UiStrings = {
  appName: 'LingoLearn',
  splashTagline: 'Master English vocabulary & grammar with clarity and joy',
  splashSkip: 'Skip',
  splashStarting: 'Preparing your learning path...',
  offlineBanner: 'Offline mode — saved lessons remain available',
  nav: {
    home: 'Home',
    daily: 'Goals',
    you: 'Profile',
    setting: 'Settings',
    ariaLabel: 'Main navigation',
  },
  auth: {
    loginSubtitle: 'Sign in to sync your English learning progress across devices',
    signupSubtitle: 'Create an account to save your progress in the cloud',
    googleContinue: 'Continue with Google',
    googleSigningIn: 'Connecting with Google...',
    orDivider: 'or with username',
    loginTab: 'Sign In',
    signupTab: 'New Account',
    usernameLabel: 'Username',
    usernamePlaceholder: 'Enter username in English',
    usernameRuleHint: (min, max) => `${min} to ${max} characters (English letters, numbers, _ . -)`,
    usernameCharsCount: (len, max) => `${len}/${max} chars`,
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    submitting: 'Signing in...',
    loginSubmit: 'Sign In',
    signupSubmit: 'Create Account',
    noAccountPrompt: "Don't have an account yet?",
    createOneLink: 'Create one',
    hasAccountPrompt: 'Already have an account?',
    signInLink: 'Sign in',
    errUsernameLength: (min, max) => `Username must be between ${min} and ${max} characters.`,
    errUsernameChars: 'Use only English letters, numbers, (_), (-), or (.).',
    errPasswordRequired: 'Please enter your password.',
    errPasswordLength: 'Password must be at least 4 characters long.',
    errWrongPassword: 'Incorrect username or password.',
    errAccountNotFound: 'Account not found. Check your username, create a new account, or sign in with Google.',
    errUsernameTaken: 'This username is already registered. Try signing in.',
    errEmailProviderDisabled: 'Username/Password cloud sync requires Email/Password Auth enabled in Firebase Console. Use "Continue with Google" above for instant cross-device cloud sync.',
    errGooglePopupClosed: 'Google sign-in popup was closed before completing.',
    errGoogleFailed: 'Could not sign in with Google. Check your connection and try again.',
    errUnexpected: 'Authentication failed. Please try again.',
  },
  home: {
    vocabTab: 'Vocabulary',
    grammarTab: 'Grammar',
    vocabBankBtn: 'Word Vault',
    myAccountBtn: 'Profile',
    settingsBtn: 'Settings',
    dayUnit: 'day',
    learnedWordsStats: (learned, total) => `Learned ${learned} of ${total} words`,
    remainingLessonsStats: (remaining, done, total) => `${remaining} lessons left (${done}/${total})`,
    continueLesson: (order, title) => `Continue: Lesson ${order} · ${title}`,
    unlockLevel: (level, title) => `Unlock ${level} · ${title}`,
    pathHeading: (level, title) => `${level} Path · ${title}`,
    pathSubtitle: 'Scroll down and tap any unlocked lesson to practice with randomized mini-games',
    jumpToCurrentBtn: 'Jump to Current Lesson',
    quickJumpLabel: 'Quick jump:',
    lessonsRangeLabel: (start, end) => `Lessons ${start} – ${end}`,
    backToFirstBtn: 'Back to Start',
    startNowBadge: 'Start Now',
    lessonLabel: (order, title) => `Lesson ${order} · ${title}`,
    levelLabel: (level) => `Level ${level}`,
    wordsAndXp: (words, xp) => `${words} words · +${xp} XP`,
    showMoreLessons: (count, remaining) => `Load ${count} more lessons (${remaining} remaining)`,
    collapseListBtn: 'Collapse List',
    lockedLabel: 'Locked',
  },
  grammar: {
    headerTitle: (level, title) => `English Grammar · ${level} · ${title}`,
    headerSubtitle: 'Structured units inspired by English Grammar in Use with clear rules and interactive practice',
    completedCount: (done, total) => `Completed ${done} of ${total} grammar units`,
    jumpToCurrentUnit: 'Jump to Current Unit',
    allTopics: 'All Topics',
    rulesCount: (count) => `${count} rules`,
    questionsCount: (count) => `${count} exercises`,
    startUnit: 'Start Unit',
    reviewUnit: 'Review Unit',
    unitBadge: (range) => `Ref ${range}`,
    learnTab: 'Rule Guide',
    practiceTab: 'Interactive Practice',
    ruleHeader: (idx, total) => `Rule ${idx} of ${total}`,
    examplesLabel: 'Examples',
    listenExample: 'Listen to example',
    startPracticeBtn: 'Start Practice',
    nextRuleBtn: 'Next Rule',
    checkAnswerBtn: 'Check Answer',
    nextQuestionBtn: 'Next Question',
    finishUnitBtn: 'Complete Unit & Claim XP',
    correctFeedback: 'Correct! Great grasp of this rule.',
    wrongFeedback: 'Review the rule explanation below — practice reinforces mastery.',
    unitCompletedTitle: 'Well done! Grammar unit completed',
    unitCompletedDesc: (level) => `You completed the rules and exercises for level ${level}.`,
    backToGrammarPath: 'Back to Grammar Units',
    topics: {
      tenses: 'Present & Past',
      perfect: 'Present & Past Perfect',
      future: 'Future Forms',
      modals: 'Modal Verbs',
      conditionals: 'Conditionals & Wish',
      passive: 'Passive Voice',
      reported: 'Reported Speech',
      questions: 'Questions & Auxiliaries',
      'ing-to': '-ing and to...',
      articles: 'Articles & Nouns',
      pronouns: 'Pronouns & Determiners',
      relative: 'Relative Clauses',
      adjectives: 'Adjectives & Adverbs',
      conjunctions: 'Conjunctions & Prepositions',
      phrasal: 'Phrasal Verbs',
    },
  },
  daily: {
    pageTitle: 'Daily Goals & Featured Word',
    pageSubtitle: 'Track today’s XP target and explore a featured word with audio and examples',
    dailyGoalTitle: 'Daily Goal',
    dailyGoalGreeting: (name) => `Hi ${name} · Keep it going`,
    lessonsToday: (count) => `${count} lessons today`,
    goalCompleted: 'Daily goal reached!',
    goalProgress: (pct) => `${pct}% completed`,
    continueLearningBtn: 'Practice Now',
    streakLabel: 'Current Streak',
    streakDays: (n) => `${n} day streak`,
    featuredWordTitle: (level) => `Featured Word · Level ${level}`,
    nextWordBtn: 'Next Word →',
    levelFilterLabel: 'Featured Word Level',
    exploreAllWords: (total) => `Explore All Words (${total})`,
    speakWordAria: (word) => `Pronounce ${word}`,
    speakSlowAria: (word) => `Pronounce ${word} slowly`,
  },
  you: {
    currentLevelLine: (lvl, title, unlocked) => `Current level: ${lvl} · ${title} · ${unlocked} of 6 levels unlocked`,
    levelProgress: (lvl) => `Level ${lvl} Progress`,
    changeAvatarBtn: 'Change Avatar',
    vocabBtn: (count) => `Vocabulary (${count})`,
    accountSectionTitle: 'Account & Cloud Sync',
    accountSectionSub: 'Edit your display name, email, or sync your progress with the cloud',
    cloudSynced: 'Cloud Sync Active',
    cloudSyncing: 'Syncing...',
    cloudLocalOnly: 'Local Only — Link Google for Cloud Sync',
    cloudSyncError: 'Cloud Sync Error — Retry',
    syncNowBtn: 'Sync Now',
    linkGoogleBtn: 'Link with Google',
    displayNameLabel: 'Display Name',
    emailLabel: 'Email (optional)',
    saveBtn: 'Save',
    savedBtn: 'Saved!',
    signOutBtn: 'Sign Out',
    resetBtn: 'Reset Progress',
    deleteBtn: 'Delete Account',
    statStreak: 'Day Streak',
    statXp: 'Total XP',
    statLessons: 'Lessons Completed',
    statAccuracy: 'Accuracy',
    weeklyTitle: 'Weekly Activity',
    weeklySub: 'XP earned over the last 7 days',
    thisWeek: 'This Week',
    days: { Mon: 'Mon', Tue: 'Tue', Wed: 'Wed', Thu: 'Thu', Fri: 'Fri', Sat: 'Sat', Sun: 'Sun' },
    masteredTitle: 'Mastered Words',
    masteredEmpty: 'Complete your first lesson to start building your mastered vocabulary!',
    exploreAllWords: (total) => `Explore All Words (${total})`,
    achievementsTitle: 'Achievements',
    achievementsSub: 'Progressive badges tracking your journey from A1 to C2',
    confirmDeleteTitle: 'Permanently delete your account?',
    confirmDeleteBody: 'This will permanently delete your account, cloud sync data, XP, and completed lessons.',
    confirmDeleteBtn: 'Yes, Delete Account',
    confirmResetTitle: 'Reset all learning progress?',
    confirmResetBody: 'This will reset your XP, streak, and lesson progress back to A1.',
    confirmResetBtn: 'Yes, Reset Progress',
    cancelBtn: 'Cancel',
  },
  settings: {
    title: 'Learning, Audio & Language Settings',
    subtitle: 'Customize your daily XP goal, default level, calm sound effects, speech speed, theme, and language',
    audioStudioTitle: 'Audio & Pronunciation Studio',
    testChimeBtn: 'Test Chime',
    testVoiceBtn: (speed) => `Test Voice (${speed}x)`,
    voiceSpeedLabel: 'Word Pronunciation Speed',
    calmSfxTitle: 'Calm Sound Effects',
    calmSfxDesc: 'Gentle acoustic chimes for answers, card flips, and rewards',
    autoSpeakTitle: 'Auto-Speak Vocabulary',
    autoSpeakDesc: 'Automatically pronounce English words when learning cards appear',
    studyPlanTitle: 'Study Plan & Default Level',
    dailyGoalXpLabel: 'Daily XP Goal',
    defaultLevelLabel: 'Default Level',
    appearanceTitle: 'Appearance & Reminders',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    remindersTitle: 'Daily Practice Reminders',
    remindersDesc: 'Gentle nudges to keep your learning streak alive',
    languageTitle: 'Interface & Translation Language',
    languageSub: 'Updates all menus, controls, word meanings, and grammar explanations',
    speedTags: { '0.65': 'Slow', '0.85': 'Clear', '1': 'Normal', '1.2': 'Fast' },
    streakFreezeTitle: 'Streak Freeze',
    streakFreezeDesc: 'Protects your streak for one missed day when your daily XP is 0',
    streakFreezeCost: (cost) => `${cost} XP`,
    streakFreezeActiveBadge: 'Armed · 1-Day Protection Active',
    streakFreezeBuyBtn: (cost) => `Buy & Enable Freeze · ${cost} XP`,
    streakFreezeNeedXp: (missing) => `Need ${missing} more XP`,
    streakFreezeOnlyZeroXp: 'Available to purchase & enable only when today’s XP is 0',
    streakFreezeProtectedNote: (date) => `Your streak was auto-protected on ${date}`,
  },
  streakCelebration: {
    newStreakTitle: (days) => `${days}-Day Streak!`,
    milestoneTitle: (days) => `Milestone Reached · ${days} Days!`,
    newStreakSub: 'You extended your daily learning streak — keep the momentum going!',
    milestoneSub: (days) => `Incredible consistency! You hit the ${days}-day streak milestone!`,
    nextMilestone: (target, remaining) => `Next milestone: ${target} days (${remaining} to go)`,
    maxMilestone: 'Legendary consistency milestone!',
    continueBtn: 'Keep Learning',
    daysUnit: 'days',
  },
  lessonPlayer: {
    exitAria: 'Exit lesson',
    completedBadge: 'Lesson Completed!',
    lessonHeading: (order, title) => `Lesson ${order} · ${title}`,
    practicedSummary: (words, level) => `You practiced ${words} words at level ${level}.`,
    xpEarnedLabel: 'XP Earned',
    accuracyLabel: 'Accuracy',
    wordsLabel: 'Words',
    backToPathBtn: 'Back to Learning Path',
    listenBtn: 'Listen',
    slowBtn: 'Slow',
    playAudioBtn: (speed) => `Play Audio (${speed}x)`,
    understoodNextBtn: 'Got it, Next',
    continueBtn: 'Continue',
    checkBtn: 'Check Answer',
    excellentFeedback: 'Excellent! Keep going!',
    correctAnswerWas: 'Correct answer:',
    matchedProgress: (done, total) => `Matched ${done} of ${total}`,
    minigamePromptHint: 'Complete the mini-game challenge above to continue',
    introHint: 'Listen to the pronunciation, read the example, then continue',
    selectAnswerHint: 'Select an answer then tap Check',
    coachCorrectCombo: (combo) => `Awesome ${combo}x streak! Keep up this rhythm.`,
    coachCorrect: 'Well done! Accurate answer.',
    coachWrong: 'Check the highlighted correct answer below — repetition builds mastery.',
    coachMinigame: 'Randomized mini-game challenge for playful reinforcement!',
    coachIntro: 'Listen calmly to the pronunciation and review the example sentence.',
    coachMatch: 'Tap a word and select its matching meaning.',
    coachDefault: 'Pick the best option below.',
    introPrompt: 'Tap to listen and learn this word',
    choicePrompt: (word) => `What does "${word}" mean?`,
    listenPrompt: 'Listen carefully and choose the word you heard',
    contextPrompt: 'Complete the sentence with the best word',
    deckListenPrompt: (level) => `Listen closely and pick the ${level} word`,
    minigamePrompts: {
      'mystery-card': 'Mystery Card: Pick a card to reveal a surprise word!',
      scramble: 'Letter Scramble: Arrange the letters to spell the word!',
      'memory-flip': 'Memory Flip: Match every word with its hidden clue!',
      'word-wheel': 'Word Wheel: Spin the wheel for a bonus challenge!',
      'speed-blitz': 'Speed Blitz: Answer 3 quick challenges in a row!',
    },
  },
  vault: {
    title: 'Complete Vocabulary Vault',
    subtitle: (total, mastered) => `${total} words from A1 to C2 · ${mastered} mastered`,
    searchPlaceholder: 'Search English word, meaning, or topic...',
    filterAll: 'All',
    filterCurated: 'Lessons',
    allLevels: (total) => `All (${total})`,
    showingCount: (shown, total) => `Showing ${shown} of ${total} matching words`,
    speedLabel: (speed) => `Speed: ${speed}x`,
    emptyResult: (query) => `No words found matching "${query}". Try another term or level.`,
    masteredTag: 'Mastered',
    loadMoreBtn: (remaining) => `Show 100 more words (${remaining} remaining)`,
    catalogDef: (pos, level) => `English vocabulary (${pos}) in level ${level}.`,
  },
  avatarModal: {
    title: 'Customize Profile Picture',
    subMenu: 'Choose how to set your avatar',
    subGallery: 'Pick from the character gallery',
    subUrl: 'Paste a direct image URL',
    uploadTitle: 'Upload from Device',
    uploadSub: 'Choose an image directly from your device',
    galleryTitle: 'Choose from Gallery',
    gallerySub: 'Browse illustrated character icons',
    urlTitle: 'Image via URL',
    urlSub: 'Use a direct web image link',
    backToMenu: 'Back to Options',
    urlLabel: 'Image URL',
    livePreview: 'Live preview',
    backBtn: 'Back',
    applyBtn: 'Use Image',
    errInvalidFile: 'Please select a valid image file (PNG, JPG, or WebP).',
    errEmptyUrl: 'Please enter an image URL.',
    errInvalidUrl: 'URL must start with https:// or http://',
    errLoadUrl: 'Could not load image from this URL.',
    labels: {
      'app-crest': 'LingoLearn Crest',
      'scholar-owl': 'Scholar Owl',
      'rocket-explorer': 'Space Explorer',
      'sunny-star': 'Golden Star',
      'crown-lion': 'Royal Lion',
      'book-wizard': 'Book Friend',
      'calm-panda': 'Calm Panda',
      'clever-cat': 'Clever Cat',
      'trophy-champ': 'Trophy Champ',
    },
  },
  minigames: {
    mysteryTitle: 'Mystery Card',
    mysteryPickPrompt: 'Pick any card!',
    mysteryMatchPrompt: 'Match the revealed word with its meaning!',
    cardLabel: (num) => `Card #${num}`,
    whichDefinition: 'Which definition matches',
    cardRevealed: 'Card revealed!',
    bonusXp: '+15 Bonus XP!',
    goodChoice: 'Great pick',
    scrambleHint: (pos) => `Hint (${pos})`,
    scrambleEmpty: (len) => `Tap letters in order to form the word (${len} letters)`,
    clearBtn: (cur, len) => `Clear (${cur}/${len})`,
    skipBtn: 'Skip challenge →',
    correctSpelling: 'Spot-on spelling',
    memoryTitle: 'Quick Memory',
    memoryPairs: (done) => `Matched ${done} / 3 pairs`,
    matchedBurst: 'Matched!',
    wheelChallenge: 'Wheel Challenge!',
    spinningBtn: 'Spinning...',
    spinBtn: 'Spin the Wheel!',
    pickedWord: 'Selected word:',
    blitzTitle: (round, total) => `Speed Blitz · Round ${round}/${total}`,
    blitzHits: (hits) => `${hits} hits`,
    blitzPrompt: 'Choose the English word matching this clue:',
    blitzFast: '⚡ Fast!',
  },
  levels: {
    A1: { title: 'First Steps', tagline: 'Greetings, numbers 1–10, home & family', description: 'Start your journey with numbers 1–10, home essentials, food, family, and foundational A1 vocabulary.' },
    A2: { title: 'Everyday Explorer', tagline: 'Travel, weather, shopping & health', description: 'Speak confidently about travel, airports, weather, shopping, and daily health habits at A2.' },
    B1: { title: 'Confident Speaker', tagline: 'Work, emotions, technology & stories', description: 'Express feelings and ideas clearly, collaborate at work, and discuss tech and stories at B1.' },
    B2: { title: 'Fluent Strategist', tagline: 'Leadership, science, idioms & debate', description: 'Master idioms, structured debates, scientific terms, and professional communication at B2.' },
    C1: { title: 'Academic & Executive', tagline: 'Academic rhetoric, diplomacy & precision', description: 'Command professional writing, diplomatic tone, and advanced academic vocabulary at C1.' },
    C2: { title: 'Grand Mastery', tagline: 'Literature, philosophy & complete mastery', description: 'Explore literary prose, philosophy, and comprehensive C2 mastery across interactive units.' },
  },
  achievements: {
    'first-spark': { title: 'First Spark', description: 'Complete your very first English lesson' },
    'streak-3': { title: '3-Day Flame', description: 'Maintain a 3-day consecutive learning streak' },
    'a1-complete': { title: 'A1 Champion', description: 'Complete all lessons in Level A1' },
    'a2-complete': { title: 'A2 Explorer', description: 'Complete all lessons in Level A2' },
    'b1-complete': { title: 'B1 Speaker', description: 'Complete all lessons in Level B1' },
    'b2-complete': { title: 'B2 Strategist', description: 'Complete all lessons in Level B2' },
    'c1-complete': { title: 'C1 Scholar', description: 'Complete all lessons in Level C1' },
    'c2-complete': { title: 'C2 Legend', description: 'Complete all lessons in Level C2' },
    'lessons-25': { title: 'Path Builder', description: 'Complete 25 lessons across levels' },
    'lessons-150': { title: 'Summit Challenger', description: 'Complete 150 lessons on your journey' },
    'lessons-500': { title: 'Knowledge Marathon', description: 'Complete 500 lessons toward total mastery' },
    'words-500': { title: 'Word Collector', description: 'Master 500 English words in lessons' },
    'words-3000': { title: 'Lexicon Master', description: 'Master 3,000 English words across levels' },
    'words-10000': { title: 'Mastery Vault', description: 'Master 10,000 English words up to C2' },
    'sharp-90': { title: 'Sharp Accuracy', description: 'Maintain 90%+ accuracy across exercises' },
    'xp-5000': { title: 'XP Star', description: 'Collect 5,000 total XP' },
  },
  coreLessons: {
    'a1-1': { title: 'Home & Greetings', subtitle: 'Polite phrases, greetings, and rooms at home' },
    'a1-numbers': { title: 'Counting 1 to 10', subtitle: 'Learn numbers 1–10 and everyday quantities' },
    'a1-2': { title: 'Everyday Objects', subtitle: 'Common items around home and school' },
    'a1-3': { title: 'Food & Café', subtitle: 'Ordering meals, drinks, and flavors' },
    'a1-4': { title: 'Family & People', subtitle: 'Family members and basic daily verbs' },
    'a2-1': { title: 'Travel & Directions', subtitle: 'Getting around airports, stations, and cities' },
    'a2-2': { title: 'Smart Shopping', subtitle: 'Comparing prices, sizes, and quality' },
    'a2-3': { title: 'Weather & Nature', subtitle: 'Seasons, forecasts, and natural scenes' },
    'a2-4': { title: 'Health & Habits', subtitle: 'Wellness, fitness, and daily routines' },
    'b1-1': { title: 'Work & Ambition', subtitle: 'Career growth, teamwork, and goals' },
    'b1-2': { title: 'Emotions & Empathy', subtitle: 'Expressing feelings and reactions accurately' },
    'b1-3': { title: 'Tech & Media', subtitle: 'Digital life, communication, and smart tools' },
    'b1-4': { title: 'Stories & Memories', subtitle: 'Connecting events with vivid storytelling' },
    'b2-1': { title: 'Leadership & Initiative', subtitle: 'Executive decisions and building alignment' },
    'b2-2': { title: 'Science & Sustainability', subtitle: 'Innovation, climate, and research vocabulary' },
    'b2-3': { title: 'Idioms & Phrasal Verbs', subtitle: 'Speak naturally with everyday English idioms' },
    'b2-4': { title: 'Debate & Critical Thinking', subtitle: 'Weighing evidence, logic, and viewpoints' },
    'c1-1': { title: 'Academic Rhetoric', subtitle: 'Elevated vocabulary for essays and talks' },
    'c1-2': { title: 'Diplomacy & Policy', subtitle: 'Governance, institutions, and formal tact' },
    'c1-3': { title: 'Nuanced Adjectives', subtitle: 'Upgrade descriptions with subtle precision' },
    'c1-4': { title: 'Complex Discourse', subtitle: 'Advanced connectors and analytical verbs' },
    'c2-1': { title: 'Literary Craft', subtitle: 'Evocative vocabulary from classic prose' },
    'c2-2': { title: 'Philosophy & Abstract Thought', subtitle: 'Intellectual precision for deep concepts' },
    'c2-3': { title: 'Executive Eloquence', subtitle: 'High-level leadership and strategic English' },
    'c2-4': { title: 'Subtle Mastery', subtitle: 'Refined idioms and rhetorical elegance' },
  },
  toast: {
    welcome: (name) => `Welcome, ${name}!`,
    levelUnlocked: (level) => `Level ${level} Unlocked!`,
    levelReadySub: 'New level ready',
    progressReset: 'Progress has been reset',
    accountDeleted: 'Account deleted',
    cloudLinked: 'Account linked to Google Cloud Sync!',
    syncSuccess: 'Synced with cloud storage',
    streakFreezeBought: 'Streak Freeze armed for 1 missed day!',
    streakFreezeUsed: 'Streak Freeze protected your streak!',
  },
};

const ES_STRINGS: UiStrings = {
  ...EN_STRINGS,
  splashTagline: 'Domina el vocabulario y la gramática inglesa con claridad',
  splashSkip: 'Saltar',
  splashStarting: 'Preparando tu ruta de aprendizaje...',
  offlineBanner: 'Modo sin conexión — tus lecciones guardadas están disponibles',
  nav: {
    home: 'Inicio',
    daily: 'Metas',
    you: 'Perfil',
    setting: 'Ajustes',
    ariaLabel: 'Navegación principal',
  },
  auth: {
    ...EN_STRINGS.auth,
    loginSubtitle: 'Inicia sesión para sincronizar tu progreso en la nube',
    signupSubtitle: 'Crea una cuenta nueva para guardar tu progreso en la nube',
    googleContinue: 'Continuar con Google',
    googleSigningIn: 'Conectando con Google...',
    orDivider: 'o con usuario',
    loginTab: 'Iniciar sesión',
    signupTab: 'Nueva cuenta',
    usernameLabel: 'Usuario',
    usernamePlaceholder: 'Escribe tu usuario en inglés',
    usernameRuleHint: (min, max) => `De ${min} a ${max} caracteres (letras inglesas, números, _ . -)`,
    usernameCharsCount: (len, max) => `${len}/${max} car.`,
    passwordLabel: 'Contraseña',
    passwordPlaceholder: 'Ingresa tu contraseña',
    showPassword: 'Mostrar contraseña',
    hidePassword: 'Ocultar contraseña',
    submitting: 'Verificando...',
    loginSubmit: 'Entrar',
    signupSubmit: 'Crear cuenta',
    noAccountPrompt: '¿Aún no tienes cuenta?',
    createOneLink: 'Crear cuenta',
    hasAccountPrompt: '¿Ya tienes cuenta?',
    signInLink: 'Inicia sesión',
    errUsernameLength: (min, max) => `El usuario debe tener entre ${min} y ${max} caracteres.`,
    errUsernameChars: 'Usa solo letras inglesas, números, (_), (-) o (.).',
    errPasswordRequired: 'Por favor ingresa tu contraseña.',
    errPasswordLength: 'La contraseña debe tener al menos 4 caracteres.',
    errWrongPassword: 'Usuario o contraseña incorrectos.',
    errAccountNotFound: 'Cuenta no encontrada. Verifica tu usuario, regístrate o usa Google.',
    errUsernameTaken: 'Ese usuario ya existe. Intenta iniciar sesión.',
    errEmailProviderDisabled: 'El acceso por usuario requiere activar Email/Password en Firebase Console. Usa "Continuar con Google" arriba para sincronización inmediata.',
    errGooglePopupClosed: 'Se cerró la ventana de Google antes de completar.',
    errGoogleFailed: 'No se pudo iniciar sesión con Google. Revisa tu conexión.',
    errUnexpected: 'Error de autenticación. Intenta de nuevo.',
  },
  home: {
    vocabTab: 'Vocabulario',
    grammarTab: 'Gramática',
    vocabBankBtn: 'Banco de palabras',
    myAccountBtn: 'Perfil',
    settingsBtn: 'Ajustes',
    dayUnit: 'días',
    learnedWordsStats: (learned, total) => `Aprendidas ${learned} de ${total} palabras`,
    remainingLessonsStats: (remaining, done, total) => `Quedan ${remaining} lecciones (${done}/${total})`,
    continueLesson: (order, title) => `Continuar: Lección ${order} · ${title}`,
    unlockLevel: (level, title) => `Desbloquear ${level} · ${title}`,
    pathHeading: (level, title) => `Ruta ${level} · ${title}`,
    pathSubtitle: 'Desliza y toca cualquier lección desbloqueada para practicar con minijuegos',
    jumpToCurrentBtn: 'Ir a mi lección actual',
    quickJumpLabel: 'Salto rápido:',
    lessonsRangeLabel: (start, end) => `Lecciones ${start} – ${end}`,
    backToFirstBtn: 'Volver al inicio',
    startNowBadge: 'Empezar',
    lessonLabel: (order, title) => `Lección ${order} · ${title}`,
    levelLabel: (level) => `Nivel ${level}`,
    wordsAndXp: (words, xp) => `${words} palabras · +${xp} XP`,
    showMoreLessons: (count, remaining) => `Ver ${count} lecciones más (${remaining} restantes)`,
    collapseListBtn: 'Contraer lista',
    lockedLabel: 'Bloqueado',
  },
  grammar: {
    headerTitle: (level, title) => `Gramática Inglesa · ${level} · ${title}`,
    headerSubtitle: 'Unidades interactivas basadas en English Grammar in Use con reglas claras y práctica',
    completedCount: (done, total) => `${done} de ${total} unidades completadas`,
    jumpToCurrentUnit: 'Ir a mi unidad actual',
    allTopics: 'Todos los temas',
    rulesCount: (count) => `${count} reglas`,
    questionsCount: (count) => `${count} ejercicios`,
    startUnit: 'Iniciar unidad',
    reviewUnit: 'Repasar unidad',
    unitBadge: (range) => `Ref. ${range}`,
    learnTab: 'Explicación',
    practiceTab: 'Práctica interactiva',
    ruleHeader: (idx, total) => `Regla ${idx} de ${total}`,
    examplesLabel: 'Ejemplos',
    listenExample: 'Escuchar ejemplo',
    startPracticeBtn: 'Empezar práctica',
    nextRuleBtn: 'Siguiente regla',
    checkAnswerBtn: 'Comprobar',
    nextQuestionBtn: 'Siguiente pregunta',
    finishUnitBtn: 'Completar unidad y cobrar XP',
    correctFeedback: '¡Correcto! Excelente dominio de la regla.',
    wrongFeedback: 'Revisa la explicación — la práctica consolida el aprendizaje.',
    unitCompletedTitle: '¡Muy bien! Unidad de gramática completada',
    unitCompletedDesc: (level) => `Completaste las reglas y ejercicios del nivel ${level}.`,
    backToGrammarPath: 'Volver a las unidades',
    topics: {
      tenses: 'Presente y Pasado',
      perfect: 'Presente y Pasado Perfecto',
      future: 'Formas del Futuro',
      modals: 'Verbos Modales',
      conditionals: 'Condicionales y Wish',
      passive: 'Voz Pasiva',
      reported: 'Estilo Indirecto',
      questions: 'Preguntas y Auxiliares',
      'ing-to': '-ing y to...',
      articles: 'Artículos y Sustantivos',
      pronouns: 'Pronombres y Determinantes',
      relative: 'Oraciones de Relativo',
      adjectives: 'Adjetivos y Adverbios',
      conjunctions: 'Conjunciones y Preposiciones',
      phrasal: 'Verbos Frasales',
    },
  },
  daily: {
    pageTitle: 'Metas diarias y palabra destacada',
    pageSubtitle: 'Sigue tu meta de XP diaria y descubre palabras clave con audio y ejemplos',
    dailyGoalTitle: 'Meta diaria',
    dailyGoalGreeting: (name) => `Hola ${name} · Sigue así`,
    lessonsToday: (count) => `${count} lecciones hoy`,
    goalCompleted: '¡Meta diaria alcanzada!',
    goalProgress: (pct) => `${pct}% completado`,
    continueLearningBtn: 'Practicar ahora',
    streakLabel: 'Racha actual',
    streakDays: (n) => `${n} días seguidos`,
    featuredWordTitle: (level) => `Palabra destacada · Nivel ${level}`,
    nextWordBtn: 'Siguiente →',
    levelFilterLabel: 'Nivel de palabra destacada',
    exploreAllWords: (total) => `Explorar todas las palabras (${total})`,
    speakWordAria: (word) => `Pronunciar ${word}`,
    speakSlowAria: (word) => `Pronunciar ${word} despacio`,
  },
  you: {
    currentLevelLine: (lvl, title, unlocked) => `Nivel actual: ${lvl} · ${title} · ${unlocked} de 6 niveles desbloqueados`,
    levelProgress: (lvl) => `Progreso del nivel ${lvl}`,
    changeAvatarBtn: 'Cambiar foto',
    vocabBtn: (count) => `Vocabulario (${count})`,
    accountSectionTitle: 'Cuenta y sincronización en la nube',
    accountSectionSub: 'Edita tu nombre, correo o sincroniza tu progreso',
    cloudSynced: 'Nube sincronizada',
    cloudSyncing: 'Sincronizando...',
    cloudLocalOnly: 'Solo local — vincula Google',
    cloudSyncError: 'Error al sincronizar — reintenta',
    syncNowBtn: 'Sincronizar',
    linkGoogleBtn: 'Vincular con Google',
    displayNameLabel: 'Nombre público',
    emailLabel: 'Correo electrónico (opcional)',
    saveBtn: 'Guardar',
    savedBtn: '¡Guardado!',
    signOutBtn: 'Cerrar sesión',
    resetBtn: 'Reiniciar progreso',
    deleteBtn: 'Eliminar cuenta',
    statStreak: 'Días de racha',
    statXp: 'XP total',
    statLessons: 'Lecciones completadas',
    statAccuracy: 'Precisión',
    weeklyTitle: 'Actividad semanal',
    weeklySub: 'XP ganados en los últimos 7 días',
    thisWeek: 'Esta semana',
    days: { Mon: 'Lun', Tue: 'Mar', Wed: 'Mié', Thu: 'Jue', Fri: 'Vie', Sat: 'Sáb', Sun: 'Dom' },
    masteredTitle: 'Palabras dominadas',
    masteredEmpty: '¡Completa tu primera lección para empezar tu colección!',
    exploreAllWords: (total) => `Explorar todas las palabras (${total})`,
    achievementsTitle: 'Logros',
    achievementsSub: 'Insignias progresivas desde el nivel A1 hasta C2',
    confirmDeleteTitle: '¿Eliminar tu cuenta permanentemente?',
    confirmDeleteBody: 'Esto eliminará tu cuenta, datos en la nube, XP y lecciones completadas.',
    confirmDeleteBtn: 'Sí, eliminar cuenta',
    confirmResetTitle: '¿Reiniciar tu progreso?',
    confirmResetBody: 'Esto reiniciará tu XP, racha y lecciones al nivel A1.',
    confirmResetBtn: 'Sí, reiniciar',
    cancelBtn: 'Cancelar',
  },
  settings: {
    title: 'Ajustes de aprendizaje, audio e idioma',
    subtitle: 'Personaliza tu meta diaria, nivel predeterminado, audio, apariencia e idioma',
    audioStudioTitle: 'Estudio de audio y pronunciación',
    testChimeBtn: 'Probar sonido',
    testVoiceBtn: (speed) => `Probar voz (${speed}x)`,
    voiceSpeedLabel: 'Velocidad de pronunciación',
    calmSfxTitle: 'Efectos de sonido suaves',
    calmSfxDesc: 'Tonos acústicos relajantes al responder',
    autoSpeakTitle: 'Pronunciación automática',
    autoSpeakDesc: 'Reproduce la palabra al mostrar tarjetas',
    studyPlanTitle: 'Plan de estudio y nivel',
    dailyGoalXpLabel: 'Meta diaria de XP',
    defaultLevelLabel: 'Nivel predeterminado',
    appearanceTitle: 'Apariencia y recordatorios',
    lightMode: 'Modo claro',
    darkMode: 'Modo oscuro',
    remindersTitle: 'Recordatorios diarios',
    remindersDesc: 'Avisos suaves para mantener tu racha',
    languageTitle: 'Idioma de la interfaz y traducción',
    languageSub: 'Cambia el idioma de los menús, traducciones y gramática',
    speedTags: { '0.65': 'Lento', '0.85': 'Claro', '1': 'Normal', '1.2': 'Rápido' },
    streakFreezeTitle: 'Protector de Racha (Streak Freeze)',
    streakFreezeDesc: 'Protege tu racha por un día cuando tus XP diarios están en 0',
    streakFreezeCost: (cost) => `${cost} XP`,
    streakFreezeActiveBadge: 'Activo · Protección de 1 día',
    streakFreezeBuyBtn: (cost) => `Comprar y activar · ${cost} XP`,
    streakFreezeNeedXp: (missing) => `Necesitas ${missing} XP más`,
    streakFreezeOnlyZeroXp: 'Disponible para activar solo cuando tus XP de hoy son 0',
    streakFreezeProtectedNote: (date) => `Tu racha fue protegida automáticamente el ${date}`,
  },
  streakCelebration: {
    newStreakTitle: (days) => `¡Racha de ${days} días!`,
    milestoneTitle: (days) => `¡Hito alcanzado · ${days} días!`,
    newStreakSub: '¡Sumaste un nuevo día a tu racha de aprendizaje!',
    milestoneSub: (days) => `¡Constancia increíble! Alcanzaste el hito de ${days} días.`,
    nextMilestone: (target, remaining) => `Próximo hito: ${target} días (faltan ${remaining})`,
    maxMilestone: '¡Hito legendario de constancia!',
    continueBtn: 'Seguir aprendiendo',
    daysUnit: 'días',
  },
  lessonPlayer: {
    exitAria: 'Salir de la lección',
    completedBadge: '¡Lección completada!',
    lessonHeading: (order, title) => `Lección ${order} · ${title}`,
    practicedSummary: (words, level) => `Practicaste ${words} palabras del nivel ${level}.`,
    xpEarnedLabel: 'XP ganados',
    accuracyLabel: 'Precisión',
    wordsLabel: 'Palabras',
    backToPathBtn: 'Volver a la ruta',
    listenBtn: 'Escuchar',
    slowBtn: 'Lento',
    playAudioBtn: (speed) => `Reproducir (${speed}x)`,
    understoodNextBtn: 'Entendido, siguiente',
    continueBtn: 'Continuar',
    checkBtn: 'Comprobar',
    excellentFeedback: '¡Excelente! ¡Sigue así!',
    correctAnswerWas: 'Respuesta correcta:',
    matchedProgress: (done, total) => `${done} de ${total} emparejados`,
    minigamePromptHint: 'Completa el minijuego de arriba para continuar',
    introHint: 'Escucha la pronunciación, lee el ejemplo y continúa',
    selectAnswerHint: 'Elige una respuesta y pulsa Comprobar',
    coachCorrectCombo: (combo) => `¡Racha genial de ${combo}x! Sigue con ese ritmo.`,
    coachCorrect: '¡Muy bien! Respuesta correcta.',
    coachWrong: 'Revisa la respuesta correcta abajo — repetir fortalece la memoria.',
    coachMinigame: '¡Minijuego aleatorio para reforzar palabras jugando!',
    coachIntro: 'Escucha con calma la pronunciación y lee el ejemplo.',
    coachMatch: 'Toca una palabra y elige su significado correspondiente.',
    coachDefault: 'Elige la mejor opción abajo.',
    introPrompt: 'Toca para escuchar y aprender esta palabra',
    choicePrompt: (word) => `¿Qué significa "${word}"?`,
    listenPrompt: 'Escucha con atención y elige la palabra correcta',
    contextPrompt: 'Completa la oración con la palabra adecuada',
    deckListenPrompt: (level) => `Escucha bien y elige la palabra del nivel ${level}`,
    minigamePrompts: {
      'mystery-card': 'Carta Misteriosa: ¡Elige una carta sorpresa!',
      scramble: 'Letras Revueltas: ¡Ordena las letras para formar la palabra!',
      'memory-flip': 'Memoria Rápida: ¡Une cada palabra con su pista!',
      'word-wheel': 'Ruleta de Palabras: ¡Gira la ruleta para un reto extra!',
      'speed-blitz': 'Relámpago Veloz: ¡Responde 3 retos seguidos!',
    },
  },
  vault: {
    title: 'Banco completo de vocabulario',
    subtitle: (total, mastered) => `${total} palabras de A1 a C2 · ${mastered} dominadas`,
    searchPlaceholder: 'Buscar palabra, significado o tema...',
    filterAll: 'Todo',
    filterCurated: 'Lecciones',
    allLevels: (total) => `Todo (${total})`,
    showingCount: (shown, total) => `Mostrando ${shown} de ${total} palabras`,
    speedLabel: (speed) => `Velocidad: ${speed}x`,
    emptyResult: (query) => `No se encontraron palabras para "${query}".`,
    masteredTag: 'Dominada',
    loadMoreBtn: (remaining) => `Mostrar 100 palabras más (${remaining} restantes)`,
    catalogDef: (pos, level) => `Vocabulario en inglés (${pos}) del nivel ${level}.`,
  },
  avatarModal: {
    title: 'Personalizar foto de perfil',
    subMenu: 'Elige cómo configurar tu avatar',
    subGallery: 'Elige de la galería ilustrada',
    subUrl: 'Pega un enlace directo de imagen',
    uploadTitle: 'Subir desde el dispositivo',
    uploadSub: 'Elige una imagen de tu dispositivo',
    galleryTitle: 'Elegir de la galería',
    gallerySub: 'Explora personajes e iconos diseñados',
    urlTitle: 'Imagen por URL',
    urlSub: 'Usa un enlace web directo',
    backToMenu: 'Volver a opciones',
    urlLabel: 'URL de imagen',
    livePreview: 'Vista previa',
    backBtn: 'Atrás',
    applyBtn: 'Usar imagen',
    errInvalidFile: 'Selecciona una imagen válida (PNG, JPG o WebP).',
    errEmptyUrl: 'Ingresa la URL de la imagen.',
    errInvalidUrl: 'La URL debe comenzar con https:// o http://',
    errLoadUrl: 'No se pudo cargar la imagen desde este enlace.',
    labels: {
      'app-crest': 'Emblema LingoLearn',
      'scholar-owl': 'Búho Sabio',
      'rocket-explorer': 'Explorador Espacial',
      'sunny-star': 'Estrella Dorada',
      'crown-lion': 'León Real',
      'book-wizard': 'Amigo de Libros',
      'calm-panda': 'Panda Tranquilo',
      'clever-cat': 'Gato Astuto',
      'trophy-champ': 'Copa Campeón',
    },
  },
  minigames: {
    mysteryTitle: 'Carta Misteriosa',
    mysteryPickPrompt: '¡Elige cualquier carta!',
    mysteryMatchPrompt: '¡Une la palabra con su definición!',
    cardLabel: (num) => `Carta #${num}`,
    whichDefinition: '¿Qué definición corresponde a',
    cardRevealed: '¡Carta revelada!',
    bonusXp: '+15 XP extra!',
    goodChoice: 'Buena elección',
    scrambleHint: (pos) => `Pista (${pos})`,
    scrambleEmpty: (len) => `Toca las letras en orden (${len} letras)`,
    clearBtn: (cur, len) => `Borrar (${cur}/${len})`,
    skipBtn: 'Saltar reto →',
    correctSpelling: 'Ortografía perfecta',
    memoryTitle: 'Memoria Rápida',
    memoryPairs: (done) => `${done} / 3 pares`,
    matchedBurst: '¡Emparejado!',
    wheelChallenge: '¡Reto de la ruleta!',
    spinningBtn: 'Girando...',
    spinBtn: '¡Girar ruleta!',
    pickedWord: 'Palabra elegida:',
    blitzTitle: (round, total) => `Relámpago · Ronda ${round}/${total}`,
    blitzHits: (hits) => `${hits} aciertos`,
    blitzPrompt: 'Elige la palabra inglesa que coincide con esta pista:',
    blitzFast: '⚡ ¡Rápido!',
  },
  levels: {
    A1: { title: 'Primeros Pasos', tagline: 'Saludos, números 1–10, hogar y familia', description: 'Comienza con números 1–10, hogar, comida, familia y vocabulario esencial A1.' },
    A2: { title: 'Explorador Diario', tagline: 'Viajes, clima, compras y salud', description: 'Habla con confianza sobre viajes, aeropuertos, clima, compras y salud en A2.' },
    B1: { title: 'Hablante Seguro', tagline: 'Trabajo, emociones, tecnología e historias', description: 'Expresa ideas y emociones con claridad en trabajo, tecnología y relatos B1.' },
    B2: { title: 'Estratega Fluido', tagline: 'Liderazgo, ciencia, modismos y debate', description: 'Domina modismos, debates estructurados y vocabulario científico en B2.' },
    C1: { title: 'Académico y Ejecutivo', tagline: 'Retórica académica, diplomacia y precisión', description: 'Domina escritura profesional, tono diplomático y vocabulario académico C1.' },
    C2: { title: 'Maestría Total', tagline: 'Literatura, filosofía y dominio completo', description: 'Explora prosa literaria, filosofía y dominio completo del nivel C2.' },
  },
  achievements: {
    'first-spark': { title: 'Primera Chispa', description: 'Completa tu primera lección de inglés' },
    'streak-3': { title: 'Llama de 3 Días', description: 'Mantén una racha de 3 días seguidos' },
    'a1-complete': { title: 'Campeón A1', description: 'Completa todas las lecciones del nivel A1' },
    'a2-complete': { title: 'Explorador A2', description: 'Completa todas las lecciones del nivel A2' },
    'b1-complete': { title: 'Hablante B1', description: 'Completa todas las lecciones del nivel B1' },
    'b2-complete': { title: 'Estratega B2', description: 'Completa todas las lecciones del nivel B2' },
    'c1-complete': { title: 'Académico C1', description: 'Completa todas las lecciones del nivel C1' },
    'c2-complete': { title: 'Leyenda C2', description: 'Completa todas las lecciones del nivel C2' },
    'lessons-25': { title: 'Constructor de Ruta', description: 'Completa 25 lecciones en total' },
    'lessons-150': { title: 'Retador de la Cima', description: 'Completa 150 lecciones en tu viaje' },
    'lessons-500': { title: 'Maratón del Saber', description: 'Completa 500 lecciones hacia el dominio total' },
    'words-500': { title: 'Coleccionista', description: 'Domina 500 palabras inglesas' },
    'words-3000': { title: 'Maestro del Léxico', description: 'Domina 3,000 palabras inglesas' },
    'words-10000': { title: 'Bóveda Legendaria', description: 'Domina 10,000 palabras hasta C2' },
    'sharp-90': { title: 'Precisión Certera', description: 'Mantén 90%+ de precisión en ejercicios' },
    'xp-5000': { title: 'Estrella de XP', description: 'Acumula 5,000 puntos XP' },
  },
  coreLessons: {
    'a1-1': { title: 'Hogar y Saludos', subtitle: 'Frases amables, saludos y habitaciones' },
    'a1-numbers': { title: 'Contar del 1 al 10', subtitle: 'Aprende los números del 1 al 10' },
    'a1-2': { title: 'Objetos Diarios', subtitle: 'Cosas comunes en casa y escuela' },
    'a1-3': { title: 'Comida y Café', subtitle: 'Pedir comidas, bebidas y sabores' },
    'a1-4': { title: 'Familia y Personas', subtitle: 'Familiares y verbos cotidianos' },
    'a2-1': { title: 'Viajes y Direcciones', subtitle: 'Moverse por aeropuertos y ciudades' },
    'a2-2': { title: 'Compras Inteligentes', subtitle: 'Comparar precios, tallas y calidad' },
    'a2-3': { title: 'Clima y Naturaleza', subtitle: 'Estaciones, pronóstico y paisajes' },
    'a2-4': { title: 'Salud y Hábitos', subtitle: 'Bienestar, deporte y rutina diaria' },
    'b1-1': { title: 'Trabajo y Ambición', subtitle: 'Carrera profesional y metas en equipo' },
    'b1-2': { title: 'Emociones y Empatía', subtitle: 'Expresar sentimientos con precisión' },
    'b1-3': { title: 'Tecnología y Medios', subtitle: 'Vida digital y herramientas modernas' },
    'b1-4': { title: 'Relatos y Recuerdos', subtitle: 'Conectar hechos y narrar historias' },
    'b2-1': { title: 'Liderazgo e Iniciativa', subtitle: 'Decisiones ejecutivas y consenso' },
    'b2-2': { title: 'Ciencia y Sostenibilidad', subtitle: 'Innovación, clima e investigación' },
    'b2-3': { title: 'Modismos y Frasales', subtitle: 'Habla inglés natural y cotidiano' },
    'b2-4': { title: 'Debate y Crítica', subtitle: 'Evaluar argumentos y evidencia' },
    'c1-1': { title: 'Retórica Académica', subtitle: 'Vocabulario elevado para ensayos' },
    'c1-2': { title: 'Diplomacia y Política', subtitle: 'Gobernanza y tacto institucional' },
    'c1-3': { title: 'Adjetivos Matizados', subtitle: 'Descripciones de alta precisión' },
    'c1-4': { title: 'Discurso Complejo', subtitle: 'Conectores y verbos analíticos' },
    'c2-1': { title: 'Arte Literario', subtitle: 'Vocabulario evocador de prosa clásica' },
    'c2-2': { title: 'Filosofía y Pensamiento', subtitle: 'Rigor intelectual y abstracción' },
    'c2-3': { title: 'Elocuencia Ejecutiva', subtitle: 'Inglés estratégico de alto nivel' },
    'c2-4': { title: 'Maestría Sutil', subtitle: 'Modismos refinados y elegancia' },
  },
  toast: {
    welcome: (name) => `¡Bienvenido, ${name}!`,
    levelUnlocked: (level) => `¡Nivel ${level} desbloqueado!`,
    levelReadySub: 'Nuevo nivel listo',
    progressReset: 'Progreso reiniciado',
    accountDeleted: 'Cuenta eliminada',
    cloudLinked: '¡Cuenta vinculada con Google Cloud!',
    syncSuccess: 'Sincronizado con la nube',
    streakFreezeBought: '¡Protector de racha activado por 1 día!',
    streakFreezeUsed: '¡Tu racha fue protegida automáticamente!',
  },
};

const FR_STRINGS: UiStrings = {
  ...EN_STRINGS,
  splashTagline: 'Maîtrisez le vocabulaire et la grammaire anglaise avec clarté',
  splashSkip: 'Passer',
  splashStarting: 'Préparation de votre parcours...',
  offlineBanner: 'Mode hors ligne — vos leçons enregistrées restent disponibles',
  nav: {
    home: 'Accueil',
    daily: 'Objectifs',
    you: 'Profil',
    setting: 'Paramètres',
    ariaLabel: 'Navigation principale',
  },
  auth: {
    ...EN_STRINGS.auth,
    loginSubtitle: 'Connectez-vous pour synchroniser votre progression dans le cloud',
    signupSubtitle: 'Créez un compte pour sauvegarder votre progression',
    googleContinue: 'Continuer avec Google',
    googleSigningIn: 'Connexion Google...',
    orDivider: 'ou par identifiant',
    loginTab: 'Connexion',
    signupTab: 'Nouveau compte',
    usernameLabel: "Nom d'utilisateur",
    usernamePlaceholder: "Entrez votre nom d'utilisateur",
    usernameRuleHint: (min, max) => `De ${min} à ${max} caractères (lettres anglaises, chiffres, _ . -)`,
    usernameCharsCount: (len, max) => `${len}/${max} car.`,
    passwordLabel: 'Mot de passe',
    passwordPlaceholder: 'Entrez votre mot de passe',
    showPassword: 'Afficher',
    hidePassword: 'Masquer',
    submitting: 'Vérification...',
    loginSubmit: 'Se connecter',
    signupSubmit: 'Créer le compte',
    noAccountPrompt: 'Pas encore de compte ?',
    createOneLink: 'Créer un compte',
    hasAccountPrompt: 'Déjà un compte ?',
    signInLink: 'Se connecter',
    errUsernameLength: (min, max) => `Le nom doit contenir entre ${min} et ${max} caractères.`,
    errUsernameChars: 'Utilisez uniquement des lettres anglaises, chiffres, (_), (-) ou (.).',
    errPasswordRequired: 'Veuillez saisir votre mot de passe.',
    errPasswordLength: 'Le mot de passe doit contenir au moins 4 caractères.',
    errWrongPassword: "Nom d'utilisateur ou mot de passe incorrect.",
    errAccountNotFound: 'Compte introuvable. Vérifiez votre identifiant ou utilisez Google.',
    errUsernameTaken: "Ce nom d'utilisateur est déjà pris.",
    errEmailProviderDisabled: 'La connexion par identifiant nécessite Email/Password dans Firebase Console. Utilisez Google ci-dessus pour la synchro immédiate.',
    errGooglePopupClosed: 'La fenêtre Google a été fermée.',
    errGoogleFailed: 'Échec de connexion Google. Vérifiez votre connexion.',
    errUnexpected: "Erreur d'authentification. Veuillez réessayer.",
  },
  home: {
    vocabTab: 'Vocabulaire',
    grammarTab: 'Grammaire',
    vocabBankBtn: 'Lexique',
    myAccountBtn: 'Profil',
    settingsBtn: 'Paramètres',
    dayUnit: 'jours',
    learnedWordsStats: (learned, total) => `${learned} mots appris sur ${total}`,
    remainingLessonsStats: (remaining, done, total) => `${remaining} leçons restantes (${done}/${total})`,
    continueLesson: (order, title) => `Continuer : Leçon ${order} · ${title}`,
    unlockLevel: (level, title) => `Débloquer ${level} · ${title}`,
    pathHeading: (level, title) => `Parcours ${level} · ${title}`,
    pathSubtitle: 'Faites défiler et touchez une leçon débloquée pour vous entraîner',
    jumpToCurrentBtn: 'Aller à ma leçon actuelle',
    quickJumpLabel: 'Accès rapide :',
    lessonsRangeLabel: (start, end) => `Leçons ${start} – ${end}`,
    backToFirstBtn: 'Retour au début',
    startNowBadge: 'Commencer',
    lessonLabel: (order, title) => `Leçon ${order} · ${title}`,
    levelLabel: (level) => `Niveau ${level}`,
    wordsAndXp: (words, xp) => `${words} mots · +${xp} XP`,
    showMoreLessons: (count, remaining) => `Afficher ${count} de plus (${remaining} restantes)`,
    collapseListBtn: 'Réduire',
    lockedLabel: 'Verrouillé',
  },
  grammar: {
    headerTitle: (level, title) => `Grammaire Anglaise · ${level} · ${title}`,
    headerSubtitle: 'Unités interactives inspirées de English Grammar in Use avec règles et exercices',
    completedCount: (done, total) => `${done} sur ${total} unités terminées`,
    jumpToCurrentUnit: 'Aller à mon unité actuelle',
    allTopics: 'Tous les thèmes',
    rulesCount: (count) => `${count} règles`,
    questionsCount: (count) => `${count} exercices`,
    startUnit: "Commencer l'unité",
    reviewUnit: "Revoir l'unité",
    unitBadge: (range) => `Réf. ${range}`,
    learnTab: 'Règle',
    practiceTab: 'Exercices',
    ruleHeader: (idx, total) => `Règle ${idx} sur ${total}`,
    examplesLabel: 'Exemples',
    listenExample: "Écouter l'exemple",
    startPracticeBtn: 'Passer aux exercices',
    nextRuleBtn: 'Règle suivante',
    checkAnswerBtn: 'Vérifier',
    nextQuestionBtn: 'Suivant',
    finishUnitBtn: "Terminer l'unité",
    correctFeedback: 'Bravo ! Bonne maîtrise de la règle.',
    wrongFeedback: 'Revoyez la règle ci-dessous — la pratique renforce la maîtrise.',
    unitCompletedTitle: 'Bravo ! Unité de grammaire terminée',
    unitCompletedDesc: (level) => `Vous avez terminé les règles et exercices du niveau ${level}.`,
    backToGrammarPath: 'Retour aux unités',
    topics: {
      tenses: 'Présent et Passé',
      perfect: 'Present & Past Perfect',
      future: 'Formes du Futur',
      modals: 'Verbes Modaux',
      conditionals: 'Conditionnels et Wish',
      passive: 'Voix Passive',
      reported: 'Discours Indirect',
      questions: 'Questions et Auxiliaires',
      'ing-to': '-ing et to...',
      articles: 'Articles et Noms',
      pronouns: 'Pronoms et Déterminants',
      relative: 'Propositions Relatives',
      adjectives: 'Adjectifs et Adverbes',
      conjunctions: 'Conjonctions et Prépositions',
      phrasal: 'Verbes à Particule',
    },
  },
  daily: {
    pageTitle: 'Objectifs du jour & Mot vedette',
    pageSubtitle: 'Suivez votre objectif quotidien et écoutez le mot du jour avec des exemples',
    dailyGoalTitle: 'Objectif quotidien',
    dailyGoalGreeting: (name) => `Bonjour ${name} · Continuez ainsi`,
    lessonsToday: (count) => `${count} leçons aujourd’hui`,
    goalCompleted: 'Objectif quotidien atteint !',
    goalProgress: (pct) => `${pct}% accompli`,
    continueLearningBtn: "S'entraîner maintenant",
    streakLabel: 'Série actuelle',
    streakDays: (n) => `${n} jours consécutifs`,
    featuredWordTitle: (level) => `Mot vedette · Niveau ${level}`,
    nextWordBtn: 'Mot suivant →',
    levelFilterLabel: 'Niveau du mot vedette',
    exploreAllWords: (total) => `Explorer tous les mots (${total})`,
    speakWordAria: (word) => `Prononcer ${word}`,
    speakSlowAria: (word) => `Prononcer ${word} lentement`,
  },
  you: {
    currentLevelLine: (lvl, title, unlocked) => `Niveau actuel : ${lvl} · ${title} · ${unlocked} sur 6 débloqués`,
    levelProgress: (lvl) => `Progression niveau ${lvl}`,
    changeAvatarBtn: "Changer d'avatar",
    vocabBtn: (count) => `Vocabulaire (${count})`,
    accountSectionTitle: 'Compte et synchronisation cloud',
    accountSectionSub: 'Modifiez votre nom, e-mail ou synchronisez votre progression',
    cloudSynced: 'Cloud synchronisé',
    cloudSyncing: 'Synchronisation...',
    cloudLocalOnly: 'Local uniquement — lier Google',
    cloudSyncError: 'Erreur de synchro — réessayer',
    syncNowBtn: 'Synchroniser',
    linkGoogleBtn: 'Lier avec Google',
    displayNameLabel: "Nom d'affichage",
    emailLabel: 'E-mail (optionnel)',
    saveBtn: 'Enregistrer',
    savedBtn: 'Enregistré !',
    signOutBtn: 'Déconnexion',
    resetBtn: 'Réinitialiser',
    deleteBtn: 'Supprimer le compte',
    statStreak: 'Jours de série',
    statXp: 'XP total',
    statLessons: 'Leçons terminées',
    statAccuracy: 'Précision',
    weeklyTitle: 'Activité hebdomadaire',
    weeklySub: 'XP gagnés ces 7 derniers jours',
    thisWeek: 'Cette semaine',
    days: { Mon: 'Lun', Tue: 'Mar', Wed: 'Mer', Thu: 'Jeu', Fri: 'Ven', Sat: 'Sam', Sun: 'Dim' },
    masteredTitle: 'Mots maîtrisés',
    masteredEmpty: 'Terminez votre première leçon pour lancer votre collection !',
    exploreAllWords: (total) => `Explorer tous les mots (${total})`,
    achievementsTitle: 'Succès',
    achievementsSub: 'Badges progressifs de A1 jusqu’à C2',
    confirmDeleteTitle: 'Supprimer définitivement votre compte ?',
    confirmDeleteBody: 'Cela supprimera votre compte, votre synchro cloud, XP et leçons.',
    confirmDeleteBtn: 'Oui, supprimer',
    confirmResetTitle: 'Réinitialiser votre progression ?',
    confirmResetBody: 'Cela remettra votre XP, série et leçons au niveau A1.',
    confirmResetBtn: 'Oui, réinitialiser',
    cancelBtn: 'Annuler',
  },
  settings: {
    title: 'Paramètres audio, étude et langue',
    subtitle: 'Réglez votre objectif quotidien, niveau, sons apaisants, vitesse et langue',
    audioStudioTitle: 'Studio audio et prononciation',
    testChimeBtn: 'Tester le son',
    testVoiceBtn: (speed) => `Tester la voix (${speed}x)`,
    voiceSpeedLabel: 'Vitesse de prononciation',
    calmSfxTitle: 'Effets sonores doux',
    calmSfxDesc: 'Sons acoustiques apaisants lors des réponses',
    autoSpeakTitle: 'Lecture automatique',
    autoSpeakDesc: 'Prononce les mots anglais à l’affichage des cartes',
    studyPlanTitle: "Plan d'étude et niveau",
    dailyGoalXpLabel: 'Objectif quotidien (XP)',
    defaultLevelLabel: 'Niveau par défaut',
    appearanceTitle: 'Apparence et rappels',
    lightMode: 'Mode clair',
    darkMode: 'Mode sombre',
    remindersTitle: 'Rappels quotidiens',
    remindersDesc: 'Rappels doux pour entretenir votre série',
    languageTitle: "Langue de l'interface et traduction",
    languageSub: "Met à jour tous les menus, traductions et règles de grammaire",
    speedTags: { '0.65': 'Lent', '0.85': 'Clair', '1': 'Normal', '1.2': 'Rapide' },
    streakFreezeTitle: 'Gel de série (Streak Freeze)',
    streakFreezeDesc: 'Protège votre série pendant 1 jour lorsque vos XP du jour sont à 0',
    streakFreezeCost: (cost) => `${cost} XP`,
    streakFreezeActiveBadge: 'Activé · Protection 1 jour',
    streakFreezeBuyBtn: (cost) => `Acheter et activer · ${cost} XP`,
    streakFreezeNeedXp: (missing) => `Il manque ${missing} XP`,
    streakFreezeOnlyZeroXp: 'Disponible uniquement lorsque vos XP du jour sont à 0',
    streakFreezeProtectedNote: (date) => `Série protégée automatiquement le ${date}`,
  },
  streakCelebration: {
    newStreakTitle: (days) => `Série de ${days} jours !`,
    milestoneTitle: (days) => `Palier atteint · ${days} jours !`,
    newStreakSub: 'Vous avez prolongé votre série quotidienne — continuez ainsi !',
    milestoneSub: (days) => `Quelle régularité ! Vous avez atteint le palier de ${days} jours.`,
    nextMilestone: (target, remaining) => `Prochain palier : ${target} jours (encore ${remaining})`,
    maxMilestone: 'Palier légendaire de régularité !',
    continueBtn: 'Continuer',
    daysUnit: 'jours',
  },
  lessonPlayer: {
    exitAria: 'Quitter la leçon',
    completedBadge: 'Leçon terminée !',
    lessonHeading: (order, title) => `Leçon ${order} · ${title}`,
    practicedSummary: (words, level) => `Vous avez pratiqué ${words} mots au niveau ${level}.`,
    xpEarnedLabel: 'XP gagnés',
    accuracyLabel: 'Précision',
    wordsLabel: 'Mots',
    backToPathBtn: 'Retour au parcours',
    listenBtn: 'Écouter',
    slowBtn: 'Lent',
    playAudioBtn: (speed) => `Lire (${speed}x)`,
    understoodNextBtn: 'Compris, suivant',
    continueBtn: 'Continuer',
    checkBtn: 'Vérifier',
    excellentFeedback: 'Excellent ! Continuez !',
    correctAnswerWas: 'Bonne réponse :',
    matchedProgress: (done, total) => `${done} sur ${total} associés`,
    minigamePromptHint: 'Terminez le mini-jeu ci-dessus pour continuer',
    introHint: 'Écoutez la prononciation, lisez l’exemple puis continuez',
    selectAnswerHint: 'Choisissez une réponse puis cliquez Vérifier',
    coachCorrectCombo: (combo) => `Super série ${combo}x ! Continuez sur ce rythme.`,
    coachCorrect: 'Bien joué ! Réponse exacte.',
    coachWrong: 'Vérifiez la bonne réponse ci-dessous — la répétition ancre la mémoire.',
    coachMinigame: 'Mini-jeu aléatoire pour réviser en s’amusant !',
    coachIntro: 'Écoutez calmement la prononciation et observez l’exemple.',
    coachMatch: 'Touchez un mot puis choisissez son sens.',
    coachDefault: 'Choisissez la meilleure option ci-dessous.',
    introPrompt: 'Touchez pour écouter et apprendre ce mot',
    choicePrompt: (word) => `Que signifie "${word}" ?`,
    listenPrompt: 'Écoutez attentivement et choisissez le mot entendu',
    contextPrompt: 'Complétez la phrase avec le mot juste',
    deckListenPrompt: (level) => `Écoutez bien et choisissez le mot du niveau ${level}`,
    minigamePrompts: {
      'mystery-card': 'Carte Mystère : Choisissez une carte surprise !',
      scramble: 'Lettres Mêlées : Remettez les lettres dans l’ordre !',
      'memory-flip': 'Mémoire Rapide : Associez chaque mot à son indice !',
      'word-wheel': 'Roue des Mots : Tournez la roue pour un défi bonus !',
      'speed-blitz': 'Éclair Rapide : Répondez à 3 défis d’affilée !',
    },
  },
  vault: {
    title: 'Lexique complet',
    subtitle: (total, mastered) => `${total} mots de A1 à C2 · ${mastered} maîtrisés`,
    searchPlaceholder: 'Rechercher un mot, sens ou thème...',
    filterAll: 'Tout',
    filterCurated: 'Leçons',
    allLevels: (total) => `Tout (${total})`,
    showingCount: (shown, total) => `${shown} sur ${total} mots correspondants`,
    speedLabel: (speed) => `Vitesse : ${speed}x`,
    emptyResult: (query) => `Aucun mot trouvé pour « ${query} ».`,
    masteredTag: 'Maîtrisé',
    loadMoreBtn: (remaining) => `Afficher 100 mots de plus (${remaining} restants)`,
    catalogDef: (pos, level) => `Vocabulaire anglais (${pos}) du niveau ${level}.`,
  },
  avatarModal: {
    title: 'Personnaliser la photo',
    subMenu: 'Choisissez comment définir votre avatar',
    subGallery: 'Choisir dans la galerie',
    subUrl: 'Coller un lien image direct',
    uploadTitle: "Importer depuis l'appareil",
    uploadSub: 'Choisissez une image sur votre appareil',
    galleryTitle: 'Choisir dans la galerie',
    gallerySub: 'Parcourir les avatars illustrés',
    urlTitle: 'Image par URL',
    urlSub: 'Utiliser un lien web direct',
    backToMenu: 'Retour aux options',
    urlLabel: "URL de l'image",
    livePreview: 'Aperçu en direct',
    backBtn: 'Retour',
    applyBtn: "Utiliser l'image",
    errInvalidFile: 'Veuillez choisir une image valide (PNG, JPG ou WebP).',
    errEmptyUrl: "Veuillez saisir une URL d'image.",
    errInvalidUrl: "L'URL doit commencer par https:// ou http://",
    errLoadUrl: "Impossible de charger l'image depuis ce lien.",
    labels: {
      'app-crest': 'Blason LingoLearn',
      'scholar-owl': 'Hibou Savant',
      'rocket-explorer': 'Explorateur Spatial',
      'sunny-star': 'Étoile Dorée',
      'crown-lion': 'Lion Royal',
      'book-wizard': 'Ami des Livres',
      'calm-panda': 'Panda Calme',
      'clever-cat': 'Chat Malin',
      'trophy-champ': 'Trophée Champion',
    },
  },
  minigames: {
    mysteryTitle: 'Carte Mystère',
    mysteryPickPrompt: 'Choisissez une carte !',
    mysteryMatchPrompt: 'Associez le mot à sa définition !',
    cardLabel: (num) => `Carte #${num}`,
    whichDefinition: 'Quelle définition correspond à',
    cardRevealed: 'Carte révélée !',
    bonusXp: '+15 XP bonus !',
    goodChoice: 'Bon choix',
    scrambleHint: (pos) => `Indice (${pos})`,
    scrambleEmpty: (len) => `Touchez les lettres dans l’ordre (${len} lettres)`,
    clearBtn: (cur, len) => `Effacer (${cur}/${len})`,
    skipBtn: 'Passer le défi →',
    correctSpelling: 'Orthographe parfaite',
    memoryTitle: 'Mémoire Rapide',
    memoryPairs: (done) => `${done} / 3 paires`,
    matchedBurst: 'Associé !',
    wheelChallenge: 'Défi de la roue !',
    spinningBtn: 'Rotation...',
    spinBtn: 'Tourner la roue !',
    pickedWord: 'Mot choisi :',
    blitzTitle: (round, total) => `Éclair · Manche ${round}/${total}`,
    blitzHits: (hits) => `${hits} réussites`,
    blitzPrompt: 'Choisissez le mot anglais correspondant :',
    blitzFast: '⚡ Rapide !',
  },
  levels: {
    A1: { title: 'Premiers Pas', tagline: 'Salutations, chiffres 1–10, maison et famille', description: 'Débutez avec les chiffres 1–10, la maison, la cuisine et le vocabulaire A1.' },
    A2: { title: 'Explorateur Quotidien', tagline: 'Voyages, météo, achats et santé', description: 'Parlez avec assurance des voyages, de la météo, des achats et de la santé en A2.' },
    B1: { title: 'Locuteur Confiant', tagline: 'Travail, émotions, tech et récits', description: 'Exprimez idées et émotions au travail et en technologie au niveau B1.' },
    B2: { title: 'Stratège Fluide', tagline: 'Leadership, sciences, idiomes et débat', description: 'Maîtrisez les idiomes, débats structurés et termes scientifiques en B2.' },
    C1: { title: 'Académique & Exécutif', tagline: 'Rhétorique, diplomatie et précision', description: 'Maîtrisez l’écriture professionnelle, la diplomatie et le lexique académique C1.' },
    C2: { title: 'Grande Maîtrise', tagline: 'Littérature, philosophie et maîtrise totale', description: 'Explorez la prose littéraire, la philosophie et le niveau C2 complet.' },
  },
  achievements: {
    'first-spark': { title: 'Première Étincelle', description: "Terminez votre première leçon d'anglais" },
    'streak-3': { title: 'Flamme 3 Jours', description: 'Maintenez une série de 3 jours consécutifs' },
    'a1-complete': { title: 'Champion A1', description: 'Terminez toutes les leçons du niveau A1' },
    'a2-complete': { title: 'Explorateur A2', description: 'Terminez toutes les leçons du niveau A2' },
    'b1-complete': { title: 'Locuteur B1', description: 'Terminez toutes les leçons du niveau B1' },
    'b2-complete': { title: 'Stratège B2', description: 'Terminez toutes les leçons du niveau B2' },
    'c1-complete': { title: 'Érudit C1', description: 'Terminez toutes les leçons du niveau C1' },
    'c2-complete': { title: 'Légende C2', description: 'Terminez toutes les leçons du niveau C2' },
    'lessons-25': { title: 'Bâtisseur de Parcours', description: 'Terminez 25 leçons au total' },
    'lessons-150': { title: 'Défi du Sommet', description: 'Terminez 150 leçons sur votre parcours' },
    'lessons-500': { title: 'Marathon du Savoir', description: 'Terminez 500 leçons vers la maîtrise' },
    'words-500': { title: 'Collectionneur', description: 'Maîtrisez 500 mots anglais' },
    'words-3000': { title: 'Maître du Lexique', description: 'Maîtrisez 3 000 mots anglais' },
    'words-10000': { title: 'Coffre Légendaire', description: 'Maîtrisez 10 000 mots jusqu’à C2' },
    'sharp-90': { title: 'Précision Pure', description: 'Maintenez 90%+ de précision en exercices' },
    'xp-5000': { title: 'Étoile XP', description: 'Cumulez 5 000 points XP' },
  },
  coreLessons: {
    'a1-1': { title: 'Maison & Salutations', subtitle: 'Formules polies, salutations et pièces' },
    'a1-numbers': { title: 'Compter de 1 à 10', subtitle: 'Apprenez les chiffres de 1 à 10' },
    'a1-2': { title: 'Objets Quotidiens', subtitle: 'Objets courants à la maison et à l’école' },
    'a1-3': { title: 'Cuisine & Café', subtitle: 'Commander plats, boissons et saveurs' },
    'a1-4': { title: 'Famille & Proches', subtitle: 'Membres de la famille et verbes usuels' },
    'a2-1': { title: 'Voyages & Directions', subtitle: 'Se déplacer en aéroport et en ville' },
    'a2-2': { title: 'Achats Malins', subtitle: 'Comparer prix, tailles et qualité' },
    'a2-3': { title: 'Météo & Nature', subtitle: 'Saisons, prévisions et paysages' },
    'a2-4': { title: 'Santé & Habitudes', subtitle: 'Bien-être, sport et routine quotidienne' },
    'b1-1': { title: 'Travail & Ambition', subtitle: 'Carrière, équipe et objectifs' },
    'b1-2': { title: 'Émotions & Empathie', subtitle: 'Exprimer ses sentiments avec nuance' },
    'b1-3': { title: 'Tech & Médias', subtitle: 'Vie numérique et outils modernes' },
    'b1-4': { title: 'Récits & Souvenirs', subtitle: 'Relier les faits et raconter' },
    'b2-1': { title: 'Leadership & Initiative', subtitle: 'Décisions stratégiques et consensus' },
    'b2-2': { title: 'Science & Durabilité', subtitle: 'Innovation, climat et recherche' },
    'b2-3': { title: 'Idiomes & Phrasals', subtitle: 'Parler un anglais naturel et fluide' },
    'b2-4': { title: 'Débat & Esprit Critique', subtitle: 'Évaluer arguments et preuves' },
    'c1-1': { title: 'Rhétorique Académique', subtitle: 'Vocabulaire soutenu pour essais' },
    'c1-2': { title: 'Diplomatie & Politique', subtitle: 'Gouvernance et tact institutionnel' },
    'c1-3': { title: 'Adjectifs Nuancés', subtitle: 'Descriptions d’une grande précision' },
    'c1-4': { title: 'Discours Complexe', subtitle: 'Connecteurs et verbes analytiques' },
    'c2-1': { title: 'Art Littéraire', subtitle: 'Lexique évocateur de prose classique' },
    'c2-2': { title: 'Philosophie & Abstraction', subtitle: 'Rigueur intellectuelle et concepts' },
    'c2-3': { title: 'Éloquence Exécutive', subtitle: 'Anglais stratégique de haut niveau' },
    'c2-4': { title: 'Maîtrise Subtile', subtitle: 'Idiomes raffinés et élégance' },
  },
  toast: {
    welcome: (name) => `Bienvenue, ${name} !`,
    levelUnlocked: (level) => `Niveau ${level} débloqué !`,
    levelReadySub: 'Nouveau niveau prêt',
    progressReset: 'Progression réinitialisée',
    accountDeleted: 'Compte supprimé',
    cloudLinked: 'Compte lié à Google Cloud !',
    syncSuccess: 'Synchronisé avec le cloud',
    streakFreezeBought: 'Gel de série activé pour 1 jour !',
    streakFreezeUsed: 'Votre série a été protégée automatiquement !',
  },
};

const DICTIONARIES: Record<UiLanguage, UiStrings> = {
  ar: AR_STRINGS,
  en: EN_STRINGS,
  es: ES_STRINGS,
  fr: FR_STRINGS,
};

export function getUi(lang: UiLanguage): UiStrings {
  return DICTIONARIES[lang] || AR_STRINGS;
}
