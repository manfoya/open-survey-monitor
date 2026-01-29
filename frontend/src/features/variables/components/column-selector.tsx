"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings2 } from "lucide-react";
import { availableColumns } from "../types/table-columns";
import type { ColumnVisibility } from "../types/table-columns";

interface ColumnSelectorProps {
  columnVisibility: ColumnVisibility;
  onColumnVisibilityChange: (columnKey: string, visible: boolean) => void;
}

export default function ColumnSelector({
  columnVisibility,
  onColumnVisibilityChange,
}: ColumnSelectorProps) {
  const handleColumnToggle = (columnKey: string, checked: boolean) => {
    onColumnVisibilityChange(columnKey, checked);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4 mr-2" />
          Colonnes
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Affichage des colonnes</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableColumns.map((column) => (
          <DropdownMenuItem
            key={column.key}
            className="flex items-center space-x-2 cursor-pointer"
            onClick={(e) => e.preventDefault()}
          >
            <Checkbox
              id={`column-${column.key}`}
              checked={columnVisibility[column.key] || false}
              onCheckedChange={(checked) =>
                handleColumnToggle(column.key, checked as boolean)
              }
              disabled={column.required}
            />
            <label
              htmlFor={`column-${column.key}`}
              className={`flex-1 text-sm cursor-pointer ${
                column.required ? "text-muted-foreground" : ""
              }`}
            >
              {column.label}
              {column.required && (
                <span className="text-xs ml-1">(requis)</span>
              )}
            </label>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}