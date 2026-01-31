import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "lucide-react";
import { GlobalSettings } from "../../types";

const JOURS_SEMAINE = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

interface DayRulesCardProps {
  defaultValues: GlobalSettings;
  disabled: boolean;
  joursInterdits: string[];
  onJourChange: (jour: string, checked: boolean) => void;
}

export function DayRulesCard({
  defaultValues,
  disabled,
  joursInterdits,
  onJourChange,
}: DayRulesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-500" />
          Règles de Jours
        </CardTitle>
        <CardDescription>
          Définissez les jours où les enquêtes ne sont pas autorisées.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="check_jours"
            name="check_jours"
            defaultChecked={defaultValues.check_jours}
          />
          <Label
            htmlFor="check_jours"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Activer l&apos;interdiction de certains jours
          </Label>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Jours interdits</Label>
          <div className="grid grid-cols-4 gap-3">
            {JOURS_SEMAINE.map((jour) => (
              <div key={jour} className="flex items-center space-x-2">
                <Checkbox
                  id={jour}
                  checked={joursInterdits.includes(jour)}
                  onCheckedChange={(checked) =>
                    onJourChange(jour, checked as boolean)
                  }
                  disabled={disabled}
                />
                <Label htmlFor={jour} className="text-sm">
                  {jour}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
