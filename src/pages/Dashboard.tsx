import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/ui/navigation";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActionCard } from "@/components/dashboard/ActionCard";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, MoreHorizontal, Search, Bell, HelpCircle, User } from "lucide-react";

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

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

  const projectData = [
    {
      name: "Dream Wedding 2025",
      client: "Sasha Sukhoruchko",
      clientCount: "+2",
      status: "PROPOSAL APPROVED",
      statusVariant: "success",
      location: "Chicago, IL",
      date: "Feb 20-Apr 03, 2025"
    },
    {
      name: "30s Anniversary – Tom & Anny",
      client: "Martha Smith",
      clientCount: "+3",
      status: "CONTRACT SENT FOR SIGNATURE",
      statusVariant: "warning",
      location: "Missoula, MN",
      date: "Feb 24, 2025"
    },
    {
      name: "2-days photoshoot",
      client: "Holden Price",
      clientCount: "+1",
      status: "CONTRACT DRAFTED",
      statusVariant: "default",
      location: "TBC",
      date: "Mar 04-Mar 10, 2025"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
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
                <HelpCircle className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center space-x-2 ml-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium">Emily</span>
                <Button
                  variant="ghost"
                  onClick={signOut}
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
                onClick={signOut}
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-6">Welcome back, Emily!</h1>
          
          {/* Stats Section */}
          <div className="mb-8">
            <div className="flex items-baseline space-x-2 mb-4">
              <span className="text-muted-foreground">Gross invoice amount</span>
              <Button variant="outline" size="sm" className="text-xs">This week</Button>
            </div>
            <div className="text-4xl font-bold text-foreground mb-6">$2,400.00</div>
            
            <div className="flex items-center space-x-6">
              <StatsCard label="PAID" amount="$600.00" variant="paid" />
              <StatsCard label="DUE" amount="$1,000.00" variant="due" />
              <StatsCard label="PAST DUE" amount="$800.00" variant="pastdue" />
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">What would you like to do?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionCard type="proposal" />
            <ActionCard type="contract" />
            <ActionCard type="invoice" />
            <ActionCard type="flow" />
          </div>
        </div>

        {/* Latest Updates */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Latest updates</CardTitle>
              <Button variant="outline" size="sm">View all projects</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>DOCUMENT NAME</TableHead>
                  <TableHead>CLIENTS</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>LOCATION</TableHead>
                  <TableHead>PROJECT DATE</TableHead>
                  <TableHead className="w-12">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectData.map((project, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <button className="text-left font-medium hover:underline">
                        {project.name}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{project.client}</span>
                        <Badge variant="secondary" className="text-xs">
                          {project.clientCount}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={project.statusVariant === "success" ? "default" : 
                                project.statusVariant === "warning" ? "secondary" : "outline"}
                        className={project.statusVariant === "success" ? "bg-green-100 text-green-800 border-green-200" :
                                  project.statusVariant === "warning" ? "bg-yellow-100 text-yellow-800 border-yellow-200" : ""}
                      >
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;