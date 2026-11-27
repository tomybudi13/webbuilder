import { generateLayoutWithGemini } from '../../lib/geminiService';

interface VercelRequest {
  method?: string;
  body?: {
    prompt?: string;
    stylePreset?: string;
    accentPreference?: string;
  };
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { prompt, stylePreset, accentPreference } = req.body || {};
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 4) {
      res.status(400).json({ error: 'Mohon masukkan deskripsi website minimal 4 karakter.' });
      return;
    }

    const result = await generateLayoutWithGemini({
      prompt,
      stylePreset,
      accentPreference,
    });
    res.status(200).json(result);
  } catch (error) {
    console.error('Error generating layout:', error);
    const message =
      error instanceof Error ? error.message : 'Terjadi kesalahan saat menghasilkan tata letak AI.';
    res.status(500).json({ error: message });
  }
}
