import React, { useRef, useState } from 'react';
import {
  BookmarkPlus,
  GripVertical,
  LayoutGrid,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
  Wand2,
} from 'lucide-react';
import {
  ACCENT_PRESETS,
  BACKGROUND_PATTERNS,
  BLOCK_CATALOG,
  STOCK_BACKGROUNDS,
} from '../data/presets';
import {
  AccentPresetId,
  BackgroundOverlay,
  BackgroundPattern,
  CustomTemplate,
  SectionType,
  UploadedBackground,
} from '../types/builder';
import { ICON_CATALOG } from '../utils/iconRegistry';

export type SidebarTab = 'blocks' | 'templates' | 'assets' | 'ai';

interface LeftSidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  onAddBlock: (type: SectionType) => void;
  templates: CustomTemplate[];
  onApplyTemplate: (template: CustomTemplate) => void;
  onDeleteCustomTemplate: (id: string) => void;
  onOpenSaveTemplate: () => void;
  onApplyStockBackground: (url: string, overlay: BackgroundOverlay) => void;
  onApplyPattern: (pattern: BackgroundPattern) => void;
  onApplyIconToSelected: (iconId: string) => void;
  uploadedBackgrounds: UploadedBackground[];
  onUploadBackground: (file: File) => void;
  onDeleteUploadedBackground: (id: string) => void;
  hasSelectedSection: boolean;
  onGenerateAiLayout: (params: {
    prompt: string;
    stylePreset: string;
    accentPreference: string;
    mode: 'replace' | 'append';
  }) => Promise<void>;
  isGeneratingAi: boolean;
  aiError: string | null;
}

const AI_QUICK_PROMPTS = [
  'Buatkan halaman arahan untuk studio arsitektur tropis di Bandung dengan portofolio dan formulir konsultasi',
  'Situs peluncuran produk teh artisan Nusantara dengan cerita petani, varian rasa, dan paket langganan',
  'Platform SaaS pembukuan otomatis untuk UMKM dengan tabel perbandingan harga dan FAQ lengkap',
];

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTab,
  onTabChange,
  onAddBlock,
  templates,
  onApplyTemplate,
  onDeleteCustomTemplate,
  onOpenSaveTemplate,
  onApplyStockBackground,
  onApplyPattern,
  onApplyIconToSelected,
  uploadedBackgrounds,
  onUploadBackground,
  onDeleteUploadedBackground,
  hasSelectedSection,
  onGenerateAiLayout,
  isGeneratingAi,
  aiError,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [blockSearch, setBlockSearch] = useState('');
  const [blockCat, setBlockCat] = useState<'Semua' | 'Struktur' | 'Konten' | 'Konversi'>('Semua');
  const [templateFilter, setTemplateFilter] = useState<'Semua' | 'Kustom'>('Semua');

  const [assetSubTab, setAssetSubTab] = useState<'backgrounds' | 'icons'>('backgrounds');
  const [bgFilter, setBgFilter] = useState('Semua');
  const [iconSearch, setIconSearch] = useState('');

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState('Minimalis Editorial');
  const [aiAccent, setAiAccent] = useState<'auto' | AccentPresetId>('auto');
  const [aiMode, setAiMode] = useState<'replace' | 'append'>('replace');

  const filteredBlocks = BLOCK_CATALOG.filter((b) => {
    const matchesCat = blockCat === 'Semua' || b.category === blockCat;
    const q = blockSearch.trim().toLowerCase();
    const matchesSearch =
      !q || b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const visibleTemplates = templates.filter((t) =>
    templateFilter === 'Kustom' ? Boolean(t.isCustom) : true
  );

  const allBackgrounds = [
    ...uploadedBackgrounds.map((u) => ({ ...u, isUploaded: true })),
    ...STOCK_BACKGROUNDS.map((s) => ({ ...s, isUploaded: false })),
  ];

  const filteredBackgrounds = allBackgrounds.filter(
    (bg) => bgFilter === 'Semua' || bg.category === bgFilter
  );

  const filteredIcons = ICON_CATALOG.filter((ic) => {
    const q = iconSearch.trim().toLowerCase();
    return !q || ic.label.toLowerCase().includes(q) || ic.category.toLowerCase().includes(q);
  });

  const handleDragStartBlock = (e: React.DragEvent, type: SectionType) => {
    e.dataTransfer.setData('application/x-rancang-block-type', type);
    e.dataTransfer.setData('text/plain', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragStartBg = (
    e: React.DragEvent,
    url: string,
    overlay: BackgroundOverlay
  ) => {
    e.dataTransfer.setData(
      'application/x-rancang-bg',
      JSON.stringify({ url, overlay })
    );
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isGeneratingAi) return;
    await onGenerateAiLayout({
      prompt: aiPrompt,
      stylePreset: aiStyle,
      accentPreference: aiAccent,
      mode: aiMode,
    });
  };

  return (
    <aside className="w-[288px] shrink-0 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden select-none">
      {/* Segmented Sidebar Switch */}
      <div className="p-3 border-b border-slate-200">
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => onTabChange('blocks')}
            className={`px-1.5 py-1.5 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'blocks'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Komponen
          </button>
          <button
            type="button"
            onClick={() => onTabChange('templates')}
            className={`px-1.5 py-1.5 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'templates'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Template
          </button>
          <button
            type="button"
            onClick={() => onTabChange('assets')}
            className={`px-1.5 py-1.5 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'assets'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Aset
          </button>
          <button
            type="button"
            onClick={() => onTabChange('ai')}
            className={`px-1.5 py-1.5 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap flex items-center justify-center gap-1 ${
              activeTab === 'ai'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wand2 className="w-3 h-3 shrink-0" />
            <span>AI</span>
          </button>
        </div>
      </div>

      {/* Panel Body */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'blocks' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={blockSearch}
                onChange={(e) => setBlockSearch(e.target.value)}
                placeholder="Cari blok komponen..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {(['Semua', 'Struktur', 'Konten', 'Konversi'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setBlockCat(cat)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    blockCat === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 leading-snug">
              Seret komponen ke kanvas atau klik tambah untuk menyisipkan di bagian bawah.
            </p>

            <div className="space-y-2">
              {filteredBlocks.map((block) => (
                <div
                  key={block.type}
                  draggable
                  onDragStart={(e) => handleDragStartBlock(e, block.type)}
                  className="group p-2.5 bg-white border border-slate-200 rounded-lg hover:border-blue-500 transition-colors cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <GripVertical className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0 group-hover:text-blue-600" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {block.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {block.description}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAddBlock(block.type)}
                      title={`Tambah ${block.name}`}
                      className="p-1.5 rounded-md bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {filteredBlocks.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500">
                  Tidak ada komponen yang cocok dengan pencarian Anda.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={onOpenSaveTemplate}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">Simpan Kanvas sebagai Template</span>
            </button>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setTemplateFilter('Semua')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
                  templateFilter === 'Semua'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({templates.length})
              </button>
              <button
                type="button"
                onClick={() => setTemplateFilter('Kustom')}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
                  templateFilter === 'Kustom'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Template Saya ({templates.filter((t) => t.isCustom).length})
              </button>
            </div>

            <div className="space-y-3">
              {visibleTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="border border-slate-200 rounded-lg overflow-hidden bg-white"
                >
                  <div className="h-28 bg-slate-100 overflow-hidden border-b border-slate-200">
                    <img
                      src={tpl.thumbnailUrl}
                      alt={tpl.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <div className="text-[11px] text-slate-500 mb-1 flex items-center gap-1.5">
                      <span>{tpl.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{tpl.sections.length} blok</span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-900 mb-1">{tpl.name}</h4>
                    <p className="text-[11px] text-slate-600 leading-snug mb-3">
                      {tpl.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onApplyTemplate(tpl)}
                        className="flex-1 py-1.5 px-3 text-xs font-medium bg-slate-900 text-white rounded-md hover:bg-blue-600 transition-colors whitespace-nowrap"
                      >
                        Terapkan Template
                      </button>
                      {tpl.isCustom && (
                        <button
                          type="button"
                          onClick={() => onDeleteCustomTemplate(tpl.id)}
                          title="Hapus template kustom"
                          className="p-1.5 text-slate-500 hover:text-red-600 border border-slate-200 rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {visibleTemplates.length === 0 && (
                <div className="text-center py-8 px-3 border border-dashed border-slate-200 rounded-lg">
                  <LayoutGrid className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 mb-1 font-medium">
                    Belum ada template kustom tersimpan
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Susun blok Anda lalu klik Simpan Kanvas sebagai Template di atas.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setAssetSubTab('backgrounds')}
                className={`py-1 text-xs font-medium rounded-md ${
                  assetSubTab === 'backgrounds'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                Stock Latar
              </button>
              <button
                type="button"
                onClick={() => setAssetSubTab('icons')}
                className={`py-1 text-xs font-medium rounded-md ${
                  assetSubTab === 'icons'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                Galeri Ikon
              </button>
            </div>

            {assetSubTab === 'backgrounds' && (
              <div className="space-y-4">
                <div>
                  <div className="text-[11px] font-semibold text-slate-700 mb-2">
                    Pola & Gradien Cepat
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {BACKGROUND_PATTERNS.map((pat) => (
                      <button
                        key={pat.id}
                        type="button"
                        onClick={() => onApplyPattern(pat.id)}
                        className="p-2 border border-slate-200 rounded-md hover:border-blue-600 text-left flex items-center gap-2 bg-white"
                      >
                        <span
                          className={`w-5 h-5 rounded border border-slate-200 shrink-0 ${pat.previewClass}`}
                        />
                        <span className="text-[11px] font-medium text-slate-700 truncate">
                          {pat.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold text-slate-700">
                      Stock Foto Latar Belakang
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onUploadBackground(file);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2 py-1 text-[11px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-600 hover:text-white transition-colors inline-flex items-center gap-1 shrink-0 whitespace-nowrap"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1 overflow-x-auto pb-2">
                    {['Semua', 'Upload Saya', 'Arsitektur', 'Kreatif', 'Alam', 'Tekstur', 'Kuliner'].map(
                      (cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setBgFilter(cat)}
                          className={`px-2 py-1 text-[10px] font-medium rounded whitespace-nowrap shrink-0 ${
                            bgFilter === cat
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {cat}
                        </button>
                      )
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2 leading-snug">
                    Klik atau seret foto langsung ke blok pada kanvas untuk memasang latar belakang.
                  </p>
                  <div className="space-y-2.5">
                    {filteredBackgrounds.map((bg) => (
                      <div
                        key={bg.id}
                        draggable
                        onDragStart={(e) =>
                          handleDragStartBg(e, bg.url, bg.recommendedOverlay)
                        }
                        className="border border-slate-200 rounded-lg overflow-hidden bg-white hover:border-blue-500 transition-colors cursor-grab active:cursor-grabbing"
                      >
                        <div className="h-24 bg-slate-100 overflow-hidden relative">
                          <img
                            src={bg.url}
                            alt={bg.label}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-[11px] font-semibold text-slate-900 truncate">
                              {bg.label}
                            </div>
                            <div className="text-[10px] text-slate-500">{bg.category}</div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                onApplyStockBackground(bg.url, bg.recommendedOverlay)
                              }
                              className="px-2.5 py-1 text-[11px] font-medium bg-slate-900 text-white rounded hover:bg-blue-600 transition-colors shrink-0"
                            >
                              Pasang
                            </button>
                            {bg.isUploaded && (
                              <button
                                type="button"
                                onClick={() => onDeleteUploadedBackground(bg.id)}
                                title="Hapus gambar unggahan"
                                className="p-1 text-slate-400 hover:text-red-600 border border-slate-200 rounded"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {assetSubTab === 'icons' && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    placeholder="Cari nama ikon..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-blue-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {hasSelectedSection
                    ? 'Klik ikon untuk langsung memasangnya pada blok yang sedang dipilih.'
                    : 'Pilih salah satu blok di kanvas terlebih dahulu, lalu klik ikon di bawah.'}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {filteredIcons.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => onApplyIconToSelected(entry.id)}
                      className="p-2.5 border border-slate-200 rounded-lg bg-white hover:border-blue-600 hover:text-blue-600 flex flex-col items-center gap-1.5 transition-colors"
                    >
                      <entry.Component className="w-4 h-4" />
                      <span className="text-[10px] text-slate-600 truncate w-full text-center">
                        {entry.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ai' && (
          <form onSubmit={handleAiSubmit} className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 mb-1">
                Generator Tata Letak Otomatis
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Jelaskan jenis bisnis, tujuan halaman, dan gaya yang Anda inginkan. AI akan menyusun
                struktur blok lengkap dengan teks siap pakai.
              </p>
            </div>

            <div>
              <label
                htmlFor="ai-prompt-input"
                className="block text-[11px] font-medium text-slate-700 mb-1.5"
              >
                Deskripsi Website
              </label>
              <textarea
                id="ai-prompt-input"
                rows={4}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Contoh: Buatkan website untuk klinik fisioterapi modern di Jakarta dengan daftar layanan, testimoni pasien, dan harga paket..."
                className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 resize-none leading-relaxed"
              />
            </div>

            <div>
              <div className="text-[11px] font-medium text-slate-700 mb-1.5">Contoh Cepat</div>
              <div className="space-y-1.5">
                {AI_QUICK_PROMPTS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAiPrompt(sample)}
                    className="w-full text-left p-2 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded-md hover:border-blue-500 hover:text-slate-900 transition-colors leading-snug"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
                Gaya Visual
              </label>
              <select
                value={aiStyle}
                onChange={(e) => setAiStyle(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-600"
              >
                <option value="Minimalis Editorial">Minimalis Editorial</option>
                <option value="Korporat Modern">Korporat Modern</option>
                <option value="Katalog Produk">Katalog Produk</option>
                <option value="Hangat Artisan">Hangat Artisan</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
                Warna Aksen
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                <button
                  type="button"
                  onClick={() => setAiAccent('auto')}
                  className={`py-1.5 text-[11px] font-medium rounded-md border ${
                    aiAccent === 'auto'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Auto
                </button>
                {(Object.keys(ACCENT_PRESETS) as AccentPresetId[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    title={ACCENT_PRESETS[key].label}
                    onClick={() => setAiAccent(key)}
                    className={`h-7 rounded-md border flex items-center justify-center ${
                      aiAccent === key ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-sm"
                      style={{ backgroundColor: ACCENT_PRESETS[key].hex }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1.5">
                Mode Penerapan
              </label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setAiMode('replace')}
                  className={`py-1 text-[11px] font-medium rounded-md ${
                    aiMode === 'replace' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Buat Baru
                </button>
                <button
                  type="button"
                  onClick={() => setAiMode('append')}
                  className={`py-1 text-[11px] font-medium rounded-md ${
                    aiMode === 'append' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Tambah ke Kanvas
                </button>
              </div>
            </div>

            {aiError && (
              <div className="p-2.5 text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-md leading-snug">
                {aiError}
              </div>
            )}

            <button
              type="submit"
              disabled={isGeneratingAi || aiPrompt.trim().length < 4}
              className="w-full py-2.5 px-4 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {isGeneratingAi ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyusun Tata Letak...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Hasilkan Tata Letak</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </aside>
  );
};
