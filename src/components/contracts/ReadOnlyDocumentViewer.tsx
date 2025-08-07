import React, { useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { FontFamily } from '@tiptap/extension-font-family';
import { FontSize } from '@tiptap/extension-font-size';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Typography } from '@tiptap/extension-typography';
import { cn } from '@/lib/utils';
import '../ui/document-styles.css';

interface ReadOnlyDocumentViewerProps {
  content: string;
  className?: string;
}

export const ReadOnlyDocumentViewer: React.FC<ReadOnlyDocumentViewerProps> = ({
  content,
  className
}) => {
  const extensions = useMemo(() => [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5],
        HTMLAttributes: {
          class: 'heading-style'
        }
      },
      // Disable built-in underline and hard-break from StarterKit to avoid duplicates
      underline: false,
      hardBreak: false
    }),
    Placeholder.configure({
      placeholder: ''
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph']
    }),
    Underline,
    TextStyle,
    Color,
    Highlight.configure({
      multicolor: true
    }),
    FontFamily.configure({
      types: ['textStyle']
    }),
    FontSize.configure({
      types: ['textStyle']
    }),
    HardBreak.configure({
      HTMLAttributes: {
        class: 'page-break'
      }
    }),
    Typography
  ], []);

  const editor = useEditor({
    extensions,
    content,
    editable: false, // Make it read-only
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none'
      }
    }
  });

  if (!editor) {
    return <div className="flex items-center justify-center h-96">Loading document...</div>;
  }

  return (
    <div className={cn("bg-white rounded-lg document-viewer-container", className)}>
      {/* Document Container with same styling as template editor */}
      <div className="document-container">
        <div className="document-page">
          <EditorContent 
            editor={editor} 
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
};