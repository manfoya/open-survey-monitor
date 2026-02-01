"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Affectation } from "../types";
import { ClientRoleGuard } from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import DeleteAffectationForm from "./delete-affectation-form";
import { useCurrentUser } from "@/features/auth/contexts/user-context";

interface AffectationActionsDropdownProps {
  affectation: Affectation;
}

export default function AffectationActionsDropdown({
  affectation,
}: AffectationActionsDropdownProps) {
    const user = useCurrentUser();
  return (
    <ClientRoleGuard allowedRoles={[UserRole.DIRECTEUR]} user={user}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Ouvrir le menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/affectations-zones/${affectation.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
             <DeleteAffectationForm affectationId={affectation.id} className="w-full" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ClientRoleGuard>
  );
}
