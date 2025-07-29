import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, Plus } from "lucide-react";
import { TemplateSelector } from "./TemplateSelector";
import { ClientSelector } from "./ClientSelector";
import { ProjectSelector } from "./ProjectSelector";
import { ContractEditor } from "./ContractEditor";

interface CreateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  onContractCreated: () => void;
}

type Step = "source" | "template" | "clients" | "project" | "editor";

export const CreateContractModal = ({
  isOpen,
  onClose,
  projectId,
  onContractCreated,
}: CreateContractModalProps) => {
  const [currentStep, setCurrentStep] = useState<Step>("source");
  const [contractData, setContractData] = useState({
    sourceType: null as "template" | "upload" | "blank" | null,
    templateId: null as string | null,
    documentUrl: null as string | null,
    selectedClients: [] as string[],
    selectedProject: projectId || null as string | null,
    title: "",
    description: "",
  });

  const handleSourceSelection = (sourceType: "template" | "upload" | "blank") => {
    setContractData(prev => ({ ...prev, sourceType }));
    
    if (sourceType === "template") {
      setCurrentStep("template");
    } else if (sourceType === "blank") {
      setCurrentStep("clients");
    } else {
      // Handle document upload
      setCurrentStep("clients");
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setContractData(prev => ({ ...prev, templateId }));
    setCurrentStep("clients");
  };

  const handleClientsSelect = (clientIds: string[]) => {
    setContractData(prev => ({ ...prev, selectedClients: clientIds }));
    setCurrentStep("project");
  };

  const handleProjectSelect = (projectId: string) => {
    setContractData(prev => ({ ...prev, selectedProject: projectId }));
    setCurrentStep("editor");
  };

  const handleClose = () => {
    setCurrentStep("source");
    setContractData({
      sourceType: null,
      templateId: null,
      documentUrl: null,
      selectedClients: [],
      selectedProject: projectId || null,
      title: "",
      description: "",
    });
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "source":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">How would you like to create your contract?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSourceSelection("template")}
              >
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <FileText className="h-12 w-12 mb-3 text-primary" />
                  <h4 className="font-semibold mb-2">From Template</h4>
                  <p className="text-sm text-muted-foreground">
                    Start with a pre-designed contract template
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSourceSelection("upload")}
              >
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <Upload className="h-12 w-12 mb-3 text-primary" />
                  <h4 className="font-semibold mb-2">Upload Document</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload your own PDF or Word document
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleSourceSelection("blank")}
              >
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <Plus className="h-12 w-12 mb-3 text-primary" />
                  <h4 className="font-semibold mb-2">Start from Scratch</h4>
                  <p className="text-sm text-muted-foreground">
                    Create a new contract from a blank document
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "template":
        return (
          <TemplateSelector
            onTemplateSelect={handleTemplateSelect}
            onBack={() => setCurrentStep("source")}
          />
        );

      case "clients":
        return (
          <ClientSelector
            selectedClients={contractData.selectedClients}
            onClientsSelect={handleClientsSelect}
            onBack={() => setCurrentStep(contractData.sourceType === "template" ? "template" : "source")}
          />
        );

      case "project":
        return (
          <ProjectSelector
            selectedProject={contractData.selectedProject}
            onProjectSelect={handleProjectSelect}
            onBack={() => setCurrentStep("clients")}
          />
        );

      case "editor":
        return (
          <ContractEditor
            contractData={contractData}
            onSave={() => {
              onContractCreated();
              handleClose();
            }}
            onBack={() => setCurrentStep("project")}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Contract</DialogTitle>
        </DialogHeader>
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
};