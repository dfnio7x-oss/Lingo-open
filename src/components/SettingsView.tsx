import { useState } from 'react';
import {
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Globe,
  GraduationCap,
  Moon,
  Sparkles,
  Sun,
  Target,
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

type ExpandableSection =
  | 'voiceSpeed'
  | 'audioTest'
  | 'dailyGoal'
  | 'difficulty'
  | 'appearance'
  | 'language'
  | null;

const DAILY_GOALS = [20, 50, 100, 150];

export function SettingsView({
  profile,
  onUpdatePreferences,
}: SettingsViewProps) {
  const t = getUi(profile.uiLanguage);
  const s = t.settings;
  const isRtl = profile.uiLanguage === 'ar';
  const [expanded, setExpanded] = useState<ExpandableSection>(null);

  const toggleExpand = (section: ExpandableSection) => {
    soundEngine.playClick(profile.soundEnabled);
    setExpanded((prev) => (prev === section ? null : section));
  };

  const activeSpeedOption =
    VOICE_SPEED_OPTIONS.find((opt) => Math.abs(profile.voiceSpeed - opt.value) < 0.05) ||
    VOICE_SPEED_OPTIONS[1];
  const activeSpeedLabel = `${activeSpeedOption.label} · ${
    s.speedTags[String(activeSpeedOption.value)] || activeSpeedOption.tag
  }`;

  const activeLanguageOption =
    LANGUAGE_OPTIONS.find((l) => l.code === profile.uiLanguage) || LANGUAGE_OPTIONS[0];

  const DisclosureChevron = ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? (
      <ChevronDown className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
    ) : isRtl ? (
      <ChevronLeft className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
    ) : (
      <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
    );

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="max-w-3xl mx-auto space-y-6 pb-6">
      {/* Page Title */}
      <div className="px-1">
        <h1 className="font-display font-black text-2xl sm:text-3xl text-[var(--text-primary)] tracking-tight">
          {s.title}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
          {s.subtitle}
        </p>
      </div>

      {/* Group 1: Audio & Pronunciation */}
      <section aria-label={s.audioStudioTitle} className="space-y-2">
        <h2 className="text-xs font-bold text-[var(--text-secondary)] px-3">
          {s.audioStudioTitle}
        </h2>

        <div className="rounded-[20px] bg-[var(--bg-surface)] border border-slate-200/80 dark:border-white/[0.06] overflow-hidden divide-y divide-slate-100 dark:divide-white/[0.06] shadow-xs">
          {/* Row: Voice Speed */}
          <div>
            <button
              type="button"
              onClick={() => toggleExpand('voiceSpeed')}
              aria-expanded={expanded === 'voiceSpeed'}
              className="w-full min-h-[56px] px-4 sm:px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-[var(--bg-surface-muted)]/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <Gauge className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />
                <span className="font-display font-bold text-sm sm:text-[15px] text-[var(--text-primary)] truncate">
                  {s.voiceSpeedLabel}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-[var(--text-secondary)]">
                  {activeSpeedLabel}
                </span>
                <DisclosureChevron isOpen={expanded === 'voiceSpeed'} />
              </div>
            </button>

            {expanded === 'voiceSpeed' && (
              <div className="px-4 sm:px-5 pb-4 pt-1 bg-[var(--bg-surface-muted)]/40">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                        className={`py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                          active
                            ? 'bg-[#1CB0F6]/12 border-[#1CB0F6] text-[#0c87c4] dark:text-[#57C9FF]'
                            : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[#1CB0F6]/50'
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
            )}
          </div>

          {/* Row: Calm Sound Effects */}
          <SettingsSwitchRow
            icon={<Waves className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />}
            title={s.calmSfxTitle}
            description={s.calmSfxDesc}
            checked={profile.soundEnabled}
            onToggle={(next) => {
              if (next) soundEngine.playCorrect(true, 1);
              onUpdatePreferences({ soundEnabled: next });
            }}
          />

          {/* Row: Auto Speak */}
          <SettingsSwitchRow
            icon={<Volume2 className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />}
            title={s.autoSpeakTitle}
            description={s.autoSpeakDesc}
            checked={profile.voiceEnabled}
            onToggle={(next) => {
              soundEngine.playClick(profile.soundEnabled);
              onUpdatePreferences({ voiceEnabled: next });
            }}
          />

          {/* Row: Test Audio & Voice */}
          <div>
            <button
              type="button"
              onClick={() => toggleExpand('audioTest')}
              aria-expanded={expanded === 'audioTest'}
              className="w-full min-h-[56px] px-4 sm:px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-[var(--bg-surface-muted)]/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <Sparkles className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />
                <span className="font-display font-bold text-sm sm:text-[15px] text-[var(--text-primary)] truncate">
                  {s.testChimeBtn}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-[var(--text-secondary)]">
                  {s.testVoiceBtn(profile.voiceSpeed)}
                </span>
                <DisclosureChevron isOpen={expanded === 'audioTest'} />
              </div>
            </button>

            {expanded === 'audioTest' && (
              <div className="px-4 sm:px-5 pb-4 pt-1 bg-[var(--bg-surface-muted)]/40 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => soundEngine.playCorrect(true, 2)}
                  className="px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[#58CC02] text-xs font-extrabold text-[#58CC02] cursor-pointer transition-colors"
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
                  className="px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[#1CB0F6] text-xs font-extrabold text-[#1CB0F6] cursor-pointer transition-colors"
                >
                  {s.testVoiceBtn(profile.voiceSpeed)}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Group 2: Study Plan & Level */}
      <section aria-label={s.studyPlanTitle} className="space-y-2">
        <h2 className="text-xs font-bold text-[var(--text-secondary)] px-3">
          {s.studyPlanTitle}
        </h2>

        <div className="rounded-[20px] bg-[var(--bg-surface)] border border-slate-200/80 dark:border-white/[0.06] overflow-hidden divide-y divide-slate-100 dark:divide-white/[0.06] shadow-xs">
          {/* Row: Daily Goal XP */}
          <div>
            <button
              type="button"
              onClick={() => toggleExpand('dailyGoal')}
              aria-expanded={expanded === 'dailyGoal'}
              className="w-full min-h-[56px] px-4 sm:px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-[var(--bg-surface-muted)]/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <Target className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />
                <span className="font-display font-bold text-sm sm:text-[15px] text-[var(--text-primary)] truncate">
                  {s.dailyGoalXpLabel}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span dir="ltr" className="font-mono-num text-xs font-bold text-[var(--text-secondary)]">
                  {profile.dailyGoal} XP
                </span>
                <DisclosureChevron isOpen={expanded === 'dailyGoal'} />
              </div>
            </button>

            {expanded === 'dailyGoal' && (
              <div className="px-4 sm:px-5 pb-4 pt-1 bg-[var(--bg-surface-muted)]/40">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                        className={`py-2.5 px-3 rounded-xl font-mono-num font-extrabold text-sm border transition-all cursor-pointer ${
                          active
                            ? 'bg-[#58CC02]/12 border-[#58CC02] text-[#46A302] dark:text-[#7CE826]'
                            : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[#1CB0F6]'
                        }`}
                      >
                        {goal} XP
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Row: Default CEFR Level */}
          <div>
            <button
              type="button"
              onClick={() => toggleExpand('difficulty')}
              aria-expanded={expanded === 'difficulty'}
              className="w-full min-h-[56px] px-4 sm:px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-[var(--bg-surface-muted)]/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <GraduationCap className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />
                <span className="font-display font-bold text-sm sm:text-[15px] text-[var(--text-primary)] truncate">
                  {s.defaultLevelLabel}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-[var(--text-secondary)]">
                  {profile.difficulty} · {t.levels[profile.difficulty].title}
                </span>
                <DisclosureChevron isOpen={expanded === 'difficulty'} />
              </div>
            </button>

            {expanded === 'difficulty' && (
              <div className="px-4 sm:px-5 pb-4 pt-1 bg-[var(--bg-surface-muted)]/40">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                          isRtl ? 'text-right' : 'text-left'
                        } transition-all cursor-pointer ${
                          active
                            ? 'bg-[#1CB0F6]/12 border-[#1CB0F6] text-[#0c87c4] dark:text-[#57C9FF]'
                            : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-slate-400'
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
            )}
          </div>

          {/* Row: Notifications / Study Reminders */}
          <SettingsSwitchRow
            icon={<Bell className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />}
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

      {/* Group 3: Display & Language */}
      <section aria-label={s.appearanceTitle} className="space-y-2">
        <h2 className="text-xs font-bold text-[var(--text-secondary)] px-3">
          {s.appearanceTitle}
        </h2>

        <div className="rounded-[20px] bg-[var(--bg-surface)] border border-slate-200/80 dark:border-white/[0.06] overflow-hidden divide-y divide-slate-100 dark:divide-white/[0.06] shadow-xs">
          {/* Row: Theme Mode */}
          <div>
            <button
              type="button"
              onClick={() => toggleExpand('appearance')}
              aria-expanded={expanded === 'appearance'}
              className="w-full min-h-[56px] px-4 sm:px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-[var(--bg-surface-muted)]/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {profile.darkMode ? (
                  <Moon className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />
                ) : (
                  <Sun className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />
                )}
                <span className="font-display font-bold text-sm sm:text-[15px] text-[var(--text-primary)] truncate">
                  {s.appearanceTitle}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-[var(--text-secondary)]">
                  {profile.darkMode ? s.darkMode : s.lightMode}
                </span>
                <DisclosureChevron isOpen={expanded === 'appearance'} />
              </div>
            </button>

            {expanded === 'appearance' && (
              <div className="px-4 sm:px-5 pb-4 pt-1 bg-[var(--bg-surface-muted)]/40">
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick(profile.soundEnabled);
                      onUpdatePreferences({ darkMode: false });
                    }}
                    className={`rounded-xl p-3 ${
                      isRtl ? 'text-right' : 'text-left'
                    } border transition-all cursor-pointer ${
                      !profile.darkMode
                        ? 'border-[#58CC02] bg-[#58CC02]/10'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2 font-display font-extrabold text-xs text-[var(--text-primary)]">
                        <Sun className="w-4 h-4 text-[#FF9600]" />
                        <span>{s.lightMode}</span>
                      </span>
                      {!profile.darkMode && <Check className="w-4 h-4 text-[#58CC02]" />}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick(profile.soundEnabled);
                      onUpdatePreferences({ darkMode: true });
                    }}
                    className={`rounded-xl p-3 ${
                      isRtl ? 'text-right' : 'text-left'
                    } border transition-all cursor-pointer ${
                      profile.darkMode
                        ? 'border-[#1CB0F6] bg-[#1CB0F6]/10'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2 font-display font-extrabold text-xs text-[var(--text-primary)]">
                        <Moon className="w-4 h-4 text-[#1CB0F6]" />
                        <span>{s.darkMode}</span>
                      </span>
                      {profile.darkMode && <Check className="w-4 h-4 text-[#1CB0F6]" />}
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Row: App Language */}
          <div>
            <button
              type="button"
              onClick={() => toggleExpand('language')}
              aria-expanded={expanded === 'language'}
              className="w-full min-h-[56px] px-4 sm:px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-[var(--bg-surface-muted)]/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <Globe className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />
                <span className="font-display font-bold text-sm sm:text-[15px] text-[var(--text-primary)] truncate">
                  {s.languageTitle}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-[var(--text-secondary)]">
                  {activeLanguageOption.label}
                </span>
                <DisclosureChevron isOpen={expanded === 'language'} />
              </div>
            </button>

            {expanded === 'language' && (
              <div className="px-4 sm:px-5 pb-4 pt-1 bg-[var(--bg-surface-muted)]/40">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                        className={`rounded-xl p-3 ${
                          isRtl ? 'text-right' : 'text-left'
                        } border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          active
                            ? 'bg-[#1CB0F6]/10 border-[#1CB0F6]'
                            : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-slate-400'
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
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function SettingsSwitchRow({
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
    <div className="min-h-[56px] px-4 sm:px-5 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3.5 min-w-0">
        {icon}
        <div className="min-w-0">
          <div className="font-display font-bold text-sm sm:text-[15px] text-[var(--text-primary)]">
            {title}
          </div>
          <div className="text-xs text-[var(--text-secondary)] truncate">{description}</div>
        </div>
      </div>

      <button
        type="button"
        dir="ltr"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onToggle(!checked)}
        className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer shrink-0 ${
          checked ? 'bg-[#58CC02]' : 'bg-slate-300 dark:bg-slate-600'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
