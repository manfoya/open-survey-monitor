"use client";

import { Trash2 } from "lucide-react";
import { deleteQuotaAssignmentAction } from "../actions/delete-assignment-action";
import { toast } from "sonner";
import { useActionState, useEffect } from "react";

interface DeleteQuotaAssignmentFormProps {
  assignmentId: number;
  className?: string;
  buttonClassName?: string;
  showIcon?: boolean;
  buttonText?: string;
}

export default function DeleteQuotaAssignmentForm({
  assignmentId,
  className = "inline",
  buttonClassName = "flex w-full items-center text-destructive cursor-pointer",
  showIcon = true,
  buttonText = "Supprimer",
}: DeleteQuotaAssignmentFormProps) {
  const deleteActionWithId = deleteQuotaAssignmentAction.bind(
    null,
    assignmentId,
  );
  const [state, formAction, isPending] = useActionState(deleteActionWithId, {
    success: false,
    message: "",
  });

  useEffect(() => {
    if (state.success === true) {
      toast.success(state.message || "Assignation supprimée avec succès !");
    } else if (state.success === false && state.message) {
      toast.error(
        state.message || "Erreur lors de la suppression de l'assignation.",
      );
    }
  }, [state]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette assignation ?")) {
      event.preventDefault();
    }
  };

  return (
    <form action={formAction} className={className} onSubmit={handleSubmit}>
      <button type="submit" className={buttonClassName} disabled={isPending}>
        {showIcon && <Trash2 className="mr-2 h-4 w-4" />}
        {isPending ? "Suppression..." : buttonText}
      </button>
    </form>
  );
}
