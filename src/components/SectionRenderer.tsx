import React, { useState } from 'react';
import { ChevronDown, ImageIcon } from 'lucide-react';
import { ACCENT_PRESETS, FONT_PAIRINGS } from '../data/presets';
import {
  BuilderSection,
  ButtonShape,
  NavLinkStyle,
  PageTheme,
  ViewportDevice,
} from '../types/builder';
import { renderIconById } from '../utils/iconRegistry';

interface SectionRendererProps {
  section: BuilderSection;
  theme: PageTheme;
  device: ViewportDevice;
  isPreview?: boolean;
}

function ResilientImage({
  src,
  alt,
  className,
  isDark,
}: {
  src?: string;
  alt: string;
  className: string;
  isDark: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`${className} flex flex-col items-center justify-center gap-2 ${
          isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
        }`}
      >
        <ImageIcon className="w-7 h-7 opacity-60" />
        <span className="text-xs font-medium px-4 text-center">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

export function getButtonClassesAndStyle(
  shape: ButtonShape,
  accentHex: string,
  softBg: string,
  softText: string,
  isDarkBg: boolean,
  compact = false
): { className: string; style?: React.CSSProperties } {
  const pad = compact ? 'px-4 py-2 text-xs' : 'px-5 py-2.5 text-sm';
  const base = `${pad} font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-all duration-150`;

  switch (shape) {
    case 'square':
      return {
        className: `${base} rounded-none text-white hover:opacity-90`,
        style: { backgroundColor: accentHex },
      };
    case 'pill':
      return {
        className: `${base} rounded-full text-white hover:opacity-90`,
        style: { backgroundColor: accentHex },
      };
    case 'outline':
      return {
        className: `${base} rounded-lg border-2 bg-transparent hover:opacity-80`,
        style: {
          borderColor: isDarkBg ? '#f8fafc' : accentHex,
          color: isDarkBg ? '#f8fafc' : accentHex,
        },
      };
    case 'pill-outline':
      return {
        className: `${base} rounded-full border-2 bg-transparent hover:opacity-80`,
        style: {
          borderColor: isDarkBg ? '#f8fafc' : accentHex,
          color: isDarkBg ? '#f8fafc' : accentHex,
        },
      };
    case 'soft':
      return {
        className: `${base} rounded-lg hover:opacity-90`,
        style: {
          backgroundColor: isDarkBg ? 'rgba(255,255,255,0.14)' : softBg,
          color: isDarkBg ? '#ffffff' : softText,
        },
      };
    case 'ghost':
      return {
        className: `${base} rounded-md underline underline-offset-4 decoration-2 bg-transparent hover:opacity-75`,
        style: { color: isDarkBg ? '#f8fafc' : accentHex },
      };
    case 'rounded':
    default:
      return {
        className: `${base} rounded-lg text-white hover:opacity-90`,
        style: { backgroundColor: accentHex },
      };
  }
}

function getNavLinkClasses(
  style: NavLinkStyle | undefined,
  mutedClass: string,
  isDark: boolean
): string {
  switch (style) {
    case 'underline':
      return `text-sm font-medium ${mutedClass} hover:underline underline-offset-4 decoration-2 whitespace-nowrap shrink-0 transition-all`;
    case 'boxed':
      return `px-3 py-1.5 text-xs font-medium rounded-md border ${
        isDark
          ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
          : 'border-slate-200 text-slate-700 hover:bg-slate-100'
      } whitespace-nowrap shrink-0 transition-colors`;
    case 'pill':
      return `px-3.5 py-1.5 text-xs font-medium rounded-full ${
        isDark
          ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      } whitespace-nowrap shrink-0 transition-colors`;
    case 'plain':
    default:
      return `text-sm font-medium ${mutedClass} hover:opacity-80 whitespace-nowrap shrink-0 transition-opacity`;
  }
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({
  section,
  theme,
  device,
  isPreview = false,
}) => {
  const [openFaqIds, setOpenFaqIds] = useState<Record<string, boolean>>({});
  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';
  const isNarrow = isMobile || isTablet;

  const fontPair = FONT_PAIRINGS[theme.fontPairing] || FONT_PAIRINGS['jakarta-dm'];
  const accentPreset = ACCENT_PRESETS[theme.accentId] || ACCENT_PRESETS.cobalt;
  const accentHex = accentPreset.hex || theme.accentColor;

  const hasBgPhoto = Boolean(section.backgroundImage);
  const effectiveDark =
    hasBgPhoto && section.backgroundOverlay === 'dark'
      ? true
      : hasBgPhoto && section.backgroundOverlay === 'light'
        ? false
        : section.surface === 'dark';

  const radiusClass =
    theme.radius === 'sharp'
      ? 'rounded-none'
      : theme.radius === 'soft'
        ? 'rounded-2xl'
        : 'rounded-lg';

  const surface = effectiveDark
    ? {
        bg: 'bg-slate-950',
        text: 'text-slate-50',
        muted: 'text-slate-300',
        border: 'border-slate-800',
        card: hasBgPhoto ? 'bg-slate-900/85 backdrop-blur-xs' : 'bg-slate-900',
      }
    : section.surface === 'muted'
      ? {
          bg: 'bg-slate-50',
          text: 'text-slate-900',
          muted: 'text-slate-600',
          border: 'border-slate-200',
          card: hasBgPhoto ? 'bg-white/90 backdrop-blur-xs' : 'bg-white',
        }
      : {
          bg: 'bg-white',
          text: 'text-slate-900',
          muted: 'text-slate-600',
          border: 'border-slate-200',
          card: hasBgPhoto ? 'bg-white/90 backdrop-blur-xs' : 'bg-slate-50',
        };

  const patternStyle: React.CSSProperties =
    !hasBgPhoto && section.backgroundPattern === 'grid'
      ? {
          backgroundImage: effectiveDark
            ? 'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)'
            : 'linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }
      : !hasBgPhoto && section.backgroundPattern === 'dots'
        ? {
            backgroundImage: effectiveDark
              ? 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)'
              : 'radial-gradient(rgba(15,23,42,0.12) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }
        : !hasBgPhoto && section.backgroundPattern === 'gradient-soft'
          ? {
              backgroundImage: effectiveDark
                ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #eff6ff 55%, #f8fafc 100%)',
            }
          : !hasBgPhoto && section.backgroundPattern === 'gradient-warm'
            ? {
                backgroundImage: effectiveDark
                  ? 'linear-gradient(135deg, #1c1917 0%, #292524 100%)'
                  : 'linear-gradient(135deg, #fafaf9 0%, #fef3c7 45%, #f5f5f4 100%)',
              }
            : {};

  const spacingPad =
    section.spacing === 'compact'
      ? 'py-5'
      : section.spacing === 'spacious'
        ? isMobile
          ? 'py-12'
          : 'py-20'
        : isMobile
          ? 'py-10'
          : 'py-14';

  const activeButtonShape = section.buttonShape || theme.buttonShape || 'rounded';
  const primaryBtn = getButtonClassesAndStyle(
    activeButtonShape,
    accentHex,
    accentPreset.softBg,
    accentPreset.softText,
    effectiveDark,
    section.type === 'navbar'
  );

  const secondaryShapeClass =
    activeButtonShape === 'pill' || activeButtonShape === 'pill-outline'
      ? 'rounded-full'
      : activeButtonShape === 'square'
        ? 'rounded-none'
        : 'rounded-lg';

  const preventNavClick = (e: React.MouseEvent) => {
    if (!isPreview) e.preventDefault();
  };

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      style={{ fontFamily: fontPair.bodyFont, ...patternStyle }}
      className={`relative overflow-hidden ${surface.bg} ${surface.text} border-b ${surface.border} transition-colors duration-150`}
    >
      {/* Stock Background Photography Layer */}
      {hasBgPhoto && (
        <>
          <img
            src={section.backgroundImage}
            alt="Latar belakang blok"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          />
          {section.backgroundOverlay === 'dark' && (
            <div className="absolute inset-0 bg-slate-950/65 pointer-events-none" />
          )}
          {section.backgroundOverlay === 'light' && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] pointer-events-none" />
          )}
        </>
      )}

      <div className="relative z-10">
        {section.type === 'navbar' && (
          <header className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
            <a
              href="#top"
              onClick={preventNavClick}
              style={{ fontFamily: fontPair.headingFont }}
              className="text-lg font-bold tracking-tight whitespace-nowrap shrink-0 flex items-center gap-2"
            >
              {section.brandIcon && (
                <span style={{ color: accentHex }}>
                  {renderIconById(section.brandIcon, 'w-5 h-5')}
                </span>
              )}
              <span>{section.brandName || 'Studio'}</span>
            </a>
            {!isMobile && (
              <nav className="flex items-center gap-4 overflow-hidden">
                {(section.links || []).map((link, idx) => (
                  <a
                    key={`${link.label}_${idx}`}
                    href={link.href}
                    onClick={preventNavClick}
                    className={getNavLinkClasses(
                      section.navLinkStyle,
                      surface.muted,
                      effectiveDark
                    )}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            )}
            {section.primaryCta && (
              <a
                href="#kontak"
                onClick={preventNavClick}
                style={primaryBtn.style}
                className={primaryBtn.className}
              >
                <span>{section.primaryCta}</span>
                {section.ctaIcon && renderIconById(section.ctaIcon, 'w-3.5 h-3.5')}
              </a>
            )}
          </header>
        )}

        {section.type === 'hero' && (
          <section className={`max-w-6xl mx-auto px-6 ${spacingPad}`}>
            {section.variant === 'centered' || !section.imageUrl ? (
              <div className="max-w-3xl mx-auto text-center">
                {section.kicker && (
                  <p
                    className="text-xs font-semibold tracking-wide mb-3"
                    style={{ color: effectiveDark ? '#93c5fd' : accentHex }}
                  >
                    {section.kicker}
                  </p>
                )}
                <h1
                  style={{ fontFamily: fontPair.headingFont, textWrap: 'balance' }}
                  className={`${
                    isMobile ? 'text-3xl' : 'text-4xl lg:text-5xl'
                  } font-bold tracking-tight leading-[1.15] mb-5`}
                >
                  {section.title}
                </h1>
                {section.subtitle && (
                  <p
                    className={`${
                      isMobile ? 'text-sm' : 'text-base lg:text-lg'
                    } ${surface.muted} max-w-2xl mx-auto mb-8 leading-relaxed`}
                  >
                    {section.subtitle}
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {section.primaryCta && (
                    <a
                      href="#aksi"
                      onClick={preventNavClick}
                      style={primaryBtn.style}
                      className={primaryBtn.className}
                    >
                      <span>{section.primaryCta}</span>
                      {section.ctaIcon && renderIconById(section.ctaIcon, 'w-4 h-4')}
                    </a>
                  )}
                  {section.secondaryCta && (
                    <a
                      href="#detail"
                      onClick={preventNavClick}
                      className={`px-5 py-2.5 text-sm font-semibold border ${surface.border} ${secondaryShapeClass} whitespace-nowrap hover:opacity-80 transition-opacity`}
                    >
                      {section.secondaryCta}
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div
                className={`grid ${
                  isNarrow ? 'grid-cols-1 gap-8' : 'grid-cols-12 gap-10 items-center'
                }`}
              >
                <div
                  className={`${isNarrow ? '' : 'col-span-6'} ${
                    !isNarrow && section.variant === 'split-left' ? 'order-2' : 'order-1'
                  }`}
                >
                  {section.kicker && (
                    <p
                      className="text-xs font-semibold tracking-wide mb-3"
                      style={{ color: effectiveDark ? '#93c5fd' : accentHex }}
                    >
                      {section.kicker}
                    </p>
                  )}
                  <h1
                    style={{ fontFamily: fontPair.headingFont, textWrap: 'balance' }}
                    className={`${
                      isMobile ? 'text-3xl' : 'text-4xl lg:text-[2.75rem]'
                    } font-bold tracking-tight leading-[1.15] mb-4`}
                  >
                    {section.title}
                  </h1>
                  {section.subtitle && (
                    <p className={`text-base ${surface.muted} mb-7 leading-relaxed`}>
                      {section.subtitle}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3">
                    {section.primaryCta && (
                      <a
                        href="#aksi"
                        onClick={preventNavClick}
                        style={primaryBtn.style}
                        className={primaryBtn.className}
                      >
                        <span>{section.primaryCta}</span>
                        {section.ctaIcon && renderIconById(section.ctaIcon, 'w-4 h-4')}
                      </a>
                    )}
                    {section.secondaryCta && (
                      <a
                        href="#detail"
                        onClick={preventNavClick}
                        className={`px-5 py-2.5 text-sm font-semibold border ${surface.border} ${secondaryShapeClass} whitespace-nowrap hover:opacity-80 transition-opacity`}
                      >
                        {section.secondaryCta}
                      </a>
                    )}
                  </div>
                </div>
                <div
                  className={`${isNarrow ? '' : 'col-span-6'} ${
                    !isNarrow && section.variant === 'split-left' ? 'order-1' : 'order-2'
                  }`}
                >
                  <ResilientImage
                    src={section.imageUrl}
                    alt={section.imageAlt || section.title}
                    isDark={effectiveDark}
                    className={`w-full ${
                      isMobile ? 'h-56' : 'h-80 lg:h-[380px]'
                    } object-cover ${radiusClass} border ${surface.border}`}
                  />
                </div>
              </div>
            )}
          </section>
        )}

        {section.type === 'features' && (
          <section className={`max-w-6xl mx-auto px-6 ${spacingPad}`}>
            <div
              className={`${section.align === 'center' ? 'text-center mx-auto' : ''} max-w-2xl mb-10`}
            >
              {section.kicker && (
                <p
                  className="text-xs font-semibold tracking-wide mb-2"
                  style={{ color: effectiveDark ? '#93c5fd' : accentHex }}
                >
                  {section.kicker}
                </p>
              )}
              <h2
                style={{ fontFamily: fontPair.headingFont, textWrap: 'balance' }}
                className="text-2xl md:text-3xl font-bold tracking-tight mb-3"
              >
                {section.title}
              </h2>
              {section.subtitle && (
                <p className={`text-sm md:text-base ${surface.muted} leading-relaxed`}>
                  {section.subtitle}
                </p>
              )}
            </div>
            <div
              className={`grid gap-6 ${
                isMobile
                  ? 'grid-cols-1'
                  : section.variant === 'columns-2' || isTablet
                    ? 'grid-cols-2'
                    : 'grid-cols-3'
              }`}
            >
              {(section.items || []).map((item) => (
                <div
                  key={item.id}
                  className={`p-6 border ${surface.border} ${surface.card} ${radiusClass}`}
                >
                  {item.icon && (
                    <div
                      style={{
                        backgroundColor: effectiveDark ? 'rgba(255,255,255,0.08)' : accentPreset.softBg,
                        color: effectiveDark ? '#ffffff' : accentHex,
                      }}
                      className={`w-9 h-9 ${radiusClass} flex items-center justify-center mb-4`}
                    >
                      {renderIconById(item.icon, 'w-4 h-4')}
                    </div>
                  )}
                  {item.meta && (
                    <p className={`text-xs font-medium ${surface.muted} mb-2`}>{item.meta}</p>
                  )}
                  <h3
                    style={{ fontFamily: fontPair.headingFont }}
                    className="text-lg font-semibold mb-2"
                  >
                    {item.title}
                  </h3>
                  <p className={`text-sm ${surface.muted} leading-relaxed`}>{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {section.type === 'split' && (
          <section className={`max-w-6xl mx-auto px-6 ${spacingPad}`}>
            <div
              className={`grid ${
                isNarrow ? 'grid-cols-1 gap-8' : 'grid-cols-12 gap-10 items-center'
              }`}
            >
              <div
                className={`${isNarrow ? '' : 'col-span-6'} ${
                  !isNarrow && section.variant === 'split-right' ? 'order-2' : 'order-1'
                }`}
              >
                <ResilientImage
                  src={section.imageUrl}
                  alt={section.imageAlt || section.title}
                  isDark={effectiveDark}
                  className={`w-full ${
                    isMobile ? 'h-56' : 'h-80'
                  } object-cover ${radiusClass} border ${surface.border}`}
                />
              </div>
              <div
                className={`${isNarrow ? '' : 'col-span-6'} ${
                  !isNarrow && section.variant === 'split-right' ? 'order-1' : 'order-2'
                }`}
              >
                {section.kicker && (
                  <p
                    className="text-xs font-semibold tracking-wide mb-2"
                    style={{ color: effectiveDark ? '#93c5fd' : accentHex }}
                  >
                    {section.kicker}
                  </p>
                )}
                <h2
                  style={{ fontFamily: fontPair.headingFont, textWrap: 'balance' }}
                  className="text-2xl md:text-3xl font-bold tracking-tight mb-4"
                >
                  {section.title}
                </h2>
                {section.body && (
                  <p className={`text-base ${surface.muted} leading-relaxed mb-6`}>{section.body}</p>
                )}
                {section.primaryCta && (
                  <a
                    href="#detail"
                    onClick={preventNavClick}
                    style={primaryBtn.style}
                    className={primaryBtn.className}
                  >
                    <span>{section.primaryCta}</span>
                    {section.ctaIcon && renderIconById(section.ctaIcon, 'w-4 h-4')}
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {section.type === 'pricing' && (
          <section className={`max-w-6xl mx-auto px-6 ${spacingPad}`}>
            <div
              className={`${section.align === 'center' ? 'text-center mx-auto' : ''} max-w-2xl mb-10`}
            >
              {section.kicker && (
                <p
                  className="text-xs font-semibold tracking-wide mb-2"
                  style={{ color: effectiveDark ? '#93c5fd' : accentHex }}
                >
                  {section.kicker}
                </p>
              )}
              <h2
                style={{ fontFamily: fontPair.headingFont, textWrap: 'balance' }}
                className="text-2xl md:text-3xl font-bold tracking-tight mb-3"
              >
                {section.title}
              </h2>
              {section.subtitle && (
                <p className={`text-sm md:text-base ${surface.muted}`}>{section.subtitle}</p>
              )}
            </div>
            <div
              className={`grid gap-6 ${
                isMobile
                  ? 'grid-cols-1'
                  : section.variant === 'columns-2' || isTablet
                    ? 'grid-cols-2'
                    : 'grid-cols-3'
              }`}
            >
              {(section.items || []).map((tier) => (
                <div
                  key={tier.id}
                  style={
                    tier.highlighted
                      ? { borderColor: accentHex, boxShadow: `0 0 0 1px ${accentHex}` }
                      : undefined
                  }
                  className={`p-6 border ${surface.border} ${surface.card} ${radiusClass} flex flex-col justify-between`}
                >
                  <div>
                    {tier.meta && (
                      <p className={`text-xs font-medium ${surface.muted} mb-1`}>{tier.meta}</p>
                    )}
                    <h3 style={{ fontFamily: fontPair.headingFont }} className="text-lg font-bold">
                      {tier.title}
                    </h3>
                    <p
                      style={{ fontFamily: fontPair.headingFont }}
                      className="text-3xl font-bold my-4 tabular-nums"
                    >
                      {tier.price}
                    </p>
                    <p className={`text-sm ${surface.muted} mb-6 leading-relaxed`}>
                      {tier.description}
                    </p>
                    {tier.features && tier.features.length > 0 && (
                      <ul className="mb-6">
                        {tier.features.map((feat, idx) => (
                          <li
                            key={idx}
                            className={`text-sm ${surface.muted} py-2 border-t ${surface.border}`}
                          >
                            {feat}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <a
                    href="#pilih"
                    onClick={preventNavClick}
                    style={tier.highlighted ? primaryBtn.style : undefined}
                    className={
                      tier.highlighted
                        ? `${primaryBtn.className} w-full`
                        : `block text-center px-4 py-2.5 text-sm font-semibold border ${surface.border} ${secondaryShapeClass} whitespace-nowrap hover:opacity-90 transition-opacity`
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
          <section className={`max-w-6xl mx-auto px-6 ${spacingPad}`}>
            <div className="max-w-2xl mb-10">
              {section.kicker && (
                <p
                  className="text-xs font-semibold tracking-wide mb-2"
                  style={{ color: effectiveDark ? '#93c5fd' : accentHex }}
                >
                  {section.kicker}
                </p>
              )}
              <h2
                style={{ fontFamily: fontPair.headingFont, textWrap: 'balance' }}
                className="text-2xl md:text-3xl font-bold tracking-tight"
              >
                {section.title}
              </h2>
            </div>
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {(section.items || []).map((q, idx) => (
                <blockquote
                  key={q.id}
                  className={`p-6 border ${surface.border} ${surface.card} ${radiusClass} flex flex-col justify-between gap-5`}
                >
                  <p className="text-base leading-relaxed">“{q.description}”</p>
                  <footer className="flex items-center gap-3">
                    {idx === 0 && section.imageUrl && (
                      <ResilientImage
                        src={section.imageUrl}
                        alt={q.title}
                        isDark={effectiveDark}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
                      />
                    )}
                    <div>
                      <div className="text-sm font-semibold">{q.title}</div>
                      {q.meta && <div className={`text-xs ${surface.muted}`}>{q.meta}</div>}
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>
        )}

        {section.type === 'faq' && (
          <section className={`max-w-3xl mx-auto px-6 ${spacingPad}`}>
            <div className="mb-8">
              {section.kicker && (
                <p
                  className="text-xs font-semibold tracking-wide mb-2"
                  style={{ color: effectiveDark ? '#93c5fd' : accentHex }}
                >
                  {section.kicker}
                </p>
              )}
              <h2
                style={{ fontFamily: fontPair.headingFont, textWrap: 'balance' }}
                className="text-2xl md:text-3xl font-bold tracking-tight"
              >
                {section.title}
              </h2>
            </div>
            <div className={`border-t ${surface.border}`}>
              {(section.items || []).map((item) => {
                const isOpen = Boolean(openFaqIds[item.id]);
                return (
                  <div key={item.id} className={`border-b ${surface.border}`}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFaq(item.id);
                      }}
                      className="w-full py-4 text-left flex items-center justify-between gap-4 font-semibold text-base"
                    >
                      <span>{item.title}</span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform duration-150 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className={`pb-4 text-sm ${surface.muted} leading-relaxed`}>
                        {item.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {section.type === 'cta' && (
          <section className={`max-w-4xl mx-auto px-6 ${spacingPad} text-center`}>
            {section.kicker && (
              <p
                className="text-xs font-semibold tracking-wide mb-3"
                style={{ color: effectiveDark ? '#93c5fd' : accentHex }}
              >
                {section.kicker}
              </p>
            )}
            <h2
              style={{ fontFamily: fontPair.headingFont, textWrap: 'balance' }}
              className={`${isMobile ? 'text-2xl' : 'text-3xl md:text-4xl'} font-bold tracking-tight mb-4`}
            >
              {section.title}
            </h2>
            {section.subtitle && (
              <p className={`text-base ${surface.muted} max-w-xl mx-auto mb-8 leading-relaxed`}>
                {section.subtitle}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {section.primaryCta && (
                <a
                  href="#mulai"
                  onClick={preventNavClick}
                  style={primaryBtn.style}
                  className={primaryBtn.className}
                >
                  <span>{section.primaryCta}</span>
                  {section.ctaIcon && renderIconById(section.ctaIcon, 'w-4 h-4')}
                </a>
              )}
              {section.secondaryCta && (
                <a
                  href="#info"
                  onClick={preventNavClick}
                  className={`px-5 py-2.5 text-sm font-semibold border ${surface.border} ${secondaryShapeClass} whitespace-nowrap hover:opacity-80 transition-opacity`}
                >
                  {section.secondaryCta}
                </a>
              )}
            </div>
          </section>
        )}

        {section.type === 'footer' && (
          <footer className="max-w-6xl mx-auto px-6 py-10">
            <div
              className={`flex ${
                isMobile ? 'flex-col items-start' : 'flex-row items-center justify-between'
              } gap-6`}
            >
              <div>
                <div
                  style={{ fontFamily: fontPair.headingFont }}
                  className="font-bold text-base mb-1 flex items-center gap-2"
                >
                  {section.brandIcon && (
                    <span style={{ color: accentHex }}>
                      {renderIconById(section.brandIcon, 'w-4 h-4')}
                    </span>
                  )}
                  <span>{section.brandName || 'Studio'}</span>
                </div>
                <p className={`text-xs ${surface.muted}`}>{section.title}</p>
                {section.subtitle && (
                  <p className={`text-xs ${surface.muted} mt-1`}>{section.subtitle}</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-6">
                {(section.links || []).map((link, idx) => (
                  <a
                    key={`${link.label}_${idx}`}
                    href={link.href}
                    onClick={preventNavClick}
                    className={`text-sm ${surface.muted} hover:opacity-80 whitespace-nowrap`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};
