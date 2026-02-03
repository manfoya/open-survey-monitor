import { useState } from "react";
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
import { FormCombobox, ComboboxItem } from "@/components/form-combobox";

interface DataSourceCardProps {
  defaultValues: GlobalSettings;
  variables: VariableDataType[];
  disabled: boolean;
  tables: string[];
}

export function DataSourceCard({
  defaultValues,
  variables,
  disabled,
  tables,
}: DataSourceCardProps) {
  const [selectedTable, setSelectedTable] = useState(defaultValues.target_table_name || "");

  const tableItems: ComboboxItem[] = tables.map((table) => ({
    value: table,
    label: table,
  }));

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
        <FormCombobox
          label="Table Source"
          name="target_table_name"
          value={selectedTable}
          onChange={setSelectedTable}
          items={tableItems}
          disabled={disabled}
          placeholder="Sélectionner une table..."
          searchPlaceholder="Rechercher une table..."
        />

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
