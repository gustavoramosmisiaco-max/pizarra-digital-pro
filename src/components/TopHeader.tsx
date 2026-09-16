import React, { useRef } from 'react';
import {
  Cable,
  FileUp,
  Image as ImageIcon,
  Download,
  FolderOpen,
  Save,
  Moon,
  Sun,
  Undo2,
  Redo2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Layers,
  PenTool,
  Tablet,
  MousePointer,
} from 'lucide-react';
import { PointerTelemetry, WhiteboardProject } from '../types/whiteboard';

interface TopHeaderProps {
  project: WhiteboardProject;
  telemetry: PointerTelemetry;
  isDarkMode: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onToggleDarkMode: () => void;
  onOpenUsbModal: () => void;
  onOpenExportModal: () => void;
  onUploadPdf: (file: File) => void;
  onUploadImage: (file: File) => void;
  onSaveProjectFile: () => void;
  onOpenProjectFile: (file: File) => void;
  onClearCanvas: () => void;
  onTitleChange: (newTitle: string) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onAddPage: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  project,
  telemetry,
  isDarkMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onToggleDarkMode,
  onOpenUsbModal,
  onOpenExportModal,
  onUploadPdf,
  onUploadImage,
  onSaveProjectFile,
  onOpenProjectFile,
  onClearCanvas,
  onTitleChange,
  onPrevPage,
  onNextPage,
  onAddPage,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);

  const currentPageNum = project.activePageIndex + 1;
  const totalPages = project.pages.length;

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadPdf(file);
      e.target.value = '';
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadImage(file);
      e.target.value = '';
    }
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onOpenProjectFile(file);
      e.target.value = '';
    }
  };

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 flex items-center justify-between gap-2 z-30 shrink-0 select-none shadow-sm">
      {/* Left side: Brand + Sidebar toggle + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          title={isSidebarOpen ? 'Ocultar diapositivas' : 'Ver diapositivas'}
          className={`p-2 rounded-xl border transition-all ${
            isSidebarOpen
              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <PenTool className="w-4 h-4" />
          </div>
          <div className="hidden sm:flex flex-col">
            <input
              type="text"
              value={project.title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="font-bold text-sm bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none text-slate-800 dark:text-white px-1 py-0.5 rounded transition-all max-w-[200px] lg:max-w-[280px] truncate"
              placeholder="Nombre de la clase o tutorial..."
            />
          </div>
        </div>

        {/* Page Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl p-1 border border-slate-200 dark:border-slate-700/80">
          <button
            onClick={onPrevPage}
            disabled={currentPageNum <= 1}
            title="Diapositiva anterior"
            className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all text-slate-700 dark:text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold px-2 text-slate-700 dark:text-slate-300 min-w-[65px] text-center">
            {currentPageNum} / {totalPages}
          </span>
          <button
            onClick={onNextPage}
            disabled={currentPageNum >= totalPages}
            title="Siguiente diapositiva"
            className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all text-slate-700 dark:text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={onAddPage}
            title="Añadir nueva diapositiva"
            className="ml-1 p-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center: Live Pointer Hardware Telemetry Badge */}
      <div className="hidden md:flex items-center">
        <button
          onClick={onOpenUsbModal}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            telemetry.pointerType === 'pen'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-sm'
              : telemetry.pointerType === 'touch'
              ? 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                telemetry.pointerType === 'pen'
                  ? 'bg-emerald-400'
                  : telemetry.pointerType === 'touch'
                  ? 'bg-indigo-400'
                  : 'bg-slate-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                telemetry.pointerType === 'pen'
                  ? 'bg-emerald-500'
                  : telemetry.pointerType === 'touch'
                  ? 'bg-indigo-500'
                  : 'bg-slate-400'
              }`}
            />
          </span>

          <span className="flex items-center gap-1.5">
            {telemetry.pointerType === 'pen' ? (
              <>
                <PenTool className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Tableta Gráfica (8192 Niveles)</span>
                {telemetry.pressure > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-200/60 dark:bg-emerald-900/60 rounded text-emerald-900 dark:text-emerald-200 font-bold">
                    {(telemetry.pressure * 100).toFixed(0)}%
                  </span>
                )}
              </>
            ) : telemetry.pointerType === 'touch' ? (
              <>
                <Tablet className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Pantalla Táctil USB Activa</span>
              </>
            ) : (
              <>
                <MousePointer className="w-3.5 h-3.5 text-slate-500" />
                <span>Ratón Estándar</span>
              </>
            )}
          </span>
        </button>
      </div>

      {/* Right side: Actions, Import, Export, Tools */}
      <div className="flex items-center gap-1.5">
        {/* Hidden inputs */}
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          onChange={handlePdfChange}
          className="hidden"
        />
        <input
          ref={imgInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleImageChange}
          className="hidden"
        />
        <input
          ref={projectInputRef}
          type="file"
          accept=".pizarra,application/json"
          onChange={handleProjectChange}
          className="hidden"
        />

        {/* Undo / Redo */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700/80">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Deshacer (Ctrl+Z)"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all text-slate-700 dark:text-slate-300"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Rehacer (Ctrl+Y)"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all text-slate-700 dark:text-slate-300"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Import dropdown/buttons */}
        <button
          onClick={() => pdfInputRef.current?.click()}
          title="Importar PDF o Diapositivas"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 transition-all"
        >
          <FileUp className="w-3.5 h-3.5 text-rose-500" />
          <span className="hidden sm:inline">Subir PDF</span>
        </button>

        <button
          onClick={() => imgInputRef.current?.click()}
          title="Insertar Imagen libre"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 transition-all"
        >
          <ImageIcon className="w-3.5 h-3.5 text-sky-500" />
          <span className="hidden lg:inline">Imagen</span>
        </button>

        {/* USB-C Guide Button with glowing trigger */}
        <button
          onClick={onOpenUsbModal}
          title="Guía de conexión de Celular / Tableta por cable USB-C"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-md shadow-indigo-500/20 transition-all animate-none hover:scale-105"
        >
          <Cable className="w-3.5 h-3.5 animate-pulse" />
          <span className="hidden md:inline">Conectar Tableta</span>
        </button>

        {/* Export button */}
        <button
          onClick={onOpenExportModal}
          title="Exportar PDF o Imágenes PNG"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Exportar</span>
        </button>

        {/* Project Save / Load */}
        <div className="hidden xl:flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700/80">
          <button
            onClick={onSaveProjectFile}
            title="Guardar archivo de proyecto (.pizarra)"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
          >
            <Save className="w-4 h-4 text-indigo-500" />
          </button>
          <button
            onClick={() => projectInputRef.current?.click()}
            title="Abrir archivo de proyecto (.pizarra)"
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
          >
            <FolderOpen className="w-4 h-4 text-amber-500" />
          </button>
        </div>

        {/* Clear canvas */}
        <button
          onClick={onClearCanvas}
          title="Limpiar trazos de la diapositiva actual"
          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Dark/Light mode toggle */}
        <button
          onClick={onToggleDarkMode}
          title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>
    </header>
  );
};
