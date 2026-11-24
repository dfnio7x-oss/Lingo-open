import {
  Bell,
  Check,
  Gauge,
  Globe,
  Moon,
  Sun,
  Volume2,
  Waves,
} from 'lucide-react';
import { CefrLevel, UserProfileData } from '../types/learning';
import { CEFR_ORDER } from '../data/curriculum';
import { getUi, LANGUAGE_OPTIONS } from '../lib/i18n';
import { soundEngine, VOICE_SPEED_OPTIONS } from '../lib/sound';
import { LevelBadgeArt } from './LevelBadgeArt';

interface SettingsViewProps {
  profile: UserProfileData;
  onUpdatePreferences: (patch: Partial<UserProfileData>) => void;
}

const DAILY_GOALS = [20, 50, 100, 150];

export function SettingsView({
  profile,
  onUpdatePreferences,
}: SettingsViewProps) {
  const t = getUi(profile.uiLanguage);
  const s = t.settings;
  const isRtl = profile.uiLanguage === 'ar';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-[var(--text-primary)] tracking-tight">
            {s.title}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            {s.subtitle}
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Primary Column: Audio & Study Plan */}
        <div className="lg:col-span-7 space-y-6">
          {/* Audio & Pronunciation Studio */}
          <section className="rounded-[28px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1CB0F6]/15 text-[#1CB0F6] flex items-center justify-center">
                  <Gauge className="w-5 h-5" />
                </div>
                <h2 className="font-display font-black text-lg text-[var(--text-primary)]">
                  {s.audioStudioTitle}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => soundEngine.playCorrect(true, 2)}
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface-muted)] hover:bg-[#58CC02]/15 text-xs font-extrabold text-[#58CC02] cursor-pointer transition-colors"
                >
                  {s.testChimeBtn}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    soundEngine.speakWord(
                      'Hello! Let us practice English together.',
                      true,
                      profile.voiceSpeed
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface-muted)] hover:bg-[#1CB0F6]/15 text-xs font-extrabold text-[#1CB0F6] cursor-pointer transition-colors"
                >
                  {s.testVoiceBtn(profile.voiceSpeed)}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[var(--text-secondary)]">
                {s.voiceSpeedLabel}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {VOICE_SPEED_OPTIONS.map((opt) => {
                  const active = Math.abs(profile.voiceSpeed - opt.value) < 0.05;
                  const speedTag = s.speedTags[String(opt.value)] || opt.tag;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        soundEngine.playClick(profile.soundEnabled);
                        onUpdatePreferences({ voiceSpeed: opt.value });
                        soundEngine.speakWord(
                          'Practice makes progress.',
                          profile.voiceEnabled,
                          opt.value
                        );
                      }}
                      className={`py-3 px-2 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                        active
                          ? 'bg-[#1CB0F6]/12 border-[#1CB0F6] text-[#0c87c4] dark:text-[#57C9FF]'
                          : 'bg-[var(--bg-surface-muted)] border-transparent text-[var(--text-primary)] hover:border-[#1CB0F6]/40'
                      }`}
                    >
                      <div dir="ltr" className="font-mono-num font-black text-sm">
                        {opt.label}
                      </div>
                      <div className="text-[11px] font-bold text-[var(--text-secondary)]">
                        {speedTag}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="divide-y divide-[var(--border-subtle)]">
              <ToggleRow
                icon={<Waves className="w-5 h-5 text-[#58CC02]" />}
                title={s.calmSfxTitle}
                description={s.calmSfxDesc}
                checked={profile.soundEnabled}
                onToggle={(next) => {
                  if (next) soundEngine.playCorrect(true, 1);
                  onUpdatePreferences({ soundEnabled: next });
                }}
              />
              <ToggleRow
                icon={<Volume2 className="w-5 h-5 text-[#1CB0F6]" />}
                title={s.autoSpeakTitle}
                description={s.autoSpeakDesc}
                checked={profile.voiceEnabled}
                onToggle={(next) => {
                  soundEngine.playClick(profile.soundEnabled);
                  onUpdatePreferences({ voiceEnabled: next });
                }}
              />
            </div>
          </section>

          {/* Study Plan & Default Level */}
          <section className="rounded-[28px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 shadow-sm space-y-5">
            <h2 className="font-display font-black text-lg text-[var(--text-primary)]">
              {s.studyPlanTitle}
            </h2>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2">
                {s.dailyGoalXpLabel}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {DAILY_GOALS.map((goal) => {
                  const active = profile.dailyGoal === goal;
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => {
                        soundEngine.playClick(profile.soundEnabled);
                        onUpdatePreferences({ dailyGoal: goal });
                      }}
                      dir="ltr"
                      className={`py-2.5 px-3 rounded-2xl font-mono-num font-extrabold text-sm border-2 transition-all cursor-pointer ${
                        active
                          ? 'bg-[#58CC02]/12 border-[#58CC02] text-[#46A302] dark:text-[#7CE826]'
                          : 'bg-[var(--bg-surface-muted)] border-transparent text-[var(--text-primary)] hover:border-[#1CB0F6]'
                      }`}
                    >
                      {goal} XP
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2">
                {s.defaultLevelLabel}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CEFR_ORDER.map((lvl: CefrLevel) => {
                  const active = profile.difficulty === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        soundEngine.playClick(profile.soundEnabled);
                        onUpdatePreferences({ difficulty: lvl });
                      }}
                      className={`p-2.5 rounded-2xl border-2 flex items-center gap-2.5 ${
                        isRtl ? 'text-right' : 'text-left'
                      } transition-all cursor-pointer ${
                        active
                          ? 'bg-[#1CB0F6]/12 border-[#1CB0F6] text-[#0c87c4] dark:text-[#57C9FF]'
                          : 'bg-[var(--bg-surface-muted)] border-transparent text-[var(--text-primary)] hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <LevelBadgeArt level={lvl} size="sm" />
                      <div className="min-w-0">
                        <div dir="ltr" className="font-display font-black text-sm leading-none">
                          {lvl}
                        </div>
                        <div className="text-[11px] font-bold text-[var(--text-secondary)] truncate mt-0.5">
                          {t.levels[lvl].title}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* Secondary Column: Appearance & Language */}
        <div className="lg:col-span-5 space-y-6">
          <section className="rounded-[28px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 shadow-sm space-y-5">
            <h2 className="font-display font-black text-lg text-[var(--text-primary)]">
              {s.appearanceTitle}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick(profile.soundEnabled);
                  onUpdatePreferences({ darkMode: false });
                }}
                className={`rounded-2xl p-3.5 ${
                  isRtl ? 'text-right' : 'text-left'
                } border-2 transition-all cursor-pointer ${
                  !profile.darkMode
                    ? 'border-[#58CC02] bg-[#58CC02]/8'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface-muted)]'
                }`}
              >
                <div className="h-10 rounded-xl bg-[#F7F9FC] border border-slate-200 mb-2.5 flex items-center px-2.5 gap-1.5">
                  <Sun className="w-4 h-4 text-[#FF9600]" />
                  <div className="h-2 w-10 rounded-full bg-slate-300" />
                </div>
                <div className="font-display font-extrabold text-xs text-[var(--text-primary)] flex items-center justify-between">
                  <span>{s.lightMode}</span>
                  {!profile.darkMode && <Check className="w-4 h-4 text-[#58CC02]" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick(profile.soundEnabled);
                  onUpdatePreferences({ darkMode: true });
                }}
                className={`rounded-2xl p-3.5 ${
                  isRtl ? 'text-right' : 'text-left'
                } border-2 transition-all cursor-pointer ${
                  profile.darkMode
                    ? 'border-[#1CB0F6] bg-[#1CB0F6]/10'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface-muted)]'
                }`}
              >
                <div className="h-10 rounded-xl bg-[#0F172A] border border-slate-700 mb-2.5 flex items-center px-2.5 gap-1.5">
                  <Moon className="w-4 h-4 text-[#1CB0F6]" />
                  <div className="h-2 w-10 rounded-full bg-slate-600" />
                </div>
                <div className="font-display font-extrabold text-xs text-[var(--text-primary)] flex items-center justify-between">
                  <span>{s.darkMode}</span>
                  {profile.darkMode && <Check className="w-4 h-4 text-[#1CB0F6]" />}
                </div>
              </button>
            </div>

            <div className="pt-1 border-t border-[var(--border-subtle)]">
              <ToggleRow
                icon={<Bell className="w-5 h-5 text-[#FF9600]" />}
                title={s.remindersTitle}
                description={s.remindersDesc}
                checked={profile.notificationsEnabled}
                onToggle={(next) => {
                  soundEngine.playClick(profile.soundEnabled);
                  onUpdatePreferences({ notificationsEnabled: next });
                }}
              />
            </div>
          </section>

          <section className="rounded-[28px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 shadow-sm space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#1CB0F6]" />
                <h2 className="font-display font-black text-lg text-[var(--text-primary)]">
                  {s.languageTitle}
                </h2>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">{s.languageSub}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {LANGUAGE_OPTIONS.map((lang) => {
                const active = profile.uiLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick(profile.soundEnabled);
                      onUpdatePreferences({ uiLanguage: lang.code });
                    }}
                    className={`rounded-2xl p-3.5 ${
                      isRtl ? 'text-right' : 'text-left'
                    } border-2 transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      active
                        ? 'bg-[#1CB0F6]/10 border-[#1CB0F6]'
                        : 'bg-[var(--bg-surface-muted)] border-transparent hover:border-[var(--border-subtle)]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-display font-extrabold text-sm text-[var(--text-primary)]">
                        {lang.label}
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-snug">
                        {lang.subtitle[profile.uiLanguage]}
                      </div>
                    </div>
                    {active && <Check className="w-4 h-4 text-[#1CB0F6] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  icon,
  title,
  description,
  checked,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onToggle: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[var(--bg-surface-muted)] flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <div className="font-display font-extrabold text-sm text-[var(--text-primary)]">
            {title}
          </div>
          <div className="text-xs text-[var(--text-secondary)]">{description}</div>
        </div>
      </div>

      <button
        type="button"
        dir="ltr"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onToggle(!checked)}
        className={`relative w-14 h-8 rounded-full transition-colors cursor-pointer shrink-0 ${
          checked ? 'bg-[#58CC02]' : 'bg-slate-300 dark:bg-slate-600'
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
