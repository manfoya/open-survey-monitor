import {
  QuotaDefinition,
  QuotaGroup,
  QuotaRule,
} from "@/features/quotas/types";
import { VariableDataType } from "@/features/variables/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface QuotaExpressionPreviewProps {
  definition: QuotaDefinition;
  variables: VariableDataType[];
}

export default function QuotaExpressionPreview({
  definition,
  variables,
}: QuotaExpressionPreviewProps) {
  const getVariableLabel = (slug: string) => {
    return variables.find((v) => v.slug === slug)?.label || slug;
  };

  const formatOperator = (op: string) => {
    switch (op) {
      case "equals":
        return "=";
      case "not_equals":
        return "≠";
      case "greater_than":
        return ">";
      case "less_than":
        return "<";
      case "greater_equal":
        return "≥";
      case "less_equal":
        return "≤";
      case "contains":
        return "contient";
      case "begins_with":
        return "commence par";
      case "ends_with":
        return "finit par";
      case "in_list":
        return "dans";
      default:
        return op;
    }
  };

  const formatValue = (val: string | number | boolean) => {
    if (typeof val === "string") return `"${val}"`;
    return String(val);
  };

  const renderGroup = (
    group: QuotaGroup | QuotaDefinition,
    depth = 0,
  ): string => {
    if (!group.rules || group.rules.length === 0) return "";

    const parts = group.rules
      .map((ruleOrGroup) => {
        if ("combinator" in ruleOrGroup) {
          // It's a group
          const groupStr = renderGroup(ruleOrGroup as QuotaGroup, depth + 1);
          return groupStr ? `(${groupStr})` : "";
        } else {
          // It's a rule
          const rule = ruleOrGroup as QuotaRule;
          if (!rule.field) return "???";
          return `(${getVariableLabel(rule.field)} ${formatOperator(rule.operator)} ${formatValue(rule.value)})`;
        }
      })
      .filter(Boolean);

    if (parts.length === 0) return "";

    const separator = group.combinator === "and" ? " ET " : " OU ";
    return parts.join(separator);
  };

  const expression = renderGroup(definition);

  if (!expression) return null;

  return (
    <Card className="bg-muted/10 border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
          <FileText className="h-4 w-4 mr-2" />
          Aperçu de l'expression
        </CardTitle>
      </CardHeader>
      <CardContent>
        <code className="text-sm font-mono block bg-card p-3 rounded border">
          {expression}
        </code>
      </CardContent>
    </Card>
  );
}
