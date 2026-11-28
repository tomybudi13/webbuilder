import React, { useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Shapes,
  Smile,
  Upload,
} from 'lucide-react';
import {
  ACCENT_PRESETS,
  BUTTON_SHAPES,
  FONT_PAIRINGS,
  STUDIO_IMAGES,
} from '../data/presets';
import {
  BuilderSection,
  ButtonShape,
  ElementTransform,
  FloatingCanvasElement,
  NavLinkStyle,
  PageTheme,
  SectionItem,
  ViewportDevice,
} from '../types/builder';
import { ICON_CATALOG, renderIconById } from '../utils/iconRegistry';
import { CanvaElementWrapper } from './CanvaElementWrapper';
import { InlineEditableText } from './InlineEditableText';

interface SectionRendererProps {
  section: BuilderSection;
  theme: PageTheme;
  device: ViewportDevice;
  isPreview?: boolean;
  selectedElementKey?: string | null;
  onSelectElement?: (elementKey: string | null) => void;
  onUpdateSection?: (patch: Partial<BuilderSection>) => void;
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
  selectedElementKey = null,
  onSelectElement,
  onUpdateSection,
}) => {
  const [openFaqIds, setOpenFaqIds] = useState<Record<string, boolean>>({});
  const [editingField, setEditingField] = useState<string | null>(null);
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const imageUploadRef = useRef<HTMLInputElement | null>(null);
  const floatingUploadRef = useRef<{ id: string } | null>(null);

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

  const patchSection = (patch: Partial<BuilderSection>) => {
    onUpdateSection?.(patch);
  };

  const getTransform = (key: string): ElementTransform | undefined =>
    section.elementTransforms?.[key];

  const updateTransform = (key: string, next: ElementTransform) => {
    patchSection({
      elementTransforms: {
        ...(section.elementTransforms || {}),
        [key]: next,
      },
    });
  };

  const isElSelected = (key: string) =>
    !isPreview && selectedElementKey === `${section.id}:${key}`;

  const selectEl = (key: string) => {
    setOpenPopover(null);
    onSelectElement?.(`${section.id}:${key}`);
  };

  const fontStyleWithDelta = (
    baseStyle: React.CSSProperties,
    key: string,
    defaultPx: number
  ): React.CSSProperties => {
    const delta = getTransform(key)?.fontSizeDelta ?? 0;
    if (!delta) return baseStyle;
    return {
      ...baseStyle,
      fontSize: `${Math.max(11, defaultPx + delta)}px`,
    };
  };

  const updateItem = (itemId: string, patch: Partial<SectionItem>) => {
    const nextItems = (section.items || []).map((it) =>
      it.id === itemId ? { ...it, ...patch } : it
    );
    patchSection({ items: nextItems });
  };

  const moveNavLink = (idx: number, dir: -1 | 1) => {
    const links = [...(section.links || [])];
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= links.length) return;
    const [moved] = links.splice(idx, 1);
    links.splice(targetIdx, 0, moved);
    patchSection({ links });
  };

  const renderIconQuickPopover = (
    popoverId: string,
    currentIcon: string | undefined,
    onSelectIcon: (iconId: string | undefined) => void
  ) => (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpenPopover(openPopover === popoverId ? null : popoverId)}
        className="px-1.5 py-0.5 hover:bg-slate-800 rounded inline-flex items-center gap-1"
      >
        <Smile className="w-3 h-3 text-blue-400" />
        <span>Ikon</span>
      </button>
      {openPopover === popoverId && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-8 left-0 z-50 w-56 p-2 bg-white text-slate-900 border border-slate-200 rounded-lg shadow-xl"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold">Pilih Ikon</span>
            {currentIcon && (
              <button
                type="button"
                onClick={() => {
                  onSelectIcon(undefined);
                  setOpenPopover(null);
                }}
                className="text-[10px] text-red-600 hover:underline"
              >
                Hapus
              </button>
            )}
          </div>
          <div className="grid grid-cols-6 gap-1 max-h-36 overflow-y-auto">
            {ICON_CATALOG.map((ic) => (
              <button
                key={ic.id}
                type="button"
                title={ic.label}
                onClick={() => {
                  onSelectIcon(ic.id);
                  setOpenPopover(null);
                }}
                className={`p-1.5 rounded border flex items-center justify-center ${
                  currentIcon === ic.id
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-slate-200 hover:border-slate-400'
                }`}
              >
                <ic.Component className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderButtonShapePopover = (popoverId: string) => (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpenPopover(openPopover === popoverId ? null : popoverId)}
        className="px-1.5 py-0.5 hover:bg-slate-800 rounded inline-flex items-center gap-1"
      >
        <Shapes className="w-3 h-3 text-blue-400" />
        <span>Bentuk</span>
      </button>
      {openPopover === popoverId && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-8 left-0 z-50 w-44 p-1.5 bg-white text-slate-900 border border-slate-200 rounded-lg shadow-xl space-y-1"
        >
          {BUTTON_SHAPES.map((bs) => (
            <button
              key={bs.id}
              type="button"
              onClick={() => {
                patchSection({ buttonShape: bs.id });
                setOpenPopover(null);
              }}
              className={`w-full text-left px-2 py-1 rounded text-[11px] font-medium ${
                activeButtonShape === bs.id
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              {bs.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderImageQuickToolbar = (target: 'imageUrl' | 'floating', floatingId?: string) => (
    <div className="relative inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => {
          floatingUploadRef.current = floatingId ? { id: floatingId } : null;
          imageUploadRef.current?.click();
        }}
        className="px-1.5 py-0.5 hover:bg-slate-800 rounded inline-flex items-center gap-1"
      >
        <Upload className="w-3 h-3 text-blue-400" />
        <span>Upload</span>
      </button>
      <div className="relative">
        <button
          type="button"
          onClick={() =>
            setOpenPopover(openPopover === `img_${target}_${floatingId || ''}` ? null : `img_${target}_${floatingId || ''}`)
          }
          className="px-1.5 py-0.5 hover:bg-slate-800 rounded inline-flex items-center gap-1"
        >
          <ImageIcon className="w-3 h-3 text-blue-400" />
          <span>Galeri</span>
        </button>
        {openPopover === `img_${target}_${floatingId || ''}` && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-8 left-0 z-50 w-52 p-2 bg-white text-slate-900 border border-slate-200 rounded-lg shadow-xl grid grid-cols-2 gap-1.5"
          >
            {STUDIO_IMAGES.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => {
                  if (target === 'floating' && floatingId) {
                    updateFloatingElement(floatingId, { imageUrl: img.url });
                  } else {
                    patchSection({ imageUrl: img.url, imageAlt: img.label });
                  }
                  setOpenPopover(null);
                }}
                className="rounded overflow-hidden border border-slate-200 hover:border-blue-600"
              >
                <img src={img.url} alt={img.label} className="w-full h-12 object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const updateFloatingElement = (id: string, patch: Partial<FloatingCanvasElement>) => {
    const next = (section.floatingElements || []).map((el) =>
      el.id === id ? { ...el, ...patch } : el
    );
    patchSection({ floatingElements: next });
  };

  const deleteFloatingElement = (id: string) => {
    patchSection({
      floatingElements: (section.floatingElements || []).filter((el) => el.id !== id),
    });
    onSelectElement?.(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) return;
      if (floatingUploadRef.current) {
        updateFloatingElement(floatingUploadRef.current.id, { imageUrl: dataUrl });
        floatingUploadRef.current = null;
      } else {
        patchSection({ imageUrl: dataUrl, imageAlt: file.name });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div
      style={{ fontFamily: fontPair.bodyFont, ...patternStyle }}
      className={`relative ${isPreview ? 'overflow-hidden' : ''} ${surface.bg} ${surface.text} border-b ${surface.border} transition-colors duration-150`}
    >
      <input
        ref={imageUploadRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Stock Background Photography Layer */}
      {hasBgPhoto && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <img
            src={section.backgroundImage}
            alt="Latar belakang blok"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          {section.backgroundOverlay === 'dark' && (
            <div className="absolute inset-0 bg-slate-950/65" />
          )}
          {section.backgroundOverlay === 'light' && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px]" />
          )}
        </div>
      )}

      {/* Floating Canva Elements Layer (Teks, Ikon, Tombol, Gambar bebas) */}
      {(section.floatingElements || []).map((el) => {
        const elKey = `float_${el.id}`;
        const elSelected = isElSelected(elKey);
        const floatBtn = getButtonClassesAndStyle(
          el.buttonShape || activeButtonShape,
          accentHex,
          accentPreset.softBg,
          accentPreset.softText,
          effectiveDark,
          true
        );

        return (
          <CanvaElementWrapper
            key={el.id}
            elementKey={elKey}
            label={
              el.kind === 'text'
                ? 'Teks Bebas'
                : el.kind === 'icon'
                  ? 'Ikon Bebas'
                  : el.kind === 'button'
                    ? 'Tombol Bebas'
                    : 'Gambar Bebas'
            }
            transform={{ x: el.x, y: el.y, widthPct: el.width, fontSizeDelta: el.fontSize }}
            isSelected={elSelected}
            isPreview={isPreview}
            isEditingText={editingField === elKey}
            supportsTextEdit={el.kind === 'text' || el.kind === 'button'}
            supportsFontSize={el.kind === 'text'}
            supportsResize={el.kind === 'image'}
            supportsDelete
            onSelect={() => selectEl(elKey)}
            onStartEditText={() => setEditingField(elKey)}
            onChangeTransform={(next) =>
              updateFloatingElement(el.id, {
                x: next.x,
                y: next.y,
                width: next.widthPct,
                fontSize: next.fontSizeDelta,
              })
            }
            onDelete={() => deleteFloatingElement(el.id)}
            customToolbarContent={
              el.kind === 'icon'
                ? renderIconQuickPopover(`pop_${el.id}`, el.icon, (icon) =>
                    updateFloatingElement(el.id, { icon: icon || 'sparkles' })
                  )
                : el.kind === 'image'
                  ? renderImageQuickToolbar('floating', el.id)
                  : undefined
            }
            style={{ position: 'absolute', left: 0, top: 0, zIndex: 35 }}
            className="inline-block"
          >
            {el.kind === 'text' && (
              <div
                style={{
                  fontFamily: fontPair.headingFont,
                  fontSize: `${Math.max(12, 18 + (el.fontSize || 0))}px`,
                }}
                className="font-semibold px-2 py-1"
              >
                <InlineEditableText
                  value={el.text || 'Teks Baru'}
                  isEditing={editingField === elKey}
                  onCommit={(val) => updateFloatingElement(el.id, { text: val })}
                  onStopEdit={() => setEditingField(null)}
                />
              </div>
            )}

            {el.kind === 'button' && (
              <div style={floatBtn.style} className={floatBtn.className}>
                <InlineEditableText
                  value={el.text || 'Tombol'}
                  isEditing={editingField === elKey}
                  onCommit={(val) => updateFloatingElement(el.id, { text: val })}
                  onStopEdit={() => setEditingField(null)}
                />
              </div>
            )}

            {el.kind === 'icon' && (
              <div
                style={{ color: el.color || accentHex }}
                className="p-2 rounded-lg bg-white/80 border border-slate-200/70 shadow-xs"
              >
                {renderIconById(el.icon || 'sparkles', 'w-7 h-7')}
              </div>
            )}

            {el.kind === 'image' && (
              <div style={{ width: `${Math.max(120, ((el.width || 100) / 100) * 220)}px` }}>
                <ResilientImage
                  src={el.imageUrl || STUDIO_IMAGES[1].url}
                  alt="Gambar bebas"
                  isDark={effectiveDark}
                  className={`w-full h-36 object-cover ${radiusClass} border ${surface.border} shadow-sm`}
                />
              </div>
            )}
          </CanvaElementWrapper>
        );
      })}

      <div className="relative z-10">
        {section.type === 'navbar' && (
          <header className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
            <CanvaElementWrapper
              elementKey="brand"
              label="Logo Merek"
              transform={getTransform('brand')}
              isSelected={isElSelected('brand')}
              isPreview={isPreview}
              isEditingText={editingField === 'brand'}
              supportsTextEdit
              toolbarPosition="bottom"
              customToolbarContent={renderIconQuickPopover(
                'nav_brand_icon',
                section.brandIcon,
                (icon) => patchSection({ brandIcon: icon })
              )}
              onSelect={() => selectEl('brand')}
              onStartEditText={() => setEditingField('brand')}
              onChangeTransform={(next) => updateTransform('brand', next)}
            >
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
                <InlineEditableText
                  value={section.brandName || 'Studio'}
                  isEditing={editingField === 'brand'}
                  onCommit={(val) => patchSection({ brandName: val })}
                  onStopEdit={() => setEditingField(null)}
                />
              </a>
            </CanvaElementWrapper>

            {!isMobile && (
              <nav className="flex items-center gap-3 flex-wrap">
                {(section.links || []).map((link, idx) => {
                  const linkKey = `link_${idx}`;
                  return (
                    <CanvaElementWrapper
                      key={`${linkKey}_${idx}`}
                      elementKey={linkKey}
                      label="Menu"
                      transform={getTransform(linkKey)}
                      isSelected={isElSelected(linkKey)}
                      isPreview={isPreview}
                      isEditingText={editingField === linkKey}
                      supportsTextEdit
                      toolbarPosition="bottom"
                      customToolbarContent={
                        <div className="flex items-center gap-0.5 border-l border-slate-700 pl-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveNavLink(idx, -1)}
                            title="Geser kiri"
                            className="p-0.5 hover:bg-slate-800 rounded disabled:opacity-30"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === (section.links || []).length - 1}
                            onClick={() => moveNavLink(idx, 1)}
                            title="Geser kanan"
                            className="p-0.5 hover:bg-slate-800 rounded disabled:opacity-30"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      }
                      onSelect={() => selectEl(linkKey)}
                      onStartEditText={() => setEditingField(linkKey)}
                      onChangeTransform={(next) => updateTransform(linkKey, next)}
                    >
                      <a
                        href={link.href}
                        onClick={preventNavClick}
                        className={getNavLinkClasses(
                          section.navLinkStyle,
                          surface.muted,
                          effectiveDark
                        )}
                      >
                        <InlineEditableText
                          value={link.label}
                          isEditing={editingField === linkKey}
                          onCommit={(val) => {
                            const next = [...(section.links || [])];
                            next[idx] = { ...next[idx], label: val };
                            patchSection({ links: next });
                          }}
                          onStopEdit={() => setEditingField(null)}
                        />
                      </a>
                    </CanvaElementWrapper>
                  );
                })}
              </nav>
            )}

            {section.primaryCta && (
              <CanvaElementWrapper
                elementKey="navCta"
                label="Tombol Menu"
                transform={getTransform('navCta')}
                isSelected={isElSelected('navCta')}
                isPreview={isPreview}
                isEditingText={editingField === 'navCta'}
                supportsTextEdit
                toolbarPosition="bottom"
                customToolbarContent={
                  <>
                    {renderButtonShapePopover('nav_btn_shape')}
                    {renderIconQuickPopover('nav_cta_icon', section.ctaIcon, (icon) =>
                      patchSection({ ctaIcon: icon })
                    )}
                  </>
                }
                onSelect={() => selectEl('navCta')}
                onStartEditText={() => setEditingField('navCta')}
                onChangeTransform={(next) => updateTransform('navCta', next)}
              >
                <a
                  href="#kontak"
                  onClick={preventNavClick}
                  style={primaryBtn.style}
                  className={primaryBtn.className}
                >
                  <InlineEditableText
                    value={section.primaryCta}
                    isEditing={editingField === 'navCta'}
                    onCommit={(val) => patchSection({ primaryCta: val })}
                    onStopEdit={() => setEditingField(null)}
                  />
                  {section.ctaIcon && renderIconById(section.ctaIcon, 'w-3.5 h-3.5')}
                </a>
              </CanvaElementWrapper>
            )}
          </header>
        )}

        {section.type === 'hero' && (
          <section className={`max-w-6xl mx-auto px-6 ${spacingPad}`}>
            {section.variant === 'centered' || !section.imageUrl ? (
              <div className="max-w-3xl mx-auto text-center">
                {section.kicker && (
                  <CanvaElementWrapper
                    elementKey="kicker"
                    label="Kicker"
                    transform={getTransform('kicker')}
                    isSelected={isElSelected('kicker')}
                    isPreview={isPreview}
                    isEditingText={editingField === 'kicker'}
                    supportsTextEdit
                    supportsFontSize
                    onSelect={() => selectEl('kicker')}
                    onStartEditText={() => setEditingField('kicker')}
                    onChangeTransform={(next) => updateTransform('kicker', next)}
                    className="inline-block mb-3"
                  >
                    <p
                      className="text-xs font-semibold tracking-wide"
                      style={fontStyleWithDelta(
                        { color: effectiveDark ? '#93c5fd' : accentHex },
                        'kicker',
                        12
                      )}
                    >
                      <InlineEditableText
                        value={section.kicker}
                        isEditing={editingField === 'kicker'}
                        onCommit={(val) => patchSection({ kicker: val })}
                        onStopEdit={() => setEditingField(null)}
                      />
                    </p>
                  </CanvaElementWrapper>
                )}

                <CanvaElementWrapper
                  elementKey="title"
                  label="Judul Utama"
                  transform={getTransform('title')}
                  isSelected={isElSelected('title')}
                  isPreview={isPreview}
                  isEditingText={editingField === 'title'}
                  supportsTextEdit
                  supportsFontSize
                  onSelect={() => selectEl('title')}
                  onStartEditText={() => setEditingField('title')}
                  onChangeTransform={(next) => updateTransform('title', next)}
                  className="mb-5"
                >
                  <h1
                    style={fontStyleWithDelta(
                      { fontFamily: fontPair.headingFont, textWrap: 'balance' },
                      'title',
                      isMobile ? 30 : 44
                    )}
                    className={`${
                      isMobile ? 'text-3xl' : 'text-4xl lg:text-5xl'
                    } font-bold tracking-tight leading-[1.15]`}
                  >
                    <InlineEditableText
                      value={section.title}
                      multiline
                      isEditing={editingField === 'title'}
                      onCommit={(val) => patchSection({ title: val })}
                      onStopEdit={() => setEditingField(null)}
                    />
                  </h1>
                </CanvaElementWrapper>

                {section.subtitle && (
                  <CanvaElementWrapper
                    elementKey="subtitle"
                    label="Subjudul"
                    transform={getTransform('subtitle')}
                    isSelected={isElSelected('subtitle')}
                    isPreview={isPreview}
                    isEditingText={editingField === 'subtitle'}
                    supportsTextEdit
                    supportsFontSize
                    onSelect={() => selectEl('subtitle')}
                    onStartEditText={() => setEditingField('subtitle')}
                    onChangeTransform={(next) => updateTransform('subtitle', next)}
                    className="max-w-2xl mx-auto mb-8"
                  >
                    <p
                      style={fontStyleWithDelta({}, 'subtitle', isMobile ? 14 : 17)}
                      className={`${
                        isMobile ? 'text-sm' : 'text-base lg:text-lg'
                      } ${surface.muted} leading-relaxed`}
                    >
                      <InlineEditableText
                        value={section.subtitle}
                        multiline
                        isEditing={editingField === 'subtitle'}
                        onCommit={(val) => patchSection({ subtitle: val })}
                        onStopEdit={() => setEditingField(null)}
                      />
                    </p>
                  </CanvaElementWrapper>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3">
                  {section.primaryCta && (
                    <CanvaElementWrapper
                      elementKey="primaryCta"
                      label="Tombol Utama"
                      transform={getTransform('primaryCta')}
                      isSelected={isElSelected('primaryCta')}
                      isPreview={isPreview}
                      isEditingText={editingField === 'primaryCta'}
                      supportsTextEdit
                      customToolbarContent={
                        <>
                          {renderButtonShapePopover('hero_c_shape')}
                          {renderIconQuickPopover('hero_c_icon', section.ctaIcon, (icon) =>
                            patchSection({ ctaIcon: icon })
                          )}
                        </>
                      }
                      onSelect={() => selectEl('primaryCta')}
                      onStartEditText={() => setEditingField('primaryCta')}
                      onChangeTransform={(next) => updateTransform('primaryCta', next)}
                    >
                      <a
                        href="#aksi"
                        onClick={preventNavClick}
                        style={primaryBtn.style}
                        className={primaryBtn.className}
                      >
                        <InlineEditableText
                          value={section.primaryCta}
                          isEditing={editingField === 'primaryCta'}
                          onCommit={(val) => patchSection({ primaryCta: val })}
                          onStopEdit={() => setEditingField(null)}
                        />
                        {section.ctaIcon && renderIconById(section.ctaIcon, 'w-4 h-4')}
                      </a>
                    </CanvaElementWrapper>
                  )}

                  {section.secondaryCta && (
                    <CanvaElementWrapper
                      elementKey="secondaryCta"
                      label="Tombol Sekunder"
                      transform={getTransform('secondaryCta')}
                      isSelected={isElSelected('secondaryCta')}
                      isPreview={isPreview}
                      isEditingText={editingField === 'secondaryCta'}
                      supportsTextEdit
                      onSelect={() => selectEl('secondaryCta')}
                      onStartEditText={() => setEditingField('secondaryCta')}
                      onChangeTransform={(next) => updateTransform('secondaryCta', next)}
                    >
                      <a
                        href="#detail"
                        onClick={preventNavClick}
                        className={`inline-block px-5 py-2.5 text-sm font-semibold border ${surface.border} ${secondaryShapeClass} whitespace-nowrap hover:opacity-80 transition-opacity`}
                      >
                        <InlineEditableText
                          value={section.secondaryCta}
                          isEditing={editingField === 'secondaryCta'}
                          onCommit={(val) => patchSection({ secondaryCta: val })}
                          onStopEdit={() => setEditingField(null)}
                        />
                      </a>
                    </CanvaElementWrapper>
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
                    <CanvaElementWrapper
                      elementKey="kicker"
                      label="Kicker"
                      transform={getTransform('kicker')}
                      isSelected={isElSelected('kicker')}
                      isPreview={isPreview}
                      isEditingText={editingField === 'kicker'}
                      supportsTextEdit
                      supportsFontSize
                      onSelect={() => selectEl('kicker')}
                      onStartEditText={() => setEditingField('kicker')}
                      onChangeTransform={(next) => updateTransform('kicker', next)}
                      className="inline-block mb-3"
                    >
                      <p
                        className="text-xs font-semibold tracking-wide"
                        style={fontStyleWithDelta(
                          { color: effectiveDark ? '#93c5fd' : accentHex },
                          'kicker',
                          12
                        )}
                      >
                        <InlineEditableText
                          value={section.kicker}
                          isEditing={editingField === 'kicker'}
                          onCommit={(val) => patchSection({ kicker: val })}
                          onStopEdit={() => setEditingField(null)}
                        />
                      </p>
                    </CanvaElementWrapper>
                  )}

                  <CanvaElementWrapper
                    elementKey="title"
                    label="Judul Utama"
                    transform={getTransform('title')}
                    isSelected={isElSelected('title')}
                    isPreview={isPreview}
                    isEditingText={editingField === 'title'}
                    supportsTextEdit
                    supportsFontSize
                    onSelect={() => selectEl('title')}
                    onStartEditText={() => setEditingField('title')}
                    onChangeTransform={(next) => updateTransform('title', next)}
                    className="mb-4"
                  >
                    <h1
                      style={fontStyleWithDelta(
                        { fontFamily: fontPair.headingFont, textWrap: 'balance' },
                        'title',
                        isMobile ? 30 : 42
                      )}
                      className={`${
                        isMobile ? 'text-3xl' : 'text-4xl lg:text-[2.75rem]'
                      } font-bold tracking-tight leading-[1.15]`}
                    >
                      <InlineEditableText
                        value={section.title}
                        multiline
                        isEditing={editingField === 'title'}
                        onCommit={(val) => patchSection({ title: val })}
                        onStopEdit={() => setEditingField(null)}
                      />
                    </h1>
                  </CanvaElementWrapper>

                  {section.subtitle && (
                    <CanvaElementWrapper
                      elementKey="subtitle"
                      label="Subjudul"
                      transform={getTransform('subtitle')}
                      isSelected={isElSelected('subtitle')}
                      isPreview={isPreview}
                      isEditingText={editingField === 'subtitle'}
                      supportsTextEdit
                      supportsFontSize
                      onSelect={() => selectEl('subtitle')}
                      onStartEditText={() => setEditingField('subtitle')}
                      onChangeTransform={(next) => updateTransform('subtitle', next)}
                      className="mb-7"
                    >
                      <p
                        style={fontStyleWithDelta({}, 'subtitle', 16)}
                        className={`text-base ${surface.muted} leading-relaxed`}
                      >
                        <InlineEditableText
                          value={section.subtitle}
                          multiline
                          isEditing={editingField === 'subtitle'}
                          onCommit={(val) => patchSection({ subtitle: val })}
                          onStopEdit={() => setEditingField(null)}
                        />
                      </p>
                    </CanvaElementWrapper>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    {section.primaryCta && (
                      <CanvaElementWrapper
                        elementKey="primaryCta"
                        label="Tombol Utama"
                        transform={getTransform('primaryCta')}
                        isSelected={isElSelected('primaryCta')}
                        isPreview={isPreview}
                        isEditingText={editingField === 'primaryCta'}
                        supportsTextEdit
                        customToolbarContent={
                          <>
                            {renderButtonShapePopover('hero_s_shape')}
                            {renderIconQuickPopover('hero_s_icon', section.ctaIcon, (icon) =>
                              patchSection({ ctaIcon: icon })
                            )}
                          </>
                        }
                        onSelect={() => selectEl('primaryCta')}
                        onStartEditText={() => setEditingField('primaryCta')}
                        onChangeTransform={(next) => updateTransform('primaryCta', next)}
                      >
                        <a
                          href="#aksi"
                          onClick={preventNavClick}
                          style={primaryBtn.style}
                          className={primaryBtn.className}
                        >
                          <InlineEditableText
                            value={section.primaryCta}
                            isEditing={editingField === 'primaryCta'}
                            onCommit={(val) => patchSection({ primaryCta: val })}
                            onStopEdit={() => setEditingField(null)}
                          />
                          {section.ctaIcon && renderIconById(section.ctaIcon, 'w-4 h-4')}
                        </a>
                      </CanvaElementWrapper>
                    )}

                    {section.secondaryCta && (
                      <CanvaElementWrapper
                        elementKey="secondaryCta"
                        label="Tombol Sekunder"
                        transform={getTransform('secondaryCta')}
                        isSelected={isElSelected('secondaryCta')}
                        isPreview={isPreview}
                        isEditingText={editingField === 'secondaryCta'}
                        supportsTextEdit
                        onSelect={() => selectEl('secondaryCta')}
                        onStartEditText={() => setEditingField('secondaryCta')}
                        onChangeTransform={(next) => updateTransform('secondaryCta', next)}
                      >
                        <a
                          href="#detail"
                          onClick={preventNavClick}
                          className={`inline-block px-5 py-2.5 text-sm font-semibold border ${surface.border} ${secondaryShapeClass} whitespace-nowrap hover:opacity-80 transition-opacity`}
                        >
                          <InlineEditableText
                            value={section.secondaryCta}
                            isEditing={editingField === 'secondaryCta'}
                            onCommit={(val) => patchSection({ secondaryCta: val })}
                            onStopEdit={() => setEditingField(null)}
                          />
                        </a>
                      </CanvaElementWrapper>
                    )}
                  </div>
                </div>

                <div
                  className={`${isNarrow ? '' : 'col-span-6'} ${
                    !isNarrow && section.variant === 'split-left' ? 'order-1' : 'order-2'
                  }`}
                >
                  <CanvaElementWrapper
                    elementKey="image"
                    label="Gambar Hero"
                    transform={getTransform('image')}
                    isSelected={isElSelected('image')}
                    isPreview={isPreview}
                    supportsResize
                    customToolbarContent={renderImageQuickToolbar('imageUrl')}
                    onSelect={() => selectEl('image')}
                    onChangeTransform={(next) => updateTransform('image', next)}
                  >
                    <ResilientImage
                      src={section.imageUrl}
                      alt={section.imageAlt || section.title}
                      isDark={effectiveDark}
                      className={`w-full ${
                        isMobile ? 'h-56' : 'h-80 lg:h-[380px]'
                      } object-cover ${radiusClass} border ${surface.border}`}
                    />
                  </CanvaElementWrapper>
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
                <CanvaElementWrapper
                  elementKey="kicker"
                  label="Kicker"
                  transform={getTransform('kicker')}
                  isSelected={isElSelected('kicker')}
                  isPreview={isPreview}
                  isEditingText={editingField === 'kicker'}
                  supportsTextEdit
                  onSelect={() => selectEl('kicker')}
                  onStartEditText={() => setEditingField('kicker')}
                  onChangeTransform={(next) => updateTransform('kicker', next)}
                  className="inline-block mb-2"
                >
                  <p
                    className="text-xs font-semibold tracking-wide"
                    style={{ color: effectiveDark ? '#93c5fd' : accentHex }}
                  >
                    <InlineEditableText
                      value={section.kicker}
                      isEditing={editingField === 'kicker'}
                      onCommit={(val) => patchSection({ kicker: val })}
                      onStopEdit={() => setEditingField(null)}
                    />
                  </p>
                </CanvaElementWrapper>
              )}

              <CanvaElementWrapper
                elementKey="title"
                label="Judul Bagian"
                transform={getTransform('title')}
                isSelected={isElSelected('title')}
                isPreview={isPreview}
                isEditingText={editingField === 'title'}
                supportsTextEdit
                supportsFontSize
                onSelect={() => selectEl('title')}
                onStartEditText={() => setEditingField('title')}
                onChangeTransform={(next) => updateTransform('title', next)}
                className="mb-3"
              >
                <h2
                  style={fontStyleWithDelta(
                    { fontFamily: fontPair.headingFont, textWrap: 'balance' },
                    'title',
                    30
                  )}
                  className="text-2xl md:text-3xl font-bold tracking-tight"
                >
                  <InlineEditableText
                    value={section.title}
                    multiline
                    isEditing={editingField === 'title'}
                    onCommit={(val) => patchSection({ title: val })}
                    onStopEdit={() => setEditingField(null)}
                  />
                </h2>
              </CanvaElementWrapper>

              {section.subtitle && (
                <CanvaElementWrapper
                  elementKey="subtitle"
                  label="Subjudul"
                  transform={getTransform('subtitle')}
                  isSelected={isElSelected('subtitle')}
                  isPreview={isPreview}
                  isEditingText={editingField === 'subtitle'}
                  supportsTextEdit
                  onSelect={() => selectEl('subtitle')}
                  onStartEditText={() => setEditingField('subtitle')}
                  onChangeTransform={(next) => updateTransform('subtitle', next)}
                >
                  <p className={`text-sm md:text-base ${surface.muted} leading-relaxed`}>
                    <InlineEditableText
                      value={section.subtitle}
                      multiline
                      isEditing={editingField === 'subtitle'}
                      onCommit={(val) => patchSection({ subtitle: val })}
                      onStopEdit={() => setEditingField(null)}
                    />
                  </p>
                </CanvaElementWrapper>
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
              {(section.items || []).map((item) => {
                const cardKey = `item_${item.id}`;
                return (
                  <CanvaElementWrapper
                    key={item.id}
                    elementKey={cardKey}
                    label="Kartu Fitur"
                    transform={getTransform(cardKey)}
                    isSelected={isElSelected(cardKey)}
                    isPreview={isPreview}
                    customToolbarContent={renderIconQuickPopover(
                      `feat_icon_${item.id}`,
                      item.icon,
                      (icon) => updateItem(item.id, { icon })
                    )}
                    onSelect={() => selectEl(cardKey)}
                    onChangeTransform={(next) => updateTransform(cardKey, next)}
                  >
                    <div className={`p-6 border ${surface.border} ${surface.card} ${radiusClass} h-full`}>
                      {item.icon && (
                        <button
                          type="button"
                          onClick={(e) => {
                            if (isPreview) return;
                            e.stopPropagation();
                            selectEl(cardKey);
                            setOpenPopover(`feat_icon_${item.id}`);
                          }}
                          style={{
                            backgroundColor: effectiveDark
                              ? 'rgba(255,255,255,0.08)'
                              : accentPreset.softBg,
                            color: effectiveDark ? '#ffffff' : accentHex,
                          }}
                          className={`w-9 h-9 ${radiusClass} flex items-center justify-center mb-4 hover:ring-2 hover:ring-blue-500`}
                          title={isPreview ? undefined : 'Klik untuk ganti ikon'}
                        >
                          {renderIconById(item.icon, 'w-4 h-4')}
                        </button>
                      )}
                      {item.meta && (
                        <p
                          onDoubleClick={(e) => {
                            if (isPreview) return;
                            e.stopPropagation();
                            setEditingField(`${cardKey}_meta`);
                          }}
                          className={`text-xs font-medium ${surface.muted} mb-2`}
                        >
                          <InlineEditableText
                            value={item.meta}
                            isEditing={editingField === `${cardKey}_meta`}
                            onCommit={(val) => updateItem(item.id, { meta: val })}
                            onStopEdit={() => setEditingField(null)}
                          />
                        </p>
                      )}
                      <h3
                        onDoubleClick={(e) => {
                          if (isPreview) return;
                          e.stopPropagation();
                          setEditingField(`${cardKey}_title`);
                        }}
                        style={{ fontFamily: fontPair.headingFont }}
                        className="text-lg font-semibold mb-2"
                      >
                        <InlineEditableText
                          value={item.title}
                          isEditing={editingField === `${cardKey}_title`}
                          onCommit={(val) => updateItem(item.id, { title: val })}
                          onStopEdit={() => setEditingField(null)}
                        />
                      </h3>
                      <p
                        onDoubleClick={(e) => {
                          if (isPreview) return;
                          e.stopPropagation();
                          setEditingField(`${cardKey}_desc`);
                        }}
                        className={`text-sm ${surface.muted} leading-relaxed`}
                      >
                        <InlineEditableText
                          value={item.description}
                          multiline
                          isEditing={editingField === `${cardKey}_desc`}
                          onCommit={(val) => updateItem(item.id, { description: val })}
                          onStopEdit={() => setEditingField(null)}
                        />
                      </p>
                    </div>
                  </CanvaElementWrapper>
                );
              })}
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
                <CanvaElementWrapper
                  elementKey="image"
                  label="Gambar Sorotan"
                  transform={getTransform('image')}
                  isSelected={isElSelected('image')}
                  isPreview={isPreview}
                  supportsResize
                  customToolbarContent={renderImageQuickToolbar('imageUrl')}
                  onSelect={() => selectEl('image')}
                  onChangeTransform={(next) => updateTransform('image', next)}
                >
                  <ResilientImage
                    src={section.imageUrl}
                    alt={section.imageAlt || section.title}
                    isDark={effectiveDark}
                    className={`w-full ${
                      isMobile ? 'h-56' : 'h-80'
                    } object-cover ${radiusClass} border ${surface.border}`}
                  />
                </CanvaElementWrapper>
              </div>
              <div
                className={`${isNarrow ? '' : 'col-span-6'} ${
                  !isNarrow && section.variant === 'split-right' ? 'order-1' : 'order-2'
                }`}
              >
                {section.kicker && (
                  <CanvaElementWrapper
                    elementKey="kicker"
                    label="Kicker"
                    transform={getTransform('kicker')}
                    isSelected={isElSelected('kicker')}
                    isPreview={isPreview}
                    isEditingText={editingField === 'kicker'}
                    supportsTextEdit
                    onSelect={() => selectEl('kicker')}
                    onStartEditText={() => setEditingField('kicker')}
                    onChangeTransform={(next) => updateTransform('kicker', next)}
                    className="inline-block mb-2"
                  >
                    <p
                      className="text-xs font-semibold tracking-wide"
                      style={{ color: effectiveDark ? '#93c5fd' : accentHex }}
                    >
                      <InlineEditableText
                        value={section.kicker}
                        isEditing={editingField === 'kicker'}
                        onCommit={(val) => patchSection({ kicker: val })}
                        onStopEdit={() => setEditingField(null)}
                      />
                    </p>
                  </CanvaElementWrapper>
                )}

                <CanvaElementWrapper
                  elementKey="title"
                  label="Judul Sorotan"
                  transform={getTransform('title')}
                  isSelected={isElSelected('title')}
                  isPreview={isPreview}
                  isEditingText={editingField === 'title'}
                  supportsTextEdit
                  supportsFontSize
                  onSelect={() => selectEl('title')}
                  onStartEditText={() => setEditingField('title')}
                  onChangeTransform={(next) => updateTransform('title', next)}
                  className="mb-4"
                >
                  <h2
                    style={fontStyleWithDelta(
                      { fontFamily: fontPair.headingFont, textWrap: 'balance' },
                      'title',
                      30
                    )}
                    className="text-2xl md:text-3xl font-bold tracking-tight"
                  >
                    <InlineEditableText
                      value={section.title}
                      multiline
                      isEditing={editingField === 'title'}
                      onCommit={(val) => patchSection({ title: val })}
                      onStopEdit={() => setEditingField(null)}
                    />
                  </h2>
                </CanvaElementWrapper>

                {section.body && (
                  <CanvaElementWrapper
                    elementKey="body"
                    label="Paragraf"
                    transform={getTransform('body')}
                    isSelected={isElSelected('body')}
                    isPreview={isPreview}
                    isEditingText={editingField === 'body'}
                    supportsTextEdit
                    onSelect={() => selectEl('body')}
                    onStartEditText={() => setEditingField('body')}
                    onChangeTransform={(next) => updateTransform('body', next)}
                    className="mb-6"
                  >
                    <p className={`text-base ${surface.muted} leading-relaxed`}>
                      <InlineEditableText
                        value={section.body}
                        multiline
                        isEditing={editingField === 'body'}
                        onCommit={(val) => patchSection({ body: val })}
                        onStopEdit={() => setEditingField(null)}
                      />
                    </p>
                  </CanvaElementWrapper>
                )}

                {section.primaryCta && (
                  <CanvaElementWrapper
                    elementKey="primaryCta"
                    label="Tombol Aksi"
                    transform={getTransform('primaryCta')}
                    isSelected={isElSelected('primaryCta')}
                    isPreview={isPreview}
                    isEditingText={editingField === 'primaryCta'}
                    supportsTextEdit
                    customToolbarContent={
                      <>
                        {renderButtonShapePopover('split_shape')}
                        {renderIconQuickPopover('split_icon', section.ctaIcon, (icon) =>
                          patchSection({ ctaIcon: icon })
                        )}
                      </>
                    }
                    onSelect={() => selectEl('primaryCta')}
                    onStartEditText={() => setEditingField('primaryCta')}
                    onChangeTransform={(next) => updateTransform('primaryCta', next)}
                    className="inline-block"
                  >
                    <a
                      href="#detail"
                      onClick={preventNavClick}
                      style={primaryBtn.style}
                      className={primaryBtn.className}
                    >
                      <InlineEditableText
                        value={section.primaryCta}
                        isEditing={editingField === 'primaryCta'}
                        onCommit={(val) => patchSection({ primaryCta: val })}
                        onStopEdit={() => setEditingField(null)}
                      />
                      {section.ctaIcon && renderIconById(section.ctaIcon, 'w-4 h-4')}
                    </a>
                  </CanvaElementWrapper>
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
                <CanvaElementWrapper
                  elementKey="kicker"
                  label="Kicker"
                  transform={getTransform('kicker')}
                  isSelected={isElSelected('kicker')}
                  isPreview={isPreview}
                  isEditingText={editingField === 'kicker'}
                  supportsTextEdit
                  onSelect={() => selectEl('kicker')}
                  onStartEditText={() => setEditingField('kicker')}
                  onChangeTransform={(next) => updateTransform('kicker', next)}
                  className="inline-block mb-2"
                >
                  <p
                    className="text-xs font-semibold tracking-wide"
                    style={{ color: effectiveDark ? '#93c5fd' : accentHex }}
                  >
                    <InlineEditableText
                      value={section.kicker}
                      isEditing={editingField === 'kicker'}
                      onCommit={(val) => patchSection({ kicker: val })}
                      onStopEdit={() => setEditingField(null)}
                    />
                  </p>
                </CanvaElementWrapper>
              )}

              <CanvaElementWrapper
                elementKey="title"
                label="Judul Harga"
                transform={getTransform('title')}
                isSelected={isElSelected('title')}
                isPreview={isPreview}
                isEditingText={editingField === 'title'}
                supportsTextEdit
                supportsFontSize
                onSelect={() => selectEl('title')}
                onStartEditText={() => setEditingField('title')}
                onChangeTransform={(next) => updateTransform('title', next)}
                className="mb-3"
              >
                <h2
                  style={fontStyleWithDelta(
                    { fontFamily: fontPair.headingFont, textWrap: 'balance' },
                    'title',
                    30
                  )}
                  className="text-2xl md:text-3xl font-bold tracking-tight"
                >
                  <InlineEditableText
                    value={section.title}
                    multiline
                    isEditing={editingField === 'title'}
                    onCommit={(val) => patchSection({ title: val })}
                    onStopEdit={() => setEditingField(null)}
                  />
                </h2>
              </CanvaElementWrapper>

              {section.subtitle && (
                <CanvaElementWrapper
                  elementKey="subtitle"
                  label="Subjudul"
                  transform={getTransform('subtitle')}
                  isSelected={isElSelected('subtitle')}
                  isPreview={isPreview}
                  isEditingText={editingField === 'subtitle'}
                  supportsTextEdit
                  onSelect={() => selectEl('subtitle')}
                  onStartEditText={() => setEditingField('subtitle')}
                  onChangeTransform={(next) => updateTransform('subtitle', next)}
                >
                  <p className={`text-sm md:text-base ${surface.muted}`}>
                    <InlineEditableText
                      value={section.subtitle}
                      multiline
                      isEditing={editingField === 'subtitle'}
                      onCommit={(val) => patchSection({ subtitle: val })}
                      onStopEdit={() => setEditingField(null)}
                    />
                  </p>
                </CanvaElementWrapper>
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
              {(section.items || []).map((tier) => {
                const cardKey = `item_${tier.id}`;
                return (
                  <CanvaElementWrapper
                    key={tier.id}
                    elementKey={cardKey}
                    label={`Paket ${tier.title}`}
                    transform={getTransform(cardKey)}
                    isSelected={isElSelected(cardKey)}
                    isPreview={isPreview}
                    onSelect={() => selectEl(cardKey)}
                    onChangeTransform={(next) => updateTransform(cardKey, next)}
                  >
                    <div
                      style={
                        tier.highlighted
                          ? { borderColor: accentHex, boxShadow: `0 0 0 1px ${accentHex}` }
                          : undefined
                      }
                      className={`p-6 border ${surface.border} ${surface.card} ${radiusClass} flex flex-col justify-between h-full`}
                    >
                      <div>
                        {tier.meta && (
                          <p
                            onDoubleClick={(e) => {
                              if (isPreview) return;
                              e.stopPropagation();
                              setEditingField(`${cardKey}_meta`);
                            }}
                            className={`text-xs font-medium ${surface.muted} mb-1`}
                          >
                            <InlineEditableText
                              value={tier.meta}
                              isEditing={editingField === `${cardKey}_meta`}
                              onCommit={(val) => updateItem(tier.id, { meta: val })}
                              onStopEdit={() => setEditingField(null)}
                            />
                          </p>
                        )}
                        <h3
                          onDoubleClick={(e) => {
                            if (isPreview) return;
                            e.stopPropagation();
                            setEditingField(`${cardKey}_title`);
                          }}
                          style={{ fontFamily: fontPair.headingFont }}
                          className="text-lg font-bold"
                        >
                          <InlineEditableText
                            value={tier.title}
                            isEditing={editingField === `${cardKey}_title`}
                            onCommit={(val) => updateItem(tier.id, { title: val })}
                            onStopEdit={() => setEditingField(null)}
                          />
                        </h3>
                        <p
                          onDoubleClick={(e) => {
                            if (isPreview) return;
                            e.stopPropagation();
                            setEditingField(`${cardKey}_price`);
                          }}
                          style={{ fontFamily: fontPair.headingFont }}
                          className="text-3xl font-bold my-4 tabular-nums"
                        >
                          <InlineEditableText
                            value={tier.price || ''}
                            isEditing={editingField === `${cardKey}_price`}
                            onCommit={(val) => updateItem(tier.id, { price: val })}
                            onStopEdit={() => setEditingField(null)}
                          />
                        </p>
                        <p
                          onDoubleClick={(e) => {
                            if (isPreview) return;
                            e.stopPropagation();
                            setEditingField(`${cardKey}_desc`);
                          }}
                          className={`text-sm ${surface.muted} mb-6 leading-relaxed`}
                        >
                          <InlineEditableText
                            value={tier.description}
                            multiline
                            isEditing={editingField === `${cardKey}_desc`}
                            onCommit={(val) => updateItem(tier.id, { description: val })}
                            onStopEdit={() => setEditingField(null)}
                          />
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
                        onDoubleClick={(e) => {
                          if (isPreview) return;
                          e.stopPropagation();
                          setEditingField(`${cardKey}_cta`);
                        }}
                        style={tier.highlighted ? primaryBtn.style : undefined}
                        className={
                          tier.highlighted
                            ? `${primaryBtn.className} w-full`
                            : `block text-center px-4 py-2.5 text-sm font-semibold border ${surface.border} ${secondaryShapeClass} whitespace-nowrap hover:opacity-90 transition-opacity`
                        }
                      >
                        <InlineEditableText
                          value={tier.ctaLabel || 'Pilih Paket'}
                          isEditing={editingField === `${cardKey}_cta`}
                          onCommit={(val) => updateItem(tier.id, { ctaLabel: val })}
                          onStopEdit={() => setEditingField(null)}
                        />
                      </a>
                    </div>
                  </CanvaElementWrapper>
                );
              })}
            </div>
          </section>
        )}

        {section.type === 'testimonials' && (
          <section className={`max-w-6xl mx-auto px-6 ${spacingPad}`}>
            <div className="max-w-2xl mb-10">
              {section.kicker && (
                <CanvaElementWrapper
                  elementKey="kicker"
                  label="Kicker"
                  transform={getTransform('kicker')}
                  isSelected={isElSelected('kicker')}
                  isPreview={isPreview}
                  isEditingText={editingField === 'kicker'}
                  supportsTextEdit
                  onSelect={() => selectEl('kicker')}
                  onStartEditText={() => setEditingField('kicker')}
                  onChangeTransform={(next) => updateTransform('kicker', next)}
                  className="inline-block mb-2"
                >
                  <p
                    className="text-xs font-semibold tracking-wide"
                    style={{ color: effectiveDark ? '#93c5fd' : accentHex }}
                  >
                    <InlineEditableText
                      value={section.kicker}
                      isEditing={editingField === 'kicker'}
                      onCommit={(val) => patchSection({ kicker: val })}
                      onStopEdit={() => setEditingField(null)}
                    />
                  </p>
                </CanvaElementWrapper>
              )}

              <CanvaElementWrapper
                elementKey="title"
                label="Judul Testimoni"
                transform={getTransform('title')}
                isSelected={isElSelected('title')}
                isPreview={isPreview}
                isEditingText={editingField === 'title'}
                supportsTextEdit
                onSelect={() => selectEl('title')}
                onStartEditText={() => setEditingField('title')}
                onChangeTransform={(next) => updateTransform('title', next)}
              >
                <h2
                  style={{ fontFamily: fontPair.headingFont, textWrap: 'balance' }}
                  className="text-2xl md:text-3xl font-bold tracking-tight"
                >
                  <InlineEditableText
                    value={section.title}
                    multiline
                    isEditing={editingField === 'title'}
                    onCommit={(val) => patchSection({ title: val })}
                    onStopEdit={() => setEditingField(null)}
                  />
                </h2>
              </CanvaElementWrapper>
            </div>

            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {(section.items || []).map((q, idx) => {
                const cardKey = `item_${q.id}`;
                return (
                  <CanvaElementWrapper
                    key={q.id}
                    elementKey={cardKey}
                    label="Kutipan Klien"
                    transform={getTransform(cardKey)}
                    isSelected={isElSelected(cardKey)}
                    isPreview={isPreview}
                    onSelect={() => selectEl(cardKey)}
                    onChangeTransform={(next) => updateTransform(cardKey, next)}
                  >
                    <blockquote
                      className={`p-6 border ${surface.border} ${surface.card} ${radiusClass} flex flex-col justify-between gap-5 h-full`}
                    >
                      <p
                        onDoubleClick={(e) => {
                          if (isPreview) return;
                          e.stopPropagation();
                          setEditingField(`${cardKey}_desc`);
                        }}
                        className="text-base leading-relaxed"
                      >
                        “
                        <InlineEditableText
                          value={q.description}
                          multiline
                          isEditing={editingField === `${cardKey}_desc`}
                          onCommit={(val) => updateItem(q.id, { description: val })}
                          onStopEdit={() => setEditingField(null)}
                        />
                        ”
                      </p>
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
                          <div
                            onDoubleClick={(e) => {
                              if (isPreview) return;
                              e.stopPropagation();
                              setEditingField(`${cardKey}_title`);
                            }}
                            className="text-sm font-semibold"
                          >
                            <InlineEditableText
                              value={q.title}
                              isEditing={editingField === `${cardKey}_title`}
                              onCommit={(val) => updateItem(q.id, { title: val })}
                              onStopEdit={() => setEditingField(null)}
                            />
                          </div>
                          {q.meta && (
                            <div
                              onDoubleClick={(e) => {
                                if (isPreview) return;
                                e.stopPropagation();
                                setEditingField(`${cardKey}_meta`);
                              }}
                              className={`text-xs ${surface.muted}`}
                            >
                              <InlineEditableText
                                value={q.meta}
                                isEditing={editingField === `${cardKey}_meta`}
                                onCommit={(val) => updateItem(q.id, { meta: val })}
                                onStopEdit={() => setEditingField(null)}
                              />
                            </div>
                          )}
                        </div>
                      </footer>
                    </blockquote>
                  </CanvaElementWrapper>
                );
              })}
            </div>
          </section>
        )}

        {section.type === 'faq' && (
          <section className={`max-w-3xl mx-auto px-6 ${spacingPad}`}>
            <div className="mb-8">
              {section.kicker && (
                <CanvaElementWrapper
                  elementKey="kicker"
                  label="Kicker"
                  transform={getTransform('kicker')}
                  isSelected={isElSelected('kicker')}
                  isPreview={isPreview}
                  isEditingText={editingField === 'kicker'}
                  supportsTextEdit
                  onSelect={() => selectEl('kicker')}
                  onStartEditText={() => setEditingField('kicker')}
                  onChangeTransform={(next) => updateTransform('kicker', next)}
                  className="inline-block mb-2"
                >
                  <p
                    className="text-xs font-semibold tracking-wide"
                    style={{ color: effectiveDark ? '#93c5fd' : accentHex }}
                  >
                    <InlineEditableText
                      value={section.kicker}
                      isEditing={editingField === 'kicker'}
                      onCommit={(val) => patchSection({ kicker: val })}
                      onStopEdit={() => setEditingField(null)}
                    />
                  </p>
                </CanvaElementWrapper>
              )}

              <CanvaElementWrapper
                elementKey="title"
                label="Judul FAQ"
                transform={getTransform('title')}
                isSelected={isElSelected('title')}
                isPreview={isPreview}
                isEditingText={editingField === 'title'}
                supportsTextEdit
                onSelect={() => selectEl('title')}
                onStartEditText={() => setEditingField('title')}
                onChangeTransform={(next) => updateTransform('title', next)}
              >
                <h2
                  style={{ fontFamily: fontPair.headingFont, textWrap: 'balance' }}
                  className="text-2xl md:text-3xl font-bold tracking-tight"
                >
                  <InlineEditableText
                    value={section.title}
                    multiline
                    isEditing={editingField === 'title'}
                    onCommit={(val) => patchSection({ title: val })}
                    onStopEdit={() => setEditingField(null)}
                  />
                </h2>
              </CanvaElementWrapper>
            </div>
            <div className={`border-t ${surface.border}`}>
              {(section.items || []).map((item) => {
                const isOpen = Boolean(openFaqIds[item.id]);
                const faqKey = `item_${item.id}`;
                return (
                  <div key={item.id} className={`border-b ${surface.border}`}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFaq(item.id);
                      }}
                      onDoubleClick={(e) => {
                        if (isPreview) return;
                        e.stopPropagation();
                        setEditingField(`${faqKey}_title`);
                      }}
                      className="w-full py-4 text-left flex items-center justify-between gap-4 font-semibold text-base"
                    >
                      <InlineEditableText
                        value={item.title}
                        isEditing={editingField === `${faqKey}_title`}
                        onCommit={(val) => updateItem(item.id, { title: val })}
                        onStopEdit={() => setEditingField(null)}
                      />
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform duration-150 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p
                        onDoubleClick={(e) => {
                          if (isPreview) return;
                          e.stopPropagation();
                          setEditingField(`${faqKey}_desc`);
                        }}
                        className={`pb-4 text-sm ${surface.muted} leading-relaxed`}
                      >
                        <InlineEditableText
                          value={item.description}
                          multiline
                          isEditing={editingField === `${faqKey}_desc`}
                          onCommit={(val) => updateItem(item.id, { description: val })}
                          onStopEdit={() => setEditingField(null)}
                        />
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
              <CanvaElementWrapper
                elementKey="kicker"
                label="Kicker"
                transform={getTransform('kicker')}
                isSelected={isElSelected('kicker')}
                isPreview={isPreview}
                isEditingText={editingField === 'kicker'}
                supportsTextEdit
                onSelect={() => selectEl('kicker')}
                onStartEditText={() => setEditingField('kicker')}
                onChangeTransform={(next) => updateTransform('kicker', next)}
                className="inline-block mb-3"
              >
                <p
                  className="text-xs font-semibold tracking-wide"
                  style={{ color: effectiveDark ? '#93c5fd' : accentHex }}
                >
                  <InlineEditableText
                    value={section.kicker}
                    isEditing={editingField === 'kicker'}
                    onCommit={(val) => patchSection({ kicker: val })}
                    onStopEdit={() => setEditingField(null)}
                  />
                </p>
              </CanvaElementWrapper>
            )}

            <CanvaElementWrapper
              elementKey="title"
              label="Judul CTA"
              transform={getTransform('title')}
              isSelected={isElSelected('title')}
              isPreview={isPreview}
              isEditingText={editingField === 'title'}
              supportsTextEdit
              supportsFontSize
              onSelect={() => selectEl('title')}
              onStartEditText={() => setEditingField('title')}
              onChangeTransform={(next) => updateTransform('title', next)}
              className="mb-4"
            >
              <h2
                style={fontStyleWithDelta(
                  { fontFamily: fontPair.headingFont, textWrap: 'balance' },
                  'title',
                  isMobile ? 24 : 36
                )}
                className={`${isMobile ? 'text-2xl' : 'text-3xl md:text-4xl'} font-bold tracking-tight`}
              >
                <InlineEditableText
                  value={section.title}
                  multiline
                  isEditing={editingField === 'title'}
                  onCommit={(val) => patchSection({ title: val })}
                  onStopEdit={() => setEditingField(null)}
                />
              </h2>
            </CanvaElementWrapper>

            {section.subtitle && (
              <CanvaElementWrapper
                elementKey="subtitle"
                label="Subjudul CTA"
                transform={getTransform('subtitle')}
                isSelected={isElSelected('subtitle')}
                isPreview={isPreview}
                isEditingText={editingField === 'subtitle'}
                supportsTextEdit
                onSelect={() => selectEl('subtitle')}
                onStartEditText={() => setEditingField('subtitle')}
                onChangeTransform={(next) => updateTransform('subtitle', next)}
                className="max-w-xl mx-auto mb-8"
              >
                <p className={`text-base ${surface.muted} leading-relaxed`}>
                  <InlineEditableText
                    value={section.subtitle}
                    multiline
                    isEditing={editingField === 'subtitle'}
                    onCommit={(val) => patchSection({ subtitle: val })}
                    onStopEdit={() => setEditingField(null)}
                  />
                </p>
              </CanvaElementWrapper>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3">
              {section.primaryCta && (
                <CanvaElementWrapper
                  elementKey="primaryCta"
                  label="Tombol Utama"
                  transform={getTransform('primaryCta')}
                  isSelected={isElSelected('primaryCta')}
                  isPreview={isPreview}
                  isEditingText={editingField === 'primaryCta'}
                  supportsTextEdit
                  customToolbarContent={
                    <>
                      {renderButtonShapePopover('cta_shape')}
                      {renderIconQuickPopover('cta_icon', section.ctaIcon, (icon) =>
                        patchSection({ ctaIcon: icon })
                      )}
                    </>
                  }
                  onSelect={() => selectEl('primaryCta')}
                  onStartEditText={() => setEditingField('primaryCta')}
                  onChangeTransform={(next) => updateTransform('primaryCta', next)}
                >
                  <a
                    href="#mulai"
                    onClick={preventNavClick}
                    style={primaryBtn.style}
                    className={primaryBtn.className}
                  >
                    <InlineEditableText
                      value={section.primaryCta}
                      isEditing={editingField === 'primaryCta'}
                      onCommit={(val) => patchSection({ primaryCta: val })}
                      onStopEdit={() => setEditingField(null)}
                    />
                    {section.ctaIcon && renderIconById(section.ctaIcon, 'w-4 h-4')}
                  </a>
                </CanvaElementWrapper>
              )}

              {section.secondaryCta && (
                <CanvaElementWrapper
                  elementKey="secondaryCta"
                  label="Tombol Sekunder"
                  transform={getTransform('secondaryCta')}
                  isSelected={isElSelected('secondaryCta')}
                  isPreview={isPreview}
                  isEditingText={editingField === 'secondaryCta'}
                  supportsTextEdit
                  onSelect={() => selectEl('secondaryCta')}
                  onStartEditText={() => setEditingField('secondaryCta')}
                  onChangeTransform={(next) => updateTransform('secondaryCta', next)}
                >
                  <a
                    href="#info"
                    onClick={preventNavClick}
                    className={`inline-block px-5 py-2.5 text-sm font-semibold border ${surface.border} ${secondaryShapeClass} whitespace-nowrap hover:opacity-80 transition-opacity`}
                  >
                    <InlineEditableText
                      value={section.secondaryCta}
                      isEditing={editingField === 'secondaryCta'}
                      onCommit={(val) => patchSection({ secondaryCta: val })}
                      onStopEdit={() => setEditingField(null)}
                    />
                  </a>
                </CanvaElementWrapper>
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
                <CanvaElementWrapper
                  elementKey="brand"
                  label="Merek Footer"
                  transform={getTransform('brand')}
                  isSelected={isElSelected('brand')}
                  isPreview={isPreview}
                  isEditingText={editingField === 'brand'}
                  supportsTextEdit
                  customToolbarContent={renderIconQuickPopover(
                    'footer_brand_icon',
                    section.brandIcon,
                    (icon) => patchSection({ brandIcon: icon })
                  )}
                  onSelect={() => selectEl('brand')}
                  onStartEditText={() => setEditingField('brand')}
                  onChangeTransform={(next) => updateTransform('brand', next)}
                  className="inline-block mb-1"
                >
                  <div
                    style={{ fontFamily: fontPair.headingFont }}
                    className="font-bold text-base flex items-center gap-2"
                  >
                    {section.brandIcon && (
                      <span style={{ color: accentHex }}>
                        {renderIconById(section.brandIcon, 'w-4 h-4')}
                      </span>
                    )}
                    <InlineEditableText
                      value={section.brandName || 'Studio'}
                      isEditing={editingField === 'brand'}
                      onCommit={(val) => patchSection({ brandName: val })}
                      onStopEdit={() => setEditingField(null)}
                    />
                  </div>
                </CanvaElementWrapper>

                <CanvaElementWrapper
                  elementKey="title"
                  label="Hak Cipta"
                  transform={getTransform('title')}
                  isSelected={isElSelected('title')}
                  isPreview={isPreview}
                  isEditingText={editingField === 'title'}
                  supportsTextEdit
                  onSelect={() => selectEl('title')}
                  onStartEditText={() => setEditingField('title')}
                  onChangeTransform={(next) => updateTransform('title', next)}
                >
                  <p className={`text-xs ${surface.muted}`}>
                    <InlineEditableText
                      value={section.title}
                      isEditing={editingField === 'title'}
                      onCommit={(val) => patchSection({ title: val })}
                      onStopEdit={() => setEditingField(null)}
                    />
                  </p>
                </CanvaElementWrapper>

                {section.subtitle && (
                  <CanvaElementWrapper
                    elementKey="subtitle"
                    label="Kontak Footer"
                    transform={getTransform('subtitle')}
                    isSelected={isElSelected('subtitle')}
                    isPreview={isPreview}
                    isEditingText={editingField === 'subtitle'}
                    supportsTextEdit
                    onSelect={() => selectEl('subtitle')}
                    onStartEditText={() => setEditingField('subtitle')}
                    onChangeTransform={(next) => updateTransform('subtitle', next)}
                    className="mt-1"
                  >
                    <p className={`text-xs ${surface.muted}`}>
                      <InlineEditableText
                        value={section.subtitle}
                        isEditing={editingField === 'subtitle'}
                        onCommit={(val) => patchSection({ subtitle: val })}
                        onStopEdit={() => setEditingField(null)}
                      />
                    </p>
                  </CanvaElementWrapper>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6">
                {(section.links || []).map((link, idx) => {
                  const linkKey = `link_${idx}`;
                  return (
                    <CanvaElementWrapper
                      key={`${linkKey}_${idx}`}
                      elementKey={linkKey}
                      label="Link Footer"
                      transform={getTransform(linkKey)}
                      isSelected={isElSelected(linkKey)}
                      isPreview={isPreview}
                      isEditingText={editingField === linkKey}
                      supportsTextEdit
                      onSelect={() => selectEl(linkKey)}
                      onStartEditText={() => setEditingField(linkKey)}
                      onChangeTransform={(next) => updateTransform(linkKey, next)}
                    >
                      <a
                        href={link.href}
                        onClick={preventNavClick}
                        className={`text-sm ${surface.muted} hover:opacity-80 whitespace-nowrap`}
                      >
                        <InlineEditableText
                          value={link.label}
                          isEditing={editingField === linkKey}
                          onCommit={(val) => {
                            const next = [...(section.links || [])];
                            next[idx] = { ...next[idx], label: val };
                            patchSection({ links: next });
                          }}
                          onStopEdit={() => setEditingField(null)}
                        />
                      </a>
                    </CanvaElementWrapper>
                  );
                })}
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};
