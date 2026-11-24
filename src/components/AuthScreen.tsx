import { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { UiLanguage, UserProfileData } from '../types/learning';
import {
  loginWithGoogle,
  loginWithUsernamePassword,
  MAX_USERNAME_LENGTH,
  MIN_USERNAME_LENGTH,
  signUpWithUsernamePassword,
  validateUsernameFormat,
} from '../lib/authStore';
import { getUi } from '../lib/i18n';
import { soundEngine } from '../lib/sound';
import { triggerConfettiBurst } from './VfxOverlay';

interface AuthScreenProps {
  onSuccess: (profile: UserProfileData) => void;
  soundEnabled?: boolean;
  uiLanguage?: UiLanguage;
}

export function AuthScreen({
  onSuccess,
  soundEnabled = true,
  uiLanguage = 'ar',
}: AuthScreenProps) {
  const t = getUi(uiLanguage).auth;
  const isRtl = uiLanguage === 'ar';

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const trimmedLen = username.trim().length;
  const formatWarning = trimmedLen > 0 ? validateUsernameFormat(username, uiLanguage) : null;
  const liveUsernameHint =
    trimmedLen === 0
      ? t.usernameRuleHint(MIN_USERNAME_LENGTH, MAX_USERNAME_LENGTH)
      : formatWarning || t.usernameCharsCount(trimmedLen, MAX_USERNAME_LENGTH);
  const isUsernameLengthOk = trimmedLen === 0 || !formatWarning;

  const handleGoogleLogin = async () => {
    if (submitting || googleLoading) return;
    soundEngine.playClick(soundEnabled);
    setGoogleLoading(true);
    setErrorMsg(null);

    const res = await loginWithGoogle(uiLanguage);
    if (!res.ok) {
      setErrorMsg(res.error);
      soundEngine.playWrong(soundEnabled);
      setGoogleLoading(false);
      return;
    }

    soundEngine.playLessonComplete(soundEnabled);
    triggerConfettiBurst('stars');
    setTimeout(() => {
      onSuccess(res.profile);
    }, 380);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || googleLoading) return;

    const formatErr = validateUsernameFormat(username, uiLanguage);
    if (formatErr) {
      setErrorMsg(formatErr);
      soundEngine.playWrong(soundEnabled);
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const res =
      mode === 'login'
        ? await loginWithUsernamePassword(username, password, uiLanguage)
        : await signUpWithUsernamePassword(username, password, uiLanguage);

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
    }, 400);
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-[#FAFAFA] dark:bg-[#0B1120] relative overflow-hidden"
    >
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
        <div className="flex flex-col items-center text-center">
          <img
            src="/assets/aistudio/10263_zoomed-1_bee373d8.jpg"
            alt="LingoLearn"
            referrerPolicy="no-referrer"
            className="w-20 h-20 rounded-[22px] object-cover shadow-lg border-2 border-white dark:border-slate-800"
          />
          <h1 className="mt-3 font-display font-black text-2xl text-slate-900 dark:text-white tracking-tight">
            LingoLearn
          </h1>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5 max-w-xs">
            {mode === 'login' ? t.loginSubtitle : t.signupSubtitle}
          </p>
        </div>

        <div className="w-full rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_20px_50px_rgba(15,23,42,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)] overflow-hidden pt-6">
          <div className="px-7 sm:px-8 pb-7 space-y-5">
            {/* Google Sign-In for instant reliable Cloud Sync across devices */}
            <button
              type="button"
              disabled={googleLoading || submitting}
              onClick={handleGoogleLogin}
              className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-display font-extrabold text-sm flex items-center justify-center gap-3 shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                />
              </svg>
              <span>{googleLoading ? t.googleSigningIn : t.googleContinue}</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                {t.orDivider}
              </span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="flex justify-center">
              <div
                role="tablist"
                aria-label={t.loginTab}
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
                  <span>{t.loginTab}</span>
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
                  <span>{t.signupTab}</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="auth-username"
                    className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    {t.usernameLabel}
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
                  placeholder={t.usernamePlaceholder}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white text-left placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6] transition-all ${
                    isRtl ? 'placeholder:text-right' : 'placeholder:text-left'
                  }`}
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

              <div>
                <label
                  htmlFor="auth-password"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  {t.passwordLabel}
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
                    placeholder={t.passwordPlaceholder}
                    className={`w-full pl-11 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white text-left placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1CB0F6] focus:border-[#1CB0F6] transition-all ${
                      isRtl ? 'placeholder:text-right' : 'placeholder:text-left'
                    }`}
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      soundEngine.playClick(soundEnabled);
                      setShowPassword((prev) => !prev);
                    }}
                    aria-label={showPassword ? t.hidePassword : t.showPassword}
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
                  className="text-xs font-bold text-[#dc2626] dark:text-[#ff7878] bg-[#FF4B4B]/10 rounded-xl px-3.5 py-2.5 leading-relaxed"
                >
                  {errorMsg}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={submitting || googleLoading}
                whileTap={{ scale: 0.985 }}
                className="w-full py-3 rounded-xl bg-[#18181B] dark:bg-[#58CC02] hover:bg-[#27272A] dark:hover:bg-[#4eb802] text-white font-display font-extrabold text-sm shadow-sm transition-colors cursor-pointer disabled:opacity-60"
              >
                {submitting
                  ? t.submitting
                  : mode === 'login'
                  ? t.loginSubmit
                  : t.signupSubmit}
              </motion.button>
            </form>
          </div>

          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-400">
            {mode === 'login' ? (
              <>
                {t.noAccountPrompt}{' '}
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick(soundEnabled);
                    setMode('signup');
                    setErrorMsg(null);
                  }}
                  className="font-bold text-slate-900 dark:text-white underline underline-offset-2 cursor-pointer"
                >
                  {t.createOneLink}
                </button>
              </>
            ) : (
              <>
                {t.hasAccountPrompt}{' '}
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick(soundEnabled);
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className="font-bold text-slate-900 dark:text-white underline underline-offset-2 cursor-pointer"
                >
                  {t.signInLink}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
