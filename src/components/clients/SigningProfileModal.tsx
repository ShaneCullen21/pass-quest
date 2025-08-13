import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/contexts/ProfileContext";
import { toast } from "@/hooks/use-toast";

interface SigningProfileModalProps {
  open: boolean;
  onSigningProfileCreated: () => void;
}

interface FormData {
  first_name: string;
  last_name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
}

export const SigningProfileModal = ({ open, onSigningProfileCreated }: SigningProfileModalProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-populate form with user profile data
  useEffect(() => {
    if (profile && user) {
      setFormData(prev => ({
        ...prev,
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: user.email || "",
      }));
    }
  }, [profile, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      toast({
        title: "Error",
        description: "First name is required",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.last_name.trim()) {
      toast({
        title: "Error", 
        description: "Last name is required",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.email.trim()) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;

    setIsSubmitting(true);

    try {
      // Create signing profile client
      const { error: clientError } = await supabase
        .from("clients")
        .insert([{
          user_id: user.id,
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          company: formData.company.trim() || null,
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          address: formData.address.trim() || null,
          is_signing_profile: true,
        }]);

      if (clientError) throw clientError;

      // Update profile to mark signing profile as created
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ signing_profile_created: true })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "Your signing profile has been created successfully!",
      });

      onSigningProfileCreated();
    } catch (error) {
      console.error("Error creating signing profile:", error);
      toast({
        title: "Error",
        description: "Failed to create signing profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]" onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Create Your Signing Profile</DialogTitle>
          <DialogDescription>
            Before you can manage clients, please create your signing profile. This represents you as a signer and will be automatically included in your projects.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating..." : "Create Signing Profile"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};