import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Navigation } from "@/components/ui/navigation";
import { ProfileDropdown } from "@/components/ui/profile-dropdown";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Palette, 
  Type, 
  Square, 
  MousePointer,
  Zap,
  Star,
  Heart,
  Search,
  Bell,
  Settings,
  Download,
  Upload,
  Plus,
  Minus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Styles = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("buttons");
  
  if (!user && !loading) {
    navigate("/auth");
    return null;
  }

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Navigation />
            <div className="flex items-center space-x-3">
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Design System Styles</h1>
          <p className="text-lg text-muted-foreground">
            Visual showcase of all design system components, colors, and styles
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
          </TabsList>

          {/* Buttons Tab */}
          <TabsContent value="buttons" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="h-5 w-5" />
                  Button Variants
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Primary Buttons</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="default">Default</Button>
                    <Button variant="default" size="sm">Small</Button>
                    <Button variant="default" size="lg">Large</Button>
                    <Button variant="default" size="icon"><Plus className="h-4 w-4" /></Button>
                    <Button variant="default" disabled>Disabled</Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Secondary Buttons</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Destructive Buttons</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="destructive" size="sm">Small Destructive</Button>
                    <Button variant="destructive" disabled>Disabled</Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Buttons with Icons</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button><Download className="mr-2 h-4 w-4" />Download</Button>
                    <Button variant="outline"><Upload className="mr-2 h-4 w-4" />Upload</Button>
                    <Button variant="secondary"><Settings className="mr-2 h-4 w-4" />Settings</Button>
                    <Button variant="ghost"><Edit className="mr-2 h-4 w-4" />Edit</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Typography System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Headings</h3>
                  <div className="space-y-4">
                    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                      Heading 1 - The quick brown fox
                    </h1>
                    <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                      Heading 2 - The quick brown fox
                    </h2>
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                      Heading 3 - The quick brown fox
                    </h3>
                    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
                      Heading 4 - The quick brown fox
                    </h4>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Body Text</h3>
                  <div className="space-y-4">
                    <p className="leading-7">
                      Regular paragraph text with proper line height and spacing. This text demonstrates how content flows naturally.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Small muted text for captions and secondary information.
                    </p>
                    <p className="text-lg font-medium">
                      Large bold text for emphasis and important statements.
                    </p>
                    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                      Code snippet text
                    </code>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Text Utilities</h3>
                  <div className="space-y-2">
                    <p className="font-thin">Thin weight text</p>
                    <p className="font-light">Light weight text</p>
                    <p className="font-normal">Normal weight text</p>
                    <p className="font-medium">Medium weight text</p>
                    <p className="font-semibold">Semibold weight text</p>
                    <p className="font-bold">Bold weight text</p>
                    <p className="italic">Italic text styling</p>
                    <p className="underline">Underlined text</p>
                    <p className="line-through">Strikethrough text</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Color Palette
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Primary Colors</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="h-20 bg-primary rounded-md flex items-center justify-center">
                        <span className="text-primary-foreground font-medium">Primary</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Primary</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 bg-primary-foreground border rounded-md flex items-center justify-center">
                        <span className="text-primary font-medium">Primary Foreground</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Primary Foreground</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 bg-secondary rounded-md flex items-center justify-center">
                        <span className="text-secondary-foreground font-medium">Secondary</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Secondary</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 bg-accent rounded-md flex items-center justify-center">
                        <span className="text-accent-foreground font-medium">Accent</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Accent</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Status Colors</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="h-20 bg-destructive rounded-md flex items-center justify-center">
                        <span className="text-destructive-foreground font-medium">Destructive</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Destructive</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 bg-muted rounded-md flex items-center justify-center">
                        <span className="text-muted-foreground font-medium">Muted</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Muted</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 bg-popover border rounded-md flex items-center justify-center">
                        <span className="text-popover-foreground font-medium">Popover</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Popover</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 bg-card border rounded-md flex items-center justify-center">
                        <span className="text-card-foreground font-medium">Card</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Card</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Background Variations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-32 bg-background border rounded-md flex items-center justify-center">
                      <span className="text-foreground font-medium">Background</span>
                    </div>
                    <div className="h-32 bg-muted rounded-md flex items-center justify-center">
                      <span className="text-muted-foreground font-medium">Muted Background</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forms Tab */}
          <TabsContent value="forms" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Square className="h-5 w-5" />
                  Form Elements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Input Fields</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="regular">Regular Input</Label>
                        <Input id="regular" placeholder="Enter text here..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="disabled">Disabled Input</Label>
                        <Input id="disabled" placeholder="Disabled..." disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="error">Error State</Label>
                        <Input id="error" placeholder="Error state..." className="border-destructive" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Textarea</h3>
                    <div className="space-y-2">
                      <Label htmlFor="textarea">Description</Label>
                      <Textarea id="textarea" placeholder="Enter description..." rows={4} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Select & Dropdown</h3>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option1">Option 1</SelectItem>
                        <SelectItem value="option2">Option 2</SelectItem>
                        <SelectItem value="option3">Option 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Slider</h3>
                    <Slider defaultValue={[50]} max={100} step={1} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Checkboxes</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="check1" />
                        <Label htmlFor="check1">Option 1</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="check2" defaultChecked />
                        <Label htmlFor="check2">Option 2 (checked)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="check3" disabled />
                        <Label htmlFor="check3">Option 3 (disabled)</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Radio Groups</h3>
                    <RadioGroup defaultValue="radio1">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="radio1" id="radio1" />
                        <Label htmlFor="radio1">Radio 1</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="radio2" id="radio2" />
                        <Label htmlFor="radio2">Radio 2</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="radio3" id="radio3" />
                        <Label htmlFor="radio3">Radio 3</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Switches</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="switch1" />
                      <Label htmlFor="switch1">Enable notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="switch2" defaultChecked />
                      <Label htmlFor="switch2">Auto-save (enabled)</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Badges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="outline">Outline</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={33} />
                  <Progress value={66} />
                  <Progress value={88} />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    This is an informational alert with helpful information.
                  </AlertDescription>
                </Alert>
                
                <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                    This is a warning alert that requires attention.
                  </AlertDescription>
                </Alert>
                
                <Alert className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    This is an error alert indicating something went wrong.
                  </AlertDescription>
                </Alert>
                
                <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    This is a success alert confirming completion.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sample Cards</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Card</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This is a basic card with header and content.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      Interactive Card
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This card has hover effects and an icon.
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="text-lg">Highlighted Card</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This card has a colored border for emphasis.
                    </p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Effects Tab */}
          <TabsContent value="effects" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Interactive Effects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Hover Effects</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                      <h4 className="font-semibold">Shadow Hover</h4>
                      <p className="text-sm text-muted-foreground">Hover for shadow effect</p>
                    </div>
                    <div className="p-6 border rounded-lg hover:scale-105 transition-transform cursor-pointer">
                      <h4 className="font-semibold">Scale Hover</h4>
                      <p className="text-sm text-muted-foreground">Hover for scale effect</p>
                    </div>
                    <div className="p-6 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                      <h4 className="font-semibold">Color Hover</h4>
                      <p className="text-sm text-muted-foreground">Hover for background change</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Animations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 border rounded-lg">
                      <div className="animate-pulse">
                        <h4 className="font-semibold">Pulse Animation</h4>
                        <p className="text-sm text-muted-foreground">Continuous pulse effect</p>
                      </div>
                    </div>
                    <div className="p-6 border rounded-lg">
                      <div className="animate-bounce">
                        <Star className="h-8 w-8 text-primary mx-auto" />
                      </div>
                      <h4 className="font-semibold text-center mt-2">Bounce Animation</h4>
                    </div>
                    <div className="p-6 border rounded-lg">
                      <div className="animate-spin">
                        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                      </div>
                      <h4 className="font-semibold text-center mt-2">Spin Animation</h4>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Transitions</h3>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                      <Button className="transition-all duration-200 hover:scale-110">
                        Scale Button
                      </Button>
                      <Button className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        Lift Button
                      </Button>
                      <Button className="transition-all duration-500 hover:rounded-full">
                        Morph Button
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Gradients & Backgrounds</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-32 bg-gradient-to-r from-primary to-primary/50 rounded-lg flex items-center justify-center">
                      <span className="text-primary-foreground font-medium">Primary Gradient</span>
                    </div>
                    <div className="h-32 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-medium">Colorful Gradient</span>
                    </div>
                    <div className="h-32 bg-gradient-to-r from-muted via-accent to-muted rounded-lg flex items-center justify-center">
                      <span className="text-foreground font-medium">Subtle Gradient</span>
                    </div>
                    <div className="h-32 bg-gradient-to-tr from-background via-muted to-accent rounded-lg border flex items-center justify-center">
                      <span className="text-foreground font-medium">Light Gradient</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Styles;