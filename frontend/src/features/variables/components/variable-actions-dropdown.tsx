"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreVertical, Eye, Trash2, Settings } from "lucide-react";
import Link from "next/link";
import { ClientRoleGuard, useRoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import DeleteVariableForm from "./delete-variable-form";

import { VariableDataType } from "../types";

interface VariableActionsDropdownProps {
  variable: VariableDataType;
}

export default function VariableActionsDropdown({ variable }: VariableActionsDropdownProps) {
    const { currentUser: user } = useRoleGuard();
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
          <Link href={`/variables/${variable.id}`} className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            Détails
          </Link>
        </DropdownMenuItem>

        {/* Action Configuration - Protégée pour directeurs seulement */}
        <ClientRoleGuard allowedRoles={[UserRole.DIRECTEUR]} user={user} >
          <DropdownMenuItem asChild>
            <Link href={`/variables/${variable.id}/`} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Configurer
            </Link>
          </DropdownMenuItem>
        </ClientRoleGuard>

        {/* Action Suppression - Protégée pour directeurs seulement */}
        <ClientRoleGuard allowedRoles={[UserRole.DIRECTEUR]} user={user} >
            <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
             <DeleteVariableForm 
                variableId={variable.id} 
                className="w-full" 
             />
            </DropdownMenuItem>
        </ClientRoleGuard>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}