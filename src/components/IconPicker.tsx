import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ICON_CATALOG, renderIconById } from '../utils/iconRegistry';

interface IconPickerProps {
  label: string;
  value?: string;
  onChange: (iconId: string | undefined) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ label, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = ICON_CATALOG.filter(
    (entry) =>
      !query.trim() ||
      entry.label.toLowerCase().includes(query.toLowerCase()) ||
      entry.id.toLowerCase().includes(query.toLowerCase())
  );

  const activeEntry = ICON_CATALOG.find((i) => i.id === value);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-700">{label}</span>
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-[11px] text-slate-400 hover:text-red-600 flex items-center gap-0.5"
          >
            <X className="w-3 h-3" />
            Hapus
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md hover:border-blue-500 flex items-center justify-between gap-2"
      >
        <span className="flex items-center gap-2 text-slate-800 truncate">
          {value ? (
            <>
              <span className="p-1 rounded bg-slate-100 text-slate-700">
                {renderIconById(value, 'w-3.5 h-3.5')}
              </span>
              <span>{activeEntry?.label || value}</span>
            </>
          ) : (
            <span className="text-slate-400">Tanpa ikon</span>
          )}
        </span>
        <span className="text-[11px] text-blue-600 font-medium shrink-0">
          {open ? 'Tutup' : 'Pilih'}
        </span>
      </button>

      {open && (
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari ikon..."
            className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-600"
          />
          <div className="grid grid-cols-6 gap-1.5 max-h-40 overflow-y-auto">
            {filtered.map((entry) => {
              const selected = value === entry.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  title={entry.label}
                  onClick={() => {
                    onChange(entry.id);
                    setOpen(false);
                  }}
                  className={`h-8 rounded-md border flex items-center justify-center transition-colors ${
                    selected
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                  }`}
                >
                  <entry.Component className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
