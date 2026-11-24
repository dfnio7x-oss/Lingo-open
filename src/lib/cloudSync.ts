import {
  createUserWithEmailAndPassword,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { CefrLevel, UserProfileData } from '../types/learning';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { getTodayIso } from './profileStore';

function toInternalAuthEmail(username: string): string {
  const safe = username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '_');
  return `u_${safe}@accounts.lingolearn.app`;
}

function toFirebasePassword(rawPassword: string): string {
  // Ensure Firebase 6-char minimum when user picks 4+ char password while keeping per-user derivation
  return rawPassword.length >= 6 ? rawPassword : `${rawPassword}__ll`;
}

function sanitizeCloudAvatarUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('data:')) return '';
  return url.slice(0, 512);
}

function clampList<T>(arr: T[], max: number): T[] {
  return Array.isArray(arr) ? arr.slice(0, max) : [];
}

function buildCloudProfilePayload(profile: UserProfileData, uid: string) {
  return {
    uid,
    username: profile.username.slice(0, 20),
    displayName: (profile.displayName || profile.username).slice(0, 80),
    avatarId: (profile.avatarId === 'pip-fox' ? 'app-crest' : profile.avatarId || 'app-crest').slice(
      0,
      64
    ),
    customAvatarUrl: sanitizeCloudAvatarUrl(profile.customAvatarUrl),
    xp: Math.max(0, Math.round(profile.xp || 0)),
    streak: Math.max(0, Math.round(profile.streak || 0)),
    lessonsCompleted: Math.max(0, Math.round(profile.lessonsCompleted || 0)),
    correctAnswers: Math.max(0, Math.round(profile.correctAnswers || 0)),
    totalAnswers: Math.max(0, Math.round(profile.totalAnswers || 0)),
    dailyXp: Math.max(0, Math.round(profile.dailyXp || 0)),
    dailyLessons: Math.max(0, Math.round(profile.dailyLessons || 0)),
    lastActiveDate: (profile.lastActiveDate || getTodayIso()).slice(0, 20),
    dailyGoal: Math.min(500, Math.max(10, Math.round(profile.dailyGoal || 50))),
    difficulty: profile.difficulty || 'A1',
    soundEnabled: Boolean(profile.soundEnabled),
    voiceEnabled: Boolean(profile.voiceEnabled),
    voiceSpeed: Math.min(1.5, Math.max(0.5, Number(profile.voiceSpeed || 0.9))),
    notificationsEnabled: Boolean(profile.notificationsEnabled),
    darkMode: Boolean(profile.darkMode),
    uiLanguage: profile.uiLanguage || 'ar',
    unlockedLevels:
      profile.unlockedLevels.length > 0 ? profile.unlockedLevels.slice(0, 6) : (['A1'] as CefrLevel[]),
    completedLessons: clampList(profile.completedLessons, 2000),
    lessonStars: profile.lessonStars || {},
    masteredWords: clampList(profile.masteredWords, 15000),
    weeklyXp: {
      Mon: Math.round(profile.weeklyXp?.Mon || 0),
      Tue: Math.round(profile.weeklyXp?.Tue || 0),
      Wed: Math.round(profile.weeklyXp?.Wed || 0),
      Thu: Math.round(profile.weeklyXp?.Thu || 0),
      Fri: Math.round(profile.weeklyXp?.Fri || 0),
      Sat: Math.round(profile.weeklyXp?.Sat || 0),
      Sun: Math.round(profile.weeklyXp?.Sun || 0),
    },
  };
}

export async function ensureCloudSession(
  username: string,
  password: string,
  mode: 'login' | 'signup'
): Promise<string | null> {
  const email = toInternalAuthEmail(username);
  const fbPass = toFirebasePassword(password);

  try {
    if (mode === 'signup') {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, fbPass);
        return cred.user.uid;
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code || '';
        if (code === 'auth/email-already-in-use') {
          const cred = await signInWithEmailAndPassword(auth, email, fbPass);
          return cred.user.uid;
        }
        if (
          code === 'auth/operation-not-allowed' ||
          code === 'auth/admin-restricted-operation'
        ) {
          const anon = await signInAnonymously(auth);
          return anon.user.uid;
        }
        throw err;
      }
    } else {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, fbPass);
        return cred.user.uid;
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code || '';
        if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
          // Local account may have been created offline or before cloud sync was added — try registering it cleanly
          try {
            const cred = await createUserWithEmailAndPassword(auth, email, fbPass);
            return cred.user.uid;
          } catch {
            if (auth.currentUser) return auth.currentUser.uid;
            const anon = await signInAnonymously(auth);
            return anon.user.uid;
          }
        }
        if (
          code === 'auth/operation-not-allowed' ||
          code === 'auth/admin-restricted-operation'
        ) {
          if (auth.currentUser) return auth.currentUser.uid;
          const anon = await signInAnonymously(auth);
          return anon.user.uid;
        }
        return auth.currentUser?.uid ?? null;
      }
    }
  } catch {
    // Offline or restricted auth: fall back to current session or anonymous if possible
    if (auth.currentUser) return auth.currentUser.uid;
    try {
      const anon = await signInAnonymously(auth);
      return anon.user.uid;
    } catch {
      return null;
    }
  }
}

export async function fetchCloudProfile(uid: string): Promise<Partial<UserProfileData> | null> {
  if (!auth.currentUser || auth.currentUser.uid !== uid) return null;
  const userPath = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    const data = snap.data() as Partial<UserProfileData>;

    // Also try fetching isolated email PII
    let email = '';
    try {
      const privSnap = await getDoc(doc(db, 'users', uid, 'private', 'info'));
      if (privSnap.exists()) {
        email = String((privSnap.data() as { email?: string }).email || '');
      }
    } catch {
      // Optional private doc
    }

    return {
      ...data,
      email,
    };
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code || '';
    const msg = err instanceof Error ? err.message : String(err);
    if (code === 'unavailable' || msg.includes('offline') || msg.includes('network')) {
      return null;
    }
    handleFirestoreError(err, OperationType.GET, userPath);
  }
}

export async function ensureCloudProfileDoc(profile: UserProfileData): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    const payload = buildCloudProfilePayload(profile, uid);
    try {
      await setDoc(userRef, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${uid}`);
    }
  }
}

export async function syncCloudProfileMeta(profile: UserProfileData): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  try {
    await ensureCloudProfileDoc(profile);
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      displayName: (profile.displayName || profile.username).slice(0, 80),
      avatarId: (profile.avatarId === 'pip-fox' ? 'app-crest' : profile.avatarId || 'app-crest').slice(
        0,
        64
      ),
      customAvatarUrl: sanitizeCloudAvatarUrl(profile.customAvatarUrl),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Cloud profile meta sync skipped:', err);
  }
}

export async function syncCloudPrivateEmail(email: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  const privRef = doc(db, 'users', uid, 'private', 'info');
  try {
    await setDoc(
      privRef,
      {
        uid,
        email: email.trim().slice(0, 256),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Cloud private email sync skipped:', err);
  }
}

export async function syncCloudPreferences(profile: UserProfileData): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  try {
    await ensureCloudProfileDoc(profile);
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      dailyGoal: Math.min(500, Math.max(10, Math.round(profile.dailyGoal || 50))),
      difficulty: profile.difficulty || 'A1',
      soundEnabled: Boolean(profile.soundEnabled),
      voiceEnabled: Boolean(profile.voiceEnabled),
      voiceSpeed: Math.min(1.5, Math.max(0.5, Number(profile.voiceSpeed || 0.9))),
      notificationsEnabled: Boolean(profile.notificationsEnabled),
      darkMode: Boolean(profile.darkMode),
      uiLanguage: profile.uiLanguage || 'ar',
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Cloud preferences sync skipped:', err);
  }
}

export async function syncCloudProgress(profile: UserProfileData): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  try {
    await ensureCloudProfileDoc(profile);
    const payload = buildCloudProfilePayload(profile, uid);
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      xp: payload.xp,
      streak: payload.streak,
      lessonsCompleted: payload.lessonsCompleted,
      correctAnswers: payload.correctAnswers,
      totalAnswers: payload.totalAnswers,
      dailyXp: payload.dailyXp,
      dailyLessons: payload.dailyLessons,
      lastActiveDate: payload.lastActiveDate,
      unlockedLevels: payload.unlockedLevels,
      completedLessons: payload.completedLessons,
      lessonStars: payload.lessonStars,
      masteredWords: payload.masteredWords,
      weeklyXp: payload.weeklyXp,
      difficulty: payload.difficulty,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Cloud progress sync skipped:', err);
  }
}

export async function recordCloudLessonAttempt(params: {
  lessonId: string;
  level: CefrLevel;
  xpEarned: number;
  accuracy: number;
}): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  const attemptId = `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  try {
    await setDoc(doc(db, 'users', uid, 'attempts', attemptId), {
      uid,
      lessonId: params.lessonId.slice(0, 64),
      level: params.level,
      xpEarned: Math.min(1000, Math.max(0, Math.round(params.xpEarned))),
      accuracy: Math.min(100, Math.max(0, Math.round(params.accuracy))),
      completedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Cloud attempt log skipped:', err);
  }
}

export async function deleteCloudAccountDocs(): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  try {
    await deleteDoc(doc(db, 'users', uid, 'private', 'info')).catch(() => undefined);
    await deleteDoc(doc(db, 'users', uid)).catch(() => undefined);
    await signOut(auth).catch(() => undefined);
  } catch {
    // Ignore cleanup failures
  }
}

export async function signOutCloudSession(): Promise<void> {
  try {
    await signOut(auth);
  } catch {
    // Ignore
  }
}

export function mergeLocalAndCloudProfiles(
  local: UserProfileData,
  cloud: Partial<UserProfileData> | null,
  uid: string
): UserProfileData {
  if (!cloud) return { ...local, uid };

  const mergedCompleted = Array.from(
    new Set([...(local.completedLessons || []), ...(cloud.completedLessons || [])])
  ).slice(0, 2000);

  const mergedMastered = Array.from(
    new Set([...(local.masteredWords || []), ...(cloud.masteredWords || [])])
  ).slice(0, 15000);

  const mergedLevels = Array.from(
    new Set([...(local.unlockedLevels || ['A1']), ...(cloud.unlockedLevels || ['A1'])])
  ).slice(0, 6) as CefrLevel[];

  const mergedStars: Record<string, number> = { ...(local.lessonStars || {}) };
  if (cloud.lessonStars) {
    for (const [k, v] of Object.entries(cloud.lessonStars)) {
      mergedStars[k] = Math.max(mergedStars[k] || 0, Number(v) || 0);
    }
  }

  const preferCloud = (cloud.xp ?? 0) >= (local.xp ?? 0);
  const base = preferCloud ? { ...local, ...cloud } : { ...cloud, ...local };

  return {
    ...base,
    uid,
    username: local.username || cloud.username || 'learner',
    displayName: cloud.displayName || local.displayName,
    email: cloud.email || local.email || '',
    customAvatarUrl: local.customAvatarUrl || cloud.customAvatarUrl || undefined,
    xp: Math.max(local.xp || 0, cloud.xp || 0),
    streak: Math.max(local.streak || 0, cloud.streak || 0),
    lessonsCompleted: Math.max(local.lessonsCompleted || 0, cloud.lessonsCompleted || 0),
    correctAnswers: Math.max(local.correctAnswers || 0, cloud.correctAnswers || 0),
    totalAnswers: Math.max(local.totalAnswers || 0, cloud.totalAnswers || 0),
    unlockedLevels: mergedLevels,
    completedLessons: mergedCompleted,
    lessonStars: mergedStars,
    masteredWords: mergedMastered,
  };
}
