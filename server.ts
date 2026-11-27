import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { generateLayoutWithGemini, refineSectionWithGemini } from './lib/geminiService.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.post('/api/ai/generate-layout', async (req, res) => {
    try {
      const { prompt, stylePreset, accentPreference } = req.body as {
        prompt?: string;
        stylePreset?: string;
        accentPreference?: string;
      };

      if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 4) {
        res.status(400).json({ error: 'Mohon masukkan deskripsi website minimal 4 karakter.' });
        return;
      }

      const result = await generateLayoutWithGemini({
        prompt,
        stylePreset,
        accentPreference,
      });
      res.json(result);
    } catch (error) {
      console.error('Error generating layout:', error);
      const message =
        error instanceof Error ? error.message : 'Terjadi kesalahan saat menghasilkan tata letak AI.';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/ai/refine-section', async (req, res) => {
    try {
      const { section, instruction } = req.body as {
        section?: Record<string, unknown>;
        instruction?: string;
      };

      if (!section || !instruction || instruction.trim().length < 2) {
        res.status(400).json({ error: 'Instruksi penyempurnaan blok tidak boleh kosong.' });
        return;
      }

      const updated = await refineSectionWithGemini({ section, instruction });
      res.json({ updated });
    } catch (error) {
      console.error('Error refining section:', error);
      const message =
        error instanceof Error ? error.message : 'Gagal menyempurnakan blok dengan AI.';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Rancang Studio server running at http://localhost:${PORT}`);
  });
}

startServer();
