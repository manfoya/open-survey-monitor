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
import { Clock, Database } from "lucide-react";
import { VariableDataType } from "@/features/variables/types";
import { VariableSelector } from "../variable-selector";
import { GlobalSettings } from "../../types";
import { errorDiv } from "@/features/app-shell/components/utils";

interface TimeRulesCardProps {
  defaultValues: GlobalSettings;
  variables: VariableDataType[];
  disabled: boolean;
  errors?: {
    heure_debut_travail?: string[];
    heure_fin_travail?: string[];
  };
}

export function TimeRulesCard({
  defaultValues,
  variables,
  disabled,
  errors,
}: TimeRulesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          Règles de Temps
        </CardTitle>
        <CardDescription>
          Configuration des horaires de travail valides pour les enquêtes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="check_heure"
            name="check_heure"
            defaultChecked={defaultValues.check_heure}
          />
          <Label
            htmlFor="check_heure"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Activer la vérification des horaires
          </Label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="heure_debut_travail">Heure de début</Label>
            <Input
              type="time"
              id="heure_debut_travail"
              name="heure_debut_travail"
              defaultValue={defaultValues.heure_debut_travail}
              disabled={disabled}
              aria-invalid={!!errors?.heure_debut_travail}
            />
            {errorDiv(errors?.heure_debut_travail)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="heure_fin_travail">Heure de fin</Label>
            <Input
              type="time"
              id="heure_fin_travail"
              name="heure_fin_travail"
              defaultValue={defaultValues.heure_fin_travail}
              disabled={disabled}
              aria-invalid={!!errors?.heure_fin_travail}
            />
            {errorDiv(errors?.heure_fin_travail)}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Database className="h-4 w-4" />
            Mapping des variables
          </div>
          <div className="grid grid-cols-2 gap-4">
            <VariableSelector
              name="variable_date_enquete"
              label="Variable Date Enquête"
              value={defaultValues.variable_date_enquete}
              variables={variables}
              disabled={disabled}
            />
            <VariableSelector
              name="variable_heure_enquete"
              label="Variable Heure Enquête"
              value={defaultValues.variable_heure_enquete}
              variables={variables}
              disabled={disabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
