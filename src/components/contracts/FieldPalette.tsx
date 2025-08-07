import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DraggableField } from './DraggableField';

const defaultFields = [
  { id: 'client_name', name: 'client_name', label: 'Client Name', icon: 'user' as const, type: 'text' as const },
  { id: 'client_email', name: 'client_email', label: 'Client Email', icon: 'mail' as const, type: 'email' as const },
  { id: 'client_phone', name: 'client_phone', label: 'Client Phone', icon: 'phone' as const, type: 'phone' as const },
  { id: 'client_address', name: 'client_address', label: 'Client Address', icon: 'mapPin' as const, type: 'address' as const },
  { id: 'company_name', name: 'company_name', label: 'Company Name', icon: 'user' as const, type: 'text' as const },
  { id: 'contract_date', name: 'contract_date', label: 'Contract Date', icon: 'calendar' as const, type: 'date' as const },
  { id: 'start_date', name: 'start_date', label: 'Start Date', icon: 'calendar' as const, type: 'date' as const },
  { id: 'end_date', name: 'end_date', label: 'End Date', icon: 'calendar' as const, type: 'date' as const },
  { id: 'project_amount', name: 'project_amount', label: 'Project Amount', icon: 'dollarSign' as const, type: 'currency' as const },
  { id: 'hourly_rate', name: 'hourly_rate', label: 'Hourly Rate', icon: 'dollarSign' as const, type: 'currency' as const },
  { id: 'client_signature', name: 'client_signature', label: 'Client Signature', icon: 'signature' as const, type: 'signature' as const },
  { id: 'contractor_signature', name: 'contractor_signature', label: 'Contractor Signature', icon: 'signature' as const, type: 'signature' as const },
  { id: 'project_duration', name: 'project_duration', label: 'Project Duration', icon: 'clock' as const, type: 'time' as const },
  { id: 'project_number', name: 'project_number', label: 'Project Number', icon: 'hash' as const, type: 'number' as const },
];

export const FieldPalette = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Template Fields</CardTitle>
        <p className="text-xs text-muted-foreground">
          Drag fields into your template to create dynamic content
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Client Information</h4>
          {defaultFields.slice(0, 4).map((field) => (
            <DraggableField key={field.id} field={field} />
          ))}
        </div>
        
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contract Details</h4>
          {defaultFields.slice(4, 10).map((field) => (
            <DraggableField key={field.id} field={field} />
          ))}
        </div>
        
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Signatures & Misc</h4>
          {defaultFields.slice(10).map((field) => (
            <DraggableField key={field.id} field={field} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};