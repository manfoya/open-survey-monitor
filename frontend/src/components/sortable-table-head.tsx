"use client";

import { Button } from "@/components/ui/button";
import { TableHead } from "@/components/ui/table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

import { TableColumn } from "@/types/table";

interface SortableTableHeadProps {
  column: TableColumn;
  currentSort?: string;
  currentOrder?: 'asc' | 'desc';
}

export function SortableTableHead({ column, currentSort, currentOrder }: SortableTableHeadProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSort = () => {
    if (!column.sortable || !column.sortKey) return;

    const params = new URLSearchParams(searchParams);
    
    // Déterminer le nouvel ordre de tri
    let newOrder: 'asc' | 'desc' = 'asc';
    if (currentSort === column.sortKey) {
      // Si on clique sur la même colonne, inverser l'ordre
      newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    }

    params.set("sort_by", column.sortKey);
    params.set("sort_order", newOrder);
    params.set("page", "1"); // Retourner à la première page lors du tri

    router.push(`?${params.toString()}`);
  };

  const isCurrentSort = currentSort === column.sortKey;
  const isAscending = isCurrentSort && currentOrder === 'asc';
  const isDescending = isCurrentSort && currentOrder === 'desc';

  if (!column.sortable) {
    return (
      <TableHead className={column.className || ""}>
        {column.label}
      </TableHead>
    );
  }

  return (
    <TableHead className={column.className || ""}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 p-2 -ml-2 hover:bg-muted/50 font-medium",
          isCurrentSort && "bg-muted/30",
          "cursor-pointer"
        )}
        onClick={handleSort}
      >
        <span className="mr-2">{column.label}</span>
        {isAscending && <ArrowUp className="h-4 w-4" />}
        {isDescending && <ArrowDown className="h-4 w-4" />}
        {!isCurrentSort && <ArrowUpDown className="h-4 w-4 text-muted-foreground" />}
      </Button>
    </TableHead>
  );
}