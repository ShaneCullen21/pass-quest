import React, { forwardRef, useCallback, useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Move, Type, PenTool, Calendar, CheckSquare, ZoomIn, ZoomOut, Grid, RotateCcw, RotateCw } from "lucide-react";
import { PDFViewer } from "./PDFViewer";

interface ContractField {
  id: string;
  type: 'text' | 'signature' | 'date' | 'checkbox';
  position: { x: number; y: number };
  size: { width: number; height: number };
  clientId?: string;
  name: string;
  isRequired: boolean;
  placeholder?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  styling?: {
    fontSize?: number;
    fontWeight?: string;
    borderWidth?: number;
    borderColor?: string;
  };
}

interface DocumentCanvasProps {
  fields: ContractField[];
  selectedTool: string | null;
  onAddField: (fieldType: string, position: { x: number; y: number }) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<ContractField>) => void;
  onFieldDelete: (fieldId: string) => void;
  onFieldClick?: (field: ContractField) => void;
  clients: { id: string; name: string; company?: string; }[];
  documentUrl?: string;
  showGrid?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
}

const getFieldIcon = (type: string) => {
  switch (type) {
    case 'text':
      return Type;
    case 'signature':
      return PenTool;
    case 'date':
      return Calendar;
    case 'checkbox':
      return CheckSquare;
    default:
      return Type;
  }
};

export const DocumentCanvas = forwardRef<HTMLDivElement, DocumentCanvasProps>(
  ({ 
    fields, 
    selectedTool, 
    onAddField, 
    onFieldUpdate, 
    onFieldDelete, 
    onFieldClick,
    clients, 
    documentUrl,
    showGrid = false,
    snapToGrid = false,
    gridSize = 20
  }, ref) => {
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
    const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
    const canvasRef = useRef<HTMLDivElement>(null);
    // Snap position to grid
    const snapPosition = useCallback((x: number, y: number) => {
      if (!snapToGrid) return { x, y };
      return {
        x: Math.round(x / gridSize) * gridSize,
        y: Math.round(y / gridSize) * gridSize,
      };
    }, [snapToGrid, gridSize]);

    const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (!selectedTool || isPanning) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      
      const snappedPos = snapPosition(x, y);
      onAddField(selectedTool, snappedPos);
    }, [selectedTool, onAddField, isPanning, pan, zoom, snapPosition]);

    const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button === 1 || (e.button === 0 && e.ctrlKey)) { // Middle mouse or Ctrl+Click for panning
        e.preventDefault();
        setIsPanning(true);
        setLastPanPoint({ x: e.clientX, y: e.clientY });
      }
    }, []);

    const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (isPanning) {
        const deltaX = e.clientX - lastPanPoint.x;
        const deltaY = e.clientY - lastPanPoint.y;
        setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
        setLastPanPoint({ x: e.clientX, y: e.clientY });
      }
    }, [isPanning, lastPanPoint]);

    const handleCanvasMouseUp = useCallback(() => {
      setIsPanning(false);
    }, []);

    const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        const newZoom = Math.min(Math.max(0.1, zoom + delta), 3);
        setZoom(newZoom);
      }
    }, [zoom]);

    const handleFieldMove = useCallback((fieldId: string, newPosition: { x: number; y: number }) => {
      const snappedPos = snapPosition(newPosition.x, newPosition.y);
      onFieldUpdate(fieldId, { position: snappedPos });
    }, [onFieldUpdate, snapPosition]);

    const handleFieldClick = useCallback((field: ContractField, e: React.MouseEvent) => {
      e.stopPropagation();
      
      if (e.ctrlKey || e.metaKey) {
        // Multi-select
        setSelectedFields(prev => {
          const newSet = new Set(prev);
          if (newSet.has(field.id)) {
            newSet.delete(field.id);
          } else {
            newSet.add(field.id);
          }
          return newSet;
        });
      } else {
        // Single select
        setSelectedFields(new Set([field.id]));
        if (onFieldClick) {
          onFieldClick(field);
        }
      }
    }, [onFieldClick]);

    const handleFieldResize = useCallback((fieldId: string, newSize: { width: number; height: number }) => {
      onFieldUpdate(fieldId, { size: newSize });
    }, [onFieldUpdate]);

    const renderField = (field: ContractField) => {
      const Icon = getFieldIcon(field.type);
      const isSelected = selectedFields.has(field.id);
      const clientName = field.clientId ? clients.find(c => c.id === field.clientId)?.name : '';
      
      return (
        <div
          key={field.id}
          className={`absolute border-2 rounded cursor-move group transition-colors ${
            isSelected 
              ? 'border-primary bg-primary/20 shadow-lg' 
              : 'border-primary/40 bg-primary/5 hover:border-primary/80'
          }`}
          style={{
            left: field.position.x * zoom + pan.x,
            top: field.position.y * zoom + pan.y,
            width: field.size.width * zoom,
            height: field.size.height * zoom,
            fontSize: `${(field.styling?.fontSize || 14) * zoom}px`,
            fontWeight: field.styling?.fontWeight || 'normal',
            borderWidth: `${(field.styling?.borderWidth || 1) * zoom}px`,
            borderColor: field.styling?.borderColor || 'hsl(var(--primary))',
          }}
          onClick={(e) => handleFieldClick(field, e)}
          onMouseDown={(e) => {
            if (e.button !== 0) return; // Only left click
            e.preventDefault();
            e.stopPropagation();
            
            const startX = e.clientX;
            const startY = e.clientY;
            const startPos = { ...field.position };

            const handleMouseMove = (e: MouseEvent) => {
              const deltaX = (e.clientX - startX) / zoom;
              const deltaY = (e.clientY - startY) / zoom;
              const newX = Math.max(0, startPos.x + deltaX);
              const newY = Math.max(0, startPos.y + deltaY);
              handleFieldMove(field.id, { x: newX, y: newY });
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        >
          <div className="flex items-center justify-between h-full px-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Icon className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-xs font-medium text-primary truncate">
                  {field.name}
                </span>
                {clientName && (
                  <span className="text-xs text-primary/60 truncate">
                    {clientName}
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onFieldDelete(field.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Field resize handles */}
          {isSelected && (
            <>
              <div 
                className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-se-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  const startX = e.clientX;
                  const startY = e.clientY;
                  const startSize = { ...field.size };

                  const handleMouseMove = (e: MouseEvent) => {
                    const deltaX = (e.clientX - startX) / zoom;
                    const deltaY = (e.clientY - startY) / zoom;
                    const newWidth = Math.max(50, startSize.width + deltaX);
                    const newHeight = Math.max(20, startSize.height + deltaY);
                    handleFieldResize(field.id, { width: newWidth, height: newHeight });
                  };

                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };

                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />
              
              {/* Selection indicator */}
              <div className="absolute -top-2 -left-2 -right-2 -bottom-2 border border-primary/50 rounded pointer-events-none" />
            </>
          )}
        </div>
      );
    };

    const resetView = () => {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };

    return (
      <div className="h-full flex flex-col">
        {/* Canvas Controls */}
        <div className="flex items-center justify-between p-2 border-b bg-muted/20">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-2">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={resetView}>
              Reset View
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={showGrid ? "default" : "outline"}
              size="sm"
              onClick={() => {}}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {selectedFields.size > 0 && `${selectedFields.size} selected`}
            </span>
          </div>
        </div>

        <Card className="flex-1">
          <CardContent className="p-0 h-full">
            <div
              ref={canvasRef}
              className={`relative w-full h-full min-h-[600px] overflow-hidden ${
                selectedTool ? 'cursor-crosshair' : isPanning ? 'cursor-move' : 'cursor-default'
              }`}
              onClick={handleCanvasClick}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onWheel={handleWheel}
            >
              {/* Document background */}
              {documentUrl && (
                <div 
                  className="absolute inset-0"
                  style={{
                    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                    transformOrigin: 'top left',
                  }}
                >
                  {documentUrl.includes('.pdf') || (window as any).currentDocumentType === 'application/pdf' ? (
                    <PDFViewer url={documentUrl} className="w-full h-full" />
                  ) : (
                    <img 
                      src={documentUrl} 
                      alt="Contract document" 
                      className="w-full h-full object-contain"
                      draggable={false}
                    />
                  )}
                </div>
              )}
              {/* Grid overlay */}
              {showGrid && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, #000 1px, transparent 1px),
                      linear-gradient(to bottom, #000 1px, transparent 1px)
                    `,
                    backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
                    backgroundPosition: `${pan.x % (gridSize * zoom)}px ${pan.y % (gridSize * zoom)}px`,
                  }}
                />
              )}

              {/* Document background */}
              {!documentUrl && (
                <div className="absolute inset-0 bg-white border-2 border-dashed border-muted-foreground/20 rounded" />
              )}

              {/* Document placeholder */}
              {fields.length === 0 && !selectedTool && !documentUrl && (
                <div 
                  className="absolute flex items-center justify-center"
                  style={{
                    left: pan.x,
                    top: pan.y,
                    width: `${100 * zoom}%`,
                    height: `${100 * zoom}%`,
                  }}
                >
                  <div className="text-center text-muted-foreground">
                    <div className="text-lg font-medium mb-2">Empty Document</div>
                    <p className="text-sm">
                      Upload a document or select a field type from the toolbar and click here to add it
                    </p>
                  </div>
                </div>
              )}

              {/* Render all fields */}
              {fields.map(renderField)}

              {/* Tool cursor indicator */}
              {selectedTool && (
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-medium z-10">
                  Click to place {selectedTool} field
                </div>
              )}

              {/* Pan instruction */}
              <div className="absolute bottom-4 right-4 bg-muted/80 text-muted-foreground px-2 py-1 rounded text-xs z-10">
                Ctrl+Wheel to zoom • Ctrl+Click to pan
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
);

DocumentCanvas.displayName = "DocumentCanvas";