import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Plus,
  FileText,
  FileSignature,
  Receipt,
  Edit,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableLoading } from "@/components/ui/table-loading";
import { useTableSort } from "@/hooks/useTableSort";
import { SortableTableHeader } from "@/components/ui/sortable-table-header";
import { AddProjectModal } from "@/components/projects/AddProjectModal";
import { TemplateSelector } from "@/components/contracts/TemplateSelector";



interface Project {
  id: string;
  name: string;
  status: string;
  location: string | null;
  client_ids: string[];
  created_at: string;
}

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  company: string | null;
}

interface Document {
  id: string;
  title: string;
  amount: number | null;
  status: string;
  created_at: string;
  type: 'proposal' | 'contract' | 'invoice';
  due_date?: string | null;
}

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast: showToast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
  

  const { sortedData: sortedDocuments, sortConfig, handleSort } = useTableSort(documents);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (id) {
      fetchProjectDetails();
      fetchDocuments();
    }
  }, [user, id, navigate]);

  const fetchProjectDetails = async () => {
    try {
      setIsLoading(true);
      
      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (projectError) throw projectError;
      
      setProject(projectData);

      // Fetch clients if project has client_ids
      if (projectData.client_ids && projectData.client_ids.length > 0) {
        const { data: clientsData, error: clientsError } = await supabase
          .from("clients")
          .select("id, first_name, last_name, company")
          .in("id", projectData.client_ids);

        if (clientsError) throw clientsError;
        setClients(clientsData || []);
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
      showToast({
        title: "Error",
        description: "Failed to fetch project details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      setDocumentsLoading(true);
      
      // Fetch all documents from the new unified documents table
      const { data: documents, error: documentsError } = await supabase
        .from("documents")
        .select("*")
        .eq("project_id", id);

      if (documentsError) throw documentsError;

      // Transform to match the Document interface
      const allDocuments: Document[] = (documents || []).map(doc => ({
        ...doc,
        type: doc.type as 'proposal' | 'contract' | 'invoice'
      }));

      setDocuments(allDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
      showToast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      });
    } finally {
      setDocumentsLoading(false);
    }
  };

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
      overdue: "destructive"
    };
    return statusMap[status] || "outline";
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'proposal':
        return <FileText className="h-4 w-4" />;
      case 'contract':
        return <FileSignature className="h-4 w-4" />;
      case 'invoice':
        return <Receipt className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleProjectUpdated = () => {
    fetchProjectDetails();
    setIsEditModalOpen(false);
  };

  const handleContractCreated = () => {
    fetchDocuments();
  };

  const formatAmount = (amount: number | null) => {
    if (!amount) return "—";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;
    
    try {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentToDelete.id);

      if (error) throw error;

      toast("Document deleted successfully");
      setDocumentToDelete(null);
      fetchDocuments(); // Refresh the documents list
    } catch (error) {
      console.error("Error deleting document:", error);
      showToast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setIsTemplateSelectorOpen(false);
    navigate(`/contracts/document-editor?projectId=${id}&templateId=${templateId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-muted rounded mb-6"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-muted-foreground">Project not found</h1>
            <Button 
              onClick={() => navigate("/projects")} 
              className="mt-4"
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => navigate("/projects")} 
              variant="ghost" 
              size="sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
            <h1 className="text-3xl font-bold">{project.name}</h1>
          </div>
        </div>

        {/* Project Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Project Details</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-6">
              <div className="flex items-center space-x-2">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={getStatusVariant(project.status)}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date Created</p>
                  <p className="font-medium">
                    {format(new Date(project.created_at), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{project.location || "Not set"}</p>
                </div>
              </div>
            </div>

            {clients.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Clients</p>
                <div className="flex flex-wrap gap-2">
                  {clients.map((client) => (
                    <Badge key={client.id} variant="outline">
                      {client.first_name} {client.last_name} {client.company && `(${client.company})`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Documents</CardTitle>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setIsTemplateSelectorOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Document
                </Button>
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Proposal
                </Button>
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Invoice
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {documentsLoading ? (
              <TableLoading columns={["Type", "Title", "Amount", "Status", "Created", "Actions"]} rows={5} />
            ) : sortedDocuments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No documents found for this project</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Use the buttons above to add proposals, contracts, or invoices
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <SortableTableHeader
                      sortKey="title"
                      currentSortKey={sortConfig.key}
                      sortDirection={sortConfig.direction}
                      onSort={handleSort}
                    >
                      Title
                    </SortableTableHeader>
                    <SortableTableHeader
                      sortKey="amount"
                      currentSortKey={sortConfig.key}
                      sortDirection={sortConfig.direction}
                      onSort={handleSort}
                    >
                      Amount
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
                      sortKey="created_at"
                      currentSortKey={sortConfig.key}
                      sortDirection={sortConfig.direction}
                      onSort={handleSort}
                    >
                      Created
                    </SortableTableHeader>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDocuments.map((document) => (
                    <TableRow key={`${document.type}-${document.id}`}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getDocumentIcon(document.type)}
                          <span className="capitalize">{document.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{document.title}</TableCell>
                      <TableCell>{formatAmount(document.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(document.status)}>
                          {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(document.created_at), "MMM dd, yyyy")}
                      </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                // Navigate to document editor for all document types
                                navigate(`/contracts/document-editor?documentId=${document.id}&projectId=${id}`);
                              }}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setDocumentToDelete(document)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>


        {/* Edit Project Modal */}
        {project && (
          <AddProjectModal
            open={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            onProjectAdded={handleProjectUpdated}
            editProject={project}
          />
        )}

        {/* Template Selector Modal */}
        {isTemplateSelectorOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <TemplateSelector
                onTemplateSelect={handleTemplateSelect}
                onBack={() => setIsTemplateSelectorOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Delete Document Confirmation */}
        {documentToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-2">Delete Document</h3>
              <p className="text-muted-foreground mb-4">
                Are you sure you want to delete "{documentToDelete.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setDocumentToDelete(null)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteDocument}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}