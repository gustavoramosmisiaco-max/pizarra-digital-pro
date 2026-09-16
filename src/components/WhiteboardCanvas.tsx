import React, { useEffect, useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import {
  ToolType,
  DrawingSettings,
  WhiteboardPage,
  PointerTelemetry,
} from '../types/whiteboard';
import { LaserPointerLayer } from './LaserPointerLayer';
import { StylusCursorLayer } from './StylusCursorLayer';
import { ZoomIn, ZoomOut, Maximize2, Check, ArrowRight } from 'lucide-react';

interface WhiteboardCanvasProps {
  currentPage: WhiteboardPage;
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  settings: DrawingSettings;
  telemetry?: PointerTelemetry;
  onCanvasChange: (json: string, thumbnail: string) => void;
  onUndoStatePush: (json: string) => void;
  canvasRefCallback?: (canvas: fabric.Canvas | null) => void;
  isDarkMode: boolean;
  onSendSnippetToNewPage?: (dataUrl: string) => void;
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  currentPage,
  activeTool,
  onSelectTool,
  settings,
  onCanvasChange,
  onUndoStatePush,
  canvasRefCallback,
  isDarkMode,
  onSendSnippetToNewPage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const isDrawingShapeRef = useRef(false);
  const activeShapeRef = useRef<fabric.Object | null>(null);
  const shapeOriginRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isUpdatingPageRef = useRef(false);

  // Snipping state
  const isSnippingRef = useRef(false);
  const snipOriginRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const snipRectRef = useRef<fabric.Rect | null>(null);
  const [snipToast, setSnipToast] = useState<string | null>(null);
  const [lastSnippetData, setLastSnippetData] = useState<string | null>(null);

  // Helper to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    let c = hex.replace('#', '');
    if (c.length === 3) {
      c = c.split('').map((x) => x + x).join('');
    }
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Generate thumbnail & notify change
  const notifyChange = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || isUpdatingPageRef.current) return;

    try {
      const json = JSON.stringify(canvas.toJSON());
      const thumbnail = canvas.toDataURL({
        format: 'png',
        multiplier: 0.25,
        quality: 0.8,
      });
      onCanvasChange(json, thumbnail);
      onUndoStatePush(json);
    } catch (err) {
      console.error('Error generating canvas snapshot:', err);
    }
  }, [onCanvasChange, onUndoStatePush]);

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!canvasElementRef.current || !containerRef.current) return;

    const width = 1920;
    const height = 1080;

    const canvas = new fabric.Canvas(canvasElementRef.current, {
      width,
      height,
      backgroundColor: 'transparent',
      selection: true,
      preserveObjectStacking: true,
      fireRightClick: true,
      stopContextMenu: true,
    });

    fabricCanvasRef.current = canvas;
    if (canvasRefCallback) canvasRefCallback(canvas);

    // Initial fit zoom to container
    const fitToContainer = () => {
      if (!containerRef.current || !canvas) return;
      const cWidth = containerRef.current.clientWidth;
      const cHeight = containerRef.current.clientHeight;
      const scaleX = (cWidth - 60) / width;
      const scaleY = (cHeight - 60) / height;
      const scale = Math.min(scaleX, scaleY, 1.2);
      
      canvas.setDimensions({
        width: width * scale,
        height: height * scale,
      });
      canvas.setZoom(scale);
      setZoomLevel(scale);
    };

    fitToContainer();
    window.addEventListener('resize', fitToContainer);

    // Listen to object changes
    canvas.on('object:modified', () => notifyChange());
    canvas.on('object:added', () => {
      if (!isUpdatingPageRef.current && !isDrawingShapeRef.current && !isSnippingRef.current) {
        notifyChange();
      }
    });
    canvas.on('object:removed', () => {
      if (!isUpdatingPageRef.current && !isSnippingRef.current) {
        notifyChange();
      }
    });

    // 8192 Levels Dynamic Pressure & Stylus Barrel Button Erase Integration
    const upperEl = (canvas as any).upperCanvasEl as HTMLCanvasElement;
    
    const handleNativePointerEvent = (e: PointerEvent) => {
      // 1. Stylus Barrel Button (Right click / button 2): Instant Erase on hover/click
      if (e.buttons === 2 || (e as any).button === 2) {
        const target = canvas.findTarget(e, false);
        if (target) {
          canvas.remove(target);
          canvas.renderAll();
          notifyChange();
        }
      }

      // 2. Real-time dynamic brush width calibration for graphic tablets
      if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
        if (e.pressure > 0 && e.pressure !== 0.5) {
          // Non-linear cubic pressure curve for expressive calligraphy & math symbols
          const p = Math.min(1, Math.max(0.05, e.pressure));
          const factor = 0.2 + 1.6 * Math.pow(p, 1.2);
          const baseW = (window as any).__activeStrokeWidth || 4;
          canvas.freeDrawingBrush.width = Math.max(1.5, baseW * factor);
        }
      }
    };

    if (upperEl) {
      upperEl.addEventListener('pointerdown', handleNativePointerEvent);
      upperEl.addEventListener('pointermove', handleNativePointerEvent);
    }

    return () => {
      window.removeEventListener('resize', fitToContainer);
      if (upperEl) {
        upperEl.removeEventListener('pointerdown', handleNativePointerEvent);
        upperEl.removeEventListener('pointermove', handleNativePointerEvent);
      }
      canvas.dispose();
      fabricCanvasRef.current = null;
      if (canvasRefCallback) canvasRefCallback(null);
    };
  }, []);

  // Update canvas background and objects when active page changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    isUpdatingPageRef.current = true;

    // 1. Remove previous objects safely without removing background setup
    const existingObjects = canvas.getObjects();
    while (existingObjects.length > 0) {
      canvas.remove(existingObjects[0]);
    }

    // 2. Set Background Image
    if (currentPage.bgDataUrl) {
      const img = new Image();
      img.onload = () => {
        const bgImg = new fabric.Image(img);

        // Smart PDF / Document layout:
        // If the document is vertical (A4 portrait), place it on the left with height 1040,
        // leaving the entire right area (x ~ 800 to 1920) as a giant clean working canvas to solve exercises!
        const isPortrait = (img.width / img.height) < 1.0;
        let scale = 1;
        let leftPos = 0;
        let topPos = 0;

        if (isPortrait) {
          // Fit height with 20px padding top/bottom
          scale = 1040 / img.height;
          leftPos = 20;
          topPos = 20;
        } else {
          // Fit widescreen 16:9
          scale = Math.min(1920 / img.width, 1080 / img.height);
          leftPos = (1920 - img.width * scale) / 2;
          topPos = (1080 - img.height * scale) / 2;
        }

        bgImg.set({
          left: leftPos,
          top: topPos,
          scaleX: scale,
          scaleY: scale,
          originX: 'left',
          originY: 'top',
          selectable: false,
          evented: false,
        });

        canvas.setBackgroundImage(bgImg, () => {
          loadPageObjects(canvas, currentPage.canvasJson);
        });
      };
      img.onerror = () => {
        canvas.setBackgroundImage(null as any, () => {
          loadPageObjects(canvas, currentPage.canvasJson);
        });
      };
      img.src = currentPage.bgDataUrl;
    } else {
      canvas.setBackgroundImage(null as any, () => {
        loadPageObjects(canvas, currentPage.canvasJson);
      });
    }

    function loadPageObjects(cv: fabric.Canvas, json?: string) {
      if (json && json !== '{}' && json !== '{"version":"5.3.0","objects":[]}') {
        try {
          const parsed = typeof json === 'string' ? JSON.parse(json) : json;
          const objects = parsed.objects || [];
          
          fabric.util.enlivenObjects(objects, (enlivenedObjects: fabric.Object[]) => {
            enlivenedObjects.forEach((obj) => {
              cv.add(obj);
            });
            cv.renderAll();
            isUpdatingPageRef.current = false;
          }, 'fabric');
        } catch {
          cv.renderAll();
          isUpdatingPageRef.current = false;
        }
      } else {
        cv.renderAll();
        isUpdatingPageRef.current = false;
      }
    }
  }, [currentPage.id, currentPage.bgDataUrl]);

  // Update Tool & Pointer mode
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (activeTool === 'pen') {
      (window as any).__activeStrokeWidth = settings.strokeWidth;
      canvas.isDrawingMode = true;
      canvas.selection = false;
      if (!canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      }
      canvas.freeDrawingBrush.color = settings.strokeColor;
      canvas.freeDrawingBrush.width = settings.strokeWidth;
      canvas.freeDrawingBrush.strokeLineCap = 'round';
      canvas.freeDrawingBrush.strokeLineJoin = 'round';
      canvas.freeDrawingBrush.decimate = 2;
    } else if (activeTool === 'highlighter') {
      canvas.isDrawingMode = true;
      canvas.selection = false;
      if (!canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      }
      canvas.freeDrawingBrush.color = hexToRgba(settings.highlighterColor, 0.35);
      canvas.freeDrawingBrush.width = settings.strokeWidth * 3.5;
      canvas.freeDrawingBrush.strokeLineCap = 'square';
      canvas.freeDrawingBrush.strokeLineJoin = 'bevel';
      canvas.freeDrawingBrush.decimate = 2;
    } else if (activeTool === 'eraser') {
      canvas.isDrawingMode = false;
      canvas.selection = true;
      canvas.defaultCursor = 'crosshair';
    } else if (activeTool === 'snip') {
      canvas.isDrawingMode = false;
      canvas.selection = false;
      canvas.defaultCursor = 'crosshair';
    } else if (activeTool === 'select') {
      canvas.isDrawingMode = false;
      canvas.selection = true;
      canvas.defaultCursor = 'default';
    } else if (activeTool === 'pan') {
      canvas.isDrawingMode = false;
      canvas.selection = false;
      canvas.defaultCursor = 'grab';
    } else {
      // Shapes / Text / Laser
      canvas.isDrawingMode = false;
      canvas.selection = false;
      canvas.defaultCursor = 'crosshair';
    }
  }, [
    activeTool,
    settings.strokeColor,
    settings.strokeWidth,
    settings.highlighterColor,
    settings.highlighterWidth,
  ]);

  // Pointer & Mouse interactions for Shapes, Snip, Eraser, Text and Pan
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (opt: fabric.IEvent) => {
      const pointer = canvas.getPointer(opt.e);

      // 1. Pan Tool or Middle Mouse Click / Space
      if (activeTool === 'pan' || (opt.e as MouseEvent).button === 1) {
        isPanningRef.current = true;
        panStartRef.current = { x: (opt.e as MouseEvent).clientX, y: (opt.e as MouseEvent).clientY };
        canvas.defaultCursor = 'grabbing';
        return;
      }

      // 2. Eraser Mode (click object to erase)
      if (activeTool === 'eraser') {
        const target = opt.target;
        if (target) {
          canvas.remove(target);
          canvas.renderAll();
          notifyChange();
        }
        return;
      }

      // 3. SNIP / CROP EXERCISE TOOL
      if (activeTool === 'snip') {
        isSnippingRef.current = true;
        snipOriginRef.current = { x: pointer.x, y: pointer.y };

        const snipRect = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: 'rgba(99, 102, 241, 0.15)',
          stroke: '#6366f1',
          strokeWidth: 2,
          strokeDashArray: [6, 4],
          selectable: false,
          evented: false,
        });
        snipRectRef.current = snipRect;
        canvas.add(snipRect);
        return;
      }

      // 4. Text Tool
      if (activeTool === 'text') {
        const text = new fabric.IText('Escribe tu texto aquí...', {
          left: pointer.x,
          top: pointer.y,
          fontFamily: 'Inter, sans-serif',
          fontSize: 24,
          fill: settings.strokeColor,
          padding: 8,
          cornerColor: '#6366f1',
          cornerSize: 8,
          transparentCorners: false,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
        text.selectAll();
        canvas.renderAll();
        notifyChange();
        return;
      }

      // 5. Shapes & Science Tools (Line, Arrow, Vector, Rect, Circle, Triangle 37/53, Angle Arc)
      if (['line', 'arrow', 'vector', 'rect', 'circle', 'triangle_right', 'angle_arc'].includes(activeTool)) {
        isDrawingShapeRef.current = true;
        shapeOriginRef.current = { x: pointer.x, y: pointer.y };

        const strokeStyle = {
          stroke: settings.strokeColor,
          strokeWidth: settings.strokeWidth,
          fill: settings.isFilled ? hexToRgba(settings.strokeColor, 0.15) : 'transparent',
          strokeLineCap: 'round' as const,
          strokeLineJoin: 'round' as const,
          selectable: false,
        };

        if (activeTool === 'line' || activeTool === 'arrow' || activeTool === 'vector' || activeTool === 'angle_arc') {
          const line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], strokeStyle);
          activeShapeRef.current = line;
          canvas.add(line);
        } else if (activeTool === 'rect') {
          const rect = new fabric.Rect({
            left: pointer.x,
            top: pointer.y,
            width: 0,
            height: 0,
            rx: 6,
            ry: 6,
            ...strokeStyle,
          });
          activeShapeRef.current = rect;
          canvas.add(rect);
        } else if (activeTool === 'circle') {
          const circle = new fabric.Ellipse({
            left: pointer.x,
            top: pointer.y,
            rx: 0,
            ry: 0,
            originX: 'center',
            originY: 'center',
            ...strokeStyle,
          });
          activeShapeRef.current = circle;
          canvas.add(circle);
        } else if (activeTool === 'triangle_right') {
          const triangle = new fabric.Polygon([
            new fabric.Point(pointer.x, pointer.y),
            new fabric.Point(pointer.x, pointer.y),
            new fabric.Point(pointer.x, pointer.y),
          ], strokeStyle);
          activeShapeRef.current = triangle;
          canvas.add(triangle);
        }
      }
    };

    const handleMouseMove = (opt: fabric.IEvent) => {
      // Panning
      if (isPanningRef.current) {
        const e = opt.e as MouseEvent;
        const vpt = canvas.viewportTransform;
        if (vpt) {
          vpt[4] += e.clientX - panStartRef.current.x;
          vpt[5] += e.clientY - panStartRef.current.y;
          canvas.requestRenderAll();
          panStartRef.current = { x: e.clientX, y: e.clientY };
        }
        return;
      }

      // Snipping Box resize
      if (isSnippingRef.current && snipRectRef.current) {
        const pointer = canvas.getPointer(opt.e);
        const origin = snipOriginRef.current;
        const width = Math.abs(pointer.x - origin.x);
        const height = Math.abs(pointer.y - origin.y);
        snipRectRef.current.set({
          left: Math.min(origin.x, pointer.x),
          top: Math.min(origin.y, pointer.y),
          width,
          height,
        });
        canvas.renderAll();
        return;
      }

      // Drawing Shapes in real-time
      if (!isDrawingShapeRef.current || !activeShapeRef.current) return;
      const pointer = canvas.getPointer(opt.e);
      const origin = shapeOriginRef.current;

      if (activeTool === 'line' || activeTool === 'arrow' || activeTool === 'vector' || activeTool === 'angle_arc') {
        const line = activeShapeRef.current as fabric.Line;
        line.set({ x2: pointer.x, y2: pointer.y });
      } else if (activeTool === 'triangle_right') {
        const triangle = activeShapeRef.current as fabric.Polygon;
        const x0 = origin.x;
        const y0 = origin.y;
        const x1 = pointer.x;
        const y1 = pointer.y;
        // Points: Top (x0, y0), Right-Angle Corner (x0, y1), Base End (x1, y1)
        triangle.set({
          points: [
            new fabric.Point(x0, y0),
            new fabric.Point(x0, y1),
            new fabric.Point(x1, y1),
          ]
        });
      } else if (activeTool === 'rect') {
        const rect = activeShapeRef.current as fabric.Rect;
        const width = Math.abs(pointer.x - origin.x);
        const height = Math.abs(pointer.y - origin.y);
        rect.set({
          left: Math.min(origin.x, pointer.x),
          top: Math.min(origin.y, pointer.y),
          width,
          height,
        });
      } else if (activeTool === 'circle') {
        const circle = activeShapeRef.current as fabric.Ellipse;
        const rx = Math.abs(pointer.x - origin.x) / 2;
        const ry = Math.abs(pointer.y - origin.y) / 2;
        circle.set({
          left: origin.x + (pointer.x - origin.x) / 2,
          top: origin.y + (pointer.y - origin.y) / 2,
          rx,
          ry,
        });
      }

      canvas.renderAll();
    };

    const handleMouseUp = () => {
      if (isPanningRef.current) {
        isPanningRef.current = false;
        canvas.defaultCursor = activeTool === 'pan' ? 'grab' : 'default';
      }

      // Finish Snipping
      if (isSnippingRef.current && snipRectRef.current) {
        const rect = snipRectRef.current;
        const cropX = rect.left || 0;
        const cropY = rect.top || 0;
        const cropW = rect.width || 0;
        const cropH = rect.height || 0;

        // Remove the visual selection rectangle
        canvas.remove(rect);
        snipRectRef.current = null;
        isSnippingRef.current = false;

        if (cropW > 30 && cropH > 30) {
          // Perform high-res cropping from the composite canvas
          performSnippetCapture(canvas, cropX, cropY, cropW, cropH);
        } else {
          canvas.renderAll();
        }
        return;
      }

      // Finish Shape
      if (isDrawingShapeRef.current && activeShapeRef.current) {
        if (activeTool === 'arrow') {
          const line = activeShapeRef.current as fabric.Line;
          const x1 = line.x1 || 0;
          const y1 = line.y1 || 0;
          const x2 = line.x2 || 0;
          const y2 = line.y2 || 0;

          const angle = Math.atan2(y2 - y1, x2 - x1);
          const headLength = Math.max(16, settings.strokeWidth * 3);

          const head = new fabric.Triangle({
            left: x2,
            top: y2,
            originX: 'center',
            originY: 'center',
            angle: (angle * 180) / Math.PI + 90,
            width: headLength * 0.8,
            height: headLength,
            fill: settings.strokeColor,
            selectable: false,
          });

          canvas.remove(line);
          const group = new fabric.Group([line, head], { selectable: true });
          canvas.add(group);
        } else if (activeTool === 'vector') {
          // Physics Vector: Arrow with Magnitude Label F = 15N
          const line = activeShapeRef.current as fabric.Line;
          const x1 = line.x1 || 0;
          const y1 = line.y1 || 0;
          const x2 = line.x2 || 0;
          const y2 = line.y2 || 0;

          const angle = Math.atan2(y2 - y1, x2 - x1);
          const headLength = Math.max(18, settings.strokeWidth * 3.5);

          const head = new fabric.Triangle({
            left: x2,
            top: y2,
            originX: 'center',
            originY: 'center',
            angle: (angle * 180) / Math.PI + 90,
            width: headLength * 0.9,
            height: headLength,
            fill: settings.strokeColor,
            selectable: false,
          });

          const label = new fabric.Text('F⃗ = 15 N', {
            left: (x1 + x2) / 2,
            top: (y1 + y2) / 2 - 18,
            fontSize: 18,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'bold',
            fill: settings.strokeColor,
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            padding: 4,
            originX: 'center',
            originY: 'center',
            selectable: false,
          });

          canvas.remove(line);
          const vectorGroup = new fabric.Group([line, head, label], { selectable: true });
          canvas.add(vectorGroup);
        } else if (activeTool === 'triangle_right') {
          // Notable Right Triangle (37° / 53° or 3k / 4k / 5k)
          const poly = activeShapeRef.current as fabric.Polygon;
          const pts = poly.points || [];
          canvas.remove(poly);

          if (pts.length >= 3) {
            const x0 = pts[0].x;
            const y0 = pts[0].y;
            const xCorner = pts[1].x;
            const yCorner = pts[1].y;
            const x1 = pts[2].x;
            const y1 = pts[2].y;

            // 1. Triangle Shape
            const trianglePoly = new fabric.Polygon([
              new fabric.Point(x0, y0),
              new fabric.Point(xCorner, yCorner),
              new fabric.Point(x1, y1),
            ], {
              stroke: settings.strokeColor,
              strokeWidth: settings.strokeWidth,
              fill: settings.isFilled ? hexToRgba(settings.strokeColor, 0.15) : 'transparent',
              strokeLineCap: 'round',
              strokeLineJoin: 'round',
              selectable: false,
            });

            // 2. Right-angle square indicator
            const sqSize = 16;
            const sX = x1 > xCorner ? 1 : -1;
            const sY = y0 > yCorner ? 1 : -1;
            const cornerRect = new fabric.Rect({
              left: Math.min(xCorner, xCorner + sqSize * sX),
              top: Math.min(yCorner, yCorner + sqSize * sY),
              width: sqSize,
              height: sqSize,
              fill: settings.strokeColor,
              opacity: 0.85,
              selectable: false,
            });

            // 3. Proportions & Angles Labels (3k, 4k, 5k, 37°, 53°)
            const lbl3k = new fabric.Text('3k (37°)', {
              left: (xCorner + x1) / 2,
              top: yCorner + (sY > 0 ? -22 : 10),
              fontSize: 16,
              fontWeight: 'bold',
              fill: settings.strokeColor,
              originX: 'center',
              selectable: false,
            });

            const lbl4k = new fabric.Text('4k (53°)', {
              left: xCorner + (sX > 0 ? -32 : 12),
              top: (y0 + yCorner) / 2,
              fontSize: 16,
              fontWeight: 'bold',
              fill: settings.strokeColor,
              originX: 'center',
              originY: 'center',
              selectable: false,
            });

            const lbl5k = new fabric.Text('5k', {
              left: (x0 + x1) / 2 + (sX > 0 ? 16 : -16),
              top: (y0 + y1) / 2 - 14,
              fontSize: 18,
              fontWeight: 'bold',
              fill: '#0284c7', // Highlighted hypotenuse
              originX: 'center',
              selectable: false,
            });

            const triGroup = new fabric.Group([trianglePoly, cornerRect, lbl3k, lbl4k, lbl5k], {
              selectable: true
            });
            canvas.add(triGroup);
          }
        } else if (activeTool === 'angle_arc') {
          // Angle Arc with θ or degrees
          const line = activeShapeRef.current as fabric.Line;
          const x1 = line.x1 || 0;
          const y1 = line.y1 || 0;
          const x2 = line.x2 || 0;
          const y2 = line.y2 || 0;
          canvas.remove(line);

          const radius = Math.hypot(x2 - x1, y2 - y1);
          const arc = new fabric.Circle({
            left: x1,
            top: y1,
            radius: Math.max(20, radius),
            startAngle: 0,
            endAngle: Math.PI / 3,
            stroke: settings.strokeColor,
            strokeWidth: settings.strokeWidth,
            fill: 'transparent',
            originX: 'center',
            originY: 'center',
            selectable: false,
          });

          const angleLabel = new fabric.Text('θ = 53°', {
            left: x1 + radius * 0.7,
            top: y1 + radius * 0.7,
            fontSize: 18,
            fontWeight: 'bold',
            fill: settings.strokeColor,
            selectable: false,
          });

          const arcGroup = new fabric.Group([arc, angleLabel], { selectable: true });
          canvas.add(arcGroup);
        } else {
          activeShapeRef.current.set({ selectable: true });
        }

        isDrawingShapeRef.current = false;
        activeShapeRef.current = null;
        canvas.renderAll();
        notifyChange();
      }
    };

    const handleMouseWheel = (opt: fabric.IEvent) => {
      const e = opt.e as WheelEvent;
      e.preventDefault();
      e.stopPropagation();

      const delta = e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      zoom = Math.min(Math.max(0.2, zoom), 4.0);

      canvas.zoomToPoint({ x: e.offsetX, y: e.offsetY }, zoom);
      setZoomLevel(zoom);
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    canvas.on('mouse:wheel', handleMouseWheel);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
      canvas.off('mouse:wheel', handleMouseWheel);
    };
  }, [activeTool, settings, notifyChange]);

  // Execute high quality crop of the selected area and add it as a movable object
  const performSnippetCapture = (
    cv: fabric.Canvas,
    x: number,
    y: number,
    w: number,
    h: number
  ) => {
    // 1. Render entire current canvas with background to a temporary full-size dataURL
    const fullDataUrl = cv.toDataURL({
      format: 'png',
      left: x,
      top: y,
      width: w,
      height: h,
      multiplier: 1.5,
    });

    setLastSnippetData(fullDataUrl);

    // 2. Load the cropped image and place it as a movable object on the canvas
    fabric.Image.fromURL(fullDataUrl, (croppedImg) => {
      // Place it to the right working space (or slightly offset if already on right)
      const targetLeft = x < 850 ? Math.max(900, x + w + 40) : x + 30;
      const targetTop = Math.min(Math.max(40, y), 800);

      croppedImg.set({
        left: targetLeft,
        top: targetTop,
        scaleX: 1 / 1.5,
        scaleY: 1 / 1.5,
        cornerColor: '#6366f1',
        cornerSize: 12,
        transparentCorners: false,
        stroke: '#cbd5e1',
        strokeWidth: 1,
        shadow: new fabric.Shadow({
          color: 'rgba(0, 0, 0, 0.25)',
          blur: 15,
          offsetX: 0,
          offsetY: 4,
        }),
      });

      cv.add(croppedImg);
      cv.setActiveObject(croppedImg);
      cv.renderAll();
      notifyChange();

      // Switch back to Select tool so teacher can drag it right away
      onSelectTool('select');
      setSnipToast('¡Ejercicio recortado! Puedes moverlo o resolverlo en la zona derecha.');
      setTimeout(() => setSnipToast(null), 4000);
    });
  };

  const handleZoom = (factor: number) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    let zoom = canvas.getZoom() * factor;
    zoom = Math.min(Math.max(0.2, zoom), 4.0);
    const center = canvas.getCenter();
    canvas.zoomToPoint(new fabric.Point(center.left, center.top), zoom);
    setZoomLevel(zoom);
  };

  const handleResetZoom = () => {
    const canvas = fabricCanvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const scaleX = (container.clientWidth - 60) / 1920;
    const scaleY = (container.clientHeight - 60) / 1080;
    const scale = Math.min(scaleX, scaleY, 1.2);

    canvas.setViewportTransform([scale, 0, 0, scale, 0, 0]);
    canvas.setZoom(scale);
    setZoomLevel(scale);
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 h-full overflow-hidden flex items-center justify-center select-none ${
        currentPage.gridType === 'dark_grid'
          ? 'bg-slate-950'
          : isDarkMode
          ? 'bg-slate-900'
          : 'bg-slate-100'
      }`}
    >
      {/* Visual background grid pattern for the canvas card */}
      <div
        ref={cardRef}
        className="relative shadow-2xl rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 transition-all"
        style={{
          width: 1920 * zoomLevel,
          height: 1080 * zoomLevel,
          backgroundColor: currentPage.gridType === 'dark_grid' ? '#090d16' : '#ffffff',
          backgroundImage:
            currentPage.gridType === 'grid'
              ? `radial-gradient(circle, #cbd5e1 1px, transparent 1px)`
              : currentPage.gridType === 'dots'
              ? `radial-gradient(circle, #94a3b8 1.5px, transparent 1.5px)`
              : currentPage.gridType === 'lines'
              ? `linear-gradient(#e2e8f0 1px, transparent 1px)`
              : currentPage.gridType === 'dark_grid'
              ? `radial-gradient(circle, #1e293b 1.5px, transparent 1.5px)`
              : 'none',
          backgroundSize:
            currentPage.gridType === 'lines'
              ? '100% 32px'
              : currentPage.gridType === 'dots'
              ? '24px 24px'
              : '30px 30px',
        }}
      >
        <canvas ref={canvasElementRef} />

        {/* Dynamic Stylus Reticle / Hover Cursor Layer for Graphic Tablets & Pens */}
        <StylusCursorLayer
          activeTool={activeTool}
          settings={settings}
          zoomLevel={zoomLevel}
          cardRef={cardRef}
        />

        {/* Laser Pointer Layer (Overlay for live explanations) */}
        <LaserPointerLayer isActive={activeTool === 'laser'} />
      </div>

      {/* Snippet notification banner & Quick action */}
      {snipToast && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-3">
          <div className="p-1 bg-emerald-500 rounded-full text-slate-950">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span>{snipToast}</span>
          {onSendSnippetToNewPage && lastSnippetData && (
            <button
              onClick={() => {
                onSendSnippetToNewPage(lastSnippetData);
                setSnipToast('¡Ejercicio enviado a nueva diapositiva en blanco!');
                setTimeout(() => setSnipToast(null), 3000);
              }}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all"
            >
              <span>Resolver en nueva página</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Floating Zoom & Pan Controls in bottom-right corner */}
      <div className="absolute bottom-6 right-6 z-30 flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl text-xs font-semibold">
        <button
          onClick={() => handleZoom(0.85)}
          title="Alejar zoom"
          className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          title="Ajustar a pantalla"
          className="px-2 py-1 rounded-xl font-mono text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {Math.round(zoomLevel * 100)}%
        </button>
        <button
          onClick={() => handleZoom(1.15)}
          title="Acercar zoom"
          className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetZoom}
          title="Restablecer vista"
          className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
