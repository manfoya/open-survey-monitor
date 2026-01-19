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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserProfile, UserRole } from "@/features/auth/types";
import { Edit, MoreVertical, Eye } from "lucide-react";
import Link from "next/link";
import Pagination from "@/components/pagination";
import DeleteUserForm from "@/features/users/components/delete-user-form";
import ColumnSelector from "@/features/users/components/column-selector";
import { availableColumns, defaultUserColumnVisibility } from "@/features/users/types/table-columns";
import { useTableColumnVisibility } from "@/hooks/use-table-column-visibility";
import React from "react";
import { useCurrentUser } from "@/features/auth/contexts/user-context";
import { PaginatedResponse } from "@/lib/api-types";
import { useSearchParams } from "next/navigation";
import { PageSizeSelector } from "@/components/page-size-selector";
import { SortableTableHead } from "@/components/sortable-table-head";


interface UserActionsDropdownProps {
  user: UserProfile;
  currentUser: UserProfile | null;
}

interface UsersTableProps {
  paginatedUsers: PaginatedResponse<UserProfile>;
  query?: string;
}

export default function UsersTable({
  paginatedUsers,
  query = ""
}: UsersTableProps) {
  const { 
    columnVisibility, 
    updateColumnVisibility, 
    isLoaded 
  } = useTableColumnVisibility({
    storageKey: "users-table-column-visibility",
    defaultVisibility: defaultUserColumnVisibility,
  });
  const currentUser = useCurrentUser();
  const searchParams = useSearchParams();
  const { items: users, meta: paginationMeta } = paginatedUsers;

  // Récupérer les paramètres de tri actuels depuis l'URL
  const currentSort = searchParams.get("sort_by") || 'id';
  const currentOrder = (searchParams.get("sort_order") as 'asc' | 'desc') || 'asc';

  // Filtrer les colonnes visibles
  const visibleColumns = availableColumns.filter(col => columnVisibility[col.key]);

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
            {paginationMeta.total_items} utilisateur{paginationMeta.total_items > 1 ? 's' : ''} • 
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
          onColumnVisibilityChange={updateColumnVisibility}
        />
      </div>

      {/* Tableau personnalisable */}
      <div className="rounded-md border">
        <Table>
          <TableCaption>
            <p className="m-4">Liste des membres de l&apos;équipe.</p>
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
            {users.length > 0 ? (
              users.map((user: UserProfile) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => (window.location.href = `/users/${user.id}`)}
                >
                  {visibleColumns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={column.key === 'actions' ? 'text-right' : ''}
                      onClick={column.key === 'actions' ? (e) => e.stopPropagation() : undefined}
                    >
                      {getCellValue(user, column.key, currentUser)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="h-24 text-center">
                  {query 
                    ? `Aucun utilisateur trouvé pour "${query}".`
                    : "Aucun utilisateur sous votre responsabilité."
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
              {paginationMeta.total_items} utilisateurs
            </div>
            <Pagination totalPages={paginationMeta.total_pages} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Fonction pour obtenir la valeur d'une cellule selon la colonne
function getCellValue (user: UserProfile, columnKey: string, currentUser: UserProfile | null = null) {
  switch (columnKey) {
    case 'id':
      return <span className="font-medium">{user.id}</span>;
    case 'username':
      return (
        <Link href={`/users/${user.id}`} className="hover:underline font-medium">
          {user.username}
        </Link>
      );
    case 'role':
      return (
        <Badge variant="outline" className={getRoleBadge(user.role)}>
          {user.role}
        </Badge>
      );
    case 'cspro_code':
      return (
        <span className="font-mono text-sm">
          {user.cspro_code || "N/A"}
        </span>
      );
    case 'chef_id':
      return (
        <span className="text-sm">
          {user.chef_id ? `#${user.chef_id}` : "Aucun"}
        </span>
      );
    case 'actions':
      return <UserActionsDropdown user={user} currentUser={currentUser} />;
    default:
      return null;
  }
}

function UserActionsDropdown({ user, currentUser }: UserActionsDropdownProps) {
  if (!currentUser) return null;
  
  // Logique de permission pour l'affichage du bouton supprimer
  const canDelete =
    currentUser.role === UserRole.DIRECTEUR && // Seul le directeur peut supprimer
    user.role !== UserRole.DIRECTEUR; // Ne peut pas supprimer un autre directeur

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Ouvrir le menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Action Détails */}
        <DropdownMenuItem asChild>
          <Link href={`/users/${user.id}`} className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            Détails
          </Link>
        </DropdownMenuItem>

        {/* Action Édition */}
        <DropdownMenuItem asChild>
          <Link href={`/users/${user.id}/edit`} className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </DropdownMenuItem>

        {/* Action Suppression - Conditionnelle avec composant réutilisable */}
        {canDelete && (
          <DropdownMenuItem asChild>
            <DeleteUserForm userId={user.id} className="w-full" />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Petit helper pour les couleurs (optionnel)
const getRoleBadge = (role: UserRole) => {
  const styles = {
    directeur:
      "border-purple-500/20 text-purple-700 dark:text-purple-300 hover:border-purple-500/30",
    superviseur:
      "border-blue-500/20 text-blue-700 dark:text-blue-300 hover:border-blue-500/30",
    controleur:
      "border-orange-500/20 text-orange-700 dark:text-orange-300 hover:border-orange-500/30",
    agent:
      "border-slate-500/20 text-slate-700 dark:text-slate-300 hover:border-slate-500/30",
  };
  return styles[role] || "border-gray-500/20 text-gray-700 dark:text-gray-300";
};
