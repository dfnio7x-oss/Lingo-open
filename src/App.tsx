import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CefrLevel,
  LessonUnit,
  NavTab,
  UserProfileData,
} from './types/learning';
import { ALL_LESSONS, CEFR_ORDER } from './data/curriculum';
import {
  createDefaultProfile,
  getTodayIso,
  getTodayWeekdayKey,
  loadLocalProfile,
  saveLocalProfile,
} from './lib/profileStore';
import {
  deleteAccountByUsername,
  getAccountProfile,
  getActiveSessionUsername,
  saveAccountProfile,
  setActiveSessionUsername,
} from './lib/authStore';
import {
  deleteCloudAccountDocs,
  fetchCloudProfile,
  mergeLocalAndCloudProfiles,
  recordCloudLessonAttempt,
  signOutCloudSession,
  syncCloudPreferences,
  syncCloudPrivateEmail,
  syncCloudProfileMeta,
  syncCloudProgress,
} from './lib/cloudSync';
import { auth } from './lib/firebase';
import { soundEngine } from './lib/sound';
import { AuthScreen } from './components/AuthScreen';
import { AvatarCustomizerModal } from './components/AvatarCustomizerModal';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { YouView } from './components/YouView';
import { SettingsView } from './components/SettingsView';
import { LessonPlayer } from './components/LessonPlayer';
import { VocabVaultModal } from './components/VocabVaultModal';
import { OfflineIndicator } from './components/PwaControls';
import {
  FloatingBurst,
  triggerConfettiBurst,
  VfxOverlay,
} from './components/VfxOverlay';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const activeUser = getActiveSessionUsername();
    return Boolean(activeUser && getAccountProfile(activeUser));
  });
  const [profile, setProfile] = useState<UserProfileData>(() => {
    const activeUser = getActiveSessionUsername();
    if (activeUser) {
      const saved = getAccountProfile(activeUser);
      if (saved) return saved;
    }
    return loadLocalProfile();
  });

  const [activeLesson, setActiveLesson] = useState<LessonUnit | null>(null);
  const [vaultLevel, setVaultLevel] = useState<CefrLevel | 'ALL' | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [bursts, setBursts] = useState<FloatingBurst[]>([]);

  // Re-hydrate from Firestore when Firebase session restores on app boot
  useEffect(() => {
    if (!isAuthenticated) return;
    const unsubscribe = auth.onAuthStateChanged(async (fbUser) => {
      if (!fbUser) return;
      try {
        const cloudData = await fetchCloudProfile(fbUser.uid);
        if (cloudData) {
          setProfile((prev) => mergeLocalAndCloudProfiles(prev, cloudData, fbUser.uid));
        }
      } catch {
        // Keep local cache silently if offline
      }
    });
    return () => unsubscribe();
  }, [isAuthenticated]);

  // Apply Dark Mode & Document Direction/Language cleanly to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (profile.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    const isRtl = profile.uiLanguage === 'ar';
    root.dir = isRtl ? 'rtl' : 'ltr';
    root.lang = profile.uiLanguage || 'ar';
  }, [profile.darkMode, profile.uiLanguage]);

  // Persist local & active account state
  useEffect(() => {
    saveLocalProfile(profile);
    if (isAuthenticated && profile.username) {
      saveAccountProfile(profile.username, profile);
    }
  }, [profile, isAuthenticated]);

  const triggerBurst = useCallback(
    (text: string, color: string, subtext?: string) => {
      setBursts((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), text, color, subtext },
      ]);
    },
    []
  );

  const expireBurst = useCallback((id: number) => {
    setBursts((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const handleAuthSuccess = (loadedProfile: UserProfileData) => {
    setProfile(loadedProfile);
    setIsAuthenticated(true);
    setActiveTab('home');
    triggerBurst(`أهلاً بك، ${loadedProfile.displayName}!`, '#58CC02');
  };

  const handleSignOut = () => {
    setActiveSessionUsername(null);
    void signOutCloudSession();
    setIsAuthenticated(false);
    setActiveLesson(null);
    setVaultLevel(null);
    setShowAvatarModal(false);
    setActiveTab('home');
  };

  const handleUpdateAccount = (patch: Partial<UserProfileData>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      if (isAuthenticated) {
        if ('displayName' in patch || 'avatarId' in patch || 'customAvatarUrl' in patch) {
          void syncCloudProfileMeta(next);
        }
        if ('email' in patch && typeof patch.email === 'string') {
          void syncCloudPrivateEmail(patch.email);
        }
      }
      return next;
    });
  };

  const handleUpdatePreferences = (patch: Partial<UserProfileData>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      if (isAuthenticated) {
        void syncCloudPreferences(next);
      }
      return next;
    });
  };

  const handleUnlockLevel = (level: CefrLevel) => {
    if (profile.unlockedLevels.includes(level)) return;
    soundEngine.playLevelUp(profile.soundEnabled);
    triggerConfettiBurst('stars');
    triggerBurst(`تم فتح المستوى ${level}!`, '#1CB0F6', 'مستوى جديد جاهز');

    setProfile((prev) => {
      const next: UserProfileData = {
        ...prev,
        unlockedLevels: Array.from(new Set([...prev.unlockedLevels, level])) as CefrLevel[],
        difficulty: level,
      };
      if (isAuthenticated) {
        void syncCloudProgress(next);
      }
      return next;
    });
  };

  const handleCompleteLesson = (result: {
    lessonId: string;
    level: CefrLevel;
    xpEarned: number;
    correctCount: number;
    totalCount: number;
    stars: number;
    masteredWordIds: string[];
  }) => {
    const today = getTodayIso();
    const weekday = getTodayWeekdayKey();

    setProfile((prev) => {
      const isNewDay = prev.lastActiveDate !== today;
      const nextCompleted = Array.from(
        new Set([...prev.completedLessons, result.lessonId])
      ).slice(0, 2000);
      const nextMastered = Array.from(
        new Set([...prev.masteredWords, ...result.masteredWordIds])
      ).slice(0, 15000);

      const levelLessonIds = ALL_LESSONS.filter(
        (l) => l.level === result.level && !l.id.startsWith('ox-deck-')
      ).map((l) => l.id);
      const allTierCompleted = levelLessonIds.every((id) =>
        nextCompleted.includes(id)
      );
      const nextUnlocked = [...prev.unlockedLevels];
      if (allTierCompleted) {
        const currentIdx = CEFR_ORDER.indexOf(result.level);
        const nextLevel = CEFR_ORDER[currentIdx + 1];
        if (nextLevel && !nextUnlocked.includes(nextLevel)) {
          nextUnlocked.push(nextLevel);
        }
      }

      const prevStars = prev.lessonStars?.[result.lessonId] || 0;
      const nextStars = Math.max(prevStars, result.stars || 3);

      const nextProfile: UserProfileData = {
        ...prev,
        xp: prev.xp + result.xpEarned,
        streak: isNewDay ? prev.streak + 1 : Math.max(prev.streak, 1),
        lessonsCompleted: prev.lessonsCompleted + 1,
        correctAnswers: prev.correctAnswers + result.correctCount,
        totalAnswers: prev.totalAnswers + result.totalCount,
        dailyXp: (isNewDay ? 0 : prev.dailyXp) + result.xpEarned,
        dailyLessons: (isNewDay ? 0 : prev.dailyLessons) + 1,
        lastActiveDate: today,
        unlockedLevels: nextUnlocked.slice(0, 6),
        completedLessons: nextCompleted,
        lessonStars: {
          ...(prev.lessonStars || {}),
          [result.lessonId]: nextStars,
        },
        masteredWords: nextMastered,
        weeklyXp: {
          ...prev.weeklyXp,
          [weekday]: (prev.weeklyXp[weekday] || 0) + result.xpEarned,
        },
      };

      if (isAuthenticated) {
        const acc = Math.round((result.correctCount / Math.max(result.totalCount, 1)) * 100);
        void syncCloudProgress(nextProfile);
        void recordCloudLessonAttempt({
          lessonId: result.lessonId,
          level: result.level,
          xpEarned: result.xpEarned,
          accuracy: acc,
        });
      }

      return nextProfile;
    });
  };

  const handleResetProgress = () => {
    soundEngine.playClick(profile.soundEnabled);
    setProfile((prev) => {
      const reset: UserProfileData = {
        ...createDefaultProfile(prev.uid, prev.username, prev.displayName),
        email: prev.email,
        avatarId: prev.avatarId,
        customAvatarUrl: prev.customAvatarUrl,
        dailyGoal: prev.dailyGoal,
        soundEnabled: prev.soundEnabled,
        voiceEnabled: prev.voiceEnabled,
        voiceSpeed: prev.voiceSpeed,
        notificationsEnabled: prev.notificationsEnabled,
        darkMode: prev.darkMode,
        uiLanguage: prev.uiLanguage,
        xp: 0,
        streak: 0,
      };
      if (isAuthenticated) {
        void syncCloudProgress(reset);
      }
      return reset;
    });
    triggerBurst('تمت إعادة تعيين التقدم', '#FF9600');
  };

  const handleDeleteAccount = () => {
    soundEngine.playClick(profile.soundEnabled);
    if (profile.username) {
      deleteAccountByUsername(profile.username);
    }
    void deleteCloudAccountDocs();
    setActiveSessionUsername(null);
    setIsAuthenticated(false);
    setActiveLesson(null);
    setVaultLevel(null);
    setShowAvatarModal(false);
    setActiveTab('home');
    triggerBurst('تم حذف الحساب', '#FF4B4B');
  };

  if (!isAuthenticated) {
    return (
      <>
        <OfflineIndicator />
        <AuthScreen
          onSuccess={handleAuthSuccess}
          soundEnabled={profile.soundEnabled}
        />
        <VfxOverlay bursts={bursts} onExpire={expireBurst} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] pb-28">
      <OfflineIndicator />

      {/* Main Responsive Viewport Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'home' && (
              <HomeView
                profile={profile}
                onNavigateTab={setActiveTab}
                onStartLesson={(lesson) => setActiveLesson(lesson)}
                onUnlockLevel={handleUnlockLevel}
                onOpenVault={(lvl) => setVaultLevel(lvl || 'ALL')}
              />
            )}

            {activeTab === 'you' && (
              <YouView
                profile={profile}
                onOpenVault={(lvl) => setVaultLevel(lvl || 'ALL')}
                onOpenAvatarModal={() => setShowAvatarModal(true)}
                onUpdateAccount={handleUpdateAccount}
                onSignOut={handleSignOut}
                onResetProgress={handleResetProgress}
                onDeleteAccount={handleDeleteAccount}
              />
            )}

            {activeTab === 'setting' && (
              <SettingsView
                profile={profile}
                onUpdatePreferences={handleUpdatePreferences}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Fixed Rounded-Rectangle Glassmorphism 3-Item Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onSelect={setActiveTab}
        soundEnabled={profile.soundEnabled}
      />

      {/* Interactive Lesson Arena */}
      {activeLesson && (
        <LessonPlayer
          lesson={activeLesson}
          soundEnabled={profile.soundEnabled}
          voiceEnabled={profile.voiceEnabled}
          voiceSpeed={profile.voiceSpeed}
          uiLanguage={profile.uiLanguage}
          onChangeVoiceSpeed={(speed) => handleUpdatePreferences({ voiceSpeed: speed })}
          onTriggerBurst={triggerBurst}
          onComplete={handleCompleteLesson}
          onClose={() => setActiveLesson(null)}
        />
      )}

      {/* Full A1-C2 + Oxford 3000/5000 + C2 Vocabulary Explorer Modal */}
      {vaultLevel && (
        <VocabVaultModal
          initialLevel={vaultLevel}
          masteredWords={profile.masteredWords}
          uiLanguage={profile.uiLanguage}
          soundEnabled={profile.soundEnabled}
          voiceSpeed={profile.voiceSpeed}
          onChangeVoiceSpeed={(speed) => handleUpdatePreferences({ voiceSpeed: speed })}
          onClose={() => setVaultLevel(null)}
        />
      )}

      {/* Profile Picture Customizer Modal */}
      {showAvatarModal && (
        <AvatarCustomizerModal
          currentAvatarId={profile.avatarId}
          currentCustomUrl={profile.customAvatarUrl}
          soundEnabled={profile.soundEnabled}
          onSelectPreset={(avatarId) =>
            handleUpdateAccount({ avatarId, customAvatarUrl: undefined })
          }
          onSelectCustomUrl={(url) =>
            handleUpdateAccount({ customAvatarUrl: url })
          }
          onClose={() => setShowAvatarModal(false)}
        />
      )}

      {/* VFX Particle Overlay */}
      <VfxOverlay bursts={bursts} onExpire={expireBurst} />
    </div>
  );
}
