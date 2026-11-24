import { UiLanguage, UserProfileData } from '../types/learning';
import { createDefaultProfile } from './profileStore';
import {
  authenticateEmailCloudSession,
  ensureCloudProfileDoc,
  fetchCloudProfile,
  mergeLocalAndCloudProfiles,
  signInWithGooglePopup,
  syncCloudProgress,
} from './cloudSync';
import { getUi } from './i18n';
import { getRandomAvatarId } from '../components/avatarOptions';

const ACCOUNTS_KEY = 'lingofox_accounts_v1';
const ACTIVE_SESSION_KEY = 'lingofox_active_user_v1';

export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 20;

interface StoredAccount {
  username: string;
  passwordHash: string;
  profile: UserProfileData;
}

async function hashPassword(password: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(`lingofox_salt::${password}`);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  let h = 0;
  for (let i = 0; i < password.length; i++) {
    h = (h << 5) - h + password.charCodeAt(i);
    h |= 0;
  }
  return String(h);
}

function loadAccounts(): Record<string, StoredAccount> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, StoredAccount>;
  } catch {
    return {};
  }
}

function saveAccounts(accounts: Record<string, StoredAccount>): void {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // Ignore quota errors
  }
}

export function validateUsernameFormat(
  username: string,
  uiLanguage: UiLanguage = 'ar'
): string | null {
  const t = getUi(uiLanguage).auth;
  const rawUser = username.trim();
  if (rawUser.length < MIN_USERNAME_LENGTH || rawUser.length > MAX_USERNAME_LENGTH) {
    return t.errUsernameLength(MIN_USERNAME_LENGTH, MAX_USERNAME_LENGTH);
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(rawUser)) {
    return t.errUsernameChars;
  }
  return null;
}

export function getActiveSessionUsername(): string | null {
  try {
    return localStorage.getItem(ACTIVE_SESSION_KEY);
  } catch {
    return null;
  }
}

export function setActiveSessionUsername(username: string | null): void {
  try {
    if (username) {
      localStorage.setItem(ACTIVE_SESSION_KEY, username.toLowerCase());
    } else {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  } catch {
    // Ignore
  }
}

export function normalizeProfile(
  raw: Partial<UserProfileData>,
  fallbackUsername: string
): UserProfileData {
  const base = createDefaultProfile(
    `user_${fallbackUsername.toLowerCase()}`,
    fallbackUsername,
    fallbackUsername
  );
  return {
    ...base,
    ...raw,
    avatarId:
      raw.avatarId === 'pip-fox' || !raw.avatarId
        ? getRandomAvatarId()
        : raw.avatarId,
    lessonStars:
      raw.lessonStars && typeof raw.lessonStars === 'object' ? raw.lessonStars : {},
    completedLessons: Array.isArray(raw.completedLessons)
      ? raw.completedLessons
      : [],
    masteredWords: Array.isArray(raw.masteredWords) ? raw.masteredWords : [],
    unlockedLevels:
      Array.isArray(raw.unlockedLevels) && raw.unlockedLevels.length > 0
        ? raw.unlockedLevels
        : ['A1'],
    weeklyXp: {
      ...base.weeklyXp,
      ...(raw.weeklyXp || {}),
    },
    voiceSpeed: typeof raw.voiceSpeed === 'number' ? raw.voiceSpeed : 0.9,
  };
}

export function getAccountProfile(username: string): UserProfileData | null {
  const accounts = loadAccounts();
  const key = username.trim().toLowerCase();
  const found = accounts[key];
  if (!found) return null;
  return normalizeProfile(found.profile, found.username || key);
}

export function saveAccountProfile(username: string, profile: UserProfileData): void {
  const accounts = loadAccounts();
  const key = username.trim().toLowerCase();
  if (!accounts[key]) {
    accounts[key] = {
      username: profile.username || key,
      passwordHash: '',
      profile,
    };
  } else {
    accounts[key].profile = profile;
  }
  saveAccounts(accounts);
}

export function deleteAccountByUsername(username: string): void {
  const accounts = loadAccounts();
  const key = username.trim().toLowerCase();
  delete accounts[key];
  saveAccounts(accounts);
  if (getActiveSessionUsername() === key) {
    setActiveSessionUsername(null);
  }
}

export async function loginWithGoogle(
  uiLanguage: UiLanguage = 'ar',
  mergeProfile?: UserProfileData
): Promise<{ ok: true; profile: UserProfileData } | { ok: false; error: string }> {
  const t = getUi(uiLanguage).auth;
  const res = await signInWithGooglePopup(mergeProfile);
  if (!res.ok) {
    return {
      ok: false,
      error: res.code === 'popup-closed' ? t.errGooglePopupClosed : t.errGoogleFailed,
    };
  }

  const normalized = normalizeProfile(res.profile, res.profile.username);
  saveAccountProfile(normalized.username, normalized);
  setActiveSessionUsername(normalized.username.toLowerCase());
  return { ok: true, profile: normalized };
}

export async function loginWithUsernamePassword(
  username: string,
  password: string,
  uiLanguage: UiLanguage = 'ar'
): Promise<{ ok: true; profile: UserProfileData } | { ok: false; error: string }> {
  const t = getUi(uiLanguage).auth;
  const rawUser = username.trim();
  const cleanKey = rawUser.toLowerCase();

  const usernameError = validateUsernameFormat(rawUser, uiLanguage);
  if (usernameError) {
    return { ok: false, error: usernameError };
  }
  if (!password) {
    return { ok: false, error: t.errPasswordRequired };
  }

  const accounts = loadAccounts();
  const found = accounts[cleanKey];

  // Case 1: Account exists locally in browser storage
  if (found && found.passwordHash) {
    const hash = await hashPassword(password);
    if (found.passwordHash !== hash) {
      return { ok: false, error: t.errWrongPassword };
    }

    let profile = normalizeProfile(found.profile, found.username || cleanKey);
    const cloudAuth = await authenticateEmailCloudSession(rawUser, password, 'login');

    if (cloudAuth.ok) {
      try {
        const cloudData = await fetchCloudProfile(cloudAuth.uid);
        profile = mergeLocalAndCloudProfiles(profile, cloudData, cloudAuth.uid);
        await ensureCloudProfileDoc(profile);
        await syncCloudProgress(profile);
      } catch {
        profile = { ...profile, uid: cloudAuth.uid };
      }
      saveAccountProfile(cleanKey, profile);
    } else if (cloudAuth.reason === 'user-not-found' || cloudAuth.reason === 'wrong-password') {
      // Local account existed before cloud auth: register it in cloud if Email/Password is enabled
      const signupAttempt = await authenticateEmailCloudSession(rawUser, password, 'signup');
      if (signupAttempt.ok) {
        profile = { ...profile, uid: signupAttempt.uid };
        await ensureCloudProfileDoc(profile).catch(() => undefined);
        await syncCloudProgress(profile);
        saveAccountProfile(cleanKey, profile);
      }
    }

    setActiveSessionUsername(cleanKey);
    return { ok: true, profile };
  }

  // Case 2: Cross-device login — look up in Firebase Cloud directly
  const cloudAuth = await authenticateEmailCloudSession(rawUser, password, 'login');
  if (cloudAuth.ok) {
    let cloudData: Partial<UserProfileData> | null = null;
    try {
      cloudData = await fetchCloudProfile(cloudAuth.uid);
    } catch {
      cloudData = null;
    }

    const hydrated = cloudData
      ? normalizeProfile({ ...cloudData, uid: cloudAuth.uid }, rawUser)
      : createDefaultProfile(cloudAuth.uid, rawUser, rawUser, { randomizeAvatar: true });

    if (!cloudData) {
      await ensureCloudProfileDoc(hydrated).catch(() => undefined);
    }

    const hash = await hashPassword(password);
    accounts[cleanKey] = {
      username: rawUser,
      passwordHash: hash,
      profile: hydrated,
    };
    saveAccounts(accounts);
    setActiveSessionUsername(cleanKey);
    return { ok: true, profile: hydrated };
  }

  if (cloudAuth.reason === 'operation-not-allowed') {
    return { ok: false, error: t.errEmailProviderDisabled };
  }
  if (cloudAuth.reason === 'wrong-password') {
    return { ok: false, error: t.errWrongPassword };
  }
  return { ok: false, error: t.errAccountNotFound };
}

export async function signUpWithUsernamePassword(
  username: string,
  password: string,
  uiLanguage: UiLanguage = 'ar'
): Promise<{ ok: true; profile: UserProfileData } | { ok: false; error: string }> {
  const t = getUi(uiLanguage).auth;
  const rawUser = username.trim();
  const cleanKey = rawUser.toLowerCase();

  const usernameError = validateUsernameFormat(rawUser, uiLanguage);
  if (usernameError) {
    return { ok: false, error: usernameError };
  }
  if (password.length < 4) {
    return { ok: false, error: t.errPasswordLength };
  }

  const accounts = loadAccounts();
  if (accounts[cleanKey]) {
    return { ok: false, error: t.errUsernameTaken };
  }

  const cloudAuth = await authenticateEmailCloudSession(rawUser, password, 'signup');
  if (!cloudAuth.ok && cloudAuth.reason === 'email-in-use') {
    return { ok: false, error: t.errUsernameTaken };
  }

  const resolvedUid = cloudAuth.ok ? cloudAuth.uid : `user_${cleanKey}`;
  const hash = await hashPassword(password);
  const newProfile = createDefaultProfile(resolvedUid, rawUser, rawUser, {
    randomizeAvatar: true,
  });
  newProfile.uiLanguage = uiLanguage;

  if (cloudAuth.ok) {
    try {
      await ensureCloudProfileDoc(newProfile);
    } catch {
      // Keep local profile usable even if offline
    }
  }

  accounts[cleanKey] = {
    username: rawUser,
    passwordHash: hash,
    profile: newProfile,
  };
  saveAccounts(accounts);
  setActiveSessionUsername(cleanKey);
  return { ok: true, profile: newProfile };
}
