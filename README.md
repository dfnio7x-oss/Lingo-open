# LingoFox — Interactive English Learning Platform (A1 to C2)

**LingoFox** (`LingoLearn`) is a modern, gamified full-stack English learning platform covering CEFR levels **A1 through C2**, with rich vocabulary decks (including **Oxford 3000**, **Oxford 5000**, and **C2 Lingvo**), an interactive **Grammar Studio**, mini-games, **Streak Freeze** protection, celebratory streak milestones, realistic AI sentence voice, and **Firebase Cloud Sync**.

---

## Key Features

- **Structured CEFR Path (`A1` → `C2`)**: Sequential lesson unlocking across core themed lessons, Oxford 3000/5000 decks, and C2 mastery units so learners focus on completed lessons and their current step.
- **Interactive Grammar Studio**: Level-aligned grammar lessons with clear rules, multilingual explanations, examples, and sequential practice quizzes.
- **Playful Mini-Games & Exercises**: Flashcard introductions, listening challenges, context fill-in-the-blank, word-meaning matching, Mystery Card, Letter Scramble, Memory Flip, Word Wheel, and Speed Blitz.
- **Hybrid Realistic Voice & Blank-Pause Audio**:
  - Instant browser speech for single vocabulary words during fast drills.
  - Realistic neural voice powered server-side by **Gemini TTS** (`gemini-3.8-flash-lite-tts`) with in-memory WAV caching for example sentences and context prompts.
  - Intelligent blank parser that turns `___` blanks into natural silent pauses without reading underscores aloud.
- **Habit & Streak System**:
  - **Streak Freeze**: Purchase and arm a 1-day freeze for **50 XP** in Settings whenever today's XP is `0` to automatically protect your streak if a day is missed.
  - **Streak Milestone Animations**: Celebratory flame & confetti animations for every new streak day and major milestones (`3`, `5`, `10`, `15`, `25`, `50`, `100`).
- **Multilingual UI (`AR`, `EN`, `ES`, `FR`)**: Full RTL/LTR support with a centered language switcher in Settings, dark/light themes, customizable avatars, and a searchable Vocabulary Vault.
- **Cloud Sync & Offline PWA**: Firebase Authentication + Firestore persistence with hardened security rules, plus offline caching via Service Worker.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion (`motion/react`), Lucide Icons, Canvas Confetti
- **Backend**: Node.js 22, Express, `@google/genai` (server-side `/api/tts`)
- **Database & Auth**: Firebase Authentication & Cloud Firestore
- **Tooling**: `tsx`, ESLint (`@firebase/eslint-plugin-security-rules`)

---

## Environment Variables

Create a `.env` file (or configure Secrets in your hosting environment) based on `.env.example`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
FIREBASE_API_KEY=
DISABLE_HMR=
```

> **Note**: `GEMINI_API_KEY` is used strictly on the server inside `server.ts` for `/api/tts` and is never exposed to client bundles.

---

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server (Express + Vite middleware on port 3000)**
   ```bash
   npm run dev
   ```

3. **Type-check & build for production**
   ```bash
   npm run lint
   npm run build
   npm start
   ```

---

## Project Structure

- `server.ts` — Express server serving Vite in development, static `dist/` in production, and the `/api/tts` Gemini TTS endpoint
- `src/App.tsx` — Main application shell, streak transition engine, cloud hydration, and lesson/modal orchestration
- `src/components/` — `HomeView`, `DailyView`, `YouView`, `SettingsView`, `LessonPlayer`, `GrammarLessonPlayer`, `MiniGames`, `StreakCelebrationModal`, `VocabVaultModal`, and `AvatarCustomizerModal`
- `src/lib/` — `sound.ts` (hybrid TTS + blank-pause audio), `profileStore.ts` (local state + streak transitions), `cloudSync.ts` (Firestore sync), `authStore.ts`, `firebase.ts`, and `i18n.ts`
- `src/data/` — CEFR A1–C2 curriculum, Oxford 3000/5000, C2 words, and expanded grammar units
- `firestore.rules` & `firebase-blueprint.json` — Owner-scoped Firestore schema and security rules
