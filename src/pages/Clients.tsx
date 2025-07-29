import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Bell, Search, CircleHelp, Plus, User, LogOut, Edit, Trash2 } from "lucide-react";
import { LogoutConfirmation } from "@/components/ui/logout-confirmation";
import { SortableTableHeader } from "@/components/ui/sortable-table-header";
import { useTableSort } from "@/hooks/useTableSort";
import { useAuth } from "@/hooks/useAuth";
import { AddClientModal } from "@/components/clients/AddClientModal";
import { DeleteClientConfirmation } from "@/components/clients/DeleteClientConfirmation";
import { TableLoading } from "@/components/ui/table-loading";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type Client = Tables<"clients">;

const Clients = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  
  // Pagination constants
  const CLIENTS_PER_PAGE = 6;
  
  // Move useTableSort hook call to the top, before any conditional logic
  const { sortedData, sortConfig, handleSort } = useTableSort(clients);
  
  // Calculate pagination
  const totalPages = Math.ceil(sortedData.length / CLIENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * CLIENTS_PER_PAGE;
  const endIndex = startIndex + CLIENTS_PER_PAGE;
  const paginatedClients = sortedData.slice(startIndex, endIndex);
  
  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortedData.length]);

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    signOut();
    setShowLogoutDialog(false);
  };

  const fetchClients = async () => {
    if (!user) return;
    
    setClientsLoading(true);
    
    // Add minimum loading time to show the nice animation
    const [clientsData] = await Promise.all([
      supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false }),
      new Promise(resolve => setTimeout(resolve, 800)) // Minimum 800ms loading time
    ]);

    try {
      const { data, error } = clientsData;

      if (error) {
        console.error("Error fetching clients:", error);
        return;
      }

      setClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setClientsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user]);

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
  const handleDeleteClient = async () => {
    if (!deletingClient) return;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', deletingClient.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Client deleted successfully"
      });

      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingClient(null);
    }
  };

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
          <h1 className="text-3xl font-bold text-foreground">Clients</h1>
          <Button 
            onClick={() => setShowAddClientModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add client
          </Button>
        </div>

        {/* Clients Table */}
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          {clientsLoading ? (
            <TableLoading 
              columns={["Name", "Company", "Email", "Phone", "Address", "Actions"]}
              rows={6}
            />
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
                    Name
                  </SortableTableHeader>
                  <SortableTableHeader 
                    sortKey="company" 
                    currentSortKey={sortConfig.key} 
                    sortDirection={sortConfig.direction}
                    onSort={handleSort}
                  >
                    Company
                  </SortableTableHeader>
                  <SortableTableHeader 
                    sortKey="email" 
                    currentSortKey={sortConfig.key} 
                    sortDirection={sortConfig.direction}
                    onSort={handleSort}
                  >
                    Email
                  </SortableTableHeader>
                  <SortableTableHeader 
                    sortKey="phone" 
                    currentSortKey={sortConfig.key} 
                    sortDirection={sortConfig.direction}
                    onSort={handleSort}
                  >
                    Phone
                  </SortableTableHeader>
                  <SortableTableHeader 
                    sortKey="address" 
                    currentSortKey={sortConfig.key} 
                    sortDirection={sortConfig.direction}
                    onSort={handleSort}
                  >
                    Address
                  </SortableTableHeader>
                  <TableHead className="text-muted-foreground font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">No clients found. Add your first client to get started.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedClients.map((client) => (
                    <TableRow key={client.id} className="border-b border-border hover:bg-muted/50">
                      <TableCell>
                        <span className="text-foreground font-medium">
                          {client.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-foreground">{client.company || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-foreground">{client.email || '-'}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{client.phone || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{client.address || '-'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingClient(client)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeletingClient(client)}
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

        {/* Pagination Controls */}
        {!clientsLoading && totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;
                  const isCurrentPage = page === currentPage;
                  
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    page === currentPage ||
                    Math.abs(page - currentPage) <= 1
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                          isActive={isCurrentPage}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  
                  // Show ellipsis for gaps
                  if (
                    (page === 2 && currentPage > 4) ||
                    (page === totalPages - 1 && currentPage < totalPages - 3)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  
                  return null;
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    }}
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
      
      <AddClientModal
        open={showAddClientModal}
        onOpenChange={setShowAddClientModal}
        onClientAdded={() => {
          fetchClients();
        }}
      />
      
      <AddClientModal
        open={!!editingClient}
        onOpenChange={(open) => !open && setEditingClient(null)}
        editClient={editingClient}
        onClientAdded={() => {
          fetchClients();
          setEditingClient(null);
        }}
      />
      
      <DeleteClientConfirmation
        open={!!deletingClient}
        onOpenChange={(open) => !open && setDeletingClient(null)}
        onConfirm={handleDeleteClient}
        clientName={deletingClient?.name || ""}
      />
    </div>
  );
};

export default Clients;