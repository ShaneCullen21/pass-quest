import React from 'react';
import { Button } from './button';
import { ScrollArea } from './scroll-area';
import { X, Check, MessageSquare } from 'lucide-react';
import { Comment } from './advanced-template-editor';

interface CommentsPanelProps {
  comments: Comment[];
  onResolveComment: (commentId: string) => void;
  onCommentClick: (comment: Comment) => void;
  onClose: () => void;
}

export const CommentsPanel: React.FC<CommentsPanelProps> = ({
  comments,
  onResolveComment,
  onCommentClick,
  onClose,
}) => {
  const activeComments = comments.filter(comment => !comment.resolved);
  const resolvedComments = comments.filter(comment => comment.resolved);

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="fixed right-0 top-0 h-full bg-white border-l border-gray-200 flex flex-col shadow-lg z-40" style={{ width: '300px' }}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Comments</h3>
          <span className="text-sm text-gray-500">
            ({activeComments.length})
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Comments List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Active Comments */}
          {activeComments.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Active Comments
              </h4>
              {activeComments.map(comment => (
                <div
                  key={comment.id}
                  className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg space-y-2 cursor-pointer hover:bg-yellow-100 transition-colors"
                  onClick={() => onCommentClick(comment)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">
                        "{comment.selectedText.length > 30 
                          ? comment.selectedText.substring(0, 30) + '...' 
                          : comment.selectedText}"
                      </div>
                      <p className="text-sm text-gray-900 mb-2">
                        {comment.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{comment.author}</span>
                        <span>{formatTimestamp(comment.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onResolveComment(comment.id);
                    }}
                    className="w-full flex items-center gap-2"
                  >
                    <Check className="h-3 w-3" />
                    Resolve
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* No Active Comments */}
          {activeComments.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                No active comments. Select text to add a comment.
              </p>
            </div>
          )}

          {/* Resolved Comments */}
          {resolvedComments.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Resolved Comments ({resolvedComments.length})
              </h4>
              {resolvedComments.map(comment => (
                <div
                  key={comment.id}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2 opacity-75"
                >
                  <div className="text-xs text-gray-500 mb-1">
                    "{comment.selectedText.length > 30 
                      ? comment.selectedText.substring(0, 30) + '...' 
                      : comment.selectedText}"
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    {comment.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{comment.author}</span>
                    <span>Resolved • {formatTimestamp(comment.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};