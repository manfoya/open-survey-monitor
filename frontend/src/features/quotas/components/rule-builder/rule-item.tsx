import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuotaRule } from "@/features/quotas/types";
import {
  AVAILABLE_OPERATORS,
  DataType,
  VariableDataType,
} from "@/features/variables/types";
import { Trash2 } from "lucide-react";
import { memo } from "react";

interface RuleItemProps {
  rule: QuotaRule;
  variables: VariableDataType[];
  onChange: (updatedRule: QuotaRule) => void;
  onRemove: () => void;
  disabled?: boolean;
}

const RuleItem = memo(function RuleItem({
  rule,
  variables,
  onChange,
  onRemove,
  disabled = false,
}: RuleItemProps) {
  const selectedVariable = variables.find((v) => v.slug === rule.field);
  const operators = AVAILABLE_OPERATORS.filter(
    (op) => !selectedVariable?.excluded_operators?.includes(op.value),
  );

  const handleVariableChange = (slug: string) => {
    onChange({
      ...rule,
      field: slug,
      value: "",
    });
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-background border rounded-md">
      <Select
        value={rule.field}
        onValueChange={handleVariableChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Variable" />
        </SelectTrigger>
        <SelectContent>
          {variables.map((v) => (
            <SelectItem key={v.id} value={v.slug}>
              {v.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={rule.operator}
        onValueChange={(val: any) => onChange({ ...rule, operator: val })}
        disabled={disabled}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Opérateur" />
        </SelectTrigger>
        <SelectContent>
          {operators.map((op) => (
            <SelectItem key={op.value} value={op.value}>
              {op.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex-1">
        {selectedVariable?.data_type === DataType.LIST &&
        selectedVariable.modalites ? (
          <Select
            value={String(rule.value)}
            onValueChange={(val) => onChange({ ...rule, value: val })}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir une valeur" />
            </SelectTrigger>
            <SelectContent>
              {selectedVariable.modalites.map((mod) => (
                <SelectItem key={mod.value} value={mod.value}>
                  {mod.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : selectedVariable?.data_type === DataType.NUMBER ? (
          <Input
            type="number"
            value={rule.value as string}
            onChange={(e) =>
              onChange({ ...rule, value: Number(e.target.value) })
            }
            placeholder="Valeur numérique"
            disabled={disabled}
          />
        ) : (
          <Input
            type="text"
            value={rule.value as string}
            onChange={(e) => onChange({ ...rule, value: e.target.value })}
            placeholder="Valeur"
            disabled={disabled}
          />
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-destructive hover:bg-destructive/10"
        onClick={onRemove}
        disabled={disabled}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
});

export default RuleItem;
