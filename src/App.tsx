import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fabric } from 'fabric';
import {
  ToolType,
  DrawingSettings,
  WhiteboardProject,
  WhiteboardPage,
  BackgroundGridType,
} from './types/whiteboard';
import {
  createDefaultProject,
  createDefaultPage,
  saveProjectToStorage,
  loadProjectFromStorage,
  downloadProjectFile,
  parseProjectFile,
} from './services/storageService';
import { loadPdfPages } from './services/pdfService';
import {
  exportCurrentPageAsPng,
  exportPagesAsPdf,
} from './services/exportService';
import { usePointerDetector } from './hooks/usePointerDetector';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { TopHeader } from './components/TopHeader';
import { Toolbar } from './components/Toolbar';
import { PagesSidebar } from './components/PagesSidebar';
import { WhiteboardCanvas } from './components/WhiteboardCanvas';
import { UsbConnectionModal } from './components/UsbConnectionModal';
import { ExportModal } from './components/ExportModal';
import { MathFormulaModal } from './components/MathFormulaModal';
import { ScienceStencilsModal } from './components/ScienceStencilsModal';
import { FloatingNavControls } from './components/FloatingNavControls';
import { renderLatexToImage } from './services/mathRenderer';

export const App: React.FC = () => {
  // 1. Core State
  const [project, setProject] = useState<WhiteboardProject>(createDefaultProject());
  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [settings, setSettings] = useState<DrawingSettings>({
    strokeColor: '#0f172a',
    strokeWidth: 4,
    highlighterColor: '#facc15',
    highlighterWidth: 16,
    fillColor: 'transparent',
    isFilled: false,
    opacity: 1,
    enablePressure: true,
    smoothing: 0.5,
    eraserWidth: 20,
    eraserMode: 'stroke',
    fontSize: 24,
    fontFamily: 'Inter',
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUsbModalOpen, setIsUsbModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const [isStencilsModalOpen, setIsStencilsModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});

  // Undo / Redo stacks for current page
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const activeFabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const telemetry = usePointerDetector();

  // Dark mode effect on root element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load project from IndexedDB on startup
  useEffect(() => {
    async function initStorage() {
      const saved = await loadProjectFromStorage();
      if (saved && saved.pages && saved.pages.length > 0) {
        setProject(saved);
      }
    }
    initStorage();
  }, []);

  // Debounced auto-save to IndexedDB whenever project changes
  useEffect(() => {
    const timer = setTimeout(() => {
      saveProjectToStorage(project);
    }, 800);
    return () => clearTimeout(timer);
  }, [project]);

  // Active page shortcut
  const activePage = (project?.pages && project.pages[project.activePageIndex]) || (project?.pages && project.pages[0]) || createDefaultPage('page_1', 'Diapositiva 1');

  // Callback to update canvas content of current page
  const handleCanvasChange = useCallback((json: string, thumbnail: string) => {
    setProject((prev) => {
      const updatedPages = [...prev.pages];
      if (updatedPages[prev.activePageIndex]) {
        updatedPages[prev.activePageIndex] = {
          ...updatedPages[prev.activePageIndex],
          canvasJson: json,
          thumbnail,
        };
      }
      return {
        ...prev,
        pages: updatedPages,
      };
    });

    setThumbnails((prev) => ({
      ...prev,
      [project.activePageIndex]: thumbnail,
    }));
  }, [project.activePageIndex]);

  // Push state to undo stack
  const handleUndoStatePush = useCallback((json: string) => {
    setUndoStack((prev) => [...prev.slice(-30), json]);
    setRedoStack([]);
  }, []);

  // Undo execution
  const handleUndo = useCallback(() => {
    const canvas = activeFabricCanvasRef.current;
    if (!canvas || undoStack.length <= 1) return;

    const currentJson = undoStack[undoStack.length - 1];
    const targetJson = undoStack[undoStack.length - 2];

    setRedoStack((prev) => [...prev, currentJson]);
    setUndoStack((prev) => prev.slice(0, -1));

    canvas.loadFromJSON(targetJson, () => {
      canvas.renderAll();
      const thumb = canvas.toDataURL({ format: 'png', multiplier: 0.25 });
      handleCanvasChange(targetJson, thumb);
    });
  }, [undoStack, handleCanvasChange]);

  // Redo execution
  const handleRedo = useCallback(() => {
    const canvas = activeFabricCanvasRef.current;
    if (!canvas || redoStack.length === 0) return;

    const targetJson = redoStack[redoStack.length - 1];

    setUndoStack((prev) => [...prev, targetJson]);
    setRedoStack((prev) => prev.slice(0, -1));

    canvas.loadFromJSON(targetJson, () => {
      canvas.renderAll();
      const thumb = canvas.toDataURL({ format: 'png', multiplier: 0.25 });
      handleCanvasChange(targetJson, thumb);
    });
  }, [redoStack, handleCanvasChange]);

  // Delete currently selected object
  const handleDeleteSelected = useCallback(() => {
    const canvas = activeFabricCanvasRef.current;
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach((obj) => canvas.remove(obj));
      canvas.discardActiveObject();
      canvas.renderAll();
      const json = JSON.stringify(canvas.toJSON());
      const thumb = canvas.toDataURL({ format: 'png', multiplier: 0.25 });
      handleCanvasChange(json, thumb);
      handleUndoStatePush(json);
    }
  }, [handleCanvasChange, handleUndoStatePush]);

  // Page switching & management
  const handleSelectPage = (index: number) => {
    if (index >= 0 && index < project.pages.length) {
      setUndoStack([]);
      setRedoStack([]);
      setProject((prev) => ({ ...prev, activePageIndex: index }));
    }
  };

  const handlePrevPage = () => {
    if (project.activePageIndex > 0) {
      handleSelectPage(project.activePageIndex - 1);
    }
  };

  const handleNextPage = () => {
    if (project.activePageIndex < project.pages.length - 1) {
      handleSelectPage(project.activePageIndex + 1);
    }
  };

  const handleAddPage = (gridType: BackgroundGridType = 'grid') => {
    const newPage = createDefaultPage(
      `page_${Date.now()}`,
      `Diapositiva ${project.pages.length + 1}`
    );
    newPage.gridType = gridType;

    setProject((prev) => ({
      ...prev,
      pages: [...prev.pages, newPage],
      activePageIndex: prev.pages.length,
    }));
    setUndoStack([]);
    setRedoStack([]);
  };

  const handleDuplicatePage = (index: number) => {
    const sourcePage = project.pages[index];
    if (!sourcePage) return;

    const duplicated: WhiteboardPage = {
      ...sourcePage,
      id: `page_${Date.now()}`,
      name: `${sourcePage.name} (Copia)`,
    };

    setProject((prev) => {
      const pages = [...prev.pages];
      pages.splice(index + 1, 0, duplicated);
      return {
        ...prev,
        pages,
        activePageIndex: index + 1,
      };
    });
  };

  const handleDeletePage = (index: number) => {
    if (project.pages.length <= 1) return;
    setProject((prev) => {
      const pages = prev.pages.filter((_, i) => i !== index);
      const newIndex = Math.min(prev.activePageIndex, pages.length - 1);
      return {
        ...prev,
        pages,
        activePageIndex: newIndex,
      };
    });
  };

  const handleChangeGridType = (index: number, gridType: BackgroundGridType) => {
    setProject((prev) => {
      const pages = [...prev.pages];
      if (pages[index]) {
        pages[index] = { ...pages[index], gridType };
      }
      return { ...prev, pages };
    });
  };

  // Handler: Send snippet to a new blank slide for full-screen resolution
  const handleSendSnippetToNewPage = (dataUrl: string) => {
    const newPage = createDefaultPage(
      `page_${Date.now()}`,
      `Ejercicio ${project.pages.length + 1}`
    );
    newPage.gridType = 'grid';

    // Build initial canvas JSON with the snippet placed at top-left
    fabric.Image.fromURL(dataUrl, (img) => {
      const tempCv = new fabric.StaticCanvas(null, { width: 1920, height: 1080 });
      img.set({
        left: 50,
        top: 50,
        scaleX: 1 / 1.5,
        scaleY: 1 / 1.5,
        cornerColor: '#6366f1',
        stroke: '#cbd5e1',
        strokeWidth: 1,
        shadow: new fabric.Shadow({
          color: 'rgba(0, 0, 0, 0.25)',
          blur: 15,
          offsetX: 0,
          offsetY: 4,
        }),
      });
      tempCv.add(img);
      const json = JSON.stringify(tempCv.toJSON());
      newPage.canvasJson = json;

      setProject((prev) => {
        const pages = [...prev.pages, newPage];
        return {
          ...prev,
          pages,
          activePageIndex: pages.length - 1,
        };
      });
      setUndoStack([]);
      setRedoStack([]);
      setActiveTool('pen');
    });
  };

  // Import PDF handler
  const handleUploadPdf = async (file: File) => {
    try {
      const renderedPages = await loadPdfPages(file);
      if (renderedPages.length === 0) return;

      const newPages: WhiteboardPage[] = renderedPages.map((p, idx) => ({
        id: `pdf_page_${Date.now()}_${idx}`,
        name: `${file.name.replace('.pdf', '')} - Pág ${idx + 1}`,
        gridType: 'blank',
        bgType: 'pdf',
        bgDataUrl: p.dataUrl,
        thumbnail: p.dataUrl,
        width: 1920,
        height: 1080,
      }));

      setProject((prev) => ({
        ...prev,
        title: file.name.replace('.pdf', ''),
        pages: newPages,
        activePageIndex: 0,
      }));
      setUndoStack([]);
      setRedoStack([]);
    } catch (err) {
      console.error('Error importing PDF:', err);
      alert('Error al procesar el archivo PDF. Asegúrate de que sea un PDF válido.');
    }
  };

  // Import Image handler
  const handleUploadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      const canvas = activeFabricCanvasRef.current;
      if (canvas) {
        fabric.Image.fromURL(
          dataUrl,
          (img) => {
            const maxDimension = 600;
            const scale = Math.min(
              maxDimension / (img.width || maxDimension),
              maxDimension / (img.height || maxDimension),
              1
            );
            img.set({
              left: 200,
              top: 150,
              scaleX: scale,
              scaleY: scale,
              cornerColor: '#6366f1',
              cornerSize: 10,
              transparentCorners: false,
            });
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
            const json = JSON.stringify(canvas.toJSON());
            const thumb = canvas.toDataURL({ format: 'png', multiplier: 0.25 });
            handleCanvasChange(json, thumb);
            handleUndoStatePush(json);
          },
          { crossOrigin: 'anonymous' }
        );
      }
    };
    reader.readAsDataURL(file);
  };

  // Save / Load Project File (.pizarra)
  const handleSaveProjectFile = () => {
    downloadProjectFile(project);
  };

  const handleOpenProjectFile = async (file: File) => {
    try {
      const loaded = await parseProjectFile(file);
      setProject(loaded);
      setUndoStack([]);
      setRedoStack([]);
    } catch (err: any) {
      alert(err.message || 'Error al abrir el archivo de proyecto.');
    }
  };

  // Clear current page canvas
  const handleClearCanvas = () => {
    const canvas = activeFabricCanvasRef.current;
    if (!canvas) return;
    canvas.clear();
    canvas.renderAll();
    const json = JSON.stringify(canvas.toJSON());
    const thumb = canvas.toDataURL({ format: 'png', multiplier: 0.25 });
    handleCanvasChange(json, thumb);
    handleUndoStatePush(json);
  };

  // Insert LaTeX Math & Science Formula onto Canvas
  const handleInsertFormula = useCallback(async (latex: string, color: string, fontSize: number) => {
    const canvas = activeFabricCanvasRef.current;
    if (!canvas) return;

    try {
      const { dataUrl } = await renderLatexToImage(latex, color, fontSize);
      fabric.Image.fromURL(dataUrl, (img) => {
        const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
        const zoom = canvas.getZoom();
        const centerLeft = (canvas.getWidth() / 2 - vpt[4]) / zoom;
        const centerTop = (canvas.getHeight() / 2 - vpt[5]) / zoom;

        img.set({
          left: centerLeft,
          top: centerTop,
          originX: 'center',
          originY: 'center',
          cornerColor: '#0284c7',
          cornerSize: 8,
          transparentCorners: false,
          borderColor: '#0284c7',
        });

        canvas.add(img);
        const json = JSON.stringify(canvas.toJSON());
        const thumb = canvas.toDataURL({ format: 'jpeg', quality: 0.3, multiplier: 0.15 });
        handleCanvasChange(json, thumb);
        handleUndoStatePush(json);
      });
    } catch (err) {
      console.error('Error al insertar fórmula matemática:', err);
    }
  }, [handleCanvasChange, handleUndoStatePush]);

  // Insert Vector Science Apparatus & Diagram Stencil onto Canvas
  const handleInsertSvg = useCallback((svgString: string, _defaultW: number, _defaultH: number) => {
    const canvas = activeFabricCanvasRef.current;
    if (!canvas) return;

    fabric.loadSVGFromString(svgString, (objects, options) => {
      const svgGroup = fabric.util.groupSVGElements(objects, options);
      const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
      const zoom = canvas.getZoom();
      const centerLeft = (canvas.getWidth() / 2 - vpt[4]) / zoom;
      const centerTop = (canvas.getHeight() / 2 - vpt[5]) / zoom;

      svgGroup.set({
        left: centerLeft,
        top: centerTop,
        originX: 'center',
        originY: 'center',
        cornerColor: '#10b981',
        cornerSize: 8,
        transparentCorners: false,
        borderColor: '#10b981',
      });

      canvas.add(svgGroup);
      canvas.setActiveObject(svgGroup);
      canvas.renderAll();

      const json = JSON.stringify(canvas.toJSON());
      const thumb = canvas.toDataURL({ format: 'jpeg', quality: 0.3, multiplier: 0.15 });
      handleCanvasChange(json, thumb);
      handleUndoStatePush(json);
    });
  }, [handleCanvasChange, handleUndoStatePush]);

  // Zoom control handlers
  const handleZoomIn = () => {
    const canvas = activeFabricCanvasRef.current;
    if (!canvas) return;
    const newZoom = Math.min(4.0, canvas.getZoom() * 1.2);
    const center = canvas.getCenter();
    canvas.zoomToPoint(new fabric.Point(center.left, center.top), newZoom);
    setZoomLevel(newZoom);
  };

  const handleZoomOut = () => {
    const canvas = activeFabricCanvasRef.current;
    if (!canvas) return;
    const newZoom = Math.max(0.2, canvas.getZoom() * 0.8);
    const center = canvas.getCenter();
    canvas.zoomToPoint(new fabric.Point(center.left, center.top), newZoom);
    setZoomLevel(newZoom);
  };

  const handleResetZoom = () => {
    const canvas = activeFabricCanvasRef.current;
    if (!canvas) return;
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.setZoom(1);
    setZoomLevel(1);
  };

  // Keyboard Shortcuts Hook
  useKeyboardShortcuts({
    onSelectTool: setActiveTool,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onDeleteSelected: handleDeleteSelected,
    onPrevPage: handlePrevPage,
    onNextPage: handleNextPage,
  });

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      
      {/* Top Header */}
      <TopHeader
        project={project}
        telemetry={telemetry}
        isDarkMode={isDarkMode}
        canUndo={undoStack.length > 1}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenUsbModal={() => setIsUsbModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onUploadPdf={handleUploadPdf}
        onUploadImage={handleUploadImage}
        onSaveProjectFile={handleSaveProjectFile}
        onOpenProjectFile={handleOpenProjectFile}
        onClearCanvas={handleClearCanvas}
        onTitleChange={(title) => setProject((prev) => ({ ...prev, title }))}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        onAddPage={() => handleAddPage('grid')}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Workspace Area (Sidebar + Canvas) */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Slide Thumbnail Sidebar */}
        <PagesSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          pages={project.pages}
          activePageIndex={project.activePageIndex}
          onSelectPage={handleSelectPage}
          onAddPage={handleAddPage}
          onDuplicatePage={handleDuplicatePage}
          onDeletePage={handleDeletePage}
          onChangeGridType={handleChangeGridType}
          thumbnails={thumbnails}
        />

        {/* The Whiteboard Canvas Layer */}
        <WhiteboardCanvas
          currentPage={activePage}
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          settings={settings}
          telemetry={telemetry}
          onCanvasChange={handleCanvasChange}
          onUndoStatePush={handleUndoStatePush}
          canvasRefCallback={(cv) => {
            activeFabricCanvasRef.current = cv;
          }}
          isDarkMode={isDarkMode}
          onSendSnippetToNewPage={handleSendSnippetToNewPage}
        />

        {/* Floating Drawing Toolbar */}
        <Toolbar
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          settings={settings}
          onUpdateSettings={(newSt) => setSettings((prev) => ({ ...prev, ...newSt }))}
          hasPressureDevice={telemetry.hasPressureSupport}
          onOpenMathModal={() => setIsMathModalOpen(true)}
        />
      </main>

      {/* USB-C Connection Guide & Real-Time Hardware Telemetry Modal */}
      <UsbConnectionModal
        isOpen={isUsbModalOpen}
        onClose={() => setIsUsbModalOpen(false)}
        telemetry={telemetry}
      />

      {/* Math & Science Formula Editor Modal */}
      <MathFormulaModal
        isOpen={isMathModalOpen}
        onClose={() => setIsMathModalOpen(false)}
        onInsertFormula={handleInsertFormula}
      />

      {/* Science Apparatus & Stencils Modal */}
      <ScienceStencilsModal
        isOpen={isStencilsModalOpen}
        onClose={() => setIsStencilsModalOpen(false)}
        onInsertSvg={handleInsertSvg}
      />

      {/* Floating Quick Navigation & Zoom Controls (for Tablet Pen users) */}
      <FloatingNavControls
        zoomLevel={zoomLevel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        canUndo={undoStack.length > 1}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenStencilsModal={() => setIsStencilsModalOpen(true)}
        onClearCanvas={handleClearCanvas}
      />

      {/* Export Options Modal (PDF, PNG, .pizarra) */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        pages={project.pages}
        activePageIndex={project.activePageIndex}
        projectTitle={project.title}
        onExportPng={async (name) => {
          await exportCurrentPageAsPng(activePage, activeFabricCanvasRef.current, name);
        }}
        onExportPdf={async (name, progCb) => {
          await exportPagesAsPdf(
            project.pages,
            project.activePageIndex,
            activeFabricCanvasRef.current,
            name,
            progCb
          );
        }}
        onExportProjectJson={handleSaveProjectFile}
      />

    </div>
  );
};

export default App;
