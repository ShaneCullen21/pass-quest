import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Bell, Search, CircleHelp } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
const Projects = () => {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                
              </div>
              <Navigation />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-sm text-muted-foreground">
                Free trial expires in 14 days. <span className="text-primary underline cursor-pointer">Learn more</span>
              </div>
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <CircleHelp className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">E</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium">Emily</span>
              </div>
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
                <TableHead className="text-muted-foreground font-medium">DOCUMENT NAME</TableHead>
                <TableHead className="text-muted-foreground font-medium">CLIENTS</TableHead>
                <TableHead className="text-muted-foreground font-medium">STATUS</TableHead>
                <TableHead className="text-muted-foreground font-medium">LOCATION</TableHead>
                <TableHead className="text-muted-foreground font-medium">PROJECT DATE</TableHead>
                <TableHead className="text-muted-foreground font-medium">ACTIONS</TableHead>
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
    </div>;
};
export default Projects;