"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DATA_TYPES,
  DataType,
  VariableDataType,
} from "@/features/variables/types";
import {
  Calendar,
  Edit,
  Filter,
  Hash,
  List,
  Type,
} from "lucide-react";
import Link from "next/link";
import DeleteVariableForm from "@/features/variables/components/delete-variable-form";

interface VariableHeaderProps {
  variable: VariableDataType;
  canEdit: boolean;
}

export default function VariableHeader({
  variable,
  canEdit,
}: VariableHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              {getIconForType(variable.data_type)}
              {variable.label}
            </CardTitle>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="secondary" className="font-mono">
                {variable.slug}
              </Badge>
              <div className="h-4 w-px bg-border" />
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                Type:{" "}
                <span className="font-medium text-foreground">
                  {DATA_TYPES.find((t) => t.value === variable.data_type)
                    ?.label || variable.data_type}
                </span>
              </span>
              {variable.is_quota && (
                <Badge
                  variant="outline"
                  className="border-blue-200 bg-blue-50 text-blue-700"
                >
                  Utilisé pour quota
                </Badge>
              )}
            </div>
          </div>

          {canEdit && (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/variables/${variable.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Link>
              </Button>
              <DeleteVariableForm
                variableId={variable.id}
                redirectOnSuccess={true}
                buttonClassName="flex items-center text-destructive bg-destructive/10 hover:bg-destructive/20 px-3 py-1.5 rounded-md text-sm font-medium transition-colors h-9"
                buttonText="Supprimer"
              />
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}

function getIconForType(type: DataType) {
  switch (type) {
    case DataType.NUMBER:
      return <Hash className="h-6 w-6 text-muted-foreground" />;
    case DataType.LIST:
      return <List className="h-6 w-6 text-muted-foreground" />;
    case DataType.DATE:
      return <Calendar className="h-6 w-6 text-muted-foreground" />;
    case DataType.TEXT:
      return <Type className="h-6 w-6 text-muted-foreground" />;
    default:
      return <Filter className="h-6 w-6 text-muted-foreground" />;
  }
}
