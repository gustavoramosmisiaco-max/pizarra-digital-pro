import { jsPDF } from 'jspdf';
import { fabric } from 'fabric';
import { WhiteboardPage } from '../types/whiteboard';

/**
 * Downloads a dataURL as an image file.
 */
function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Renders a full page (background + fabric objects) into an offscreen canvas and returns its dataURL.
 */
export async function renderPageToDataUrl(
  page: WhiteboardPage,
  activeCanvas?: fabric.Canvas | null,
  isCurrentPage: boolean = false,
  width: number = 1920,
  height: number = 1080
): Promise<string> {
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = width;
  offscreenCanvas.height = height;
  const ctx = offscreenCanvas.getContext('2d');
  if (!ctx) return '';

  // 1. Draw page base background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // If grid is active and no custom bg
  if (page.gridType === 'grid' && !page.bgDataUrl) {
    drawGridPattern(ctx, width, height, '#e2e8f0', 30);
  } else if (page.gridType === 'dots' && !page.bgDataUrl) {
    drawDotsPattern(ctx, width, height, '#cbd5e1', 25);
  } else if (page.gridType === 'lines' && !page.bgDataUrl) {
    drawLinesPattern(ctx, width, height, '#e2e8f0', 32);
  } else if (page.gridType === 'dark_grid') {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);
    drawGridPattern(ctx, width, height, '#1e293b', 30);
  }

  // 2. Draw background image / PDF page if present
  if (page.bgDataUrl) {
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = page.bgDataUrl!;
    });
  }

  // 3. Draw annotations
  if (isCurrentPage && activeCanvas) {
    // Render current active live canvas onto offscreen
    const canvasData = activeCanvas.toDataURL({
      format: 'png',
      multiplier: width / (activeCanvas.getWidth() || width),
      enableRetinaScaling: true,
    });
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = canvasData;
    });
  } else if (page.canvasJson) {
    // Render stored JSON
    const tempFabricCanvas = new fabric.StaticCanvas(null, { width, height });
    await new Promise<void>((resolve) => {
      tempFabricCanvas.loadFromJSON(page.canvasJson, () => {
        tempFabricCanvas.renderAll();
        const data = tempFabricCanvas.toDataURL({ format: 'png', multiplier: 1 });
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
          tempFabricCanvas.dispose();
          resolve();
        };
        img.onerror = () => {
          tempFabricCanvas.dispose();
          resolve();
        };
        img.src = data;
      });
    });
  }

  return offscreenCanvas.toDataURL('image/png', 0.95);
}

function drawGridPattern(ctx: CanvasRenderingContext2D, w: number, h: number, color: string, step: number) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= w; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = 0; y <= h; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawDotsPattern(ctx: CanvasRenderingContext2D, w: number, h: number, color: string, step: number) {
  ctx.save();
  ctx.fillStyle = color;
  for (let x = step / 2; x < w; x += step) {
    for (let y = step / 2; y < h; y += step) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawLinesPattern(ctx: CanvasRenderingContext2D, w: number, h: number, color: string, step: number) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let y = step; y < h; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * Exports single current page as PNG
 */
export async function exportCurrentPageAsPng(
  page: WhiteboardPage,
  activeCanvas: fabric.Canvas | null,
  filename: string = 'pizarra_diapositiva'
): Promise<void> {
  const dataUrl = await renderPageToDataUrl(page, activeCanvas, true);
  if (dataUrl) {
    downloadDataUrl(dataUrl, `${filename}.png`);
  }
}

/**
 * Exports all pages or selected pages to a complete PDF document
 */
export async function exportPagesAsPdf(
  pages: WhiteboardPage[],
  activePageIndex: number,
  activeCanvas: fabric.Canvas | null,
  filename: string = 'pizarra_documento_completo',
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  if (pages.length === 0) return;

  // Standard 16:9 widescreen landscape PDF or custom matching page aspect
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [1920, 1080],
    hotfixes: ['px_scaling'],
  });

  for (let i = 0; i < pages.length; i++) {
    if (onProgress) {
      onProgress(i + 1, pages.length);
    }
    const page = pages[i];
    const isCurrent = i === activePageIndex;
    const imgDataUrl = await renderPageToDataUrl(page, activeCanvas, isCurrent, 1920, 1080);

    if (i > 0) {
      pdf.addPage([1920, 1080], 'landscape');
    }

    if (imgDataUrl) {
      pdf.addImage(imgDataUrl, 'PNG', 0, 0, 1920, 1080, undefined, 'FAST');
    }
  }

  pdf.save(`${filename}.pdf`);
}
