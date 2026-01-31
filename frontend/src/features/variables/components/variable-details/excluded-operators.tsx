import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AVAILABLE_OPERATORS,
  VariableDataType,
} from "@/features/variables/types";
import { Ban } from "lucide-react";
import { cn } from "@/lib/utils"; // Assurez-vous d'importer cn

export default function VariableExcludedOperators({
  variable,
  className,
}: {
  variable: VariableDataType;
  className?: string;
}) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Ban className="h-4 w-4" />
          Opérateurs exclus
        </CardTitle>
      </CardHeader>
      <CardContent>
        {variable.excluded_operators &&
        variable.excluded_operators.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {variable.excluded_operators.map((op) => {
              const opInfo = AVAILABLE_OPERATORS.find((o) => o.value === op);
              return (
                <Badge
                  key={op}
                  variant="secondary"
                  className="text-xs bg-muted text-muted-foreground hover:bg-muted"
                >
                  {opInfo?.label || op}
                </Badge>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Aucun opérateur n&apos;est exclu.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
