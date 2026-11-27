// Ultra-calm Web Audio API chimes + hybrid pronunciation:
// - Instant browser SpeechSynthesis for single words
// - Realistic server-side Gemini TTS (/api/tts) with caching for sentences & examples
// - Automatic blank-space parser (pauses cleanly instead of reading underscores)

let audioCtx: AudioContext | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];
let activeSpeakToken = 0;
let activeHtmlAudio: HTMLAudioElement | null = null;
const ttsAudioCache = new Map<string, string>();
const MAX_TTS_CACHE = 120;

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadVoices = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
  loadVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
}

// Gentle acoustic kalimba/harp tone: low filter cutoff, smooth fade-in, soft low gain
function playCalmTone(
  freq: number,
  duration: number,
  startTimeOffset = 0,
  volume = 0.11,
  cutoff = 980
) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime + startTimeOffset;
  const osc = ctx.createOscillator();
  const warmOver = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  const overGain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, now);

  warmOver.type = 'sine';
  warmOver.frequency.setValueAtTime(freq * 0.5, now);
  overGain.gain.setValueAtTime(0.14, now);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(cutoff, now);
  filter.Q.setValueAtTime(0.5, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.028);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(filter);
  warmOver.connect(overGain);
  overGain.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  warmOver.start(now);
  osc.stop(now + duration + 0.04);
  warmOver.stop(now + duration + 0.04);
}

function pickBestEnglishVoice(): SpeechSynthesisVoice | undefined {
  const voices =
    cachedVoices.length > 0
      ? cachedVoices
      : typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis.getVoices()
      : [];

  const priorityNames = [
    'Google US English',
    'Google UK English Female',
    'Samantha',
    'Daniel',
    'Microsoft Aria',
    'Microsoft Jenny',
    'Karen',
  ];

  for (const name of priorityNames) {
    const match = voices.find((v) => v.name.includes(name));
    if (match) return match;
  }

  return (
    voices.find((v) => v.lang === 'en-US') ||
    voices.find((v) => v.lang === 'en-GB') ||
    voices.find((v) => v.lang.startsWith('en'))
  );
}

export function splitAroundBlanks(rawText: string): string[] {
  if (!rawText) return [];
  const rawParts = rawText.split(/_{2,}|\[_{2,}\]|\[\.\.\.\]|…/g);
  return rawParts
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .filter((part) => part.length > 0 && !/^[.,!?;:'"()\-–—]+$/.test(part));
}

function shouldUseRealisticAiVoice(fullText: string, segments: string[]): boolean {
  const combined = segments.join(' ').trim();
  const wordCount = combined.split(/\s+/).filter(Boolean).length;
  return wordCount >= 3 || /[.!?]/.test(fullText) || segments.length > 1;
}

function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchGeminiTtsDataUrl(text: string): Promise<string | null> {
  const key = text.trim();
  if (!key) return null;
  const cached = ttsAudioCache.get(key);
  if (cached) return cached;

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: key }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { audioBase64?: string; mimeType?: string };
    if (!data.audioBase64) return null;
    const mime = data.mimeType || 'audio/wav';
    const dataUrl = `data:${mime};base64,${data.audioBase64}`;
    if (ttsAudioCache.size >= MAX_TTS_CACHE) {
      const oldestKey = ttsAudioCache.keys().next().value;
      if (oldestKey) ttsAudioCache.delete(oldestKey);
    }
    ttsAudioCache.set(key, dataUrl);
    return dataUrl;
  } catch {
    return null;
  }
}

function playDataUrlAudio(dataUrl: string, rate: number, token: number): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || token !== activeSpeakToken) {
      resolve(false);
      return;
    }
    try {
      const audio = new Audio(dataUrl);
      audio.playbackRate = Math.max(0.5, Math.min(1.5, rate));
      audio.volume = 0.95;
      activeHtmlAudio = audio;

      const finish = (ok: boolean) => {
        if (activeHtmlAudio === audio) {
          activeHtmlAudio = null;
        }
        resolve(ok);
      };

      audio.onended = () => finish(true);
      audio.onerror = () => finish(false);
      void audio.play().catch(() => finish(false));
    } catch {
      resolve(false);
    }
  });
}

function playBrowserSpeechSegment(
  text: string,
  rate: number,
  token: number
): Promise<void> {
  return new Promise((resolve) => {
    if (
      typeof window === 'undefined' ||
      !('speechSynthesis' in window) ||
      token !== activeSpeakToken
    ) {
      resolve();
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = Math.max(0.5, Math.min(1.5, rate));
      utterance.volume = 0.9;
      utterance.pitch = 1.0;
      const preferred = pickBestEnglishVoice();
      if (preferred) {
        utterance.voice = preferred;
      }

      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        resolve();
      };

      const safetyTimer = setTimeout(done, 6000);
      utterance.onend = () => {
        clearTimeout(safetyTimer);
        done();
      };
      utterance.onerror = () => {
        clearTimeout(safetyTimer);
        done();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      playCalmTone(493.88, 0.18, 0, 0.09);
      resolve();
    }
  });
}

export const VOICE_SPEED_OPTIONS = [
  { value: 0.65, label: '0.65x', tag: 'بطيء' },
  { value: 0.85, label: '0.85x', tag: 'واضح' },
  { value: 1.0, label: '1.0x', tag: 'طبيعي' },
  { value: 1.2, label: '1.2x', tag: 'سريع' },
];

export const soundEngine = {
  playClick(enabled = true) {
    if (!enabled) return;
    playCalmTone(392.0, 0.07, 0, 0.075, 760);
  },

  playCardFlip(enabled = true) {
    if (!enabled) return;
    playCalmTone(440.0, 0.11, 0, 0.085, 920);
    playCalmTone(587.33, 0.13, 0.045, 0.08, 1020);
  },

  playWheelTick(enabled = true) {
    if (!enabled) return;
    const ticks = [0, 0.09, 0.19, 0.31, 0.46, 0.65];
    ticks.forEach((offset, idx) => {
      playCalmTone(330 + idx * 24, 0.055, offset, 0.065, 800);
    });
  },

  playCorrect(enabled = true, combo = 1) {
    if (!enabled) return;
    const step = Math.min(combo - 1, 4) * 20;
    playCalmTone(493.88 + step, 0.22, 0, 0.105, 980);
    playCalmTone(659.25 + step, 0.28, 0.085, 0.11, 1040);
    if (combo >= 2) {
      playCalmTone(783.99 + step, 0.34, 0.17, 0.1, 1080);
    }
  },

  playWrong(enabled = true) {
    if (!enabled) return;
    playCalmTone(261.63, 0.22, 0, 0.09, 680);
    playCalmTone(220.0, 0.28, 0.12, 0.08, 620);
  },

  playStreak(enabled = true) {
    if (!enabled) return;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      playCalmTone(freq, 0.28, idx * 0.065, 0.095, 1050);
    });
  },

  playUnlock(enabled = true) {
    if (!enabled) return;
    const notes = [440, 523.25, 659.25, 783.99];
    notes.forEach((n, idx) => {
      playCalmTone(n, 0.32, idx * 0.085, 0.105, 1060);
    });
  },

  playLevelUp(enabled = true) {
    if (!enabled) return;
    const chord = [440, 554.37, 659.25, 880];
    chord.forEach((n, idx) => {
      playCalmTone(n, 0.42, idx * 0.09, 0.11, 1120);
    });
  },

  playLessonComplete(enabled = true) {
    if (!enabled) return;
    const arpeggio = [
      { f: 440.0, t: 0, d: 0.24 },
      { f: 523.25, t: 0.11, d: 0.26 },
      { f: 659.25, t: 0.22, d: 0.3 },
      { f: 783.99, t: 0.34, d: 0.48 },
    ];
    arpeggio.forEach((n) => playCalmTone(n.f, n.d, n.t, 0.115, 1100));
  },

  stopSpeech() {
    activeSpeakToken += 1;
    if (activeHtmlAudio) {
      try {
        activeHtmlAudio.pause();
        activeHtmlAudio.currentTime = 0;
      } catch {
        // Ignore
      }
      activeHtmlAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    }
  },

  speakWord(text: string, enabled = true, rate = 0.9) {
    if (!enabled || typeof window === 'undefined') return;
    this.stopSpeech();
    const token = activeSpeakToken;
    const segments = splitAroundBlanks(text);
    if (segments.length === 0) return;

    const useAiVoice = shouldUseRealisticAiVoice(text, segments);
    const clampedRate = Math.max(0.5, Math.min(1.5, rate));

    const runSequence = async () => {
      for (let i = 0; i < segments.length; i++) {
        if (token !== activeSpeakToken) return;
        const segment = segments[i];

        let playedViaAi = false;
        if (useAiVoice) {
          const dataUrl = await fetchGeminiTtsDataUrl(segment);
          if (token !== activeSpeakToken) return;
          if (dataUrl) {
            playedViaAi = await playDataUrlAudio(dataUrl, clampedRate, token);
          }
        }

        if (!playedViaAi) {
          if (token !== activeSpeakToken) return;
          await playBrowserSpeechSegment(segment, clampedRate, token);
        }

        if (i < segments.length - 1 && token === activeSpeakToken) {
          await waitMs(380);
        }
      }
    };

    void runSequence();
  },
};
