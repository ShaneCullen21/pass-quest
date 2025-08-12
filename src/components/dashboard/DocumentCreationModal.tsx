import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Template {
  id: string;
  title: string;
  category: string;
}

interface Project {
  id: string;
  name: string;
  location?: string;
}

interface DocumentCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: "proposal" | "contract" | "invoice";
}

export const DocumentCreationModal = ({ isOpen, onClose, documentType }: DocumentCreationModalProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && user) {
      fetchTemplatesAndProjects();
    }
  }, [isOpen, user, documentType]);

  const fetchTemplatesAndProjects = async () => {
    setLoading(true);
    try {
      // Fetch customized templates that match the document type
      const { data: templatesData, error: templatesError } = await supabase
        .from('templates')
        .select('id, title, category')
        .eq('user_id', user?.id)
        .eq('template_type', 'customized')
        .ilike('title', `%${documentType}%`);

      if (templatesError) throw templatesError;

      // Fetch user's projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, location')
        .eq('user_id', user?.id)
        .eq('status', 'active');

      if (projectsError) throw projectsError;

      setTemplates(templatesData || []);
      setProjects(projectsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load templates and projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (!selectedTemplate || !selectedProject) {
      toast({
        title: "Missing selection",
        description: "Please select both a template and a project",
        variant: "destructive",
      });
      return;
    }

    // Navigate to document editor with template and project
    navigate(`/projects/${selectedProject}/document-editor?templateId=${selectedTemplate}&type=${documentType}`);
    onClose();
  };

  const handleClose = () => {
    setSelectedTemplate("");
    setSelectedProject("");
    onClose();
  };

  const getModalTitle = () => {
    switch (documentType) {
      case "proposal":
        return "Create New Proposal";
      case "contract":
        return "Create New Contract";
      case "invoice":
        return "Create New Invoice";
      default:
        return "Create New Document";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Template</label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Choose a ${documentType} template`} />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.length === 0 ? (
                      <SelectItem value="no-templates" disabled>
                        No {documentType} templates found
                      </SelectItem>
                    ) : (
                      templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {templates.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Create a customized {documentType} template first in the Templates section
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Project</label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.length === 0 ? (
                      <SelectItem value="no-projects" disabled>
                        No active projects found
                      </SelectItem>
                    ) : (
                      projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <div>
                            <div className="font-medium">{project.name}</div>
                            {project.location && (
                              <div className="text-xs text-muted-foreground">{project.location}</div>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {projects.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Create a project first in the Projects section
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={!selectedTemplate || !selectedProject || loading}
          >
            Create {documentType.charAt(0).toUpperCase() + documentType.slice(1)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};