import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Editor } from '@tiptap/react';

interface PaginatedEditorProps {
  editor: Editor;
  className?: string;
  onMouseUp?: () => void;
}

interface PageData {
  id: string;
  content: string;
  height: number;
}

export const PaginatedEditor: React.FC<PaginatedEditorProps> = ({ 
  editor, 
  className,
  onMouseUp 
}) => {
  const [pages, setPages] = useState<PageData[]>([{ id: '1', content: '', height: 0 }]);
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const editorMountedRef = useRef<boolean>(false);
  
  // Page dimensions (at 96 DPI)
  const PAGE_HEIGHT_INCHES = 11.5;
  const MARGIN_INCHES = 1;
  const CONTENT_HEIGHT_INCHES = PAGE_HEIGHT_INCHES - (2 * MARGIN_INCHES); // 9.5 inches
  const PAGE_HEIGHT_PX = PAGE_HEIGHT_INCHES * 96;
  const CONTENT_HEIGHT_PX = CONTENT_HEIGHT_INCHES * 96; // 912px
  const PAGE_WIDTH_PX = 8.5 * 96; // 816px

  // Measure content height
  const measureContentHeight = useCallback((htmlContent: string): number => {
    if (!measureRef.current) return 0;
    
    measureRef.current.innerHTML = htmlContent;
    return measureRef.current.scrollHeight;
  }, []);

  // Split content into pages
  const splitContentIntoPages = useCallback((content: string): PageData[] => {
    if (!content.trim()) {
      return [{ id: '1', content: '', height: 0 }];
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const elements = Array.from(doc.body.children);
    
    const pages: PageData[] = [];
    let currentPageContent = '';
    let currentPageHeight = 0;
    let pageNumber = 1;

    for (const element of elements) {
      const elementHtml = element.outerHTML;
      const testContent = currentPageContent + elementHtml;
      const testHeight = measureContentHeight(testContent);

      if (testHeight > CONTENT_HEIGHT_PX && currentPageContent) {
        // Current element would overflow, save current page and start new one
        pages.push({
          id: pageNumber.toString(),
          content: currentPageContent,
          height: currentPageHeight
        });
        
        pageNumber++;
        currentPageContent = elementHtml;
        currentPageHeight = measureContentHeight(elementHtml);
      } else {
        // Element fits on current page
        currentPageContent = testContent;
        currentPageHeight = testHeight;
      }
    }

    // Add the last page
    if (currentPageContent || pages.length === 0) {
      pages.push({
        id: pageNumber.toString(),
        content: currentPageContent,
        height: currentPageHeight
      });
    }

    return pages;
  }, [measureContentHeight, CONTENT_HEIGHT_PX]);

  // Handle editor updates
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const content = editor.getHTML();
      const newPages = splitContentIntoPages(content);
      setPages(newPages);
    };

    // Initial setup
    handleUpdate();
    
    editor.on('update', handleUpdate);
    
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, splitContentIntoPages]);

  // Mount editor on first page
  useEffect(() => {
    if (!editor || !containerRef.current || editorMountedRef.current) return;

    const firstPageEditor = containerRef.current.querySelector('.page-editor-content');
    if (firstPageEditor && !firstPageEditor.contains(editor.view.dom)) {
      firstPageEditor.appendChild(editor.view.dom);
      editorMountedRef.current = true;
    }
  }, [editor, pages]);

  return (
    <div className="w-full">
      {/* Hidden measuring container */}
      <div
        ref={measureRef}
        style={{
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          width: `${PAGE_WIDTH_PX - (2 * 96)}px`, // 6.5 inches (8.5 - 2 inch margins)
          fontFamily: 'Times New Roman, serif',
          fontSize: '12px',
          lineHeight: '1.6',
          visibility: 'hidden',
          pointerEvents: 'none'
        }}
      />

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
        {pages.map((page, index) => (
          <div 
            key={page.id}
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
                className="page-editor-content h-full"
                style={{
                  height: `${CONTENT_HEIGHT_PX}px`,
                  overflow: 'hidden'
                }}
              >
                {/* Editor will be mounted here */}
              </div>
            ) : (
              // Subsequent pages show read-only content
              <div 
                className="page-content h-full"
                style={{
                  height: `${CONTENT_HEIGHT_PX}px`,
                  overflow: 'hidden',
                  fontFamily: 'Times New Roman, serif',
                  fontSize: '12px',
                  lineHeight: '1.6'
                }}
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
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
              Page {index + 1} of {pages.length}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};