import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Bell, Search, CircleHelp } from "lucide-react";

const Reports = () => {
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
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Payment Terms</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceData.map((invoice) => (
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
    </div>
  );
};

export default Reports;