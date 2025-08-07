import React from 'react';
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

interface DeleteTemplateConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  templateTitle: string;
  templateType: 'master' | 'customized';
}

export const DeleteTemplateConfirmation: React.FC<DeleteTemplateConfirmationProps> = ({
  isOpen,
  onClose,
  onConfirm,
  templateTitle,
  templateType
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {templateType === 'master' ? 'Master' : 'Customized'} Template</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{templateTitle}"? This action cannot be undone.
            {templateType === 'master' && (
              <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                <p className="text-sm text-orange-700 font-medium">
                  Warning: Deleting this master template may affect any customized templates based on it.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Template
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};