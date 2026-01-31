"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreVertical, Eye } from "lucide-react";
import Link from "next/link";
import {
  ClientRoleGuard,
  useRoleGuard,
} from "@/features/auth/components/role-guard";
import { UserRole } from "@/features/auth/types";
import DeleteQuotaForm from "./delete-quota-form";
import { Quota } from "../types";

interface QuotaActionsDropdownProps {
  quota: Quota;
}

export default function QuotaActionsDropdown({
  quota,
}: QuotaActionsDropdownProps) {
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
          <Link href={`/quotas/${quota.id}`} className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            Détails
          </Link>
        </DropdownMenuItem>

        {/* Action Editer - Protégée */}
        <ClientRoleGuard allowedRoles={[UserRole.DIRECTEUR]} user={user}>
          <DropdownMenuItem asChild>
            <Link href={`/quotas/${quota.id}/edit`} className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </DropdownMenuItem>
        </ClientRoleGuard>

        {/* Action Suppression - Protégée */}
        <ClientRoleGuard allowedRoles={[UserRole.DIRECTEUR]} user={user}>
          <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
            <DeleteQuotaForm quotaId={quota.id} className="w-full" />
          </DropdownMenuItem>
        </ClientRoleGuard>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
