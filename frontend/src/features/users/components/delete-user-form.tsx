"use client";

import { Trash2 } from "lucide-react";
import { deleteUserAction } from "@/features/users/actions/delete-user-action";
import { toast } from "sonner";
import { useActionState, useEffect } from "react";

interface DeleteUserFormProps {
  userId: number;
  className?: string;
  buttonClassName?: string;
  showIcon?: boolean;
  buttonText?: string;
  redirectOnSuccess?: boolean;
}

export default function DeleteUserForm({ 
  userId,
  className = "inline",
  buttonClassName = "flex w-full items-center text-destructive cursor-pointer",
  showIcon = true,
  buttonText = "Supprimer",
  redirectOnSuccess = false,
}: DeleteUserFormProps) {

  const deleteUserActionWithId = deleteUserAction.bind(null, userId);
  const [state, formAction, isPending] = useActionState(deleteUserActionWithId, {});

  useEffect(() => {
    if (state.success === true) {
      toast.success(state.message || "Utilisateur supprimé avec succès !");
    } else if (state.success === false) {
      toast.error(state.message || "Erreur lors de la suppression de l'utilisateur.");
    }
  }, [state])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      event.preventDefault();
    }
  };

  return (
    <form action={formAction} className={className} onSubmit={handleSubmit}>
      <button 
        type="submit" 
        className={buttonClassName}
        disabled={isPending}
      >
        {showIcon && <Trash2 className="mr-4 h-4 w-4" />}
        {isPending ? "Suppression..." : buttonText}
      </button>
      <input type="hidden" name="redirectOnSuccess" value={redirectOnSuccess.toString()} />
    </form>
  );
}