import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Bell, Search, CircleHelp, Plus } from "lucide-react";

const Clients = () => {
  const clientProjects = [
    {
      projectName: "Mary and Brian wedding",
      client: "Sasha Sukhoruchko",
      status: "COMPLETED",
      statusVariant: "default" as const,
      startDate: "Jun 14, 2025",
      endDate: "Jul 14, 2025"
    },
    {
      projectName: "Dream Wedding 2025",
      client: "Sasha Sukhoruchko",
      status: "CONTRACT SENT FOR SIGNATURE",
      statusVariant: "default" as const,
      startDate: "Feb 20, 2025",
      endDate: "Apr 03, 2025"
    },
    {
      projectName: "30s Anniversary - Tom & Amy",
      client: "Martha Smith",
      status: "PROPOSAL APPROVED",
      statusVariant: "default" as const,
      startDate: "Feb 24, 2025",
      endDate: "Feb 24, 2025"
    },
    {
      projectName: "2-days photoshoot",
      client: "Holden Price",
      status: "CONTRACT DRAFTED",
      statusVariant: "secondary" as const,
      startDate: "Mar 04, 2025",
      endDate: "Mar 10, 2025"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
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
                  <span className="text-sm font-medium text-primary-foreground">E</span>
                </div>
                <span className="text-sm font-medium">Emily</span>
              </div>
            </div>

            {/* Mobile User Actions */}
            <div className="sm:hidden flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">E</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Clients</h1>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Add client
          </Button>
        </div>

        {/* Clients Table */}
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                <TableHead className="text-muted-foreground font-medium">Project name</TableHead>
                <TableHead className="text-muted-foreground font-medium">Client</TableHead>
                <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                <TableHead className="text-muted-foreground font-medium">Start date</TableHead>
                <TableHead className="text-muted-foreground font-medium">End date</TableHead>
                <TableHead className="text-muted-foreground font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientProjects.map((project, index) => (
                <TableRow key={index} className="border-b border-border hover:bg-muted/50">
                  <TableCell>
                    <span className="text-foreground font-medium">
                      {project.projectName}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-foreground">{project.client}</span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={project.statusVariant} 
                      className={
                        project.status === "COMPLETED" 
                          ? "bg-green-100 text-green-800 border-green-200" 
                          : project.status === "CONTRACT SENT FOR SIGNATURE" 
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200" 
                          : project.status === "PROPOSAL APPROVED" 
                          ? "bg-green-100 text-green-800 border-green-200" 
                          : "bg-gray-100 text-gray-800 border-gray-200"
                      }
                    >
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{project.startDate}</TableCell>
                  <TableCell className="text-muted-foreground">{project.endDate}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default Clients;