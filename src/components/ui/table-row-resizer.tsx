import React, { useEffect } from 'react';
import { Editor } from '@tiptap/react';

interface TableRowResizerProps {
  editor: Editor;
}

export const TableRowResizer: React.FC<TableRowResizerProps> = ({ editor }) => {
  useEffect(() => {
    if (!editor) return;

    let isResizing = false;
    let currentRow: HTMLTableRowElement | null = null;
    let startY = 0;
    let startHeight = 0;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if we're clicking on a row resize area
      if (target.matches('.ProseMirror table td::after') || 
          (target.closest('td') && e.offsetY > (target.closest('td')?.offsetHeight || 0) - 4)) {
        
        e.preventDefault();
        isResizing = true;
        
        const cell = target.closest('td') as HTMLTableCellElement;
        currentRow = cell?.closest('tr') as HTMLTableRowElement;
        
        if (currentRow) {
          startY = e.clientY;
          startHeight = currentRow.offsetHeight;
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
          
          // Add visual feedback
          document.body.style.cursor = 'ns-resize';
          currentRow.style.backgroundColor = 'hsl(var(--muted) / 0.5)';
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !currentRow) return;
      
      e.preventDefault();
      const deltaY = e.clientY - startY;
      const newHeight = Math.max(40, startHeight + deltaY); // Min height of 40px
      
      // Apply height to all cells in the row
      const cells = currentRow.querySelectorAll('td, th');
      cells.forEach(cell => {
        (cell as HTMLElement).style.height = `${newHeight}px`;
      });
    };

    const handleMouseUp = () => {
      if (!isResizing) return;
      
      isResizing = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      
      if (currentRow) {
        currentRow.style.backgroundColor = '';
        
        // Save the new height to the row data attribute
        const newHeight = currentRow.offsetHeight;
        currentRow.setAttribute('data-row-height', newHeight.toString());
      }
      
      currentRow = null;
    };

    // Add event listener to the editor's DOM
    const editorElement = editor.view.dom;
    editorElement.addEventListener('mousedown', handleMouseDown);

    // Cleanup
    return () => {
      editorElement.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [editor]);

  return null; // This component doesn't render anything
};