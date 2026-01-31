"use client";

import { TableCell, TableRow } from "@/components/ui/table";
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
import DeleteUserForm from "@/features/users/components/delete-user-form";
import {
  availableColumns,
  defaultUserColumnVisibility,
} from "@/features/users/types/table-columns";
import { useTableColumnVisibility } from "@/hooks/use-table-column-visibility";
import React from "react";
import { useCurrentUser } from "@/features/auth/contexts/user-context";
import { PaginatedResponse } from "@/lib/api-types";
import { useSearchParams } from "next/navigation";
import { DataTable } from "@/components/shared/data-table";

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
  query = "",
}: UsersTableProps) {
  const { columnVisibility, updateColumnVisibility, isLoaded } =
    useTableColumnVisibility({
      storageKey: "users-table-column-visibility",
      defaultVisibility: defaultUserColumnVisibility,
    });
  const currentUser = useCurrentUser();
  const searchParams = useSearchParams();
  const { items: users, meta: paginationMeta } = paginatedUsers;

  // Récupérer les paramètres de tri actuels depuis l'URL
  const currentSort = searchParams.get("sort_by") || "id";
  const currentOrder =
    (searchParams.get("sort_order") as "asc" | "desc") || "asc";

  return (
    <DataTable
      data={users}
      paginationMeta={paginationMeta}
      columns={availableColumns}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={updateColumnVisibility}
      currentSort={currentSort}
      currentOrder={currentOrder}
      entityLabel="utilisateur"
      query={query}
      isLoaded={isLoaded}
      caption="Liste des membres de l'équipe."
      renderRow={(user, visibleColumns) => (
        <TableRow
          key={user.id}
          className="hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => (window.location.href = `/users/${user.id}`)}
        >
          {visibleColumns.map((column) => (
            <TableCell
              key={column.key}
              className={column.key === "actions" ? "text-right" : ""}
              onClick={
                column.key === "actions"
                  ? (e) => e.stopPropagation()
                  : undefined
              }
            >
              {getCellValue(user, column.key, currentUser)}
            </TableCell>
          ))}
        </TableRow>
      )}
    />
  );
}

// Fonction pour obtenir la valeur d'une cellule selon la colonne
function getCellValue(
  user: UserProfile,
  columnKey: string,
  currentUser: UserProfile | null = null,
) {
  switch (columnKey) {
    case "id":
      return <span className="font-medium">{user.id}</span>;
    case "username":
      return (
        <Link
          href={`/users/${user.id}`}
          className="hover:underline font-medium"
        >
          {user.username}
        </Link>
      );
    case "role":
      return (
        <Badge variant="outline" className={getRoleBadge(user.role)}>
          {user.role}
        </Badge>
      );
    case "cspro_code":
      return (
        <span className="font-mono text-sm">{user.cspro_code || "N/A"}</span>
      );
    case "chef":
      return (
        <span className="text-sm">
          {user.chef?.username ? `${user.chef?.username}` : "Aucun"}
        </span>
      );
    case "actions":
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
