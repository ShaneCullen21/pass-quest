import React, { forwardRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Move, Type, PenTool, Calendar, CheckSquare } from "lucide-react";

interface ContractField {
  id: string;
  type: 'text' | 'signature' | 'date' | 'checkbox';
  position: { x: number; y: number };
  size: { width: number; height: number };
  clientId?: string;
  name: string;
  isRequired: boolean;
  placeholder?: string;
}

interface DocumentCanvasProps {
  fields: ContractField[];
  selectedTool: string | null;
  onAddField: (fieldType: string, position: { x: number; y: number }) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<ContractField>) => void;
  onFieldDelete: (fieldId: string) => void;
  clients: string[];
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
  ({ fields, selectedTool, onAddField, onFieldUpdate, onFieldDelete, clients }, ref) => {
    const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (!selectedTool) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      onAddField(selectedTool, { x, y });
    }, [selectedTool, onAddField]);

    const handleFieldMove = useCallback((fieldId: string, newPosition: { x: number; y: number }) => {
      onFieldUpdate(fieldId, { position: newPosition });
    }, [onFieldUpdate]);

    const renderField = (field: ContractField) => {
      const Icon = getFieldIcon(field.type);
      
      return (
        <div
          key={field.id}
          className="absolute border-2 border-primary bg-primary/10 rounded cursor-move group hover:border-primary/80"
          style={{
            left: field.position.x,
            top: field.position.y,
            width: field.size.width,
            height: field.size.height,
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = e.clientX - field.position.x;
            const startY = e.clientY - field.position.y;

            const handleMouseMove = (e: MouseEvent) => {
              const newX = e.clientX - startX;
              const newY = e.clientY - startY;
              handleFieldMove(field.id, { x: Math.max(0, newX), y: Math.max(0, newY) });
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
              <span className="text-xs font-medium text-primary truncate">
                {field.name}
              </span>
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
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      );
    };

    return (
      <Card className="h-full">
        <CardContent className="p-0 h-full">
          <div
            ref={ref}
            className={`relative w-full h-full min-h-[600px] bg-white border-2 border-dashed border-muted-foreground/20 rounded ${
              selectedTool ? 'cursor-crosshair' : 'cursor-default'
            }`}
            onClick={handleCanvasClick}
          >
            {/* Document placeholder */}
            {fields.length === 0 && !selectedTool && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="text-lg font-medium mb-2">Empty Document</div>
                  <p className="text-sm">
                    Select a field type from the toolbar and click here to add it
                  </p>
                </div>
              </div>
            )}

            {/* Render all fields */}
            {fields.map(renderField)}

            {/* Tool cursor indicator */}
            {selectedTool && (
              <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-medium">
                Click to place {selectedTool} field
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

DocumentCanvas.displayName = "DocumentCanvas";