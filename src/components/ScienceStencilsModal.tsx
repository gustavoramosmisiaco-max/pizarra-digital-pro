import React, { useState } from 'react';
import { X, Atom, Plus, Search } from 'lucide-react';

interface ScienceStencil {
  id: string;
  category: 'mecanica' | 'circuitos' | 'quimica' | 'coordenadas';
  title: string;
  description: string;
  svg: string;
  defaultWidth: number;
  defaultHeight: number;
}

const STENCILS: ScienceStencil[] = [
  // FÍSICA MECÁNICA
  {
    id: 'plano_inclinado',
    category: 'mecanica',
    title: 'Plano Inclinado con Masa',
    description: 'Bloque sobre plano con ángulo α y vectores de fuerza',
    defaultWidth: 260,
    defaultHeight: 180,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 180" width="260" height="180">
        <!-- Rampa -->
        <polygon points="20,160 240,160 20,50" fill="rgba(14, 165, 233, 0.1)" stroke="#0284c7" stroke-width="3" stroke-linejoin="round" />
        <!-- Arco de ángulo alfa -->
        <path d="M 200,160 A 40,40 0 0,0 180,140" fill="none" stroke="#ef4444" stroke-width="2" />
        <text x="188" y="154" fill="#ef4444" font-family="sans-serif" font-weight="bold" font-size="14">α</text>
        <!-- Bloque m -->
        <g transform="translate(110, 85) rotate(-26.5)">
          <rect x="-25" y="-20" width="50" height="40" rx="4" fill="#e0f2fe" stroke="#0369a1" stroke-width="2.5" />
          <text x="0" y="5" text-anchor="middle" fill="#0369a1" font-family="sans-serif" font-weight="bold" font-size="16">m</text>
        </g>
        <!-- Vector Peso P = mg -->
        <line x1="120" y1="100" x2="120" y2="155" stroke="#dc2626" stroke-width="2.5" marker-end="url(#arrow-red)" />
        <text x="126" y="145" fill="#dc2626" font-family="sans-serif" font-weight="bold" font-size="13">P = mg</text>
      </svg>
    `
  },
  {
    id: 'polea_simple',
    category: 'mecanica',
    title: 'Sistema de Polea y Masas',
    description: 'Polea fija con dos masas m1 y m2 en tensión',
    defaultWidth: 180,
    defaultHeight: 240,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 240" width="180" height="240">
        <!-- Soporte Techo -->
        <line x1="40" y1="20" x2="140" y2="20" stroke="#475569" stroke-width="4" />
        <line x1="90" y1="20" x2="90" y2="50" stroke="#475569" stroke-width="3" />
        <!-- Polea -->
        <circle cx="90" cy="65" r="25" fill="#f8fafc" stroke="#0284c7" stroke-width="3" />
        <circle cx="90" cy="65" r="5" fill="#0284c7" />
        <!-- Cuerdas -->
        <line x1="65" y1="65" x2="65" y2="140" stroke="#334155" stroke-width="2.5" />
        <line x1="115" y1="65" x2="115" y2="180" stroke="#334155" stroke-width="2.5" />
        <!-- Masa 1 -->
        <rect x="45" y="140" width="40" height="35" rx="3" fill="#bae6fd" stroke="#0284c7" stroke-width="2" />
        <text x="65" y="162" text-anchor="middle" fill="#0369a1" font-family="sans-serif" font-weight="bold" font-size="14">m₁</text>
        <!-- Masa 2 -->
        <rect x="95" y="180" width="40" height="35" rx="3" fill="#fed7aa" stroke="#ea580c" stroke-width="2" />
        <text x="115" y="202" text-anchor="middle" fill="#c2410c" font-family="sans-serif" font-weight="bold" font-size="14">m₂</text>
      </svg>
    `
  },
  {
    id: 'resorte_masa',
    category: 'mecanica',
    title: 'Sistema Masa-Resorte',
    description: 'Oscilador armónico con resorte de constante k',
    defaultWidth: 260,
    defaultHeight: 120,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 120" width="260" height="120">
        <!-- Pared Fija -->
        <line x1="20" y1="20" x2="20" y2="100" stroke="#475569" stroke-width="4" />
        <!-- Piso -->
        <line x1="20" y1="100" x2="250" y2="100" stroke="#94a3b8" stroke-width="2" />
        <!-- Resorte Zig-Zag -->
        <path d="M 20,60 L 40,60 L 50,45 L 65,75 L 80,45 L 95,75 L 110,45 L 125,75 L 140,45 L 155,75 L 165,60 L 180,60" fill="none" stroke="#6366f1" stroke-width="3" stroke-linejoin="round" />
        <text x="100" y="35" text-anchor="middle" fill="#6366f1" font-family="sans-serif" font-weight="bold" font-size="14">k</text>
        <!-- Bloque m -->
        <rect x="180" y="35" width="50" height="50" rx="4" fill="#ddd6fe" stroke="#4f46e5" stroke-width="2.5" />
        <text x="205" y="65" text-anchor="middle" fill="#4338ca" font-family="sans-serif" font-weight="bold" font-size="16">m</text>
      </svg>
    `
  },

  // PLANO CARTESIANO Y COORDENADAS
  {
    id: 'plano_cartesiano',
    category: 'coordenadas',
    title: 'Plano Cartesiano X-Y',
    description: 'Ejes coordenados graduados con cuadrícula para gráficas',
    defaultWidth: 240,
    defaultHeight: 240,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
        <!-- Cuadrícula tenue -->
        <defs>
          <pattern id="grid_pattern" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(148, 163, 184, 0.25)" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="240" height="240" fill="url(#grid_pattern)" rx="8" />
        <!-- Eje X -->
        <line x1="15" y1="120" x2="225" y2="120" stroke="#0f172a" stroke-width="2.5" />
        <polygon points="230,120 220,115 220,125" fill="#0f172a" />
        <text x="225" y="140" fill="#0f172a" font-family="sans-serif" font-weight="bold" font-size="14">X</text>
        <!-- Eje Y -->
        <line x1="120" y1="225" x2="120" y2="15" stroke="#0f172a" stroke-width="2.5" />
        <polygon points="120,10 115,20 125,20" fill="#0f172a" />
        <text x="132" y="22" fill="#0f172a" font-family="sans-serif" font-weight="bold" font-size="14">Y</text>
        <!-- Origen (0,0) -->
        <circle cx="120" cy="120" r="3.5" fill="#ef4444" />
        <text x="105" y="136" fill="#64748b" font-family="sans-serif" font-size="11">0</text>
      </svg>
    `
  },

  // CIRCUITOS ELÉCTRICOS
  {
    id: 'circuito_completo',
    category: 'circuitos',
    title: 'Circuito Serie R-V',
    description: 'Fuente de voltaje, resistencia e interruptor',
    defaultWidth: 260,
    defaultHeight: 160,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 160" width="260" height="160">
        <!-- Cables -->
        <rect x="30" y="25" width="200" height="110" fill="none" stroke="#334155" stroke-width="2.5" rx="4" />
        <!-- Batería izquierda -->
        <rect x="20" y="60" width="20" height="40" fill="#ffffff" />
        <line x1="22" y1="70" x2="38" y2="70" stroke="#0f172a" stroke-width="4" />
        <line x1="26" y1="85" x2="34" y2="85" stroke="#0f172a" stroke-width="2" />
        <text x="10" y="66" fill="#ef4444" font-family="sans-serif" font-weight="bold" font-size="12">+</text>
        <text x="10" y="95" fill="#0284c7" font-family="sans-serif" font-weight="bold" font-size="14">-</text>
        <text x="8" y="115" fill="#0f172a" font-family="sans-serif" font-weight="bold" font-size="12">V</text>
        <!-- Resistor superior -->
        <rect x="100" y="15" width="60" height="20" fill="#ffffff" />
        <path d="M 100,25 L 110,25 L 115,15 L 125,35 L 135,15 L 145,35 L 150,25 L 160,25" fill="none" stroke="#ea580c" stroke-width="2.5" />
        <text x="130" y="10" text-anchor="middle" fill="#ea580c" font-family="sans-serif" font-weight="bold" font-size="13">R</text>
        <!-- Interruptor inferior -->
        <rect x="110" y="125" width="40" height="20" fill="#ffffff" />
        <circle cx="115" cy="135" r="3" fill="#334155" />
        <circle cx="145" cy="135" r="3" fill="#334155" />
        <line x1="115" y1="135" x2="140" y2="122" stroke="#334155" stroke-width="2.5" />
      </svg>
    `
  },

  // QUÍMICA & LABORATORIO
  {
    id: 'matraz_erlenmeyer',
    category: 'quimica',
    title: 'Matraz Erlenmeyer con Líquido',
    description: 'Recipiente de laboratorio para mezclas y reacciones',
    defaultWidth: 160,
    defaultHeight: 200,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200" width="160" height="200">
        <!-- Vidrio Matraz -->
        <path d="M 70,20 L 90,20 L 90,60 L 140,165 A 15,15 0 0,1 125,185 L 35,185 A 15,15 0 0,1 20,165 L 70,60 Z" fill="rgba(241, 245, 249, 0.6)" stroke="#0284c7" stroke-width="3" stroke-linejoin="round" />
        <!-- Líquido reactivo -->
        <path d="M 33,165 A 15,15 0 0,0 45,180 L 115,180 A 15,15 0 0,0 127,165 L 112,130 Q 80,125 48,130 Z" fill="rgba(16, 185, 129, 0.45)" stroke="#10b981" stroke-width="2" />
        <!-- Burbujas de reacción -->
        <circle cx="70" cy="155" r="4" fill="#34d399" opacity="0.8" />
        <circle cx="95" cy="145" r="3" fill="#34d399" opacity="0.8" />
        <circle cx="82" cy="165" r="5" fill="#34d399" opacity="0.8" />
        <!-- Graduación -->
        <line x1="95" y1="140" x2="105" y2="140" stroke="#0284c7" stroke-width="1.5" />
        <line x1="90" y1="120" x2="102" y2="120" stroke="#0284c7" stroke-width="1.5" />
        <line x1="85" y1="100" x2="98" y2="100" stroke="#0284c7" stroke-width="1.5" />
      </svg>
    `
  },
  {
    id: 'modelo_atomo',
    category: 'quimica',
    title: 'Modelo Atómico de Bohr / Rutherford',
    description: 'Núcleo central con orbitales de electrones',
    defaultWidth: 200,
    defaultHeight: 200,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <!-- Orbital 1 -->
        <ellipse cx="100" cy="100" rx="80" ry="30" fill="none" stroke="#818cf8" stroke-width="2" transform="rotate(0, 100, 100)" />
        <circle cx="180" cy="100" r="5" fill="#4f46e5" />
        <!-- Orbital 2 -->
        <ellipse cx="100" cy="100" rx="80" ry="30" fill="none" stroke="#38bdf8" stroke-width="2" transform="rotate(60, 100, 100)" />
        <circle cx="140" cy="165" r="5" fill="#0284c7" />
        <!-- Orbital 3 -->
        <ellipse cx="100" cy="100" rx="80" ry="30" fill="none" stroke="#f472b6" stroke-width="2" transform="rotate(120, 100, 100)" />
        <circle cx="60" cy="165" r="5" fill="#db2777" />
        <!-- Núcleo (Protones y Neutrones) -->
        <circle cx="100" cy="100" r="16" fill="#ef4444" stroke="#b91c1c" stroke-width="2" />
        <circle cx="95" cy="95" r="6" fill="#fca5a5" />
        <circle cx="105" cy="103" r="6" fill="#f97316" />
        <text x="100" y="104" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="10">+</text>
      </svg>
    `
  }
];

interface ScienceStencilsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSvg: (svgString: string, width: number, height: number) => void;
}

export const ScienceStencilsModal: React.FC<ScienceStencilsModalProps> = ({
  isOpen,
  onClose,
  onInsertSvg
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  const filteredStencils = STENCILS.filter(st => {
    const matchesCategory = activeCategory === 'todos' || st.category === activeCategory;
    const matchesSearch = st.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          st.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelect = (stencil: ScienceStencil) => {
    onInsertSvg(stencil.svg, stencil.defaultWidth, stencil.defaultHeight);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-xl text-white shadow-lg shadow-emerald-500/20">
              <Atom className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Biblioteca de Figuras y Diagramas Científicos
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Vectorial HD
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Física mecánica, circuitos eléctricos, química y planos cartesianos
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

        {/* Filter Bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1.5 overflow-x-auto text-xs">
            {[
              { id: 'todos', label: 'Todos los diagramas' },
              { id: 'mecanica', label: 'Física y Mecánica' },
              { id: 'coordenadas', label: 'Planos y Gráficas' },
              { id: 'circuitos', label: 'Circuitos Eléctricos' },
              { id: 'quimica', label: 'Química y Átomos' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition ${
                  activeCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar figura o experimento..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-1.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 w-56"
            />
          </div>
        </div>

        {/* Stencils Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStencils.map(stencil => (
            <div
              key={stencil.id}
              onClick={() => handleSelect(stencil)}
              className="bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/60 rounded-2xl p-4 cursor-pointer transition flex flex-col justify-between group shadow-md hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-0.5"
            >
              {/* Preview Area */}
              <div className="bg-white/95 rounded-xl p-4 h-44 flex items-center justify-center mb-3 shadow-inner overflow-hidden">
                <div
                  className="max-h-full max-w-full flex items-center justify-center transition group-hover:scale-105"
                  dangerouslySetInnerHTML={{ __html: stencil.svg }}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition">
                    {stencil.title}
                  </h3>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {stencil.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {stencil.description}
                </p>
                <button className="w-full py-2 bg-emerald-600/20 group-hover:bg-emerald-600 text-emerald-400 group-hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition">
                  <Plus className="w-4 h-4" />
                  Insertar en Pizarra
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
