import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Users, Save, Send, Palette, Edit3, Check, X } from "lucide-react";
import { format } from "date-fns";
import { DocumentDraggableField } from "@/components/contracts/DocumentDraggableField";
import { ReadOnlyDocumentViewer } from "@/components/contracts/ReadOnlyDocumentViewer";
import { ResizableField } from "@/components/contracts/ResizableField";
import { SignatureOrderModal } from "@/components/contracts/SignatureOrderModal";

interface Template {
  id: string;
  title: string;
  type?: string;
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
  first_name: string;
  last_name: string;
  email: string;
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
  const documentId = searchParams.get('documentId');
  const projectId = searchParams.get('projectId');
  const documentType = searchParams.get('type');

  const [template, setTemplate] = useState<Template | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [signingFields, setSigningFields] = useState<SigningField[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingDocument, setExistingDocument] = useState<any>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [isSendingSignature, setIsSendingSignature] = useState(false);
  const [clientColors, setClientColors] = useState<{ [clientId: string]: string }>({});
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitle, setEditableTitle] = useState("");
  const isEditingMode = !!documentId;

  useEffect(() => {
    if ((!templateId && !documentId) || !projectId || !user) {
      navigate('/templates?tab=customized');
      return;
    }

    fetchData();
  }, [templateId, documentId, projectId, user, navigate]);

  const fetchData = async () => {
    if ((!templateId && !documentId) || !projectId || !user) return;

    setLoading(true);
    try {
      let templateData = null;
      
      if (isEditingMode && documentId) {
        // Load existing document from documents table
        const { data: document, error: documentError } = await supabase
          .from('documents')
          .select('*')
          .eq('id', documentId)
          .eq('user_id', user.id)
          .single();

        if (documentError) {
          console.error('Error fetching document:', documentError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Document not found"
          });
          navigate('/templates?tab=customized');
          return;
        }
        
        setExistingDocument(document);
        
        // If document has content, use it; otherwise create basic content
        let documentContent;
        let content;
        
        try {
          // Parse the JSON string from database
          documentContent = typeof document.document_content === 'string' 
            ? JSON.parse(document.document_content) 
            : document.document_content;
          content = documentContent?.content || 
                   `<h1>${document.title}</h1><p>${document.description || 'Document content'}</p>`;
        } catch (e) {
          console.error('Error parsing document content:', e);
          content = `<h1>${document.title}</h1><p>${document.description || 'Document content'}</p>`;
        }
        
        templateData = {
          id: document.id,
          title: document.title,
          template_data: { content }
        };

        // Load existing signing fields if any
        try {
          const fieldData = typeof document.field_data === 'string' 
            ? JSON.parse(document.field_data) 
            : document.field_data;
          console.log('Parsed field data:', fieldData);
          if (fieldData?.signing_fields) {
            console.log('Setting signing fields:', fieldData.signing_fields);
            setSigningFields(fieldData.signing_fields);
          }
        } catch (e) {
          console.error('Error parsing field data:', e);
        }
      } else if (templateId) {
        // Fetch template for new document
        const { data: template, error: templateError } = await supabase
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
        
        templateData = template;
      } else {
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
        type: templateData.type,
        template_data: templateData.template_data as { content: string } | null
      });
      setProject(projectData);
      setClients(clientsData);
      setEditableTitle(templateData.title);
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
    return client ? `${client.first_name} ${client.last_name}` : 'Unknown Client';
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const statusMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      completed: "secondary",
      draft: "outline",
      sent: "default",
      accepted: "secondary",
      rejected: "destructive",
      terminated: "destructive",
      paid: "secondary",
    };
    return statusMap[status] || "outline";
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'proposal':
        return 'bg-template-proposal/10 text-template-proposal border-template-proposal/20';
      case 'contract':
        return 'bg-template-contract/10 text-template-contract border-template-contract/20';
      case 'invoice':
        return 'bg-template-invoice/10 text-template-invoice border-template-invoice/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const handleEditTitle = () => {
    setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
    if (editableTitle.trim() && template) {
      setTemplate({ ...template, title: editableTitle.trim() });
      setIsEditingTitle(false);
    }
  };

  const handleCancelEditTitle = () => {
    setEditableTitle(template?.title || "");
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelEditTitle();
    }
  };

  const handleSave = async () => {
    if (!template || !project) return;

    setSaving(true);
    try {
      const fieldDataJson = { signing_fields: signingFields } as any;
      const documentContentJson = template.template_data as any;
      let documentId = existingDocument?.id;
      
      if (isEditingMode && existingDocument) {
        // Update existing document
        const { error: updateError } = await supabase
          .from('documents')
          .update({
            title: template.title,
            description: `Document created from template: ${template.title}`,
            document_content: documentContentJson,
            field_data: fieldDataJson,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingDocument.id);

        if (updateError) {
          console.error('Error updating document:', updateError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to save document"
          });
          return;
        }

        // Update existingDocument state with new updated_at
        setExistingDocument({ ...existingDocument, title: template.title, updated_at: new Date().toISOString() });
        documentId = existingDocument.id;
      } else {
        // Create new document
        const { data: documentData, error: documentError } = await supabase
          .from('documents')
          .insert({
            title: template.title,
            description: `Document created from template: ${template.title}`,
            project_id: project.id,
            template_id: template.id,
            user_id: user?.id,
            type: documentType || template.type?.toLowerCase() || 'contract',
            status: 'draft',
            document_content: documentContentJson,
            field_data: fieldDataJson
          })
          .select()
          .single();

        if (documentError) {
          console.error('Error creating document:', documentError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to save document"
          });
          return;
        }

        setExistingDocument(documentData);
        documentId = documentData.id;
      }

      if (documentId) {
        // Save signing fields to document_fields table
        if (signingFields.length > 0) {
          // Delete existing fields for this document
          await supabase
            .from('document_fields')
            .delete()
            .eq('document_id', documentId);

          // Insert new fields
          const fieldsToInsert = signingFields.map(field => ({
            document_id: documentId,
            client_id: field.clientId,
            field_type: field.type,
            field_name: field.type,
            position_x: field.position.x,
            position_y: field.position.y,
            width: field.width,
            height: field.height,
            is_required: true,
            placeholder: `${field.type} field`
          }));

          const { error: fieldsError } = await supabase
            .from('document_fields')
            .insert(fieldsToInsert);

          if (fieldsError) {
            console.error('Error saving document fields:', fieldsError);
          }
        }

        // Save client relationships to document_clients table
        const uniqueClientIds = [...new Set(signingFields.map(field => field.clientId))];
        if (uniqueClientIds.length > 0) {
          // Delete existing client relationships for this document
          await supabase
            .from('document_clients')
            .delete()
            .eq('document_id', documentId);

          // Insert new client relationships
          const clientsToInsert = uniqueClientIds.map(clientId => ({
            document_id: documentId,
            client_id: clientId,
            role: 'signatory'
          }));

          const { error: clientsError } = await supabase
            .from('document_clients')
            .insert(clientsToInsert);

          if (clientsError) {
            console.error('Error saving document clients:', clientsError);
          }
        }
      }

      toast({
        title: "Success",
        description: "Document saved successfully!"
      });

      // Navigate back to project details
      navigate(`/projects/${project.id}`);
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

  const handleSendForSignature = () => {
    if (clients.length < 2) {
      toast({
        variant: "destructive",
        title: "Insufficient Clients",
        description: "You need at least 2 clients to send for signature.",
      });
      return;
    }
    setShowSignatureModal(true);
  };

  const handleConfirmSendSignature = async (firstSignerId: string, secondSignerId: string) => {
    setIsSendingSignature(true);
    try {
      // Save document first to ensure it's up to date
      await handleSave();

      const { data, error } = await supabase.functions.invoke('send-signature-email', {
        body: {
          documentId: existingDocument?.id || 'new',
          firstSignerId,
          secondSignerId,
          documentTitle: template?.title || 'Untitled Document'
        }
      });

      if (error) throw error;

      toast({
        title: "Signature Request Sent!",
        description: "The first signer will receive an email with the signing link.",
      });

      setShowSignatureModal(false);
      navigate(`/projects/${project?.id}`);

    } catch (error: any) {
      console.error('Error sending signature request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send signature request",
      });
    } finally {
      setIsSendingSignature(false);
    }
  };

  const handleBack = () => {
    if (project) {
      navigate(`/projects/${project.id}`);
    } else {
      navigate('/templates?tab=customized');
    }
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
              <div className="flex flex-col group">
                {/* Editable Title */}
                <div className="flex items-center gap-2">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editableTitle}
                        onChange={(e) => setEditableTitle(e.target.value)}
                        onKeyDown={handleTitleKeyDown}
                        onBlur={handleSaveTitle}
                        className="text-lg font-semibold h-8 px-2 py-1 min-w-[200px]"
                        autoFocus
                      />
                      <Button variant="ghost" size="sm" onClick={handleSaveTitle} className="h-6 w-6 p-0">
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleCancelEditTitle} className="h-6 w-6 p-0">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg font-semibold">{template.title}</h1>
                      <Button variant="ghost" size="sm" onClick={handleEditTitle} className="h-6 w-6 p-0">
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Type and Status Tags */}
                  <div className="flex items-center gap-2 ml-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getTypeColor(existingDocument?.type || documentType || template.type?.toLowerCase() || 'contract')}`}>
                      {(existingDocument?.type || documentType || template.type || 'Contract').charAt(0).toUpperCase() + (existingDocument?.type || documentType || template.type || 'Contract').slice(1)}
                    </span>
                    <Badge variant={getStatusVariant(existingDocument?.status || 'draft')}>
                      {(existingDocument?.status || 'draft').charAt(0).toUpperCase() + (existingDocument?.status || 'draft').slice(1)}
                    </Badge>
                  </div>
                </div>
                
                {/* Last Updated Info */}
                <div className="text-sm text-muted-foreground">
                  Last updated: {existingDocument?.updated_at 
                    ? format(new Date(existingDocument.updated_at), "MMM dd, yyyy 'at' h:mm a")
                    : format(new Date(), "MMM dd, yyyy 'at' h:mm a")
                  }
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleSave} disabled={saving} variant="outline" size="sm" className="h-8">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button onClick={handleSendForSignature} disabled={saving} size="sm" className="h-8">
                <Send className="h-4 w-4 mr-2" />
                Send for Signature
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
                            <div className="font-medium">{client.first_name} {client.last_name}</div>
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
                
                {/* Color Picker for Selected Client */}
                {selectedClientId && (
                  <div className="mt-4 pt-4 border-t">
                    <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Field Color
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { color: '#ef4444', name: 'Red' },
                        { color: '#f97316', name: 'Orange' },
                        { color: '#eab308', name: 'Yellow' },
                        { color: '#22c55e', name: 'Green' },
                        { color: '#3b82f6', name: 'Blue' },
                        { color: '#a855f7', name: 'Purple' },
                        { color: '#ec4899', name: 'Pink' },
                        { color: '#6b7280', name: 'Gray' }
                      ].map(({ color, name }) => (
                        <button
                          key={color}
                          onClick={() => setClientColors(prev => ({ ...prev, [selectedClientId]: color }))}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            clientColors[selectedClientId] === color
                              ? 'border-primary shadow-md scale-110'
                              : 'border-border hover:border-primary/50'
                          }`}
                          style={{ backgroundColor: color }}
                          title={name}
                        />
                      ))}
                    </div>
                  </div>
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
                    color={clientColors[selectedClientId]}
                  />
                  <DocumentDraggableField
                    fieldType="signature"
                    label="Signature Field"
                    onDrop={handleFieldDrop}
                    color={clientColors[selectedClientId]}
                  />
                  <DocumentDraggableField
                    fieldType="date"
                    label="Date Field"
                    onDrop={handleFieldDrop}
                    color={clientColors[selectedClientId]}
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
                <div className="document-drop-zone relative overflow-visible group">
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
                         clientId={field.clientId}
                         position={field.position}
                         width={field.width}
                         height={field.height}
                         onMove={handleFieldMove}
                         onResize={handleFieldResize}
                         onDelete={handleFieldDelete}
                         color={clientColors[field.clientId]}
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

        <SignatureOrderModal
          isOpen={showSignatureModal}
          onClose={() => setShowSignatureModal(false)}
          clients={clients}
          onSendForSignature={handleConfirmSendSignature}
          isLoading={isSendingSignature}
        />
      </div>
    </div>
  );
};

export default DocumentEditor;