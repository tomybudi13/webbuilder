import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

const STUDIO_IMAGE_MAP: Record<string, string> = {
  studio: '/src/assets/images/template_studio_hero_1795784761051.jpg',
  product: '/src/assets/images/template_product_craft_1795784760376.jpg',
  culinary: '/src/assets/images/template_culinary_artisan_1795784761017.jpg',
  portrait: '/src/assets/images/template_founder_portrait_1795784760674.jpg',
};

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY belum dikonfigurasi pada server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function resolveImageKey(key?: string): string | undefined {
  if (!key) return undefined;
  const normalized = key.toLowerCase().trim();
  if (STUDIO_IMAGE_MAP[normalized]) return STUDIO_IMAGE_MAP[normalized];
  if (normalized.includes('food') || normalized.includes('coffee') || normalized.includes('kuliner')) {
    return STUDIO_IMAGE_MAP.culinary;
  }
  if (normalized.includes('prod') || normalized.includes('shop') || normalized.includes('tech')) {
    return STUDIO_IMAGE_MAP.product;
  }
  if (normalized.includes('person') || normalized.includes('team') || normalized.includes('portrait')) {
    return STUDIO_IMAGE_MAP.portrait;
  }
  return STUDIO_IMAGE_MAP.studio;
}

const layoutResponseSchema = {
  type: Type.OBJECT,
  properties: {
    projectTitle: {
      type: Type.STRING,
      description: 'Judul singkat proyek halaman web.',
    },
    theme: {
      type: Type.OBJECT,
      properties: {
        accentId: {
          type: Type.STRING,
          description: 'Pilih tepat satu: cobalt, emerald, slate, atau amber.',
        },
        fontPairing: {
          type: Type.STRING,
          description: 'Pilih tepat satu: jakarta-dm, playfair-public, atau outfit-dm.',
        },
        radius: {
          type: Type.STRING,
          description: 'Pilih tepat satu: sharp, rounded, atau soft.',
        },
      },
      required: ['accentId', 'fontPairing', 'radius'],
    },
    sections: {
      type: Type.ARRAY,
      description: 'Daftar blok tata letak halaman dari atas ke bawah (5 sampai 7 blok).',
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            description:
              'Tipe blok: navbar, hero, features, split, pricing, testimonials, faq, cta, atau footer.',
          },
          label: {
            type: Type.STRING,
            description: 'Label pendek blok dalam bahasa Indonesia.',
          },
          variant: {
            type: Type.STRING,
            description:
              'Varian tata letak: default, centered, split-left, split-right, columns-2, atau columns-3.',
          },
          surface: {
            type: Type.STRING,
            description: 'Warna latar blok: light, muted, atau dark.',
          },
          spacing: {
            type: Type.STRING,
            description: 'Jarak vertikal: compact, standard, atau spacious.',
          },
          align: {
            type: Type.STRING,
            description: 'Perataan teks: left atau center.',
          },
          brandName: { type: Type.STRING },
          kicker: { type: Type.STRING },
          title: { type: Type.STRING },
          subtitle: { type: Type.STRING },
          body: { type: Type.STRING },
          primaryCta: { type: Type.STRING },
          secondaryCta: { type: Type.STRING },
          imageKey: {
            type: Type.STRING,
            description: 'Kunci gambar jika blok memerlukan foto: studio, product, culinary, atau portrait.',
          },
          imageAlt: { type: Type.STRING },
          links: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                href: { type: Type.STRING },
              },
              required: ['label', 'href'],
            },
          },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                meta: { type: Type.STRING },
                price: { type: Type.STRING },
                ctaLabel: { type: Type.STRING },
                highlighted: { type: Type.BOOLEAN },
                features: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['title', 'description'],
            },
          },
        },
        required: ['type', 'label', 'variant', 'surface', 'spacing', 'align', 'title'],
      },
    },
  },
  required: ['projectTitle', 'theme', 'sections'],
};

const singleSectionSchema = {
  type: Type.OBJECT,
  properties: {
    variant: { type: Type.STRING },
    surface: { type: Type.STRING },
    align: { type: Type.STRING },
    kicker: { type: Type.STRING },
    title: { type: Type.STRING },
    subtitle: { type: Type.STRING },
    body: { type: Type.STRING },
    primaryCta: { type: Type.STRING },
    secondaryCta: { type: Type.STRING },
    brandName: { type: Type.STRING },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          meta: { type: Type.STRING },
          price: { type: Type.STRING },
          ctaLabel: { type: Type.STRING },
          highlighted: { type: Type.BOOLEAN },
          features: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['title', 'description'],
      },
    },
  },
  required: ['title'],
};

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

      const ai = getGeminiClient();
      const systemInstruction = [
        'Anda adalah arsitek UI/UX dan copywriter senior untuk Rancang Studio.',
        'Tugas Anda adalah menghasilkan tata letak halaman web yang terstruktur rapi, realistis, dan siap pakai dalam JSON.',
        'Gunakan bahasa Indonesia yang natural, profesional, ringkas, dan tidak klise (hindari kata-kata hiperbola seperti "revolusioner" atau "terbaik di dunia").',
        'Jangan sertakan emoji, sintaks komentar kode seperti //, atau tag versi palsu.',
        'Pastikan urutan blok logis: mulai dengan navbar, diikuti hero, lalu blok isi (features, split, pricing, testimonials, faq), cta, dan akhiri dengan footer.',
        'Untuk hero, split, atau testimonials, isi imageKey dengan salah satu dari: studio, product, culinary, portrait sesuai topik.',
        'Gunakan variasi surface (light, muted, dark) secara seimbang agar ritme visual kontras dan nyaman dibaca.',
      ].join(' ');

      const userPrompt = [
        `Permintaan pengguna: ${prompt.trim()}`,
        stylePreset ? `Preferensi gaya desain: ${stylePreset}` : '',
        accentPreference && accentPreference !== 'auto'
          ? `Wajib gunakan accentId: ${accentPreference}`
          : '',
      ]
        .filter(Boolean)
        .join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: layoutResponseSchema,
        },
      });

      const rawText = response.text;
      if (!rawText) {
        res.status(502).json({ error: 'Model AI tidak mengembalikan respons tata letak.' });
        return;
      }

      const parsed = JSON.parse(rawText);
      const accentHexMap: Record<string, string> = {
        cobalt: '#2563EB',
        emerald: '#059669',
        slate: '#0F172A',
        amber: '#D97706',
      };

      const accentId = accentHexMap[parsed.theme?.accentId] ? parsed.theme.accentId : 'cobalt';
      const fontPairing = ['jakarta-dm', 'playfair-public', 'outfit-dm'].includes(
        parsed.theme?.fontPairing
      )
        ? parsed.theme.fontPairing
        : 'jakarta-dm';
      const radius = ['sharp', 'rounded', 'soft'].includes(parsed.theme?.radius)
        ? parsed.theme.radius
        : 'rounded';

      const normalizedSections = (Array.isArray(parsed.sections) ? parsed.sections : []).map(
        (sec: Record<string, unknown>, idx: number) => {
          const validTypes = [
            'navbar',
            'hero',
            'features',
            'split',
            'pricing',
            'testimonials',
            'faq',
            'cta',
            'footer',
          ];
          const secType = validTypes.includes(String(sec.type)) ? String(sec.type) : 'features';
          const imageUrl =
            secType === 'hero' || secType === 'split' || secType === 'testimonials'
              ? resolveImageKey(typeof sec.imageKey === 'string' ? sec.imageKey : undefined)
              : undefined;

          const rawItems = Array.isArray(sec.items) ? sec.items : undefined;
          const items = rawItems?.map((item: Record<string, unknown>, itemIdx: number) => ({
            id: `ai_item_${idx}_${itemIdx}_${Math.random().toString(36).slice(2, 6)}`,
            title: String(item.title || 'Poin Utama'),
            description: String(item.description || ''),
            meta: item.meta ? String(item.meta) : undefined,
            price: item.price ? String(item.price) : undefined,
            ctaLabel: item.ctaLabel ? String(item.ctaLabel) : undefined,
            highlighted: Boolean(item.highlighted),
            features: Array.isArray(item.features) ? item.features.map(String) : undefined,
          }));

          return {
            id: `ai_sec_${idx}_${Math.random().toString(36).slice(2, 7)}`,
            type: secType,
            label: String(sec.label || secType),
            variant: sec.variant || 'default',
            surface: ['light', 'muted', 'dark'].includes(String(sec.surface))
              ? sec.surface
              : 'light',
            spacing: ['compact', 'standard', 'spacious'].includes(String(sec.spacing))
              ? sec.spacing
              : 'standard',
            align: sec.align === 'center' ? 'center' : 'left',
            brandName: sec.brandName ? String(sec.brandName) : undefined,
            kicker: sec.kicker ? String(sec.kicker) : undefined,
            title: String(sec.title || 'Judul Bagian'),
            subtitle: sec.subtitle ? String(sec.subtitle) : undefined,
            body: sec.body ? String(sec.body) : undefined,
            primaryCta: sec.primaryCta ? String(sec.primaryCta) : undefined,
            secondaryCta: sec.secondaryCta ? String(sec.secondaryCta) : undefined,
            imageUrl,
            imageAlt: sec.imageAlt ? String(sec.imageAlt) : undefined,
            links: Array.isArray(sec.links) ? sec.links : undefined,
            items,
          };
        }
      );

      res.json({
        projectTitle: parsed.projectTitle || 'Halaman AI Baru',
        theme: {
          accentId,
          accentColor: accentHexMap[accentId],
          fontPairing,
          radius,
        },
        sections: normalizedSections,
      });
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

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Blok saat ini (JSON):\n${JSON.stringify(section)}\n\nInstruksi perubahan dari pengguna:\n${instruction.trim()}`,
        config: {
          systemInstruction:
            'Perbarui konten dan properti blok halaman web berikut sesuai instruksi pengguna. Pertahankan struktur tipe blok yang sama dan gunakan bahasa Indonesia yang jernih dan persuasif tanpa emoji atau prefix kode.',
          responseMimeType: 'application/json',
          responseSchema: singleSectionSchema,
        },
      });

      const rawText = response.text;
      if (!rawText) {
        res.status(502).json({ error: 'Model AI tidak mengembalikan pembaruan blok.' });
        return;
      }

      const updated = JSON.parse(rawText);
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
