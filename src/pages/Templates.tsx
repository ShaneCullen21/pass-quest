import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/ui/navigation";
import { Plus, Edit, FileText, Trash2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProfileDropdown } from "@/components/ui/profile-dropdown";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { NewTemplateModal } from "@/components/templates/NewTemplateModal";

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  created_at: string;
  updated_at: string;
  template_data?: any;
  template_type: 'master' | 'customized';
  master_template_id?: string;
}

const Templates = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading2, setLoading2] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (user) {
      fetchTemplates();
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        fetchTemplates();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const fetchTemplates = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching templates:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load templates. Please try again.",
        });
        return;
      }

      setTemplates((data || []) as Template[]);
    } catch (error) {
      console.error('Error in fetchTemplates:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while loading templates.",
      });
    } finally {
      setLoading2(false);
    }
  };

  const getFilteredTemplates = (templateType: 'master' | 'customized') => {
    return templates.filter(template => template.template_type === templateType);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template deleted successfully.",
      });
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete template. Please try again.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Navigation />
            <div className="flex items-center space-x-4">
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Templates</h1>
          <Button onClick={() => setShowNewTemplateModal(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>

        <Tabs defaultValue="master" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="master">Master Templates</TabsTrigger>
              <TabsTrigger value="customized">Customized Templates</TabsTrigger>
            </TabsList>
            
            <Select value={sortBy} onValueChange={(value: 'name' | 'date') => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date Created</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="master" className="space-y-4">
            {loading2 ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading templates...
              </div>
            ) : (
              <>
                {getFilteredTemplates('master').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No master templates found. Create your first master template to get started.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getFilteredTemplates('master')
                      .sort((a, b) => {
                        if (sortBy === 'name') {
                          return a.title.localeCompare(b.title);
                        }
                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                      })
                      .map((template) => (
                        <Card key={template.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span className="truncate">{template.title}</span>
                              <Badge variant="default">Master</Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {template.description || 'No description provided'}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Created: {formatDate(template.created_at)}</span>
                              <span>Updated: {formatDate(template.updated_at)}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/templates/${template.id}/edit`)}
                                className="flex items-center gap-1 flex-1"
                              >
                                <Edit className="h-3 w-3" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/contracts/new?templateId=${template.id}`)}
                                className="flex items-center gap-1 flex-1"
                              >
                                <FileText className="h-3 w-3" />
                                Create Document
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTemplate(template.id)}
                                className="flex items-center gap-1"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="customized" className="space-y-4">
            {loading2 ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading templates...
              </div>
            ) : (
              <>
                {getFilteredTemplates('customized').length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No customized templates found. Create a customized template from a master template to get started.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getFilteredTemplates('customized')
                      .sort((a, b) => {
                        if (sortBy === 'name') {
                          return a.title.localeCompare(b.title);
                        }
                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                      })
                      .map((template) => (
                        <Card key={template.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span className="truncate">{template.title}</span>
                              <Badge variant="secondary">Customized</Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {template.description || 'No description provided'}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Created: {formatDate(template.created_at)}</span>
                              <span>Updated: {formatDate(template.updated_at)}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/templates/${template.id}/edit`)}
                                className="flex items-center gap-1 flex-1"
                              >
                                <Edit className="h-3 w-3" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/contracts/new?templateId=${template.id}`)}
                                className="flex items-center gap-1 flex-1"
                              >
                                <FileText className="h-3 w-3" />
                                Create Document
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTemplate(template.id)}
                                className="flex items-center gap-1"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Marketplace Section */}
        <div className="mt-12 p-6 bg-muted/50 rounded-lg border">
          <h2 className="text-xl font-semibold mb-2">Need More Templates?</h2>
          <p className="text-muted-foreground mb-4">
            Explore our template marketplace for professionally designed templates across various industries.
          </p>
          <Button variant="outline">
            Browse Marketplace
          </Button>
        </div>

        <NewTemplateModal 
          isOpen={showNewTemplateModal}
          onClose={() => setShowNewTemplateModal(false)}
        />
      </main>
    </div>
  );
};

export default Templates;