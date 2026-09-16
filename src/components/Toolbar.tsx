import React, { useState } from 'react';
import {
  MousePointer2,
  Pencil,
  Highlighter,
  Eraser,
  Crop,
  Square,
  Circle,
  Minus,
  MoveRight,
  MoveUpRight,
  Triangle,
  Type,
  Flame,
  Hand,
  ChevronUp,
  Zap,
  Sigma,
  Compass
} from 'lucide-react';
import { ToolType, DrawingSettings } from '../types/whiteboard';

interface ToolbarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  settings: DrawingSettings;
  onUpdateSettings: (settings: Partial<DrawingSettings>) => void;
  hasPressureDevice?: boolean;
  onOpenMathModal?: () => void;
}

const COLOR_PRESETS = [
  '#0f172a', // Slate Black
  '#dc2626', // Red
  '#ea580c', // Orange
  '#ca8a04', // Amber
  '#16a34a', // Green
  '#0284c7', // Sky Blue
  '#4f46e5', // Indigo
  '#9333ea', // Purple
  '#db2777', // Pink
  '#ffffff', // White
];

const HIGHLIGHTER_PRESETS = [
  '#facc15', // Yellow
  '#4ade80', // Green
  '#38bdf8', // Cyan
  '#f472b6', // Pink
  '#fb923c', // Orange
];

const STROKE_WIDTH_PRESETS = [2, 4, 8, 14, 24];

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onSelectTool,
  settings,
  onUpdateSettings,
  onOpenMathModal,
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<'none' | 'shapes' | 'eraser' | 'settings'>('none');

  const isShapeActive = ['line', 'arrow', 'vector', 'rect', 'circle', 'triangle_right', 'angle_arc'].includes(activeTool);

  return (
    <aside
      aria-label="Herramientas de dibujo"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-none"
    >
      {/* Popover sub-menu (Shapes, Eraser options, or Pen settings) */}
      {activeSubmenu === 'shapes' && (
        <div className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-wrap items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 max-w-[90vw]">
          <button
            onClick={() => { onSelectTool('line'); setActiveSubmenu('none'); }}
            className={`p-2 rounded-xl flex items-center gap-1 text-xs font-semibold transition-all ${
              activeTool === 'line'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Minus className="w-4 h-4" />
            <span>Línea</span>
          </button>
          <button
            onClick={() => { onSelectTool('arrow'); setActiveSubmenu('none'); }}
            className={`p-2 rounded-xl flex items-center gap-1 text-xs font-semibold transition-all ${
              activeTool === 'arrow'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <MoveRight className="w-4 h-4" />
            <span>Flecha</span>
          </button>
          <button
            onClick={() => { onSelectTool('vector'); setActiveSubmenu('none'); }}
            title="Vector de Física con módulo/fuerza"
            className={`p-2 rounded-xl flex items-center gap-1 text-xs font-semibold transition-all ${
              activeTool === 'vector'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <MoveUpRight className="w-4 h-4 text-sky-400" />
            <span>Vector F⃗</span>
          </button>
          <button
            onClick={() => { onSelectTool('triangle_right'); setActiveSubmenu('none'); }}
            title="Triángulo Notable 37°/53° o Rectángulo"
            className={`p-2 rounded-xl flex items-center gap-1 text-xs font-semibold transition-all ${
              activeTool === 'triangle_right'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Triangle className="w-4 h-4 text-amber-400" />
            <span>Triángulo 37°/53°</span>
          </button>
          <button
            onClick={() => { onSelectTool('angle_arc'); setActiveSubmenu('none'); }}
            title="Arco de Ángulo con etiqueta θ"
            className={`p-2 rounded-xl flex items-center gap-1 text-xs font-semibold transition-all ${
              activeTool === 'angle_arc'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Compass className="w-4 h-4 text-rose-400" />
            <span>Ángulo θ</span>
          </button>
          <button
            onClick={() => { onSelectTool('rect'); setActiveSubmenu('none'); }}
            className={`p-2 rounded-xl flex items-center gap-1 text-xs font-semibold transition-all ${
              activeTool === 'rect'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Square className="w-4 h-4" />
            <span>Rectángulo</span>
          </button>
          <button
            onClick={() => { onSelectTool('circle'); setActiveSubmenu('none'); }}
            className={`p-2 rounded-xl flex items-center gap-1 text-xs font-semibold transition-all ${
              activeTool === 'circle'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Circle className="w-4 h-4" />
            <span>Círculo</span>
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Filled shape toggle */}
          <button
            onClick={() => onUpdateSettings({ isFilled: !settings.isFilled })}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              settings.isFilled
                ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
                : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {settings.isFilled ? 'Relleno: Sí' : 'Relleno: No'}
          </button>
        </div>
      )}

      {/* Main Floating Tool Container */}
      <div className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl flex flex-wrap items-center gap-1.5 transition-all max-w-[95vw]">
        
        {/* Selection / Move tool */}
        <button
          onClick={() => { onSelectTool('select'); setActiveSubmenu('none'); }}
          title="Seleccionar y Mover objetos (V)"
          className={`p-2.5 rounded-xl transition-all relative group ${
            activeTool === 'select'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MousePointer2 className="w-5 h-5" />
        </button>

        {/* Hand / Pan tool */}
        <button
          onClick={() => { onSelectTool('pan'); setActiveSubmenu('none'); }}
          title="Mover lienzo / Mano (H o barra espaciadora)"
          className={`p-2.5 rounded-xl transition-all ${
            activeTool === 'pan'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Hand className="w-5 h-5" />
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* Snip / Crop Exercise tool */}
        <button
          onClick={() => { onSelectTool('snip'); setActiveSubmenu('none'); }}
          title="Recortar Ejercicio de la ficha PDF (Arrastra un recuadro sobre el ejercicio)"
          className={`p-2.5 rounded-xl transition-all relative ${
            activeTool === 'snip'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105 ring-2 ring-indigo-400'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Crop className="w-5 h-5" />
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-0.5" />

        {/* Pen / Pluma */}
        <button
          onClick={() => { onSelectTool('pen'); setActiveSubmenu('none'); }}
          title="Lápiz / Pluma de dibujo (P)"
          className={`p-2.5 rounded-xl transition-all relative ${
            activeTool === 'pen'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Pencil className="w-5 h-5" />
          <span
            className="absolute bottom-1 right-1 w-2 h-2 rounded-full border border-white dark:border-slate-900 shadow"
            style={{ backgroundColor: settings.strokeColor }}
          />
        </button>

        {/* Highlighter / Resaltador */}
        <button
          onClick={() => { onSelectTool('highlighter'); setActiveSubmenu('none'); }}
          title="Resaltador / Marcador fluorescente (H)"
          className={`p-2.5 rounded-xl transition-all relative ${
            activeTool === 'highlighter'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Highlighter className="w-5 h-5" />
          <span
            className="absolute bottom-1 right-1 w-2 h-2 rounded-full border border-white dark:border-slate-900 shadow"
            style={{ backgroundColor: settings.highlighterColor }}
          />
        </button>

        {/* Eraser / Borrador */}
        <button
          onClick={() => { onSelectTool('eraser'); setActiveSubmenu('none'); }}
          title="Borrador de trazo y objeto (E)"
          className={`p-2.5 rounded-xl transition-all ${
            activeTool === 'eraser'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Eraser className="w-5 h-5" />
        </button>

        {/* Shapes Menu Toggle */}
        <button
          onClick={() => setActiveSubmenu(activeSubmenu === 'shapes' ? 'none' : 'shapes')}
          title="Formas geométricas (Línea, Flecha, Rectángulo, Círculo)"
          className={`p-2.5 rounded-xl transition-all flex items-center gap-0.5 ${
            isShapeActive
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {activeTool === 'line' ? (
            <Minus className="w-5 h-5" />
          ) : activeTool === 'arrow' ? (
            <MoveRight className="w-5 h-5" />
          ) : activeTool === 'circle' ? (
            <Circle className="w-5 h-5" />
          ) : (
            <Square className="w-5 h-5" />
          )}
          <ChevronUp className="w-3 h-3 opacity-60" />
        </button>

        {/* Text Box */}
        <button
          onClick={() => { onSelectTool('text'); setActiveSubmenu('none'); }}
          title="Caja de Texto (T)"
          className={`p-2.5 rounded-xl transition-all ${
            activeTool === 'text'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Type className="w-5 h-5" />
        </button>

        {/* Math & Science Formula Editor */}
        <button
          onClick={() => {
            if (onOpenMathModal) onOpenMathModal();
            setActiveSubmenu('none');
          }}
          title="Fórmulas y Símbolos Científicos (LaTeX / KaTeX)"
          className="p-2.5 rounded-xl transition-all bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 shadow-sm hover:scale-105 active:scale-95"
        >
          <Sigma className="w-5 h-5" />
        </button>

        {/* Laser Pointer (Educator feature) */}
        <button
          onClick={() => { onSelectTool('laser'); setActiveSubmenu('none'); }}
          title="Puntero Láser temporal para explicar (L)"
          className={`p-2.5 rounded-xl transition-all ${
            activeTool === 'laser'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-105 animate-pulse'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Flame className="w-5 h-5 text-rose-500 group-hover:text-rose-600" />
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Quick Color Palette */}
        {activeTool === 'highlighter' ? (
          <div className="flex items-center gap-1 px-1">
            {HIGHLIGHTER_PRESETS.map((color) => (
              <button
                key={color}
                onClick={() => onUpdateSettings({ highlighterColor: color })}
                className={`w-6 h-6 rounded-full transition-transform border ${
                  settings.highlighterColor === color
                    ? 'scale-125 border-slate-900 dark:border-white shadow-md'
                    : 'border-transparent hover:scale-110 opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1 px-1">
            {COLOR_PRESETS.slice(0, 6).map((color) => (
              <button
                key={color}
                onClick={() => onUpdateSettings({ strokeColor: color })}
                className={`w-5 h-5 rounded-full transition-transform border ${
                  settings.strokeColor === color
                    ? 'scale-125 border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-400/40'
                    : 'border-slate-300 dark:border-slate-700 hover:scale-110'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
            {/* Native Color Picker */}
            <label
              title="Paleta de colores completa"
              className="w-5 h-5 rounded-full bg-gradient-to-tr from-pink-500 via-amber-400 to-indigo-500 cursor-pointer flex items-center justify-center hover:scale-110 transition-transform relative overflow-hidden shadow-sm"
            >
              <input
                type="color"
                value={settings.strokeColor}
                onChange={(e) => onUpdateSettings({ strokeColor: e.target.value })}
                className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
              />
            </label>
          </div>
        )}

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Stroke Width Selector */}
        <div className="flex items-center gap-1">
          {STROKE_WIDTH_PRESETS.map((w) => (
            <button
              key={w}
              onClick={() => onUpdateSettings({ strokeWidth: w })}
              title={`Grosor ${w}px`}
              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                settings.strokeWidth === w
                  ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-300 dark:border-indigo-800'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span
                className="rounded-full bg-current"
                style={{ width: Math.min(16, Math.max(3, w * 0.7)), height: Math.min(16, Math.max(3, w * 0.7)) }}
              />
            </button>
          ))}
        </div>

        {/* Dynamic Pressure Sensitivity Switch */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
        <button
          onClick={() => onUpdateSettings({ enablePressure: !settings.enablePressure })}
          title={
            settings.enablePressure
              ? 'Presión Dinámica: Activada (el grosor varía con la presión del lápiz)'
              : 'Presión Fija / Uniforme: Activada (óptimo para dedos o stylus sin sensor de presión)'
          }
          className={`px-2 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            settings.enablePressure
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Zap className={`w-3.5 h-3.5 ${settings.enablePressure ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span className="hidden xl:inline text-[11px]">
            {settings.enablePressure ? 'Presión ON' : 'Presión OFF'}
          </span>
        </button>

      </div>
    </aside>
  );
};
