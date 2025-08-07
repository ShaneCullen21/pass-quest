import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ReadOnlyDocumentViewer } from '@/components/contracts/ReadOnlyDocumentViewer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PenTool, Calendar, User, Check } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  description: string;
  document_content: any;
  field_data: any;
}

interface SigningField {
  id: string;
  type: string;
  clientId: string;
  position: { x: number; y: number };
  width: number;
  height: number;
}

const DocumentSigning = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [document, setDocument] = useState<Document | null>(null);
  const [signingFields, setSigningFields] = useState<SigningField[]>([]);
  const [currentClientId, setCurrentClientId] = useState<string>('');
  const [signature, setSignature] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    if (!documentId || !token) {
      toast({
        title: "Invalid Link",
        description: "This signing link is invalid or expired.",
        variant: "destructive",
      });
      return;
    }

    fetchDocument();
  }, [documentId, token]);

  const fetchDocument = async () => {
    try {
      const { data: doc, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error || !doc) {
        throw new Error('Document not found');
      }

      // Verify token and get current signer
      const fieldData = typeof doc.field_data === 'string' 
        ? JSON.parse(doc.field_data) 
        : doc.field_data;

      const signingOrder = fieldData?.signing_order || [];
      const currentSigner = signingOrder.find((s: any) => s.token === token && s.status === 'pending');

      if (!currentSigner) {
        throw new Error('Invalid or expired signing token');
      }

      setCurrentClientId(currentSigner.client_id);
      setDocument(doc);

      // Parse and load signing fields
      if (fieldData?.signing_fields) {
        setSigningFields(fieldData.signing_fields);
      }

    } catch (error: any) {
      console.error('Error fetching document:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load document",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSignature = async () => {
    if (!signature || !fullName) {
      toast({
        title: "Missing Information",
        description: "Please enter your signature and full name.",
        variant: "destructive",
      });
      return;
    }

    setSigning(true);
    try {
      // Get current document data
      const { data: currentDoc, error: fetchError } = await supabase
        .from('documents')
        .select('field_data')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      const fieldData = typeof currentDoc.field_data === 'string' 
        ? JSON.parse(currentDoc.field_data) 
        : currentDoc.field_data;

      const signingOrder = fieldData?.signing_order || [];
      
      // Update current signer status
      const updatedSigningOrder = signingOrder.map((signer: any) => {
        if (signer.client_id === currentClientId) {
          return {
            ...signer,
            status: 'completed',
            signature,
            full_name: fullName,
            signed_at: new Date().toISOString()
          };
        }
        return signer;
      });

      // Check if this is the first signer and activate second signer
      const currentSignerIndex = signingOrder.findIndex((s: any) => s.client_id === currentClientId);
      const isFirstSigner = currentSignerIndex === 0;
      
      if (isFirstSigner && updatedSigningOrder.length > 1) {
        // Activate second signer
        updatedSigningOrder[1].status = 'pending';
        
        // Send email to second signer
        const secondSigner = updatedSigningOrder[1];
        const { data: clientData } = await supabase
          .from('clients')
          .select('*')
          .eq('id', secondSigner.client_id)
          .single();

        if (clientData) {
          await supabase.functions.invoke('send-signature-email', {
            body: {
              documentId: documentId,
              firstSignerId: secondSigner.client_id,
              secondSignerId: secondSigner.client_id, // Same person for second notification
              documentTitle: document?.title || 'Document',
              isSecondSigner: true,
              signingLink: `${window.location.origin}/sign/${documentId}?token=${secondSigner.token}`
            }
          });
        }
      }

      // Determine new document status
      const allCompleted = updatedSigningOrder.every((s: any) => s.status === 'completed');
      const newStatus = allCompleted ? 'completed' : 'pending_second_signature';

      // Update document
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          signing_status: newStatus,
          field_data: {
            ...fieldData,
            signing_order: updatedSigningOrder
          },
          ...(allCompleted && { signed_at: new Date().toISOString() })
        })
        .eq('id', documentId);

      if (updateError) throw updateError;

      toast({
        title: "Signature Complete!",
        description: allCompleted 
          ? "All signatures have been completed. The document is now fully executed."
          : "Your signature has been recorded. The next signer will be notified.",
      });

      // Redirect after a delay
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (error: any) {
      console.error('Error completing signature:', error);
      toast({
        title: "Error",
        description: "Failed to complete signature. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading document...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h1 className="text-xl font-semibold mb-2">Document Not Found</h1>
            <p className="text-muted-foreground mb-4">
              This document could not be found or the signing link has expired.
            </p>
            <Button onClick={() => navigate('/')}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Viewer */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="h-5 w-5" />
                  {document.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review the document below and complete your signature on the right.
                </p>
              </CardHeader>
              <CardContent>
                <ReadOnlyDocumentViewer
                  content={document.document_content?.content || ''}
                  signingFields={signingFields}
                  currentClientId={currentClientId}
                />
              </CardContent>
            </Card>
          </div>

          {/* Signature Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Complete Signature
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Legal Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full legal name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signature">Electronic Signature</Label>
                  <Input
                    id="signature"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="Type your name as signature"
                  />
                  <p className="text-xs text-muted-foreground">
                    By typing your name, you agree this constitutes a legal electronic signature.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Date: {new Date().toLocaleDateString()}</span>
                </div>

                <Button 
                  onClick={handleCompleteSignature}
                  disabled={!signature || !fullName || signing}
                  className="w-full"
                  size="lg"
                >
                  {signing ? (
                    "Completing Signature..."
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Complete Signature
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  This action will finalize your signature and cannot be undone.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSigning;