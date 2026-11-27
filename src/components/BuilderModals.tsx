import React, { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  FileCode2,
  FolderArchive,
  FolderTree,
  Loader2,
  X,
} from 'lucide-react';
import { BuilderProject } from '../types/builder';
import { generateProjectHtml } from '../utils/exportHtml';
import { buildProjectFiles, generateProjectZipBlob } from '../utils/exportProjectZip';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: BuilderProject;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, project }) => {
  const [exportTab, setExportTab] = useState<'zip' | 'html'>('zip');
  const [selectedFilePath, setSelectedFilePath] = useState('src/App.tsx');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const projectFiles = buildProjectFiles(project);
  const selectedFile =
    projectFiles.find((f) => f.path === selectedFilePath) || projectFiles[0];
  const htmlCode = generateProjectHtml(project);

  const assetPaths = Array.from(
    new Set(
      project.sections
        .flatMap((s) => [s.imageUrl, s.backgroundImage])
        .filter((u): u is string => Boolean(u && u.startsWith('/src/assets/')))
    )
  );

  const handleCopy = async () => {
    const textToCopy = exportTab === 'zip' ? selectedFile.content : htmlCode;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/\s+/g, '-') || 'halaman'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const blob = await generateProjectZipBlob(project);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const slug =
        project.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || 'proyek-rancang';
      a.download = `${slug}-aistudio.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[86vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Ekspor Proyek Website</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Unduh struktur proyek React lengkap (.zip) atau satu berkas HTML mandiri.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setExportTab('zip')}
                className={`px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 whitespace-nowrap ${
                  exportTab === 'zip'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FolderArchive className="w-3.5 h-3.5" />
                <span>Proyek ZIP (src/)</span>
              </button>
              <button
                type="button"
                onClick={() => setExportTab('html')}
                className={`px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 whitespace-nowrap ${
                  exportTab === 'html'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>HTML Mandiri</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        {exportTab === 'zip' ? (
          <div className="flex-1 flex overflow-hidden min-h-[420px]">
            {/* File Tree */}
            <div className="w-64 shrink-0 border-r border-slate-200 bg-slate-50 overflow-y-auto p-3 space-y-1">
              <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-slate-500 mb-1">
                <FolderTree className="w-3.5 h-3.5" />
                <span>Struktur Berkas ({projectFiles.length + assetPaths.length})</span>
              </div>
              {projectFiles.map((file) => {
                const active = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => setSelectedFilePath(file.path)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-mono truncate transition-colors ${
                      active
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-slate-700 hover:bg-slate-200/70'
                    }`}
                  >
                    {file.path}
                  </button>
                );
              })}
              {assetPaths.length > 0 && (
                <div className="pt-2 mt-2 border-t border-slate-200">
                  <div className="px-2 py-1 text-[10px] font-semibold text-slate-500">
                    Aset Gambar Terbundel ({assetPaths.length})
                  </div>
                  {assetPaths.map((asset) => (
                    <div
                      key={asset}
                      className="px-2.5 py-1 text-[11px] font-mono text-slate-500 truncate"
                      title={asset}
                    >
                      {asset.replace(/^\//, '')}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Code Preview */}
            <div className="flex-1 overflow-auto p-4 bg-slate-950">
              <div className="text-[11px] font-mono text-slate-400 pb-2 mb-3 border-b border-slate-800">
                {selectedFile.path}
              </div>
              <pre className="text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-wrap">
                {selectedFile.content}
              </pre>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-4 bg-slate-950 min-h-[420px]">
            <pre className="text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-wrap">
              {htmlCode}
            </pre>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between gap-3 bg-slate-50">
          <p className="text-[11px] text-slate-500">
            {exportTab === 'zip'
              ? 'Berisi package.json, vite.config.ts, tsconfig.json, metadata.json, dan folder src/ siap dijalankan.'
              : 'Berisi satu berkas index.html lengkap dengan Tailwind CSS CDN.'}
          </p>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 flex items-center gap-1.5 whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{exportTab === 'zip' ? 'Salin Berkas Ini' : 'Salin Kode'}</span>
                </>
              )}
            </button>

            {exportTab === 'zip' ? (
              <button
                type="button"
                disabled={isZipping}
                onClick={handleDownloadZip}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
              >
                {isZipping ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengemas ZIP...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Proyek (.zip)</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDownloadHtml}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1.5 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh index.html</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, category: string, description: string) => void;
  defaultName: string;
}

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultName,
}) => {
  const [name, setName] = useState(defaultName);
  const [category, setCategory] = useState('Template Kustom');
  const [description, setDescription] = useState(
    'Susunan tata letak kustom yang disimpan dari kanvas editor.'
  );

  useEffect(() => {
    if (isOpen) setName(defaultName);
  }, [isOpen, defaultName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), category.trim() || 'Template Kustom', description.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Simpan sebagai Template Kustom</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nama Template
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Kategori</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Deskripsi</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 resize-none"
            />
          </div>
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Simpan Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
