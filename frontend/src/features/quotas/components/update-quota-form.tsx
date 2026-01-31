"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition, useActionState, useEffect } from "react";
import { VariableDataType } from "@/features/variables/types";
import { CreateQuotaDTO, Quota } from "@/features/quotas/types";
import { updateQuotaAction } from "@/features/quotas/actions/update-quota-action";
import QuotaExpressionPreview from "./quota-expression-preview";
import useQuotaForm from "../hooks/use-quota-form";
import RuleBuilder from "./rule-builder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sliders } from "lucide-react";
import { Label } from "@/components/ui/label";

interface UpdateQuotaFormProps {
  quota: Quota;
  variables: VariableDataType[];
}

export default function UpdateQuotaForm({
  quota,
  variables,
}: UpdateQuotaFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form State
  const { state: formState, actions: formActions } = useQuotaForm(quota);
  const { description, isActive, definition } = formState;

  // Server Action
  // We bind the ID to the action
  const updateQuotaWithId = updateQuotaAction.bind(null, quota.id);
  const [state, action] = useActionState(updateQuotaWithId, {
    success: false,
  });

  // Effect to handle success
  useEffect(() => {
    if (state.success) {
      toast.success(state.message || "Quota mis à jour avec succès");
      router.push("/quotas");
      router.refresh();
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state.success, state.message, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side quick checks
    if (definition.rules.length === 0) {
      toast.error("Définition incomplète", {
        description: "Veuillez ajouter au moins une condition pour ce quota.",
      });
      return;
    }

    startTransition(() => {
      const payload: CreateQuotaDTO = {
        description,
        is_active: isActive,
        definition,
      };
      // The action expects the payload directly because we bound the ID
      // But useActionState wraps it to pass formData?
      // No, with bind, the first args are fixed.
      // createQuotaAction signature: (prevState, values).
      // updateQuotaAction signature: (id, prevState, values).
      // updateQuotaWithId signature: (prevState, values).
      // This matches what useActionState expects for the trigger function: (payload) => void
      // Wait, useActionState(fn, initialState) returns [state, dispatch].
      // dispatch(payload) calls fn(state, payload).
      // so dispatch(payload) calls updateQuotaWithId(state, payload)
      // -> updateQuotaAction(id, state, payload).
      // Yes, this is correct.
      action(payload);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-6">
        {/* Informations Générales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description / Nom du quota</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) =>
                  formActions.onDescriptionChange(e.target.value)
                }
                placeholder="Ex: Femmes 18-25 ans à Dakar"
                required
                disabled={isPending}
                aria-invalid={!!state.errors?.description}
              />
              {state.errors?.description && (
                <p className="text-xs text-red-500">
                  {state.errors.description}
                </p>
              )}
            </div>

            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="is_active" className="text-base">
                  Activer ce quota
                </Label>
                <p className="text-sm text-muted-foreground">
                  Rend ce quota disponible pour les enquêtes.
                </p>
              </div>
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={formActions.onIsActiveChange}
                disabled={isPending}
              />
            </div>
          </CardContent>
        </Card>

        {/* Constructeur de Règles */}
        <Card className={state.errors?.definition ? "border-red-500" : ""}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sliders className="h-5 w-5" />
              Définition des règles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RuleBuilder
              variables={variables}
              value={definition}
              onChange={formActions.onDefinitionChange}
            />

            <QuotaExpressionPreview
              definition={definition}
              variables={variables}
            />
            {state.errors?.definition && (
              <p className="text-xs text-red-500">{state.errors.definition}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Mise à jour..." : "Mettre à jour le quota"}
        </Button>
      </div>
    </form>
  );
}
