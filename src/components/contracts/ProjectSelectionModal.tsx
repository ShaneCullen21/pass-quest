import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Building, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { AddProjectModal } from "@/components/projects/AddProjectModal";

interface Project {
  id: string;
  name: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  status: string;
}

interface ProjectSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectSelect: (projectId: string) => void;
  templateId: string;
}

export const ProjectSelectionModal: React.FC<ProjectSelectionModalProps> = ({
  isOpen,
  onClose,
  onProjectSelect,
  templateId
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Remove the new project form state since we're using the existing modal

  useEffect(() => {
    if (isOpen && user) {
      fetchProjects();
    }
  }, [isOpen, user]);

  const fetchProjects = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load projects"
        });
        return;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Error in fetchProjects:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProjectAdded = async () => {
    setShowNewProjectModal(false);
    await fetchProjects(); // Refresh the projects list
    
    // Get the most recently created project and select it
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (!error && data) {
        setSelectedProjectId(data.id);
      }
    } catch (error) {
      console.error('Error selecting new project:', error);
    }
  };

  const handleProceed = () => {
    if (!selectedProjectId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a project"
      });
      return;
    }

    onProjectSelect(selectedProjectId);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Project for Document</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Projects */}
          <div>
                <Label className="text-base font-medium">Choose an existing project</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Select a project to associate this document with
                </p>

                {loading ? (
                  <div className="text-center py-8">Loading projects...</div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No projects found. Create a new project to continue.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {projects.map((project) => (
                      <Card 
                        key={project.id} 
                        className={`cursor-pointer transition-colors ${
                          selectedProjectId === project.id 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedProjectId(project.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div>
                                <h4 className="font-medium">{project.name}</h4>
                                {project.location && (
                                  <p className="text-sm text-muted-foreground">
                                    {project.location}
                                  </p>
                                )}
                                {(project.start_date || project.end_date) && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">
                                      {project.start_date && formatDate(project.start_date)}
                                      {project.start_date && project.end_date && ' - '}
                                      {project.end_date && formatDate(project.end_date)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

          {/* Create New Project Button */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowNewProjectModal(true)}
              className="w-full flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create New Project
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleProceed}
              disabled={!selectedProjectId}
            >
              Continue to Document Editor
            </Button>
          </div>
        </div>

        {/* Add Project Modal */}
        <AddProjectModal
          open={showNewProjectModal}
          onOpenChange={setShowNewProjectModal}
          onProjectAdded={handleProjectAdded}
        />
      </DialogContent>
    </Dialog>
  );
};
