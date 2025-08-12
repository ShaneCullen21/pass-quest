import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

interface DeleteProjectConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  projectName: string;
  projectId: string;
}

export const DeleteProjectConfirmation = ({
  open,
  onOpenChange,
  onConfirm,
  projectName,
  projectId,
}: DeleteProjectConfirmationProps) => {
  const [documentCount, setDocumentCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && projectId) {
      getDocumentCount();
    }
  }, [open, projectId]);

  const getDocumentCount = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_project_document_count', {
        project_uuid: projectId
      });

      if (error) {
        console.error('Error getting document count:', error);
      } else {
        setDocumentCount(data || 0);
      }
    } catch (error) {
      console.error('Error in getDocumentCount:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Project and All Documents?</AlertDialogTitle>
          <AlertDialogDescription>
            {loading ? (
              "Checking project documents..."
            ) : (
              <>
                This action cannot be undone. This will permanently delete the project{" "}
                <strong>"{projectName}"</strong> and all its data from our servers.
                <br />
                <br />
                {documentCount > 0 ? (
                  <span className="text-destructive font-medium">
                    ⚠️ This will also delete {documentCount} document{documentCount > 1 ? 's' : ''} 
                    {' '}associated with this project.
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    No documents are associated with this project.
                  </span>
                )}
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={loading}
          >
            Delete Project{documentCount > 0 ? ` & ${documentCount} Document${documentCount > 1 ? 's' : ''}` : ''}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};