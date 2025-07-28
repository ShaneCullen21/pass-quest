import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Search, CircleHelp, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Templates = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

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
  const templates = [
    {
      title: "Copy of General Service Template Contract",
      lastUpdated: "Feb 26, 2025",
      preview: "/placeholder.svg" // Using placeholder for template preview
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
                <CircleHelp className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center space-x-2 ml-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium">Emily</span>
                <Button
                  variant="ghost"
                  onClick={signOut}
                  size="icon"
                  className="text-muted-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mobile User Actions */}
            <div className="sm:hidden flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <Button
                variant="ghost"
                onClick={signOut}
                size="icon"
                className="text-muted-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Templates</h1>
        </div>

        {/* Tabs and Sort */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <Tabs defaultValue="customized" className="w-auto">
              <TabsList className="bg-muted">
                <TabsTrigger value="purchased" className="text-muted-foreground data-[state=active]:text-foreground">
                  Purchased templates
                </TabsTrigger>
                <TabsTrigger value="customized" className="text-muted-foreground data-[state=active]:text-foreground">
                  Customized templates
                </TabsTrigger>
                <TabsTrigger value="free" className="text-muted-foreground data-[state=active]:text-foreground">
                  Free templates
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">SORT BY</span>
              <Select defaultValue="last-added">
                <SelectTrigger className="w-36 border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-added">Last added</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Template Cards */}
        <div className="grid gap-6 mb-16">
          {templates.map((template, index) => (
            <Card key={index} className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  {/* Template Preview */}
                  <div className="w-32 h-24 bg-muted rounded-lg flex-shrink-0"></div>
                  
                  {/* Template Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {template.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Last updated on {template.lastUpdated}
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 flex-shrink-0">
                    <Button variant="outline" className="w-36">
                      Edit template
                    </Button>
                    <Button variant="outline" className="w-36">
                      Create document
                    </Button>
                    <Button variant="outline" className="w-36">
                      Download template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cannot find section */}
        <div className="text-center py-16 border-t border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Cannot find what you need?
          </h2>
          <p className="text-muted-foreground mb-6">
            Find more legal templates created by the team of experts from The Legal Page
          </p>
          <Button variant="link" className="text-primary underline">
            Visit Our Marketplace
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Templates;