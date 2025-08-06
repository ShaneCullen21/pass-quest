import React from 'react';
import { Card } from '@/components/ui/card';
import { User, Calendar, FileSignature, Mail, Phone, MapPin, DollarSign, Clock, Hash } from 'lucide-react';

interface DraggableFieldProps {
  field: {
    id: string;
    name: string;
    label: string;
    icon: string;
    type: 'text' | 'date' | 'signature' | 'email' | 'phone' | 'address' | 'currency' | 'time' | 'number';
  };
}

const iconMap = {
  user: User,
  calendar: Calendar,
  signature: FileSignature,
  mail: Mail,
  phone: Phone,
  mapPin: MapPin,
  dollarSign: DollarSign,
  clock: Clock,
  hash: Hash,
};

export const DraggableField = ({ field }: DraggableFieldProps) => {
  const IconComponent = iconMap[field.icon as keyof typeof iconMap] || User;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(field));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <Card 
      className="p-3 cursor-grab active:cursor-grabbing hover:bg-muted/50 transition-colors border-dashed border-2 border-border hover:border-primary/50"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="flex items-center gap-2">
        <IconComponent className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{field.label}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        Drag to insert {`{{${field.name}}}`}
      </div>
    </Card>
  );
};