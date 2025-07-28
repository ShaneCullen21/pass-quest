import { Badge } from "@/components/ui/badge";

interface StatsCardProps {
  label: string;
  amount: string;
  variant: "paid" | "due" | "pastdue";
}

const StatsCard = ({ label, amount, variant }: StatsCardProps) => {
  const variants = {
    paid: "bg-green-100 text-green-800 border-green-200",
    due: "bg-yellow-100 text-yellow-800 border-yellow-200", 
    pastdue: "bg-red-100 text-red-800 border-red-200"
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