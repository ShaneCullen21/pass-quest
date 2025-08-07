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
  const [pages, setPages] = useState<string[]>(['']);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate pages based on content height
  useEffect(() => {
    if (!editor) return;

    const calculatePages = () => {
      const content = editor.getHTML();
      const tempDiv = document.createElement('div');
      tempDiv.style.width = '6.5in'; // 8.5in - 2in margins
      tempDiv.style.fontFamily = 'Times New Roman, serif';
      tempDiv.style.fontSize = '12px';
      tempDiv.style.lineHeight = '1.6';
      tempDiv.style.position = 'absolute';
      tempDiv.style.visibility = 'hidden';
      tempDiv.innerHTML = content;
      
      document.body.appendChild(tempDiv);
      
      const pageHeight = 9 * 96; // 9 inches in pixels (11in - 2in margins) at 96 DPI
      const contentHeight = tempDiv.scrollHeight;
      const numPages = Math.max(1, Math.ceil(contentHeight / pageHeight));
      
      document.body.removeChild(tempDiv);
      
      // For now, we'll put all content on the first page
      // In a real implementation, you'd split content across pages
      const newPages = [content];
      for (let i = 1; i < numPages; i++) {
        newPages.push(''); // Empty pages for now
      }
      
      setPages(newPages);
    };

    const handleUpdate = () => {
      calculatePages();
    };

    editor.on('update', handleUpdate);
    calculatePages();

    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor]);

  return (
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
      {pages.map((pageContent, index) => (
        <div 
          key={index}
          className="document-page"
          style={{ 
            width: '8.5in', 
            height: '11in',
            margin: '0 auto 30px auto',
            padding: '1in',
            background: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {index === 0 ? (
            // First page contains the editor
            <div className="h-full overflow-hidden">
              <div 
                className={`tiptap-editor ${className || ''}`}
                style={{ height: '100%', overflow: 'hidden' }}
                ref={(el) => {
                  if (el && editor.view.dom.parentNode !== el) {
                    el.appendChild(editor.view.dom);
                  }
                }}
              />
            </div>
          ) : (
            // Subsequent pages for overflow content (placeholder for now)
            <div className="h-full flex items-center justify-center text-gray-400">
              <p>Page {index + 1} - Content overflow would appear here</p>
            </div>
          )}
          
          {/* Page number */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
            Page {index + 1} of {pages.length}
          </div>
        </div>
      ))}
    </div>
  );
};