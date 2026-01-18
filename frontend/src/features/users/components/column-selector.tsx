"use client";

import { useState } from "react";
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
import { availableColumns, ColumnVisibility } from "@/features/users/types/table-columns";

interface ColumnSelectorProps {
  columnVisibility: ColumnVisibility;
  onColumnVisibilityChange: (columnVisibility: ColumnVisibility) => void;
}

export default function ColumnSelector({ 
  columnVisibility, 
  onColumnVisibilityChange 
}: ColumnSelectorProps) {
  const [open, setOpen] = useState(false);

  const handleColumnToggle = (columnKey: string, visible: boolean) => {
    onColumnVisibilityChange({
      ...columnVisibility,
      [columnKey]: visible,
    });
  };

  const visibleCount = Object.values(columnVisibility).filter(Boolean).length;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="mr-2 h-4 w-4" />
          Colonnes ({visibleCount})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Affichage des colonnes</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {availableColumns.map((column) => (
          <DropdownMenuItem
            key={column.key}
            className="flex items-center space-x-2 cursor-pointer"
            onSelect={(e) => e.preventDefault()}
          >
            <Checkbox
              id={column.key}
              checked={columnVisibility[column.key] || false}
              onCheckedChange={(checked) => 
                handleColumnToggle(column.key, checked as boolean)
              }
              disabled={column.required}
            />
            <label 
              htmlFor={column.key}
              className={`text-sm cursor-pointer flex-1 ${
                column.required ? 'text-muted-foreground' : ''
              }`}
            >
              {column.label}
              {column.required && ' *'}
            </label>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <div className="px-2 py-1 text-xs text-muted-foreground">
          * Colonnes obligatoires
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}