import React, { useState, useEffect, useRef } from 'react';
import { X, Sigma, Sparkles, Plus, Copy, Check, BookOpen } from 'lucide-react';
import katex from 'katex';
import { FORMULA_PRESETS } from '../services/mathRenderer';

interface MathFormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertFormula: (latex: string, color: string, fontSize: number) => void;
}

export const MathFormulaModal: React.FC<MathFormulaModalProps> = ({
  isOpen,
  onClose,
  onInsertFormula
}) => {
  const [latexInput, setLatexInput] = useState<string>('\\vec{F} = m \\cdot \\vec{a}');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [formulaColor, setFormulaColor] = useState<string>('#0284c7'); // Sky blue
  const [fontSize, setFontSize] = useState<number>(36);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const html = katex.renderToString(latexInput || '\\text{Escribe tu fórmula aquí}', {
        displayMode: true,
        throwOnError: false,
        output: 'htmlAndMathml'
      });
      setPreviewHtml(html);
      setRenderError(null);
    } catch (err: any) {
      setRenderError(err.message || 'Error de sintaxis LaTeX');
    }
  }, [latexInput]);

  if (!isOpen) return null;

  const handleInsert = () => {
    if (!latexInput.trim()) return;
    onInsertFormula(latexInput, formulaColor, fontSize);
    onClose();
  };

  const insertSnippet = (snippet: string) => {
    setLatexInput(prev => prev + snippet);
  };

  const filteredPresets = selectedCategory === 'todos'
    ? FORMULA_PRESETS
    : FORMULA_PRESETS.filter(p => p.category === selectedCategory);

  const quickSymbols = [
    { label: 'a/b', latex: '\\frac{a}{b}' },
    { label: '√x', latex: '\\sqrt{x}' },
    { label: 'x²', latex: 'x^{2}' },
    { label: 'x_i', latex: 'x_{i}' },
    { label: '∑', latex: '\\sum_{i=1}^{n}' },
    { label: '∫', latex: '\\int_{a}^{b}' },
    { label: '→', latex: '\\longrightarrow' },
    { label: '⇄', latex: '\\rightleftharpoons' },
    { label: 'θ', latex: '\\theta' },
    { label: 'α', latex: '\\alpha' },
    { label: 'β', latex: '\\beta' },
    { label: 'λ', latex: '\\lambda' },
    { label: 'μ', latex: '\\mu' },
    { label: 'π', latex: '\\pi' },
    { label: 'Δ', latex: '\\Delta' },
    { label: 'Ω', latex: '\\Omega' },
    { label: '±', latex: '\\pm' },
    { label: '≈', latex: '\\approx' },
    { label: 'F⃗', latex: '\\vec{F}' },
    { label: 'v⃗', latex: '\\vec{v}' },
    { label: '°', latex: '^{\\circ}' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl text-white shadow-lg shadow-sky-500/20">
              <Sigma className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Editor de Fórmulas y Símbolos Científicos
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  KaTeX LaTeX
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Física, Química, Trigonometría, Álgebra y Geometría
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Live Preview Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 min-h-[120px] flex flex-col items-center justify-center relative shadow-inner">
            <div className="absolute top-2 left-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              Vista previa en tiempo real
            </div>
            {renderError ? (
              <p className="text-rose-400 text-sm font-mono">{renderError}</p>
            ) : (
              <div
                ref={previewRef}
                style={{ color: formulaColor, fontSize: `${Math.min(48, fontSize)}px` }}
                className="overflow-x-auto max-w-full text-center py-2 transition-all"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            )}
          </div>

          {/* Quick Symbol Buttons Palette */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Símbolos y Estructuras Rápidas
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickSymbols.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => insertSnippet(item.latex)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 hover:text-sky-300 text-slate-200 border border-slate-700 rounded-lg text-sm font-serif font-semibold transition active:scale-95 shadow-sm"
                  title={item.latex}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input LaTeX & Customization */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Código LaTeX / Expresión Matemática
              </label>
              <textarea
                value={latexInput}
                onChange={e => setLatexInput(e.target.value)}
                placeholder="Escribe en LaTeX (ej. \vec{F} = m \cdot \vec{a})"
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-slate-100 font-mono text-sm rounded-xl p-3 resize-none outline-none transition"
              />
            </div>

            {/* Customization Options: Color & Size */}
            <div className="space-y-3 bg-slate-800/50 border border-slate-700/60 p-3.5 rounded-xl">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Color de la Fórmula
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { hex: '#0284c7', name: 'Azul' },
                    { hex: '#10b981', name: 'Verde' },
                    { hex: '#f59e0b', name: 'Ámbar' },
                    { hex: '#ef4444', name: 'Rojo' },
                    { hex: '#8b5cf6', name: 'Púrpura' },
                    { hex: '#f8fafc', name: 'Blanco' },
                    { hex: '#0f172a', name: 'Oscuro' }
                  ].map(c => (
                    <button
                      key={c.hex}
                      onClick={() => setFormulaColor(c.hex)}
                      style={{ backgroundColor: c.hex }}
                      className={`w-6 h-6 rounded-full border-2 transition ${
                        formulaColor === c.hex ? 'border-white scale-110 shadow-md ring-2 ring-sky-500' : 'border-slate-600 hover:scale-105'
                      }`}
                      title={c.name}
                    />
                  ))}
                  <input
                    type="color"
                    value={formulaColor}
                    onChange={e => setFormulaColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    title="Color personalizado"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Tamaño de Fuente</span>
                  <span className="font-mono text-slate-200">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="64"
                  value={fontSize}
                  onChange={e => setFontSize(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Preset Formulas Catalog */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                Catálogo de Fórmulas de Clase
              </label>

              {/* Category Filter Pills */}
              <div className="flex gap-1 overflow-x-auto text-xs">
                {[
                  { id: 'todos', label: 'Todas' },
                  { id: 'fisica', label: 'Física' },
                  { id: 'trigonometria', label: 'Trigonometría' },
                  { id: 'quimica', label: 'Química' },
                  { id: 'algebra', label: 'Álgebra' },
                  { id: 'simbolos', label: 'Símbolos' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      selectedCategory === cat.id
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {filteredPresets.map((preset, index) => (
                <div
                  key={index}
                  onClick={() => setLatexInput(preset.latex)}
                  className="p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-sky-500/50 rounded-xl cursor-pointer transition group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-300 group-hover:text-sky-300 transition">
                      {preset.title}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {preset.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mb-1">
                    {preset.description}
                  </p>
                  <code className="text-xs text-sky-400/90 font-mono truncate bg-slate-900 px-1.5 py-0.5 rounded">
                    {preset.latex}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <button
            onClick={() => {
              navigator.clipboard.writeText(latexInput);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition py-2 px-3 rounded-lg hover:bg-slate-800"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? '¡Copiado!' : 'Copiar LaTeX'}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleInsert}
              disabled={!latexInput.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-sky-500/25 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Insertar en Pizarra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
