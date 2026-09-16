import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, Trash2, Atom } from 'lucide-react';

interface FloatingNavControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenStencilsModal: () => void;
  onClearCanvas: () => void;
}

export const FloatingNavControls: React.FC<FloatingNavControlsProps> = ({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenStencilsModal,
  onClearCanvas,
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl transition-all">
      
      {/* Science Stencils Button */}
      <button
        onClick={onOpenStencilsModal}
        title="Biblioteca de Figuras Científicas (Física, Circuitos, Química)"
        className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition active:scale-95"
      >
        <Atom className="w-4 h-4" />
        <span className="hidden sm:inline">Figuras de Ciencia</span>
      </button>

      <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

      {/* Undo Button */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        title="Deshacer (Ctrl+Z)"
        className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* Redo Button */}
      <button
        onClick={onRedo}
        disabled={!canRedo}
        title="Rehacer (Ctrl+Y)"
        className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <RotateCw className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

      {/* Zoom Controls */}
      <button
        onClick={onZoomOut}
        title="Alejar Zoom"
        className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <button
        onClick={onResetZoom}
        title="Restablecer vista a 100%"
        className="px-2 py-1 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition min-w-[44px] text-center"
      >
        {Math.round(zoomLevel * 100)}%
      </button>

      <button
        onClick={onZoomIn}
        title="Acercar Zoom"
        className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

      {/* Clear Canvas */}
      <button
        onClick={() => {
          if (window.confirm('¿Deseas limpiar todos los trazos de esta pizarra?')) {
            onClearCanvas();
          }
        }}
        title="Limpiar pizarra actual"
        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
      >
        <Trash2 className="w-4 h-4" />
      </button>

    </div>
  );
};
