import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientAdded?: () => void;
}

export const AddClientModal = ({ open, onOpenChange, onClientAdded }: AddClientModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Client name is required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: formData.name.trim(),
          company: formData.company.trim() || null,
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          address: formData.address.trim() || null,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Client added successfully"
      });

      // Reset form
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        address: ""
      });
      
      onOpenChange(false);
      onClientAdded?.();
    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Error",
        description: "Failed to add client. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
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
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold text-foreground">
            Add new client
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              Client name*
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter client name"
              required
              className="w-full"
            />
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
              {isSubmitting ? "Adding..." : "Save & Continue"}
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