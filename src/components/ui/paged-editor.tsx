import React, { useEffect, useState, useRef } from 'react';
import { Editor } from '@tiptap/react';

interface PagedEditorProps {
  editor: Editor;
  className?: string;
  onMouseUp?: () => void;
}

export const PagedEditor: React.FC<PagedEditorProps> = ({ 
  editor, 
  className,
  onMouseUp 
}) => {
  const [pageCount, setPageCount] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Monitor content changes and calculate required pages
  useEffect(() => {
    if (!editor) return;

    const updatePageCount = () => {
      // Create a temporary div to measure content height
      const tempContainer = document.createElement('div');
      tempContainer.style.width = '6.5in'; // Content width (8.5in - 2in margins)
      tempContainer.style.fontFamily = 'Times New Roman, serif';
      tempContainer.style.fontSize = '12px';
      tempContainer.style.lineHeight = '1.6';
      tempContainer.style.position = 'absolute';
      tempContainer.style.top = '-9999px';
      tempContainer.style.left = '-9999px';
      tempContainer.innerHTML = editor.getHTML();
      
      document.body.appendChild(tempContainer);
      
      // Calculate pages needed (9in content height per page at 96 DPI)
      const pageContentHeight = 9 * 96; // 9 inches in pixels
      const totalHeight = tempContainer.scrollHeight;
      const requiredPages = Math.max(1, Math.ceil(totalHeight / pageContentHeight));
      
      document.body.removeChild(tempContainer);
      setPageCount(requiredPages);
    };

    editor.on('update', updatePageCount);
    updatePageCount();

    return () => {
      editor.off('update', updatePageCount);
    };
  }, [editor]);

  return (
    <div 
      ref={containerRef}
      className="document-container"
      style={{ 
        background: '#f5f5f5',
        padding: '20px',
        height: 'auto',
        minHeight: '100vh'
      }}
      onMouseUp={onMouseUp}
    >
      {Array.from({ length: pageCount }, (_, index) => (
        <div 
          key={index}
          className="document-page"
          style={{ 
            width: '8.5in', 
            height: 'auto',
            minHeight: '11in',
            margin: '0 auto 30px auto',
            padding: '1in',
            background: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'visible'
          }}
        >
          {index === 0 && (
            // Only first page contains the actual editor
            <div 
              className="h-full overflow-visible"
              style={{ 
                height: 'auto',
                minHeight: '9in',
                paddingBottom: '1in', // Add padding to prevent cutoff
              }}
            >
              <div 
                className={`tiptap-editor ${className || ''}`}
                style={{ 
                  height: 'auto',
                  minHeight: '9in',
                }}
                ref={(el) => {
                  if (el && editor.view.dom.parentNode !== el) {
                    el.appendChild(editor.view.dom);
                  }
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};