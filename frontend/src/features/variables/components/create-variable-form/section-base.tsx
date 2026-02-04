import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DATA_TYPES, DataType } from "../../types";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function BaseInfoSection({
  label,
  slug,
  dataType,
  isQuota,
  onLabelChange,
  onSlugChange,
  onDataTypeChange,
  onIsQuotaChange,
}: {
  label: string;
  slug: string;
  dataType: DataType;
  isQuota: boolean;
  onLabelChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onDataTypeChange: (value: DataType) => void;
  onIsQuotaChange: (value: boolean) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations de base</CardTitle>
        <CardDescription>Configuration générale de la variable</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Label pour humain */}
            <div className="space-y-2">
              <Label htmlFor="label">Libellé</Label>
              <Input
                id="label"
                placeholder="ex: Sexe du chef de ménage"
                value={label}
                onChange={(e) => onLabelChange(e.target.value)}
              />
            </div>

            {/* Slug pour système */}
            <div className="space-y-2">
              <Label htmlFor="slug">Identifiant technique (slug)</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => onSlugChange(e.target.value)}
                className="bg-muted font-mono text-sm"
                placeholder="sexe_cm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
            <DataTypeSelect value={dataType} onValueChange={onDataTypeChange} />
            <QuotaSwitch value={isQuota} onCheckedChange={onIsQuotaChange} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DataTypeSelect({
  value,
  onValueChange,
}: {
  value: DataType;
  onValueChange: (value: DataType) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="dataType">Type de donnée</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id="dataType">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DATA_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              <div className="flex flex-col">
                <span className="font-medium">{type.label}</span>
                <span className="text-xs text-muted-foreground">
                  {type.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function QuotaSwitch({
  value,
  onCheckedChange,
}: {
  value: boolean;
  onCheckedChange: (val: boolean) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="isQuota">Utilisable pour les Quotas ?</Label>
        <Switch
          id="isQuota"
          checked={value}
          onCheckedChange={onCheckedChange}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {value
          ? "Cette variable sera disponible dans le Query Builder"
          : "Cette variable ne sera pas utilisée pour créer des quotas"}
      </p>
    </div>
  );
}
