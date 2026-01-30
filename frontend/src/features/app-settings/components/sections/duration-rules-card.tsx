
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Timer, Database } from "lucide-react";
import { VariableDataType } from "@/features/variables/types";
import { VariableSelector } from "../variable-selector";
import { GlobalSettings } from "../../types";
import { errorDiv } from "@/features/app-shell/components/utils";

interface DurationRulesCardProps {
  defaultValues: GlobalSettings;
  variables: VariableDataType[];
  disabled: boolean;
  errors?: {
    min_duree_minutes?: string[];
  };
}

export function DurationRulesCard({
  defaultValues,
  variables,
  disabled,
  errors,
}: DurationRulesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-red-500" />
          Règles de Durée
        </CardTitle>
        <CardDescription>
          Définissez la durée minimale acceptable pour une enquête.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="check_duree"
            name="check_duree"
            defaultChecked={defaultValues.check_duree}
          />
          <Label
            htmlFor="check_duree"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Activer la vérification de durée
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="min_duree_minutes">Durée minimale (minutes)</Label>
          <Input
            type="number"
            id="min_duree_minutes"
            name="min_duree_minutes"
            defaultValue={defaultValues.min_duree_minutes}
            min="1"
            max="1440"
            className="max-w-xs"
            disabled={disabled}
            aria-invalid={!!errors?.min_duree_minutes}
          />
          <div className="text-xs text-muted-foreground">
            Valeur entre 1 et 1440 minutes (24h)
          </div>
          {errorDiv(errors?.min_duree_minutes)}
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Database className="h-4 w-4" />
            Mapping des variables de durée
          </div>
          <div className="grid grid-cols-2 gap-4">
            <VariableSelector
              name="variable_duree_start"
              label="Début de l'enquête"
              value={defaultValues.variable_duree_start}
              placeholder="Variable début"
              variables={variables}
              disabled={disabled}
            />
            <VariableSelector
              name="variable_duree_end"
              label="Fin de l'enquête"
              value={defaultValues.variable_duree_end}
              placeholder="Variable fin"
              variables={variables}
              disabled={disabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
