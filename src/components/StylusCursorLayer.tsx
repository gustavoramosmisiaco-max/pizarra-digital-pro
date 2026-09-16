import React, { useEffect, useState } from 'react';
import { ToolType, DrawingSettings } from '../types/whiteboard';

interface StylusCursorLayerProps {
  activeTool: ToolType;
  settings: DrawingSettings;
  zoomLevel: number;
  cardRef: React.RefObject<HTMLDivElement>;
}

export const StylusCursorLayer: React.FC<StylusCursorLayerProps> = ({
  activeTool,
  settings,
  zoomLevel,
  cardRef,
}) => {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [pressure, setPressure] = useState<number>(0);
  const [pointerType, setPointerType] = useState<string>('mouse');
  const [isInside, setIsInside] = useState<boolean>(false);

  useEffect(() => {
    const cardEl = cardRef.current;
    if (!cardEl) return;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = cardEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
        setIsInside(false);
        setPos(null);
        return;
      }

      setIsInside(true);
      setPos({ x, y });
      setPressure(e.pressure || 0);
      setPointerType(e.pointerType || 'mouse');
    };

    const handlePointerLeave = () => {
      setIsInside(false);
      setPos(null);
    };

    const handlePointerEnter = () => {
      setIsInside(true);
    };

    // Attach directly to window and cardEl for smooth hover tracking
    window.addEventListener('pointermove', handlePointerMove);
    cardEl.addEventListener('pointerleave', handlePointerLeave);
    cardEl.addEventListener('pointerenter', handlePointerEnter);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (cardEl) {
        cardEl.removeEventListener('pointerleave', handlePointerLeave);
        cardEl.removeEventListener('pointerenter', handlePointerEnter);
      }
    };
  }, [cardRef]);

  // Don't show custom cursor for pan or select (use native system cursor)
  if (!isInside || !pos || activeTool === 'pan' || activeTool === 'select' || activeTool === 'laser' || activeTool === 'text') {
    return null;
  }

  // Calculate dynamic brush size considering pressure and zoom
  let brushSize = settings.strokeWidth * zoomLevel;
  if (activeTool === 'pen' && settings.enablePressure && pressure > 0 && pressure !== 0.5) {
    const p = Math.min(1, Math.max(0.05, pressure));
    const factor = 0.2 + 1.6 * Math.pow(p, 1.2);
    brushSize = Math.max(3, settings.strokeWidth * factor * zoomLevel);
  } else if (activeTool === 'highlighter') {
    brushSize = settings.highlighterWidth * zoomLevel;
  } else if (activeTool === 'eraser') {
    brushSize = (settings.eraserWidth || 24) * zoomLevel;
  }

  const diameter = Math.max(6, brushSize);

  // ERASER CURSOR
  if (activeTool === 'eraser') {
    return (
      <div
        className="pointer-events-none absolute z-50 transition-none"
        style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      >
        <div className="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
          {/* Eraser Outer Ring */}
          <div
            className="rounded-full border-2 border-dashed border-rose-500 bg-rose-500/15 shadow-sm"
            style={{ width: `${Math.max(20, diameter)}px`, height: `${Math.max(20, diameter)}px` }}
          />
          {/* Subpixel Center Dot */}
          <div className="absolute w-1.5 h-1.5 bg-rose-600 rounded-full shadow" />
        </div>
      </div>
    );
  }

  // HIGHLIGHTER CURSOR
  if (activeTool === 'highlighter') {
    return (
      <div
        className="pointer-events-none absolute z-50 transition-none"
        style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      >
        <div className="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
          <div
            className="rounded-full border border-slate-900/40 dark:border-white/50 shadow-sm"
            style={{
              width: `${Math.max(16, diameter)}px`,
              height: `${Math.max(16, diameter)}px`,
              backgroundColor: settings.highlighterColor,
              opacity: 0.6,
            }}
          />
          <div className="absolute w-1.5 h-1.5 bg-slate-900 dark:bg-white rounded-full opacity-90 shadow" />
        </div>
      </div>
    );
  }

  // SHAPE OR CROSSHAIR TOOLS
  if (['line', 'arrow', 'vector', 'rect', 'circle', 'triangle_right', 'angle_arc', 'snip'].includes(activeTool)) {
    return (
      <div
        className="pointer-events-none absolute z-50 transition-none"
        style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      >
        <div className="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
          <div className="w-6 h-6 flex items-center justify-center relative">
            <div className="absolute w-full h-[1.5px] bg-slate-900 dark:bg-white shadow" />
            <div className="absolute h-full w-[1.5px] bg-slate-900 dark:bg-white shadow" />
            <div className="w-1.5 h-1.5 bg-sky-500 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-md z-10" />
          </div>
        </div>
      </div>
    );
  }

  // STANDARD PEN / STYLUS DYNAMIC RETICLE
  return (
    <div
      className="pointer-events-none absolute z-50 transition-none"
      style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
        
        {/* Dynamic Stroke Circle */}
        <div
          className="rounded-full border border-slate-900 dark:border-white shadow-sm transition-all duration-75"
          style={{
            width: `${diameter}px`,
            height: `${diameter}px`,
            backgroundColor: settings.strokeColor,
            opacity: 0.65,
          }}
        />

        {/* Precision Subpixel Center Dot (Exact point where the ink line begins) */}
        <div className="absolute w-1.5 h-1.5 rounded-full bg-red-500 ring-1 ring-white dark:ring-slate-950 shadow-md z-10" />

        {/* Floating Pressure Level (visible with active stylus) */}
        {pointerType === 'pen' && pressure > 0 && (
          <div className="absolute top-3 left-3 text-[9px] font-mono px-1 py-0.5 rounded bg-slate-900/90 text-sky-400 border border-slate-700/80 shadow whitespace-nowrap">
            {Math.round(pressure * 8192)}
          </div>
        )}
      </div>
    </div>
  );
};
