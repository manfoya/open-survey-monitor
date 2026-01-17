"use client";

import { Trash2 } from "lucide-react";
import { deleteZoneAction, DeleteZoneResult } from "@/features/zones/actions/delete-zone-action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface DeleteZoneFormProps {
  zoneId: number;
  zoneName: string;
  className?: string;
  buttonClassName?: string;
  showIcon?: boolean;
  buttonText?: string;
  onSuccess?: () => void;
  redirectOnSuccess?: boolean;
}

export default function DeleteZoneForm({ 
  zoneId, 
  zoneName,
  className = "inline",
  buttonClassName = "flex w-full items-center text-destructive cursor-pointer",
  showIcon = true,
  buttonText = "Supprimer",
  onSuccess,
  redirectOnSuccess = false
}: DeleteZoneFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la zone "${zoneName}" ?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const result: DeleteZoneResult = await deleteZoneAction(formData);
        
        if (result.success) {
          toast.success(result.message || "Zone supprimée avec succès");
          onSuccess?.();
          
          if (redirectOnSuccess) {
            router.push("/zones");
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
      <input type="hidden" name="zoneId" value={zoneId} />
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