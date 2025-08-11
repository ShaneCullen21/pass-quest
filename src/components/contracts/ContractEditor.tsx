import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Type, PenTool, Calendar, CheckSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { FieldToolbar } from "./FieldToolbar";
import { DocumentCanvas } from "./DocumentCanvas";
import { FieldConfigModal } from "./FieldConfigModal";
import { DocumentUploadModal } from "./DocumentUploadModal";

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

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  company: string;
}

interface ContractEditorProps {
  contractData: {
    sourceType: "template" | "upload" | "blank" | null;
    templateId: string | null;
    documentUrl: string | null;
    selectedClients: string[];
    selectedProject: string | null;
    title: string;
    description: string;
  };
  onSave: () => void;
  onBack: () => void;
}

export const ContractEditor = ({
  contractData,
  onSave,
  onBack,
}: ContractEditorProps) => {
  const [title, setTitle] = useState(contractData.title);
  const [description, setDescription] = useState(contractData.description);
  const [fields, setFields] = useState<ContractField[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedField, setSelectedField] = useState<ContractField | null>(null);
  const [showFieldConfig, setShowFieldConfig] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | undefined>(contractData.documentUrl || undefined);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const { user } = useAuth();
  const canvasRef = useRef<HTMLDivElement>(null);

  // Fetch project clients
  useEffect(() => {
    const fetchProjectClients = async () => {
      if (!contractData.selectedProject) return;

      try {
        const { data: project } = await supabase
          .from('projects')
          .select('client_ids')
          .eq('id', contractData.selectedProject)
          .single();

        if (project?.client_ids && project.client_ids.length > 0) {
          const { data: projectClients } = await supabase
            .from('clients')
            .select('id, first_name, last_name, company')
            .in('id', project.client_ids);

          setClients(projectClients || []);
        }
      } catch (error) {
        console.error('Error fetching project clients:', error);
      }
    };

    fetchProjectClients();
  }, [contractData.selectedProject]);

  const handleAddField = useCallback((fieldType: string, position: { x: number; y: number }) => {
    const newField: ContractField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: fieldType as 'text' | 'signature' | 'date' | 'checkbox',
      position,
      size: { width: 200, height: 40 },
      name: `${fieldType}_${fields.length + 1}`,
      isRequired: false,
      placeholder: `Enter ${fieldType}...`,
    };

    setFields(prev => [...prev, newField]);
    setSelectedTool(null);
  }, [fields.length]);

  const handleFieldUpdate = useCallback((fieldId: string, updates: Partial<ContractField>) => {
    setFields(prev => prev.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  }, []);

  const handleFieldDelete = useCallback((fieldId: string) => {
    setFields(prev => prev.filter(field => field.id !== fieldId));
  }, []);

  const handleFieldClick = (field: ContractField) => {
    setSelectedField(field);
    setShowFieldConfig(true);
  };

  const handleDocumentUpload = (file: File, documentUrl: string, fileType: string) => {
    setDocumentUrl(documentUrl);
    // Store the file type for proper rendering
    (window as any).currentDocumentType = fileType;
  };

  const handleSaveContract = async () => {
    if (!title.trim()) {
      toast.error('Please enter a contract title');
      return;
    }

    if (!contractData.selectedProject) {
      toast.error('Please select a project');
      return;
    }

    setSaving(true);

    try {
      // Create the contract
      const { data: contract, error: contractError } = await supabase
        .from('contracts')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          project_id: contractData.selectedProject,
          user_id: user?.id,
          template_id: contractData.templateId,
          document_url: contractData.documentUrl,
          field_data: JSON.parse(JSON.stringify({ fields })),
          signing_status: 'draft',
        })
        .select()
        .single();

      if (contractError) throw contractError;

      // Add contract-client relationships
      if (contractData.selectedClients.length > 0) {
        const { error: clientsError } = await supabase
          .from('contract_clients')
          .insert(
            contractData.selectedClients.map(clientId => ({
              contract_id: contract.id,
              client_id: clientId,
              role: 'signatory',
            }))
          );

        if (clientsError) throw clientsError;
      }

      // Save contract fields
      if (fields.length > 0) {
        const { error: fieldsError } = await supabase
          .from('contract_fields')
          .insert(
            fields.map(field => ({
              contract_id: contract.id,
              client_id: field.clientId || null,
              field_type: field.type,
              field_name: field.name,
              position_x: field.position.x,
              position_y: field.position.y,
              width: field.size.width,
              height: field.size.height,
              is_required: field.isRequired,
              placeholder: field.placeholder,
            }))
          );

        if (fieldsError) throw fieldsError;
      }

      toast.success('Contract created successfully');
      onSave();
    } catch (error) {
      console.error('Error saving contract:', error);
      toast.error('Failed to save contract');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">Contract Editor</h3>
        </div>
        <Button onClick={handleSaveContract} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Contract'}
        </Button>
      </div>

      {/* Contract Details */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Contract Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter contract title..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter contract description..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[600px]">
        {/* Field Toolbar */}
        <div className="lg:col-span-1">
          <div className="flex flex-col gap-4">
            <FieldToolbar
              selectedTool={selectedTool}
              onToolSelect={setSelectedTool}
              clients={clients}
            />
            
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDocumentUpload(true)}
              >
                Upload Document
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
              >
                {showGrid ? 'Hide Grid' : 'Show Grid'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSnapToGrid(!snapToGrid)}
              >
                {snapToGrid ? 'Free Move' : 'Snap to Grid'}
              </Button>
            </div>
          </div>
        </div>

        {/* Document Canvas */}
        <div className="lg:col-span-3">
          <DocumentCanvas
            ref={canvasRef}
            fields={fields}
            selectedTool={selectedTool}
            onAddField={handleAddField}
            onFieldUpdate={handleFieldUpdate}
            onFieldDelete={handleFieldDelete}
            onFieldClick={handleFieldClick}
            clients={clients}
            documentUrl={documentUrl}
            showGrid={showGrid}
            snapToGrid={snapToGrid}
          />
        </div>
      </div>

      {/* Field Configuration Modal */}
      <FieldConfigModal
        isOpen={showFieldConfig}
        onClose={() => setShowFieldConfig(false)}
        field={selectedField}
        clients={clients}
        onSave={handleFieldUpdate}
      />

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={showDocumentUpload}
        onClose={() => setShowDocumentUpload(false)}
        onDocumentUpload={handleDocumentUpload}
      />
    </div>
  );
};