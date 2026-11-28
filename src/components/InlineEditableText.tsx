import React, { useEffect, useRef } from 'react';

interface InlineEditableTextProps {
  value: string;
  isEditing: boolean;
  multiline?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onCommit: (nextValue: string) => void;
  onStopEdit: () => void;
}

export const InlineEditableText: React.FC<InlineEditableTextProps> = ({
  value,
  isEditing,
  multiline = false,
  className = '',
  style,
  onCommit,
  onStopEdit,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (isEditing) {
      if (multiline && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      } else if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  }, [isEditing, multiline]);

  if (!isEditing) {
    return (
      <span className={className} style={style}>
        {value}
      </span>
    );
  }

  if (multiline) {
    return (
      <textarea
        ref={textareaRef}
        value={value}
        rows={Math.max(2, Math.min(6, Math.ceil(value.length / 42)))}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onChange={(e) => onCommit(e.target.value)}
        onBlur={onStopEdit}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onStopEdit();
          }
        }}
        style={style}
        className={`${className} w-full bg-blue-50/40 outline-2 outline-blue-600 rounded px-1 -mx-1 resize-none`}
      />
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onChange={(e) => onCommit(e.target.value)}
      onBlur={onStopEdit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
          onStopEdit();
        }
      }}
      style={{ ...style, width: `${Math.max(value.length + 2, 8)}ch`, maxWidth: '100%' }}
      className={`${className} bg-blue-50/40 outline-2 outline-blue-600 rounded px-1 -mx-1`}
    />
  );
};
