"use client";

import { Trash2 } from "lucide-react";
import { deleteUserAction, DeleteUserResult } from "@/features/users/actions/delete-user-action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface DeleteUserFormProps {
  userId: number;
  userName: string;
  className?: string;
  buttonClassName?: string;
  showIcon?: boolean;
  buttonText?: string;
  onSuccess?: () => void;
  redirectOnSuccess?: boolean;
}

export default function DeleteUserForm({ 
  userId, 
  userName,
  className = "inline",
  buttonClassName = "flex w-full items-center text-destructive cursor-pointer",
  showIcon = true,
  buttonText = "Supprimer",
  onSuccess,
  redirectOnSuccess = false
}: DeleteUserFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userName}" ?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const result: DeleteUserResult = await deleteUserAction(formData);
        
        if (result.success) {
          toast.success(result.message || "Utilisateur supprimé avec succès");
          onSuccess?.();
          
          if (redirectOnSuccess) {
            router.push("/users");
          }
        } else {
          toast.error(result.message || "Erreur lors de la suppression");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        toast.error("Une erreur inattendue s'est produite");
      }
    });
  };

  return (
    <form action={handleSubmit} className={className}>
      <input type="hidden" name="userId" value={userId} />
      <button 
        type="submit" 
        className={buttonClassName}
        disabled={isPending}
      >
        {showIcon && <Trash2 className="mr-2 h-4 w-4" />}
        {isPending ? "Suppression..." : buttonText}
      </button>
    </form>
  );
}