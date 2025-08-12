import { Badge } from "@/components/ui/badge";

interface StatsCardProps {
  label: string;
  amount: string;
  variant: "paid" | "due" | "pastdue";
}

const StatsCard = ({ label, amount, variant }: StatsCardProps) => {
  const variants = {
    paid: "bg-status-completed text-status-completed-foreground border-status-completed/20",
    due: "bg-status-hold text-status-hold-foreground border-status-hold/20", 
    pastdue: "bg-status-cancelled text-status-cancelled-foreground border-status-cancelled/20"
  };

  return (
    <div className="flex items-center gap-2">
      <Badge className={`${variants[variant]} border`}>
        {label}
      </Badge>
      <span className="font-semibold text-foreground">{amount}</span>
    </div>
  );
};

export { StatsCard };