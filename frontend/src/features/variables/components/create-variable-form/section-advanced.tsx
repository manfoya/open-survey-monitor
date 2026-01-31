import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import { OperatorType, AVAILABLE_OPERATORS } from "../../types";

export default function AdvancedSettingsSection({
  excludedOperators,
  toggleOperator,
}: {
  excludedOperators: Set<OperatorType>;
  toggleOperator: (operator: OperatorType) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres avancés</CardTitle>
        <CardDescription>
          Contrôlez quels opérateurs seront disponibles dans le Query Builder
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Label>Opérateurs à exclure</Label>
          <p className="text-sm text-muted-foreground">
            Cochez les opérateurs qui ne doivent PAS être disponibles pour cette
            variable
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AVAILABLE_OPERATORS.map((operator) => (
              <div
                key={operator.value}
                className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50"
              >
                <Checkbox
                  id={operator.value}
                  checked={excludedOperators.has(operator.value)}
                  onCheckedChange={() => toggleOperator(operator.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label
                    htmlFor={operator.value}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {operator.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {operator.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {excludedOperators.size > 0 && (
            <div className="flex items-center gap-2 text-sm text-amber-500 mt-3">
              <Info className="h-4 w-4" />
              <span>
                {excludedOperators.size} opérateur(s) seront masqués dans le
                Query Builder
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
