# Security Specification — LingoFox Firestore Rules

## 1. Data Invariants
- A `UserProfile` at `/users/{userId}` can only be read, created, updated, or deleted by the authenticated owner whose `request.auth.uid == userId`.
- All write operations require `request.auth.token.email_verified == true`.
- Document IDs must match `^[a-zA-Z0-9_-]+$` and be <= 128 chars.
- `uid` and `createdAt` are immutable once created; `createdAt` and `updatedAt` must equal `request.time`.
- User PII (`email`) is isolated in `/users/{userId}/private/info` and requires parent profile existence (`existsAfter` on create, `exists` on update).
- `LessonAttempt` records at `/users/{userId}/attempts/{attemptId}` are immutable once created and require parent `/users/{userId}` ownership verification.

## 2. Adversarial "Dirty Dozen" Payloads (All Must Yield PERMISSION_DENIED)
1. **Unauthenticated read** on `/users/user_1`.
2. **Cross-user read** on `/users/user_2` signed in as `user_1`.
3. **Unverified email write** creating `/users/user_1` with `email_verified: false`.
4. **UID spoofing** creating `/users/user_1` with `{ uid: "user_2", ... }` while signed in as `user_1`.
5. **Shadow field injection** creating `/users/user_1` with extra key `{ isAdmin: true }`.
6. **Oversized ID poisoning** writing `/users/${'a'.repeat(300)}`.
7. **Client-forged timestamp** creating `/users/user_1` with `createdAt: Timestamp(2020-01-01)` instead of `request.time`.
8. **Immutable field mutation** updating `uid` or `createdAt` on `/users/user_1`.
9. **Value poisoning** updating `xp` to `-500` or `displayName` to 500 chars.
10. **Blanket list scraping** running `list` on `/users` without owner filter.
11. **PII cross-read** reading `/users/user_2/private/info` as `user_1`.
12. **Attempt tampering** updating an existing `/users/user_1/attempts/att_1` document.
