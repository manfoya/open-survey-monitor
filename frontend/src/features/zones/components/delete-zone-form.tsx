"use client";

import { Trash2 } from "lucide-react";
import { deleteZoneAction } from "@/features/zones/actions/delete-zone-action";
import { toast } from "sonner";
import { useActionState, useEffect } from "react";

interface DeleteZoneFormProps {
  zoneId: number;
  className?: string;
  buttonClassName?: string;
  showIcon?: boolean;
  buttonText?: string;
  redirectOnSuccess?: boolean;
}

export default function DeleteZoneForm({
  zoneId,
  className = "inline",
  buttonClassName = "flex w-full items-center text-destructive cursor-pointer",
  showIcon = true,
  buttonText = "Supprimer",
  redirectOnSuccess = false,
}: DeleteZoneFormProps) {
  const deleteZoneActionWithId = deleteZoneAction.bind(null, zoneId);
  const [state, formAction, isPending] = useActionState(
    deleteZoneActionWithId,
    {},
  );

  useEffect(() => {
    if (state.success === true) {
      toast.success(state.message || "Zone supprimée avec succès !");
    } else if (state.success === false) {
      toast.error(state.message || "Erreur lors de la suppression de la zone.");
    }
  }, [state]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette zone ?")) {
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
        name="redirect"
        value={redirectOnSuccess.toString()}
      />
    </form>
  );
}
