import JSZip from 'jszip';
import { BuilderProject } from '../types/builder';

export interface ExportFileEntry {
  path: string;
  content: string;
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'proyek-rancang'
  );
}

export function buildProjectFiles(project: BuilderProject): ExportFileEntry[] {
  const appSlug = slugify(project.title);

  const packageJson = JSON.stringify(
    {
      name: appSlug,
      private: true,
      version: '0.1.0',
      type: 'module',
      scripts: {
        dev: 'vite --port=3000 --host=0.0.0.0',
        build: 'vite build',
        preview: 'vite preview',
        lint: 'tsc --noEmit',
      },
      dependencies: {
        '@tailwindcss/vite': '^4.3.3',
        '@vitejs/plugin-react': '^6.1.1',
        'lucide-react': '^0.546.0',
        react: '^19.0.1',
        'react-dom': '^19.0.1',
        vite: '^8.3.0',
      },
      devDependencies: {
        '@types/react': '^19.3.0',
        '@types/react-dom': '^19.3.0',
        tailwindcss: '^4.3.3',
        typescript: '^5.8.0',
      },
    },
    null,
    2
  );

  const metadataJson = JSON.stringify(
    {
      name: project.title || 'Proyek Web Rancang Studio',
      description: `Website yang dibangun menggunakan Rancang Studio (${project.sections.length} blok).`,
      requestFramePermissions: [],
    },
    null,
    2
  );

  const tsconfigJson = JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2022',
        useDefineForClassFields: false,
        module: 'ESNext',
        types: ['vite/client'],
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        skipLibCheck: true,
        moduleResolution: 'bundler',
        isolatedModules: true,
        moduleDetection: 'force',
        allowJs: true,
        jsx: 'react-jsx',
        paths: {
          '@/*': ['./*'],
        },
        allowImportingTsExtensions: true,
        noEmit: true,
      },
      exclude: ['dist'],
    },
    null,
    2
  );

  const viteConfigTs = `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'copy-unbundled-src-assets',
      apply: 'build',
      closeBundle(error?: Error): void {
        if (error) return;
        const distDir = path.resolve(__dirname, 'dist');
        const srcAssets = path.resolve(__dirname, 'src/assets');
        const distAssets = path.resolve(distDir, 'src/assets');
        if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
          fs.cpSync(srcAssets, distAssets, { recursive: true, force: true });
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
`;

  const gitignore = `node_modules
dist
.DS_Store
*.local
`;

  const envExample = `# Environment Variables
APP_URL="http://localhost:3000"
`;

  const readmeMd = `# ${project.title}

Proyek React + TypeScript + Tailwind CSS yang diekspor dari **Rancang Studio**.

## Menjalankan Secara Lokal

\`\`\`bash
npm install
npm run dev
\`\`\`

## Build Produksi

\`\`\`bash
npm run build
\`\`\`
`;

  const indexHtml = `<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${project.title}</title>
    <meta name="description" content="Dibangun dengan Rancang Studio." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@500;600;700&family=Playfair+Display:wght@500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700&family=Public+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
  </head>
  <body class="bg-white text-slate-900 antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

  const indexCss = `@import "tailwindcss";

.tabular-nums {
  font-variant-numeric: tabular-nums;
}
`;

  const mainTsx = `import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
`;

  const pageDataTs = `export interface NavLinkItem {
  label: string;
  href: string;
  icon?: string;
}

export interface SectionItem {
  id: string;
  title: string;
  description: string;
  meta?: string;
  price?: string;
  ctaLabel?: string;
  icon?: string;
  features?: string[];
  highlighted?: boolean;
}

export interface ElementTransform {
  x: number;
  y: number;
  scale?: number;
  widthPct?: number;
  fontSizeDelta?: number;
}

export interface FloatingCanvasElement {
  id: string;
  kind: 'text' | 'icon' | 'button' | 'image';
  x: number;
  y: number;
  text?: string;
  icon?: string;
  imageUrl?: string;
  buttonShape?: 'square' | 'rounded' | 'pill' | 'outline' | 'pill-outline' | 'soft' | 'ghost';
  fontSize?: number;
  width?: number;
  color?: string;
}

export interface PageSection {
  id: string;
  type: 'navbar' | 'hero' | 'features' | 'split' | 'pricing' | 'testimonials' | 'faq' | 'cta' | 'footer';
  label: string;
  variant: string;
  surface: 'light' | 'muted' | 'dark';
  spacing: 'compact' | 'standard' | 'spacious';
  align: 'left' | 'center';
  brandName?: string;
  brandIcon?: string;
  kicker?: string;
  title: string;
  subtitle?: string;
  body?: string;
  primaryCta?: string;
  ctaIcon?: string;
  secondaryCta?: string;
  buttonShape?: 'square' | 'rounded' | 'pill' | 'outline' | 'pill-outline' | 'soft' | 'ghost';
  navLinkStyle?: 'plain' | 'underline' | 'boxed' | 'pill';
  imageUrl?: string;
  imageAlt?: string;
  backgroundImage?: string;
  backgroundOverlay?: 'none' | 'dark' | 'light';
  backgroundPattern?: 'none' | 'grid' | 'dots' | 'gradient-soft' | 'gradient-warm';
  links?: NavLinkItem[];
  items?: SectionItem[];
  elementTransforms?: Record<string, ElementTransform>;
  floatingElements?: FloatingCanvasElement[];
}

export interface PageTheme {
  accentId: 'cobalt' | 'emerald' | 'slate' | 'amber';
  accentColor: string;
  fontPairing: 'jakarta-dm' | 'playfair-public' | 'outfit-dm';
  radius: 'sharp' | 'rounded' | 'soft';
  buttonShape: 'square' | 'rounded' | 'pill' | 'outline' | 'pill-outline' | 'soft' | 'ghost';
}

export const PAGE_PROJECT: {
  title: string;
  theme: PageTheme;
  sections: PageSection[];
} = ${JSON.stringify(project, null, 2)};
`;

  const pageSectionsTsx = `import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronDown,
  Clock,
  Code2,
  Coffee,
  Compass,
  Cpu,
  Globe,
  Layers,
  Lock,
  Mail,
  MapPin,
  Palette,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';
import { PageSection, PageTheme } from '../data/pageData';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  layers: Layers,
  compass: Compass,
  sparkles: Sparkles,
  star: Star,
  award: Award,
  'check-circle': CheckCircle2,
  briefcase: Briefcase,
  building: Building2,
  coffee: Coffee,
  camera: Camera,
  clock: Clock,
  'map-pin': MapPin,
  palette: Palette,
  code: Code2,
  cpu: Cpu,
  globe: Globe,
  shield: ShieldCheck,
  lock: Lock,
  zap: Zap,
  'arrow-right': ArrowRight,
  send: Send,
  calendar: Calendar,
  phone: Phone,
  mail: Mail,
};

function renderIcon(id?: string, className = 'w-4 h-4') {
  if (!id) return null;
  const Comp = ICON_MAP[id];
  return Comp ? <Comp className={className} /> : null;
}

const ACCENT_MAP = {
  cobalt: { hex: '#2563EB', softBg: '#EFF6FF', softText: '#1D4ED8' },
  emerald: { hex: '#059669', softBg: '#ECFDF5', softText: '#047857' },
  slate: { hex: '#0F172A', softBg: '#F1F5F9', softText: '#0F172A' },
  amber: { hex: '#D97706', softBg: '#FFFBEB', softText: '#B45309' },
};

const FONT_MAP = {
  'jakarta-dm': {
    heading: '"Plus Jakarta Sans", sans-serif',
    body: '"DM Sans", sans-serif',
  },
  'playfair-public': {
    heading: '"Playfair Display", serif',
    body: '"Public Sans", sans-serif',
  },
  'outfit-dm': {
    heading: '"Outfit", sans-serif',
    body: '"DM Sans", sans-serif',
  },
};

function getButtonProps(
  shape: PageTheme['buttonShape'],
  accentHex: string,
  softBg: string,
  softText: string,
  isDark: boolean,
  compact = false
) {
  const pad = compact ? 'px-4 py-2 text-xs' : 'px-5 py-2.5 text-sm';
  const base = \`\${pad} font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-opacity hover:opacity-90\`;
  switch (shape) {
    case 'square':
      return { className: \`\${base} rounded-none text-white\`, style: { backgroundColor: accentHex } };
    case 'pill':
      return { className: \`\${base} rounded-full text-white\`, style: { backgroundColor: accentHex } };
    case 'outline':
      return {
        className: \`\${base} rounded-lg border-2\`,
        style: { borderColor: isDark ? '#f8fafc' : accentHex, color: isDark ? '#f8fafc' : accentHex },
      };
    case 'pill-outline':
      return {
        className: \`\${base} rounded-full border-2\`,
        style: { borderColor: isDark ? '#f8fafc' : accentHex, color: isDark ? '#f8fafc' : accentHex },
      };
    case 'soft':
      return {
        className: \`\${base} rounded-lg\`,
        style: {
          backgroundColor: isDark ? 'rgba(255,255,255,0.14)' : softBg,
          color: isDark ? '#ffffff' : softText,
        },
      };
    case 'ghost':
      return {
        className: \`\${base} rounded-md underline underline-offset-4 decoration-2\`,
        style: { color: isDark ? '#f8fafc' : accentHex },
      };
    default:
      return { className: \`\${base} rounded-lg text-white\`, style: { backgroundColor: accentHex } };
  }
}

export const PageSections: React.FC<{ section: PageSection; theme: PageTheme }> = ({
  section,
  theme,
}) => {
  const [openFaq, setOpenFaq] = useState<Record<string, boolean>>({});
  const fonts = FONT_MAP[theme.fontPairing] || FONT_MAP['jakarta-dm'];
  const accent = ACCENT_MAP[theme.accentId] || ACCENT_MAP.cobalt;
  const hasBg = Boolean(section.backgroundImage);
  const isDark =
    hasBg && section.backgroundOverlay === 'dark'
      ? true
      : hasBg && section.backgroundOverlay === 'light'
        ? false
        : section.surface === 'dark';

  const rad =
    theme.radius === 'sharp' ? 'rounded-none' : theme.radius === 'soft' ? 'rounded-2xl' : 'rounded-lg';

  const surface = isDark
    ? {
        bg: 'bg-slate-950',
        text: 'text-slate-50',
        muted: 'text-slate-300',
        border: 'border-slate-800',
        card: hasBg ? 'bg-slate-900/85' : 'bg-slate-900',
      }
    : section.surface === 'muted'
      ? {
          bg: 'bg-slate-50',
          text: 'text-slate-900',
          muted: 'text-slate-600',
          border: 'border-slate-200',
          card: hasBg ? 'bg-white/90' : 'bg-white',
        }
      : {
          bg: 'bg-white',
          text: 'text-slate-900',
          muted: 'text-slate-600',
          border: 'border-slate-200',
          card: hasBg ? 'bg-white/90' : 'bg-slate-50',
        };

  const pad =
    section.spacing === 'compact'
      ? 'py-6'
      : section.spacing === 'spacious'
        ? 'py-16 md:py-24'
        : 'py-14 md:py-20';

  const btnShape = section.buttonShape || theme.buttonShape || 'rounded';
  const primaryBtn = getButtonProps(
    btnShape,
    accent.hex,
    accent.softBg,
    accent.softText,
    isDark,
    section.type === 'navbar'
  );
  const secBtnRad =
    btnShape === 'pill' || btnShape === 'pill-outline'
      ? 'rounded-full'
      : btnShape === 'square'
        ? 'rounded-none'
        : 'rounded-lg';

  const navLinkClass =
    section.navLinkStyle === 'underline'
      ? \`text-sm font-medium \${surface.muted} hover:underline underline-offset-4 whitespace-nowrap\`
      : section.navLinkStyle === 'boxed'
        ? \`px-3 py-1.5 text-xs font-medium rounded-md border \${surface.border} whitespace-nowrap\`
        : section.navLinkStyle === 'pill'
          ? \`px-3.5 py-1.5 text-xs font-medium rounded-full \${isDark ? 'bg-slate-800' : 'bg-slate-100'} whitespace-nowrap\`
          : \`text-sm font-medium \${surface.muted} hover:opacity-80 whitespace-nowrap\`;

  const trStyle = (
    key: string,
    extra?: React.CSSProperties,
    opts?: { baseFontPx?: number; allowWidth?: boolean }
  ): React.CSSProperties | undefined => {
    const t = section.elementTransforms?.[key];
    if (!t && !extra) return undefined;
    const style: React.CSSProperties = { ...extra };
    if (t) {
      if (t.x || t.y) {
        style.transform = \`translate(\${t.x || 0}px, \${t.y || 0}px)\`;
      }
      if (opts?.allowWidth && t.widthPct && t.widthPct !== 100) {
        style.width = \`\${t.widthPct}%\`;
      }
      if (opts?.baseFontPx && t.fontSizeDelta) {
        style.fontSize = \`\${Math.max(11, opts.baseFontPx + t.fontSizeDelta)}px\`;
      }
    }
    return Object.keys(style).length > 0 ? style : undefined;
  };

  return (
    <div
      style={{ fontFamily: fonts.body }}
      className={\`relative overflow-hidden \${surface.bg} \${surface.text} border-b \${surface.border}\`}
    >
      {hasBg && (
        <>
          <img
            src={section.backgroundImage}
            alt="Latar belakang"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
          {section.backgroundOverlay === 'dark' && (
            <div className="absolute inset-0 bg-slate-950/65 pointer-events-none" />
          )}
          {section.backgroundOverlay === 'light' && (
            <div className="absolute inset-0 bg-white/80 pointer-events-none" />
          )}
        </>
      )}

      {(section.floatingElements || []).map((el) => {
        const floatBtn = getButtonProps(
          el.buttonShape || btnShape,
          accent.hex,
          accent.softBg,
          accent.softText,
          isDark,
          true
        );
        const posStyle: React.CSSProperties = {
          position: 'absolute',
          left: 0,
          top: 0,
          zIndex: 25,
          transform: \`translate(\${el.x || 0}px, \${el.y || 0}px)\`,
        };
        if (el.kind === 'text') {
          return (
            <div
              key={el.id}
              style={{
                ...posStyle,
                fontFamily: fonts.heading,
                fontSize: \`\${Math.max(12, 18 + (el.fontSize || 0))}px\`,
              }}
              className="font-semibold px-2 py-1"
            >
              {el.text || 'Teks Baru'}
            </div>
          );
        }
        if (el.kind === 'button') {
          return (
            <a key={el.id} href="#aksi" style={{ ...posStyle, ...floatBtn.style }} className={floatBtn.className}>
              {el.text || 'Klik Di Sini'}
            </a>
          );
        }
        if (el.kind === 'icon') {
          return (
            <div
              key={el.id}
              style={{ ...posStyle, color: el.color || accent.hex }}
              className="p-2 rounded-lg bg-white/85 border border-slate-200 shadow-xs"
            >
              {renderIcon(el.icon || 'sparkles', 'w-7 h-7')}
            </div>
          );
        }
        return (
          <div
            key={el.id}
            style={{ ...posStyle, width: \`\${Math.max(120, Math.round(((el.width || 100) / 100) * 220))}px\` }}
          >
            <img
              src={el.imageUrl || ''}
              alt="Gambar bebas"
              referrerPolicy="no-referrer"
              className={\`w-full h-36 object-cover \${rad} border \${surface.border} shadow-sm\`}
            />
          </div>
        );
      })}

      <div className="relative z-10">
        {section.type === 'navbar' && (
          <header className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
            <a
              href="#"
              style={trStyle('brand', { fontFamily: fonts.heading })}
              className="text-lg font-bold tracking-tight whitespace-nowrap flex items-center gap-2"
            >
              {section.brandIcon && (
                <span style={{ color: accent.hex }}>{renderIcon(section.brandIcon, 'w-5 h-5')}</span>
              )}
              <span>{section.brandName}</span>
            </a>
            <nav className="hidden md:flex items-center gap-4">
              {(section.links || []).map((l, idx) => (
                <a key={idx} href={l.href} style={trStyle(\`link_\${idx}\`)} className={navLinkClass}>
                  {l.label}
                </a>
              ))}
            </nav>
            {section.primaryCta && (
              <a href="#kontak" style={trStyle('navCta', primaryBtn.style)} className={primaryBtn.className}>
                <span>{section.primaryCta}</span>
                {renderIcon(section.ctaIcon, 'w-3.5 h-3.5')}
              </a>
            )}
          </header>
        )}

        {section.type === 'hero' && (
          <section className={\`max-w-6xl mx-auto px-6 \${pad}\`}>
            {section.variant === 'centered' || !section.imageUrl ? (
              <div className="max-w-3xl mx-auto text-center">
                {section.kicker && (
                  <p className="text-xs font-semibold tracking-wide mb-3" style={trStyle('kicker', { color: isDark ? '#93c5fd' : accent.hex }, { baseFontPx: 12 })}>
                    {section.kicker}
                  </p>
                )}
                <h1 style={trStyle('title', { fontFamily: fonts.heading }, { baseFontPx: 44 })} className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
                  {section.title}
                </h1>
                {section.subtitle && (
                  <p style={trStyle('subtitle', undefined, { baseFontPx: 17 })} className={\`text-base md:text-lg \${surface.muted} max-w-2xl mx-auto mb-8 leading-relaxed\`}>
                    {section.subtitle}
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {section.primaryCta && (
                    <a href="#aksi" style={trStyle('primaryCta', primaryBtn.style)} className={primaryBtn.className}>
                      <span>{section.primaryCta}</span>
                      {renderIcon(section.ctaIcon, 'w-4 h-4')}
                    </a>
                  )}
                  {section.secondaryCta && (
                    <a href="#detail" style={trStyle('secondaryCta')} className={\`px-5 py-2.5 text-sm font-semibold border \${surface.border} \${secBtnRad}\`}>
                      {section.secondaryCta}
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className={\`lg:col-span-6 \${section.variant === 'split-left' ? 'lg:order-2' : ''}\`}>
                  {section.kicker && (
                    <p className="text-xs font-semibold tracking-wide mb-3" style={trStyle('kicker', { color: isDark ? '#93c5fd' : accent.hex }, { baseFontPx: 12 })}>
                      {section.kicker}
                    </p>
                  )}
                  <h1 style={trStyle('title', { fontFamily: fonts.heading }, { baseFontPx: 42 })} className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                    {section.title}
                  </h1>
                  {section.subtitle && (
                    <p style={trStyle('subtitle', undefined, { baseFontPx: 16 })} className={\`text-base \${surface.muted} mb-7 leading-relaxed\`}>{section.subtitle}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3">
                    {section.primaryCta && (
                      <a href="#aksi" style={trStyle('primaryCta', primaryBtn.style)} className={primaryBtn.className}>
                        <span>{section.primaryCta}</span>
                        {renderIcon(section.ctaIcon, 'w-4 h-4')}
                      </a>
                    )}
                    {section.secondaryCta && (
                      <a href="#detail" style={trStyle('secondaryCta')} className={\`px-5 py-2.5 text-sm font-semibold border \${surface.border} \${secBtnRad}\`}>
                        {section.secondaryCta}
                      </a>
                    )}
                  </div>
                </div>
                <div style={trStyle('image', undefined, { allowWidth: true })} className={\`lg:col-span-6 \${section.variant === 'split-left' ? 'lg:order-1' : ''}\`}>
                  <img
                    src={section.imageUrl}
                    alt={section.imageAlt || section.title}
                    referrerPolicy="no-referrer"
                    className={\`w-full h-80 md:h-[400px] object-cover \${rad} border \${surface.border}\`}
                  />
                </div>
              </div>
            )}
          </section>
        )}

        {section.type === 'features' && (
          <section className={\`max-w-6xl mx-auto px-6 \${pad}\`}>
            <div className={\`\${section.align === 'center' ? 'text-center mx-auto' : ''} max-w-2xl mb-10\`}>
              {section.kicker && (
                <p className="text-xs font-semibold tracking-wide mb-2" style={trStyle('kicker', { color: isDark ? '#93c5fd' : accent.hex })}>
                  {section.kicker}
                </p>
              )}
              <h2 style={trStyle('title', { fontFamily: fonts.heading }, { baseFontPx: 30 })} className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                {section.title}
              </h2>
              {section.subtitle && <p style={trStyle('subtitle')} className={\`text-sm md:text-base \${surface.muted}\`}>{section.subtitle}</p>}
            </div>
            <div className={\`grid grid-cols-1 \${section.variant === 'columns-2' ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6\`}>
              {(section.items || []).map((item) => (
                <div key={item.id} style={trStyle(\`item_\${item.id}\`)} className={\`p-6 border \${surface.border} \${surface.card} \${rad}\`}>
                  {item.icon && (
                    <div
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : accent.softBg,
                        color: isDark ? '#ffffff' : accent.hex,
                      }}
                      className={\`w-9 h-9 \${rad} flex items-center justify-center mb-4\`}
                    >
                      {renderIcon(item.icon, 'w-4 h-4')}
                    </div>
                  )}
                  {item.meta && <p className={\`text-xs font-medium \${surface.muted} mb-2\`}>{item.meta}</p>}
                  <h3 style={{ fontFamily: fonts.heading }} className="text-lg font-semibold mb-2">
                    {item.title}
                  </h3>
                  <p className={\`text-sm \${surface.muted} leading-relaxed\`}>{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {section.type === 'split' && (
          <section className={\`max-w-6xl mx-auto px-6 \${pad}\`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div style={trStyle('image', undefined, { allowWidth: true })} className={\`lg:col-span-6 \${section.variant === 'split-right' ? 'lg:order-2' : ''}\`}>
                <img
                  src={section.imageUrl}
                  alt={section.imageAlt || section.title}
                  referrerPolicy="no-referrer"
                  className={\`w-full h-80 object-cover \${rad} border \${surface.border}\`}
                />
              </div>
              <div className={\`lg:col-span-6 \${section.variant === 'split-right' ? 'lg:order-1' : ''}\`}>
                {section.kicker && (
                  <p className="text-xs font-semibold tracking-wide mb-2" style={trStyle('kicker', { color: isDark ? '#93c5fd' : accent.hex })}>
                    {section.kicker}
                  </p>
                )}
                <h2 style={trStyle('title', { fontFamily: fonts.heading }, { baseFontPx: 30 })} className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                  {section.title}
                </h2>
                {section.body && <p style={trStyle('body')} className={\`text-base \${surface.muted} leading-relaxed mb-6\`}>{section.body}</p>}
                {section.primaryCta && (
                  <a href="#detail" style={trStyle('primaryCta', primaryBtn.style)} className={primaryBtn.className}>
                    <span>{section.primaryCta}</span>
                    {renderIcon(section.ctaIcon, 'w-4 h-4')}
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {section.type === 'pricing' && (
          <section className={\`max-w-6xl mx-auto px-6 \${pad}\`}>
            <div className={\`\${section.align === 'center' ? 'text-center mx-auto' : ''} max-w-2xl mb-10\`}>
              {section.kicker && (
                <p className="text-xs font-semibold tracking-wide mb-2" style={trStyle('kicker', { color: isDark ? '#93c5fd' : accent.hex })}>
                  {section.kicker}
                </p>
              )}
              <h2 style={trStyle('title', { fontFamily: fonts.heading }, { baseFontPx: 30 })} className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                {section.title}
              </h2>
              {section.subtitle && <p style={trStyle('subtitle')} className={\`text-sm md:text-base \${surface.muted}\`}>{section.subtitle}</p>}
            </div>
            <div className={\`grid grid-cols-1 \${section.variant === 'columns-2' ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6\`}>
              {(section.items || []).map((tier) => (
                <div
                  key={tier.id}
                  style={trStyle(
                    \`item_\${tier.id}\`,
                    tier.highlighted ? { borderColor: accent.hex, boxShadow: \`0 0 0 1px \${accent.hex}\` } : undefined
                  )}
                  className={\`p-6 border \${surface.border} \${surface.card} \${rad} flex flex-col justify-between\`}
                >
                  <div>
                    {tier.meta && <p className={\`text-xs font-medium \${surface.muted} mb-1\`}>{tier.meta}</p>}
                    <h3 style={{ fontFamily: fonts.heading }} className="text-lg font-bold">{tier.title}</h3>
                    <p style={{ fontFamily: fonts.heading }} className="text-3xl font-bold my-4 tabular-nums">
                      {tier.price}
                    </p>
                    <p className={\`text-sm \${surface.muted} mb-6\`}>{tier.description}</p>
                    {tier.features && (
                      <ul className="mb-6">
                        {tier.features.map((f, idx) => (
                          <li key={idx} className={\`text-sm \${surface.muted} py-2 border-t \${surface.border}\`}>{f}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <a
                    href="#pilih"
                    style={tier.highlighted ? primaryBtn.style : undefined}
                    className={
                      tier.highlighted
                        ? \`\${primaryBtn.className} w-full\`
                        : \`block text-center px-4 py-2.5 text-sm font-semibold border \${surface.border} \${secBtnRad}\`
                    }
                  >
                    {tier.ctaLabel || 'Pilih Paket'}
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {section.type === 'testimonials' && (
          <section className={\`max-w-6xl mx-auto px-6 \${pad}\`}>
            <h2 style={trStyle('title', { fontFamily: fonts.heading })} className="text-2xl md:text-3xl font-bold tracking-tight mb-8">
              {section.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(section.items || []).map((q) => (
                <blockquote key={q.id} style={trStyle(\`item_\${q.id}\`)} className={\`p-6 border \${surface.border} \${surface.card} \${rad}\`}>
                  <p className="text-base leading-relaxed mb-4">“{q.description}”</p>
                  <footer>
                    <div className="text-sm font-semibold">{q.title}</div>
                    {q.meta && <div className={\`text-xs \${surface.muted}\`}>{q.meta}</div>}
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>
        )}

        {section.type === 'faq' && (
          <section className={\`max-w-3xl mx-auto px-6 \${pad}\`}>
            <h2 style={trStyle('title', { fontFamily: fonts.heading })} className="text-2xl md:text-3xl font-bold tracking-tight mb-8">
              {section.title}
            </h2>
            <div className={\`border-t \${surface.border}\`}>
              {(section.items || []).map((item) => {
                const isOpen = Boolean(openFaq[item.id]);
                return (
                  <div key={item.id} className={\`border-b \${surface.border}\`}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq((p) => ({ ...p, [item.id]: !p[item.id] }))}
                      className="w-full py-4 text-left flex items-center justify-between gap-4 font-semibold text-base"
                    >
                      <span>{item.title}</span>
                      <ChevronDown className={\`w-4 h-4 transition-transform \${isOpen ? 'rotate-180' : ''}\`} />
                    </button>
                    {isOpen && <p className={\`pb-4 text-sm \${surface.muted} leading-relaxed\`}>{item.description}</p>}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {section.type === 'cta' && (
          <section className={\`max-w-4xl mx-auto px-6 \${pad} text-center\`}>
            {section.kicker && (
              <p className="text-xs font-semibold tracking-wide mb-3" style={trStyle('kicker', { color: isDark ? '#93c5fd' : accent.hex })}>
                {section.kicker}
              </p>
            )}
            <h2 style={trStyle('title', { fontFamily: fonts.heading }, { baseFontPx: 36 })} className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {section.title}
            </h2>
            {section.subtitle && (
              <p style={trStyle('subtitle')} className={\`text-base \${surface.muted} max-w-xl mx-auto mb-8\`}>{section.subtitle}</p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {section.primaryCta && (
                <a href="#mulai" style={trStyle('primaryCta', primaryBtn.style)} className={primaryBtn.className}>
                  <span>{section.primaryCta}</span>
                  {renderIcon(section.ctaIcon, 'w-4 h-4')}
                </a>
              )}
              {section.secondaryCta && (
                <a href="#info" style={trStyle('secondaryCta')} className={\`px-5 py-2.5 text-sm font-semibold border \${surface.border} \${secBtnRad}\`}>
                  {section.secondaryCta}
                </a>
              )}
            </div>
          </section>
        )}

        {section.type === 'footer' && (
          <footer className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div style={trStyle('brand', { fontFamily: fonts.heading })} className="font-bold text-base mb-1 flex items-center gap-2">
                {section.brandIcon && (
                  <span style={{ color: accent.hex }}>{renderIcon(section.brandIcon, 'w-4 h-4')}</span>
                )}
                <span>{section.brandName}</span>
              </div>
              <p style={trStyle('title')} className={\`text-xs \${surface.muted}\`}>{section.title}</p>
              {section.subtitle && <p style={trStyle('subtitle')} className={\`text-xs \${surface.muted} mt-1\`}>{section.subtitle}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-6">
              {(section.links || []).map((l, idx) => (
                <a key={idx} href={l.href} style={trStyle(\`link_\${idx}\`)} className={\`text-sm \${surface.muted} hover:opacity-80 whitespace-nowrap\`}>
                  {l.label}
                </a>
              ))}
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};
`;

  const appTsx = `import { PageSections } from './components/PageSections';
import { PAGE_PROJECT } from './data/pageData';

export default function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {PAGE_PROJECT.sections.map((section) => (
        <PageSections
          key={section.id}
          section={section}
          theme={PAGE_PROJECT.theme}
        />
      ))}
    </div>
  );
}
`;

  return [
    { path: '.env.example', content: envExample },
    { path: '.gitignore', content: gitignore },
    { path: 'README.md', content: readmeMd },
    { path: 'index.html', content: indexHtml },
    { path: 'metadata.json', content: metadataJson },
    { path: 'package.json', content: packageJson },
    { path: 'tsconfig.json', content: tsconfigJson },
    { path: 'vite.config.ts', content: viteConfigTs },
    { path: 'src/App.tsx', content: appTsx },
    { path: 'src/index.css', content: indexCss },
    { path: 'src/main.tsx', content: mainTsx },
    { path: 'src/data/pageData.ts', content: pageDataTs },
    { path: 'src/components/PageSections.tsx', content: pageSectionsTsx },
  ];
}

export async function generateProjectZipBlob(project: BuilderProject): Promise<Blob> {
  const zip = new JSZip();

  // Extract any user-uploaded data URLs into src/assets/images/ and clone project with rewritten paths
  const dataUrlToAssetPath = new Map<string, string>();
  let uploadCounter = 1;

  const normalizedProject: BuilderProject = {
    ...project,
    sections: project.sections.map((sec) => {
      let nextImageUrl = sec.imageUrl;
      let nextBgImage = sec.backgroundImage;

      if (nextImageUrl && nextImageUrl.startsWith('data:image/')) {
        if (!dataUrlToAssetPath.has(nextImageUrl)) {
          const extMatch = nextImageUrl.match(/^data:image\/([a-zA-Z0-9+]+);/);
          const ext = extMatch ? extMatch[1].replace('jpeg', 'jpg') : 'png';
          dataUrlToAssetPath.set(
            nextImageUrl,
            `/src/assets/images/uploaded_img_${uploadCounter++}.${ext}`
          );
        }
        nextImageUrl = dataUrlToAssetPath.get(nextImageUrl);
      }

      if (nextBgImage && nextBgImage.startsWith('data:image/')) {
        if (!dataUrlToAssetPath.has(nextBgImage)) {
          const extMatch = nextBgImage.match(/^data:image\/([a-zA-Z0-9+]+);/);
          const ext = extMatch ? extMatch[1].replace('jpeg', 'jpg') : 'png';
          dataUrlToAssetPath.set(
            nextBgImage,
            `/src/assets/images/uploaded_bg_${uploadCounter++}.${ext}`
          );
        }
        nextBgImage = dataUrlToAssetPath.get(nextBgImage);
      }

      const nextFloating = sec.floatingElements?.map((fe) => {
        let nextFeUrl = fe.imageUrl;
        if (nextFeUrl && nextFeUrl.startsWith('data:image/')) {
          if (!dataUrlToAssetPath.has(nextFeUrl)) {
            const extMatch = nextFeUrl.match(/^data:image\/([a-zA-Z0-9+]+);/);
            const ext = extMatch ? extMatch[1].replace('jpeg', 'jpg') : 'png';
            dataUrlToAssetPath.set(
              nextFeUrl,
              `/src/assets/images/uploaded_el_${uploadCounter++}.${ext}`
            );
          }
          nextFeUrl = dataUrlToAssetPath.get(nextFeUrl);
        }
        return nextFeUrl !== fe.imageUrl ? { ...fe, imageUrl: nextFeUrl } : fe;
      });

      return {
        ...sec,
        imageUrl: nextImageUrl,
        backgroundImage: nextBgImage,
        floatingElements: nextFloating,
      };
    }),
  };

  const files = buildProjectFiles(normalizedProject);
  for (const file of files) {
    zip.file(file.path, file.content);
  }

  // Write uploaded data URLs as binary image files
  for (const [dataUrl, assetPath] of dataUrlToAssetPath.entries()) {
    const base64 = dataUrl.split(',')[1];
    if (base64) {
      zip.file(assetPath.replace(/^\//, ''), base64, { base64: true });
    }
  }

  // Collect all local asset image paths referenced by sections and bundle them into src/assets/images/
  const assetPaths = new Set<string>();
  for (const sec of normalizedProject.sections) {
    if (sec.imageUrl && sec.imageUrl.startsWith('/src/assets/') && !dataUrlToAssetPath.has(sec.imageUrl)) {
      assetPaths.add(sec.imageUrl);
    }
    if (sec.backgroundImage && sec.backgroundImage.startsWith('/src/assets/')) {
      assetPaths.add(sec.backgroundImage);
    }
    for (const fe of sec.floatingElements || []) {
      if (fe.imageUrl && fe.imageUrl.startsWith('/src/assets/') && !dataUrlToAssetPath.has(fe.imageUrl)) {
        assetPaths.add(fe.imageUrl);
      }
    }
  }

  await Promise.all(
    Array.from(assetPaths).map(async (assetUrl) => {
      if (Array.from(dataUrlToAssetPath.values()).includes(assetUrl)) return;
      try {
        const res = await fetch(assetUrl);
        if (res.ok) {
          const buffer = await res.arrayBuffer();
          const zipPath = assetUrl.replace(/^\//, '');
          zip.file(zipPath, buffer);
        }
      } catch {
        // Ignore asset fetch error if offline
      }
    })
  );

  return zip.generateAsync({ type: 'blob' });
}
