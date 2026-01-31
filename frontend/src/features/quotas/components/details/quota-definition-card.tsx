import { QuotaDefinition } from "@/features/quotas/types";
import { VariableDataType } from "@/features/variables/types";
import QuotaExpressionPreview from "../quota-expression-preview";

interface QuotaDefinitionCardProps {
  definition: QuotaDefinition;
  variables: VariableDataType[];
}

export default function QuotaDefinitionCard({
  definition,
  variables,
}: QuotaDefinitionCardProps) {
  return (
    <div className="space-y-6">
      <QuotaExpressionPreview definition={definition} variables={variables} />
    </div>
  );
}
