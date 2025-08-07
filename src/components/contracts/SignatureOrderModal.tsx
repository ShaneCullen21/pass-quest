import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, ArrowDown } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
}

interface SignatureOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  onSendForSignature: (firstSigner: string, secondSigner: string) => void;
  isLoading?: boolean;
}

export const SignatureOrderModal: React.FC<SignatureOrderModalProps> = ({
  isOpen,
  onClose,
  clients,
  onSendForSignature,
  isLoading = false
}) => {
  const [firstSigner, setFirstSigner] = useState<string>('');
  const [secondSigner, setSecondSigner] = useState<string>('');

  const handleSend = () => {
    if (firstSigner && secondSigner && firstSigner !== secondSigner) {
      onSendForSignature(firstSigner, secondSigner);
    }
  };

  const getClientById = (id: string) => clients.find(c => c.id === id);

  const isValid = firstSigner && secondSigner && firstSigner !== secondSigner;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send for Signature
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Select the signing order for this document. The first signer will receive the email immediately.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="first-signer">First Signer</Label>
              <Select value={firstSigner} onValueChange={setFirstSigner}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose first signer" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {firstSigner && (
              <div className="flex justify-center">
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="second-signer">Second Signer</Label>
              <Select value={secondSigner} onValueChange={setSecondSigner}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose second signer" />
                </SelectTrigger>
                <SelectContent>
                  {clients.filter(c => c.id !== firstSigner).map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isValid && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Signing Order Summary:</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">1. </span>
                    {getClientById(firstSigner)?.name} will receive the document first
                  </div>
                  <div>
                    <span className="font-medium">2. </span>
                    {getClientById(secondSigner)?.name} will receive it after the first signature is complete
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={!isValid || isLoading}
            >
              {isLoading ? 'Sending...' : 'Send for Signature'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};