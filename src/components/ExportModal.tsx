import React, { useState } from 'react';
import {
  Download,
  FileImage,
  FileText,
  Save,
  X,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { WhiteboardPage } from '../types/whiteboard';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: WhiteboardPage[];
  activePageIndex: number;
  projectTitle: string;
  onExportPng: (filename: string) => Promise<void>;
  onExportPdf: (filename: string, progressCb: (curr: number, tot: number) => void) => Promise<void>;
  onExportProjectJson: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  pages,
  activePageIndex,
  projectTitle,
  onExportPng,
  onExportPdf,
  onExportProjectJson,
}) => {
  const [filename, setFilename] = useState(projectTitle || 'clase_pizarra');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportPng = async () => {
    setIsExporting(true);
    setSuccessMessage(null);
    try {
      await onExportPng(filename);
      setSuccessMessage('¡Imagen PNG de la diapositiva exportada con éxito!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    setProgress({ current: 0, total: pages.length });
    setSuccessMessage(null);
    try {
      await onExportPdf(filename, (current, total) => {
        setProgress({ current, total });
      });
      setSuccessMessage(`¡Documento PDF con las ${pages.length} páginas generado con éxito!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
      setProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Exportar Pizarra y Documento
              </h3>
              <p className="text-xs text-slate-500">
                Guarda tus explicaciones en alta resolución
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Filename input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nombre del archivo a exportar:
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-indigo-500 font-medium"
              placeholder="Nombre del archivo..."
            />
          </div>

          {/* Export Options */}
          <div className="space-y-3 pt-2">
            {/* Option 1: PDF */}
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 text-left flex items-start gap-3.5 transition-all group disabled:opacity-50"
            >
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Exportar como PDF Completo
                  </h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {pages.length} {pages.length === 1 ? 'Página' : 'Páginas'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Genera un documento PDF con todas las diapositivas y sus anotaciones en alta definición.
                </p>
              </div>
            </button>

            {/* Option 2: PNG */}
            <button
              onClick={handleExportPng}
              disabled={isExporting}
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 text-left flex items-start gap-3.5 transition-all group disabled:opacity-50"
            >
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                <FileImage className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Exportar Diapositiva Actual (PNG HD)
                  </h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    Página {activePageIndex + 1}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Descarga una imagen PNG nítida ideal para compartir en apuntes o presentaciones.
                </p>
              </div>
            </button>

            {/* Option 3: Project File (.pizarra) */}
            <button
              onClick={() => {
                onExportProjectJson();
                setSuccessMessage('¡Archivo de proyecto (.pizarra) descargado!');
                setTimeout(() => setSuccessMessage(null), 3000);
              }}
              disabled={isExporting}
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 text-left flex items-start gap-3.5 transition-all group disabled:opacity-50"
            >
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Save className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Guardar Proyecto Completo (.pizarra)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Guarda todo el estado para continuar editando más tarde en cualquier PC.
                </p>
              </div>
            </button>
          </div>

          {/* Progress / Status feedback */}
          {isExporting && progress && (
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl border border-indigo-200 dark:border-indigo-900 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Renderizando diapositiva {progress.current} de {progress.total}...
                </span>
                <span>{Math.round((progress.current / progress.total) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-indigo-200 dark:bg-indigo-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-200"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
