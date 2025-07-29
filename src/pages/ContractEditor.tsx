import { useParams, useNavigate } from "react-router-dom";
import { ContractEditor as ContractEditorComponent } from "@/components/contracts/ContractEditor";

const ContractEditor = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  // Mock contract data - in a real app, this would come from query params or state
  const contractData = {
    sourceType: "blank" as const,
    templateId: null,
    documentUrl: null,
    selectedClients: [],
    selectedProject: projectId || null,
    title: "",
    description: "",
  };

  const handleSave = () => {
    navigate(`/projects/${projectId}`);
  };

  const handleBack = () => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <ContractEditorComponent
          contractData={contractData}
          onSave={handleSave}
          onBack={handleBack}
        />
      </div>
    </div>
  );
};

export default ContractEditor;