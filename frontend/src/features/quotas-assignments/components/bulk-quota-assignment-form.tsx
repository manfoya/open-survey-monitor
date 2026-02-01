"use client";

import { useActionState, useEffect, useState } from "react";
import { bulkAssignQuotasAction } from "@/features/quotas-assignments/actions/bulk-assign-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UserMultiSelect, Option } from "./user-multi-select";
import { FormCombobox } from "@/components/form-combobox";
import { toast } from "sonner";
import { UserProfile } from "@/features/auth/types";
import { Quota } from "@/features/quotas/types";
import { useRouter } from "next/navigation";
import { errorDiv } from "@/features/app-shell/components/utils";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface BulkQuotaAssignmentFormProps {
  users: UserProfile[];
  quotas: Quota[];
}

export default function BulkQuotaAssignmentForm({
  users,
  quotas,
}: BulkQuotaAssignmentFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    bulkAssignQuotasAction,
    {},
  );

  const [isActive, setIsActive] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedQuota, setSelectedQuota] = useState("");

  const userOptions: Option[] = users.map((u) => ({
    value: u.id.toString(),
    label: u.username,
  }));

  const quotaItems = quotas.map((q) => ({
    value: q.id.toString(),
    label: q.description,
  }));

  const emptyQuotaMessage =
    quotas.length === 0
      ? "Aucun quota disponible."
      : "Aucun quota ne correspond à votre recherche.";

  useEffect(() => {
    if (state.success === true) {
      toast.success(state.message || "Assignations créées avec succès.");
      router.push("/quotas-assignments");
    } else if (state.success === false && state.message) {
      toast.error(state.message || "Erreur lors de la création.");
    }
  }, [state, router]);

  return (
    <form
      action={formAction}
      className="space-y-6 max-w-2xl mx-auto p-6 bg-card rounded-lg border shadow-sm"
    >
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/quotas-assignments">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Assignation en masse</h1>
          <p className="text-muted-foreground">
            Assignez un même quota à plusieurs agents simultanément.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <input type="hidden" name="quota_id" value={selectedQuota} />
        <FormCombobox
          label="Quota"
          name="quota_combobox"
          items={quotaItems}
          placeholder="Sélectionner un quota"
          emptyLabel={emptyQuotaMessage}
          value={selectedQuota}
          onChange={setSelectedQuota}
        />
        {errorDiv(state.errors?.quota_id)}
      </div>

      <div className="space-y-2">
        <Label>Agents</Label>
        {/* We need to pass multiple user_ids. We can use hidden inputs for each. */}
        {selectedUserIds.map((id) => (
          <input key={id} type="hidden" name="user_ids" value={id} />
        ))}
        <UserMultiSelect
          options={userOptions}
          selected={selectedUserIds}
          onChange={setSelectedUserIds}
          placeholder="Sélectionner des agents..."
        />
        {errorDiv(state.errors?.user_ids)}
        <p className="text-xs text-muted-foreground">
          {selectedUserIds.length} agent(s) sélectionné(s).
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="effectif_cible">Objectif (Effectif Cible)</Label>
        <Input
          id="effectif_cible"
          name="effectif_cible"
          type="number"
          min="1"
          placeholder="Ex: 10"
          required
        />
        {errorDiv(state.errors?.effectif_cible)}
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

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Création en cours..." : "Créer les assignations"}
      </Button>
    </form>
  );
}
