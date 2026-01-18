"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
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
import { Separator } from "@radix-ui/react-separator";
import DeleteUserForm from "@/features/users/components/delete-user-form";
import ColumnSelector from "@/features/users/components/column-selector";
import { availableColumns, defaultUserColumnVisibility } from "@/features/users/types/table-columns";
import { useTableColumnVisibility } from "@/hooks/use-table-column-visibility";

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

interface UsersTableProps {
  users: UserProfile[];
  query: string;
  page: number;
  per_page: number;
}

function filterUsers(users: UserProfile[], query: string) {
  if (!query) return users;
  const lowerQuery = query.toLowerCase().trim();
  return users.filter(
    (user) =>
      user.username.toLowerCase().includes(lowerQuery) ||
      user.cspro_code?.toLowerCase().includes(lowerQuery) ||
      user.role.toLowerCase().includes(lowerQuery) ||
      user.id.toString().includes(lowerQuery),
  );
}

function getRange(page: number, per_page: number) {
  const start = (page - 1) * per_page + 1;
  const end = page * per_page;
  return { start, end };
}

interface UserActionsDropdownProps {
  user: UserProfile;
  currentUser: UserProfile;
}

function UserActionsDropdown({ user, currentUser }: UserActionsDropdownProps) {
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

export default function UsersTable({
  users,
  query,
  page = 1,
  per_page = 5,
  currentUser,
}: UsersTableProps & {
  currentUser: UserProfile;
}) {
  const { 
    columnVisibility, 
    updateColumnVisibility, 
    isLoaded 
  } = useTableColumnVisibility({
    storageKey: "users-table-column-visibility",
    defaultVisibility: defaultUserColumnVisibility,
  });
  
  const filteredUsers = filterUsers(users, query);
  const { start, end } = getRange(page, per_page);
  const paginatedUsers = filteredUsers.slice(start - 1, end);
  const totalPages = Math.ceil(filteredUsers.length / per_page);

  // Filtrer les colonnes visibles
  const visibleColumns = availableColumns.filter(col => columnVisibility[col.key]);

  // Fonction pour obtenir la valeur d'une cellule selon la colonne
  const getCellValue = (user: UserProfile, columnKey: string) => {
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
  };

  // Ne pas rendre le tableau tant que les préférences ne sont pas chargées
  if (!isLoaded) {
    return <div className="rounded-md border p-4">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Barre d'outils avec sélecteur de colonnes */}
      <div className="flex justify-end">
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

          {/* EN-TÊTE DYNAMIQUE */}
          <TableHeader>
            <TableRow>
              {visibleColumns.map((column) => (
                <TableHead 
                  key={column.key} 
                  className={column.width || ""}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          {/* CORPS DYNAMIQUE */}
          <TableBody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user: UserProfile) => (
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
                      {getCellValue(user, column.key)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="h-24 text-center">
                  {query
                    ? `Aucun utilisateur trouvé pour "${query}".`
                    : "Aucun utilisateur sous votre responsabilité."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Separator className="my-2" />
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
