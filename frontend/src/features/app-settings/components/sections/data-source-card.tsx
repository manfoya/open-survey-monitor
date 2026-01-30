
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Database } from "lucide-react";
import { VariableDataType } from "@/features/variables/types";
import { VariableSelector } from "../variable-selector";
import { GlobalSettings } from "../../types";

interface DataSourceCardProps {
  defaultValues: GlobalSettings;
  variables: VariableDataType[];
  disabled: boolean;
  tables: string[];
  loadingTables: boolean;
}

export function DataSourceCard({
  defaultValues,
  variables,
  disabled,
  tables,
  loadingTables,
}: DataSourceCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Source de Données
        </CardTitle>
        <CardDescription>
          Sélectionnez la table SQL source et configurez le mapping des
          variables internes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="target_table_name">Table Source</Label>
          <select
            id="target_table_name"
            name="target_table_name"
            defaultValue={defaultValues.target_table_name || ""}
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled || loadingTables}
          >
            <option value="" disabled>
              Sélectionner une table...
            </option>
            {tables.map((table) => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </select>
          {loadingTables && (
            <p className="text-xs text-muted-foreground">
              Chargement des tables...
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
          <div className="space-y-4">
            <Label className="text-base font-semibold">Identifiants</Label>
            <VariableSelector
              name="variable_id_interne"
              label="Variable UUID (ID unique)"
              value={defaultValues.variable_id_interne}
              variables={variables}
              disabled={disabled}
            />
            <VariableSelector
              name="variable_code_agent"
              label="Variable Code Agent"
              value={defaultValues.variable_code_agent}
              variables={variables}
              disabled={disabled}
            />
          </div>
          <div className="space-y-4">
            <Label className="text-base font-semibold">Status Partiel</Label>
            <VariableSelector
              name="variable_indicateur_partiel"
              label="Indicateur de statut (Partiel/Complet)"
              value={defaultValues.variable_indicateur_partiel}
              variables={variables}
              disabled={disabled}
            />
            <div className="space-y-2">
              <Label htmlFor="valeur_partiel">Valeur si Partiel</Label>
              <Input
                id="valeur_partiel"
                name="valeur_partiel"
                defaultValue={defaultValues.valeur_partiel}
                placeholder="ex: 1, PARTIEL, true..."
                disabled={disabled}
              />
              <p className="text-xs text-muted-foreground">
                La valeur qui indique que l&apos;enquête est partielle dans la
                base.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
