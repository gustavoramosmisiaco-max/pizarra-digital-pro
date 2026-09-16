import React from 'react';
import {
  Plus,
  Trash2,
  Copy,
  Grid,
  AlignJustify,
  CircleDot,
  Square,
  FileText,
  X,
} from 'lucide-react';
import { WhiteboardPage, BackgroundGridType } from '../types/whiteboard';

interface PagesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  pages: WhiteboardPage[];
  activePageIndex: number;
  onSelectPage: (index: number) => void;
  onAddPage: (gridType?: BackgroundGridType) => void;
  onDuplicatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
  onChangeGridType: (index: number, gridType: BackgroundGridType) => void;
  thumbnails: Record<number, string>;
}

export const PagesSidebar: React.FC<PagesSidebarProps> = ({
  isOpen,
  onClose,
  pages,
  activePageIndex,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onChangeGridType,
  thumbnails,
}) => {
  if (!isOpen) return null;

  return (
    <div className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 shrink-0 h-[calc(100vh-3.5rem)] select-none shadow-lg animate-in slide-in-from-left duration-200">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            Diapositivas y Páginas
            <span className="text-xs font-normal text-slate-500">({pages.length})</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Navega o añade diapositivas a la clase
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {pages.map((page, index) => {
          const isActive = index === activePageIndex;
          const thumbnail = thumbnails[index] || page.thumbnail;

          return (
            <div
              key={page.id}
              onClick={() => onSelectPage(index)}
              className={`group relative rounded-xl border-2 transition-all cursor-pointer overflow-hidden p-2 ${
                isActive
                  ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-md ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-900/40'
              }`}
            >
              {/* Header row in thumbnail card */}
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="truncate max-w-[120px]">{page.name || `Página ${index + 1}`}</span>
                </span>

                {/* Quick actions (duplicate, delete) */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicatePage(index);
                    }}
                    title="Duplicar página"
                    className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-800"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {pages.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePage(index);
                      }}
                      title="Eliminar página"
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Preview Thumbnail box (16:9 ratio) */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-inner">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={`Miniatura ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-2">
                    <FileText className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-700" />
                    <span className="text-[10px] text-slate-400">Lienzo vacío</span>
                  </div>
                )}

                {/* Badge if PDF or Image background */}
                {page.bgType !== 'none' && (
                  <span className="absolute bottom-1 right-1 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-900/80 text-white backdrop-blur uppercase">
                    {page.bgType}
                  </span>
                )}
              </div>

              {/* Background grid switcher for current active page */}
              {isActive && (
                <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Fondo:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); onChangeGridType(index, 'blank'); }}
                      title="Fondo Blanco"
                      className={`p-1 rounded ${page.gridType === 'blank' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                    >
                      <Square className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onChangeGridType(index, 'grid'); }}
                      title="Cuadriculado"
                      className={`p-1 rounded ${page.gridType === 'grid' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                    >
                      <Grid className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onChangeGridType(index, 'dots'); }}
                      title="Puntos"
                      className={`p-1 rounded ${page.gridType === 'dots' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                    >
                      <CircleDot className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onChangeGridType(index, 'lines'); }}
                      title="Líneas de cuaderno"
                      className={`p-1 rounded ${page.gridType === 'lines' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                    >
                      <AlignJustify className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onChangeGridType(index, 'dark_grid'); }}
                      title="Pizarra Oscura / Darkboard"
                      className={`p-1 rounded ${page.gridType === 'dark_grid' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-900 dark:text-white'}`}
                    >
                      <span className="w-3 h-3 rounded-sm bg-slate-900 block border border-slate-700" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Footer Add Button */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <button
          onClick={() => onAddPage()}
          className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Diapositiva</span>
        </button>
      </div>

    </div>
  );
};
