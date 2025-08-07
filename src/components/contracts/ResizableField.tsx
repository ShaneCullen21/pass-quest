import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useResizable } from '@/hooks/useResizable';

interface ResizableFieldProps {
  id: string;
  type: 'name' | 'signature' | 'date';
  clientId: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  onMove: (id: string, newPosition: { x: number; y: number }) => void;
  onResize: (id: string, newWidth: number, newHeight: number) => void;
  onDelete: (id: string) => void;
}

// Client colors - each client gets a unique color
const clientColors = [
  "border-blue-500 bg-blue-100 text-blue-800",
  "border-green-500 bg-green-100 text-green-800", 
  "border-orange-500 bg-orange-100 text-orange-800",
  "border-purple-500 bg-purple-100 text-purple-800",
  "border-pink-500 bg-pink-100 text-pink-800",
  "border-indigo-500 bg-indigo-100 text-indigo-800",
  "border-teal-500 bg-teal-100 text-teal-800",
  "border-red-500 bg-red-100 text-red-800"
];

const getClientColor = (clientId: string) => {
  // Use a simple hash to get consistent color for each client
  const hash = clientId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return clientColors[hash % clientColors.length];
};

const fieldMinSizes = {
  name: { width: 100, height: 25 },
  signature: { width: 150, height: 40 },
  date: { width: 100, height: 25 }
};

export const ResizableField: React.FC<ResizableFieldProps> = ({
  id,
  type,
  clientId,
  position,
  width,
  height,
  onMove,
  onResize,
  onDelete
}) => {
  const {
    dimensions,
    isResizing,
    isDragging,
    handleMouseDown
  } = useResizable({
    initialWidth: width,
    initialHeight: height,
    initialX: position.x,
    initialY: position.y,
    onResize: (newWidth, newHeight) => onResize(id, newWidth, newHeight),
    onMove: (newX, newY) => onMove(id, { x: newX, y: newY }),
    minWidth: fieldMinSizes[type].width,
    minHeight: fieldMinSizes[type].height,
    maxWidth: 400,
    maxHeight: 100
  });

  const resizeHandles = [
    { direction: 'nw', cursor: 'nw-resize', className: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2' },
    { direction: 'n', cursor: 'n-resize', className: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' },
    { direction: 'ne', cursor: 'ne-resize', className: 'top-0 right-0 translate-x-1/2 -translate-y-1/2' },
    { direction: 'e', cursor: 'e-resize', className: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2' },
    { direction: 'se', cursor: 'se-resize', className: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2' },
    { direction: 's', cursor: 's-resize', className: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' },
    { direction: 'sw', cursor: 'sw-resize', className: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2' },
    { direction: 'w', cursor: 'w-resize', className: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2' }
  ];

  return (
    <div
      className={`absolute border-2 rounded-lg flex items-center justify-center text-xs font-medium transition-all select-none resize-field ${getClientColor(clientId)} ${
        (isResizing || isDragging) ? 'shadow-lg z-50' : 'hover:shadow-md z-20'
      }`}
      style={{
        left: dimensions.x,
        top: dimensions.y,
        width: dimensions.width,
        height: dimensions.height,
        cursor: isDragging ? 'move' : 'default'
      }}
      onMouseDown={(e) => handleMouseDown(e)}
    >
      {/* Field Content - Only show field type */}
      <div className="capitalize font-semibold pointer-events-none">
        {type === 'signature' ? 'Sign' : type}
      </div>

      {/* Delete Button */}
      <Button
        variant="destructive"
        size="sm"
        className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full text-xs z-30"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(id);
        }}
      >
        <X className="h-3 w-3" />
      </Button>

      {/* Resize Handles */}
      <div className="resize-handles">
        {resizeHandles.map(({ direction, cursor, className }) => (
          <div
            key={direction}
            className={`absolute w-3 h-3 bg-primary border border-white rounded-full ${className} z-40 opacity-0 hover:opacity-100 transition-opacity`}
            style={{ cursor }}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleMouseDown(e, direction);
            }}
          />
        ))}
      </div>

      {/* Corner resize handle (always visible for better UX) */}
      <div
        className="absolute bottom-0 right-0 w-3 h-3 bg-primary border border-white rounded-tl cursor-se-resize z-40"
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(e, 'se');
        }}
      />
    </div>
  );
};