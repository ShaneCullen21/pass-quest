import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldPalette } from "@/components/contracts/FieldPalette";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { FileText, Save, X, ArrowLeft, Edit, Eye, MoreHorizontal } from "lucide-react";


const TemplateEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('id');
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [documentSize, setDocumentSize] = useState<'a4' | 'letter' | 'legal'>('a4');
  const { user } = useAuth();

  const isEditMode = !!templateId;

  useEffect(() => {
    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);

  const fetchTemplate = async () => {
    if (!templateId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;

      if (data) {
        setTitle(data.title);
        setDescription(data.description || "");
        const templateData = data.template_data as any;
        setContent(templateData?.content || "");
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      toast.error('Failed to load template');
      navigate('/templates');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldDrop = (fieldName: string) => {
    const variableTag = `{{${fieldName}}}`;
    setContent(prev => prev + ` ${variableTag}`);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a template title");
      return;
    }

    if (!content.trim()) {
      toast.error("Please add some content to the template");
      return;
    }

    setSaving(true);

    try {
      const templateData = JSON.parse(JSON.stringify({
        content,
        created_at: new Date().toISOString(),
      }));

      if (isEditMode && templateId) {
        const { error } = await supabase
          .from('templates')
          .update({
            title: title.trim(),
            description: description.trim() || null,
            template_data: templateData,
          })
          .eq('id', templateId);

        if (error) throw error;

        toast.success("Template updated successfully");
      } else {
        const { error } = await supabase
          .from('templates')
          .insert({
            user_id: user?.id,
            title: title.trim(),
            description: description.trim() || null,
            template_data: templateData,
            category: 'contract',
          });

        if (error) throw error;

        toast.success("Template created successfully");
      }

      navigate('/templates');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} template`);
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
                <h1 className="text-lg font-semibold">
                  {title || (isEditMode ? 'Edit Template' : 'New Template')}
                </h1>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Edit className="h-3 w-3" />
                </Button>
                {isEditMode && (
                  <div className="ml-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      CUSTOMIZED TEMPLATE
                    </span>
                  </div>
                )}
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
                placeholder="Enter your contract template content here..."
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