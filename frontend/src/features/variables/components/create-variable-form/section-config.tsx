import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  DATA_TYPES,
  DataType,
  Modalite,
  PropertySetter,
  UIConfig,
} from "../../types";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plus, GripVertical, Trash2, Info } from "lucide-react";

export default function DynamicConfigSection({
  dataType,
  uiConfig,
  updateUIConfig,
  modalites,
  addModalite,
  updateModalite,
  removeModalite,
}: {
  dataType: DataType;
  uiConfig: UIConfig;
  updateUIConfig: PropertySetter<UIConfig>;
  modalites: Modalite[];
  addModalite: () => void;
  updateModalite: (
    id: string,
    field: keyof Modalite,
    value: string | number,
  ) => void;
  removeModalite: (id: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration spécifique</CardTitle>
        <CardDescription>
          Paramètres pour le type &quot;
          {DATA_TYPES.find((t) => t.value === dataType)?.label}&quot;
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderDynamicConfigByType(dataType, {
          uiConfig,
          updateUIConfig,
          modalites,
          addModalite,
          updateModalite,
          removeModalite,
        })}
      </CardContent>
    </Card>
  );
}

function renderDynamicConfigByType(
  dataType: DataType,
  handlers: {
    uiConfig: UIConfig;
    updateUIConfig: PropertySetter<UIConfig>;
    modalites: Modalite[];
    addModalite: () => void;
    updateModalite: (
      id: string,
      field: keyof Modalite,
      value: string | number,
    ) => void;
    removeModalite: (id: string) => void;
  },
) {
  switch (dataType) {
    case DataType.NUMBER:
      return <NumberDynamicConfig {...handlers} />;
    case DataType.LIST:
      return <ListDynamicConfig {...handlers} />;
    case DataType.DATE:
      return <DateDynamicConfig {...handlers} />;
    case DataType.TEXT:
      return <TextDynamicConfig {...handlers} />;
    default:
      return null;
  }
}

function NumberDynamicConfig({
  uiConfig,
  updateUIConfig,
}: {
  uiConfig: UIConfig;
  updateUIConfig: PropertySetter<UIConfig>;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="min">Minimum</Label>
          <Input
            id="min"
            type="number"
            placeholder="0"
            value={uiConfig.min?.toString() || ""}
            onChange={(e) =>
              updateUIConfig(
                "min",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max">Maximum</Label>
          <Input
            id="max"
            type="number"
            placeholder="120"
            value={uiConfig.max?.toString() || ""}
            onChange={(e) =>
              updateUIConfig(
                "max",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="step">Incrément</Label>
          <Input
            id="step"
            type="number"
            placeholder="1"
            value={uiConfig.step?.toString() || ""}
            onChange={(e) =>
              updateUIConfig(
                "step",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="unit">Unité</Label>
          <Input
            id="unit"
            placeholder="ans, FCFA, kg..."
            value={uiConfig.unit || ""}
            onChange={(e) => updateUIConfig("unit", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="placeholder">Placeholder</Label>
          <Input
            id="placeholder"
            placeholder="Entrez l'âge en années"
            value={uiConfig.placeholder || ""}
            onChange={(e) => updateUIConfig("placeholder", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function ListDynamicConfig({
  modalites,
  addModalite,
  updateModalite,
  removeModalite,
}: {
  modalites: Modalite[];
  addModalite: () => void;
  updateModalite: (
    id: string,
    field: keyof Modalite,
    value: string | number,
  ) => void;
  removeModalite: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label>Éditeur de modalités</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Définissez les options disponibles pour cette variable
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addModalite}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une option
        </Button>
      </div>

      {modalites.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_2fr_auto] gap-3 p-3 bg-muted/50 font-medium text-sm">
            <div>Ordre</div>
            <div>Code (Value)</div>
            <div>Libellé (Label)</div>
            <div>Action</div>
          </div>
          <Separator />
          {modalites.map((modalite) => (
            <div
              key={modalite.id}
              className="grid grid-cols-[auto_1fr_2fr_auto] gap-3 p-3 items-center border-b last:border-b-0"
            >
              <div className="flex items-center">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move mr-2" />
                <Badge variant="outline" className="text-xs">
                  {modalite.order}
                </Badge>
              </div>
              <Input
                placeholder="1"
                value={modalite.value}
                onChange={(e) =>
                  updateModalite(modalite.id, "value", e.target.value)
                }
                className="h-9"
              />
              <Input
                placeholder="Masculin"
                value={modalite.label}
                onChange={(e) =>
                  updateModalite(modalite.id, "label", e.target.value)
                }
                className="h-9"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeModalite(modalite.id)}
                className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {modalites.length === 0 && (
        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/20">
          <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="font-medium">Aucune modalité définie</p>
          <p className="text-sm">
            Ajoutez au moins une option pour cette variable
          </p>
        </div>
      )}
    </div>
  );
}

function DateDynamicConfig({
  uiConfig,
  updateUIConfig,
}: {
  uiConfig: UIConfig;
  updateUIConfig: PropertySetter<UIConfig>;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="minDate">Date minimum</Label>
        <Input
          id="minDate"
          type="date"
          value={uiConfig.minDate || ""}
          onChange={(e) => updateUIConfig("minDate", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="maxDate">Date maximum</Label>
        <Input
          id="maxDate"
          type="date"
          value={uiConfig.maxDate || ""}
          onChange={(e) => updateUIConfig("maxDate", e.target.value)}
        />
      </div>
    </div>
  );
}

function TextDynamicConfig({
  uiConfig,
  updateUIConfig,
}: {
  uiConfig: UIConfig;
  updateUIConfig: PropertySetter<UIConfig>;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="textPlaceholder">Placeholder</Label>
        <Input
          id="textPlaceholder"
          placeholder="Entrez votre réponse..."
          value={uiConfig.placeholder || ""}
          onChange={(e) => updateUIConfig("placeholder", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="regex">Expression régulière (validation)</Label>
        <Input
          id="regex"
          placeholder="^[A-Z][a-z]+$"
          value={uiConfig.regex || ""}
          onChange={(e) => updateUIConfig("regex", e.target.value)}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Optionnel : Pattern de validation pour le texte saisi
        </p>
      </div>
    </div>
  );
}
