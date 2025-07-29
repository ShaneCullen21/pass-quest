import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Bell, Search, CircleHelp, User, LogOut } from "lucide-react";
import { LogoutConfirmation } from "@/components/ui/logout-confirmation";
import { SortableTableHeader } from "@/components/ui/sortable-table-header";
import { useTableSort } from "@/hooks/useTableSort";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

const Reports = () => {
  const { user, loading, signOut } = useAuth();
  const { profile } = useProfile();
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
  // Mock data for invoice summary
  const invoiceStats = {
    paid: "$45,230.89",
    receivables: "$12,340.25", 
    overdue: "$3,450.00"
  };

  // Mock data for financial reports table
  const invoiceData = [
    {
      invoiceNumber: "INV-001",
      date: "2024-01-15",
      paymentStatus: "paid",
      dueDate: "2024-02-15",
      paymentTerms: "Single Payment",
      amount: "$5,230.00"
    },
    {
      invoiceNumber: "INV-002", 
      date: "2024-01-20",
      paymentStatus: "unpaid",
      dueDate: "2024-02-20",
      paymentTerms: "Installments (2/3 paid)",
      amount: "$3,450.00"
    },
    {
      invoiceNumber: "INV-003",
      date: "2024-01-25", 
      paymentStatus: "overdue",
      dueDate: "2024-02-10",
      paymentTerms: "Single Payment",
      amount: "$2,100.00"
    },
    {
      invoiceNumber: "INV-004",
      date: "2024-02-01",
      paymentStatus: "paid",
      dueDate: "2024-03-01",
      paymentTerms: "Recurring Monthly",
      amount: "$8,900.00"
    },
    {
      invoiceNumber: "INV-005",
      date: "2024-02-05",
      paymentStatus: "refunded", 
      dueDate: "2024-03-05",
      paymentTerms: "Single Payment",
      amount: "$1,200.00"
    }
  ];

  const { sortedData, sortConfig, handleSort } = useTableSort(invoiceData);

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: "bg-green-100 text-green-800 border-green-200",
      unpaid: "bg-yellow-100 text-yellow-800 border-yellow-200",
      overdue: "bg-red-100 text-red-800 border-red-200", 
      refunded: "bg-gray-100 text-gray-800 border-gray-200"
    };

    return (
      <Badge className={`${variants[status as keyof typeof variants]} border`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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
                <span className="text-sm font-medium">{profile?.first_name || user?.email?.split('@')[0] || 'User'}</span>
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
      
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">
              Monitor your financial performance and invoice status
            </p>
          </div>

          {/* Invoice Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <StatsCard label="Total Paid" amount={invoiceStats.paid} variant="paid" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Account Receivables</CardTitle>
              </CardHeader>
              <CardContent>
                <StatsCard label="Outstanding" amount={invoiceStats.receivables} variant="due" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <StatsCard label="Past Due" amount={invoiceStats.overdue} variant="pastdue" />
              </CardContent>
            </Card>
          </div>

          {/* Financial Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <p className="text-sm text-muted-foreground">
                Detailed view of all invoice transactions and payment status
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableTableHeader 
                      sortKey="invoiceNumber" 
                      currentSortKey={sortConfig.key} 
                      sortDirection={sortConfig.direction}
                      onSort={handleSort}
                    >
                      Invoice Number
                    </SortableTableHeader>
                    <SortableTableHeader 
                      sortKey="date" 
                      currentSortKey={sortConfig.key} 
                      sortDirection={sortConfig.direction}
                      onSort={handleSort}
                    >
                      Date
                    </SortableTableHeader>
                    <SortableTableHeader 
                      sortKey="paymentStatus" 
                      currentSortKey={sortConfig.key} 
                      sortDirection={sortConfig.direction}
                      onSort={handleSort}
                    >
                      Payment Status
                    </SortableTableHeader>
                    <SortableTableHeader 
                      sortKey="dueDate" 
                      currentSortKey={sortConfig.key} 
                      sortDirection={sortConfig.direction}
                      onSort={handleSort}
                    >
                      Due Date
                    </SortableTableHeader>
                    <SortableTableHeader 
                      sortKey="paymentTerms" 
                      currentSortKey={sortConfig.key} 
                      sortDirection={sortConfig.direction}
                      onSort={handleSort}
                    >
                      Payment Terms
                    </SortableTableHeader>
                    <SortableTableHeader 
                      sortKey="amount" 
                      currentSortKey={sortConfig.key} 
                      sortDirection={sortConfig.direction}
                      onSort={handleSort}
                      className="text-right"
                    >
                      Amount
                    </SortableTableHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((invoice) => (
                    <TableRow key={invoice.invoiceNumber}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>
                        {getStatusBadge(invoice.paymentStatus)}
                      </TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell>{invoice.paymentTerms}</TableCell>
                      <TableCell className="text-right font-medium">
                        {invoice.amount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <LogoutConfirmation 
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        onConfirm={confirmLogout}
      />
    </div>
  );
};

export default Reports;