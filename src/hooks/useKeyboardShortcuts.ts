import { useEffect } from 'react';
import { ToolType } from '../types/whiteboard';

interface UseKeyboardShortcutsProps {
  onSelectTool: (tool: ToolType) => void;
  onUndo: () => void;
  onRedo: () => void;
  onDeleteSelected: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function useKeyboardShortcuts({
  onSelectTool,
  onUndo,
  onRedo,
  onDeleteSelected,
  onPrevPage,
  onNextPage,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input, textarea, or fabric text editor
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        (target.classList && target.classList.contains('canvas-container'))
      ) {
        // If it's a Fabric active text editing, let fabric handle it
        if ((document.activeElement as any)?.className?.includes('upper-canvas')) {
          // Allow Ctrl+Z inside text
        } else {
          return;
        }
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Undo: Ctrl + Z
      if (isCtrlOrCmd && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo();
        return;
      }

      // Redo: Ctrl + Y or Ctrl + Shift + Z
      if ((isCtrlOrCmd && e.key.toLowerCase() === 'y') || (isCtrlOrCmd && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        onRedo();
        return;
      }

      // Delete selected object
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          onDeleteSelected();
        }
        return;
      }

      // Tool shortcuts (without modifier keys)
      if (!isCtrlOrCmd && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'v':
            onSelectTool('select');
            break;
          case 'p':
            onSelectTool('pen');
            break;
          case 'h':
            onSelectTool('highlighter');
            break;
          case 'e':
            onSelectTool('eraser');
            break;
          case 't':
            onSelectTool('text');
            break;
          case 'l':
            onSelectTool('laser');
            break;
          case 'escape':
            onSelectTool('select');
            break;
          case 'arrowleft':
            if (e.altKey) onPrevPage();
            break;
          case 'arrowright':
            if (e.altKey) onNextPage();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectTool, onUndo, onRedo, onDeleteSelected, onPrevPage, onNextPage]);
}
