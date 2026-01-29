"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Pagination from "@/components/pagination";
import ColumnSelector from "./column-selector";
import { availableColumns, defaultVariableColumnVisibility } from "../types/table-columns";
import { useTableColumnVisibility } from "@/hooks/use-table-column-visibility";
import React from "react";
import { PaginatedResponse } from "@/lib/api-types";
import { useSearchParams } from "next/navigation";
import { PageSizeSelector } from "@/components/page-size-selector";
import { SortableTableHead } from "@/components/sortable-table-head";
import VariableActionsDropdown from "./variable-actions-dropdown";

// Type pour une variable (à adapter selon votre modèle backend)
interface Variable {
  id: number;
  label: string;
  slug: string;
  data_type: string;
  is_quota: boolean;
  created_at?: string;
}

interface VariablesTableProps {
  paginatedVariables: PaginatedResponse<Variable>;
  query?: string;
}

export default function VariablesDataTable({
  paginatedVariables,
  query = ""
}: VariablesTableProps) {
  const { 
    columnVisibility, 
    updateColumnVisibility, 
    isLoaded 
  } = useTableColumnVisibility({
    storageKey: "variables-table-column-visibility",
    defaultVisibility: defaultVariableColumnVisibility,
  });
  
  const searchParams = useSearchParams();
  const { items: variables, meta: paginationMeta } = paginatedVariables;

  // Récupérer les paramètres de tri actuels depuis l'URL
  const currentSort = searchParams.get("sort_by") || 'id';
  const currentOrder = (searchParams.get("sort_order") as 'asc' | 'desc') || 'asc';

  // Filtrer les colonnes visibles
  const visibleColumns = availableColumns.filter(col => columnVisibility[col.key]);

  // Adapter la fonction pour le ColumnSelector
  const handleColumnVisibilityChange = (columnKey: string, visible: boolean) => {
    updateColumnVisibility({
      ...columnVisibility,
      [columnKey]: visible
    });
  };

  // Ne pas rendre le tableau tant que les préférences ne sont pas chargées
  if (!isLoaded) {
    return <div className="rounded-md border p-4">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Barre d'outils avec info pagination, sélecteur de taille et sélecteur de colonnes */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {paginationMeta.total_items} variable{paginationMeta.total_items > 1 ? 's' : ''} • 
            Page {paginationMeta.current_page} sur {paginationMeta.total_pages}
            {currentSort && (
              <span className="ml-2 text-xs">
                • Trié par {availableColumns.find(col => col.sortKey === currentSort)?.label} 
                ({currentOrder === 'asc' ? 'croissant' : 'décroissant'})
              </span>
            )}
          </div>
          <PageSizeSelector currentPageSize={paginationMeta.page_size} />
        </div>
        <ColumnSelector 
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={handleColumnVisibilityChange}
        />
      </div>

      {/* Tableau personnalisable */}
      <div className="rounded-md border">
        <Table>
          <TableCaption>
            <p className="m-4">Liste des variables de données configurées.</p>
          </TableCaption>

          {/* EN-TÊTE DYNAMIQUE AVEC TRI */}
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

          {/* CORPS DYNAMIQUE */}
          <TableBody>
            {variables.length > 0 ? (
              variables.map((variable: Variable) => (
                <TableRow
                  key={variable.id}
                  className="hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => (window.location.href = `/variables/${variable.id}`)}
                >
                  {visibleColumns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={column.key === 'actions' ? 'text-right' : ''}
                      onClick={column.key === 'actions' ? (e) => e.stopPropagation() : undefined}
                    >
                      {getCellValue(variable, column.key)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="h-24 text-center">
                  {query 
                    ? `Aucune variable trouvée pour "${query}".`
                    : "Aucune variable configurée."
                  }
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {/* Pagination en bas du tableau */}
        <div className="border-t">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm text-muted-foreground">
              Affichage de {((paginationMeta.current_page - 1) * paginationMeta.page_size) + 1} à{" "}
              {Math.min(paginationMeta.current_page * paginationMeta.page_size, paginationMeta.total_items)} sur{" "}
              {paginationMeta.total_items} variables
            </div>
            <Pagination totalPages={paginationMeta.total_pages} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Fonction pour obtenir la valeur d'une cellule selon la colonne
function getCellValue(variable: Variable, columnKey: string) {
  switch (columnKey) {
    case 'id':
      return <span className="font-medium">{variable.id}</span>;
    
    case 'label':
      return (
        <Link href={`/variables/${variable.id}`} className="hover:underline font-medium">
          {variable.label}
        </Link>
      );
    
    case 'slug':
      return (
        <span className="font-mono text-sm bg-muted/50 px-2 py-1 rounded">
          {variable.slug}
        </span>
      );
    
    case 'data_type':
      return (
        <Badge variant="outline" className={getDataTypeBadge(variable.data_type)}>
          {getDataTypeLabel(variable.data_type)}
        </Badge>
      );
    
    case 'is_quota':
      return (
        <Badge variant={variable.is_quota ? "default" : "secondary"}>
          {variable.is_quota ? "Oui" : "Non"}
        </Badge>
      );
    
    case 'created_at':
      return variable.created_at ? (
        <span className="text-sm text-muted-foreground">
          {new Date(variable.created_at).toLocaleDateString('fr-FR')}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      );
    
    case 'actions':
      return <VariableActionsDropdown variable={variable} />;
    
    default:
      return null;
  }
}

// Helper pour les labels des types de données
function getDataTypeLabel(dataType: string): string {
  const labels: Record<string, string> = {
    'number': 'Nombre',
    'list': 'Liste',
    'text': 'Texte',
    'date': 'Date',
    'boolean': 'Booléen',
  };
  return labels[dataType.toLowerCase()] || dataType;
}

// Helper pour les couleurs des badges de type de données
function getDataTypeBadge(dataType: string): string {
  const styles: Record<string, string> = {
    'number': "border-blue-500/20 text-blue-700 dark:text-blue-300 hover:border-blue-500/30",
    'list': "border-green-500/20 text-green-700 dark:text-green-300 hover:border-green-500/30",
    'text': "border-purple-500/20 text-purple-700 dark:text-purple-300 hover:border-purple-500/30",
    'date': "border-orange-500/20 text-orange-700 dark:text-orange-300 hover:border-orange-500/30",
    'boolean': "border-gray-500/20 text-gray-700 dark:text-gray-300 hover:border-gray-500/30",
  };
  return styles[dataType.toLowerCase()] || "border-gray-500/20 text-gray-700 dark:text-gray-300";
}