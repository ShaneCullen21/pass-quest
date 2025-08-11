import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NewTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  forceTemplateType?: 'master' | 'customized';
}

interface MasterTemplate {
  id: string;
  title: string;
}

export const NewTemplateModal: React.FC<NewTemplateModalProps> = ({ isOpen, onClose, forceTemplateType }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<'master' | 'customized' | null>(null);
  const [masterTemplateName, setMasterTemplateName] = useState('');
  const [selectedMasterTemplate, setSelectedMasterTemplate] = useState('');
  const [masterTemplates, setMasterTemplates] = useState<MasterTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (forceTemplateType) {
        setSelectedType(forceTemplateType);
        if (forceTemplateType === 'customized') {
          fetchMasterTemplates();
        }
      } else if (selectedType === 'customized') {
        fetchMasterTemplates();
      }
    }
  }, [isOpen, selectedType, forceTemplateType]);

  // Auto-skip to customized template selection for non-admin users
  useEffect(() => {
    if (isOpen && forceTemplateType === 'customized') {
      setSelectedType('customized');
      fetchMasterTemplates();
    }
  }, [isOpen, forceTemplateType]);

  const fetchMasterTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('id, title')
        .eq('template_type', 'master')
        .order('title');

      if (error) throw error;
      setMasterTemplates(data || []);
    } catch (error) {
      console.error('Error fetching master templates:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load master templates. Please try again.",
      });
    }
  };

  const handleCreate = async () => {
    if (selectedType === 'master') {
      if (!masterTemplateName.trim()) {
        toast({
          variant: "destructive",
          title: "Name Required",
          description: "Please enter a name for your master template.",
        });
        return;
      }
      navigate(`/templates/new?type=master&name=${encodeURIComponent(masterTemplateName)}`);
    } else if (selectedType === 'customized') {
      if (!selectedMasterTemplate) {
        toast({
          variant: "destructive",
          title: "Selection Required",
          description: "Please select a master template to customize.",
        });
        return;
      }
      navigate(`/templates/new?type=customized&masterId=${selectedMasterTemplate}`);
    }
    onClose();
  };

  const handleClose = () => {
    setSelectedType(null);
    setMasterTemplateName('');
    setSelectedMasterTemplate('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
        </DialogHeader>
        
        {!selectedType && !forceTemplateType ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
              onClick={() => setSelectedType('master')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Master Template
                </CardTitle>
                <CardDescription>
                  Create a new template from scratch that can be used as a base for customized templates.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
              onClick={() => setSelectedType('customized')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Copy className="h-5 w-5" />
                  Customized Template
                </CardTitle>
                <CardDescription>
                  Create a customized version of an existing master template.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {selectedType === 'master' && (
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  placeholder="Enter template name"
                  value={masterTemplateName}
                  onChange={(e) => setMasterTemplateName(e.target.value)}
                />
              </div>
            )}

            {selectedType === 'customized' && (
              <div className="space-y-2">
                <Label htmlFor="master-template">Select Template</Label>
                <Select value={selectedMasterTemplate} onValueChange={setSelectedMasterTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {masterTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-between pt-4">
              {!forceTemplateType && (
                <Button variant="outline" onClick={() => setSelectedType(null)}>
                  Back
                </Button>
              )}
              <Button onClick={handleCreate} disabled={loading} className={!forceTemplateType ? '' : 'ml-auto'}>
                Create
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};