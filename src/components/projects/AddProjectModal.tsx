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
  name: string;
  company: string | null;
}

interface Project {
  id: string;
  name: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  clients_ids: string | null;
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
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
    status: "",
    client_ids: [] as string[]
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const { toast } = useToast();

  const isEditMode = !!editProject;

  // Pre-populate form data when editing
  useEffect(() => {
    if (editProject) {
      setFormData({
        name: editProject.name,
        location: editProject.location || "",
        start_date: editProject.start_date ? new Date(editProject.start_date) : undefined,
        end_date: editProject.end_date ? new Date(editProject.end_date) : undefined,
        status: editProject.status,
        client_ids: editProject.clients_ids ? [editProject.clients_ids] : []
      });
    } else {
      setFormData({
        name: "",
        location: "",
        start_date: undefined,
        end_date: undefined,
        status: "",
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
        start_date: undefined,
        end_date: undefined,
        status: "",
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
        .select("id, name, company")
        .order("name", { ascending: true });

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

    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      toast({
        title: "Error",
        description: "End date must be after start date",
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
            start_date: formData.start_date?.toISOString().split('T')[0] || null,
            end_date: formData.end_date?.toISOString().split('T')[0] || null,
            status: formData.status,
            clients_ids: formData.client_ids.length > 0 ? formData.client_ids[0] : null,
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
            start_date: formData.start_date?.toISOString().split('T')[0] || null,
            end_date: formData.end_date?.toISOString().split('T')[0] || null,
            status: formData.status,
            clients_ids: formData.client_ids.length > 0 ? formData.client_ids[0] : null, // Using first client for now since DB expects single UUID
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Start Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.start_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => handleInputChange("start_date", date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                End Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.end_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? format(formData.end_date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) => handleInputChange("end_date", date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
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
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
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
                        <span>{client.name}</span>
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
                            {client.name}
                            {client.company && (
                              <span className="text-muted-foreground ml-1">({client.company})</span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col space-y-2 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[hsl(15,78%,46%)] hover:bg-[hsl(15,78%,40%)] text-white font-medium"
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