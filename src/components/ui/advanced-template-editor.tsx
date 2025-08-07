import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { FontFamily } from '@tiptap/extension-font-family';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Typography } from '@tiptap/extension-typography';
import { cn } from '@/lib/utils';
import { AdvancedToolbar } from './advanced-toolbar';
import { CommentsPanel } from './comments-panel';
import { Button } from './button';
import { MessageSquare, Eye, Save } from 'lucide-react';

export interface Comment {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
  resolved: boolean;
  range: { from: number; to: number };
  selectedText: string;
}

interface AdvancedTemplateEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  placeholder?: string;
  className?: string;
  autoSave?: boolean;
  title?: string;
  isSaving?: boolean;
}

const FONTS = [
  'Arial',
  'Times New Roman', 
  'Helvetica',
  'Georgia',
  'Verdana',
  'Courier New',
  'Comic Sans MS',
  'Impact',
  'Trebuchet MS',
];

export const AdvancedTemplateEditor: React.FC<AdvancedTemplateEditorProps> = ({
  content,
  onChange,
  onSave,
  placeholder = "Start writing your template...",
  className,
  autoSave = true,
  title = "Template",
  isSaving = false,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  const extensions = useMemo(() => [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5],
      },
    }),
    Placeholder.configure({
      placeholder,
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Underline,
    TextStyle,
    Color,
    Highlight.configure({
      multicolor: true,
    }),
    FontFamily.configure({
      types: ['textStyle'],
    }),
    HardBreak,
    Typography,
  ], [placeholder]);

  const editor = useEditor({
    extensions,
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[800px] p-8',
        style: 'min-height: 11in; width: 8.5in; margin: 0 auto; box-shadow: 0 0 20px rgba(0,0,0,0.1); background: white;',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      
      // Update word count
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      
      // Auto-save status
      if (autoSave) {
        setSaveStatus('unsaved');
      }
    },
  });

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && saveStatus === 'unsaved') {
      const timeoutId = setTimeout(() => {
        setSaveStatus('saving');
        // Save to localStorage
        localStorage.setItem(`template-${title}-autosave`, JSON.stringify({
          content,
          timestamp: Date.now(),
        }));
        
        setTimeout(() => {
          setSaveStatus('saved');
        }, 500);
      }, 2000); // 2 second delay

      return () => clearTimeout(timeoutId);
    }
  }, [content, autoSave, saveStatus, title]);

  const handleAddComment = useCallback((selectedText: string, range: { from: number; to: number }) => {
    const commentText = prompt('Add a comment:');
    if (commentText) {
      const newComment: Comment = {
        id: Date.now().toString(),
        content: commentText,
        author: 'You',
        timestamp: new Date(),
        resolved: false,
        range,
        selectedText,
      };
      setComments(prev => [...prev, newComment]);
    }
  }, []);

  const handleResolveComment = useCallback((commentId: string) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, resolved: true }
          : comment
      )
    );
  }, []);

  const handleSelection = useCallback(() => {
    if (!editor) return;
    
    const { from, to } = editor.state.selection;
    if (from !== to) {
      const selectedText = editor.state.doc.textBetween(from, to);
      const shouldAddComment = window.confirm(`Add comment to: "${selectedText.slice(0, 50)}${selectedText.length > 50 ? '...' : ''}"?`);
      
      if (shouldAddComment) {
        handleAddComment(selectedText, { from, to });
      }
    }
  }, [editor, handleAddComment]);

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving': return 'Saving...';
      case 'unsaved': return 'Unsaved changes';
      case 'saved': return 'All changes saved';
    }
  };

  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case 'saving': return 'text-blue-600';
      case 'unsaved': return 'text-orange-600';
      case 'saved': return 'text-green-600';
    }
  };

  if (!editor) {
    return <div className="flex items-center justify-center h-96">Loading editor...</div>;
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{wordCount} words</span>
            <span>•</span>
            <span className={getSaveStatusColor()}>{getSaveStatusText()}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Comments ({comments.filter(c => !c.resolved).length})
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          
          {onSave && (
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      {!showPreview && (
        <div className="sticky top-0 z-10">
          <AdvancedToolbar editor={editor} availableFonts={FONTS} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Area */}
        <div className={cn(
          "flex-1 overflow-auto bg-gray-100 p-8",
          showComments && "mr-80"
        )}>
          <div className="max-w-4xl mx-auto">
            {showPreview ? (
              <div 
                className="prose prose-lg max-w-none bg-white p-8 shadow-lg min-h-[11in]"
                style={{ width: '8.5in', minHeight: '11in' }}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <div 
                className="bg-white shadow-lg relative"
                style={{ width: '8.5in', minHeight: '11in' }}
                onMouseUp={handleSelection}
              >
                {/* Page margins indicator */}
                <div className="absolute inset-0 pointer-events-none">
                  <div 
                    className="border border-dashed border-gray-300"
                    style={{ 
                      margin: '1in',
                      height: 'calc(100% - 2in)',
                      width: 'calc(100% - 2in)'
                    }}
                  />
                </div>
                
                <EditorContent 
                  editor={editor} 
                  className={className}
                />
                
                {/* Page number */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                  Page 1 of 1
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comments Panel */}
        {showComments && (
          <CommentsPanel
            comments={comments}
            onResolveComment={handleResolveComment}
            onClose={() => setShowComments(false)}
          />
        )}
      </div>
    </div>
  );
};