import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Users, Save } from "lucide-react";
import { DocumentDraggableField } from "@/components/contracts/DocumentDraggableField";
import { ReadOnlyDocumentViewer } from "@/components/contracts/ReadOnlyDocumentViewer";
import { ResizableField } from "@/components/contracts/ResizableField";

interface Template {
  id: string;
  title: string;
  template_data: {
    content: string;
  } | null;
}

interface Project {
  id: string;
  name: string;
  client_ids: string[];
}

interface Client {
  id: string;
  name: string;
  email?: string;
  company?: string;
}

interface SigningField {
  id: string;
  type: 'name' | 'signature' | 'date';
  clientId: string;
  position: { x: number; y: number };
  width: number;
  height: number;
}

const DocumentEditor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const templateId = searchParams.get('templateId');
  const projectId = searchParams.get('projectId');

  const [template, setTemplate] = useState<Template | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [signingFields, setSigningFields] = useState<SigningField[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!templateId || !projectId || !user) {
      navigate('/templates?tab=customized');
      return;
    }

    fetchData();
  }, [templateId, projectId, user, navigate]);

  const fetchData = async () => {
    if (!templateId || !projectId || !user) return;

    setLoading(true);
    try {
      // Fetch template
      const { data: templateData, error: templateError } = await supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .eq('user_id', user.id)
        .single();

      if (templateError) {
        console.error('Error fetching template:', templateError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Template not found"
        });
        navigate('/templates?tab=customized');
        return;
      }

      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (projectError) {
        console.error('Error fetching project:', projectError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Project not found"
        });
        navigate('/templates?tab=customized');
        return;
      }

      // Fetch clients for the project
      let clientsData: Client[] = [];
      if (projectData.client_ids && projectData.client_ids.length > 0) {
        const { data: clientsResponse, error: clientsError } = await supabase
          .from('clients')
          .select('*')
          .in('id', projectData.client_ids)
          .eq('user_id', user.id);

        if (clientsError) {
          console.error('Error fetching clients:', clientsError);
        } else {
          clientsData = clientsResponse || [];
        }
      }

      setTemplate({
        id: templateData.id,
        title: templateData.title,
        template_data: templateData.template_data as { content: string } | null
      });
      setProject(projectData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error in fetchData:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load document data"
      });
      navigate('/templates?tab=customized');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldDrop = (fieldType: 'name' | 'signature' | 'date', position: { x: number; y: number }) => {
    if (!selectedClientId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a client first"
      });
      return;
    }

    const newField: SigningField = {
      id: `${fieldType}-${selectedClientId}-${Date.now()}`,
      type: fieldType,
      clientId: selectedClientId,
      position,
      width: fieldType === 'signature' ? 200 : 150,
      height: fieldType === 'signature' ? 60 : 30
    };

    setSigningFields(prev => [...prev, newField]);
  };

  const handleFieldMove = (fieldId: string, newPosition: { x: number; y: number }) => {
    setSigningFields(prev => 
      prev.map(field => 
        field.id === fieldId 
          ? { ...field, position: newPosition }
          : field
      )
    );
  };

  const handleFieldResize = (fieldId: string, newWidth: number, newHeight: number) => {
    setSigningFields(prev => 
      prev.map(field => 
        field.id === fieldId 
          ? { ...field, width: newWidth, height: newHeight }
          : field
      )
    );
  };

  const handleFieldDelete = (fieldId: string) => {
    setSigningFields(prev => prev.filter(field => field.id !== fieldId));
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  const handleSave = async () => {
    if (!template || !project) return;

    setSaving(true);
    try {
      // Create contract record
      const fieldDataJson = JSON.stringify({ signing_fields: signingFields });
      const documentContentJson = JSON.stringify(template.template_data);
      
      const { data: contractData, error: contractError } = await supabase
        .from('contracts')
        .insert({
          title: `${template.title} - ${project.name}`,
          description: `Document created from template: ${template.title}`,
          project_id: project.id,
          template_id: template.id,
          user_id: user?.id,
          status: 'draft',
          document_content: documentContentJson,
          field_data: fieldDataJson
        })
        .select()
        .single();

      if (contractError) {
        console.error('Error creating contract:', contractError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save document"
        });
        return;
      }

      // Save signing fields
      if (signingFields.length > 0) {
        const fieldsToInsert = signingFields.map(field => ({
          contract_id: contractData.id,
          client_id: field.clientId,
          field_type: field.type,
          field_name: `${field.type}_${getClientName(field.clientId)}`,
          position_x: field.position.x,
          position_y: field.position.y,
          width: field.width,
          height: field.height,
          is_required: true
        }));

        const { error: fieldsError } = await supabase
          .from('contract_fields')
          .insert(fieldsToInsert);

        if (fieldsError) {
          console.error('Error saving fields:', fieldsError);
          toast({
            variant: "destructive",
            title: "Warning",
            description: "Document saved but fields may not have been saved properly"
          });
        }
      }

      toast({
        title: "Success",
        description: "Document created successfully!"
      });

      navigate(`/contracts/editor/${contractData.id}`);
    } catch (error) {
      console.error('Error in handleSave:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/templates?tab=customized');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading document editor...</p>
        </div>
      </div>
    );
  }

  if (!template || !project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBack} className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Document Editor</h1>
                <p className="text-sm text-muted-foreground">
                  {template.title} • {project.name}
                </p>
              </div>
              <Badge variant="secondary">Document Setup</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleSave} disabled={saving} size="sm" className="h-8">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Creating...' : 'Create Document'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Client Selection & Field Palette */}
          <div className="lg:col-span-1 space-y-6">
            {/* Client Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Select Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clients.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No clients in this project</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => navigate('/clients')}
                    >
                      Add Clients
                    </Button>
                  </div>
                ) : (
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          <div>
                            <div className="font-medium">{client.name}</div>
                            {client.company && (
                              <div className="text-xs text-muted-foreground">
                                {client.company}
                              </div>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </CardContent>
            </Card>

            {/* Field Palette */}
            {selectedClientId && (
              <Card>
                <CardHeader>
                  <CardTitle>Signing Fields</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Drag fields onto the document for {getClientName(selectedClientId)}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <DocumentDraggableField
                    fieldType="name"
                    label="Name Field"
                    onDrop={handleFieldDrop}
                  />
                  <DocumentDraggableField
                    fieldType="signature"
                    label="Signature Field"
                    onDrop={handleFieldDrop}
                  />
                  <DocumentDraggableField
                    fieldType="date"
                    label="Date Field"
                    onDrop={handleFieldDrop}
                  />
                </CardContent>
              </Card>
            )}

            {/* Active Fields Summary */}
            {signingFields.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Document Fields ({signingFields.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {signingFields.map(field => (
                      <div key={field.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {field.type}
                          </Badge>
                          <span className="text-sm font-medium">
                            {getClientName(field.clientId)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFieldDelete(field.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Document Area */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardContent className="p-0">
                <div className="document-drop-zone relative min-h-[800px] overflow-hidden group">
                  {/* Document Content (Read-only with same styling as template editor) */}
                  <ReadOnlyDocumentViewer 
                    content={template.template_data?.content || '<p>No content available</p>'}
                    className="h-full"
                  />

                  {/* Overlay for Field Positioning */}
                  <div className="absolute inset-0 pointer-events-auto z-10">
                    {signingFields.map(field => (
                      <ResizableField
                        key={field.id}
                        id={field.id}
                        type={field.type}
                        clientName={getClientName(field.clientId)}
                        position={field.position}
                        width={field.width}
                        height={field.height}
                        onMove={handleFieldMove}
                        onResize={handleFieldResize}
                        onDelete={handleFieldDelete}
                      />
                    ))}
                  </div>

                  {/* Drop Zone Instructions */}
                  {selectedClientId && signingFields.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 bg-white/80">
                      <div className="text-center text-muted-foreground">
                        <p className="text-lg font-medium">Drag signing fields onto the document</p>
                        <p className="text-sm">Select the field type from the sidebar and drag it to position</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;