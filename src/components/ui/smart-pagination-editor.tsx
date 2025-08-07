import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Editor } from '@tiptap/react';

interface SmartPaginationEditorProps {
  editor: Editor;
  className?: string;
  onMouseUp?: () => void;
}

interface PageContent {
  id: string;
  html: string;
  textLength: number;
}

export const SmartPaginationEditor: React.FC<SmartPaginationEditorProps> = ({ 
  editor, 
  className,
  onMouseUp 
}) => {
  const [pages, setPages] = useState<PageContent[]>([{ id: '1', html: '', textLength: 0 }]);
  const [currentPageContent, setCurrentPageContent] = useState('');
  const [totalContent, setTotalContent] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const editorMountedRef = useRef<boolean>(false);
  const isUpdatingFromPagination = useRef<boolean>(false);
  const lastKnownCursorPos = useRef<number>(0);
  
  // Page dimensions (at 96 DPI)
  const PAGE_HEIGHT_INCHES = 11.5;
  const MARGIN_INCHES = 1;
  const CONTENT_HEIGHT_INCHES = PAGE_HEIGHT_INCHES - (2 * MARGIN_INCHES); // 9.5 inches
  const PAGE_HEIGHT_PX = PAGE_HEIGHT_INCHES * 96; // 1104px
  const CONTENT_HEIGHT_PX = CONTENT_HEIGHT_INCHES * 96; // 912px
  const PAGE_WIDTH_PX = 8.5 * 96; // 816px
  const CONTENT_WIDTH_PX = 6.5 * 96; // 624px (8.5 - 2 inch margins)

  // Measure content height in a controlled way
  const measureContentHeight = useCallback((htmlContent: string): number => {
    if (!measureRef.current) return 0;
    
    measureRef.current.innerHTML = htmlContent;
    return measureRef.current.scrollHeight;
  }, []);

  // Find the maximum content that fits within page height
  const findMaxContentThatFits = useCallback((htmlContent: string): { content: string; overflow: string; charIndex: number } => {
    if (!htmlContent) return { content: '', overflow: '', charIndex: 0 };
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const textContent = tempDiv.textContent || '';
    
    if (measureContentHeight(htmlContent) <= CONTENT_HEIGHT_PX) {
      return { content: htmlContent, overflow: '', charIndex: textContent.length };
    }
    
    // Binary search to find the optimal split point
    let low = 0;
    let high = textContent.length;
    let bestFit = { content: '', overflow: htmlContent, charIndex: 0 };
    
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const partialText = textContent.substring(0, mid);
      
      // Create HTML that preserves formatting up to this character
      const range = document.createRange();
      const selection = window.getSelection();
      
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      // Simple approach: find the HTML that corresponds to this character count
      const walker = document.createTreeWalker(
        tempDiv,
        NodeFilter.SHOW_TEXT,
        null
      );
      
      let charCount = 0;
      let lastGoodNode = null;
      let lastGoodOffset = 0;
      
      while (walker.nextNode()) {
        const textNode = walker.currentNode as Text;
        const nodeText = textNode.textContent || '';
        
        if (charCount + nodeText.length >= mid) {
          lastGoodNode = textNode;
          lastGoodOffset = mid - charCount;
          break;
        }
        
        charCount += nodeText.length;
        lastGoodNode = textNode;
        lastGoodOffset = nodeText.length;
      }
      
      if (lastGoodNode) {
        range.setStart(tempDiv, 0);
        range.setEnd(lastGoodNode, lastGoodOffset);
        
        const fragment = range.cloneContents();
        const testDiv = document.createElement('div');
        testDiv.appendChild(fragment);
        const testContent = testDiv.innerHTML;
        
        if (measureContentHeight(testContent) <= CONTENT_HEIGHT_PX) {
          bestFit = {
            content: testContent,
            overflow: htmlContent.substring(testContent.length),
            charIndex: mid
          };
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      } else {
        high = mid - 1;
      }
    }
    
    return bestFit;
  }, [measureContentHeight, CONTENT_HEIGHT_PX]);

  // Split content into pages and update state
  const updatePagesFromContent = useCallback((fullContent: string) => {
    if (!fullContent) {
      setPages([{ id: '1', html: '', textLength: 0 }]);
      setCurrentPageContent('');
      return;
    }

    const newPages: PageContent[] = [];
    let remainingContent = fullContent;
    let pageNumber = 1;

    while (remainingContent) {
      const { content, overflow } = findMaxContentThatFits(remainingContent);
      
      if (!content && remainingContent) {
        // If even a tiny bit doesn't fit, force at least some content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = remainingContent;
        const firstElement = tempDiv.firstElementChild;
        const fallbackContent = firstElement ? firstElement.outerHTML : remainingContent.substring(0, 50);
        
        newPages.push({
          id: pageNumber.toString(),
          html: fallbackContent,
          textLength: (tempDiv.textContent || '').length
        });
        
        remainingContent = remainingContent.substring(fallbackContent.length);
      } else {
        newPages.push({
          id: pageNumber.toString(),
          html: content,
          textLength: (content ? (document.createElement('div').innerHTML = content, document.createElement('div').textContent || '').length : 0)
        });
        
        remainingContent = overflow;
      }
      
      pageNumber++;
      
      // Safety break to prevent infinite loops
      if (pageNumber > 100) break;
    }

    setPages(newPages.length > 0 ? newPages : [{ id: '1', html: '', textLength: 0 }]);
    
    // Update current page content (first page)
    const firstPageContent = newPages[0]?.html || '';
    setCurrentPageContent(firstPageContent);
    
    return newPages;
  }, [findMaxContentThatFits]);

  // Handle real-time content constraint
  const constrainEditorContent = useCallback(() => {
    if (!editor || isUpdatingFromPagination.current) return;
    
    const currentContent = editor.getHTML();
    const currentHeight = measureContentHeight(currentContent);
    
    if (currentHeight > CONTENT_HEIGHT_PX) {
      // Content exceeds page height, constrain it
      const { content } = findMaxContentThatFits(currentContent);
      
      if (content !== currentContent) {
        isUpdatingFromPagination.current = true;
        
        // Store cursor position
        const { from } = editor.state.selection;
        lastKnownCursorPos.current = from;
        
        // Update editor with constrained content
        editor.commands.setContent(content, { emitUpdate: false });
        
        // Restore cursor position (or move to end if beyond constrained content)
        const maxPos = editor.state.doc.content.size;
        const newPos = Math.min(lastKnownCursorPos.current, maxPos);
        editor.commands.setTextSelection(newPos);
        
        // Update total content and pages
        setTotalContent(currentContent);
        updatePagesFromContent(currentContent);
        
        isUpdatingFromPagination.current = false;
      }
    } else {
      // Content fits, update total content
      setTotalContent(currentContent);
      updatePagesFromContent(currentContent);
    }
  }, [editor, measureContentHeight, CONTENT_HEIGHT_PX, findMaxContentThatFits, updatePagesFromContent]);

  // Handle editor updates and real-time pagination
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      if (isUpdatingFromPagination.current) return;
      
      // Constrain content in real-time
      setTimeout(() => constrainEditorContent(), 0);
    };

    // Initial setup
    const initialContent = editor.getHTML();
    if (initialContent) {
      updatePagesFromContent(initialContent);
    }
    
    editor.on('update', handleUpdate);
    
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, constrainEditorContent, updatePagesFromContent]);

  // Mount editor to first page
  useEffect(() => {
    if (!editor || !editorContainerRef.current || editorMountedRef.current) return;

    const editorContainer = editorContainerRef.current;
    if (!editorContainer.contains(editor.view.dom)) {
      editorContainer.appendChild(editor.view.dom);
      editorMountedRef.current = true;
    }
  }, [editor]);

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
                  overflow: 'hidden', // Prevent overflow - content is constrained
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
                dangerouslySetInnerHTML={{ __html: page.html }}
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