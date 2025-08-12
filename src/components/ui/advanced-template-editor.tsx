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
import { FontSize } from '@tiptap/extension-font-size';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Typography } from '@tiptap/extension-typography';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { cn } from '@/lib/utils';
import './document-styles.css';
import { AdvancedToolbar } from './advanced-toolbar';
import { CommentsPanel } from './comments-panel';
import { CommentForm } from './comment-form';
import { PagedEditor } from './paged-editor';
import { Button } from './button';
import { MessageSquare, Eye, Save, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
export interface Comment {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
  resolved: boolean;
  range: {
    from: number;
    to: number;
  };
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
  templateId?: string;
  masterTemplateId?: string;
}
const FONTS = ['Arial', 'Times New Roman', 'Helvetica', 'Georgia', 'Verdana', 'Courier New', 'Comic Sans MS', 'Impact', 'Trebuchet MS'];
export const AdvancedTemplateEditor: React.FC<AdvancedTemplateEditorProps> = ({
  content,
  onChange,
  onSave,
  placeholder = "Start writing your template...",
  className,
  autoSave = true,
  title = "Template",
  isSaving = false,
  templateId,
  masterTemplateId
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [showCommentIcon, setShowCommentIcon] = useState(false);
  const [commentIconPosition, setCommentIconPosition] = useState({
    top: 0,
    right: 0
  });
  const [selectedRange, setSelectedRange] = useState<{
    from: number;
    to: number;
  } | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
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
      placeholder
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
    Typography,
    Table.configure({
      resizable: true,
      allowTableNodeSelection: true,
    }),
    TableRow,
    TableHeader,
    TableCell
  ], [placeholder]);
  const editor = useEditor({
    extensions,
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none'
      }
    },
    onUpdate: ({
      editor
    }) => {
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
    }
  });

  // Load comments from database when template ID changes
  useEffect(() => {
    if (templateId && user) {
      // Always load comments from the template's own ID first
      loadComments();
    } else if (masterTemplateId && user) {
      // For new customized templates without an ID yet, load from master
      loadCommentsFromMaster();
    }
  }, [templateId, masterTemplateId, user]);

  const loadComments = async () => {
    if (!templateId || !user) return;

    try {
      const { data, error } = await supabase
        .from('template_comments')
        .select('*')
        .eq('template_id', templateId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading comments:', error);
        return;
      }

      if (data) {
        const formattedComments: Comment[] = data.map(comment => ({
          id: comment.id,
          content: comment.content,
          author: comment.author,
          timestamp: new Date(comment.created_at),
          resolved: comment.resolved,
          range: {
            from: comment.range_from,
            to: comment.range_to
          },
          selectedText: comment.selected_text
        }));
        setComments(formattedComments);
      }
    } catch (error) {
      console.error('Error in loadComments:', error);
    }
  };

  const loadCommentsFromMaster = async () => {
    if (!masterTemplateId || !user) return;

    try {
      const { data, error } = await supabase
        .from('template_comments')
        .select('*')
        .eq('template_id', masterTemplateId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading master comments:', error);
        return;
      }

      if (data) {
        const formattedComments: Comment[] = data.map(comment => ({
          id: comment.id,
          content: comment.content,
          author: comment.author,
          timestamp: new Date(comment.created_at),
          resolved: comment.resolved,
          range: {
            from: comment.range_from,
            to: comment.range_to
          },
          selectedText: comment.selected_text
        }));
        setComments(formattedComments);
      }
    } catch (error) {
      console.error('Error in loadCommentsFromMaster:', error);
    }
  };

  // Function to copy comments from master template to customized template
  const copyCommentsToCustomizedTemplate = async (customizedTemplateId: string) => {
    if (!masterTemplateId || !user) return;

    try {
      // Get comments from master template
      const { data: masterComments, error: loadError } = await supabase
        .from('template_comments')
        .select('*')
        .eq('template_id', masterTemplateId);

      if (loadError || !masterComments) {
        console.error('Error loading master comments for copying:', loadError);
        return;
      }

      // Copy comments to the customized template
      const commentsToInsert = masterComments.map(comment => ({
        template_id: customizedTemplateId,
        user_id: user.id,
        content: comment.content,
        author: comment.author,
        selected_text: comment.selected_text,
        range_from: comment.range_from,
        range_to: comment.range_to,
        resolved: comment.resolved
      }));

      const { error: insertError } = await supabase
        .from('template_comments')
        .insert(commentsToInsert);

      if (insertError) {
        console.error('Error copying comments to customized template:', insertError);
      }
    } catch (error) {
      console.error('Error in copyCommentsToCustomizedTemplate:', error);
    }
  };

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && saveStatus === 'unsaved') {
      const timeoutId = setTimeout(() => {
        setSaveStatus('saving');
        // Save to localStorage
        localStorage.setItem(`template-${title}-autosave`, JSON.stringify({
          content,
          timestamp: Date.now()
        }));
        setTimeout(() => {
          setSaveStatus('saved');
        }, 500);
      }, 2000); // 2 second delay

      return () => clearTimeout(timeoutId);
    }
  }, [content, autoSave, saveStatus, title]);
  const handleAddComment = useCallback(async (commentText: string) => {
    if (selectedRange && selectedText && user) {
      // For master templates or existing templates, use templateId
      // For new customized templates without ID yet, use masterTemplateId
      const targetTemplateId = templateId || masterTemplateId;
      
      if (targetTemplateId) {
        try {
          const { data, error } = await supabase
            .from('template_comments')
            .insert({
              template_id: targetTemplateId,
              user_id: user.id,
              content: commentText,
              author: 'You',
              selected_text: selectedText,
              range_from: selectedRange.from,
              range_to: selectedRange.to,
              resolved: false
            })
            .select()
            .single();

          if (error) {
            console.error('Error saving comment:', error);
            return;
          }

          if (data) {
            const newComment: Comment = {
              id: data.id,
              content: data.content,
              author: data.author,
              timestamp: new Date(data.created_at),
              resolved: data.resolved,
              range: {
                from: data.range_from,
                to: data.range_to
              },
              selectedText: data.selected_text
            };

            setComments(prev => [...prev, newComment]);
          }
        } catch (error) {
          console.error('Error in handleAddComment:', error);
        }
      }

      setShowCommentForm(false);
      setShowCommentIcon(false);
      setSelectedRange(null);
      setSelectedText('');
    }
  }, [selectedRange, selectedText, templateId, masterTemplateId, user]);
  const handleResolveComment = useCallback(async (commentId: string) => {
    // Update in database
    try {
      const { error } = await supabase
        .from('template_comments')
        .update({ resolved: true })
        .eq('id', commentId);

      if (error) {
        console.error('Error resolving comment:', error);
        return;
      }
    } catch (error) {
      console.error('Error in handleResolveComment:', error);
      return;
    }

    setComments(prev => prev.map(comment => 
      comment.id === commentId ? { ...comment, resolved: true } : comment
    ));
  }, []);

  const handleUnresolveComment = useCallback(async (commentId: string) => {
    // Update in database
    try {
      const { error } = await supabase
        .from('template_comments')
        .update({ resolved: false })
        .eq('id', commentId);

      if (error) {
        console.error('Error unresolving comment:', error);
        return;
      }
    } catch (error) {
      console.error('Error in handleUnresolveComment:', error);
      return;
    }

    setComments(prev => prev.map(comment => 
      comment.id === commentId ? { ...comment, resolved: false } : comment
    ));
  }, []);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('template_comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Error deleting comment:', error);
        return;
      }

      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error in handleDeleteComment:', error);
    }
  }, []);
  const handleCommentClick = useCallback((comment: Comment) => {
    if (!editor) return;

    // Highlight the text temporarily
    setHighlightedCommentId(comment.id);

    // Focus the editor and try to select the text range
    editor.commands.focus();
    
    // Check if the range is still valid in the current document
    const docSize = editor.state.doc.content.size;
    const { from, to } = comment.range;
    
    if (from >= 0 && to <= docSize && from < to) {
      // Range is valid, try to select it
      try {
        const currentText = editor.state.doc.textBetween(from, to);
        // If the text matches what was originally selected, highlight it
        if (currentText === comment.selectedText) {
          editor.commands.setTextSelection({ from, to });
        } else {
          // Text has changed, just focus without selection
          console.log('Referenced text has been modified or moved');
        }
      } catch (error) {
        console.warn('Could not select text range for comment:', error);
      }
    } else {
      // Range is invalid (text was likely deleted)
      console.log('Referenced text no longer exists in the document');
    }

    // Remove highlight after 3 seconds
    setTimeout(() => {
      setHighlightedCommentId(null);
    }, 3000);
  }, [editor]);
  const handleSelection = useCallback(() => {
    if (!editor) return;
    const {
      from,
      to
    } = editor.state.selection;
    if (from !== to) {
      const selectedText = editor.state.doc.textBetween(from, to);

      // Get the position of the selection for centering the comment popup
      const coords = editor.view.coordsAtPos(to);
      const viewportWidth = window.innerWidth;
      setSelectedText(selectedText);
      setSelectedRange({
        from,
        to
      });
      setCommentIconPosition({
        top: coords.top + 20,
        // Position below the selected text
        right: (viewportWidth - 320) / 2 // Center horizontally (320px is form width)
      });
      setShowCommentIcon(true);
    } else {
      setShowCommentIcon(false);
      setShowCommentForm(false);
      setSelectedRange(null);
      setSelectedText('');
    }
  }, [editor]);
  const handleCommentIconClick = () => {
    setShowCommentForm(true);
    setShowCommentIcon(false);
  };
  const handleCommentCancel = () => {
    setShowCommentForm(false);
    setShowCommentIcon(false);
    setSelectedRange(null);
    setSelectedText('');
  };
  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'unsaved':
        return 'Unsaved changes';
      case 'saved':
        return 'All changes saved';
    }
  };
  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case 'saving':
        return 'text-blue-600';
      case 'unsaved':
        return 'text-orange-600';
      case 'saved':
        return 'text-green-600';
    }
  };
  if (!editor) {
    return <div className="flex items-center justify-center h-96">Loading editor...</div>;
  }
  return <div className="h-full flex flex-col bg-muted/30">
      {/* Toolbar */}
      <AdvancedToolbar editor={editor} availableFonts={FONTS} comments={comments} showComments={showComments} onToggleComments={() => setShowComments(!showComments)} />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document Editor */}
        <div className="flex-1 overflow-auto bg-muted/50 p-8">
          <div className="mx-auto max-w-4xl">
            <PagedEditor editor={editor} onMouseUp={handleSelection} />
                
            {/* Comment Icon */}
            {showCommentIcon && <div className="fixed" style={{
              top: commentIconPosition.top,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10
            }}>
              <Button variant="default" size="sm" onClick={handleCommentIconClick} className="h-8 w-8 p-0 rounded-full shadow-lg" title="Add comment">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>}

            {/* Comment Form */}
            {showCommentForm && selectedText && <CommentForm selectedText={selectedText} onSave={handleAddComment} onCancel={handleCommentCancel} position={{
              top: commentIconPosition.top + 40,
              right: (window.innerWidth - 320) / 2
            }} />}
          </div>
        </div>

        {/* Comments Panel - Same height as document area */}
        {showComments && <div className="w-80 flex flex-col">
          <CommentsPanel 
            comments={comments} 
            onResolveComment={handleResolveComment} 
            onUnresolveComment={handleUnresolveComment} 
            onDeleteComment={handleDeleteComment}
            onCommentClick={handleCommentClick} 
            onClose={() => setShowComments(false)} 
          />
        </div>}
      </div>
    </div>;
};