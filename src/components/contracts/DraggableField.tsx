import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  PenTool, 
  Clock, 
  Hash 
} from 'lucide-react';

const fieldIcons = {
  user: User,
  mail: Mail,
  phone: Phone,
  mapPin: MapPin,
  calendar: Calendar,
  dollarSign: DollarSign,
  signature: PenTool,
  clock: Clock,
  hash: Hash
};

interface Field {
  id: string;
  name: string;
  label: string;
  icon: keyof typeof fieldIcons;
  type: 'text' | 'email' | 'phone' | 'address' | 'date' | 'currency' | 'signature' | 'time' | 'number';
}

interface DraggableFieldProps {
  field: Field;
}

export const DraggableField: React.FC<DraggableFieldProps> = ({ field }) => {
  const Icon = fieldIcons[field.icon];

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(field));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <Card 
      className="cursor-grab active:cursor-grabbing transition-all hover:shadow-sm hover:border-primary/20"
      draggable
      onDragStart={handleDragStart}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{field.label}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {field.type}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};