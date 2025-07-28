import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Bell, Search, CircleHelp, User, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogoutConfirmation } from "@/components/ui/logout-confirmation";
import { useAuth } from "@/hooks/useAuth";
const Projects = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    signOut();
    setShowLogoutDialog(false);
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

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
  const projects = [{
    name: "Dream Wedding 2025",
    client: "Sasha Sukhoruchko",
    status: "CONTRACT SENT FOR SIGNATURE",
    statusVariant: "default" as const,
    location: "Chicago, IL",
    date: "Feb 20-Apr 03, 2025"
  }, {
    name: "30s Anniversary - Tom & Amy",
    client: "Martha Smith",
    status: "PROPOSAL APPROVED",
    statusVariant: "default" as const,
    location: "Missoula, MN",
    date: "Feb 24, 2025",
    hasNotification: true
  }, {
    name: "2-days photoshoot",
    client: "Holden Price",
    status: "CONTRACT DRAFTED",
    statusVariant: "secondary" as const,
    location: "TBC",
    date: "Mar 04-Mar 10, 2025",
    hasMultiple: true
  }];
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
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            CREATE PROJECT
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
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                <TableHead className="text-muted-foreground font-medium">Document name</TableHead>
                <TableHead className="text-muted-foreground font-medium">Clients</TableHead>
                <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                <TableHead className="text-muted-foreground font-medium">Location</TableHead>
                <TableHead className="text-muted-foreground font-medium">Project date</TableHead>
                <TableHead className="text-muted-foreground font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project, index) => <TableRow key={index} className="border-b border-border hover:bg-muted/50">
                  <TableCell>
                    <span className="text-foreground font-medium underline decoration-primary cursor-pointer">
                      {project.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="text-foreground">{project.client}</span>
                      {project.hasNotification && <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs px-1 py-0">
                          +1
                        </Badge>}
                      {project.hasMultiple && <Badge variant="secondary" className="bg-gray-100 text-gray-800 text-xs px-1 py-0">
                          +2
                        </Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={project.statusVariant} className={project.status === "CONTRACT SENT FOR SIGNATURE" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : project.status === "PROPOSAL APPROVED" ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{project.location}</TableCell>
                  <TableCell className="text-muted-foreground">{project.date}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>)}
            </TableBody>
          </Table>
        </div>
      </main>
      
      <LogoutConfirmation 
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={confirmLogout}
      />
    </div>;
};
export default Projects;