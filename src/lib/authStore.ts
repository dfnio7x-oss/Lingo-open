import { UserProfileData } from '../types/learning';
import { createDefaultProfile } from './profileStore';
import {
  ensureCloudProfileDoc,
  ensureCloudSession,
  fetchCloudProfile,
  mergeLocalAndCloudProfiles,
  syncCloudProgress,
} from './cloudSync';

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

export function validateUsernameFormat(username: string): string | null {
  const rawUser = username.trim();
  if (rawUser.length < MIN_USERNAME_LENGTH || rawUser.length > MAX_USERNAME_LENGTH) {
    return `يجب أن يكون اسم المستخدم بين ${MIN_USERNAME_LENGTH} و ${MAX_USERNAME_LENGTH} حرفاً.`;
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(rawUser)) {
    return 'استخدم الأحرف الإنجليزية والأرقام و (_) أو (-) أو (.) فقط.';
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

function normalizeProfile(
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
      raw.avatarId === 'pip-fox' || !raw.avatarId ? 'app-crest' : raw.avatarId,
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
  if (!accounts[key]) return;
  accounts[key].profile = profile;
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

export async function loginWithUsernamePassword(
  username: string,
  password: string
): Promise<{ ok: true; profile: UserProfileData } | { ok: false; error: string }> {
  const rawUser = username.trim();
  const cleanKey = rawUser.toLowerCase();

  const usernameError = validateUsernameFormat(rawUser);
  if (usernameError) {
    return { ok: false, error: usernameError };
  }
  if (!password) {
    return { ok: false, error: 'الرجاء إدخال كلمة المرور.' };
  }

  const accounts = loadAccounts();
  const found = accounts[cleanKey];

  if (found) {
    const hash = await hashPassword(password);
    if (found.passwordHash !== hash) {
      return { ok: false, error: 'كلمة المرور غير صحيحة. حاول مرة أخرى.' };
    }

    let profile = normalizeProfile(found.profile, found.username || cleanKey);
    const cloudUid = await ensureCloudSession(rawUser, password, 'login');
    if (cloudUid) {
      try {
        const cloudData = await fetchCloudProfile(cloudUid);
        profile = mergeLocalAndCloudProfiles(profile, cloudData, cloudUid);
        await ensureCloudProfileDoc(profile);
        await syncCloudProgress(profile);
      } catch {
        profile = { ...profile, uid: cloudUid };
      }
      saveAccountProfile(cleanKey, profile);
    }

    setActiveSessionUsername(cleanKey);
    return { ok: true, profile };
  }

  // Not found locally: check if account exists in Firebase Cloud (cross-device login)
  const cloudUid = await ensureCloudSession(rawUser, password, 'login');
  if (cloudUid) {
    try {
      const cloudData = await fetchCloudProfile(cloudUid);
      if (cloudData && cloudData.username?.toLowerCase() === cleanKey) {
        const hydrated = normalizeProfile({ ...cloudData, uid: cloudUid }, rawUser);
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
    } catch {
      // Fall through to not-found message
    }
  }

  return { ok: false, error: 'الحساب غير موجود. تأكد من اسم المستخدم أو أنشئ حساباً جديداً.' };
}

export async function signUpWithUsernamePassword(
  username: string,
  password: string
): Promise<{ ok: true; profile: UserProfileData } | { ok: false; error: string }> {
  const rawUser = username.trim();
  const cleanKey = rawUser.toLowerCase();

  const usernameError = validateUsernameFormat(rawUser);
  if (usernameError) {
    return { ok: false, error: usernameError };
  }
  if (password.length < 4) {
    return { ok: false, error: 'يجب أن تتكون كلمة المرور من ٤ أحرف على الأقل.' };
  }

  const accounts = loadAccounts();
  if (accounts[cleanKey]) {
    return { ok: false, error: 'اسم المستخدم مسجل مسبقاً. جرّب تسجيل الدخول.' };
  }

  const cloudUid = await ensureCloudSession(rawUser, password, 'signup');
  const resolvedUid = cloudUid || `user_${cleanKey}`;

  const hash = await hashPassword(password);
  const newProfile = createDefaultProfile(resolvedUid, rawUser, rawUser);

  if (cloudUid) {
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
