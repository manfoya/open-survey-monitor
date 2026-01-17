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

// Petit helper pour les couleurs (optionnel)
const getRoleBadge = (role: UserRole) => {
  const styles = {
    directeur: "border-purple-500/20 text-purple-700 dark:text-purple-300 hover:border-purple-500/30",
    superviseur: "border-blue-500/20 text-blue-700 dark:text-blue-300 hover:border-blue-500/30",
    controleur: "border-orange-500/20 text-orange-700 dark:text-orange-300 hover:border-orange-500/30",
    agent: "border-slate-500/20 text-slate-700 dark:text-slate-300 hover:border-slate-500/30",
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
      user.id.toString().includes(lowerQuery)
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
            <DeleteUserForm 
              userId={user.id} 
              userName={user.username}
              className="w-full"
            />
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
  currentUser
}: UsersTableProps & { 
  currentUser: UserProfile;
}) {
  const filteredUsers = filterUsers(users, query);
  const { start, end } = getRange(page, per_page);
  const paginatedUsers = filteredUsers.slice(start - 1, end);
  const totalPages = Math.ceil(filteredUsers.length / per_page);

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption><p className="m-4">Liste des membres de l&apos;équipe.</p></TableCaption>
        
        {/* EN-TÊTE DU TABLEAU */}
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Code CSPro</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        {/* CORPS DU TABLEAU */}
        <TableBody>
          {paginatedUsers.length > 0 ? (
            paginatedUsers.map((user: UserProfile) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <Badge className={getRoleBadge(user.role)} variant="outline">
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {user.cspro_code}
                </TableCell>
                <TableCell className="text-right">
                  <UserActionsDropdown 
                    user={user} 
                    currentUser={currentUser}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Aucun utilisateur trouvé.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Separator className="my-2" />
      <Pagination totalPages={totalPages} />
    </div>
  );
}
