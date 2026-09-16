import React, { useState, useRef, useEffect } from 'react';
import {
  Cable,
  Monitor,
  Smartphone,
  Tablet,
  CheckCircle2,
  Sparkles,
  X,
  Gauge,
  PenTool,
  Zap,
} from 'lucide-react';
import { PointerTelemetry } from '../types/whiteboard';

interface UsbConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: PointerTelemetry;
}

export const UsbConnectionModal: React.FC<UsbConnectionModalProps> = ({
  isOpen,
  onClose,
  telemetry,
}) => {
  const [activeTab, setActiveTab] = useState<'screen' | 'tablet' | 'hardware' | 'test'>('screen');
  const testCanvasRef = useRef<HTMLCanvasElement>(null);
  const [testLog, setTestLog] = useState<string[]>([]);
  const [livePressure, setLivePressure] = useState<number>(0);

  // Test drawing area inside modal
  useEffect(() => {
    if (!isOpen || activeTab !== 'test') return;
    const canvas = testCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      lastX = e.clientX - rect.left;
      lastY = e.clientY - rect.top;
      const p = e.pressure > 0 ? e.pressure : 0.5;
      setLivePressure(p);
      setTestLog((prev) => [
        `▶ pointerdown [${e.pointerType}] Presión: ${(p * 100).toFixed(0)}%`,
        ...prev.slice(0, 4),
      ]);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      const p = e.pressure > 0 ? e.pressure : 0.5;
      setLivePressure(p);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(currentX, currentY);
      ctx.strokeStyle = '#4f46e5';
      // Scale width based on pressure if available
      ctx.lineWidth = Math.max(2, p * 12);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();

      lastX = currentX;
      lastY = currentY;
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isDrawing) {
        isDrawing = false;
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch {
          // Ignore
        }
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Cable className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Conectar Celular / Tablet por USB-C
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 font-semibold border border-emerald-300 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  0ms Latencia
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Usa tu dispositivo móvil o tableta digitalizadora como lienzo táctil en Windows
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Animated Vector Illustration */}
        <div className="px-6 pt-5 pb-2 bg-gradient-to-b from-indigo-50/50 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900/90 border-b border-slate-200 dark:border-slate-800">
          <div className="relative max-w-xl mx-auto h-40 flex items-center justify-between px-6">
            
            {/* Phone/Tablet device */}
            <div className="flex flex-col items-center gap-2 z-10">
              <div className="relative w-20 h-28 bg-slate-900 border-2 border-slate-700 rounded-xl shadow-lg p-1.5 flex flex-col items-center justify-between group hover:border-indigo-500 transition-colors">
                <div className="w-3 h-1 bg-slate-700 rounded-full" />
                <div className="w-full flex-1 bg-gradient-to-tr from-indigo-900/50 to-emerald-900/30 rounded border border-slate-800 flex items-center justify-center p-1 text-center">
                  <div className="text-[9px] font-mono text-indigo-300 leading-tight">
                    Lápiz / Táctil
                  </div>
                </div>
                <div className="w-2.5 h-2.5 rounded-full border border-slate-700" />
                {/* Stylus indicator */}
                <div className="absolute -top-3 -right-2 transform rotate-12 text-indigo-500 drop-shadow">
                  <PenTool className="w-5 h-5 animate-bounce" />
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5" /> Celular / Tablet
              </span>
            </div>

            {/* Glowing USB-C Cable Animation */}
            <div className="flex-1 relative flex items-center justify-center px-4">
              <svg className="w-full h-12 overflow-visible" viewBox="0 0 200 40">
                <defs>
                  <linearGradient id="cableGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Main Cable Line */}
                <path
                  d="M 10 20 C 60 5, 140 35, 190 20"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="5"
                  strokeLinecap="round"
                />

                {/* Glowing Active Data Flow */}
                <path
                  d="M 10 20 C 60 5, 140 35, 190 20"
                  fill="none"
                  stroke="url(#cableGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  filter="url(#glow)"
                  className="animate-pulse"
                />

                {/* USB-C Connector heads */}
                <rect x="0" y="14" width="10" height="12" rx="3" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />
                <rect x="190" y="14" width="10" height="12" rx="3" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />

                {/* Flowing particle dots */}
                <circle r="3" fill="#10b981">
                  <animateMotion
                    path="M 10 20 C 60 5, 140 35, 190 20"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>

              <div className="absolute -bottom-1 bg-slate-900/80 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1 shadow">
                <Zap className="w-2.5 h-2.5" /> USB-C Alta Velocidad
              </div>
            </div>

            {/* PC / Laptop device */}
            <div className="flex flex-col items-center gap-2 z-10">
              <div className="w-28 h-20 bg-slate-900 border-2 border-slate-700 rounded-t-xl shadow-lg p-1.5 flex flex-col items-center justify-between group hover:border-indigo-500 transition-colors">
                <div className="w-full flex-1 bg-gradient-to-tr from-slate-950 to-indigo-950 rounded border border-slate-800 flex items-center justify-center p-1 text-center">
                  <div className="text-[10px] font-bold text-white tracking-wide">
                    Pizarra Pro
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-b mt-1" />
              </div>
              <div className="w-32 h-1 bg-slate-700 rounded-b shadow" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Monitor className="w-3.5 h-3.5" /> PC Windows
              </span>
            </div>

          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-100/50 dark:bg-slate-950/50">
          <button
            onClick={() => setActiveTab('screen')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'screen'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Tablet className="w-4 h-4" />
            Opción B: Segunda Pantalla Táctil (Recomendada)
          </button>
          <button
            onClick={() => setActiveTab('tablet')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'tablet'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Opción A: Modo Tableta Gráfica (VirtualTablet)
          </button>
          <button
            onClick={() => setActiveTab('hardware')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'hardware'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <PenTool className="w-4 h-4" />
            Tabletas Gráficas USB (XP-Pen / Huion / Wacom)
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'test'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Gauge className="w-4 h-4" />
            Probador de Puntero en Vivo
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {activeTab === 'screen' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-sm text-indigo-950 dark:text-indigo-200 leading-relaxed">
                  <strong className="font-bold">¿Cómo funciona la Opción B?</strong> Tu celular o tablet Android se convierte en un <strong>segundo monitor táctil</strong> de tu PC por cable USB-C. Ves la pizarra directamente en el celular y dibujas con la mano o con cualquier lápiz stylus mientras tus alumnos ven la pantalla en tu PC.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">1</div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Activar Depuración USB</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    En tu Android: <strong>Ajustes &gt; Acerca del teléfono</strong>. Pulsa 7 veces en <strong>Número de compilación</strong>. Luego ve a <strong>Opciones de desarrollador</strong> y activa <strong>Depuración por USB</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">2</div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Instalar App Puente</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Instala <strong>SuperDisplay</strong> (recomendada con soporte de lápiz) o <strong>Spacedesk</strong> en tu PC y en tu celular/tablet. Conecta el cable USB-C.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">3</div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Arrastrar la Pizarra</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Arrastra la ventana del navegador a la pantalla del celular y presiona <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[10px]">F11</kbd> para pantalla completa. ¡Dibuja con total libertad!
                  </p>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span><strong>Ventaja clave:</strong> No requiere lápiz con batería; puedes usar lápices capacitivos económicos de punta de disco/goma.</span>
              </div>
            </div>
          )}

          {activeTab === 'tablet' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5" />
                <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  <strong className="font-bold">Modo Tableta Digitalizadora (VirtualTablet):</strong> En este modo no ves la imagen en el celular; el celular actúa como una tableta Wacom sin pantalla (touchpad gigante). Tú miras la pantalla de tu PC mientras mueves el dedo o lápiz en el celular.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">1</div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Instalar VirtualTablet Server</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Descarga e instala el servidor gratuito de VirtualTablet para Windows desde su web oficial.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">2</div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">App VirtualTablet en Celular</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Instala VirtualTablet desde Play Store. Conecta el cable USB-C a la PC y selecciona el modo de conexión <strong>USB</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">3</div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">¡Listo para Rayar!</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Al tocar la pantalla del celular, el puntero en esta pizarra responderá como una tableta digitalizadora.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hardware' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                <PenTool className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  <strong className="font-bold">¿Compraste una tableta gráfica económica?</strong> (Modelos como <em>XP-Pen Deco Mini, Huion Inspiroy H430P / H640P, One by Wacom o Gaomon S620</em>).
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>100% Plug & Play:</strong> Solo conecta el cable USB a tu PC con Windows.</span>
                </li>
                <li className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>Windows Ink:</strong> Asegúrate de que en el software de la tableta esté activada la casilla <em>"Habilitar Windows Ink"</em> para que el navegador reciba la presión del lápiz.</span>
                </li>
                <li className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span><strong>Botones del lápiz:</strong> Puedes configurar el botón lateral del lápiz como borrador o clic derecho.</span>
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Prueba a dibujar aquí con tu dedo, stylus o ratón:
                </span>
                <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                  Presión: {(livePressure * 100).toFixed(0)}%
                </span>
              </div>

              {/* Live Canvas Area */}
              <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden h-48 bg-slate-50 dark:bg-slate-950">
                <canvas ref={testCanvasRef} className="w-full h-full cursor-crosshair touch-none" />
                <div className="absolute top-2 right-2 flex flex-col gap-1 text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg backdrop-blur border border-slate-200 dark:border-slate-800 pointer-events-none">
                  {testLog.length > 0 ? (
                    testLog.map((log, i) => <div key={i}>{log}</div>)
                  ) : (
                    <div>Toca o dibuja aquí para probar la entrada...</div>
                  )}
                </div>
              </div>

              {/* Hardware diagnostics */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Tipo de Puntero</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-white capitalize">
                    {telemetry.pointerType}
                  </div>
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Sensor de Presión</div>
                  <div className={`text-sm font-bold ${telemetry.hasPressureSupport ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {telemetry.hasPressureSupport ? 'Activo (Dinámico)' : 'Modo Fijo (Uniforme)'}
                  </div>
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Muestreo API</div>
                  <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {telemetry.sampleCount} eventos
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className={`w-2.5 h-2.5 rounded-full ${telemetry.pointerType === 'pen' ? 'bg-emerald-500' : telemetry.pointerType === 'touch' ? 'bg-indigo-500' : 'bg-slate-400'}`} />
            <span>Puntero actual: <strong>{telemetry.pointerType === 'pen' ? 'Lápiz / Stylus' : telemetry.pointerType === 'touch' ? 'Pantalla Táctil' : 'Ratón Estándar'}</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            Entendido, empezar a dibujar
          </button>
        </div>

      </div>
    </div>
  );
};
