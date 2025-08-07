import React, { useState } from 'react';
import { Button } from './button';
import { Textarea } from './textarea';
import { X, Save } from 'lucide-react';

interface CommentFormProps {
  selectedText: string;
  onSave: (comment: string) => void;
  onCancel: () => void;
  position: { top: number; right: number };
}

export const CommentForm: React.FC<CommentFormProps> = ({
  selectedText,
  onSave,
  onCancel,
  position,
}) => {
  const [comment, setComment] = useState('');

  const handleSave = () => {
    if (comment.trim()) {
      onSave(comment.trim());
      setComment('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  return (
    <div 
      className="fixed bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80 z-50"
      style={{ 
        top: position.top, 
        left: position.right,
        maxHeight: '300px'
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm text-gray-900">Add Comment</h3>
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-6 w-6 p-0">
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-2">
          Selected text: "{selectedText.length > 40 ? selectedText.substring(0, 40) + '...' : selectedText}"
        </div>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add your comment..."
          className="min-h-[80px] text-sm"
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </div>
      
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          size="sm" 
          onClick={handleSave}
          disabled={!comment.trim()}
          className="flex items-center gap-1"
        >
          <Save className="h-3 w-3" />
          Save
        </Button>
      </div>
      
      <div className="text-xs text-gray-400 mt-2">
        Press Ctrl+Enter to save, Esc to cancel
      </div>
    </div>
  );
};