import { QuotaDefinition } from "@/features/quotas/types";
import { VariableDataType } from "@/features/variables/types";
import RuleGroup from "./rule-group";

interface RuleBuilderProps {
  variables: VariableDataType[];
  value: QuotaDefinition;
  onChange: (value: QuotaDefinition) => void;
}

export default function RuleBuilder({
  variables,
  value,
  onChange,
}: RuleBuilderProps) {
  return (
    <div className="border rounded-md bg-muted/10 p-4">
      <RuleGroup
        group={value} // QuotaDefinition structure matches QuotaGroup
        variables={variables}
        onChange={onChange}
        // Root cannot be removed
      />
    </div>
  );
}
