import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Editor } from '@tiptap/react';

interface SmartPaginationEditorProps {
  editor: Editor;
  className?: string;
  onMouseUp?: () => void;
}

export const SmartPaginationEditor: React.FC<SmartPaginationEditorProps> = ({ 
  editor, 
  className,
  onMouseUp 
}) => {
  const [pageCount, setPageCount] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  
  // Page dimensions (at 96 DPI)
  const PAGE_HEIGHT_INCHES = 11.5;
  const MARGIN_INCHES = 1;
  const CONTENT_HEIGHT_INCHES = PAGE_HEIGHT_INCHES - (2 * MARGIN_INCHES); // 9.5 inches
  const PAGE_HEIGHT_PX = PAGE_HEIGHT_INCHES * 96; // 1104px
  const CONTENT_HEIGHT_PX = CONTENT_HEIGHT_INCHES * 96; // 912px
  const PAGE_WIDTH_PX = 8.5 * 96; // 816px
  const CONTENT_WIDTH_PX = 6.5 * 96; // 624px (8.5 - 2 inch margins)

  // Calculate required pages based on content height
  const calculateRequiredPages = useCallback(() => {
    if (!editorContainerRef.current || !editor) return 1;
    
    // Get the actual rendered height of the editor content
    const editorElement = editorContainerRef.current.querySelector('.ProseMirror');
    if (!editorElement) return 1;
    
    const contentHeight = editorElement.scrollHeight;
    const requiredPages = Math.max(1, Math.ceil(contentHeight / CONTENT_HEIGHT_PX));
    
    return requiredPages;
  }, [editor, CONTENT_HEIGHT_PX]);

  // Update page count when content changes
  useEffect(() => {
    if (!editor) return;

    const updatePageCount = () => {
      const required = calculateRequiredPages();
      if (required !== pageCount) {
        setPageCount(required);
      }
    };

    // Listen to editor updates
    editor.on('update', updatePageCount);
    editor.on('selectionUpdate', updatePageCount);
    
    // Initial calculation
    setTimeout(updatePageCount, 100);

    return () => {
      editor.off('update', updatePageCount);
      editor.off('selectionUpdate', updatePageCount);
    };
  }, [editor, pageCount, calculateRequiredPages]);

  // Set up ResizeObserver to monitor content changes
  useEffect(() => {
    if (!editorContainerRef.current) return;

    const editorElement = editorContainerRef.current.querySelector('.ProseMirror');
    if (!editorElement) return;

    resizeObserverRef.current = new ResizeObserver(() => {
      const required = calculateRequiredPages();
      if (required !== pageCount) {
        setPageCount(required);
      }
    });

    resizeObserverRef.current.observe(editorElement);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [calculateRequiredPages, pageCount]);

  // Mount editor on first page
  useEffect(() => {
    if (!editor || !editorContainerRef.current) return;

    const editorContainer = editorContainerRef.current;
    if (!editorContainer.contains(editor.view.dom)) {
      editorContainer.appendChild(editor.view.dom);
    }
  }, [editor]);

  return (
    <div className="w-full">
      {/* Document container */}
      <div 
        ref={containerRef}
        className="document-container"
        style={{ 
          background: '#f5f5f5',
          padding: '20px',
          minHeight: '100vh'
        }}
        onMouseUp={onMouseUp}
      >
        {Array.from({ length: pageCount }, (_, index) => (
          <div 
            key={index}
            className="document-page"
            style={{ 
              width: `${PAGE_WIDTH_PX}px`,
              height: `${PAGE_HEIGHT_PX}px`,
              margin: '0 auto 30px auto',
              padding: `${MARGIN_INCHES * 96}px`,
              background: 'white',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {index === 0 ? (
              // First page contains the actual TipTap editor
              <div 
                ref={editorContainerRef}
                className="page-editor-content"
                style={{
                  width: `${CONTENT_WIDTH_PX}px`,
                  height: `${CONTENT_HEIGHT_PX}px`,
                  overflow: 'visible', // Allow content to flow to next page
                  position: 'relative'
                }}
              >
                {/* TipTap editor will be mounted here */}
              </div>
            ) : (
              // Continuation pages show content overflow
              <div 
                className="page-content"
                style={{
                  width: `${CONTENT_WIDTH_PX}px`,
                  height: `${CONTENT_HEIGHT_PX}px`,
                  overflow: 'hidden',
                  position: 'relative',
                  // Offset content to show the portion for this page
                  marginTop: `${-CONTENT_HEIGHT_PX * index}px`
                }}
              >
                {/* This would ideally contain the overflowed content */}
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  Page {index + 1} content continues here
                </div>
              </div>
            )}
            
            {/* Page number */}
            <div 
              className="absolute text-xs text-gray-500"
              style={{
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)'
              }}
            >
              Page {index + 1} of {pageCount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};