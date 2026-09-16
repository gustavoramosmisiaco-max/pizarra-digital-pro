import { get, set, del } from 'idb-keyval';
import { WhiteboardProject, WhiteboardPage } from '../types/whiteboard';

const STORAGE_KEY = 'pizarra_interactive_project_v1';

export function createDefaultPage(id: string = 'page_1', name: string = 'Página 1'): WhiteboardPage {
  return {
    id,
    name,
    gridType: 'grid',
    bgType: 'none',
    width: 1920,
    height: 1080,
  };
}

export function createDefaultProject(): WhiteboardProject {
  return {
    id: `proj_${Date.now()}`,
    title: 'Clase / Explicación Sin Título',
    pages: [createDefaultPage('page_1', 'Diapositiva 1')],
    activePageIndex: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Saves the active project to IndexedDB automatically.
 */
export async function saveProjectToStorage(project: WhiteboardProject): Promise<void> {
  try {
    const updated = {
      ...project,
      updatedAt: Date.now(),
    };
    await set(STORAGE_KEY, updated);
  } catch (error) {
    console.error('Error saving project to IndexedDB:', error);
  }
}

/**
 * Loads the saved project from IndexedDB.
 */
export async function loadProjectFromStorage(): Promise<WhiteboardProject | null> {
  try {
    const saved = await get<WhiteboardProject>(STORAGE_KEY);
    return saved || null;
  } catch (error) {
    console.error('Error loading project from IndexedDB:', error);
    return null;
  }
}

/**
 * Clears the storage.
 */
export async function clearProjectStorage(): Promise<void> {
  try {
    await del(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing project storage:', error);
  }
}

/**
 * Exports the whole project to a downloadable .pizarra (JSON) file.
 */
export function downloadProjectFile(project: WhiteboardProject): void {
  const jsonString = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeTitle = (project.title || 'pizarra_proyecto').replace(/[^a-z0-9_\-]/gi, '_');
  a.href = url;
  a.download = `${safeTitle}.pizarra`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports a .pizarra file and parses it back into a WhiteboardProject object.
 */
export async function parseProjectFile(file: File): Promise<WhiteboardProject> {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (!parsed.pages || !Array.isArray(parsed.pages)) {
    throw new Error('El archivo no tiene el formato válido de Pizarra Digital (.pizarra)');
  }
  return parsed as WhiteboardProject;
}
