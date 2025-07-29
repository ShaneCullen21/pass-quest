import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Type, PenTool, Calendar, CheckSquare } from "lucide-react";

interface FieldToolbarProps {
  selectedTool: string | null;
  onToolSelect: (tool: string | null) => void;
  clients: string[];
}

const fieldTypes = [
  {
    id: 'text',
    label: 'Text Field',
    icon: Type,
    description: 'Add a text input field',
  },
  {
    id: 'signature',
    label: 'Signature',
    icon: PenTool,
    description: 'Add a signature field',
  },
  {
    id: 'date',
    label: 'Date Field',
    icon: Calendar,
    description: 'Add a date picker field',
  },
  {
    id: 'checkbox',
    label: 'Checkbox',
    icon: CheckSquare,
    description: 'Add a checkbox field',
  },
];

export const FieldToolbar = ({
  selectedTool,
  onToolSelect,
  clients,
}: FieldToolbarProps) => {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-sm">Field Types</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {fieldTypes.map((fieldType) => {
          const Icon = fieldType.icon;
          const isSelected = selectedTool === fieldType.id;
          
          return (
            <Button
              key={fieldType.id}
              variant={isSelected ? "default" : "outline"}
              className="w-full justify-start h-auto p-3"
              onClick={() => onToolSelect(isSelected ? null : fieldType.id)}
            >
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <div className="font-medium text-sm">{fieldType.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {fieldType.description}
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
        
        {selectedTool && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              Click on the document to place the field
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onToolSelect(null)}
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};