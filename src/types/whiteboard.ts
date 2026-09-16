export type ToolType =
  | 'select'
  | 'pen'
  | 'highlighter'
  | 'eraser'
  | 'snip'
  | 'line'
  | 'arrow'
  | 'vector'
  | 'rect'
  | 'circle'
  | 'triangle_right'
  | 'angle_arc'
  | 'math'
  | 'text'
  | 'laser'
  | 'pan';

export type EraserMode = 'stroke' | 'object' | 'clear';

export type BackgroundGridType = 'blank' | 'grid' | 'dots' | 'lines' | 'dark_grid';

export interface WhiteboardPage {
  id: string;
  name: string;
  gridType: BackgroundGridType;
  bgDataUrl?: string; // High-res PDF or imported image page background
  bgType: 'none' | 'pdf' | 'image';
  canvasJson?: string;
  thumbnail?: string;
  width: number;
  height: number;
  bgAlignment?: 'left' | 'center' | 'fit';
}

export interface WhiteboardProject {
  id: string;
  title: string;
  pages: WhiteboardPage[];
  activePageIndex: number;
  createdAt: number;
  updatedAt: number;
}

export interface PointerTelemetry {
  pointerType: 'mouse' | 'pen' | 'touch';
  pressure: number;
  tiltX: number;
  tiltY: number;
  hasPressureSupport: boolean;
  isDrawing: boolean;
  lastActiveTime: number;
  sampleCount: number;
}

export interface DrawingSettings {
  strokeColor: string;
  strokeWidth: number;
  highlighterColor: string;
  highlighterWidth: number;
  fillColor: string;
  isFilled: boolean;
  opacity: number;
  enablePressure: boolean;
  smoothing: number;
  eraserWidth: number;
  eraserMode: EraserMode;
  fontSize: number;
  fontFamily: string;
}
