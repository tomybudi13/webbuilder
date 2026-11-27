import React, { useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Layers,
  Loader2,
  Palette,
  Plus,
  Trash2,
  Upload,
  Wand2,
  X,
} from 'lucide-react';
import {
  ACCENT_PRESETS,
  BACKGROUND_PATTERNS,
  BUTTON_SHAPES,
  FONT_PAIRINGS,
  NAV_LINK_STYLES,
  STOCK_BACKGROUNDS,
  STUDIO_IMAGES,
  createId,
} from '../data/presets';
import {
  AccentPresetId,
  BuilderSection,
  ButtonShape,
  FontPairingId,
  PageTheme,
  SectionItem,
  UploadedBackground,
} from '../types/builder';
import { IconPicker } from './IconPicker';

interface RightInspectorProps {
  sections: BuilderSection[];
  selectedSection: BuilderSection | null;
  theme: PageTheme;
  uploadedBackgrounds: UploadedBackground[];
  onUploadBackground: (file: File, applyToSectionId?: string) => void;
  onSelectSection: (id: string | null) => void;
  onUpdateSection: (id: string, patch: Partial<BuilderSection>) => void;
  onDeleteSection: (id: string) => void;
  onDuplicateSection: (id: string) => void;
  onMoveSection: (id: string, direction: 'up' | 'down') => void;
  onUpdateTheme: (patch: Partial<PageTheme>) => void;
  onRefineSectionAi: (section: BuilderSection, instruction: string) => Promise<void>;
  isRefiningAi: boolean;
  refineError: string | null;
}

export const RightInspector: React.FC<RightInspectorProps> = ({
  sections,
  selectedSection,
  theme,
  uploadedBackgrounds,
  onUploadBackground,
  onSelectSection,
  onUpdateSection,
  onDeleteSection,
  onDuplicateSection,
  onMoveSection,
  onUpdateTheme,
  onRefineSectionAi,
  isRefiningAi,
  refineError,
}) => {
  const bgUploadRef = useRef<HTMLInputElement | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'content' | 'layout'>('content');
  const [aiInstruction, setAiInstruction] = useState('');

  if (!selectedSection) {
    return (
      <aside className="w-[308px] shrink-0 bg-white border-l border-slate-200 flex flex-col h-full overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
          <Palette className="w-4 h-4 text-slate-600" />
          <h2 className="text-xs font-semibold text-slate-900">Tema & Struktur Halaman</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Font Pairing */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-2">
              Pasangan Tipografi
            </label>
            <div className="space-y-2">
              {(Object.keys(FONT_PAIRINGS) as FontPairingId[]).map((key) => {
                const pair = FONT_PAIRINGS[key];
                const active = theme.fontPairing === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onUpdateTheme({ fontPairing: key })}
                    className={`w-full text-left p-2.5 rounded-lg border transition-colors ${
                      active
                        ? 'border-blue-600 bg-blue-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div
                      style={{ fontFamily: pair.headingFont }}
                      className="text-xs font-semibold text-slate-900"
                    >
                      {pair.label}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      {pair.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-2">
              Warna Aksen Utama
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(ACCENT_PRESETS) as AccentPresetId[]).map((key) => {
                const preset = ACCENT_PRESETS[key];
                const active = theme.accentId === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      onUpdateTheme({ accentId: key, accentColor: preset.hex })
                    }
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-colors ${
                      active
                        ? 'border-blue-600 bg-blue-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-sm shrink-0"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span className="text-xs font-medium text-slate-800 truncate">
                      {preset.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Global Button Shape */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-2">
              Bentuk Tombol Bawaan
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {BUTTON_SHAPES.map((btn) => {
                const active = (theme.buttonShape || 'rounded') === btn.id;
                return (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => onUpdateTheme({ buttonShape: btn.id })}
                    className={`p-2 text-left rounded-md border transition-colors ${
                      active
                        ? 'border-blue-600 bg-blue-50/60 text-blue-800'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-[11px] font-semibold truncate">{btn.label}</div>
                    <div className="text-[10px] text-slate-500 truncate">{btn.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Corner Radius */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-2">
              Kelengkungan Kartu
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
              {(
                [
                  { id: 'sharp', label: 'Tegas' },
                  { id: 'rounded', label: 'Standar' },
                  { id: 'soft', label: 'Lembut' },
                ] as const
              ).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onUpdateTheme({ radius: r.id })}
                  className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                    theme.radius === r.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Layer Tree */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                <Layers className="w-3.5 h-3.5" />
                <span>Susunan Blok ({sections.length})</span>
              </div>
            </div>
            <div className="space-y-1.5">
              {sections.map((sec, index) => (
                <div
                  key={sec.id}
                  className="flex items-center justify-between gap-2 p-2 bg-slate-50 border border-slate-200 rounded-md hover:border-blue-500 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => onSelectSection(sec.id)}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="text-xs font-medium text-slate-900 truncate">
                      <span className="text-slate-400 tabular-nums mr-1.5">{index + 1}.</span>
                      {sec.label}
                    </div>
                  </button>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => onMoveSection(sec.id, 'up')}
                      className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                      title="Geser ke atas"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={index === sections.length - 1}
                      onClick={() => onMoveSection(sec.id, 'down')}
                      className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                      title="Geser ke bawah"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  const updateItem = (itemId: string, patch: Partial<SectionItem>) => {
    const nextItems = (selectedSection.items || []).map((item) =>
      item.id === itemId ? { ...item, ...patch } : item
    );
    onUpdateSection(selectedSection.id, { items: nextItems });
  };

  const addItem = () => {
    const newItem: SectionItem = {
      id: createId('item'),
      icon: selectedSection.type === 'features' ? 'sparkles' : undefined,
      title: selectedSection.type === 'pricing' ? 'Paket Baru' : 'Poin Baru',
      description: 'Deskripsi ringkas untuk elemen ini.',
      meta: selectedSection.type === 'testimonials' ? 'Klien · Perusahaan' : 'Label Tambahan',
      price: selectedSection.type === 'pricing' ? 'Rp 2,5 jt' : undefined,
      ctaLabel: selectedSection.type === 'pricing' ? 'Pilih Paket' : undefined,
      features: selectedSection.type === 'pricing' ? ['Fitur Utama 1', 'Fitur Utama 2'] : undefined,
    };
    onUpdateSection(selectedSection.id, {
      items: [...(selectedSection.items || []), newItem],
    });
  };

  const removeItem = (itemId: string) => {
    onUpdateSection(selectedSection.id, {
      items: (selectedSection.items || []).filter((it) => it.id !== itemId),
    });
  };

  const handleRefineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInstruction.trim() || isRefiningAi) return;
    await onRefineSectionAi(selectedSection, aiInstruction);
    setAiInstruction('');
  };

  const showImageControls =
    selectedSection.type === 'hero' ||
    selectedSection.type === 'split' ||
    selectedSection.type === 'testimonials';

  const supportsButtonShapes =
    selectedSection.type === 'navbar' ||
    selectedSection.type === 'hero' ||
    selectedSection.type === 'split' ||
    selectedSection.type === 'pricing' ||
    selectedSection.type === 'cta';

  const getVariantOptions = () => {
    if (selectedSection.type === 'hero') {
      return [
        { id: 'split-right', label: 'Gambar di Kanan' },
        { id: 'split-left', label: 'Gambar di Kiri' },
        { id: 'centered', label: 'Teks Terpusat' },
      ];
    }
    if (selectedSection.type === 'split') {
      return [
        { id: 'split-left', label: 'Gambar di Kiri' },
        { id: 'split-right', label: 'Gambar di Kanan' },
      ];
    }
    if (selectedSection.type === 'features' || selectedSection.type === 'pricing') {
      return [
        { id: 'columns-3', label: '3 Kolom' },
        { id: 'columns-2', label: '2 Kolom' },
      ];
    }
    return [];
  };

  const variantOptions = getVariantOptions();

  return (
    <aside className="w-[308px] shrink-0 bg-white border-l border-slate-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => onSelectSection(null)}
            className="text-[11px] text-blue-600 hover:underline block"
          >
            ← Tema Global
          </button>
          <h2 className="text-xs font-semibold text-slate-900 truncate">
            {selectedSection.label}
          </h2>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onDuplicateSection(selectedSection.id)}
            title="Duplikat blok"
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteSection(selectedSection.id)}
            title="Hapus blok"
            className="p-1.5 text-slate-500 hover:text-red-600 rounded-md hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="px-4 pt-3">
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setInspectorTab('content')}
            className={`py-1 text-xs font-medium rounded-md ${
              inspectorTab === 'content' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Konten & Ikon
          </button>
          <button
            type="button"
            onClick={() => setInspectorTab('layout')}
            className={`py-1 text-xs font-medium rounded-md ${
              inspectorTab === 'layout' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Tombol & Latar
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Quick AI Section Refiner */}
        <form
          onSubmit={handleRefineSubmit}
          className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
            <Wand2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Sempurnakan Blok dengan AI</span>
          </div>
          <input
            type="text"
            value={aiInstruction}
            onChange={(e) => setAiInstruction(e.target.value)}
            placeholder="Misal: Buat nada kalimat lebih ringkas..."
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-600"
          />
          {refineError && <p className="text-[11px] text-red-600">{refineError}</p>}
          <button
            type="submit"
            disabled={isRefiningAi || !aiInstruction.trim()}
            className="w-full py-1.5 text-[11px] font-semibold bg-slate-900 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
          >
            {isRefiningAi ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Memperbarui...</span>
              </>
            ) : (
              <span>Terapkan Perubahan AI</span>
            )}
          </button>
        </form>

        {inspectorTab === 'content' && (
          <div className="space-y-3">
            {(selectedSection.type === 'navbar' || selectedSection.type === 'footer') && (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Nama Merek
                  </label>
                  <input
                    type="text"
                    value={selectedSection.brandName || ''}
                    onChange={(e) =>
                      onUpdateSection(selectedSection.id, { brandName: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-blue-600"
                  />
                </div>
                <IconPicker
                  label="Ikon Merek"
                  value={selectedSection.brandIcon}
                  onChange={(icon) =>
                    onUpdateSection(selectedSection.id, { brandIcon: icon })
                  }
                />
              </>
            )}

            {selectedSection.type !== 'navbar' && selectedSection.type !== 'footer' && (
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Label Pengantar (Kicker)
                </label>
                <input
                  type="text"
                  value={selectedSection.kicker || ''}
                  onChange={(e) =>
                    onUpdateSection(selectedSection.id, { kicker: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-blue-600"
                />
              </div>
            )}

            {selectedSection.type !== 'navbar' && (
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  {selectedSection.type === 'footer' ? 'Teks Hak Cipta' : 'Judul Utama'}
                </label>
                <textarea
                  rows={2}
                  value={selectedSection.title}
                  onChange={(e) =>
                    onUpdateSection(selectedSection.id, { title: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>
            )}

            {(selectedSection.type === 'hero' ||
              selectedSection.type === 'features' ||
              selectedSection.type === 'pricing' ||
              selectedSection.type === 'cta' ||
              selectedSection.type === 'footer') && (
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  {selectedSection.type === 'footer' ? 'Alamat / Kontak' : 'Subjudul'}
                </label>
                <textarea
                  rows={3}
                  value={selectedSection.subtitle || ''}
                  onChange={(e) =>
                    onUpdateSection(selectedSection.id, { subtitle: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>
            )}

            {selectedSection.type === 'split' && (
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Paragraf Isi
                </label>
                <textarea
                  rows={4}
                  value={selectedSection.body || ''}
                  onChange={(e) =>
                    onUpdateSection(selectedSection.id, { body: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>
            )}

            {(selectedSection.type === 'navbar' ||
              selectedSection.type === 'hero' ||
              selectedSection.type === 'split' ||
              selectedSection.type === 'cta') && (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    {selectedSection.type === 'navbar'
                      ? 'Teks Tombol Menu Utama'
                      : 'Teks Tombol Utama'}
                  </label>
                  <input
                    type="text"
                    value={selectedSection.primaryCta || ''}
                    onChange={(e) =>
                      onUpdateSection(selectedSection.id, { primaryCta: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-blue-600"
                  />
                </div>
                <IconPicker
                  label="Ikon Tombol Utama"
                  value={selectedSection.ctaIcon}
                  onChange={(icon) =>
                    onUpdateSection(selectedSection.id, { ctaIcon: icon })
                  }
                />
              </>
            )}

            {(selectedSection.type === 'hero' || selectedSection.type === 'cta') && (
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Teks Tombol Sekunder
                </label>
                <input
                  type="text"
                  value={selectedSection.secondaryCta || ''}
                  onChange={(e) =>
                    onUpdateSection(selectedSection.id, { secondaryCta: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-blue-600"
                />
              </div>
            )}

            {showImageControls && (
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <label className="block text-[11px] font-semibold text-slate-700">
                  Pilih Gambar Konten
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STUDIO_IMAGES.map((img) => {
                    const active = selectedSection.imageUrl === img.url;
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() =>
                          onUpdateSection(selectedSection.id, {
                            imageUrl: img.url,
                            imageAlt: img.label,
                          })
                        }
                        className={`rounded-md overflow-hidden border text-left ${
                          active ? 'border-blue-600 ring-1 ring-blue-600' : 'border-slate-200'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={img.label}
                          className="w-full h-14 object-cover"
                        />
                        <div className="p-1 text-[10px] font-medium text-slate-700 truncate">
                          {img.category}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation Links Editor */}
            {selectedSection.links && (
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-700">Daftar Tautan</span>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSection(selectedSection.id, {
                        links: [...(selectedSection.links || []), { label: 'Tautan', href: '#' }],
                      })
                    }
                    className="text-[11px] text-blue-600 font-medium flex items-center gap-0.5 hover:underline"
                  >
                    <Plus className="w-3 h-3" />
                    Tambah
                  </button>
                </div>
                {selectedSection.links.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => {
                        const next = [...(selectedSection.links || [])];
                        next[idx] = { ...next[idx], label: e.target.value };
                        onUpdateSection(selectedSection.id, { links: next });
                      }}
                      className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = (selectedSection.links || []).filter((_, i) => i !== idx);
                        onUpdateSection(selectedSection.id, { links: next });
                      }}
                      className="p-1 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Items Editor (Features, Pricing, Testimonials, FAQ) */}
            {selectedSection.items && (
              <div className="pt-3 border-t border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-700">
                    Daftar Elemen ({selectedSection.items.length})
                  </span>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-[11px] text-blue-600 font-medium flex items-center gap-0.5 hover:underline"
                  >
                    <Plus className="w-3 h-3" />
                    Tambah Item
                  </button>
                </div>

                {selectedSection.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-md space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-500 tabular-nums">
                        Item #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    {selectedSection.type === 'features' && (
                      <IconPicker
                        label="Ikon Kartu"
                        value={item.icon}
                        onChange={(icon) => updateItem(item.id, { icon })}
                      />
                    )}
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateItem(item.id, { title: e.target.value })}
                      placeholder="Judul item"
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                    />
                    {selectedSection.type === 'pricing' && (
                      <input
                        type="text"
                        value={item.price || ''}
                        onChange={(e) => updateItem(item.id, { price: e.target.value })}
                        placeholder="Harga (misal Rp 4,5 jt)"
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                      />
                    )}
                    {selectedSection.type !== 'faq' && (
                      <input
                        type="text"
                        value={item.meta || ''}
                        onChange={(e) => updateItem(item.id, { meta: e.target.value })}
                        placeholder="Sub-label / peran"
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                      />
                    )}
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => updateItem(item.id, { description: e.target.value })}
                      placeholder="Deskripsi"
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded resize-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {inspectorTab === 'layout' && (
          <div className="space-y-4">
            {/* Navbar Menu Link Buttons Style */}
            {selectedSection.type === 'navbar' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-2">
                  Gaya Tautan Menu Navigasi
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {NAV_LINK_STYLES.map((st) => {
                    const active = (selectedSection.navLinkStyle || 'plain') === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() =>
                          onUpdateSection(selectedSection.id, { navLinkStyle: st.id })
                        }
                        className={`px-2.5 py-2 text-xs font-medium rounded-md border text-left ${
                          active
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Button Shape Selector */}
            {supportsButtonShapes && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Bentuk Tombol {selectedSection.type === 'navbar' ? 'Menu' : 'Aksi'}
                  </label>
                  {selectedSection.buttonShape && (
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSection(selectedSection.id, { buttonShape: undefined })
                      }
                      className="text-[10px] text-blue-600 hover:underline"
                    >
                      Ikuti Tema
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {BUTTON_SHAPES.map((btn) => {
                    const currentShape: ButtonShape =
                      selectedSection.buttonShape || theme.buttonShape || 'rounded';
                    const active = currentShape === btn.id;
                    return (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() =>
                          onUpdateSection(selectedSection.id, { buttonShape: btn.id })
                        }
                        className={`p-2 rounded-md border text-left transition-colors ${
                          active
                            ? 'border-blue-600 bg-blue-50 text-blue-800'
                            : 'border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-[11px] font-semibold truncate">{btn.label}</div>
                        <div className="text-[10px] text-slate-500 truncate">{btn.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {variantOptions.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-2">
                  Varian Komposisi
                </label>
                <div className="space-y-1.5">
                  {variantOptions.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() =>
                        onUpdateSection(selectedSection.id, {
                          variant: v.id as BuilderSection['variant'],
                        })
                      }
                      className={`w-full text-left px-3 py-2 text-xs font-medium rounded-md border ${
                        selectedSection.variant === v.id
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-2">
                Latar Permukaan
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
                {(
                  [
                    { id: 'light', label: 'Terang' },
                    { id: 'muted', label: 'Netral' },
                    { id: 'dark', label: 'Gelap' },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onUpdateSection(selectedSection.id, { surface: s.id })}
                    className={`py-1.5 text-xs font-medium rounded-md ${
                      selectedSection.surface === s.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Pattern */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-2">
                Pola Latar Belakang
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {BACKGROUND_PATTERNS.map((pat) => {
                  const active = (selectedSection.backgroundPattern || 'none') === pat.id;
                  return (
                    <button
                      key={pat.id}
                      type="button"
                      onClick={() =>
                        onUpdateSection(selectedSection.id, {
                          backgroundPattern: pat.id,
                          backgroundImage: undefined,
                        })
                      }
                      className={`px-2.5 py-1.5 text-[11px] font-medium rounded-md border text-left flex items-center gap-2 ${
                        active
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-xs border border-slate-300 shrink-0 ${pat.previewClass}`}
                      />
                      <span className="truncate">{pat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stock Background Photography */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <label className="text-[11px] font-semibold text-slate-700 truncate">
                    Stock Foto Latar Belakang
                  </label>
                  <input
                    ref={bgUploadRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onUploadBackground(file, selectedSection.id);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => bgUploadRef.current?.click()}
                    className="px-2 py-0.5 text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-600 hover:text-white transition-colors inline-flex items-center gap-1 shrink-0 whitespace-nowrap"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload</span>
                  </button>
                </div>
                {selectedSection.backgroundImage && (
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSection(selectedSection.id, {
                        backgroundImage: undefined,
                        backgroundOverlay: undefined,
                      })
                    }
                    className="text-[11px] text-red-600 flex items-center gap-0.5 hover:underline shrink-0"
                  >
                    <X className="w-3 h-3" />
                    Lepas
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[...uploadedBackgrounds, ...STOCK_BACKGROUNDS].map((bg) => {
                  const active = selectedSection.backgroundImage === bg.url;
                  return (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() =>
                        onUpdateSection(selectedSection.id, {
                          backgroundImage: bg.url,
                          backgroundOverlay: bg.recommendedOverlay,
                          backgroundPattern: 'none',
                        })
                      }
                      className={`rounded-md overflow-hidden border text-left ${
                        active ? 'border-blue-600 ring-1 ring-blue-600' : 'border-slate-200'
                      }`}
                    >
                      <img
                        src={bg.url}
                        alt={bg.label}
                        className="w-full h-12 object-cover"
                      />
                      <div className="p-1 text-[10px] font-medium text-slate-700 truncate">
                        {bg.label}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedSection.backgroundImage && (
                <div className="pt-1">
                  <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
                    Overlay Keterbacaan Teks
                  </label>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
                    {(
                      [
                        { id: 'dark', label: 'Gelap' },
                        { id: 'light', label: 'Terang' },
                        { id: 'none', label: 'Murni' },
                      ] as const
                    ).map((ov) => (
                      <button
                        key={ov.id}
                        type="button"
                        onClick={() =>
                          onUpdateSection(selectedSection.id, { backgroundOverlay: ov.id })
                        }
                        className={`py-1 text-[11px] font-medium rounded-md ${
                          (selectedSection.backgroundOverlay || 'dark') === ov.id
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600'
                        }`}
                      >
                        {ov.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-2">
                Ruang Vertikal
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg">
                {(
                  [
                    { id: 'compact', label: 'Ringkas' },
                    { id: 'standard', label: 'Standar' },
                    { id: 'spacious', label: 'Lega' },
                  ] as const
                ).map((sp) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => onUpdateSection(selectedSection.id, { spacing: sp.id })}
                    className={`py-1.5 text-xs font-medium rounded-md ${
                      selectedSection.spacing === sp.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-2">
                Perataan Judul
              </label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => onUpdateSection(selectedSection.id, { align: 'left' })}
                  className={`py-1.5 text-xs font-medium rounded-md ${
                    selectedSection.align === 'left'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  Rata Kiri
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSection(selectedSection.id, { align: 'center' })}
                  className={`py-1.5 text-xs font-medium rounded-md ${
                    selectedSection.align === 'center'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600'
                  }`}
                >
                  Rata Tengah
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
