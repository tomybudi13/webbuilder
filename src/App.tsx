import { useEffect, useState } from 'react';
import { CanvasArea } from './components/CanvasArea';
import { ExportModal, SaveTemplateModal } from './components/BuilderModals';
import { LeftSidebar, SidebarTab } from './components/LeftSidebar';
import { RightInspector } from './components/RightInspector';
import {
  BLOCK_CATALOG,
  BUILT_IN_TEMPLATES,
  STUDIO_IMAGES,
  createId,
} from './data/presets';
import {
  BackgroundOverlay,
  BackgroundPattern,
  BuilderProject,
  BuilderSection,
  CustomTemplate,
  FloatingCanvasElement,
  PageTheme,
  SectionType,
  UploadedBackground,
  ViewportDevice,
} from './types/builder';

const STORAGE_PROJECT_KEY = 'rancang_studio_project_v1';
const STORAGE_TEMPLATES_KEY = 'rancang_studio_custom_templates_v1';
const STORAGE_UPLOADED_BGS_KEY = 'rancang_studio_uploaded_bgs_v1';

function getInitialProject(): BuilderProject {
  try {
    const saved = localStorage.getItem(STORAGE_PROJECT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as BuilderProject;
      if (parsed && Array.isArray(parsed.sections) && parsed.theme) {
        return {
          ...parsed,
          theme: {
            ...parsed.theme,
            buttonShape: parsed.theme.buttonShape || 'rounded',
          },
        };
      }
    }
  } catch {
    // Fallback to initial template
  }
  const starter = BUILT_IN_TEMPLATES[0];
  return {
    title: starter.name,
    theme: starter.theme,
    sections: starter.sections.map((s) => ({ ...s })),
  };
}

function getInitialCustomTemplates(): CustomTemplate[] {
  try {
    const saved = localStorage.getItem(STORAGE_TEMPLATES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as CustomTemplate[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore storage read error
  }
  return [];
}

function getInitialUploadedBackgrounds(): UploadedBackground[] {
  try {
    const saved = localStorage.getItem(STORAGE_UPLOADED_BGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as UploadedBackground[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore storage read error
  }
  return [];
}

export default function App() {
  const [project, setProject] = useState<BuilderProject>(getInitialProject);
  const [history, setHistory] = useState<BuilderProject[]>([]);
  const [future, setFuture] = useState<BuilderProject[]>([]);

  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>(
    getInitialCustomTemplates
  );
  const [uploadedBackgrounds, setUploadedBackgrounds] = useState<UploadedBackground[]>(
    getInitialUploadedBackgrounds
  );
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('blocks');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedElementKey, setSelectedElementKey] = useState<string | null>(null);
  const [device, setDevice] = useState<ViewportDevice>('desktop');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState(false);

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [isRefiningAi, setIsRefiningAi] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);

  // Persist project & custom templates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROJECT_KEY, JSON.stringify(project));
    } catch {
      // ignore quota issues
    }
  }, [project]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TEMPLATES_KEY, JSON.stringify(customTemplates));
    } catch {
      // ignore quota issues
    }
  }, [customTemplates]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_UPLOADED_BGS_KEY, JSON.stringify(uploadedBackgrounds));
    } catch {
      // ignore quota issues
    }
  }, [uploadedBackgrounds]);

  const commitProject = (next: BuilderProject) => {
    setHistory((prev) => [...prev.slice(-24), project]);
    setFuture([]);
    setProject(next);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setFuture((prev) => [project, ...prev]);
    setProject(previous);
    setSelectedId(null);
    setSelectedElementKey(null);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((prev) => prev.slice(1));
    setHistory((prev) => [...prev, project]);
    setProject(next);
    setSelectedId(null);
    setSelectedElementKey(null);
  };

  const handleSelectElement = (key: string | null) => {
    setSelectedElementKey(key);
    if (key && key.includes(':')) {
      const sectionPrefix = key.split(':')[0];
      if (sectionPrefix) {
        setSelectedId(sectionPrefix);
      }
    }
  };

  const handleAddBlock = (type: SectionType, insertIndex?: number) => {
    const catalogItem = BLOCK_CATALOG.find((b) => b.type === type);
    if (!catalogItem) return;
    const newSection = catalogItem.create();
    const idx = insertIndex !== undefined ? insertIndex : project.sections.length;
    const nextSections = [...project.sections];
    nextSections.splice(idx, 0, newSection);
    commitProject({ ...project, sections: nextSections });
    setSelectedId(newSection.id);
  };

  const handleReorderBlock = (sourceId: string, targetIndex: number) => {
    const currentIdx = project.sections.findIndex((s) => s.id === sourceId);
    if (currentIdx === -1) return;
    const nextSections = [...project.sections];
    const [moved] = nextSections.splice(currentIdx, 1);
    const adjustedIndex = currentIdx < targetIndex ? targetIndex - 1 : targetIndex;
    nextSections.splice(Math.max(0, adjustedIndex), 0, moved);
    commitProject({ ...project, sections: nextSections });
    setSelectedId(moved.id);
  };

  const handleMoveSection = (id: string, direction: 'up' | 'down') => {
    const idx = project.sections.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= project.sections.length) return;
    const nextSections = [...project.sections];
    const [item] = nextSections.splice(idx, 1);
    nextSections.splice(targetIdx, 0, item);
    commitProject({ ...project, sections: nextSections });
  };

  const handleDuplicateSection = (id: string) => {
    const idx = project.sections.findIndex((s) => s.id === id);
    if (idx === -1) return;
    const original = project.sections[idx];
    const cloned: BuilderSection = {
      ...original,
      id: createId(original.type),
      items: original.items?.map((it) => ({ ...it, id: createId('item') })),
      links: original.links?.map((l) => ({ ...l })),
      elementTransforms: original.elementTransforms
        ? { ...original.elementTransforms }
        : undefined,
      floatingElements: original.floatingElements?.map((fe) => ({
        ...fe,
        id: createId('fl'),
      })),
    };
    const nextSections = [...project.sections];
    nextSections.splice(idx + 1, 0, cloned);
    commitProject({ ...project, sections: nextSections });
    setSelectedId(cloned.id);
    setSelectedElementKey(null);
  };

  const handleDeleteSection = (id: string) => {
    const nextSections = project.sections.filter((s) => s.id !== id);
    commitProject({ ...project, sections: nextSections });
    if (selectedId === id) {
      setSelectedId(null);
      setSelectedElementKey(null);
    }
  };

  const handleUpdateSection = (id: string, patch: Partial<BuilderSection>) => {
    setProject((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  };

  const handleAddOrDropFloatingElement = (
    sectionId: string | null,
    kind: FloatingCanvasElement['kind'],
    x?: number,
    y?: number
  ) => {
    const newEl: FloatingCanvasElement = {
      id: createId('fl'),
      kind,
      x: x ?? 48 + Math.round(Math.random() * 40),
      y: y ?? 36 + Math.round(Math.random() * 30),
      text: kind === 'text' ? 'Teks Baru' : kind === 'button' ? 'Klik Di Sini' : undefined,
      icon: kind === 'icon' ? 'sparkles' : undefined,
      imageUrl: kind === 'image' ? STUDIO_IMAGES[1].url : undefined,
      buttonShape: kind === 'button' ? project.theme.buttonShape : undefined,
      width: kind === 'image' ? 100 : undefined,
      fontSize: kind === 'text' ? 0 : undefined,
    };

    if (project.sections.length === 0) {
      const heroTemplate = BLOCK_CATALOG.find((b) => b.type === 'hero');
      if (!heroTemplate) return;
      const freshHero = heroTemplate.create();
      freshHero.floatingElements = [newEl];
      commitProject({ ...project, sections: [freshHero] });
      setSelectedId(freshHero.id);
      setSelectedElementKey(`${freshHero.id}:float_${newEl.id}`);
      return;
    }

    const target =
      (sectionId && project.sections.find((s) => s.id === sectionId)) ||
      (selectedId && project.sections.find((s) => s.id === selectedId)) ||
      project.sections.find((s) => s.type !== 'navbar') ||
      project.sections[0];

    if (!target) return;

    commitProject({
      ...project,
      sections: project.sections.map((s) =>
        s.id === target.id
          ? {
              ...s,
              floatingElements: [...(s.floatingElements || []), newEl],
            }
          : s
      ),
    });
    setSelectedId(target.id);
    setSelectedElementKey(`${target.id}:float_${newEl.id}`);
  };

  const handleDropBackgroundOnSection = (
    sectionId: string,
    url: string,
    overlay: BackgroundOverlay
  ) => {
    commitProject({
      ...project,
      sections: project.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              backgroundImage: url,
              backgroundOverlay: overlay,
              backgroundPattern: 'none',
            }
          : s
      ),
    });
    setSelectedId(sectionId);
  };

  const handleApplyStockBackground = (url: string, overlay: BackgroundOverlay) => {
    const target =
      project.sections.find((s) => s.id === selectedId) ||
      project.sections.find((s) => s.type === 'hero') ||
      project.sections[0];
    if (!target) return;
    handleDropBackgroundOnSection(target.id, url, overlay);
  };

  const handleApplyPattern = (pattern: BackgroundPattern) => {
    const target =
      project.sections.find((s) => s.id === selectedId) ||
      project.sections.find((s) => s.type === 'hero') ||
      project.sections[0];
    if (!target) return;
    commitProject({
      ...project,
      sections: project.sections.map((s) =>
        s.id === target.id
          ? { ...s, backgroundPattern: pattern, backgroundImage: undefined }
          : s
      ),
    });
    setSelectedId(target.id);
  };

  const handleApplyIconToSelected = (iconId: string) => {
    const target = project.sections.find((s) => s.id === selectedId);
    if (!target) return;
    if (target.type === 'navbar' || target.type === 'footer') {
      handleUpdateSection(target.id, { brandIcon: iconId });
    } else if (target.type === 'features' && target.items && target.items.length > 0) {
      const nextItems = target.items.map((item, idx) =>
        idx === 0 ? { ...item, icon: iconId } : item
      );
      handleUpdateSection(target.id, { items: nextItems });
    } else {
      handleUpdateSection(target.id, { ctaIcon: iconId });
    }
  };

  const handleUpdateTheme = (patch: Partial<PageTheme>) => {
    commitProject({
      ...project,
      theme: { ...project.theme, ...patch },
    });
  };

  const handleApplyTemplate = (template: CustomTemplate) => {
    const clonedSections = template.sections.map((s) => ({
      ...s,
      id: createId(s.type),
      items: s.items?.map((it) => ({ ...it, id: createId('item') })),
      links: s.links?.map((l) => ({ ...l })),
    }));
    commitProject({
      title: template.name,
      theme: { ...template.theme },
      sections: clonedSections,
    });
    setSelectedId(null);
    setSelectedElementKey(null);
    setIsPreviewMode(false);
  };

  const handleSaveCustomTemplate = (name: string, category: string, description: string) => {
    const heroImg =
      project.sections.find((s) => s.imageUrl || s.backgroundImage)?.imageUrl ||
      project.sections.find((s) => s.backgroundImage)?.backgroundImage ||
      STUDIO_IMAGES[0].url;
    const newTpl: CustomTemplate = {
      id: createId('tpl'),
      name,
      category,
      description,
      thumbnailUrl: heroImg,
      isCustom: true,
      theme: { ...project.theme },
      sections: project.sections.map((s) => ({ ...s })),
    };
    setCustomTemplates((prev) => [newTpl, ...prev]);
    setSidebarTab('templates');
  };

  const handleDeleteCustomTemplate = (id: string) => {
    setCustomTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleGenerateAiLayout = async (params: {
    prompt: string;
    stylePreset: string;
    accentPreference: string;
    mode: 'replace' | 'append';
  }) => {
    setIsGeneratingAi(true);
    setAiError(null);
    try {
      const response = await fetch('/api/ai/generate-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: params.prompt,
          stylePreset: params.stylePreset,
          accentPreference: params.accentPreference,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghasilkan tata letak AI.');
      }

      const incomingTheme = data.theme
        ? { buttonShape: 'rounded' as const, ...data.theme }
        : project.theme;

      if (params.mode === 'append') {
        commitProject({
          ...project,
          sections: [...project.sections, ...(data.sections || [])],
        });
      } else {
        commitProject({
          title: data.projectTitle || project.title,
          theme: incomingTheme,
          sections: data.sections || [],
        });
      }
      setSelectedId(null);
      setSelectedElementKey(null);
      setIsPreviewMode(false);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Terjadi gangguan koneksi AI.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleRefineSectionAi = async (section: BuilderSection, instruction: string) => {
    setIsRefiningAi(true);
    setRefineError(null);
    try {
      const response = await fetch('/api/ai/refine-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, instruction }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal menyempurnakan blok.');
      }
      const updated = data.updated as Partial<BuilderSection>;
      const normalizedItems = updated.items?.map((item) => ({
        ...item,
        id: item.id || createId('item'),
      }));
      commitProject({
        ...project,
        sections: project.sections.map((s) =>
          s.id === section.id
            ? {
                ...s,
                ...updated,
                items: normalizedItems ?? s.items,
              }
            : s
        ),
      });
    } catch (err) {
      setRefineError(err instanceof Error ? err.message : 'Terjadi kesalahan AI.');
    } finally {
      setIsRefiningAi(false);
    }
  };

  const selectedSection = project.sections.find((s) => s.id === selectedId) || null;
  const allTemplates = [...customTemplates, ...BUILT_IN_TEMPLATES];

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract: Zone 1 (Brand) — Zone 2 (5 Concise Nav Tabs) — Zone 3 (1 Primary Action) */}
      <header className="h-14 shrink-0 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-8">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setIsPreviewMode(false);
          }}
          className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 font-display"
        >
          Rancang Studio
        </a>

        <nav className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => {
              setIsPreviewMode(false);
              setSidebarTab('blocks');
            }}
            className={`text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
              !isPreviewMode && sidebarTab === 'blocks'
                ? 'text-blue-600 underline underline-offset-8 decoration-2'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Komponen
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPreviewMode(false);
              setSidebarTab('templates');
            }}
            className={`text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
              !isPreviewMode && sidebarTab === 'templates'
                ? 'text-blue-600 underline underline-offset-8 decoration-2'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Template
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPreviewMode(false);
              setSidebarTab('assets');
            }}
            className={`text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
              !isPreviewMode && sidebarTab === 'assets'
                ? 'text-blue-600 underline underline-offset-8 decoration-2'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Latar & Ikon
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPreviewMode(false);
              setSidebarTab('ai');
            }}
            className={`text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
              !isPreviewMode && sidebarTab === 'ai'
                ? 'text-blue-600 underline underline-offset-8 decoration-2'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            AI Tata Letak
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedElementKey(null);
              setIsPreviewMode((prev) => !prev);
            }}
            className={`text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
              isPreviewMode
                ? 'text-blue-600 underline underline-offset-8 decoration-2'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pratinjau
          </button>
        </nav>

        <div className="shrink-0">
          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap shrink-0"
          >
            Ekspor Proyek
          </button>
        </div>
      </header>

      {/* Main 3-Pane Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {!isPreviewMode && (
          <LeftSidebar
            activeTab={sidebarTab}
            onTabChange={setSidebarTab}
            onAddBlock={(type) => handleAddBlock(type)}
            onAddFloatingElement={(kind) => handleAddOrDropFloatingElement(selectedId, kind)}
            templates={allTemplates}
            onApplyTemplate={handleApplyTemplate}
            onDeleteCustomTemplate={handleDeleteCustomTemplate}
            onOpenSaveTemplate={() => setIsSaveTemplateOpen(true)}
            onApplyStockBackground={handleApplyStockBackground}
            onApplyPattern={handleApplyPattern}
            onApplyIconToSelected={handleApplyIconToSelected}
            uploadedBackgrounds={uploadedBackgrounds}
            onUploadBackground={(file) => {
              const reader = new FileReader();
              reader.onload = () => {
                const dataUrl = typeof reader.result === 'string' ? reader.result : '';
                if (!dataUrl) return;
                const cleanName = file.name.replace(/\.[^.]+$/, '') || 'Latar Kustom';
                const newBg: UploadedBackground = {
                  id: createId('upbg'),
                  label: cleanName,
                  category: 'Upload Saya',
                  recommendedOverlay: 'dark',
                  url: dataUrl,
                };
                setUploadedBackgrounds((prev) => [newBg, ...prev]);
                handleApplyStockBackground(dataUrl, 'dark');
              };
              reader.readAsDataURL(file);
            }}
            onDeleteUploadedBackground={(id) =>
              setUploadedBackgrounds((prev) => prev.filter((b) => b.id !== id))
            }
            hasSelectedSection={Boolean(selectedSection)}
            onGenerateAiLayout={handleGenerateAiLayout}
            isGeneratingAi={isGeneratingAi}
            aiError={aiError}
          />
        )}

        <CanvasArea
          projectTitle={project.title}
          onChangeProjectTitle={(title) => setProject((prev) => ({ ...prev, title }))}
          sections={project.sections}
          theme={project.theme}
          selectedId={selectedId}
          onSelectSection={setSelectedId}
          selectedElementKey={selectedElementKey}
          onSelectElement={handleSelectElement}
          onUpdateSection={handleUpdateSection}
          onDropFloatingElement={(sId, kind, x, y) =>
            handleAddOrDropFloatingElement(sId, kind, x, y)
          }
          device={device}
          onChangeDevice={setDevice}
          isPreviewMode={isPreviewMode}
          onExitPreview={() => setIsPreviewMode(false)}
          canUndo={history.length > 0}
          canRedo={future.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClearCanvas={() => {
            commitProject({ ...project, sections: [] });
            setSelectedId(null);
            setSelectedElementKey(null);
          }}
          onDropNewBlock={handleAddBlock}
          onDropBackgroundOnSection={handleDropBackgroundOnSection}
          onReorderBlock={handleReorderBlock}
          onMoveSection={handleMoveSection}
          onDuplicateSection={handleDuplicateSection}
          onDeleteSection={handleDeleteSection}
          onOpenAiTab={() => setSidebarTab('ai')}
          onOpenTemplateTab={() => setSidebarTab('templates')}
          isGeneratingAi={isGeneratingAi}
        />

        {!isPreviewMode && (
          <RightInspector
            sections={project.sections}
            selectedSection={selectedSection}
            theme={project.theme}
            uploadedBackgrounds={uploadedBackgrounds}
            onUploadBackground={(file, applyToSectionId) => {
              const reader = new FileReader();
              reader.onload = () => {
                const dataUrl = typeof reader.result === 'string' ? reader.result : '';
                if (!dataUrl) return;
                const cleanName = file.name.replace(/\.[^.]+$/, '') || 'Latar Kustom';
                const newBg: UploadedBackground = {
                  id: createId('upbg'),
                  label: cleanName,
                  category: 'Upload Saya',
                  recommendedOverlay: 'dark',
                  url: dataUrl,
                };
                setUploadedBackgrounds((prev) => [newBg, ...prev]);
                if (applyToSectionId) {
                  handleDropBackgroundOnSection(applyToSectionId, dataUrl, 'dark');
                }
              };
              reader.readAsDataURL(file);
            }}
            onSelectSection={setSelectedId}
            onUpdateSection={handleUpdateSection}
            onDeleteSection={handleDeleteSection}
            onDuplicateSection={handleDuplicateSection}
            onMoveSection={handleMoveSection}
            onUpdateTheme={handleUpdateTheme}
            onRefineSectionAi={handleRefineSectionAi}
            isRefiningAi={isRefiningAi}
            refineError={refineError}
          />
        )}
      </div>

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={project}
      />

      <SaveTemplateModal
        isOpen={isSaveTemplateOpen}
        onClose={() => setIsSaveTemplateOpen(false)}
        onSave={handleSaveCustomTemplate}
        defaultName={`${project.title} (Kustom)`}
      />
    </div>
  );
}
