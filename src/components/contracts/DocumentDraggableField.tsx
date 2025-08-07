import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Pen, Calendar } from "lucide-react";

interface DocumentDraggableFieldProps {
  fieldType: 'name' | 'signature' | 'date';
  label: string;
  onDrop: (fieldType: 'name' | 'signature' | 'date', position: { x: number; y: number }) => void;
  color?: string;
}

const fieldIcons = {
  name: FileText,
  signature: Pen,
  date: Calendar
};

const fieldColors = {
  name: "border-blue-200 bg-blue-50 text-blue-700",
  signature: "border-green-200 bg-green-50 text-green-700",
  date: "border-orange-200 bg-orange-50 text-orange-700"
};

export const DocumentDraggableField: React.FC<DocumentDraggableFieldProps> = ({
  fieldType,
  label,
  onDrop,
  color
}) => {
  const Icon = fieldIcons[fieldType];

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("fieldType", fieldType);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Handle drop on document area
    const documentArea = document.querySelector('.document-drop-zone');
    if (documentArea) {
      const rect = documentArea.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if the drop was within the document area
      if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        onDrop(fieldType, { x, y });
      }
    }
  };

  const customStyle = color ? {
    borderColor: color,
    backgroundColor: `${color}15`, // 15 is hex for low opacity
  } : {};

  return (
    <Card 
      className={`cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${!color ? fieldColors[fieldType] : 'border-2'}`}
      style={customStyle}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" style={color ? { color } : {}} />
          <span className="font-medium text-sm" style={color ? { color } : {}}>{label}</span>
        </div>
        <p className="text-xs opacity-75 mt-1" style={color ? { color } : {}}>
          Drag to document
        </p>
      </CardContent>
    </Card>
  );
};