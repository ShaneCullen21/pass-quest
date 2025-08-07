import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldPalette } from "@/components/contracts/FieldPalette";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { FileText, Save, X, ArrowLeft, Edit, Eye, MoreHorizontal } from "lucide-react";

const TemplateEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [documentSize, setDocumentSize] = useState<'a4' | 'letter' | 'legal'>('a4');
  const [templateType, setTemplateType] = useState<'master' | 'customized'>('master');
  const [masterTemplateId, setMasterTemplateId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTemplate = async () => {
      const searchParams = new URLSearchParams(location.search);
      const templateId = searchParams.get('id');
      const type = searchParams.get('type') as 'master' | 'customized';
      const masterId = searchParams.get('masterId');
      const name = searchParams.get('name');
      
      if (type) {
        setTemplateType(type);
      }
      
      if (masterId) {
        setMasterTemplateId(masterId);
      }
      
      if (name) {
        setTitle(name);
      }
      
      if (templateId) {
        // Editing existing template
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('templates')
            .select('*')
            .eq('id', templateId)
            .single();

          if (error) {
            console.error('Error fetching template:', error);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to load template",
            });
            return;
          }

          if (data) {
            setTitle(data.title);
            setDescription(data.description || '');
            setContent((data.template_data as any)?.content || '');
            setTemplateType((data.template_type as 'master' | 'customized') || 'master');
            setMasterTemplateId(data.master_template_id);
          }
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setLoading(false);
        }
      } else if (type === 'customized' && masterId) {
        // Creating customized template from master
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('templates')
            .select('*')
            .eq('id', masterId)
            .single();

          if (error) {
            console.error('Error fetching master template:', error);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to load master template",
            });
            return;
          }

          if (data) {
            setContent((data.template_data as any)?.content || '');
            setTitle(`${data.title} (Customized)`);
            setDescription(data.description || '');
          }
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTemplate();
  }, [location.search, toast]);

  const handleFieldDrop = (fieldName: string) => {
    const variableTag = `{{${fieldName}}}`;
    setContent(prev => prev + ` ${variableTag}`);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Title Required",
        description: "Please enter a title for your template.",
      });
      return;
    }

    setSaving(true);
    
    try {
      const searchParams = new URLSearchParams(location.search);
      const templateId = searchParams.get('id');
      
      const templateData = {
        title: title.trim(),
        description: description.trim(),
        template_data: {
          content,
          document_size: documentSize
        },
        template_type: templateType,
        master_template_id: masterTemplateId,
        user_id: user?.id
      };

      let result;
      if (templateId) {
        // Update existing template
        result = await supabase
          .from('templates')
          .update(templateData)
          .eq('id', templateId);
      } else {
        // Create new template
        result = await supabase
          .from('templates')
          .insert(templateData);
      }

      if (result.error) {
        console.error('Error saving template:', result.error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save template. Please try again.",
        });
        return;
      }

      toast({
        title: "Success",
        description: templateId ? "Template updated successfully!" : "Template created successfully!",
      });
      
      navigate('/templates');
    } catch (error) {
      console.error('Error in handleSave:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/templates');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <nav className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span className="text-foreground font-medium">HOME</span>
              <span>PROJECTS</span>
              <span className="text-foreground font-medium">TEMPLATES</span>
              <span>CLIENTS</span>
              <span>REPORTS</span>
            </nav>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Emily</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleBack} className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <div>
                  <h1 className="text-lg font-semibold">
                    {title || (templateType === 'master' ? 'New Master Template' : 'New Customized Template')}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {templateType === 'master' ? 'Master Template' : 'Customized Template'}
                    {templateType === 'customized' && ' (based on master template)'}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Edit className="h-3 w-3" />
                </Button>
                <div className="ml-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                    templateType === 'master' 
                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                      : 'bg-purple-50 text-purple-700 border-purple-200'
                  }`}>
                    {templateType === 'master' ? 'MASTER TEMPLATE' : 'CUSTOMIZED TEMPLATE'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8">
                <Eye className="h-4 w-4 mr-1" />
                PREVIEW
              </Button>
              <Button onClick={handleSave} disabled={saving} size="sm" className="h-8">
                {saving ? 'Saving...' : 'Save template'}
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="space-y-6">
          {/* Template Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Template Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter template title..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Field Palette */}
            <div className="space-y-4">
              <FieldPalette />
            </div>

            {/* Content Editor */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Template Content</Label>
                  <p className="text-xs text-muted-foreground">
                    Use variables like {`{{client_name}}`} to create dynamic content
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="document-size" className="text-sm">Document Size:</Label>
                  <Select value={documentSize} onValueChange={(value: 'a4' | 'letter' | 'legal') => setDocumentSize(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a4">A4</SelectItem>
                      <SelectItem value="letter">Letter</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Enter your template content here..."
                documentSize={documentSize}
                className="min-h-[600px]"
                onFieldDrop={handleFieldDrop}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;