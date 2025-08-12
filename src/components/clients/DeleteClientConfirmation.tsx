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

interface DeleteClientConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  clientName: string;
  clientId: string;
}

interface ClientDependencies {
  can_delete: boolean;
  project_count: number;
  document_count: number;
}

export const DeleteClientConfirmation = ({
  open,
  onOpenChange,
  onConfirm,
  clientName,
  clientId,
}: DeleteClientConfirmationProps) => {
  const [dependencies, setDependencies] = useState<ClientDependencies | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && clientId) {
      checkClientDependencies();
    }
  }, [open, clientId]);

  const checkClientDependencies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('can_delete_client', {
        client_uuid: clientId
      });

      if (error) {
        console.error('Error checking client dependencies:', error);
      } else if (data && data.length > 0) {
        setDependencies(data[0]);
      }
    } catch (error) {
      console.error('Error in checkClientDependencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const canDelete = dependencies?.can_delete ?? false;
  const projectCount = dependencies?.project_count ?? 0;
  const documentCount = dependencies?.document_count ?? 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {canDelete ? "Delete Client?" : "Cannot Delete Client"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {loading ? (
              "Checking client dependencies..."
            ) : canDelete ? (
              <>
                This action cannot be undone. This will permanently delete the client{" "}
                <strong>"{clientName}"</strong> and remove all their data from our servers.
              </>
            ) : (
              <>
                Cannot delete client <strong>"{clientName}"</strong> because it is still being used:
                <br />
                <br />
                {projectCount > 0 && (
                  <span>• Used in {projectCount} project{projectCount > 1 ? 's' : ''}<br /></span>
                )}
                {documentCount > 0 && (
                  <span>• Referenced in {documentCount} document{documentCount > 1 ? 's' : ''}<br /></span>
                )}
                <br />
                Please remove the client from all projects and documents before deleting.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {canDelete && (
            <AlertDialogAction
              onClick={onConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={loading}
            >
              Delete Client
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};