import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const HOST = '0.0.0.0';
const MAX_TTS_CHARS = 400;

let cachedAi: GoogleGenAI | null = null;
let cachedApiKey = '';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) return null;
  if (!cachedAi || cachedApiKey !== apiKey) {
    cachedAi = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    cachedApiKey = apiKey;
  }
  return cachedAi;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '32kb' }));

  // Server-side realistic TTS endpoint using Gemini 3.8 Flash Lite TTS
  app.post('/api/tts', async (req, res) => {
    const rawText = typeof req.body?.text === 'string' ? req.body.text : '';
    const cleanText = rawText.replace(/\s+/g, ' ').trim();

    if (!cleanText || cleanText.length > MAX_TTS_CHARS) {
      res.status(400).json({
        error: 'INVALID_TEXT',
        message: 'Text must be between 1 and 400 characters.',
      });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'GEMINI_API_KEY_MISSING',
        message: 'GEMINI_API_KEY is not configured on the server.',
      });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: cleanText,
                speechMetadata: {
                  style: 'Clear, warm, natural English language tutor with crisp articulation',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const part = response.candidates?.[0]?.content?.parts?.[0];
      const audioBase64 = part?.inlineData?.data;
      const mimeType = part?.inlineData?.mimeType || 'audio/wav';

      if (!audioBase64) {
        res.status(502).json({
          error: 'EMPTY_AUDIO_RESPONSE',
          message: 'No audio payload returned from Gemini TTS.',
        });
        return;
      }

      res.json({ audioBase64, mimeType });
    } catch (err: unknown) {
      const status =
        typeof (err as { status?: number })?.status === 'number'
          ? (err as { status: number }).status
          : 500;
      const message =
        err instanceof Error ? err.message : 'Failed to synthesize speech.';
      console.error('Gemini TTS error:', message);
      res.status(status >= 400 && status < 600 ? status : 500).json({
        error: 'TTS_SYNTHESIS_FAILED',
        message,
      });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('/{*splat}', (_req, res) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, HOST, () => {
    console.log(`LingoFox server running at http://${HOST}:${PORT}`);
  });
}

void startServer();
