import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
}

interface TemplateSelectorProps {
  onTemplateSelect: (templateId: string) => void;
  onBack: () => void;
}

export const TemplateSelector = ({ onTemplateSelect, onBack }: TemplateSelectorProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchTemplates();
  }, [user]);

  const fetchTemplates = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">Select a Template</h3>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {searchQuery ? "No templates match your search" : "No templates found"}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Create your first template in the Templates page
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {filteredTemplates.map((template) => (
            <Card 
              key={template.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onTemplateSelect(template.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{template.title}</h4>
                    {template.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {template.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(template.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};