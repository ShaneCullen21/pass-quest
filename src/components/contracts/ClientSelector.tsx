import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Search, User, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { AddClientModal } from "../clients/AddClientModal";

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
}

interface ClientSelectorProps {
  selectedClients: string[];
  onClientsSelect: (clientIds: string[]) => void;
  onBack: () => void;
}

export const ClientSelector = ({ 
  selectedClients, 
  onClientsSelect, 
  onBack 
}: ClientSelectorProps) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddClient, setShowAddClient] = useState(false);
  const [tempSelectedClients, setTempSelectedClients] = useState<string[]>(selectedClients);
  const { user } = useAuth();

  useEffect(() => {
    fetchClients();
  }, [user]);

  const fetchClients = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;

      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClientToggle = (clientId: string) => {
    setTempSelectedClients(prev => 
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleContinue = () => {
    if (tempSelectedClients.length === 0) {
      toast.error('Please select at least one client');
      return;
    }
    onClientsSelect(tempSelectedClients);
  };

  const handleClientAdded = () => {
    fetchClients();
    setShowAddClient(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">Select Clients</h3>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowAddClient(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading clients...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-8">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {searchQuery ? "No clients match your search" : "No clients found"}
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setShowAddClient(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Client
          </Button>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredClients.map((client) => (
            <Card 
              key={client.id}
              className={`cursor-pointer transition-colors ${
                tempSelectedClients.includes(client.id) 
                  ? 'bg-primary/5 border-primary' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => handleClientToggle(client.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={tempSelectedClients.includes(client.id)}
                    onChange={() => handleClientToggle(client.id)}
                  />
                  <User className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold">{client.name}</h4>
                    {client.company && (
                      <p className="text-sm text-muted-foreground">{client.company}</p>
                    )}
                    {client.email && (
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tempSelectedClients.length > 0 && (
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {tempSelectedClients.length} client{tempSelectedClients.length > 1 ? 's' : ''} selected
          </p>
          <Button onClick={handleContinue}>
            Continue
          </Button>
        </div>
      )}

      <AddClientModal
        open={showAddClient}
        onOpenChange={setShowAddClient}
        onClientAdded={handleClientAdded}
      />
    </div>
  );
};