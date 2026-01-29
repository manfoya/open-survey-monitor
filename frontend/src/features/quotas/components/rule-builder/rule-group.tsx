import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuotaGroup, QuotaRule } from "@/features/quotas/types";
import { VariableDataType } from "@/features/variables/types";
import { Plus, Trash, Trash2 } from "lucide-react";
import RuleItem from "./rule-item";

interface RuleGroupProps {
  group: QuotaGroup;
  variables: VariableDataType[];
  onChange: (updatedGroup: QuotaGroup) => void;
  onRemove?: () => void; // Root group has no remove
  depth?: number;
}

export default function RuleGroup({
  group,
  variables,
  onChange,
  onRemove,
  depth = 0,
}: RuleGroupProps) {
  const handleAddRule = () => {
    // Default new rule
    const newRule: QuotaRule = {
      // id: crypto.randomUUID(), // Need a way to track inputs if using React keys, but here index might suffice for simple structure
      field: variables[0]?.slug || "",
      operator: "equals",
      value: "",
    };
    onChange({
      ...group,
      rules: [...group.rules, newRule],
    });
  };

  const handleAddGroup = () => {
    const newGroup: QuotaGroup = {
      combinator: "and",
      rules: [],
    };
    onChange({
      ...group,
      rules: [...group.rules, newGroup],
    });
  };

  const handleUpdateItem = (index: number, updatedItem: QuotaRule | QuotaGroup) => {
    const newRules = [...group.rules];
    newRules[index] = updatedItem;
    onChange({ ...group, rules: newRules });
  };

  const handleRemoveItem = (index: number) => {
    const newRules = group.rules.filter((_, i) => i !== index);
    onChange({ ...group, rules: newRules });
  };

  return (
    <div
      className={`p-4 rounded-lg border flex flex-col gap-4 ${
        depth === 0 ? "bg-card" : "bg-muted/30 ml-8 border-l-4 border-l-primary/20"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">
            CONDITIONS
          </span>
          <Select
            value={group.combinator}
            onValueChange={(val: "and" | "or") =>
              onChange({ ...group, combinator: val })
            }
          >
            <SelectTrigger className="w-[100px] h-8 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="and">ET (AND)</SelectItem>
              <SelectItem value="or">OU (OR)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive h-8 px-2"
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer le groupe
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {group.rules.map((ruleOrGroup, index) => {
          // Detect if it's a group or a rule
          const isGroup = "rules" in ruleOrGroup;

          if (isGroup) {
            return (
              <RuleGroup
                key={index} // Ideally use ID if available
                group={ruleOrGroup as QuotaGroup}
                variables={variables}
                depth={depth + 1}
                onChange={(updatedGroup) => handleUpdateItem(index, updatedGroup)}
                onRemove={() => handleRemoveItem(index)}
              />
            );
          } else {
            return (
              <RuleItem
                key={index}
                rule={ruleOrGroup as QuotaRule}
                variables={variables}
                onChange={(updatedRule) => handleUpdateItem(index, updatedRule)}
                onRemove={() => handleRemoveItem(index)}
              />
            );
          }
        })}

        {group.rules.length === 0 && (
          <div className="text-sm text-muted-foreground italic p-2 text-center border border-dashed rounded opacity-70">
            Aucune règle définie
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-2">
        <Button variant="outline" size="sm" onClick={handleAddRule}>
          <Plus className="h-3 w-3 mr-2" />
          Ajouter une règle
        </Button>
        <Button variant="ghost" size="sm" onClick={handleAddGroup}>
          <Plus className="h-3 w-3 mr-2" />
          Ajouter un groupe
        </Button>
      </div>
    </div>
  );
}
