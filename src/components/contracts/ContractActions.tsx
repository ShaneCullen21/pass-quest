import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Download, 
  Share2, 
  Send, 
  History, 
  FileText, 
  Mail,
  ExternalLink,
  Copy
} from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from "sonner";

interface Contract {
  id: string;
  title: string;
  description: string;
  signing_status: string;
  created_at: string;
  amount: number;
}

interface ContractActionsProps {
  contract: Contract;
  onStatusChange?: () => void;
}

export const ContractActions = ({ contract, onStatusChange }: ContractActionsProps) => {
  const [exportLoading, setExportLoading] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const exportToPDF = async () => {
    setExportLoading(true);
    try {
      // Create a temporary div with contract content
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '210mm'; // A4 width
      tempDiv.style.padding = '20mm';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '12px';
      tempDiv.style.lineHeight = '1.5';
      tempDiv.style.backgroundColor = 'white';

      // Generate contract HTML content
      tempDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1f2937; margin-bottom: 10px;">${contract.title}</h1>
          <p style="color: #6b7280; margin: 0;">Contract Document</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Contract Details</h2>
          <table style="width: 100%; margin-top: 15px; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 150px;">Title:</td>
              <td style="padding: 8px 0;">${contract.title}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Description:</td>
              <td style="padding: 8px 0;">${contract.description || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Status:</td>
              <td style="padding: 8px 0; text-transform: capitalize;">${contract.signing_status}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Amount:</td>
              <td style="padding: 8px 0;">${contract.amount ? `$${contract.amount.toLocaleString()}` : 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Created:</td>
              <td style="padding: 8px 0;">${new Date(contract.created_at).toLocaleDateString()}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Contract Terms</h2>
          <div style="margin-top: 15px; line-height: 1.8;">
            <p>This contract outlines the terms and conditions for the services to be provided. All parties agree to the following:</p>
            <ol style="margin: 15px 0; padding-left: 25px;">
              <li>The scope of work as described in the project documentation</li>
              <li>Payment terms as specified in the contract amount</li>
              <li>Timeline and delivery expectations</li>
              <li>Responsibilities of all parties involved</li>
            </ol>
          </div>
        </div>

        <div style="margin-top: 50px;">
          <h2 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Signatures</h2>
          <div style="display: flex; justify-content: space-between; margin-top: 40px;">
            <div style="text-align: center; width: 200px;">
              <div style="border-bottom: 1px solid #000; margin-bottom: 10px; height: 40px;"></div>
              <p style="margin: 0; font-weight: bold;">Client Signature</p>
              <p style="margin: 5px 0 0 0; font-size: 10px;">Date: ___________</p>
            </div>
            <div style="text-align: center; width: 200px;">
              <div style="border-bottom: 1px solid #000; margin-bottom: 10px; height: 40px;"></div>
              <p style="margin: 0; font-weight: bold;">Service Provider Signature</p>
              <p style="margin: 5px 0 0 0; font-size: 10px;">Date: ___________</p>
            </div>
          </div>
        </div>

        <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #6b7280;">
          <p>Generated on ${new Date().toLocaleDateString()} • Contract ID: ${contract.id.slice(0, 8)}</p>
        </div>
      `;

      document.body.appendChild(tempDiv);

      // Convert to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(tempDiv);

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      pdf.save(`${contract.title.replace(/[^a-zA-Z0-9]/g, '_')}_contract.pdf`);
      toast.success('Contract exported to PDF successfully');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export contract to PDF');
    } finally {
      setExportLoading(false);
    }
  };

  const copyShareLink = () => {
    const shareLink = `${window.location.origin}/contracts/${contract.id}/view`;
    navigator.clipboard.writeText(shareLink);
    toast.success('Contract link copied to clipboard');
  };

  const sendByEmail = () => {
    const subject = `Contract: ${contract.title}`;
    const body = `Please review the attached contract: ${contract.title}\n\nContract ID: ${contract.id}\nStatus: ${contract.signing_status}\n\nYou can view the contract online at: ${window.location.origin}/contracts/${contract.id}/view`;
    
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'sent': return 'bg-blue-500';
      case 'viewed': return 'bg-yellow-500';
      case 'signed': return 'bg-green-500';
      case 'completed': return 'bg-green-600';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract Actions
          </span>
          <Badge className={`${getStatusColor(contract.signing_status)} text-white`}>
            {contract.signing_status.charAt(0).toUpperCase() + contract.signing_status.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export & Download */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Export & Download</h4>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToPDF}
              disabled={exportLoading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {exportLoading ? 'Exporting...' : 'Export PDF'}
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Export Word
            </Button>
          </div>
        </div>

        {/* Share & Send */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Share & Send</h4>
          <div className="flex gap-2 flex-wrap">
            <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share Contract</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={copyShareLink} className="flex-1">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button variant="outline" onClick={sendByEmail} className="flex-1">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Share this link with clients to view the contract online.
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              size="sm"
              onClick={sendByEmail}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </div>
        </div>

        {/* Status Management */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Contract Management</h4>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" disabled>
              <History className="h-4 w-4 mr-2" />
              View History
            </Button>
            <Button variant="outline" size="sm" disabled>
              <ExternalLink className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>

        {/* Quick Info */}
        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Created: {new Date(contract.created_at).toLocaleDateString()}</p>
            <p>Contract ID: {contract.id.slice(0, 8)}...</p>
            {contract.amount && (
              <p>Amount: ${contract.amount.toLocaleString()}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};