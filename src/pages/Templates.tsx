import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/ui/navigation";
import { Plus, Edit, FileText, Trash2, ArrowLeft, FileIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { ProfileDropdown } from "@/components/ui/profile-dropdown";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { NewTemplateModal } from "@/components/templates/NewTemplateModal";
import { DeleteTemplateConfirmation } from "@/components/templates/DeleteTemplateConfirmation";
import { ProjectSelectionModal } from "@/components/contracts/ProjectSelectionModal";

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
  const { role, isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading2, setLoading2] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('master'); // Track active tab
  const [showProjectSelection, setShowProjectSelection] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    templateId: string;
    templateTitle: string;
    templateType: 'master' | 'customized';
  }>({
    isOpen: false,
    templateId: '',
    templateTitle: '',
    templateType: 'master'
  });

  // Check URL parameters on mount to set the correct tab
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get('tab');
    if (tab === 'customized') {
      setActiveTab('customized');
    }
  }, []);

  // Set active tab based on user role
  useEffect(() => {
    if (isAdmin) {
      setActiveTab('master');
    }
  }, [isAdmin]);

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
      // Fetch master templates (visible to all) and user's customized templates
      const { data, error } = await supabase
        .from('templates')
        .select('*')
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
      setDeleteConfirmation({
        isOpen: false,
        templateId: '',
        templateTitle: '',
        templateType: 'master'
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete template. Please try again.",
      });
    }
  };

  const handleDeleteClick = (template: Template) => {
    setDeleteConfirmation({
      isOpen: true,
      templateId: template.id,
      templateTitle: template.title,
      templateType: template.template_type
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmation.templateId) {
      handleDeleteTemplate(deleteConfirmation.templateId);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      isOpen: false,
      templateId: '',
      templateTitle: '',
      templateType: 'master'
    });
  };

  const handleCreateDocument = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setShowProjectSelection(true);
  };

  const handleProjectSelect = (projectId: string) => {
    setShowProjectSelection(false);
    navigate(`/contracts/document-editor?templateId=${selectedTemplateId}&projectId=${projectId}`);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  if (loading || roleLoading) {
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
          <h1 className="text-3xl font-bold text-foreground">
            {isAdmin ? 'Admin: Manage Master Templates' : 'Templates'}
          </h1>
          {isAdmin ? (
            <Button onClick={() => setShowNewTemplateModal(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Master Template
            </Button>
          ) : (
            <Button onClick={() => setShowNewTemplateModal(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Customized Template
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-4">
            {isAdmin ? (
              <div className="text-lg font-semibold">Master Templates</div>
            ) : (
              <TabsList className="grid w-fit grid-cols-3">
                <TabsTrigger value="master">Purchased Templates</TabsTrigger>
                <TabsTrigger value="customized">My Customized Templates</TabsTrigger>
                <TabsTrigger 
                  value="free" 
                  disabled 
                  className="cursor-not-allowed hover:bg-muted/60 hover:text-muted-foreground/80 transition-colors"
                >
                  Free Templates
                </TabsTrigger>
              </TabsList>
            )}
            
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

          {/* Content for both admin and regular users - shows master templates */}
          <div className={isAdmin ? "space-y-4" : ""}>
            <TabsContent value="master" className="space-y-4">
              {loading2 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading templates...
                </div>
              ) : (
                <>
                  {getFilteredTemplates('master').length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {isAdmin 
                        ? "No master templates found. Create your first master template to get started."
                        : "No master templates available yet. Contact your administrator."
                      }
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {getFilteredTemplates('master')
                        .sort((a, b) => {
                          if (sortBy === 'name') {
                            return a.title.localeCompare(b.title);
                          }
                          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                        })
                        .map((template) => (
                          <Card key={template.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                  {/* Preview Image */}
                                  <div className="w-16 h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileIcon className="h-6 w-6 text-gray-400" />
                                  </div>
                                  
                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-semibold text-lg truncate">{template.title}</h3>
                                      <Badge variant="default">Master</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                                      {template.description || 'No description provided'}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span>Created: {formatDate(template.created_at)}</span>
                                      <span>Updated: {formatDate(template.updated_at)}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {isAdmin ? (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`/templates/new?id=${template.id}`)}
                                        className="flex items-center gap-1"
                                      >
                                        <Edit className="h-3 w-3" />
                                        Edit
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteClick(template)}
                                        className="flex items-center gap-1"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                        Delete
                                      </Button>
                                    </>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => navigate(`/templates/new?masterId=${template.id}`)}
                                      className="flex items-center gap-1"
                                    >
                                      <Plus className="h-3 w-3" />
                                      Customize
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </div>

          {!isAdmin && (
            <TabsContent value="customized" className="space-y-4">
              {loading2 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading templates...
                </div>
              ) : (
                <>
                  {getFilteredTemplates('customized').length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No customized templates found. Customize a master template to get started.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {getFilteredTemplates('customized')
                        .sort((a, b) => {
                          if (sortBy === 'name') {
                            return a.title.localeCompare(b.title);
                          }
                          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                        })
                        .map((template) => (
                          <Card key={template.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                  {/* Preview Image */}
                                  <div className="w-16 h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileIcon className="h-6 w-6 text-gray-400" />
                                  </div>
                                  
                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-semibold text-lg truncate">{template.title}</h3>
                                      <Badge variant="secondary">Customized</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                                      {template.description || 'No description provided'}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span>Created: {formatDate(template.created_at)}</span>
                                      <span>Updated: {formatDate(template.updated_at)}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/templates/new?id=${template.id}`)}
                                    className="flex items-center gap-1"
                                  >
                                    <Edit className="h-3 w-3" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCreateDocument(template.id)}
                                    className="flex items-center gap-1"
                                  >
                                    <FileText className="h-3 w-3" />
                                    Create Document
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteClick(template)}
                                    className="flex items-center gap-1"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          )}
        </Tabs>

        {/* Marketplace Section - only show for regular users */}
        {!isAdmin && (
          <div className="mt-12 p-6 bg-muted/50 rounded-lg border">
            <h2 className="text-xl font-semibold mb-2">Need More Templates?</h2>
            <p className="text-muted-foreground mb-4">
              Explore our template marketplace for professionally designed templates across various industries.
            </p>
            <Button variant="outline">
              Browse Marketplace
            </Button>
          </div>
        )}

        <NewTemplateModal 
          isOpen={showNewTemplateModal}
          onClose={() => setShowNewTemplateModal(false)}
          forceTemplateType={isAdmin ? 'master' : 'customized'}
        />

        <ProjectSelectionModal
          isOpen={showProjectSelection}
          onClose={() => setShowProjectSelection(false)}
          onProjectSelect={handleProjectSelect}
          templateId={selectedTemplateId}
        />

        <DeleteTemplateConfirmation
          isOpen={deleteConfirmation.isOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          templateTitle={deleteConfirmation.templateTitle}
          templateType={deleteConfirmation.templateType}
        />
      </main>
    </div>
  );
};

export default Templates;