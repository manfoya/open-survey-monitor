"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import { useMemo } from "react";
import { DataType, Modalite } from "../../types";

export default function ValidationIndicator({
  label,
  slug,
  dataType,
  modalites,
}: {
  label: string;
  slug: string;
  dataType: DataType;
  modalites: Modalite[];
}) {
  const isValid = useMemo(() => {
    if (!label.trim()) return false;
    if (!slug.trim()) return false;
    if (dataType === DataType.LIST && modalites.length === 0) return false;
    return true;
  }, [label, slug, dataType, modalites]);

  if (isValid) return null;

  const issues = [];
  if (!label.trim()) issues.push("Le libellé est requis");
  if (!slug.trim()) issues.push("L'identifiant technique est requis");
  if (dataType === DataType.LIST && modalites.length === 0) {
    issues.push("Au moins une modalité est requise pour une liste de choix");
  }

  return (
    <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <Info className="h-4 w-4" />
          Configuration incomplète
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
          {issues.map((issue, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-xs mt-1">•</span>
              <span>{issue}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
