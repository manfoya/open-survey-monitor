"use client";

import { useActionState, useEffect, useState } from "react";
import { createQuotaAssignmentAction } from "../actions/create-assignment-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FormCombobox } from "@/components/form-combobox";
import { toast } from "sonner";
import { UserProfile } from "@/features/auth/types";
import { Quota } from "@/features/quotas/types";

interface CreateQuotaAssignmentFormProps {
  users: UserProfile[];
  quotas: Quota[];
  onSuccess?: () => void;
}

export default function CreateQuotaAssignmentForm({
  users,
  quotas,
  onSuccess,
}: CreateQuotaAssignmentFormProps) {
  const [state, formAction, isPending] = useActionState(
    createQuotaAssignmentAction,
    {},
  );
  const [isActive, setIsActive] = useState(true);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedQuota, setSelectedQuota] = useState("");

  // Map users and quotas to combobox items
  const userItems = users.map((u) => ({
    value: u.id.toString(),
    label: u.username,
  }));

  const quotaItems = quotas.map((q) => ({
    value: q.id.toString(),
    label: q.description,
  }));

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
      <FormCombobox
        label="Agent"
        name="user_id"
        items={userItems}
        value={selectedUser}
        onChange={setSelectedUser}
        placeholder="Sélectionner un agent"
        searchPlaceholder="Rechercher un agent..."
        emptyLabel="Aucun agent trouvé."
        error={state.errors?.user_id}
      />

      <FormCombobox
        label="Quota"
        name="quota_id"
        items={quotaItems}
        value={selectedQuota}
        onChange={setSelectedQuota}
        placeholder="Sélectionner un quota"
        searchPlaceholder="Rechercher un quota..."
        emptyLabel="Aucun quota trouvé."
        error={state.errors?.quota_id}
      />

      <div className="space-y-2">
        <Label htmlFor="effectif_cible">Effectif Cible</Label>
        <Input
          id="effectif_cible"
          name="effectif_cible"
          type="number"
          min="1"
          placeholder="Ex: 10"
        />
        {state.errors?.effectif_cible && (
          <p className="text-sm text-red-500">
            {state.errors.effectif_cible.join(", ")}
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
        {isPending ? "Création en cours..." : "Créer l'assignation"}
      </Button>
    </form>
  );
}
