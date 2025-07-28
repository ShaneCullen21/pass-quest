import { cn } from "@/lib/utils";

interface NavigationProps {
  className?: string;
}

const Navigation = ({ className }: NavigationProps) => {
  const navItems = [
    { label: "DASHBOARD", active: true },
    { label: "PROJECTS", active: false },
    { label: "TEMPLATES", active: false },
    { label: "CLIENTS", active: false },
    { label: "REPORTS", active: false },
  ];

  return (
    <nav className={cn("flex items-center space-x-8", className)}>
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
  );
};

export { Navigation };