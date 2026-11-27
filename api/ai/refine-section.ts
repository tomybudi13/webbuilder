import { refineSectionWithGemini } from '../../lib/geminiService';

interface VercelRequest {
  method?: string;
  body?: {
    section?: Record<string, unknown>;
    instruction?: string;
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
    const { section, instruction } = req.body || {};
    if (!section || !instruction || typeof instruction !== 'string' || instruction.trim().length < 2) {
      res.status(400).json({ error: 'Instruksi penyempurnaan blok tidak boleh kosong.' });
      return;
    }

    const updated = await refineSectionWithGemini({ section, instruction });
    res.status(200).json({ updated });
  } catch (error) {
    console.error('Error refining section:', error);
    const message =
      error instanceof Error ? error.message : 'Gagal menyempurnakan blok dengan AI.';
    res.status(500).json({ error: message });
  }
}
