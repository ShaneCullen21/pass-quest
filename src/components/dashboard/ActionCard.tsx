import { Card } from "@/components/ui/card";
import { Presentation, Users, Receipt, Workflow } from "lucide-react";

interface ActionCardProps {
  type: "proposal" | "contract" | "invoice" | "flow";
}

const ActionCard = ({ type }: ActionCardProps) => {
  const config = {
    proposal: {
      icon: Presentation,
      label: "+ PROPOSAL"
    },
    contract: {
      icon: Users,
      label: "+ CONTRACT"
    },
    invoice: {
      icon: Receipt,
      label: "+ INVOICE"
    },
    flow: {
      icon: Workflow,
      label: "+ FLOW"
    }
  };

  const { icon: Icon, label } = config[type];

  return (
    <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer border-input bg-background">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
    </Card>
  );
};

export { ActionCard };