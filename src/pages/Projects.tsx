import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Bell, Search, CircleHelp, Plus, Edit, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ProfileDropdown } from "@/components/ui/profile-dropdown";
import { SortableTableHeader } from "@/components/ui/sortable-table-header";
import { TableLoading } from "@/components/ui/table-loading";
import { useTableSort } from "@/hooks/useTableSort";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/contexts/ProfileContext";
import { AddProjectModal } from "@/components/projects/AddProjectModal";
import { DeleteProjectConfirmation } from "@/components/projects/DeleteProjectConfirmation";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type Project = Tables<"projects">;
const Projects = () => {
  const { user, loading, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  const PROJECTS_PER_PAGE = 6;
  const totalPages = Math.ceil(projects.length / PROJECTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
  const endIndex = startIndex + PROJECTS_PER_PAGE;
  const paginatedProjects = projects.slice(startIndex, endIndex);

  const { sortedData, sortConfig, handleSort } = useTableSort(paginatedProjects);

  // Reset to first page when projects data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [projects.length]);


  const fetchProjects = async () => {
    if (!user) return;
    
    setProjectsLoading(true);
    
    // Add minimum loading time to show the nice animation
    const [projectsData, clientsData] = await Promise.all([
      supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("clients")
        .select("id, first_name, last_name, company"),
      new Promise(resolve => setTimeout(resolve, 800)) // Minimum 800ms loading time
    ]);

    try {
      const { data: projects, error: projectsError } = projectsData;
      const { data: clients, error: clientsError } = clientsData;

      if (projectsError) {
        console.error("Error fetching projects:", projectsError);
        toast({
          title: "Error",
          description: "Failed to load projects. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (clientsError) {
        console.error("Error fetching clients:", clientsError);
      }

      // Create a lookup map for clients
      const clientsMap = new Map();
      if (clients) {
        clients.forEach(client => {
          clientsMap.set(client.id, client);
        });
      }

      // Attach client data to projects
      const projectsWithClients = (projects || []).map(project => ({
        ...project,
        clients: project.client_ids && project.client_ids.length > 0 
          ? project.client_ids.map(id => clientsMap.get(id)).filter(Boolean)
          : []
      }));

      setProjects(projectsWithClients);
    } catch (error) {
      console.error("Error processing projects:", error);
      toast({
        title: "Error",
        description: "Failed to process projects data.",
        variant: "destructive"
      });
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const handleProjectAdded = () => {
    fetchProjects(); // Refresh projects after adding
    setEditingProject(null); // Clear editing state
  };

  const handleDeleteProject = async () => {
    if (!deletingProject) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', deletingProject.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Project deleted successfully"
      });

      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingProject(null);
    }
  };

  const formatCreatedDate = (createdAt: string) => {
    return new Date(createdAt).toLocaleDateString();
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "destructive"; // red
      case "on_hold":
        return "outline"; // blue
      case "completed":
        return "default"; // green
      case "cancelled":
        return "secondary"; // grey
      default:
        return "default";
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "active":
        return "ACTIVE";
      case "on_hold":
        return "ON-HOLD";
      case "completed":
        return "COMPLETED";
      case "cancelled":
        return "CANCELLED";
      default:
        return status.toUpperCase();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Navigation />
            
            {/* Desktop User Actions */}
            <div className="hidden sm:flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <CircleHelp className="h-5 w-5" />
              </Button>
              
              <div className="ml-4">
                <ProfileDropdown />
              </div>
            </div>

            {/* Mobile User Actions */}
            <div className="sm:hidden">
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <Button 
            onClick={() => setShowAddProjectModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create project
          </Button>
        </div>


        {/* Projects Table */}
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          {projectsLoading ? (
            <TableLoading columns={["Project name", "Client(s)", "Status", "Location", "Date Created", "Actions"]} rows={6} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border">
                  <SortableTableHeader 
                    sortKey="name" 
                    currentSortKey={sortConfig.key} 
                    sortDirection={sortConfig.direction}
                    onSort={handleSort}
                  >
                    Project name
                  </SortableTableHeader>
                  <SortableTableHeader 
                    sortKey="clients" 
                    currentSortKey={sortConfig.key} 
                    sortDirection={sortConfig.direction}
                    onSort={handleSort}
                  >
                    Client(s)
                  </SortableTableHeader>
                  <SortableTableHeader 
                    sortKey="status" 
                    currentSortKey={sortConfig.key} 
                    sortDirection={sortConfig.direction}
                    onSort={handleSort}
                  >
                    Status
                  </SortableTableHeader>
                  <SortableTableHeader 
                    sortKey="location" 
                    currentSortKey={sortConfig.key} 
                    sortDirection={sortConfig.direction}
                    onSort={handleSort}
                  >
                    Location
                  </SortableTableHeader>
                  <SortableTableHeader 
                    sortKey="created_at" 
                    currentSortKey={sortConfig.key} 
                    sortDirection={sortConfig.direction}
                    onSort={handleSort}
                  >
                    Date Created
                  </SortableTableHeader>
                  <TableHead className="text-muted-foreground font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No projects found. Create your first project to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedData.map((project, index) => (
                    <TableRow key={project.id || index} className="border-b border-border hover:bg-muted/50">
                      <TableCell>
                        <button 
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="text-foreground font-medium underline decoration-primary cursor-pointer hover:text-primary transition-colors"
                        >
                          {project.name}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-foreground">
                            {project.clients && project.clients.length > 0 
                              ? project.clients.map(client => `${client.first_name} ${client.last_name}`).join(", ")
                              : "No client assigned"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(project.status)}>
                          {getStatusDisplay(project.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {project.location || "TBC"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatCreatedDate(project.created_at)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingProject(project)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeletingProject(project)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {!projectsLoading && projects.length > PROJECTS_PER_PAGE && (
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>
      
      <AddProjectModal
        open={showAddProjectModal || !!editingProject}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddProjectModal(false);
            setEditingProject(null);
          }
        }}
        editProject={editingProject}
        onProjectAdded={handleProjectAdded}
      />
      
      <DeleteProjectConfirmation
        open={!!deletingProject}
        onOpenChange={(open) => !open && setDeletingProject(null)}
        onConfirm={handleDeleteProject}
        projectName={deletingProject?.name || ""}
        projectId={deletingProject?.id || ""}
      />
    </div>;
};
export default Projects;