import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientAdded?: () => void;
  editClient?: {
    id: string;
    first_name: string;
    last_name: string;
    company: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
  } | null;
}

export const AddClientModal = ({ open, onOpenChange, onClientAdded, editClient }: AddClientModalProps) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    company: "",
    email: "",
    phone: "",
    address: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const isEditMode = !!editClient;

  // Pre-populate form data when editing
  useEffect(() => {
    if (editClient) {
      setFormData({
        first_name: editClient.first_name,
        last_name: editClient.last_name,
        company: editClient.company || "",
        email: editClient.email || "",
        phone: editClient.phone || "",
        address: editClient.address || ""
      });
    } else {
      setFormData({
        first_name: "",
        last_name: "",
        company: "",
        email: "",
        phone: "",
        address: ""
      });
    }
  }, [editClient, open]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone || phone.trim() === "") return true; // Optional field
    // Allow various phone formats: (123) 456-7890, 123-456-7890, 123.456.7890, +1234567890, etc.
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$|^[\+]?[(]?[\d\s\-\.\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const validateAddress = (address: string): boolean => {
    if (!address || address.trim() === "") return true; // Optional field
    // Basic address validation: at least 5 characters and contains some letters and numbers or street names
    return address.length >= 5 && /[a-zA-Z]/.test(address) && 
           (/\d/.test(address) || /street|st|avenue|ave|road|rd|drive|dr|lane|ln|way|court|ct|place|pl|boulevard|blvd/i.test(address));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast({
        title: "Error",
        description: "Both first name and last name are required",
        variant: "destructive"
      });
      return;
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    if (formData.address && !validateAddress(formData.address)) {
      toast({
        title: "Error",
        description: "Please enter a valid address (at least 5 characters with letters and numbers or street names)",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && editClient) {
        // Update existing client
        const { error } = await supabase
          .from('clients')
          .update({
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            company: formData.company.trim() || null,
            email: formData.email.trim() || null,
            phone: formData.phone.trim() || null,
            address: formData.address.trim() || null,
          })
          .eq('id', editClient.id);

        if (error) {
          throw error;
        }

        toast({
          title: "Success",
          description: "Client updated successfully"
        });
      } else {
        // Add new client
        const { error } = await supabase
          .from('clients')
          .insert({
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            company: formData.company.trim() || null,
            email: formData.email.trim() || null,
            phone: formData.phone.trim() || null,
            address: formData.address.trim() || null,
            user_id: (await supabase.auth.getUser()).data.user?.id
          });

        if (error) {
          throw error;
        }

        toast({
          title: "Success",
          description: "Client added successfully"
        });
      }

      onOpenChange(false);
      onClientAdded?.();
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} client:`, error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'add'} client. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: "",
      last_name: "",
      company: "",
      email: "",
      phone: "",
      address: ""
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border border-border shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            {isEditMode ? "Edit client" : "Add new client"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-sm font-medium text-foreground">
                First name*
              </Label>
              <Input
                id="first_name"
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange("first_name", e.target.value)}
                placeholder="Enter first name"
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-sm font-medium text-foreground">
                Last name*
              </Label>
              <Input
                id="last_name"
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                placeholder="Enter last name"
                required
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-medium text-foreground">
              Company
            </Label>
            <Input
              id="company"
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange("company", e.target.value)}
              placeholder="Enter company name"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter email address"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-foreground">
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Enter phone number"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-foreground">
              Address
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Enter address"
              className="w-full min-h-[80px]"
            />
          </div>

          <div className="flex flex-col space-y-2 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[hsl(15,78%,46%)] hover:bg-[hsl(15,78%,40%)] text-white font-medium"
            >
              {isSubmitting ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Update Client" : "Save & Continue")}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};