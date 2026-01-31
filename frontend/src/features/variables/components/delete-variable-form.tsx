"use client";

import { Trash2 } from "lucide-react";
import {
  deleteVariableAction,
  DeleteVariableState,
} from "@/features/variables/actions/delete-variable-action";
import { toast } from "sonner";
import { useActionState, useEffect } from "react";

interface DeleteVariableFormProps {
  variableId: number;
  className?: string;
  buttonClassName?: string;
  showIcon?: boolean;
  buttonText?: string;
  redirectOnSuccess?: boolean;
}

export default function DeleteVariableForm({
  variableId,
  className = "inline",
  buttonClassName = "flex w-full items-center text-destructive cursor-pointer",
  showIcon = true,
  buttonText = "Supprimer",
  redirectOnSuccess = false,
}: DeleteVariableFormProps) {
  const deleteVariableActionWithId = deleteVariableAction.bind(
    null,
    variableId,
  );
  const [state, formAction, isPending] = useActionState<
    DeleteVariableState,
    FormData
  >(deleteVariableActionWithId, {});

  useEffect(() => {
    if (state.success === true) {
      toast.success(state.message || "Variable supprimée avec succès !");
    } else if (state.success === false) {
      toast.error(
        state.message || "Erreur lors de la suppression de la variable.",
      );
    }
  }, [state]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette variable ?")) {
      event.preventDefault();
    }
  };

  return (
    <form action={formAction} className={className} onSubmit={handleSubmit}>
      <button type="submit" className={buttonClassName} disabled={isPending}>
        {showIcon && <Trash2 className="mr-4 h-4 w-4" />}
        {isPending ? "Suppression..." : buttonText}
      </button>
      <input
        type="hidden"
        name="redirectOnSuccess"
        value={redirectOnSuccess.toString()}
      />
    </form>
  );
}
