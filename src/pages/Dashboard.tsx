import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/ui/navigation";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActionCard } from "@/components/dashboard/ActionCard";
import { ProfileDropdown } from "@/components/ui/profile-dropdown";
import { DocumentCreationModal } from "@/components/dashboard/DocumentCreationModal";
import { SortableTableHeader } from "@/components/ui/sortable-table-header";
import { useTableSort } from "@/hooks/useTableSort";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/contexts/ProfileContext";
import { supabase } from "@/integrations/supabase/client";
import { MoreHorizontal, Search, Bell, HelpCircle } from "lucide-react";
import { format } from "date-fns";

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<"proposal" | "contract" | "invoice">("proposal");
  const [documents, setDocuments] = useState<any[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);

  // All hooks must be called before any early returns
  const { sortedData, sortConfig, handleSort } = useTableSort(documents);

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const statusMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      completed: "secondary", 
      draft: "outline",
      sent: "default",
      accepted: "secondary",
      rejected: "destructive",
      terminated: "destructive",
      paid: "secondary",
      overdue: "destructive",
      "awaiting signatures": "default"
    };
    return statusMap[status] || "outline";
  };

  const fetchRecentDocuments = async () => {
    if (!user) return;
    
    setDocumentsLoading(true);
    try {
      const { data: docs, error } = await supabase
        .from('documents')
        .select(`
          id,
          title,
          status,
          updated_at,
          type,
          project_id,
          projects (
            id,
            name
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching documents:', error);
        setDocuments([]);
      } else {
        const enriched = (docs || []).map(d => ({
          ...d,
          project_name: d.projects?.name || null,
        }));

        setDocuments(enriched);
      }
    } catch (error) {
      console.error('Error in fetchRecentDocuments:', error);
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleActionCardClick = (type: "proposal" | "contract" | "invoice" | "flow") => {
    if (type === "flow") {
      // Handle flow differently if needed
      return;
    }
    setSelectedDocumentType(type);
    setModalOpen(true);
  };


  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (user) {
      fetchRecentDocuments();
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-6">
            Welcome back, {profileLoading ? 'Loading...' : (profile?.first_name || user?.email?.split('@')[0] || 'User')}!
          </h1>
          
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
            <ActionCard type="proposal" onClick={() => handleActionCardClick("proposal")} />
            <ActionCard type="contract" onClick={() => handleActionCardClick("contract")} />
            <ActionCard type="invoice" onClick={() => handleActionCardClick("invoice")} />
            <ActionCard type="flow" onClick={() => handleActionCardClick("flow")} />
          </div>
        </div>

        {/* Latest Updates */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Latest updates</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/projects">View all projects</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHeader 
                    sortKey="title" 
                    currentSortKey={sortConfig.key} 
                    sortDirection={sortConfig.direction}
                    onSort={handleSort}
                  >
                    Document name
                  </SortableTableHeader>
                  <SortableTableHeader 
                    sortKey="type" 
                    currentSortKey={sortConfig.key} 
                    sortDirection={sortConfig.direction}
                    onSort={handleSort}
                  >
                    Type
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
                    sortKey="project_name" 
                    currentSortKey={sortConfig.key} 
                    sortDirection={sortConfig.direction}
                    onSort={handleSort}
                  >
                    Project
                  </SortableTableHeader>
                  <SortableTableHeader 
                    sortKey="updated_at" 
                    currentSortKey={sortConfig.key} 
                    sortDirection={sortConfig.direction}
                    onSort={handleSort}
                  >
                    Last edited
                  </SortableTableHeader>
                  
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Loading recent documents...
                    </TableCell>
                  </TableRow>
                ) : sortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No documents found. Create your first document to get started!
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedData.map((document: any) => (
                    <TableRow key={document.id}>
                      <TableCell>
                        <Link 
                          to={`/document-editor?documentId=${document.id}&projectId=${document.project_id}`}
                          className="font-medium hover:underline text-primary"
                        >
                          {document.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{document.type}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(document.status)}>
                          {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {document.project_name ? (
                          <Link 
                            to={`/projects/${document.project_id}`}
                            className="hover:underline text-primary"
                          >
                            {document.project_name}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">No project</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(document.updated_at), "MMM dd, yyyy 'at' h:mm a")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* Document Creation Modal */}
      <DocumentCreationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        documentType={selectedDocumentType}
      />
    </div>
  );
};

export default Dashboard;