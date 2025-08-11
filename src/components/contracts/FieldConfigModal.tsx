import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";

interface Client {
  id: string;
  first_name: string;
  last_name: string;
}

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

interface FieldConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  field: ContractField | null;
  clients: Client[];
  onSave: (fieldId: string, updates: Partial<ContractField>) => void;
}

export const FieldConfigModal: React.FC<FieldConfigModalProps> = ({
  isOpen,
  onClose,
  field,
  clients,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<ContractField>>({});

  useEffect(() => {
    if (field) {
      setFormData({
        name: field.name,
        clientId: field.clientId,
        isRequired: field.isRequired,
        placeholder: field.placeholder,
        validation: field.validation || {},
        styling: field.styling || { fontSize: 14, fontWeight: 'normal', borderWidth: 1 },
      });
    }
  }, [field]);

  const handleSave = () => {
    if (!field) return;
    
    onSave(field.id, formData);
    onClose();
  };

  const updateValidation = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      validation: {
        ...prev.validation,
        [key]: value,
      },
    }));
  };

  const updateStyling = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      styling: {
        ...prev.styling,
        [key]: value,
      },
    }));
  };

  if (!field) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Configure Field: {field.type}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Basic Settings</h3>
            
            <div className="space-y-2">
              <Label htmlFor="field-name">Field Name</Label>
              <Input
                id="field-name"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter field name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-assignment">Assign to Client</Label>
              <Select
                value={formData.clientId || 'none'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value === 'none' ? undefined : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="placeholder">Placeholder Text</Label>
              <Input
                id="placeholder"
                value={formData.placeholder || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, placeholder: e.target.value }))}
                placeholder="Enter placeholder text"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="required"
                checked={formData.isRequired || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRequired: checked }))}
              />
              <Label htmlFor="required">Required field</Label>
            </div>
          </div>

          <Separator />

          {/* Validation Rules */}
          {field.type === 'text' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Validation Rules</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-length">Min Length</Label>
                  <Input
                    id="min-length"
                    type="number"
                    min="0"
                    value={formData.validation?.minLength || ''}
                    onChange={(e) => updateValidation('minLength', parseInt(e.target.value) || undefined)}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-length">Max Length</Label>
                  <Input
                    id="max-length"
                    type="number"
                    min="1"
                    value={formData.validation?.maxLength || ''}
                    onChange={(e) => updateValidation('maxLength', parseInt(e.target.value) || undefined)}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pattern">Validation Pattern (Regex)</Label>
                <Input
                  id="pattern"
                  value={formData.validation?.pattern || ''}
                  onChange={(e) => updateValidation('pattern', e.target.value || undefined)}
                  placeholder="^[A-Za-z0-9]+$"
                />
              </div>
            </div>
          )}

          <Separator />

          {/* Styling Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Styling</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="font-size">Font Size (px)</Label>
                <Input
                  id="font-size"
                  type="number"
                  min="8"
                  max="72"
                  value={formData.styling?.fontSize || 14}
                  onChange={(e) => updateStyling('fontSize', parseInt(e.target.value) || 14)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="font-weight">Font Weight</Label>
                <Select
                  value={formData.styling?.fontWeight || 'normal'}
                  onValueChange={(value) => updateStyling('fontWeight', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                    <SelectItem value="lighter">Light</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="border-width">Border Width (px)</Label>
                <Input
                  id="border-width"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.styling?.borderWidth || 1}
                  onChange={(e) => updateStyling('borderWidth', parseInt(e.target.value) || 1)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="border-color">Border Color</Label>
                <Input
                  id="border-color"
                  type="color"
                  value={formData.styling?.borderColor || '#000000'}
                  onChange={(e) => updateStyling('borderColor', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};