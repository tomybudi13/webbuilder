import { ACCENT_PRESETS, FONT_PAIRINGS } from '../data/presets';
import { BuilderProject, BuilderSection, ButtonShape, NavLinkStyle } from '../types/builder';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getButtonHtmlClassAndStyle(
  shape: ButtonShape,
  accent: string,
  softBg: string,
  softText: string,
  isDark: boolean,
  compact = false
): { cls: string; style: string } {
  const pad = compact ? 'px-4 py-2 text-xs' : 'px-5 py-2.5 text-sm';
  const base = `${pad} font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap`;

  switch (shape) {
    case 'square':
      return { cls: `${base} rounded-none text-white`, style: `background-color:${accent}` };
    case 'pill':
      return { cls: `${base} rounded-full text-white`, style: `background-color:${accent}` };
    case 'outline':
      return {
        cls: `${base} rounded-lg border-2`,
        style: `border-color:${isDark ? '#f8fafc' : accent};color:${isDark ? '#f8fafc' : accent}`,
      };
    case 'pill-outline':
      return {
        cls: `${base} rounded-full border-2`,
        style: `border-color:${isDark ? '#f8fafc' : accent};color:${isDark ? '#f8fafc' : accent}`,
      };
    case 'soft':
      return {
        cls: `${base} rounded-lg`,
        style: `background-color:${isDark ? 'rgba(255,255,255,0.14)' : softBg};color:${isDark ? '#ffffff' : softText}`,
      };
    case 'ghost':
      return {
        cls: `${base} rounded-md underline underline-offset-4`,
        style: `color:${isDark ? '#f8fafc' : accent}`,
      };
    case 'rounded':
    default:
      return { cls: `${base} rounded-lg text-white`, style: `background-color:${accent}` };
  }
}

function getNavLinkHtmlClass(style: NavLinkStyle | undefined, mutedText: string, isDark: boolean): string {
  switch (style) {
    case 'underline':
      return `text-sm font-medium ${mutedText} hover:underline underline-offset-4 whitespace-nowrap`;
    case 'boxed':
      return `px-3 py-1.5 text-xs font-medium rounded-md border ${isDark ? 'border-slate-700 text-slate-200' : 'border-slate-200 text-slate-700'} whitespace-nowrap`;
    case 'pill':
      return `px-3.5 py-1.5 text-xs font-medium rounded-full ${isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'} whitespace-nowrap`;
    case 'plain':
    default:
      return `text-sm font-medium ${mutedText} hover:opacity-80 whitespace-nowrap`;
  }
}

function getSurfaceClasses(section: BuilderSection) {
  const hasBg = Boolean(section.backgroundImage);
  const isDark =
    hasBg && section.backgroundOverlay === 'dark'
      ? true
      : hasBg && section.backgroundOverlay === 'light'
        ? false
        : section.surface === 'dark';

  if (isDark) {
    return {
      isDark: true,
      bg: 'bg-slate-950',
      text: 'text-slate-50',
      mutedText: 'text-slate-300',
      border: 'border-slate-800',
      cardBg: hasBg ? 'bg-slate-900/85' : 'bg-slate-900',
    };
  }
  if (section.surface === 'muted') {
    return {
      isDark: false,
      bg: 'bg-slate-50',
      text: 'text-slate-900',
      mutedText: 'text-slate-600',
      border: 'border-slate-200',
      cardBg: hasBg ? 'bg-white/90' : 'bg-white',
    };
  }
  return {
    isDark: false,
    bg: 'bg-white',
    text: 'text-slate-900',
    mutedText: 'text-slate-600',
    border: 'border-slate-200',
    cardBg: hasBg ? 'bg-white/90' : 'bg-slate-50',
  };
}

function getSpacingClass(spacing: BuilderSection['spacing']): string {
  if (spacing === 'compact') return 'py-6';
  if (spacing === 'spacious') return 'py-20 md:py-28';
  return 'py-14 md:py-20';
}

function getRadiusClass(radius: BuilderProject['theme']['radius']): string {
  if (radius === 'sharp') return 'rounded-none';
  if (radius === 'soft') return 'rounded-2xl';
  return 'rounded-lg';
}

function renderBgLayers(section: BuilderSection): string {
  if (!section.backgroundImage) return '';
  const overlay =
    section.backgroundOverlay === 'dark'
      ? '<div class="absolute inset-0 bg-slate-950/65 pointer-events-none"></div>'
      : section.backgroundOverlay === 'light'
        ? '<div class="absolute inset-0 bg-white/80 pointer-events-none"></div>'
        : '';
  return `<img src="${escapeHtml(section.backgroundImage)}" alt="Latar belakang" referrerpolicy="no-referrer" class="absolute inset-0 w-full h-full object-cover pointer-events-none" />
    ${overlay}`;
}

function getElTransformStyle(
  section: BuilderSection,
  key: string,
  options?: { baseFontPx?: number; allowWidth?: boolean }
): string {
  const t = section.elementTransforms?.[key];
  if (!t) return '';
  const parts: string[] = [];
  if (t.x || t.y) {
    parts.push(`display:inline-block;transform:translate(${t.x || 0}px,${t.y || 0}px)`);
  }
  if (options?.allowWidth && t.widthPct && t.widthPct !== 100) {
    parts.push(`width:${t.widthPct}%`);
  }
  if (options?.baseFontPx && t.fontSizeDelta) {
    parts.push(`font-size:${Math.max(11, options.baseFontPx + t.fontSizeDelta)}px`);
  }
  return parts.join(';');
}

function renderFloatingElementsHtml(
  section: BuilderSection,
  accent: string,
  btn: { cls: string; style: string },
  rad: string,
  borderCls: string
): string {
  const list = section.floatingElements || [];
  if (list.length === 0) return '';
  return list
    .map((el) => {
      const posStyle = `position:absolute;left:0;top:0;z-index:25;transform:translate(${el.x || 0}px,${el.y || 0}px);`;
      if (el.kind === 'text') {
        const fs = Math.max(12, 18 + (el.fontSize || 0));
        return `<div style="${posStyle}font-size:${fs}px;" class="font-semibold heading-font px-2 py-1">${escapeHtml(el.text || 'Teks Baru')}</div>`;
      }
      if (el.kind === 'button') {
        return `<a href="#aksi" style="${posStyle}${btn.style}" class="${btn.cls}">${escapeHtml(el.text || 'Klik Di Sini')}</a>`;
      }
      if (el.kind === 'icon') {
        return `<div style="${posStyle}color:${escapeHtml(el.color || accent)};" class="p-2 rounded-lg bg-white/85 border border-slate-200 shadow-xs inline-flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg></div>`;
      }
      const wPx = Math.max(120, Math.round(((el.width || 100) / 100) * 220));
      return `<div style="${posStyle}width:${wPx}px;"><img src="${escapeHtml(el.imageUrl || '')}" alt="Gambar bebas" referrerpolicy="no-referrer" class="w-full h-36 object-cover ${rad} border ${borderCls} shadow-sm" /></div>`;
    })
    .join('\n    ');
}

function renderSectionHtml(section: BuilderSection, project: BuilderProject): string {
  const s = getSurfaceClasses(section);
  const pad = getSpacingClass(section.spacing);
  const rad = getRadiusClass(project.theme.radius);
  const preset = ACCENT_PRESETS[project.theme.accentId] || ACCENT_PRESETS.cobalt;
  const accent = preset.hex || project.theme.accentColor;
  const btnShape = section.buttonShape || project.theme.buttonShape || 'rounded';
  const btn = getButtonHtmlClassAndStyle(
    btnShape,
    accent,
    preset.softBg,
    preset.softText,
    s.isDark,
    section.type === 'navbar'
  );
  const secBtnRad =
    btnShape === 'pill' || btnShape === 'pill-outline'
      ? 'rounded-full'
      : btnShape === 'square'
        ? 'rounded-none'
        : 'rounded-lg';
  const bgLayers = renderBgLayers(section);
  const floatingLayers = renderFloatingElementsHtml(section, accent, btn, rad, s.border);
  const st = (key: string, opts?: { baseFontPx?: number; allowWidth?: boolean }) => {
    const css = getElTransformStyle(section, key, opts);
    return css ? ` style="${css}"` : '';
  };

  if (section.type === 'navbar') {
    const linksHtml = (section.links || [])
      .map(
        (l, idx) =>
          `<a href="${escapeHtml(l.href)}"${st(`link_${idx}`)} class="${getNavLinkHtmlClass(section.navLinkStyle, s.mutedText, s.isDark)}">${escapeHtml(l.label)}</a>`
      )
      .join('\n          ');
    return `<header class="relative overflow-hidden ${s.bg} ${s.text} border-b ${s.border}">
    ${bgLayers}
    ${floatingLayers}
    <div class="relative z-10 max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
      <a href="#"${st('brand')} class="text-lg font-bold tracking-tight whitespace-nowrap shrink-0 heading-font">${escapeHtml(section.brandName || 'Studio')}</a>
      <nav class="hidden md:flex items-center gap-4">
        ${linksHtml}
      </nav>
      ${
        section.primaryCta
          ? `<a href="#kontak" style="${btn.style};${getElTransformStyle(section, 'navCta')}" class="${btn.cls}">${escapeHtml(section.primaryCta)}</a>`
          : ''
      }
    </div>
  </header>`;
  }

  if (section.type === 'hero') {
    const isCentered = section.variant === 'centered' || !section.imageUrl;
    if (isCentered) {
      return `<section class="relative overflow-hidden ${s.bg} ${s.text} ${pad} border-b ${s.border}">
    ${bgLayers}
    ${floatingLayers}
    <div class="relative z-10 max-w-4xl mx-auto px-6 text-center">
      ${section.kicker ? `<p class="text-xs font-semibold tracking-wide mb-3" style="color:${s.isDark ? '#93c5fd' : accent};${getElTransformStyle(section, 'kicker', { baseFontPx: 12 })}">${escapeHtml(section.kicker)}</p>` : ''}
      <h1${st('title', { baseFontPx: 44 })} class="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5 heading-font">${escapeHtml(section.title)}</h1>
      ${section.subtitle ? `<p${st('subtitle', { baseFontPx: 17 })} class="text-base md:text-lg ${s.mutedText} max-w-2xl mx-auto mb-8 leading-relaxed">${escapeHtml(section.subtitle)}</p>` : ''}
      <div class="flex flex-wrap items-center justify-center gap-3">
        ${section.primaryCta ? `<a href="#aksi" style="${btn.style};${getElTransformStyle(section, 'primaryCta')}" class="${btn.cls}">${escapeHtml(section.primaryCta)}</a>` : ''}
        ${section.secondaryCta ? `<a href="#detail"${st('secondaryCta')} class="px-5 py-2.5 text-sm font-semibold border ${s.border} ${secBtnRad}">${escapeHtml(section.secondaryCta)}</a>` : ''}
      </div>
    </div>
  </section>`;
    }

    const imageFirst = section.variant === 'split-left';
    return `<section class="relative overflow-hidden ${s.bg} ${s.text} ${pad} border-b ${s.border}">
    ${bgLayers}
    ${floatingLayers}
    <div class="relative z-10 max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-6 ${imageFirst ? 'lg:order-2' : ''}">
        ${section.kicker ? `<p class="text-xs font-semibold tracking-wide mb-3" style="color:${s.isDark ? '#93c5fd' : accent};${getElTransformStyle(section, 'kicker', { baseFontPx: 12 })}">${escapeHtml(section.kicker)}</p>` : ''}
        <h1${st('title', { baseFontPx: 42 })} class="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-5 heading-font">${escapeHtml(section.title)}</h1>
        ${section.subtitle ? `<p${st('subtitle', { baseFontPx: 16 })} class="text-base md:text-lg ${s.mutedText} mb-8 leading-relaxed">${escapeHtml(section.subtitle)}</p>` : ''}
        <div class="flex flex-wrap items-center gap-3">
          ${section.primaryCta ? `<a href="#aksi" style="${btn.style};${getElTransformStyle(section, 'primaryCta')}" class="${btn.cls}">${escapeHtml(section.primaryCta)}</a>` : ''}
          ${section.secondaryCta ? `<a href="#detail"${st('secondaryCta')} class="px-5 py-2.5 text-sm font-semibold border ${s.border} ${secBtnRad}">${escapeHtml(section.secondaryCta)}</a>` : ''}
        </div>
      </div>
      <div class="lg:col-span-6 ${imageFirst ? 'lg:order-1' : ''}"${st('image', { allowWidth: true })}>
        <img src="${escapeHtml(section.imageUrl || '')}" alt="${escapeHtml(section.imageAlt || section.title)}" referrerpolicy="no-referrer" class="w-full h-80 md:h-[420px] object-cover ${rad} border ${s.border}" />
      </div>
    </div>
  </section>`;
  }

  if (section.type === 'features') {
    const cols = section.variant === 'columns-2' ? 'md:grid-cols-2' : 'md:grid-cols-3';
    const itemsHtml = (section.items || [])
      .map(
        (item) => `<div${st(`item_${item.id}`)} class="p-6 border ${s.border} ${s.cardBg} ${rad}">
        ${item.meta ? `<p class="text-xs font-medium ${s.mutedText} mb-2">${escapeHtml(item.meta)}</p>` : ''}
        <h3 class="text-lg font-semibold mb-2 heading-font">${escapeHtml(item.title)}</h3>
        <p class="text-sm ${s.mutedText} leading-relaxed">${escapeHtml(item.description)}</p>
      </div>`
      )
      .join('\n      ');
    return `<section class="relative overflow-hidden ${s.bg} ${s.text} ${pad} border-b ${s.border}">
    ${bgLayers}
    ${floatingLayers}
    <div class="relative z-10 max-w-6xl mx-auto px-6">
      <div class="${section.align === 'center' ? 'text-center mx-auto' : ''} max-w-2xl mb-12">
        ${section.kicker ? `<p class="text-xs font-semibold tracking-wide mb-2" style="color:${s.isDark ? '#93c5fd' : accent};${getElTransformStyle(section, 'kicker')}">${escapeHtml(section.kicker)}</p>` : ''}
        <h2${st('title', { baseFontPx: 30 })} class="text-2xl md:text-3xl font-bold tracking-tight mb-3 heading-font">${escapeHtml(section.title)}</h2>
        ${section.subtitle ? `<p${st('subtitle')} class="text-sm md:text-base ${s.mutedText}">${escapeHtml(section.subtitle)}</p>` : ''}
      </div>
      <div class="grid grid-cols-1 ${cols} gap-6">
        ${itemsHtml}
      </div>
    </div>
  </section>`;
  }

  if (section.type === 'split') {
    const imageFirst = section.variant !== 'split-right';
    return `<section class="relative overflow-hidden ${s.bg} ${s.text} ${pad} border-b ${s.border}">
    ${bgLayers}
    ${floatingLayers}
    <div class="relative z-10 max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div class="lg:col-span-6 ${imageFirst ? 'lg:order-1' : 'lg:order-2'}"${st('image', { allowWidth: true })}>
        <img src="${escapeHtml(section.imageUrl || '')}" alt="${escapeHtml(section.imageAlt || section.title)}" referrerpolicy="no-referrer" class="w-full h-72 md:h-96 object-cover ${rad} border ${s.border}" />
      </div>
      <div class="lg:col-span-6 ${imageFirst ? 'lg:order-2' : 'lg:order-1'}">
        ${section.kicker ? `<p class="text-xs font-semibold tracking-wide mb-2" style="color:${s.isDark ? '#93c5fd' : accent};${getElTransformStyle(section, 'kicker')}">${escapeHtml(section.kicker)}</p>` : ''}
        <h2${st('title', { baseFontPx: 30 })} class="text-2xl md:text-3xl font-bold tracking-tight mb-4 heading-font">${escapeHtml(section.title)}</h2>
        ${section.body ? `<p${st('body')} class="text-base ${s.mutedText} leading-relaxed mb-6">${escapeHtml(section.body)}</p>` : ''}
        ${section.primaryCta ? `<a href="#detail" style="${btn.style};${getElTransformStyle(section, 'primaryCta')}" class="${btn.cls}">${escapeHtml(section.primaryCta)}</a>` : ''}
      </div>
    </div>
  </section>`;
  }

  if (section.type === 'pricing') {
    const cols = section.variant === 'columns-2' ? 'md:grid-cols-2' : 'md:grid-cols-3';
    const itemsHtml = (section.items || [])
      .map((tier) => {
        const feats = (tier.features || [])
          .map((f) => `<li class="text-sm ${s.mutedText} py-1.5 border-t ${s.border}">${escapeHtml(f)}</li>`)
          .join('\n          ');
        const tStyle = getElTransformStyle(section, `item_${tier.id}`);
        const cardStyle = [
          tier.highlighted ? `border-color:${accent}; --tw-ring-color:${accent}` : '',
          tStyle,
        ]
          .filter(Boolean)
          .join(';');
        return `<div class="p-6 border ${tier.highlighted ? 'ring-2' : s.border} ${s.cardBg} ${rad} flex flex-col justify-between" ${cardStyle ? `style="${cardStyle}"` : ''}>
        <div>
          ${tier.meta ? `<p class="text-xs font-medium ${s.mutedText} mb-1">${escapeHtml(tier.meta)}</p>` : ''}
          <h3 class="text-lg font-bold heading-font">${escapeHtml(tier.title)}</h3>
          <p class="text-3xl font-bold my-4 tabular-nums heading-font">${escapeHtml(tier.price || '')}</p>
          <p class="text-sm ${s.mutedText} mb-6">${escapeHtml(tier.description)}</p>
          <ul class="mb-6">${feats}</ul>
        </div>
        <a href="#daftar" ${tier.highlighted ? `style="${btn.style}" class="${btn.cls} w-full"` : `class="block text-center px-4 py-2.5 text-sm font-semibold border ${s.border} ${secBtnRad}"`}>${escapeHtml(tier.ctaLabel || 'Pilih Paket')}</a>
      </div>`;
      })
      .join('\n      ');
    return `<section class="relative overflow-hidden ${s.bg} ${s.text} ${pad} border-b ${s.border}">
    ${bgLayers}
    ${floatingLayers}
    <div class="relative z-10 max-w-6xl mx-auto px-6">
      <div class="${section.align === 'center' ? 'text-center mx-auto' : ''} max-w-2xl mb-12">
        ${section.kicker ? `<p class="text-xs font-semibold tracking-wide mb-2" style="color:${s.isDark ? '#93c5fd' : accent};${getElTransformStyle(section, 'kicker')}">${escapeHtml(section.kicker)}</p>` : ''}
        <h2${st('title', { baseFontPx: 30 })} class="text-2xl md:text-3xl font-bold tracking-tight mb-3 heading-font">${escapeHtml(section.title)}</h2>
        ${section.subtitle ? `<p${st('subtitle')} class="text-sm md:text-base ${s.mutedText}">${escapeHtml(section.subtitle)}</p>` : ''}
      </div>
      <div class="grid grid-cols-1 ${cols} gap-6">
        ${itemsHtml}
      </div>
    </div>
  </section>`;
  }

  if (section.type === 'testimonials') {
    const itemsHtml = (section.items || [])
      .map(
        (q) => `<blockquote${st(`item_${q.id}`)} class="p-6 border ${s.border} ${s.cardBg} ${rad}">
        <p class="text-base leading-relaxed mb-4">"${escapeHtml(q.description)}"</p>
        <footer>
          <div class="text-sm font-semibold">${escapeHtml(q.title)}</div>
          ${q.meta ? `<div class="text-xs ${s.mutedText}">${escapeHtml(q.meta)}</div>` : ''}
        </footer>
      </blockquote>`
      )
      .join('\n      ');
    return `<section class="relative overflow-hidden ${s.bg} ${s.text} ${pad} border-b ${s.border}">
    ${bgLayers}
    ${floatingLayers}
    <div class="relative z-10 max-w-6xl mx-auto px-6">
      <div class="max-w-2xl mb-10">
        ${section.kicker ? `<p class="text-xs font-semibold tracking-wide mb-2" style="color:${s.isDark ? '#93c5fd' : accent};${getElTransformStyle(section, 'kicker')}">${escapeHtml(section.kicker)}</p>` : ''}
        <h2${st('title')} class="text-2xl md:text-3xl font-bold tracking-tight heading-font">${escapeHtml(section.title)}</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${itemsHtml}
      </div>
    </div>
  </section>`;
  }

  if (section.type === 'faq') {
    const itemsHtml = (section.items || [])
      .map(
        (f) => `<details class="border-b ${s.border} py-4 group">
        <summary class="font-semibold text-base cursor-pointer list-none flex items-center justify-between gap-4">
          <span>${escapeHtml(f.title)}</span>
          <span class="text-xs ${s.mutedText}">+</span>
        </summary>
        <p class="mt-3 text-sm ${s.mutedText} leading-relaxed">${escapeHtml(f.description)}</p>
      </details>`
      )
      .join('\n      ');
    return `<section class="relative overflow-hidden ${s.bg} ${s.text} ${pad} border-b ${s.border}">
    ${bgLayers}
    ${floatingLayers}
    <div class="relative z-10 max-w-3xl mx-auto px-6">
      <div class="mb-8">
        ${section.kicker ? `<p class="text-xs font-semibold tracking-wide mb-2" style="color:${s.isDark ? '#93c5fd' : accent};${getElTransformStyle(section, 'kicker')}">${escapeHtml(section.kicker)}</p>` : ''}
        <h2${st('title')} class="text-2xl md:text-3xl font-bold tracking-tight heading-font">${escapeHtml(section.title)}</h2>
      </div>
      <div class="border-t ${s.border}">
        ${itemsHtml}
      </div>
    </div>
  </section>`;
  }

  if (section.type === 'cta') {
    return `<section class="relative overflow-hidden ${s.bg} ${s.text} ${pad} border-b ${s.border}">
    ${bgLayers}
    ${floatingLayers}
    <div class="relative z-10 max-w-4xl mx-auto px-6 text-center">
      ${section.kicker ? `<p class="text-xs font-semibold tracking-wide mb-3" style="color:${s.isDark ? '#93c5fd' : accent};${getElTransformStyle(section, 'kicker')}">${escapeHtml(section.kicker)}</p>` : ''}
      <h2${st('title', { baseFontPx: 36 })} class="text-3xl md:text-4xl font-bold tracking-tight mb-4 heading-font">${escapeHtml(section.title)}</h2>
      ${section.subtitle ? `<p${st('subtitle')} class="text-base ${s.mutedText} max-w-xl mx-auto mb-8">${escapeHtml(section.subtitle)}</p>` : ''}
      <div class="flex flex-wrap items-center justify-center gap-3">
        ${section.primaryCta ? `<a href="#mulai" style="${btn.style};${getElTransformStyle(section, 'primaryCta')}" class="${btn.cls}">${escapeHtml(section.primaryCta)}</a>` : ''}
        ${section.secondaryCta ? `<a href="#info"${st('secondaryCta')} class="px-5 py-2.5 text-sm font-semibold border ${s.border} ${secBtnRad}">${escapeHtml(section.secondaryCta)}</a>` : ''}
      </div>
    </div>
  </section>`;
  }

  const footerLinks = (section.links || [])
    .map(
      (l, idx) =>
        `<a href="${escapeHtml(l.href)}"${st(`link_${idx}`)} class="text-sm ${s.mutedText} hover:opacity-80 whitespace-nowrap">${escapeHtml(l.label)}</a>`
    )
    .join('\n        ');
  return `<footer class="relative overflow-hidden ${s.bg} ${s.text} py-10">
    ${bgLayers}
    ${floatingLayers}
    <div class="relative z-10 max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div>
        <div${st('brand')} class="font-bold text-base heading-font mb-1">${escapeHtml(section.brandName || 'Studio')}</div>
        <p${st('title')} class="text-xs ${s.mutedText}">${escapeHtml(section.title)}</p>
        ${section.subtitle ? `<p${st('subtitle')} class="text-xs ${s.mutedText} mt-1">${escapeHtml(section.subtitle)}</p>` : ''}
      </div>
      <div class="flex flex-wrap items-center gap-6">
        ${footerLinks}
      </div>
    </div>
  </footer>`;
}

export function generateProjectHtml(project: BuilderProject): string {
  const fontInfo = FONT_PAIRINGS[project.theme.fontPairing] || FONT_PAIRINGS['jakarta-dm'];
  const sectionsMarkup = project.sections.map((sec) => renderSectionHtml(sec, project)).join('\n\n  ');

  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(project.title)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@500;600;700&family=Playfair+Display:wght@500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700&family=Public+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    body { font-family: ${fontInfo.bodyFont}; }
    .heading-font { font-family: ${fontInfo.headingFont}; }
    .tabular-nums { font-variant-numeric: tabular-nums; }
  </style>
</head>
<body class="bg-white text-slate-900 antialiased">
  ${sectionsMarkup}
</body>
</html>`;
}
