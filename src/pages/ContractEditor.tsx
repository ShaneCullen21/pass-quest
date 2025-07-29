import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ContractEditor as ContractEditorComponent } from "@/components/contracts/ContractEditor";

const ContractEditor = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const contractId = searchParams.get('contractId');

  // Contract data - will be populated from contract ID if editing, or defaults for new contract
  const contractData = {
    sourceType: "blank" as const,
    templateId: null,
    documentUrl: null,
    selectedClients: [],
    selectedProject: projectId || null,
    title: contractId ? `Editing Contract ${contractId.slice(0, 8)}...` : "",
    description: "",
    contractId: contractId, // Pass the contract ID for editing
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