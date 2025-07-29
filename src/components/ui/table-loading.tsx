import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface TableLoadingProps {
  columns: string[];
  rows?: number;
}

export const TableLoading = ({ columns, rows = 6 }: TableLoadingProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-border">
          {columns.map((column, index) => (
            <TableHead key={index} className="text-muted-foreground font-medium">
              <Skeleton className="h-4 w-20" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }, (_, index) => (
          <TableRow key={index} className="border-b border-border animate-pulse">
            {columns.map((_, colIndex) => (
              <TableCell key={colIndex}>
                <Skeleton className="h-4 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};