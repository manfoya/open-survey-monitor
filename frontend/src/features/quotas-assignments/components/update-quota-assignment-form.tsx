"use client";

import { useActionState, useEffect, useState } from "react";
import { updateQuotaAssignmentAction } from "../actions/update-assignment-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { QuotaAssignment } from "../types";

interface UpdateQuotaAssignmentFormProps {
  assignment: QuotaAssignment;
  onSuccess?: () => void;
}

export default function UpdateQuotaAssignmentForm({
  assignment,
  onSuccess,
}: UpdateQuotaAssignmentFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateQuotaAssignmentAction,
    {},
  );

  const [isActive, setIsActive] = useState(assignment.is_active);

  useEffect(() => {
    if (state.success) {
      toast.success("Succès", {
        description: state.message,
      });
      if (onSuccess) onSuccess();
    } else if (state.message) {
      toast.error("Erreur", {
        description: state.message,
      });
    }
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={assignment.id} />

      <div className="space-y-2">
        <Label htmlFor="agent">Agent</Label>
        <Input
          id="agent"
          value={assignment.user.username}
          disabled
          className="bg-muted"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quota">Quota</Label>
        <Input
          id="quota"
          value={assignment.quota.description}
          disabled
          className="bg-muted"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="effectif_cible">Effectif Cible</Label>
        <Input
          id="effectif_cible"
          name="effectif_cible"
          type="number"
          min="0"
          defaultValue={assignment.effectif_cible}
        />
        {state.errors?.effectif_cible && (
          <p className="text-sm text-red-500">
            {state.errors.effectif_cible.join(", ")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="effectif_actuel">Effectif Actuel</Label>
        <Input
          id="effectif_actuel"
          name="effectif_actuel"
          type="number"
          min="0"
          defaultValue={assignment.effectif_actuel}
        />
        {state.errors?.effectif_actuel && (
          <p className="text-sm text-red-500">
            {state.errors.effectif_actuel.join(", ")}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          name="is_active"
          checked={isActive}
          onCheckedChange={setIsActive}
        />
        <Label htmlFor="is_active">Actif</Label>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Modification en cours..." : "Modifier l'assignation"}
      </Button>
    </form>
  );
}
