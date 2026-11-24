import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Award,
  BookOpen,
  Camera,
  CloudCheck,
  Flame,
  LogOut,
  RotateCcw,
  Target,
  Trash2,
  UserCog,
  Volume2,
  Zap,
} from 'lucide-react';
import { CefrLevel, UserProfileData } from '../types/learning';
import { ACHIEVEMENTS, ALL_LESSONS, ALL_WORDS, LEVEL_META } from '../data/curriculum';
import { OXFORD_ALL_WORDS } from '../data/oxford3000';
import { soundEngine } from '../lib/sound';
import { AVATAR_OPTIONS } from './avatarOptions';

interface YouViewProps {
  profile: UserProfileData;
  onOpenVault: (level?: CefrLevel | 'ALL') => void;
  onOpenAvatarModal: () => void;
  onUpdateAccount: (patch: Partial<UserProfileData>) => void;
  onSignOut: () => void;
  onResetProgress: () => void;
  onDeleteAccount: () => void;
}

const DAYS: { key: keyof UserProfileData['weeklyXp']; label: string }[] = [
  { key: 'Mon', label: 'الإثنين' },
  { key: 'Tue', label: 'الثلاثاء' },
  { key: 'Wed', label: 'الأربعاء' },
  { key: 'Thu', label: 'الخميس' },
  { key: 'Fri', label: 'الجمعة' },
  { key: 'Sat', label: 'السبت' },
  { key: 'Sun', label: 'الأحد' },
];

export function YouView({
  profile,
  onOpenVault,
  onOpenAvatarModal,
  onUpdateAccount,
  onSignOut,
  onResetProgress,
  onDeleteAccount,
}: YouViewProps) {
  const [nameDraft, setNameDraft] = useState(profile.displayName);
  const [emailDraft, setEmailDraft] = useState(profile.email);
  const [savedNotice, setSavedNotice] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'reset' | 'delete' | null>(null);

  useEffect(() => {
    setNameDraft(profile.displayName);
    setEmailDraft(profile.email);
  }, [profile.displayName, profile.email]);

  const accuracy =
    profile.totalAnswers > 0
      ? Math.round((profile.correctAnswers / profile.totalAnswers) * 100)
      : 100;

  const userLevel = Math.floor(profile.xp / 120) + 1;
  const xpIntoLevel = profile.xp % 120;
  const levelPct = Math.round((xpIntoLevel / 120) * 100);

  const selectedAvatar =
    AVATAR_OPTIONS.find((a) => a.id === profile.avatarId) || AVATAR_OPTIONS[0];
  const avatarImageSrc = profile.customAvatarUrl || selectedAvatar.image;
  const totalCatalogWords = ALL_WORDS.length + OXFORD_ALL_WORDS.length;

  const weeklyValues = DAYS.map((d) => profile.weeklyXp[d.key] || 0);
  const maxWeeklyXp = Math.max(...weeklyValues, profile.dailyGoal, 40);
  const weeklyTotal = weeklyValues.reduce((acc, v) => acc + v, 0);

  const getMetricValue = (badge: (typeof ACHIEVEMENTS)[number]) => {
    switch (badge.metric) {
      case 'xp':
        return profile.xp;
      case 'streak':
        return profile.streak;
      case 'lessons':
        return profile.lessonsCompleted;
      case 'words':
        return profile.masteredWords.length;
      case 'accuracy':
        return accuracy;
      case 'levels':
        return profile.unlockedLevels.length;
      case 'levelComplete':
        if (!badge.targetLevel) return 0;
        return ALL_LESSONS.filter(
          (l) =>
            l.level === badge.targetLevel &&
            profile.completedLessons.includes(l.id)
        ).length;
    }
  };

  const masteredWordObjects = ALL_WORDS.filter((w) =>
    profile.masteredWords.includes(w.id)
  ).slice(0, 6);

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nameDraft.trim() || profile.username || 'متعلم';
    const cleanEmail = emailDraft.trim();
    soundEngine.playCorrect(profile.soundEnabled, 1);
    onUpdateAccount({
      displayName: cleanName.slice(0, 80),
      email: cleanEmail.slice(0, 256),
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* بطاقة الملف الشخصي */}
      <section className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick(profile.soundEnabled);
                onOpenAvatarModal();
              }}
              aria-label="تخصيص الصورة الشخصية"
              className="relative shrink-0 group cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1CB0F6]/40 rounded-3xl"
            >
              {avatarImageSrc ? (
                <img
                  src={avatarImageSrc}
                  alt={profile.displayName}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover bg-[#FAF6EE] border-2 border-[#58CC02] shadow-md group-hover:brightness-95 transition-all"
                />
              ) : (
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center text-4xl border-2 border-[#58CC02] shadow-md group-hover:brightness-95 transition-all ${selectedAvatar.bg}`}
                >
                  {selectedAvatar.emoji}
                </div>
              )}
              <span className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[#1CB0F6] shadow flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera className="w-3.5 h-3.5" />
              </span>
              <div className="absolute -bottom-2 -left-2 px-2.5 py-0.5 rounded-xl bg-[#58CC02] text-white font-mono-num text-xs font-black shadow">
                LVL {userLevel}
              </div>
            </button>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-black text-2xl sm:text-3xl text-[var(--text-primary)]">
                  {profile.displayName}
                </h1>
                <span
                  dir="ltr"
                  className="text-xs font-mono-num font-bold text-[var(--text-secondary)]"
                >
                  @{profile.username}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                المستوى الحالي: {profile.difficulty} · {LEVEL_META[profile.difficulty].title} ·{' '}
                تم فتح {profile.unlockedLevels.length} من ٦ مستويات
              </p>

              <div className="mt-3 w-48 sm:w-64">
                <div className="flex justify-between text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                  <span>تقدم المستوى {userLevel}</span>
                  <span dir="ltr" className="font-mono-num">{xpIntoLevel}/120 XP</span>
                </div>
                <div className="h-2.5 rounded-full bg-[var(--bg-surface-muted)] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(levelPct, 5)}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full bg-gradient-to-r from-[#58CC02] to-[#1CB0F6]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick(profile.soundEnabled);
                onOpenAvatarModal();
              }}
              className="btn-3d-neutral px-4 py-3 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-[#1CB0F6]" />
              <span>تغيير الصورة</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick(profile.soundEnabled);
                onOpenVault('ALL');
              }}
              className="btn-3d-blue px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>المفردات ({profile.masteredWords.length.toLocaleString()})</span>
            </button>
          </div>
        </div>
      </section>

      {/* إدارة الحساب والمزامنة */}
      <section
        aria-label="إعدادات الحساب"
        className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 shadow-sm space-y-5"
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1CB0F6]/15 text-[#1CB0F6] flex items-center justify-center">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-[var(--text-primary)]">
                بيانات الحساب والملف الشخصي
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                عدّل اسم العرض أو الصورة أو البريد الإلكتروني أو إدارة الحساب
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#58CC02] bg-[#58CC02]/10 px-3 py-1.5 rounded-xl">
            <CloudCheck className="w-4 h-4" />
            <span>المزامنة السحابية مفعّلة</span>
          </span>
        </div>

        <form
          onSubmit={handleSaveAccount}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
        >
          <div className="sm:col-span-5">
            <label
              htmlFor="you-display-name"
              className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5"
            >
              اسم العرض
            </label>
            <input
              id="you-display-name"
              type="text"
              maxLength={80}
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#1CB0F6]"
            />
          </div>

          <div className="sm:col-span-5">
            <label
              htmlFor="you-email"
              className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5"
            >
              البريد الإلكتروني (اختياري)
            </label>
            <input
              id="you-email"
              dir="ltr"
              type="email"
              maxLength={256}
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              placeholder="learner@example.com"
              className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-surface-muted)] border border-[var(--border-subtle)] text-sm font-bold text-[var(--text-primary)] text-left focus:outline-none focus:ring-2 focus:ring-[#1CB0F6]"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="btn-3d-green w-full py-2.5 px-4 rounded-2xl font-display font-extrabold text-sm cursor-pointer"
            >
              {savedNotice ? 'تم الحفظ!' : 'حفظ'}
            </button>
          </div>
        </form>

        <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick(profile.soundEnabled);
              onSignOut();
            }}
            className="btn-3d-neutral px-5 py-2.5 rounded-2xl font-display font-extrabold text-xs flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick(profile.soundEnabled);
              setConfirmAction('reset');
            }}
            className="px-4 py-2.5 rounded-2xl bg-[var(--bg-surface-muted)] hover:bg-[#FF9600]/15 text-[#cc7700] dark:text-[#FFB347] font-display font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط التقدم</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick(profile.soundEnabled);
              setConfirmAction('delete');
            }}
            className="px-4 py-2.5 rounded-2xl bg-[#FF4B4B]/10 hover:bg-[#FF4B4B]/20 text-[#FF4B4B] font-display font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition-colors sm:ms-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف الحساب</span>
          </button>
        </div>
      </section>

      {/* بطاقات الإحصائيات الأربع */}
      <section aria-label="الإحصائيات" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-[#FF9600]/15 text-[#FF9600] flex items-center justify-center mb-3">
            <Flame className="w-5 h-5 fill-[#FF9600]" />
          </div>
          <div className="font-mono-num font-black text-2xl sm:text-3xl text-[var(--text-primary)]">
            {profile.streak}
          </div>
          <div className="text-xs font-bold text-[var(--text-secondary)] mt-0.5">
            أيام الحماس المتتالية
          </div>
        </div>

        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-[#1CB0F6]/15 text-[#1CB0F6] flex items-center justify-center mb-3">
            <Zap className="w-5 h-5 fill-[#1CB0F6]" />
          </div>
          <div className="font-mono-num font-black text-2xl sm:text-3xl text-[var(--text-primary)]">
            {profile.xp.toLocaleString()}
          </div>
          <div className="text-xs font-bold text-[var(--text-secondary)] mt-0.5">
            إجمالي نقاط الخبرة XP
          </div>
        </div>

        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-[#58CC02]/15 text-[#58CC02] flex items-center justify-center mb-3">
            <Award className="w-5 h-5" />
          </div>
          <div className="font-mono-num font-black text-2xl sm:text-3xl text-[var(--text-primary)]">
            {profile.lessonsCompleted.toLocaleString()}
          </div>
          <div className="text-xs font-bold text-[var(--text-secondary)] mt-0.5">
            الدروس المكتملة
          </div>
        </div>

        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-[#F97316]/15 text-[#F97316] flex items-center justify-center mb-3">
            <Target className="w-5 h-5" />
          </div>
          <div className="font-mono-num font-black text-2xl sm:text-3xl text-[var(--text-primary)]">
            {accuracy}%
          </div>
          <div className="text-xs font-bold text-[var(--text-secondary)] mt-0.5">
            نسبة الدقة
          </div>
        </div>
      </section>

      {/* النشاط الأسبوعي + المفردات المتقنة */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section
          aria-label="النشاط الأسبوعي"
          className="lg:col-span-7 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display font-black text-xl text-[var(--text-primary)]">
                النشاط الأسبوعي
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                نقاط الخبرة المكتسبة خلال آخر ٧ أيام
              </p>
            </div>
            <div className="text-left">
              <div dir="ltr" className="font-mono-num font-black text-xl text-[#1CB0F6]">
                {weeklyTotal} XP
              </div>
              <div className="text-[11px] font-bold text-[var(--text-secondary)]">
                هذا الأسبوع
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 pt-6">
            {DAYS.map((day) => {
              const val = profile.weeklyXp[day.key] || 0;
              const heightPct = Math.max(Math.round((val / maxWeeklyXp) * 100), val > 0 ? 14 : 6);
              const hitGoal = val >= profile.dailyGoal;

              return (
                <div key={day.key} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="font-mono-num text-[11px] font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                    {val}
                  </span>
                  <div className="w-full max-w-[40px] flex-1 flex items-end bg-[var(--bg-surface-muted)] rounded-2xl p-1 overflow-hidden">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className={`w-full rounded-xl ${
                        hitGoal
                          ? 'bg-gradient-to-t from-[#46A302] to-[#58CC02]'
                          : val > 0
                          ? 'bg-gradient-to-t from-[#1899D6] to-[#1CB0F6]'
                          : 'bg-slate-300/60 dark:bg-slate-700/60'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs font-extrabold text-[var(--text-secondary)] whitespace-nowrap">
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section
          aria-label="المفردات المتقنة"
          className="lg:col-span-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="font-display font-black text-xl text-[var(--text-primary)]">
                المفردات المتقنة
              </h2>
              <span dir="ltr" className="font-mono-num text-xs font-bold text-[#58CC02]">
                {profile.masteredWords.length.toLocaleString()} / {totalCatalogWords.toLocaleString()}
              </span>
            </div>

            {masteredWordObjects.length === 0 ? (
              <div className="rounded-2xl bg-[var(--bg-surface-muted)] p-6 text-center text-sm text-[var(--text-secondary)]">
                أكمل درسك الأول لتبدأ ببناء حصيلتك من الكلمات المتقنة!
              </div>
            ) : (
              <div className="space-y-2.5">
                {masteredWordObjects.map((w) => (
                  <div
                    key={w.id}
                    className="rounded-2xl bg-[var(--bg-surface-muted)] px-4 py-2.5 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div
                        dir="ltr"
                        className="font-latin font-extrabold text-sm text-[var(--text-primary)] truncate text-left"
                      >
                        {w.word}{' '}
                        <span className="font-mono-num text-[11px] font-normal text-[var(--text-secondary)]">
                          {w.ipa}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] truncate">
                        {w.translations.ar}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => soundEngine.speakWord(w.word, true, profile.voiceSpeed)}
                      aria-label={`نطق ${w.word}`}
                      className="w-9 h-9 rounded-xl bg-[var(--bg-surface)] text-[#1CB0F6] flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition-transform"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick(profile.soundEnabled);
              onOpenVault('ALL');
            }}
            className="btn-3d-neutral mt-4 w-full py-2.5 rounded-2xl text-xs font-extrabold cursor-pointer"
          >
            استكشاف جميع الكلمات ({totalCatalogWords.toLocaleString()})
          </button>
        </section>
      </div>

      {/* شبكة الإنجازات الموازية للدروس والمستويات */}
      <section aria-label="أوسمة الإنجازات" className="space-y-4">
        <div>
          <h2 className="font-display font-black text-xl text-[var(--text-primary)]">
            أوسمة الإنجازات
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            إنجازات متدرجة توازي تقدمك في دروس ومستويات اللغة من A1 حتى C2
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ACHIEVEMENTS.map((badge) => {
            const current = getMetricValue(badge);
            const unlocked = current >= badge.target;
            const pct = Math.min(100, Math.round((current / Math.max(badge.target, 1)) * 100));

            return (
              <div
                key={badge.id}
                className={`rounded-3xl border p-5 transition-all ${
                  unlocked
                    ? 'bg-[var(--bg-surface)] border-[#58CC02]/50 shadow-sm'
                    : 'bg-[var(--bg-surface)]/75 border-[var(--border-subtle)] opacity-85'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                      unlocked
                        ? `bg-gradient-to-br ${badge.color} text-white shadow`
                        : 'bg-[var(--bg-surface-muted)] grayscale'
                    }`}
                  >
                    {badge.icon}
                  </div>
                  <span
                    dir="ltr"
                    className={`font-mono-num text-xs font-extrabold ${
                      unlocked ? 'text-[#58CC02]' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {Math.min(current, badge.target).toLocaleString()} / {badge.target.toLocaleString()}
                  </span>
                </div>

                <h3 className="font-display font-black text-base text-[var(--text-primary)]">
                  {badge.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 mb-3 leading-relaxed">
                  {badge.description}
                </p>

                <div className="h-2 rounded-full bg-[var(--bg-surface-muted)] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      unlocked ? 'bg-[#58CC02]' : 'bg-[#1CB0F6]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* نافذة تأكيد داخل التطبيق */}
      {confirmAction && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="تأكيد الإجراء"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="max-w-md w-full rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 shadow-2xl space-y-4">
            <h3 className="font-display font-black text-xl text-[var(--text-primary)]">
              {confirmAction === 'delete'
                ? 'هل تريد حذف حسابك نهائياً؟'
                : 'هل تريد إعادة ضبط التقدم؟'}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {confirmAction === 'delete'
                ? 'سيؤدي هذا إلى حذف حسابك ومزامنتك السحابية ونقاط الخبرة والدروس المكتملة نهائياً.'
                : 'سيتم تصفير نقاط الخبرة وسلسلة الأيام وإعادة الدروس إلى بداية المستوى A1.'}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="btn-3d-neutral px-5 py-2.5 rounded-2xl text-sm font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  const action = confirmAction;
                  setConfirmAction(null);
                  if (action === 'delete') {
                    onDeleteAccount();
                  } else {
                    onResetProgress();
                  }
                }}
                className="px-5 py-2.5 rounded-2xl bg-[#FF4B4B] text-white font-display font-extrabold text-sm shadow-[0_4px_0_#cc2f2f] active:translate-y-0.5 cursor-pointer"
              >
                {confirmAction === 'delete' ? 'نعم، احذف الحساب' : 'نعم، أعد الضبط'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
