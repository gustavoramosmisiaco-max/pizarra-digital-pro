import * as pdfjsLib from 'pdfjs-dist';

function initPdfWorker() {
  if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }
}

export interface PdfPageRenderResult {
  pageIndex: number;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Loads a PDF file and renders all pages as high-resolution images for whiteboard slides.
 * Scale is set to 2.0 to ensure crisp text and sharp lines on high-DPI displays.
 */
export async function loadPdfPages(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<PdfPageRenderResult[]> {
  initPdfWorker();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const results: PdfPageRenderResult[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    // Render at 2x scale for sharp HD presentation
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!context) continue;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Fill with clean white background before rendering PDF
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    const dataUrl = canvas.toDataURL('image/png', 0.95);

    results.push({
      pageIndex: pageNum - 1,
      dataUrl,
      width: viewport.width,
      height: viewport.height,
    });

    if (onProgress) {
      onProgress(pageNum, numPages);
    }
  }

  return results;
}
