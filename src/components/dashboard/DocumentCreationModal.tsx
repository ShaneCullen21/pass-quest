import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { AddProjectModal } from "@/components/projects/AddProjectModal";

interface Template {
  id: string;
  title: string;
  category: string;
  type: string;
  template_type: string;
  master_template_id?: string;
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
  preselectedTemplateId?: string;
  preselectedProjectId?: string;
}

export const DocumentCreationModal = ({ isOpen, onClose, documentType, preselectedTemplateId, preselectedProjectId }: DocumentCreationModalProps) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Proposal':
        return 'bg-template-proposal/10 text-template-proposal border-template-proposal/20';
      case 'Contract':
        return 'bg-template-contract/10 text-template-contract border-template-contract/20';
      case 'Invoice':
        return 'bg-template-invoice/10 text-template-invoice border-template-invoice/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };
  const [templates, setTemplates] = useState<Template[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && user) {
      fetchTemplatesAndProjects();
      // Set preselected template if provided
      if (preselectedTemplateId) {
        setSelectedTemplate(preselectedTemplateId);
      }
      // Set preselected project if provided
      if (preselectedProjectId) {
        setSelectedProject(preselectedProjectId);
      }
    }
  }, [isOpen, user, documentType, preselectedTemplateId, preselectedProjectId]);

  const fetchTemplatesAndProjects = async () => {
    setLoading(true);
    try {
      // Only fetch templates if no preselected template
      if (!preselectedTemplateId) {
        // Fetch all customized templates
        const { data: templatesData, error: templatesError } = await supabase
          .from('templates')
          .select('id, title, category, type, template_type, master_template_id')
          .eq('user_id', user?.id)
          .eq('template_type', 'customized');

        if (templatesError) throw templatesError;

        // Get unique master template IDs for customized templates
        const masterTemplateIds = templatesData
          ?.filter(t => t.template_type === 'customized' && t.master_template_id)
          .map(t => t.master_template_id) || [];

        // Fetch master template types
        let masterTemplatesMap: Record<string, { title: string; type: string }> = {};
        if (masterTemplateIds.length > 0) {
          const { data: masterTemplates, error: masterError } = await supabase
            .from('templates')
            .select('id, title, type')
            .in('id', masterTemplateIds);

          if (!masterError && masterTemplates) {
            masterTemplatesMap = masterTemplates.reduce((acc, template) => {
              acc[template.id] = { 
                title: template.title,
                type: template.type || 'Contract'
              };
              return acc;
            }, {} as Record<string, { title: string; type: string }>);
          }
        }

        // Combine the data and inherit type from master template for customized templates
        const templatesWithMasterInfo = templatesData?.map(template => {
          const masterInfo = template.master_template_id && masterTemplatesMap[template.master_template_id];
          return {
            ...template,
            // For customized templates, inherit type from master template
            type: template.template_type === 'customized' && masterInfo 
              ? masterInfo.type 
              : template.type || 'Contract'
          };
        }) || [];

        // Filter templates by document type
        const getTemplateTypeFromDocumentType = (docType: string) => {
          switch (docType) {
            case "proposal": return "Proposal";
            case "contract": return "Contract";
            case "invoice": return "Invoice";
            default: return "Contract";
          }
        };

        const targetType = getTemplateTypeFromDocumentType(documentType);
        const filteredTemplates = templatesWithMasterInfo.filter(template => 
          template.type === targetType
        );

        setTemplates(filteredTemplates as Template[]);
      }

      // Fetch user's projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, location')
        .eq('user_id', user?.id)
        .eq('status', 'active');

      if (projectsError) throw projectsError;

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
    const templateToUse = preselectedTemplateId || selectedTemplate;
    if (!templateToUse || !selectedProject) {
      toast({
        title: "Missing selection",
        description: "Please select both a template and a project",
        variant: "destructive",
      });
      return;
    }

    // Navigate to document editor with template and project
    navigate(`/document-editor?templateId=${templateToUse}&projectId=${selectedProject}&type=${documentType}`);
    onClose();
  };

  const handleClose = () => {
    if (!preselectedTemplateId) {
      setSelectedTemplate("");
    }
    if (!preselectedProjectId) {
      setSelectedProject("");
    }
    setShowAddProjectModal(false);
    onClose();
  };

  const handleProjectAdded = () => {
    setShowAddProjectModal(false);
    fetchTemplatesAndProjects(); // Refresh projects list
  };

  const getModalTitle = () => {
    if (preselectedTemplateId) {
      return "Create Document";
    }
    
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
              {!preselectedTemplateId && (
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
                            <div className="flex items-center justify-between w-full">
                              <span>{template.title}</span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ml-2 ${getTypeColor(template.type)}`}>
                                {template.type}
                              </span>
                            </div>
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
              )}

              {!preselectedProjectId && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Select Project</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddProjectModal(true)}
                      className="h-8 px-2 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      New Project
                    </Button>
                  </div>
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
              )}
            </>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={(!preselectedTemplateId && !selectedTemplate) || !selectedProject || loading}
          >
            Create {documentType.charAt(0).toUpperCase() + documentType.slice(1)}
          </Button>
        </div>
      </DialogContent>

      <AddProjectModal
        open={showAddProjectModal}
        onOpenChange={setShowAddProjectModal}
        onProjectAdded={handleProjectAdded}
      />
    </Dialog>
  );
};