import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  company: string | null;
}

interface Project {
  id: string;
  name: string;
  location: string | null;
  status: string;
  client_ids: string[] | null;
}

interface AddProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectAdded?: () => void;
  editProject?: Project | null;
}

export const AddProjectModal = ({ open, onOpenChange, onProjectAdded, editProject }: AddProjectModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    status: "",
    client_ids: [] as string[]
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [clientSelectionError, setClientSelectionError] = useState<string>("");
  const { toast } = useToast();

  const isEditMode = !!editProject;

  // Pre-populate form data when editing
  useEffect(() => {
    if (editProject) {
      setFormData({
        name: editProject.name,
        location: editProject.location || "",
        status: editProject.status,
        client_ids: editProject.client_ids || []
      });
    } else {
      setFormData({
        name: "",
        location: "",
        status: "active",
        client_ids: []
      });
    }
  }, [editProject, open]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open && !editProject) {
      setFormData({
        name: "",
        location: "",
        status: "active",
        client_ids: []
      });
    }
  }, [open, editProject]);

  // Load clients when modal opens
  useEffect(() => {
    if (open) {
      loadClients();
    }
  }, [open]);

  const loadClients = async () => {
    setIsLoadingClients(true);
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, first_name, last_name, company")
        .order("first_name", { ascending: true });

      if (error) {
        throw error;
      }

      setClients(data || []);
    } catch (error) {
      console.error("Error loading clients:", error);
      toast({
        title: "Error",
        description: "Failed to load clients. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingClients(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClientToggle = (clientId: string) => {
    setFormData(prev => ({
      ...prev,
      client_ids: prev.client_ids.includes(clientId)
        ? prev.client_ids.filter(id => id !== clientId)
        : [...prev.client_ids, clientId]
    }));
  };

  const removeClient = (clientId: string) => {
    setFormData(prev => ({
      ...prev,
      client_ids: prev.client_ids.filter(id => id !== clientId)
    }));
  };

  const getSelectedClients = () => {
    return clients.filter(client => formData.client_ids.includes(client.id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.status) {
      toast({
        title: "Error",
        description: "Project status is required",
        variant: "destructive"
      });
      return;
    }

    if (formData.client_ids.length > 5) {
      toast({
        title: "Error",
        description: "Maximum 5 clients allowed per project",
        variant: "destructive"
      });
      return;
    }


    setIsSubmitting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (isEditMode && editProject) {
        // Update existing project
        const { error } = await supabase
          .from('projects')
          .update({
            name: formData.name.trim(),
            location: formData.location.trim() || null,
            status: formData.status,
            client_ids: formData.client_ids.length > 0 ? formData.client_ids : null,
          })
          .eq('id', editProject.id);

        if (error) {
          throw error;
        }

        toast({
          title: "Success",
          description: "Project updated successfully"
        });
      } else {
        // Add new project
        const { error } = await supabase
          .from('projects')
          .insert({
            name: formData.name.trim(),
            location: formData.location.trim() || null,
            status: formData.status,
            client_ids: formData.client_ids.length > 0 ? formData.client_ids : null,
            user_id: userData.user?.id!
          });

        if (error) {
          throw error;
        }

        toast({
          title: "Success",
          description: "Project added successfully"
        });
      }

      onOpenChange(false);
      onProjectAdded?.();
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} project:`, error);
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'add'} project. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-background border border-border shadow-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            {isEditMode ? "Edit project" : "Add new project"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              Project Name*
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter project name"
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium text-foreground">
              Location
            </Label>
            <Input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Enter project location"
              className="w-full"
            />
          </div>


          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Status*
            </Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select project status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_hold">On-Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Client(s)
            </Label>
            {isLoadingClients ? (
              <div className="text-sm text-muted-foreground">Loading clients...</div>
            ) : (
              <>
                {/* Selected clients display */}
                {getSelectedClients().length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {getSelectedClients().map((client) => (
                      <div
                        key={client.id}
                        className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                      >
                        <span>{client.first_name} {client.last_name}</span>
                        <button
                          type="button"
                          onClick={() => removeClient(client.id)}
                          className="text-primary hover:text-primary/80"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Client selection dropdown */}
                <div className="border border-border rounded-md max-h-40 overflow-y-auto">
                  {clients.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground">
                      No clients available. Add some clients first.
                    </div>
                  ) : (
                    <div className="p-2 space-y-2">
                      {clients.map((client) => (
                        <div key={client.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`client-${client.id}`}
                            checked={formData.client_ids.includes(client.id)}
                            onCheckedChange={() => handleClientToggle(client.id)}
                          />
                          <Label
                            htmlFor={`client-${client.id}`}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            {client.first_name} {client.last_name}
                            {client.company && (
                              <span className="text-muted-foreground ml-1">({client.company})</span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Error message for client selection */}
                {formData.client_ids.length > 5 && (
                  <div className="text-sm text-destructive mt-2">
                    Maximum 5 clients allowed per project. Please deselect {formData.client_ids.length - 5} client{formData.client_ids.length - 5 > 1 ? 's' : ''}.
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col space-y-2 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || formData.client_ids.length > 5}
              className="w-full"
            >
              {isSubmitting ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Update Project" : "Save & Continue")}
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