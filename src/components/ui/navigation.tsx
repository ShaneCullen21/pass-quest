import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";

interface NavigationProps {
  className?: string;
}

const Navigation = ({ className }: NavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const navItems = [
    { label: "DASHBOARD", active: true },
    { label: "PROJECTS", active: false },
    { label: "TEMPLATES", active: false },
    { label: "CLIENTS", active: false },
    { label: "REPORTS", active: false },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={cn("hidden md:flex items-center space-x-8", className)}>
        {navItems.map((item) => (
          <button
            key={item.label}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              item.active
                ? "text-primary border-b-2 border-primary pb-1"
                : "text-muted-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-foreground">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <nav className="flex flex-col p-4 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    className={cn(
                      "text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      item.active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export { Navigation };