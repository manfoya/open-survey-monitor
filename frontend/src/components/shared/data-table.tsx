"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/pagination";
import { PageSizeSelector } from "@/components/page-size-selector";
import { SortableTableHead } from "@/components/sortable-table-head";
import ColumnSelector from "@/components/shared/column-selector";
import { TableColumn, ColumnVisibility } from "@/types/table";
import { PaginatedResponse } from "@/lib/api-types";
import React from "react";

interface DataTableProps<T> {
  data: T[];
  paginationMeta: PaginatedResponse<T>["meta"];
  columns: TableColumn[];
  columnVisibility: ColumnVisibility;
  onColumnVisibilityChange: (visibility: ColumnVisibility) => void;
  renderRow: (item: T, visibleColumns: TableColumn[]) => React.ReactNode;
  currentSort?: string;
  currentOrder?: "asc" | "desc";
  entityLabel: string; // e.g. "utilisateur", "zone"
  pluralEntityLabel?: string; // e.g. "utilisateurs", "zones" (optional, defaults to entityLabel + 's')
  query?: string;
  caption?: string;
  isLoaded?: boolean;
}

export function DataTable<T extends { id: string | number }>({
  data,
  paginationMeta,
  columns,
  columnVisibility,
  onColumnVisibilityChange,
  renderRow,
  currentSort,
  currentOrder,
  entityLabel,
  pluralEntityLabel,
  query,
  caption,
  isLoaded = true,
}: DataTableProps<T>) {
  const pluralLabel = pluralEntityLabel || `${entityLabel}s`;
  const visibleColumns = columns.filter((col) => columnVisibility[col.key]);

  if (!isLoaded) {
    return <div className="rounded-md border p-4">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Barre d'outils */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {paginationMeta.total_items}{" "}
            {paginationMeta.total_items > 1 ? pluralLabel : entityLabel} • Page{" "}
            {paginationMeta.current_page} sur {paginationMeta.total_pages}
            {currentSort && (
              <span className="ml-2 text-xs">
                • Trié par{" "}
                {columns.find((col) => col.sortKey === currentSort)?.label}(
                {currentOrder === "asc" ? "croissant" : "décroissant"})
              </span>
            )}
          </div>
          <PageSizeSelector currentPageSize={paginationMeta.page_size} />
        </div>
        <ColumnSelector
          columns={columns}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={onColumnVisibilityChange}
        />
      </div>

      {/* Tableau */}
      <div className="rounded-md border">
        <Table>
          {caption && (
            <TableCaption>
              <p className="m-4">{caption}</p>
            </TableCaption>
          )}

          <TableHeader>
            <TableRow>
              {visibleColumns.map((column) => (
                <SortableTableHead
                  key={column.key}
                  column={column}
                  currentSort={currentSort}
                  currentOrder={currentOrder}
                />
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length > 0 ? (
              data.map((item) => renderRow(item, visibleColumns))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length}
                  className="h-24 text-center"
                >
                  {query
                    ? `Aucun ${entityLabel} trouvé pour "${query}".`
                    : `Aucun ${entityLabel} configuré.`}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="border-t">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm text-muted-foreground">
              Affichage de{" "}
              {(paginationMeta.current_page - 1) * paginationMeta.page_size + 1}{" "}
              à{" "}
              {Math.min(
                paginationMeta.current_page * paginationMeta.page_size,
                paginationMeta.total_items,
              )}{" "}
              sur {paginationMeta.total_items} {pluralLabel}
            </div>
            <Pagination totalPages={paginationMeta.total_pages} />
          </div>
        </div>
      </div>
    </div>
  );
}
