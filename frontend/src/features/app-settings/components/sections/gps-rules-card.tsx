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
import { MapPin, Database } from "lucide-react";
import { VariableDataType } from "@/features/variables/types";
import { VariableSelector } from "../variable-selector";
import { GlobalSettings } from "../../types";
import { errorDiv } from "@/features/app-shell/components/utils";

interface GpsRulesCardProps {
  defaultValues: GlobalSettings;
  variables: VariableDataType[];
  disabled: boolean;
  errors?: {
    tolerance_gps_metres?: string[];
  };
}

export function GpsRulesCard({
  defaultValues,
  variables,
  disabled,
  errors,
}: GpsRulesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-yellow-500" />
          Règles GPS
        </CardTitle>
        <CardDescription>
          Configuration de la tolérance géographique pour les enquêtes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="check_gps"
            name="check_gps"
            defaultChecked={defaultValues.check_gps}
          />
          <Label
            htmlFor="check_gps"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Activer la vérification GPS
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tolerance_gps_metres">Tolérance GPS (mètres)</Label>
          <Input
            type="number"
            id="tolerance_gps_metres"
            name="tolerance_gps_metres"
            defaultValue={defaultValues.tolerance_gps_metres}
            min="0"
            max="50000"
            className="max-w-xs"
            disabled={disabled}
            aria-invalid={!!errors?.tolerance_gps_metres}
          />
          <div className="text-xs text-muted-foreground">
            Valeur entre 0 et 50000 mètres (50km)
          </div>
          {errorDiv(errors?.tolerance_gps_metres)}
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Database className="h-4 w-4" />
            Mapping des variables GPS
          </div>
          <div className="grid grid-cols-2 gap-4">
            <VariableSelector
              name="variable_gps_lat"
              label="Latitude"
              value={defaultValues.variable_gps_lat}
              placeholder="Sélectionner la latitude"
              variables={variables}
              disabled={disabled}
            />
            <VariableSelector
              name="variable_gps_lon"
              label="Longitude"
              value={defaultValues.variable_gps_lon}
              placeholder="Sélectionner la longitude"
              variables={variables}
              disabled={disabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
