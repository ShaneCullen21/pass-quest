import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { MoreHorizontal, Bell, Search, CircleHelp, User, LogOut, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogoutConfirmation } from "@/components/ui/logout-confirmation";
import { SortableTableHeader } from "@/components/ui/sortable-table-header";
import { TableLoading } from "@/components/ui/table-loading";
import { useTableSort } from "@/hooks/useTableSort";
import { useAuth } from "@/hooks/useAuth";
import { AddProjectModal } from "@/components/projects/AddProjectModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
const Projects = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
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

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    signOut();
    setShowLogoutDialog(false);
  };

  const fetchProjects = async () => {
    if (!user) return;
    
    setProjectsLoading(true);
    
    // Add minimum loading time to show the nice animation
    const [projectsData] = await Promise.all([
      supabase
        .from("projects")
        .select(`
          *,
          clients(name, company)
        `)
        .order("created_at", { ascending: false }),
      new Promise(resolve => setTimeout(resolve, 800)) // Minimum 800ms loading time
    ]);

    try {
      const { data, error } = projectsData;

      if (error) {
        console.error("Error fetching projects:", error);
        toast({
          title: "Error",
          description: "Failed to load projects. Please try again.",
          variant: "destructive"
        });
        return;
      }

      setProjects(data || []);
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
  };

  const formatDateRange = (startDate: string | null, endDate: string | null) => {
    if (!startDate && !endDate) return "No dates set";
    if (!startDate) return `Ends ${new Date(endDate!).toLocaleDateString()}`;
    if (!endDate) return `Starts ${new Date(startDate).toLocaleDateString()}`;
    
    const start = new Date(startDate).toLocaleDateString();
    const end = new Date(endDate).toLocaleDateString();
    return `${start} - ${end}`;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "on_hold":
        return "secondary";
      case "terminated":
        return "destructive";
      default:
        return "default";
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "active":
        return "ACTIVE";
      case "on_hold":
        return "ON HOLD";
      case "terminated":
        return "TERMINATED";
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
              
              <div className="flex items-center space-x-2 ml-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium">Emily</span>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  size="icon"
                  className="text-muted-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile User Actions */}
            <div className="sm:hidden flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                size="icon"
                className="text-muted-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
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

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">FILTER BY</span>
              <Select defaultValue="status">
                <SelectTrigger className="w-32 border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">SORT BY</span>
            <Select defaultValue="last-added">
              <SelectTrigger className="w-36 border-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-added">Last added</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          {projectsLoading ? (
            <TableLoading columns={["Project name", "Client(s)", "Status", "Location", "Project dates", "Actions"]} />
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
                    sortKey="dates" 
                    currentSortKey={sortConfig.key} 
                    sortDirection={sortConfig.direction}
                    onSort={handleSort}
                  >
                    Project dates
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
                        <span className="text-foreground font-medium underline decoration-primary cursor-pointer">
                          {project.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-foreground">
                            {project.clients?.name || "No client assigned"}
                          </span>
                          {project.clients?.company && (
                            <span className="text-muted-foreground text-sm">
                              ({project.clients.company})
                            </span>
                          )}
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
                        {formatDateRange(project.start_date, project.end_date)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
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
      
      <LogoutConfirmation 
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={confirmLogout}
      />
      
      <AddProjectModal
        open={showAddProjectModal}
        onOpenChange={setShowAddProjectModal}
        onProjectAdded={handleProjectAdded}
      />
    </div>;
};
export default Projects;