import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/ui/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit, FileText, Trash2, ArrowLeft, FileIcon, Users, Receipt, Search, Bell, HelpCircle, Presentation } from "lucide-react";
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
  const [preselectedTemplateId, setPreselectedTemplateId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<string>('master'); // Track active tab
  const [showProjectSelection, setShowProjectSelection] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [showPurchasedAlert, setShowPurchasedAlert] = useState(true);
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

  const getTemplateIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('proposal')) {
      return Presentation;
    } else if (lowerTitle.includes('invoice')) {
      return Receipt;
    } else if (lowerTitle.includes('service agreement') || lowerTitle.includes('contract')) {
      return Users;
    }
    return FileIcon;
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
      {/* Top Navigation */}
      <header className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Navigation />
            
            {/* Desktop User Actions */}
            <div className="hidden sm:flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <HelpCircle className="h-5 w-5" />
              </Button>
              
              <div className="ml-4">
                <ProfileDropdown />
              </div>
            </div>

            {/* Mobile User Actions */}
            <div className="sm:hidden">
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
          {isAdmin && (
            <Button onClick={() => setShowNewTemplateModal(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Master Template
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
                  className="cursor-not-allowed data-[disabled]:opacity-100 data-[disabled]:text-muted-foreground"
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
              {/* Info Alert for Purchased Templates */}
              {!isAdmin && activeTab === 'master' && showPurchasedAlert && (
                <Alert className="border-[#6D312C]/20 bg-[#6D312C]/5">
                  <AlertDescription className="flex items-center justify-between text-[#6D312C]">
                    <span>Every time you decide to use a purchased template we will create a copy of it. The original template you've purchased will remain unchanged.</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowPurchasedAlert(false)}
                      className="ml-4 flex-shrink-0 bg-[#6D312C] text-white border-[#6D312C] hover:bg-[#6D312C]/90"
                    >
                      Got it
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              {loading2 ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="p-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-16 h-16 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-6 w-1/3" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </div>
                    </Card>
                  ))}
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
                                    {(() => {
                                      const IconComponent = getTemplateIcon(template.title);
                                      return <IconComponent className="h-6 w-6 text-gray-400" />;
                                    })()}
                                  </div>
                                  
                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                     <div className="flex items-center gap-2 mb-1">
                                       <h3 className="font-semibold text-lg truncate">{template.title}</h3>
                                     </div>
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
                                       onClick={() => {
                                         setPreselectedTemplateId(template.id);
                                         setShowNewTemplateModal(true);
                                       }}
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
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="p-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-16 h-16 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-6 w-1/3" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  {getFilteredTemplates('customized').length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No customized templates found. Customize a purchased template to get started.
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
                                    {(() => {
                                      const IconComponent = getTemplateIcon(template.title);
                                      return <IconComponent className="h-6 w-6 text-gray-400" />;
                                    })()}
                                  </div>
                                  
                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                     <div className="flex items-center gap-2 mb-1">
                                       <h3 className="font-semibold text-lg truncate">{template.title}</h3>
                                     </div>
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
          <div className="mt-12 p-8 bg-muted/30 rounded-lg border text-center">
            <h2 className="text-2xl font-semibold mb-3 text-foreground">Cannot find what you need?</h2>
            <p className="text-foreground mb-6 text-base">
              Find more legal templates created by the team of experts from The Legal Paige
            </p>
            <a 
              href="#" 
              className="text-foreground underline hover:no-underline transition-all text-base font-medium"
            >
              Visit Our Marketplace
            </a>
          </div>
        )}

        <NewTemplateModal 
          isOpen={showNewTemplateModal} 
          onClose={() => {
            setShowNewTemplateModal(false);
            setPreselectedTemplateId(undefined);
          }}
          forceTemplateType={!isAdmin ? 'customized' : undefined}
          preselectedTemplateId={preselectedTemplateId}
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