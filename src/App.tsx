import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CefrLevel,
  GrammarUnit,
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
  normalizeProfile,
  saveAccountProfile,
  setActiveSessionUsername,
} from './lib/authStore';
import {
  deleteCloudAccountDocs,
  deriveUsernameFromFirebaseUser,
  fetchCloudProfile,
  mergeLocalAndCloudProfiles,
  recordCloudLessonAttempt,
  signOutCloudSession,
  syncCloudPreferences,
  syncCloudPrivateEmail,
  syncCloudProfileMeta,
  syncCloudProgress,
  syncFullProfileToCloud,
} from './lib/cloudSync';
import { auth } from './lib/firebase';
import { getUi } from './lib/i18n';
import { soundEngine } from './lib/sound';
import { AuthScreen } from './components/AuthScreen';
import { AvatarCustomizerModal } from './components/AvatarCustomizerModal';
import { BottomNav } from './components/BottomNav';
import { DailyView } from './components/DailyView';
import { GrammarLessonPlayer } from './components/GrammarLessonPlayer';
import { HomeView } from './components/HomeView';
import { YouView } from './components/YouView';
import { SettingsView } from './components/SettingsView';
import { LessonPlayer } from './components/LessonPlayer';
import { SplashScreen } from './components/SplashScreen';
import { VocabVaultModal } from './components/VocabVaultModal';
import { OfflineIndicator } from './components/PwaControls';
import {
  FloatingBurst,
  triggerConfettiBurst,
  VfxOverlay,
} from './components/VfxOverlay';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
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

  const [syncStatus, setSyncStatus] = useState<
    'synced' | 'syncing' | 'localOnly' | 'error'
  >(() => (auth.currentUser && !auth.currentUser.isAnonymous ? 'synced' : 'localOnly'));
  const [isCloudSignedIn, setIsCloudSignedIn] = useState<boolean>(() =>
    Boolean(auth.currentUser && !auth.currentUser.isAnonymous)
  );

  const [activeLesson, setActiveLesson] = useState<LessonUnit | null>(null);
  const [activeGrammarUnit, setActiveGrammarUnit] = useState<GrammarUnit | null>(null);
  const [vaultLevel, setVaultLevel] = useState<CefrLevel | 'ALL' | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [bursts, setBursts] = useState<FloatingBurst[]>([]);

  const t = getUi(profile.uiLanguage);

  // Hydrate Firebase / Google sessions on boot even if localStorage was cleared
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (fbUser) => {
      if (!fbUser || fbUser.isAnonymous) {
        setIsCloudSignedIn(false);
        setSyncStatus('localOnly');
        return;
      }

      setIsCloudSignedIn(true);
      setSyncStatus('syncing');
      try {
        const cloudData = await fetchCloudProfile(fbUser.uid);
        const derivedUser =
          cloudData?.username || deriveUsernameFromFirebaseUser(fbUser);

        if (cloudData) {
          setProfile((prev) => {
            const base =
              prev.uid === fbUser.uid || prev.username.toLowerCase() === derivedUser.toLowerCase()
                ? prev
                : createDefaultProfile(
                    fbUser.uid,
                    derivedUser,
                    fbUser.displayName || derivedUser,
                    { randomizeAvatar: true }
                  );
            const merged = normalizeProfile(
              mergeLocalAndCloudProfiles(base, cloudData, fbUser.uid),
              derivedUser
            );
            saveAccountProfile(merged.username, merged);
            return merged;
          });
          setActiveSessionUsername(derivedUser);
          setIsAuthenticated(true);
        }
        setSyncStatus('synced');
      } catch {
        setSyncStatus('error');
      }
    });
    return () => unsubscribe();
  }, []);

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
    const signedInCloud = Boolean(auth.currentUser && !auth.currentUser.isAnonymous);
    setIsCloudSignedIn(signedInCloud);
    setSyncStatus(signedInCloud ? 'synced' : 'localOnly');
    triggerBurst(getUi(loadedProfile.uiLanguage).toast.welcome(loadedProfile.displayName), '#58CC02');
  };

  const handleSignOut = () => {
    setActiveSessionUsername(null);
    void signOutCloudSession();
    setIsAuthenticated(false);
    setIsCloudSignedIn(false);
    setSyncStatus('localOnly');
    setActiveLesson(null);
    setActiveGrammarUnit(null);
    setVaultLevel(null);
    setShowAvatarModal(false);
    setActiveTab('home');
  };

  const handleSyncNow = async () => {
    soundEngine.playClick(profile.soundEnabled);
    setSyncStatus('syncing');
    const ok = await syncFullProfileToCloud(profile);
    if (ok) {
      setSyncStatus('synced');
      triggerBurst(t.toast.syncSuccess, '#58CC02');
    } else {
      setSyncStatus(auth.currentUser && !auth.currentUser.isAnonymous ? 'error' : 'localOnly');
    }
  };

  const handleUpdateAccount = (patch: Partial<UserProfileData>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      if (isAuthenticated && auth.currentUser && !auth.currentUser.isAnonymous) {
        setSyncStatus('syncing');
        const runSync = async () => {
          let ok = true;
          if ('displayName' in patch || 'avatarId' in patch || 'customAvatarUrl' in patch) {
            ok = (await syncCloudProfileMeta(next)) && ok;
          }
          if ('email' in patch && typeof patch.email === 'string') {
            ok = (await syncCloudPrivateEmail(patch.email, next)) && ok;
          }
          setSyncStatus(ok ? 'synced' : 'error');
        };
        void runSync();
      }
      return next;
    });
  };

  const handleUpdatePreferences = (patch: Partial<UserProfileData>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      if (isAuthenticated && auth.currentUser && !auth.currentUser.isAnonymous) {
        setSyncStatus('syncing');
        void syncCloudPreferences(next).then((ok) =>
          setSyncStatus(ok ? 'synced' : 'error')
        );
      }
      return next;
    });
  };

  const handleUnlockLevel = (level: CefrLevel) => {
    if (profile.unlockedLevels.includes(level)) return;
    soundEngine.playLevelUp(profile.soundEnabled);
    triggerConfettiBurst('stars');
    triggerBurst(t.toast.levelUnlocked(level), '#1CB0F6', t.toast.levelReadySub);

    setProfile((prev) => {
      const next: UserProfileData = {
        ...prev,
        unlockedLevels: Array.from(new Set([...prev.unlockedLevels, level])) as CefrLevel[],
        difficulty: level,
      };
      if (isAuthenticated && auth.currentUser && !auth.currentUser.isAnonymous) {
        setSyncStatus('syncing');
        void syncCloudProgress(next).then((ok) =>
          setSyncStatus(ok ? 'synced' : 'error')
        );
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
      const allTierCompleted =
        levelLessonIds.length > 0 &&
        levelLessonIds.every((id) => nextCompleted.includes(id));
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

      if (isAuthenticated && auth.currentUser && !auth.currentUser.isAnonymous) {
        setSyncStatus('syncing');
        const acc = Math.round((result.correctCount / Math.max(result.totalCount, 1)) * 100);
        void syncCloudProgress(nextProfile).then((ok) =>
          setSyncStatus(ok ? 'synced' : 'error')
        );
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
      if (isAuthenticated && auth.currentUser && !auth.currentUser.isAnonymous) {
        void syncCloudProgress(reset);
      }
      return reset;
    });
    triggerBurst(t.toast.progressReset, '#FF9600');
  };

  const handleDeleteAccount = () => {
    soundEngine.playClick(profile.soundEnabled);
    if (profile.username) {
      deleteAccountByUsername(profile.username);
    }
    void deleteCloudAccountDocs();
    setActiveSessionUsername(null);
    setIsAuthenticated(false);
    setIsCloudSignedIn(false);
    setSyncStatus('localOnly');
    setActiveLesson(null);
    setActiveGrammarUnit(null);
    setVaultLevel(null);
    setShowAvatarModal(false);
    setActiveTab('home');
    triggerBurst(t.toast.accountDeleted, '#FF4B4B');
  };

  const startCurrentLessonFromDaily = () => {
    const unlockedLessons = ALL_LESSONS.filter((l) =>
      profile.unlockedLevels.includes(l.level)
    );
    const nextLesson =
      unlockedLessons.find((l) => !profile.completedLessons.includes(l.id)) ||
      unlockedLessons[0] ||
      ALL_LESSONS[0];
    setActiveLesson(nextLesson);
  };

  if (showSplash) {
    return (
      <SplashScreen
        uiLanguage={profile.uiLanguage}
        onFinish={() => setShowSplash(false)}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <OfflineIndicator uiLanguage={profile.uiLanguage} />
        <AuthScreen
          onSuccess={handleAuthSuccess}
          soundEnabled={profile.soundEnabled}
          uiLanguage={profile.uiLanguage}
        />
        <VfxOverlay bursts={bursts} onExpire={expireBurst} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] pb-28">
      <OfflineIndicator uiLanguage={profile.uiLanguage} />

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
                onStartGrammarUnit={(unit) => setActiveGrammarUnit(unit)}
                onUnlockLevel={handleUnlockLevel}
                onOpenVault={(lvl) => setVaultLevel(lvl || 'ALL')}
              />
            )}

            {activeTab === 'daily' && (
              <DailyView
                profile={profile}
                onStartCurrentLesson={startCurrentLessonFromDaily}
                onOpenVault={(lvl) => setVaultLevel(lvl || 'ALL')}
              />
            )}

            {activeTab === 'you' && (
              <YouView
                profile={profile}
                syncStatus={syncStatus}
                isCloudSignedIn={isCloudSignedIn}
                onSyncNow={handleSyncNow}
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

      {/* Fixed Rounded-Rectangle Glassmorphism 4-Item Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onSelect={setActiveTab}
        soundEnabled={profile.soundEnabled}
        uiLanguage={profile.uiLanguage}
      />

      {/* Interactive Vocabulary Lesson Arena */}
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

      {/* Interactive Grammar Unit Arena */}
      {activeGrammarUnit && (
        <GrammarLessonPlayer
          unit={activeGrammarUnit}
          soundEnabled={profile.soundEnabled}
          voiceEnabled={profile.voiceEnabled}
          voiceSpeed={profile.voiceSpeed}
          uiLanguage={profile.uiLanguage}
          onChangeVoiceSpeed={(speed) => handleUpdatePreferences({ voiceSpeed: speed })}
          onTriggerBurst={triggerBurst}
          onComplete={handleCompleteLesson}
          onClose={() => setActiveGrammarUnit(null)}
        />
      )}

      {/* Full Vocabulary Explorer Modal */}
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
          uiLanguage={profile.uiLanguage}
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
