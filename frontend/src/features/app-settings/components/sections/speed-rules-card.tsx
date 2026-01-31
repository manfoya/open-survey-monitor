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
import { Zap } from "lucide-react";
import { GlobalSettings } from "../../types";
import { errorDiv } from "@/features/app-shell/components/utils";

interface SpeedRulesCardProps {
  defaultValues: GlobalSettings;
  disabled: boolean;
  errors?: {
    max_enquetes_par_jour?: string[];
  };
}

export function SpeedRulesCard({
  defaultValues,
  disabled,
  errors,
}: SpeedRulesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-500" />
          Limites Journalières
        </CardTitle>
        <CardDescription>
          Contrôlez le nombre maximum d&apos;enquêtes par jour par agent.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="check_vitesse"
            name="check_vitesse"
            defaultChecked={defaultValues.check_vitesse}
          />
          <Label
            htmlFor="check_vitesse"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Activer la limite journalière
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_enquetes_par_jour">
            Maximum d&apos;enquêtes par jour
          </Label>
          <Input
            type="number"
            id="max_enquetes_par_jour"
            name="max_enquetes_par_jour"
            defaultValue={defaultValues.max_enquetes_par_jour}
            min="1"
            max="200"
            className="max-w-xs"
            disabled={disabled}
            aria-invalid={!!errors?.max_enquetes_par_jour}
          />
          <div className="text-xs text-muted-foreground">
            Valeur entre 1 et 200 enquêtes par jour
          </div>
          {errorDiv(errors?.max_enquetes_par_jour)}
        </div>
      </CardContent>
    </Card>
  );
}
