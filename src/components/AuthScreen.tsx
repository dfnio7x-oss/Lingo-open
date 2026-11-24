import { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { UserProfileData } from '../types/learning';
import {
  loginWithUsernamePassword,
  MAX_USERNAME_LENGTH,
  MIN_USERNAME_LENGTH,
  signUpWithUsernamePassword,
  validateUsernameFormat,
} from '../lib/authStore';
import { soundEngine } from '../lib/sound';
import { triggerConfettiBurst } from './VfxOverlay';

interface AuthScreenProps {
  onSuccess: (profile: UserProfileData) => void;
  soundEnabled?: boolean;
}

export function AuthScreen({ onSuccess, soundEnabled = true }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const trimmedLen = username.trim().length;
  const liveUsernameHint =
    trimmedLen === 0
      ? `من ${MIN_USERNAME_LENGTH} إلى ${MAX_USERNAME_LENGTH} حرفاً (أحرف إنجليزية، أرقام، _ . -)`
      : validateUsernameFormat(username) || `${trimmedLen}/${MAX_USERNAME_LENGTH} حرفاً`;
  const isUsernameLengthOk =
    trimmedLen === 0 ||
    (trimmedLen >= MIN_USERNAME_LENGTH &&
      trimmedLen <= MAX_USERNAME_LENGTH &&
      !validateUsernameFormat(username));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const formatErr = validateUsernameFormat(username);
    if (formatErr) {
      setErrorMsg(formatErr);
      soundEngine.playWrong(soundEnabled);
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const res =
      mode === 'login'
        ? await loginWithUsernamePassword(username, password)
        : await signUpWithUsernamePassword(username, password);

    if (!res.ok) {
      setErrorMsg(res.error);
      soundEngine.playWrong(soundEnabled);
      setSubmitting(false);
      return;
    }

    soundEngine.playLessonComplete(soundEnabled);
    triggerConfettiBurst('stars');
    setTimeout(() => {
      onSuccess(res.profile);
    }, 450);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-[#FAFAFA] dark:bg-[#0B1120] relative overflow-hidden">
      {/* شبكة خلفية هادئة */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.45] dark:opacity-[0.15]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.18) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      <div className="relative z-10 w-full max-w-[430px] flex flex-col items-center space-y-5">
        {/* شعار التطبيق والعنوان */}
        <div className="flex flex-col items-center text-center">
          <img
            src="/assets/aistudio/10263_zoomed-1_bee373d8.jpg"
            alt="شعار LingoLearn"
            referrerPolicy="no-referrer"
            className="w-20 h-20 rounded-[22px] object-cover shadow-lg border-2 border-white dark:border-slate-800"
          />
          <h1 className="mt-3 font-display font-black text-2xl text-slate-900 dark:text-white tracking-tight">
            LingoLearn
          </h1>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
            {mode === 'login'
              ? 'سجّل دخولك لمزامنة تقدمك في تعلم الإنجليزية'
              : 'أنشئ حساباً جديداً لحفظ تقدمك في السحابة'}
          </p>
        </div>

        {/* بطاقة تسجيل الدخول باسم المستخدم وكلمة المرور فقط */}
        <div className="w-full rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_20px_50px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)] overflow-hidden pt-6">
          <div className="px-7 sm:px-8 pb-7">
            {/* التبديل بين الدخول وإنشاء الحساب */}
            <div className="flex justify-center mb-6">
              <div
                role="tablist"
                aria-label="وضع الحساب"
                className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'login'}
                  onClick={() => {
                    soundEngine.playClick(soundEnabled);
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>تسجيل الدخول</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signup'}
                  onClick={() => {
                    soundEngine.playClick(soundEnabled);
                    setMode('signup');
                    setErrorMsg(null);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>حساب جديد</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* اسم المستخدم */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="auth-username"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    اسم المستخدم
                  </label>
                  <span
                    dir="ltr"
                    className={`text-[11px] font-mono-num font-bold ${
                      isUsernameLengthOk
                        ? 'text-slate-400 dark:text-slate-500'
                        : 'text-[#FF9600]'
                    }`}
                  >
                    {trimmedLen}/{MAX_USERNAME_LENGTH}
                  </span>
                </div>
                <input
                  id="auth-username"
                  dir="ltr"
                  type="text"
                  autoComplete="username"
                  minLength={MIN_USERNAME_LENGTH}
                  maxLength={MAX_USERNAME_LENGTH}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.slice(0, MAX_USERNAME_LENGTH));
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder={`أدخل ${MIN_USERNAME_LENGTH}–${MAX_USERNAME_LENGTH} حرفاً بالإنجليزية`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white text-left placeholder:text-right placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6] transition-all"
                />
                <p
                  className={`mt-1 text-[11px] ${
                    isUsernameLengthOk
                      ? 'text-slate-400 dark:text-slate-500'
                      : 'text-[#dc2626] dark:text-[#ff7878] font-bold'
                  }`}
                >
                  {liveUsernameHint}
                </p>
              </div>

              {/* كلمة المرور */}
              <div>
                <label
                  htmlFor="auth-password"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    dir="ltr"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="أدخل كلمة المرور"
                    className="w-full pl-11 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white text-left placeholder:text-right placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6] transition-all"
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      soundEngine.playClick(soundEnabled);
                      setShowPassword((prev) => !prev);
                    }}
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div
                  role="alert"
                  className="text-xs font-bold text-[#dc2626] dark:text-[#ff7878] bg-[#FF4B4B]/10 rounded-xl px-3.5 py-2.5"
                >
                  {errorMsg}
                </div>
              )}

              {/* زر الإرسال */}
              <motion.button
                type="submit"
                disabled={submitting}
                whileTap={{ scale: 0.985 }}
                className="w-full py-3 rounded-xl bg-[#18181B] dark:bg-[#58CC02] hover:bg-[#27272A] dark:hover:bg-[#4eb802] text-white font-display font-extrabold text-sm shadow-sm transition-colors cursor-pointer disabled:opacity-60"
              >
                {submitting
                  ? 'جارٍ تسجيل الدخول...'
                  : mode === 'login'
                  ? 'دخول'
                  : 'إنشاء الحساب'}
              </motion.button>
            </form>
          </div>

          {/* تذييل التبديل */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-400">
            {mode === 'login' ? (
              <>
                ليس لديك حساب بعد؟{' '}
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick(soundEnabled);
                    setMode('signup');
                    setErrorMsg(null);
                  }}
                  className="font-bold text-slate-900 dark:text-white underline underline-offset-2 cursor-pointer"
                >
                  أنشئ حساباً
                </button>
              </>
            ) : (
              <>
                لديك حساب بالفعل؟{' '}
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick(soundEnabled);
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className="font-bold text-slate-900 dark:text-white underline underline-offset-2 cursor-pointer"
                >
                  سجّل الدخول
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
