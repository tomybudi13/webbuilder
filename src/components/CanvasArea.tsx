import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  GripVertical,
  LayoutTemplate,
  Monitor,
  Plus,
  Redo2,
  Smartphone,
  Tablet,
  Trash2,
  Undo2,
  Wand2,
} from 'lucide-react';
import {
  BackgroundOverlay,
  BuilderSection,
  FloatingCanvasElement,
  PageTheme,
  SectionType,
  ViewportDevice,
} from '../types/builder';
import { SectionRenderer } from './SectionRenderer';

interface CanvasAreaProps {
  projectTitle: string;
  onChangeProjectTitle: (title: string) => void;
  sections: BuilderSection[];
  theme: PageTheme;
  selectedId: string | null;
  onSelectSection: (id: string | null) => void;
  selectedElementKey: string | null;
  onSelectElement: (key: string | null) => void;
  onUpdateSection: (id: string, patch: Partial<BuilderSection>) => void;
  onDropFloatingElement: (
    sectionId: string,
    kind: FloatingCanvasElement['kind'],
    x: number,
    y: number
  ) => void;
  device: ViewportDevice;
  onChangeDevice: (device: ViewportDevice) => void;
  isPreviewMode: boolean;
  onExitPreview: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClearCanvas: () => void;
  onDropNewBlock: (type: SectionType, insertIndex: number) => void;
  onDropBackgroundOnSection: (
    sectionId: string,
    url: string,
    overlay: BackgroundOverlay
  ) => void;
  onReorderBlock: (sourceId: string, targetIndex: number) => void;
  onMoveSection: (id: string, direction: 'up' | 'down') => void;
  onDuplicateSection: (id: string) => void;
  onDeleteSection: (id: string) => void;
  onOpenAiTab: () => void;
  onOpenTemplateTab: () => void;
  isGeneratingAi: boolean;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  projectTitle,
  onChangeProjectTitle,
  sections,
  theme,
  selectedId,
  onSelectSection,
  selectedElementKey,
  onSelectElement,
  onUpdateSection,
  onDropFloatingElement,
  device,
  onChangeDevice,
  isPreviewMode,
  onExitPreview,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClearCanvas,
  onDropNewBlock,
  onDropBackgroundOnSection,
  onReorderBlock,
  onMoveSection,
  onDuplicateSection,
  onDeleteSection,
  onOpenAiTab,
  onOpenTemplateTab,
  isGeneratingAi,
}) => {
  const [dropSlotIndex, setDropSlotIndex] = useState<number | null>(null);
  const [draggingSectionId, setDraggingSectionId] = useState<string | null>(null);
  const [bgHoverSectionId, setBgHoverSectionId] = useState<string | null>(null);
  const [floatHoverSectionId, setFloatHoverSectionId] = useState<string | null>(null);

  const canvasWidthClass =
    device === 'mobile'
      ? 'w-[390px]'
      : device === 'tablet'
        ? 'w-[768px]'
        : 'w-full max-w-[1200px]';

  const handleSlotDragOver = (e: React.DragEvent, index: number) => {
    if (
      e.dataTransfer.types.includes('application/x-rancang-bg') ||
      e.dataTransfer.types.includes('application/x-rancang-floating-kind')
    ) {
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = draggingSectionId ? 'move' : 'copy';
    if (dropSlotIndex !== index) {
      setDropSlotIndex(index);
    }
  };

  const handleSlotDrop = (e: React.DragEvent, index: number) => {
    if (
      e.dataTransfer.types.includes('application/x-rancang-bg') ||
      e.dataTransfer.types.includes('application/x-rancang-floating-kind')
    ) {
      return;
    }
    e.preventDefault();
    setDropSlotIndex(null);

    const newBlockType = e.dataTransfer.getData('application/x-rancang-block-type') as SectionType;
    const reorderId = e.dataTransfer.getData('application/x-rancang-reorder-id');

    if (reorderId) {
      onReorderBlock(reorderId, index);
      setDraggingSectionId(null);
      return;
    }

    if (newBlockType) {
      onDropNewBlock(newBlockType, index);
    }
  };

  const handleCanvasBackgroundDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDropSlotIndex(null);
    setBgHoverSectionId(null);
    setFloatHoverSectionId(null);
    const newBlockType = e.dataTransfer.getData('application/x-rancang-block-type') as SectionType;
    if (newBlockType) {
      onDropNewBlock(newBlockType, sections.length);
    }
  };

  const handleSectionDragOver = (e: React.DragEvent, sectionId: string) => {
    if (e.dataTransfer.types.includes('application/x-rancang-bg')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      if (bgHoverSectionId !== sectionId) {
        setBgHoverSectionId(sectionId);
      }
      return;
    }
    if (e.dataTransfer.types.includes('application/x-rancang-floating-kind')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      if (floatHoverSectionId !== sectionId) {
        setFloatHoverSectionId(sectionId);
      }
    }
  };

  const handleSectionDrop = (e: React.DragEvent, sectionId: string) => {
    const bgData = e.dataTransfer.getData('application/x-rancang-bg');
    if (bgData) {
      e.preventDefault();
      e.stopPropagation();
      setBgHoverSectionId(null);
      try {
        const parsed = JSON.parse(bgData) as { url: string; overlay: BackgroundOverlay };
        onDropBackgroundOnSection(sectionId, parsed.url, parsed.overlay);
      } catch {
        // ignore malformed drag payload
      }
      return;
    }

    const floatKind = e.dataTransfer.getData(
      'application/x-rancang-floating-kind'
    ) as FloatingCanvasElement['kind'];
    if (floatKind) {
      e.preventDefault();
      e.stopPropagation();
      setFloatHoverSectionId(null);
      const rect = e.currentTarget.getBoundingClientRect();
      const relX = Math.max(12, Math.min(rect.width - 140, Math.round(e.clientX - rect.left - 40)));
      const relY = Math.max(12, Math.min(rect.height - 48, Math.round(e.clientY - rect.top - 16)));
      onDropFloatingElement(sectionId, floatKind, relX, relY);
    }
  };

  const renderDropSlot = (index: number) => {
    if (isPreviewMode) return null;
    const isActive = dropSlotIndex === index;
    return (
      <div
        key={`slot_${index}`}
        onDragOver={(e) => handleSlotDragOver(e, index)}
        onDragLeave={() => setDropSlotIndex((prev) => (prev === index ? null : prev))}
        onDrop={(e) => handleSlotDrop(e, index)}
        className={`relative transition-all duration-150 ${
          isActive
            ? 'h-10 bg-blue-50 border-y-2 border-blue-600 flex items-center justify-center'
            : 'h-2 -my-1 z-10'
        }`}
      >
        {isActive && (
          <span className="text-[11px] font-semibold text-blue-700 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" />
            Lepaskan blok di sini
          </span>
        )}
      </div>
    );
  };

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden studio-grid-bg">
      {/* Canvas Sub-Toolbar */}
      <div className="h-11 shrink-0 bg-white border-b border-slate-200 px-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => onChangeProjectTitle(e.target.value)}
            aria-label="Nama Proyek"
            className="text-xs font-semibold text-slate-900 bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-600 focus:bg-white rounded px-2 py-1 focus:outline-none truncate max-w-[210px]"
          />
          <span className="text-slate-300" aria-hidden="true">
            /
          </span>
          <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap">
            {sections.length} blok
          </span>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => onChangeDevice('desktop')}
            title="Tampilan Desktop"
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
              device === 'desktop'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeDevice('tablet')}
            title="Tampilan Tablet (768px)"
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
              device === 'tablet'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeDevice('mobile')}
            title="Tampilan Seluler (390px)"
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
              device === 'mobile'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Seluler</span>
          </button>
        </div>

        {/* History & Canvas Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!isPreviewMode ? (
            <>
              <button
                type="button"
                onClick={onUndo}
                disabled={!canUndo}
                title="Urungkan (Undo)"
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md disabled:opacity-30"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onRedo}
                disabled={!canRedo}
                title="Ulangi (Redo)"
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md disabled:opacity-30"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
              {sections.length > 0 && (
                <button
                  type="button"
                  onClick={onClearCanvas}
                  className="ml-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors whitespace-nowrap"
                >
                  Kosongkan
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={onExitPreview}
              className="px-3 py-1 text-xs font-semibold bg-slate-900 text-white rounded-md hover:bg-blue-600 transition-colors whitespace-nowrap"
            >
              Kembali ke Editor
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Canvas Viewport */}
      <div
        className="flex-1 overflow-y-auto p-6 md:p-8 flex justify-center items-start"
        onClick={() => {
          if (!isPreviewMode) {
            onSelectElement(null);
            onSelectSection(null);
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleCanvasBackgroundDrop}
      >
        <div
          className={`${canvasWidthClass} bg-white shadow-sm border border-slate-200 rounded-lg ${
            isPreviewMode ? 'overflow-hidden' : ''
          } transition-[width] duration-200 min-h-[540px] relative`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Loading Overlay during AI Generation */}
          {isGeneratingAi && (
            <div className="p-8 space-y-6 bg-white">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
                <Wand2 className="w-4 h-4 animate-pulse" />
                <span>Sedang merancang tata letak otomatis dengan AI...</span>
              </div>
              <div className="h-10 bg-slate-100 rounded animate-pulse w-full" />
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-6 space-y-3 py-6">
                  <div className="h-4 bg-slate-100 rounded w-1/3 animate-pulse" />
                  <div className="h-10 bg-slate-100 rounded w-full animate-pulse" />
                  <div className="h-16 bg-slate-100 rounded w-5/6 animate-pulse" />
                </div>
                <div className="col-span-6 h-64 bg-slate-100 rounded-lg animate-pulse" />
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="h-36 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-36 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-36 bg-slate-100 rounded-lg animate-pulse" />
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isGeneratingAi && sections.length === 0 && (
            <div
              onDragOver={(e) => handleSlotDragOver(e, 0)}
              onDrop={(e) => handleSlotDrop(e, 0)}
              className={`min-h-[540px] flex flex-col items-center justify-center p-10 text-center border-2 border-dashed m-4 rounded-lg transition-colors ${
                dropSlotIndex === 0 ? 'border-blue-600 bg-blue-50/40' : 'border-slate-200'
              }`}
            >
              <LayoutTemplate className="w-9 h-9 text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                Kanvas Desain Masih Kosong
              </h3>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed mb-6">
                Seret komponen dari panel kiri ke area ini, pilih salah satu template kustom siap
                pakai, atau biarkan AI menyusun tata letak otomatis untuk Anda.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onOpenAiTab}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Buat dengan AI</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenTemplateTab}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 whitespace-nowrap"
                >
                  Pilih Template Kustom
                </button>
              </div>
            </div>
          )}

          {/* Sections Stack */}
          {!isGeneratingAi && sections.length > 0 && (
            <div>
              {renderDropSlot(0)}
              {sections.map((section, idx) => {
                const isSelected = !isPreviewMode && selectedId === section.id;
                const isBgDropHover = !isPreviewMode && bgHoverSectionId === section.id;
                const isFloatDropHover = !isPreviewMode && floatHoverSectionId === section.id;
                return (
                  <React.Fragment key={section.id}>
                    <div
                      onClick={() => {
                        if (!isPreviewMode) {
                          onSelectElement(null);
                          onSelectSection(section.id);
                        }
                      }}
                      onDragOver={(e) => handleSectionDragOver(e, section.id)}
                      onDragLeave={() => {
                        setBgHoverSectionId((prev) => (prev === section.id ? null : prev));
                        setFloatHoverSectionId((prev) => (prev === section.id ? null : prev));
                      }}
                      onDrop={(e) => handleSectionDrop(e, section.id)}
                      className={`relative group ${
                        !isPreviewMode ? 'cursor-pointer' : ''
                      } ${
                        isBgDropHover
                          ? 'ring-2 ring-inset ring-emerald-500 z-30'
                          : isFloatDropHover
                            ? 'ring-2 ring-inset ring-blue-500 z-30'
                            : isSelected
                              ? 'ring-2 ring-inset ring-blue-600 z-20'
                              : !isPreviewMode
                                ? 'hover:ring-1 hover:ring-inset hover:ring-blue-400'
                                : ''
                      }`}
                    >
                      {isBgDropHover && (
                        <div className="absolute inset-0 bg-emerald-600/15 z-30 pointer-events-none flex items-center justify-center">
                          <span className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-md shadow">
                            Lepas untuk pasang latar belakang di blok ini
                          </span>
                        </div>
                      )}

                      {isFloatDropHover && (
                        <div className="absolute inset-0 bg-blue-600/10 z-30 pointer-events-none flex items-center justify-center">
                          <span className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-md shadow">
                            Lepas untuk taruh elemen bebas di sini
                          </span>
                        </div>
                      )}

                      {/* Floating Section Action Bar */}
                      {!isPreviewMode && (
                        <div
                          className={`absolute top-2 right-2 z-30 flex items-center gap-1 bg-slate-900 text-white px-2 py-1 rounded-md shadow-md transition-opacity duration-100 ${
                            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div
                            draggable
                            onDragStart={(e) => {
                              setDraggingSectionId(section.id);
                              e.dataTransfer.setData('application/x-rancang-reorder-id', section.id);
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragEnd={() => {
                              setDraggingSectionId(null);
                              setDropSlotIndex(null);
                            }}
                            title="Seret untuk ubah urutan"
                            className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-800 rounded"
                          >
                            <GripVertical className="w-3.5 h-3.5 text-slate-300" />
                          </div>
                          <span className="text-[11px] font-medium px-1.5 border-r border-slate-700 mr-0.5 whitespace-nowrap">
                            {section.label}
                          </span>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => onMoveSection(section.id, 'up')}
                            title="Naikkan"
                            className="p-1 hover:bg-slate-800 rounded disabled:opacity-30"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === sections.length - 1}
                            onClick={() => onMoveSection(section.id, 'down')}
                            title="Turunkan"
                            className="p-1 hover:bg-slate-800 rounded disabled:opacity-30"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDuplicateSection(section.id)}
                            title="Duplikat"
                            className="p-1 hover:bg-slate-800 rounded"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteSection(section.id)}
                            title="Hapus"
                            className="p-1 hover:bg-red-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <SectionRenderer
                        section={section}
                        theme={theme}
                        device={device}
                        isPreview={isPreviewMode}
                        selectedElementKey={selectedElementKey}
                        onSelectElement={onSelectElement}
                        onUpdateSection={(patch) => onUpdateSection(section.id, patch)}
                      />
                    </div>
                    {renderDropSlot(idx + 1)}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
