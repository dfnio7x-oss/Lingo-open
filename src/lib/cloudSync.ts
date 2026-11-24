import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { CefrLevel, UserProfileData } from '../types/learning';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { createDefaultProfile, getTodayIso } from './profileStore';
import { getRandomAvatarId } from '../components/avatarOptions';

function toInternalAuthEmail(username: string): string {
  const safe = username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '_');
  return `u_${safe}@accounts.lingolearn.app`;
}

function toFirebasePassword(rawPassword: string): string {
  return rawPassword.length >= 6 ? rawPassword : `${rawPassword}__ll`;
}

export function sanitizeCloudAvatarUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('data:')) return '';
  return url.slice(0, 512);
}

function clampList<T>(arr: T[], max: number): T[] {
  return Array.isArray(arr) ? arr.slice(0, max) : [];
}

export function deriveUsernameFromFirebaseUser(fbUser: User): string {
  const rawBase =
    fbUser.email?.split('@')[0] ||
    fbUser.displayName ||
    `learner_${fbUser.uid.slice(0, 6)}`;
  let cleaned = rawBase.toLowerCase().replace(/[^a-z0-9_.-]/g, '_').replace(/^_+|_+$/g, '');
  if (cleaned.length < 3) {
    cleaned = `user_${fbUser.uid.slice(0, 6)}`.toLowerCase();
  }
  return cleaned.slice(0, 20);
}

function buildCloudProfilePayload(profile: UserProfileData, uid: string) {
  const safeUsername =
    (profile.username || 'learner')
      .trim()
      .replace(/[^a-zA-Z0-9_.-]/g, '_')
      .slice(0, 20) || 'learner';
  const paddedUsername = safeUsername.length >= 3 ? safeUsername : `${safeUsername}_usr`.slice(0, 20);

  return {
    uid,
    username: paddedUsername,
    displayName: (profile.displayName || paddedUsername).trim().slice(0, 80) || paddedUsername,
    avatarId: (
      profile.avatarId === 'pip-fox' || !profile.avatarId
        ? getRandomAvatarId()
        : profile.avatarId
    ).slice(0, 64),
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
      profile.unlockedLevels && profile.unlockedLevels.length > 0
        ? profile.unlockedLevels.slice(0, 6)
        : (['A1'] as CefrLevel[]),
    completedLessons: clampList(profile.completedLessons || [], 2000),
    lessonStars: profile.lessonStars || {},
    masteredWords: clampList(profile.masteredWords || [], 15000),
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

export type CloudAuthResult =
  | { ok: true; uid: string }
  | {
      ok: false;
      reason:
        | 'wrong-password'
        | 'user-not-found'
        | 'email-in-use'
        | 'operation-not-allowed'
        | 'network'
        | 'unknown';
    };

export async function authenticateEmailCloudSession(
  username: string,
  password: string,
  mode: 'login' | 'signup'
): Promise<CloudAuthResult> {
  const email = toInternalAuthEmail(username);
  const fbPass = toFirebasePassword(password);

  try {
    if (mode === 'signup') {
      const cred = await createUserWithEmailAndPassword(auth, email, fbPass);
      return { ok: true, uid: cred.user.uid };
    } else {
      const cred = await signInWithEmailAndPassword(auth, email, fbPass);
      return { ok: true, uid: cred.user.uid };
    }
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code || '';
    if (code === 'auth/email-already-in-use') {
      return { ok: false, reason: 'email-in-use' };
    }
    if (code === 'auth/user-not-found') {
      return { ok: false, reason: 'user-not-found' };
    }
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      return { ok: false, reason: 'wrong-password' };
    }
    if (
      code === 'auth/operation-not-allowed' ||
      code === 'auth/admin-restricted-operation'
    ) {
      return { ok: false, reason: 'operation-not-allowed' };
    }
    if (code === 'auth/network-request-failed') {
      return { ok: false, reason: 'network' };
    }
    return { ok: false, reason: 'unknown' };
  }
}

export async function signInWithGooglePopup(
  mergeFromProfile?: UserProfileData
): Promise<
  | { ok: true; profile: UserProfileData; isNewUser: boolean }
  | { ok: false; code: 'popup-closed' | 'failed' }
> {
  try {
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, googleProvider);
    const fbUser = cred.user;
    const cloudData = await fetchCloudProfile(fbUser.uid);

    if (cloudData) {
      const baseUsername =
        cloudData.username || deriveUsernameFromFirebaseUser(fbUser);
      const base = mergeFromProfile
        ? mergeFromProfile
        : createDefaultProfile(
            fbUser.uid,
            baseUsername,
            fbUser.displayName || baseUsername,
            { randomizeAvatar: true }
          );
      const hydrated = mergeLocalAndCloudProfiles(
        {
          ...base,
          email: fbUser.email || base.email || '',
        },
        cloudData,
        fbUser.uid
      );
      await ensureCloudProfileDoc(hydrated);
      await syncCloudProgress(hydrated);
      if (hydrated.email) {
        await syncCloudPrivateEmail(hydrated.email, hydrated);
      }
      return { ok: true, profile: hydrated, isNewUser: false };
    }

    const derivedUsername =
      mergeFromProfile?.username && mergeFromProfile.username !== 'learner'
        ? mergeFromProfile.username
        : deriveUsernameFromFirebaseUser(fbUser);
    const baseProfile = mergeFromProfile
      ? {
          ...mergeFromProfile,
          uid: fbUser.uid,
          displayName:
            mergeFromProfile.displayName || fbUser.displayName || derivedUsername,
          email: fbUser.email || mergeFromProfile.email || '',
        }
      : createDefaultProfile(
          fbUser.uid,
          derivedUsername,
          fbUser.displayName || derivedUsername,
          { randomizeAvatar: true }
        );

    const newProfile: UserProfileData = {
      ...baseProfile,
      uid: fbUser.uid,
      email: fbUser.email || baseProfile.email || '',
    };

    await ensureCloudProfileDoc(newProfile);
    if (newProfile.email) {
      await syncCloudPrivateEmail(newProfile.email, newProfile);
    }

    return { ok: true, profile: newProfile, isNewUser: true };
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code || '';
    if (
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request'
    ) {
      return { ok: false, code: 'popup-closed' };
    }
    return { ok: false, code: 'failed' };
  }
}

export async function fetchCloudProfile(
  uid: string
): Promise<Partial<UserProfileData> | null> {
  if (!auth.currentUser || auth.currentUser.uid !== uid) return null;
  const userPath = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    const data = snap.data() as Partial<UserProfileData>;

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
    if (
      code === 'unavailable' ||
      msg.includes('offline') ||
      msg.includes('network')
    ) {
      return null;
    }
    handleFirestoreError(err, OperationType.GET, userPath);
  }
}

export async function ensureCloudProfileDoc(
  profile: UserProfileData
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  const userRef = doc(db, 'users', uid);
  const userPath = `users/${uid}`;
  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const payload = buildCloudProfilePayload(profile, uid);
      await setDoc(userRef, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code || '';
    const msg = err instanceof Error ? err.message : String(err);
    if (code === 'unavailable' || msg.includes('offline')) {
      return;
    }
    handleFirestoreError(err, OperationType.CREATE, userPath);
  }
}

export async function syncCloudProfileMeta(
  profile: UserProfileData
): Promise<boolean> {
  const uid = auth.currentUser?.uid;
  if (!uid) return false;
  const userPath = `users/${uid}`;
  try {
    await ensureCloudProfileDoc(profile);
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      displayName: (profile.displayName || profile.username).trim().slice(0, 80) || profile.username,
      avatarId: (
        profile.avatarId === 'pip-fox' || !profile.avatarId
          ? 'app-crest'
          : profile.avatarId
      ).slice(0, 64),
      customAvatarUrl: sanitizeCloudAvatarUrl(profile.customAvatarUrl),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.warn('Cloud profile meta sync failed:', err);
    return false;
  }
}

export async function syncCloudPrivateEmail(
  email: string,
  profile?: UserProfileData
): Promise<boolean> {
  const uid = auth.currentUser?.uid;
  if (!uid) return false;
  const privRef = doc(db, 'users', uid, 'private', 'info');
  try {
    if (profile) {
      await ensureCloudProfileDoc(profile);
    }
    await setDoc(
      privRef,
      {
        uid,
        email: email.trim().slice(0, 256),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.warn('Cloud private email sync failed:', err);
    return false;
  }
}

export async function syncCloudPreferences(
  profile: UserProfileData
): Promise<boolean> {
  const uid = auth.currentUser?.uid;
  if (!uid) return false;
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
    return true;
  } catch (err) {
    console.warn('Cloud preferences sync failed:', err);
    return false;
  }
}

export async function syncCloudProgress(
  profile: UserProfileData
): Promise<boolean> {
  const uid = auth.currentUser?.uid;
  if (!uid) return false;
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
    return true;
  } catch (err) {
    console.warn('Cloud progress sync failed:', err);
    return false;
  }
}

export async function syncFullProfileToCloud(
  profile: UserProfileData
): Promise<boolean> {
  const uid = auth.currentUser?.uid;
  if (!uid) return false;
  try {
    await ensureCloudProfileDoc(profile);
    const okMeta = await syncCloudProfileMeta(profile);
    const okPrefs = await syncCloudPreferences(profile);
    const okProg = await syncCloudProgress(profile);
    if (profile.email) {
      await syncCloudPrivateEmail(profile.email, profile);
    }
    return okMeta && okPrefs && okProg;
  } catch {
    return false;
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
    console.warn('Cloud attempt log failed:', err);
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
    username: cloud.username || local.username || 'learner',
    displayName: cloud.displayName || local.displayName,
    email: cloud.email || local.email || '',
    avatarId:
      cloud.avatarId && cloud.avatarId !== 'pip-fox'
        ? cloud.avatarId
        : local.avatarId && local.avatarId !== 'pip-fox'
        ? local.avatarId
        : getRandomAvatarId(),
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
