import { TableHead } from "@/components/ui/table";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SortDirection } from "@/hooks/useTableSort";

interface SortableTableHeaderProps {
  children: React.ReactNode;
  sortKey: string;
  currentSortKey: string | null;
  sortDirection: SortDirection;
  onSort: (key: string) => void;
  className?: string;
}

export function SortableTableHeader({
  children,
  sortKey,
  currentSortKey,
  sortDirection,
  onSort,
  className,
}: SortableTableHeaderProps) {
  const isActive = currentSortKey === sortKey;

  const getSortIcon = () => {
    if (!isActive) {
      return <ChevronsUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />;
    }
    
    if (sortDirection === 'asc') {
      return <ChevronUp className="ml-2 h-4 w-4 text-foreground" />;
    }
    
    if (sortDirection === 'desc') {
      return <ChevronDown className="ml-2 h-4 w-4 text-foreground" />;
    }
    
    return <ChevronsUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />;
  };

  return (
    <TableHead 
      className={cn(
        "cursor-pointer select-none hover:bg-muted/50 transition-colors",
        "text-muted-foreground font-medium",
        className
      )}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center">
        {children}
        {getSortIcon()}
      </div>
    </TableHead>
  );
}