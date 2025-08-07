import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Editor } from '@tiptap/react';

interface SmartPaginationEditorProps {
  editor: Editor;
  className?: string;
  onMouseUp?: () => void;
}

interface PageData {
  id: string;
  content: string;
  height: number;
  editorInstance?: Editor;
}

export const SmartPaginationEditor: React.FC<SmartPaginationEditorProps> = ({ 
  editor, 
  className,
  onMouseUp 
}) => {
  const [pages, setPages] = useState<PageData[]>([{ id: '1', content: '', height: 0 }]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const editorMountedRef = useRef<boolean>(false);
  const heightObserverRef = useRef<ResizeObserver | null>(null);
  const contentUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Page dimensions (at 96 DPI)
  const PAGE_HEIGHT_INCHES = 11.5;
  const MARGIN_INCHES = 1;
  const CONTENT_HEIGHT_INCHES = PAGE_HEIGHT_INCHES - (2 * MARGIN_INCHES); // 9.5 inches
  const PAGE_HEIGHT_PX = PAGE_HEIGHT_INCHES * 96; // 1104px
  const CONTENT_HEIGHT_PX = CONTENT_HEIGHT_INCHES * 96; // 912px
  const PAGE_WIDTH_PX = 8.5 * 96; // 816px
  const CONTENT_WIDTH_PX = 6.5 * 96; // 624px (8.5 - 2 inch margins)

  // Measure content height
  const measureContentHeight = useCallback((htmlContent: string): number => {
    if (!measureRef.current) return 0;
    
    measureRef.current.innerHTML = htmlContent;
    return measureRef.current.scrollHeight;
  }, []);

  // Check if current editor content exceeds page height
  const checkContentOverflow = useCallback(() => {
    if (!editorContainerRef.current || !editor) return false;
    
    const editorElement = editorContainerRef.current.querySelector('.ProseMirror');
    if (!editorElement) return false;
    
    const contentHeight = editorElement.scrollHeight;
    return contentHeight > CONTENT_HEIGHT_PX;
  }, [editor, CONTENT_HEIGHT_PX]);

  // Split content at optimal breakpoints
  const findOptimalSplitPoint = useCallback((content: string, maxHeight: number): number => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const elements = Array.from(doc.body.children);
    
    let accumulatedContent = '';
    let lastSafeIndex = 0;
    
    for (let i = 0; i < elements.length; i++) {
      const testContent = accumulatedContent + elements[i].outerHTML;
      const testHeight = measureContentHeight(testContent);
      
      if (testHeight > maxHeight) {
        return lastSafeIndex;
      }
      
      accumulatedContent = testContent;
      lastSafeIndex = i + 1;
    }
    
    return elements.length;
  }, [measureContentHeight]);

  // Split content into pages with proper overflow handling
  const splitContentIntoPages = useCallback((content: string): PageData[] => {
    if (!content.trim()) {
      return [{ id: '1', content: '', height: 0 }];
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const elements = Array.from(doc.body.children);
    
    const pages: PageData[] = [];
    let pageNumber = 1;
    let remainingElements = [...elements];

    while (remainingElements.length > 0) {
      const splitIndex = findOptimalSplitPoint(
        remainingElements.map(el => el.outerHTML).join(''), 
        CONTENT_HEIGHT_PX
      );
      
      const pageElements = remainingElements.slice(0, splitIndex || 1);
      const pageContent = pageElements.map(el => el.outerHTML).join('');
      const pageHeight = measureContentHeight(pageContent);
      
      pages.push({
        id: pageNumber.toString(),
        content: pageContent,
        height: pageHeight
      });
      
      remainingElements = remainingElements.slice(splitIndex || 1);
      pageNumber++;
    }

    return pages.length > 0 ? pages : [{ id: '1', content: '', height: 0 }];
  }, [findOptimalSplitPoint, measureContentHeight, CONTENT_HEIGHT_PX]);

  // Handle content overflow by creating new pages
  const handleContentOverflow = useCallback(() => {
    if (!editor) return;
    
    const fullContent = editor.getHTML();
    const newPages = splitContentIntoPages(fullContent);
    
    if (newPages.length > pages.length) {
      // Content has grown, update pages
      setPages(newPages);
      
      // Update editor to show only first page content
      const firstPageContent = newPages[0]?.content || '';
      if (firstPageContent !== editor.getHTML()) {
        editor.commands.setContent(firstPageContent, { emitUpdate: false });
      }
    }
  }, [editor, pages.length, splitContentIntoPages]);

  // Handle editor updates with debouncing
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      // Clear existing timeout
      if (contentUpdateTimeoutRef.current) {
        clearTimeout(contentUpdateTimeoutRef.current);
      }
      
      // Debounce content updates
      contentUpdateTimeoutRef.current = setTimeout(() => {
        const content = editor.getHTML();
        const newPages = splitContentIntoPages(content);
        setPages(newPages);
        
        // Check for overflow and handle pagination
        if (checkContentOverflow()) {
          handleContentOverflow();
        }
      }, 100);
    };

    // Initial setup
    const content = editor.getHTML();
    const initialPages = splitContentIntoPages(content);
    setPages(initialPages);
    
    editor.on('update', handleUpdate);
    
    return () => {
      editor.off('update', handleUpdate);
      if (contentUpdateTimeoutRef.current) {
        clearTimeout(contentUpdateTimeoutRef.current);
      }
    };
  }, [editor, splitContentIntoPages, checkContentOverflow, handleContentOverflow]);

  // Mount editor and setup height observer
  useEffect(() => {
    if (!editor || !editorContainerRef.current || editorMountedRef.current) return;

    const editorContainer = editorContainerRef.current;
    if (!editorContainer.contains(editor.view.dom)) {
      editorContainer.appendChild(editor.view.dom);
      editorMountedRef.current = true;
      
      // Setup ResizeObserver for real-time height monitoring
      heightObserverRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const contentHeight = entry.target.scrollHeight;
          if (contentHeight > CONTENT_HEIGHT_PX) {
            handleContentOverflow();
          }
        }
      });
      
      // Observe the editor content
      const proseMirrorElement = editor.view.dom;
      if (proseMirrorElement) {
        heightObserverRef.current.observe(proseMirrorElement);
      }
    }
    
    return () => {
      if (heightObserverRef.current) {
        heightObserverRef.current.disconnect();
      }
    };
  }, [editor, pages, handleContentOverflow, CONTENT_HEIGHT_PX]);

  return (
    <div className="w-full">
      {/* Hidden measuring container */}
      <div
        ref={measureRef}
        style={{
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          width: `${CONTENT_WIDTH_PX}px`,
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
                ref={editorContainerRef}
                className="page-editor-content"
                style={{
                  width: `${CONTENT_WIDTH_PX}px`,
                  height: `${CONTENT_HEIGHT_PX}px`,
                  overflow: 'auto', // Allow scrolling while content is being split
                  maxHeight: `${CONTENT_HEIGHT_PX}px`
                }}
              >
                {/* TipTap editor will be mounted here */}
              </div>
            ) : (
              // Subsequent pages show read-only content
              <div 
                className="page-content"
                style={{
                  width: `${CONTENT_WIDTH_PX}px`,
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