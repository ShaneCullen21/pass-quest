import { useState, useCallback, useRef, useEffect } from 'react';

interface UseResizableProps {
  initialWidth: number;
  initialHeight: number;
  initialX: number;
  initialY: number;
  onResize: (width: number, height: number) => void;
  onMove: (x: number, y: number) => void;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export const useResizable = ({
  initialWidth,
  initialHeight,
  initialX,
  initialY,
  onResize,
  onMove,
  minWidth = 50,
  minHeight = 20,
  maxWidth = 500,
  maxHeight = 200
}: UseResizableProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight,
    x: initialX,
    y: initialY
  });

  const startPos = useRef({ x: 0, y: 0 });
  const startDimensions = useRef({ width: 0, height: 0, x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent, direction?: string) => {
    e.preventDefault();
    e.stopPropagation();

    startPos.current = { x: e.clientX, y: e.clientY };
    startDimensions.current = { ...dimensions };

    if (direction) {
      setIsResizing(true);
      setResizeDirection(direction);
    } else {
      setIsDragging(true);
    }
  }, [dimensions]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing && !isDragging) return;

    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;

    if (isDragging) {
      const newX = Math.max(0, startDimensions.current.x + deltaX);
      const newY = Math.max(0, startDimensions.current.y + deltaY);
      
      setDimensions(prev => ({ ...prev, x: newX, y: newY }));
      onMove(newX, newY);
    } else if (isResizing) {
      let newWidth = startDimensions.current.width;
      let newHeight = startDimensions.current.height;
      let newX = startDimensions.current.x;
      let newY = startDimensions.current.y;

      switch (resizeDirection) {
        case 'se': // bottom-right
          newWidth = Math.min(maxWidth, Math.max(minWidth, startDimensions.current.width + deltaX));
          newHeight = Math.min(maxHeight, Math.max(minHeight, startDimensions.current.height + deltaY));
          break;
        case 'sw': // bottom-left
          newWidth = Math.min(maxWidth, Math.max(minWidth, startDimensions.current.width - deltaX));
          newHeight = Math.min(maxHeight, Math.max(minHeight, startDimensions.current.height + deltaY));
          newX = startDimensions.current.x + (startDimensions.current.width - newWidth);
          break;
        case 'ne': // top-right
          newWidth = Math.min(maxWidth, Math.max(minWidth, startDimensions.current.width + deltaX));
          newHeight = Math.min(maxHeight, Math.max(minHeight, startDimensions.current.height - deltaY));
          newY = startDimensions.current.y + (startDimensions.current.height - newHeight);
          break;
        case 'nw': // top-left
          newWidth = Math.min(maxWidth, Math.max(minWidth, startDimensions.current.width - deltaX));
          newHeight = Math.min(maxHeight, Math.max(minHeight, startDimensions.current.height - deltaY));
          newX = startDimensions.current.x + (startDimensions.current.width - newWidth);
          newY = startDimensions.current.y + (startDimensions.current.height - newHeight);
          break;
        case 'e': // right
          newWidth = Math.min(maxWidth, Math.max(minWidth, startDimensions.current.width + deltaX));
          break;
        case 'w': // left
          newWidth = Math.min(maxWidth, Math.max(minWidth, startDimensions.current.width - deltaX));
          newX = startDimensions.current.x + (startDimensions.current.width - newWidth);
          break;
        case 's': // bottom
          newHeight = Math.min(maxHeight, Math.max(minHeight, startDimensions.current.height + deltaY));
          break;
        case 'n': // top
          newHeight = Math.min(maxHeight, Math.max(minHeight, startDimensions.current.height - deltaY));
          newY = startDimensions.current.y + (startDimensions.current.height - newHeight);
          break;
      }

      setDimensions({ width: newWidth, height: newHeight, x: newX, y: newY });
      onResize(newWidth, newHeight);
      onMove(newX, newY);
    }
  }, [isResizing, isDragging, resizeDirection, onResize, onMove, minWidth, minHeight, maxWidth, maxHeight]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setIsDragging(false);
    setResizeDirection('');
  }, []);

  useEffect(() => {
    if (isResizing || isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isDragging ? 'move' : 
        resizeDirection.includes('e') || resizeDirection.includes('w') ? 'ew-resize' :
        resizeDirection.includes('n') || resizeDirection.includes('s') ? 'ns-resize' :
        resizeDirection.includes('ne') || resizeDirection.includes('sw') ? 'nesw-resize' :
        resizeDirection.includes('nw') || resizeDirection.includes('se') ? 'nwse-resize' : 'default';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'default';
      };
    }
  }, [isResizing, isDragging, handleMouseMove, handleMouseUp, resizeDirection]);

  // Update dimensions when props change
  useEffect(() => {
    setDimensions({
      width: initialWidth,
      height: initialHeight,
      x: initialX,
      y: initialY
    });
  }, [initialWidth, initialHeight, initialX, initialY]);

  return {
    dimensions,
    isResizing,
    isDragging,
    handleMouseDown
  };
};