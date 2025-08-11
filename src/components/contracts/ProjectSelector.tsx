import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, FolderOpen, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { AddProjectModal } from "../projects/AddProjectModal";

interface Project {
  id: string;
  name: string;
  status: string;
  location: string | null;
  created_at: string;
}

interface ProjectSelectorProps {
  selectedProject: string | null;
  onProjectSelect: (projectId: string) => void;
  onBack: () => void;
}

export const ProjectSelector = ({ 
  selectedProject, 
  onProjectSelect, 
  onBack 
}: ProjectSelectorProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddProject, setShowAddProject] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProjectAdded = () => {
    fetchProjects();
    setShowAddProject(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'completed':
        return 'text-blue-600';
      case 'on-hold':
        return 'text-yellow-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">Select Project</h3>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowAddProject(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-8">
          <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {searchQuery ? "No projects match your search" : "No projects found"}
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setShowAddProject(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Project
          </Button>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id}
              className={`cursor-pointer transition-colors ${
                selectedProject === project.id 
                  ? 'bg-primary/5 border-primary' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => onProjectSelect(project.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold">{project.name}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className={`text-sm font-medium ${getStatusColor(project.status)}`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                      {project.location && (
                        <p className="text-sm text-muted-foreground">{project.location}</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created: {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddProjectModal
        open={showAddProject}
        onOpenChange={setShowAddProject}
        onProjectAdded={handleProjectAdded}
      />
    </div>
  );
};