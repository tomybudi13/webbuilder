import React, { useEffect, useRef, useState } from 'react';
import {
  Minus,
  Move,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { ElementTransform } from '../types/builder';

interface CanvaElementWrapperProps {
  elementKey: string;
  label: string;
  transform?: ElementTransform;
  isSelected: boolean;
  isPreview: boolean;
  isEditingText?: boolean;
  supportsTextEdit?: boolean;
  supportsFontSize?: boolean;
  supportsResize?: boolean;
  supportsDelete?: boolean;
  toolbarPosition?: 'top' | 'bottom';
  customToolbarContent?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onSelect: () => void;
  onStartEditText?: () => void;
  onChangeTransform: (next: ElementTransform) => void;
  onDelete?: () => void;
  children: React.ReactNode;
}

export const CanvaElementWrapper: React.FC<CanvaElementWrapperProps> = ({
  label,
  transform,
  isSelected,
  isPreview,
  isEditingText = false,
  supportsTextEdit = false,
  supportsFontSize = false,
  supportsResize = false,
  supportsDelete = false,
  toolbarPosition = 'top',
  customToolbarContent,
  className = '',
  style,
  onSelect,
  onStartEditText,
  onChangeTransform,
  onDelete,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragState = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: boolean;
  } | null>(null);

  const resizeState = useRef<{
    startX: number;
    origWidthPct: number;
  } | null>(null);

  const currentX = transform?.x ?? 0;
  const currentY = transform?.y ?? 0;
  const currentWidthPct = transform?.widthPct ?? 100;
  const currentFontDelta = transform?.fontSizeDelta ?? 0;

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging && dragState.current) {
        const dx = e.clientX - dragState.current.startX;
        const dy = e.clientY - dragState.current.startY;
        if (!dragState.current.moved && Math.hypot(dx, dy) < 4) {
          return;
        }
        dragState.current.moved = true;
        let nextX = Math.round(dragState.current.origX + dx);
        let nextY = Math.round(dragState.current.origY + dy);
        if (Math.abs(nextX) <= 5) nextX = 0;
        if (Math.abs(nextY) <= 5) nextY = 0;
        onChangeTransform({
          ...transform,
          x: nextX,
          y: nextY,
        });
      }

      if (isResizing && resizeState.current) {
        const dx = e.clientX - resizeState.current.startX;
        const nextPct = Math.max(35, Math.min(130, Math.round(resizeState.current.origWidthPct + dx * 0.25)));
        onChangeTransform({
          ...transform,
          x: currentX,
          y: currentY,
          widthPct: nextPct,
        });
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      dragState.current = null;
      resizeState.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, isResizing, transform, currentX, currentY, onChangeTransform]);

  const appliedStyle: React.CSSProperties = {
    ...style,
    transform:
      currentX !== 0 || currentY !== 0
        ? `translate(${currentX}px, ${currentY}px)`
        : style?.transform,
    width:
      supportsResize && currentWidthPct !== 100
        ? `${currentWidthPct}%`
        : style?.width,
  };

  if (isPreview) {
    return (
      <div className={className} style={appliedStyle}>
        {children}
      </div>
    );
  }

  const hasModifiedTransform =
    currentX !== 0 ||
    currentY !== 0 ||
    (currentWidthPct !== 100 && supportsResize) ||
    currentFontDelta !== 0;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isEditingText) return;
    if ((e.target as HTMLElement).closest('[data-canva-control="true"]')) return;
    e.stopPropagation();
    onSelect();

    if (e.button !== 0) return;
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: currentX,
      origY: currentY,
      moved: false,
    };
    setIsDragging(true);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!supportsTextEdit || !onStartEditText) return;
    e.stopPropagation();
    onSelect();
    onStartEditText();
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      style={appliedStyle}
      className={`relative group/el ${
        isEditingText ? 'cursor-text' : isDragging ? 'cursor-grabbing z-40' : 'cursor-grab'
      } ${
        isSelected
          ? 'ring-2 ring-blue-600 ring-offset-2 ring-offset-transparent z-30'
          : 'hover:ring-1 hover:ring-blue-400/80 hover:ring-offset-1'
      } ${className}`}
    >
      {/* Corner Canva Handles when selected */}
      {isSelected && !isEditingText && (
        <>
          <span className="pointer-events-none absolute -top-1 -left-1 w-2 h-2 bg-white border border-blue-600 rounded-[1px]" />
          <span className="pointer-events-none absolute -top-1 -right-1 w-2 h-2 bg-white border border-blue-600 rounded-[1px]" />
          <span className="pointer-events-none absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-blue-600 rounded-[1px]" />
          {supportsResize ? (
            <button
              type="button"
              data-canva-control="true"
              title="Seret untuk ubah ukuran"
              onPointerDown={(e) => {
                e.stopPropagation();
                resizeState.current = {
                  startX: e.clientX,
                  origWidthPct: currentWidthPct,
                };
                setIsResizing(true);
              }}
              className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-600 border border-white rounded-full cursor-nwse-resize z-40 shadow"
            />
          ) : (
            <span className="pointer-events-none absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-blue-600 rounded-[1px]" />
          )}
        </>
      )}

      {/* Dragging coordinate indicator */}
      {isDragging && dragState.current?.moved && (
        <div className="pointer-events-none absolute -top-7 left-0 z-50 px-1.5 py-0.5 bg-slate-900 text-white text-[10px] font-mono rounded shadow whitespace-nowrap tabular-nums">
          X: {currentX}px · Y: {currentY}px
        </div>
      )}

      {/* Floating Canva Mini Toolbar */}
      {isSelected && !isEditingText && !isDragging && (
        <div
          data-canva-control="true"
          onClick={(e) => e.stopPropagation()}
          className={`absolute left-0 ${
            toolbarPosition === 'bottom' ? '-bottom-9' : '-top-9'
          } z-50 flex items-center gap-1 bg-slate-900 text-white px-2 py-1 rounded-md shadow-lg text-[11px] whitespace-nowrap`}
        >
          <span className="inline-flex items-center gap-1 text-slate-300 pr-1.5 border-r border-slate-700 font-medium">
            <Move className="w-3 h-3 text-blue-400" />
            <span>{label}</span>
          </span>

          {supportsTextEdit && onStartEditText && (
            <button
              type="button"
              onClick={onStartEditText}
              title="Edit teks langsung"
              className="px-1.5 py-0.5 hover:bg-slate-800 rounded inline-flex items-center gap-1"
            >
              <Pencil className="w-3 h-3" />
              <span>Edit</span>
            </button>
          )}

          {supportsFontSize && (
            <div className="flex items-center gap-0.5 px-1 border-l border-slate-700">
              <button
                type="button"
                title="Perkecil ukuran teks"
                onClick={() =>
                  onChangeTransform({
                    ...transform,
                    x: currentX,
                    y: currentY,
                    fontSizeDelta: Math.max(-10, currentFontDelta - 2),
                  })
                }
                className="p-0.5 hover:bg-slate-800 rounded"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-[10px] font-mono px-0.5 tabular-nums">
                {currentFontDelta > 0 ? `+${currentFontDelta}` : currentFontDelta}
              </span>
              <button
                type="button"
                title="Perbesar ukuran teks"
                onClick={() =>
                  onChangeTransform({
                    ...transform,
                    x: currentX,
                    y: currentY,
                    fontSizeDelta: Math.min(20, currentFontDelta + 2),
                  })
                }
                className="p-0.5 hover:bg-slate-800 rounded"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}

          {customToolbarContent}

          {hasModifiedTransform && (
            <button
              type="button"
              onClick={() =>
                onChangeTransform({ x: 0, y: 0, widthPct: 100, fontSizeDelta: 0 })
              }
              title="Reset posisi & ukuran"
              className="p-1 hover:bg-slate-800 rounded text-amber-300"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}

          {supportsDelete && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="Hapus elemen"
              className="p-1 hover:bg-red-600 rounded text-red-300 hover:text-white"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {children}
    </div>
  );
};
