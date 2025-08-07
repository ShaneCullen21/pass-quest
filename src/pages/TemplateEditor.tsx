import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldPalette } from "@/components/contracts/FieldPalette";
import { AdvancedTemplateEditor } from "@/components/ui/advanced-template-editor";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { FileText, Save, X, ArrowLeft, Edit, Eye, MoreHorizontal } from "lucide-react";
const TemplateEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    toast
  } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [documentSize, setDocumentSize] = useState<'a4' | 'letter' | 'legal'>('a4');
  const [templateType, setTemplateType] = useState<'master' | 'customized'>('master');
  const [masterTemplateId, setMasterTemplateId] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitle, setEditableTitle] = useState("");
  const {
    user
  } = useAuth();
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
          const {
            data,
            error
          } = await supabase.from('templates').select('*').eq('id', templateId).single();
          if (error) {
            console.error('Error fetching template:', error);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to load template"
            });
            return;
          }
          if (data) {
            setTitle(data.title);
            setEditableTitle(data.title);
            setDescription(data.description || '');
            setContent((data.template_data as any)?.content || '');
            setTemplateType(data.template_type as 'master' | 'customized' || 'master');
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
          const {
            data,
            error
          } = await supabase.from('templates').select('*').eq('id', masterId).single();
          if (error) {
            console.error('Error fetching master template:', error);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to load master template"
            });
            return;
          }
          if (data) {
            setContent((data.template_data as any)?.content || '');
            setTitle(`${data.title} (Customized)`);
            setEditableTitle(`${data.title} (Customized)`);
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
        description: "Please enter a title for your template."
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
        result = await supabase.from('templates').update(templateData).eq('id', templateId);
      } else {
        // Create new template
        result = await supabase.from('templates').insert(templateData);
      }
      if (result.error) {
        console.error('Error saving template:', result.error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save template. Please try again."
        });
        return;
      }
      toast({
        title: "Success",
        description: templateId ? "Template updated successfully!" : "Template created successfully!"
      });
      navigate('/templates');
    } catch (error) {
      console.error('Error in handleSave:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again."
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditTitle = () => {
    setEditableTitle(title);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
    if (editableTitle.trim()) {
      setTitle(editableTitle.trim());
    } else {
      setEditableTitle(title);
    }
    setIsEditingTitle(false);
  };

  const handleCancelEditTitle = () => {
    setEditableTitle(title);
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelEditTitle();
    }
  };

  const handleBack = () => {
    navigate('/templates');
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading template...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      

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
                  {isEditingTitle ? (
                    <Input
                      value={editableTitle}
                      onChange={(e) => setEditableTitle(e.target.value)}
                      onBlur={handleSaveTitle}
                      onKeyDown={handleTitleKeyDown}
                      className="text-lg font-semibold border-0 shadow-none p-0 h-auto bg-transparent focus-visible:ring-0"
                      autoFocus
                    />
                  ) : (
                    <h1 className="text-lg font-semibold">
                      {title || (templateType === 'master' ? 'New Master Template' : 'New Customized Template')}
                    </h1>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={handleEditTitle}
                  disabled={isEditingTitle}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <div className="ml-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border text-red-600 ${templateType === 'master' ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200'}`}>
                    {templateType === 'master' ? 'MASTER TEMPLATE' : 'CUSTOMIZED TEMPLATE'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleSave} disabled={saving} size="sm" className="h-8">
                {saving ? 'Saving...' : 'Save template'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="space-y-0">
          <div className="w-full">
            <AdvancedTemplateEditor content={content} onChange={setContent} onSave={handleSave} title={title || "Untitled Template"} isSaving={saving} placeholder="Start writing your template content..." />
          </div>
        </div>
      </div>
    </div>;
};
export default TemplateEditor;