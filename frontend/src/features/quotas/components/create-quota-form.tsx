"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { VariableDataType } from "@/features/variables/types";
import { CreateQuotaDTO, QuotaDefinition } from "@/features/quotas/types";
import { createQuota } from "@/features/quotas/services";
import RuleBuilder from "./rule-builder";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Sliders } from "lucide-react";
import { Label } from "@/components/ui/label";
import QuotaExpressionPreview from "./quota-expression-preview";

interface CreateQuotaFormProps {
  variables: VariableDataType[];
}

export default function CreateQuotaForm({ variables }: CreateQuotaFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form State
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [definition, setDefinition] = useState<QuotaDefinition>({
    combinator: "and",
    rules: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (definition.rules.length === 0) {
      toast.error("Définition incomplète", {
        description: "Veuillez ajouter au moins une condition pour ce quota.",
      });
      return;
    }

    if (description.trim().length < 3) {
      toast.error("Description invalide", {
        description: "La description doit contenir au moins 3 caractères.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const payload: CreateQuotaDTO = {
          description,
          is_active: isActive,
          definition,
        };

        await createQuota(payload);

        toast.success("Quota créé", {
          description:
            "Le nouveau modèle de quota a été enregistré avec succès.",
        });

        router.push("/quotas"); // Assuming listing page exists or will exist
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error("Erreur", {
          description: "Une erreur est survenue lors de la création du quota.",
        });
      }
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
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Femmes 18-25 ans à Dakar"
                required
              />
              <p className="text-sm text-muted-foreground">
                Donnez un nom clair qui décrit la population ciblée.
              </p>
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
                onCheckedChange={setIsActive}
              />
            </div>
          </CardContent>
        </Card>

        {/* Constructeur de Règles */}
        <Card>
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
              onChange={setDefinition}
            />

            <QuotaExpressionPreview
              definition={definition}
              variables={variables}
            />
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
          {isPending ? "Enregistrement..." : "Créer le quota"}
        </Button>
      </div>
    </form>
  );
}
